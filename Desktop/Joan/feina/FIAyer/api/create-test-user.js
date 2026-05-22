import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = req.headers['x-setup-secret'];
  if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-8)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const email = 'test@todoflyer.es';
  const password = 'Test1234!!';

  // Delete existing if present
  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing?.users?.find(u => u.email === email);
  if (found) await admin.auth.admin.deleteUser(found.id);

  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true, email, password, id: data.user.id });
}
