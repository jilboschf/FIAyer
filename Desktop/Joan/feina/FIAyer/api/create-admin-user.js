import { supabaseAdmin } from './_supabase-admin.js';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@todoflyer.test';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin1234';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'admin', createdBy: 'auto-test' },
    });

    if (error) {
      const message = error.message || '';
      if (message.toLowerCase().includes('already exists') || message.toLowerCase().includes('duplicate')) {
        return res.status(200).json({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, created: false });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, created: true });
  } catch (err) {
    const message = err?.message || 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
