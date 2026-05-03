const DEFAULT_STATE = {
  credits: 10,
  plan: 'free',
  hasPaid: false,
  planExpiresAt: null,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { supabaseAdmin, getUserFromAuthHeader } = await import('./_supabase-admin.js');
  const { user } = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = user.id;

  // Ensure row exists
  const { data: existing, error: selErr } = await supabaseAdmin
    .from('entitlements')
    .select('credits, plan, has_paid, plan_expires_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (selErr) return res.status(500).json({ error: selErr.message });

  if (!existing) {
    const { error: insErr } = await supabaseAdmin.from('entitlements').insert({
      user_id: userId,
      credits: DEFAULT_STATE.credits,
      plan: DEFAULT_STATE.plan,
      has_paid: DEFAULT_STATE.hasPaid,
      plan_expires_at: null,
    });
    if (insErr) return res.status(500).json({ error: insErr.message });
  }

  const plan = existing?.plan || DEFAULT_STATE.plan;
  if (plan === 'pro') {
    return res.status(200).json({
      credits: Number(existing?.credits ?? DEFAULT_STATE.credits),
      plan: 'pro',
      hasPaid: Boolean(existing?.has_paid),
      planExpiresAt: existing?.plan_expires_at ? new Date(existing.plan_expires_at).getTime() : null,
    });
  }
  if (plan === 'premium') {
    return res.status(200).json({
      credits: 999999,
      plan: 'premium',
      hasPaid: Boolean(existing?.has_paid),
      planExpiresAt: existing?.plan_expires_at ? new Date(existing.plan_expires_at).getTime() : null,
    });
  }

  // Atomic-ish update (single SQL statement)
  const { data: updated, error: upErr } = await supabaseAdmin
    .from('entitlements')
    .update({ credits: Math.max(0, Number(existing?.credits ?? DEFAULT_STATE.credits) - 1) })
    .eq('user_id', userId)
    .gt('credits', 0)
    .select('credits, plan, has_paid, plan_expires_at')
    .maybeSingle();

  if (upErr) return res.status(500).json({ error: upErr.message });
  if (!updated) return res.status(402).json({ error: 'Out of credits' });

  return res.status(200).json({
    credits: updated.credits ?? 0,
    plan: updated.plan || 'free',
    hasPaid: Boolean(updated.has_paid),
    planExpiresAt: updated.plan_expires_at ? new Date(updated.plan_expires_at).getTime() : null,
  });
}

