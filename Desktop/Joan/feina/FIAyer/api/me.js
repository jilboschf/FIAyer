const DEFAULT_STATE = {
  credits: 10,
  plan: 'free',
  hasPaid: false,
  planExpiresAt: null,
};

export default async function handler(req, res) {
  const { supabaseAdmin, getUserFromAuthHeader } = await import('./_supabase-admin.js');

  const { user } = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const userId = user.id;

  const { data: existing, error: selErr } = await supabaseAdmin
    .from('entitlements')
    .select('credits, plan, has_paid, plan_expires_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (selErr) return res.status(500).json({ error: selErr.message });

  const state = existing
    ? {
        credits: existing.credits ?? 0,
        plan: existing.plan || 'free',
        hasPaid: Boolean(existing.has_paid),
        planExpiresAt: existing.plan_expires_at ? new Date(existing.plan_expires_at).getTime() : null,
      }
    : DEFAULT_STATE;

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

  // If subscription expired, downgrade.
  if (state.planExpiresAt && Date.now() > Number(state.planExpiresAt)) {
    const downgraded = { ...state, plan: 'free', planExpiresAt: null };
    const { error: upErr } = await supabaseAdmin
      .from('entitlements')
      .update({ plan: 'free', plan_expires_at: null })
      .eq('user_id', userId);
    if (upErr) return res.status(500).json({ error: upErr.message });
    return res.status(200).json(downgraded);
  }

  return res.status(200).json(state);
}

