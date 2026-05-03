import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { planId } = req.body || {};
  const { getUserFromAuthHeader } = await import('./_supabase-admin.js');
  const { user } = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!planId) return res.status(400).json({ error: 'Missing planId' });

  const planMap = {
    pack:    { mode: 'payment',      name: "Export únic (PNG o PDF)", priceId: process.env.STRIPE_PRICE_PACK,    fallbackAmount: 500,  credits: 1 },
    pro:     { mode: 'subscription', name: "Pla Pro (100 Crèdits/mes)", priceId: process.env.STRIPE_PRICE_PRO,     fallbackAmount: 1499, credits: 100 },
    premium: { mode: 'subscription', name: "Pla Premium (Disseny Pro)",  priceId: process.env.STRIPE_PRICE_PREMIUM, fallbackAmount: 3500, credits: 999999 }
  };
  const plan = planMap[planId];
  if (!plan) return res.status(400).json({ error: 'Invalid planId' });

  const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0].trim();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString().split(',')[0].trim();
  const origin = `${proto}://${host}`;

  try {
    const lineItem = plan.priceId
      ? { price: plan.priceId, quantity: 1 }
      : {
          price_data: {
            currency: 'eur',
            product_data: { name: plan.name },
            unit_amount: plan.fallbackAmount,
            ...(plan.mode === 'subscription' ? { recurring: { interval: 'month' } } : {}),
          },
          quantity: 1,
        };

    const checkoutParams = {
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: plan.mode,
      success_url: `${origin}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?checkout=cancel`,
      metadata: {
        userId: user.id,
        planId,
      },
    };

    // For subscriptions, also copy metadata onto the subscription itself so
    // future webhook events (customer.subscription.updated / deleted, invoice.*)
    // can resolve the Supabase user without extra lookups.
    if (plan.mode === 'subscription') {
      checkoutParams.subscription_data = {
        metadata: {
          userId: user.id,
          planId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(checkoutParams);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}