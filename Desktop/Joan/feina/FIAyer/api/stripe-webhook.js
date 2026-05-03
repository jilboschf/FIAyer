import Stripe from 'stripe';
import getRawBody from 'raw-body';
import { supabaseAdmin } from './_supabase-admin.js';

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

/** Credits delta applied on initial purchase for each plan. */
function addCreditsForPlan(planId) {
  if (planId === 'pack') return { creditsDelta: 1, plan: 'pack' };
  if (planId === 'pro') return { creditsDelta: 100, plan: 'pro' };
  if (planId === 'premium') return { creditsDelta: 0, plan: 'premium' };
  return { creditsDelta: 0, plan: null };
}

/** Credits refilled on each monthly renewal. */
function refillCreditsForPlan(planId, currentCredits) {
  if (planId === 'pro') return Math.max(currentCredits, 100);
  if (planId === 'premium') return 999999;
  return currentCredits;
}

/**
 * Resolve the Supabase user + planId for a Stripe subscription event.
 * Prefers subscription.metadata (set at checkout time), falls back to
 * looking up the entitlement row by stripe_subscription_id.
 */
async function resolveUserForSubscription(subscription) {
  const metaUserId = subscription?.metadata?.userId || null;
  const metaPlanId = subscription?.metadata?.planId || null;
  if (metaUserId) return { userId: metaUserId, planId: metaPlanId };

  const { data } = await supabaseAdmin
    .from('entitlements')
    .select('user_id, plan')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();

  if (!data) return { userId: null, planId: null };
  return { userId: data.user_id, planId: data.plan };
}

async function handleCheckoutCompleted(session) {
  const userId = session?.metadata?.userId;
  const planId = session?.metadata?.planId;
  if (!userId || !planId) return;

  const { creditsDelta, plan } = addCreditsForPlan(planId);

  const { data: existing, error: selErr } = await supabaseAdmin
    .from('entitlements')
    .select('credits, plan, has_paid, plan_expires_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (selErr) throw new Error(`DB select failed: ${selErr.message}`);

  const currentCredits = Number(existing?.credits ?? 10);
  const next = {
    user_id: userId,
    has_paid: true,
    plan: existing?.plan || 'free',
    credits: currentCredits,
    plan_expires_at: existing?.plan_expires_at || null,
    stripe_customer_id: session.customer || null,
    stripe_subscription_id: session.subscription || null,
    payment_failed_at: null,
  };

  if (plan === 'premium') {
    next.plan = 'premium';
    next.credits = 999999;
  } else if (plan === 'pack') {
    next.plan = 'pack';
    next.credits = Math.max(0, currentCredits + creditsDelta);
  } else if (plan === 'pro') {
    next.plan = 'pro';
    next.credits = Math.max(currentCredits, 100);
  } else {
    next.credits = Math.max(0, currentCredits + creditsDelta);
  }

  if (session.mode === 'subscription' && session.subscription) {
    const sub = await stripe.subscriptions.retrieve(session.subscription);
    next.plan_expires_at = new Date(Number(sub.current_period_end) * 1000).toISOString();
  }

  const { error: upErr } = await supabaseAdmin.from('entitlements').upsert(next);
  if (upErr) throw new Error(`DB upsert failed: ${upErr.message}`);
}

async function handleSubscriptionUpdated(subscription) {
  const { userId, planId } = await resolveUserForSubscription(subscription);
  if (!userId) return; // Unknown subscription; ignore gracefully.

  const { data: existing, error: selErr } = await supabaseAdmin
    .from('entitlements')
    .select('credits, plan, plan_expires_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (selErr) throw new Error(`DB select failed: ${selErr.message}`);

  const newPeriodEndMs = Number(subscription.current_period_end) * 1000;
  const storedEndMs = existing?.plan_expires_at ? Date.parse(existing.plan_expires_at) : 0;

  // A renewal is a period-end that moves forward.
  const isRenewal = newPeriodEndMs > storedEndMs;

  // If Stripe marked the subscription inactive, keep current credits but
  // clear has_paid so the UI knows something is off. Full downgrade is
  // handled in customer.subscription.deleted.
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

  const currentCredits = Number(existing?.credits ?? 10);
  const effectivePlan = planId || existing?.plan || 'free';
  const nextCredits = isRenewal ? refillCreditsForPlan(effectivePlan, currentCredits) : currentCredits;

  const next = {
    user_id: userId,
    plan: effectivePlan,
    credits: nextCredits,
    has_paid: isActive,
    plan_expires_at: new Date(newPeriodEndMs).toISOString(),
    stripe_customer_id: subscription.customer || null,
    stripe_subscription_id: subscription.id,
    // A successful renewal clears any prior failure flag.
    ...(isRenewal ? { payment_failed_at: null } : {}),
  };

  const { error: upErr } = await supabaseAdmin.from('entitlements').upsert(next);
  if (upErr) throw new Error(`DB upsert failed: ${upErr.message}`);
}

async function handleSubscriptionDeleted(subscription) {
  const { userId } = await resolveUserForSubscription(subscription);
  if (!userId) return;

  const { data: existing, error: selErr } = await supabaseAdmin
    .from('entitlements')
    .select('credits, plan')
    .eq('user_id', userId)
    .maybeSingle();
  if (selErr) throw new Error(`DB select failed: ${selErr.message}`);

  const wasPremium = existing?.plan === 'premium';
  const currentCredits = Number(existing?.credits ?? 0);

  // Premium users had "unlimited" (999999) which isn't a real balance they
  // own — cap it to the free tier. For pro, keep whatever they still have.
  const nextCredits = wasPremium ? 10 : currentCredits;

  const next = {
    user_id: userId,
    plan: 'free',
    credits: nextCredits,
    has_paid: false,
    plan_expires_at: null,
    stripe_subscription_id: null,
  };

  const { error: upErr } = await supabaseAdmin.from('entitlements').upsert(next);
  if (upErr) throw new Error(`DB upsert failed: ${upErr.message}`);
}

async function handleInvoicePaymentFailed(invoice) {
  const subscriptionId = invoice?.subscription;
  if (!subscriptionId) return; // One-off invoices are ignored.

  // Try the embedded subscription metadata first; otherwise look up.
  let userId = null;
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const resolved = await resolveUserForSubscription(sub);
    userId = resolved.userId;
  } catch {
    // Fall back to looking up by subscription id directly.
    const { data } = await supabaseAdmin
      .from('entitlements')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .maybeSingle();
    userId = data?.user_id || null;
  }
  if (!userId) return;

  // Flag the failure but don't downgrade — Stripe will retry, and if it
  // ultimately gives up it'll fire customer.subscription.deleted.
  const { error: upErr } = await supabaseAdmin
    .from('entitlements')
    .update({ payment_failed_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (upErr) throw new Error(`DB update failed: ${upErr.message}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).send('Missing Stripe signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return res.status(500).send('Missing STRIPE_WEBHOOK_SECRET');

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        // Unhandled event types are acknowledged so Stripe doesn't retry them.
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[stripe-webhook]', event.type, err);
    return res.status(500).send(`Server Error: ${err.message}`);
  }
}
