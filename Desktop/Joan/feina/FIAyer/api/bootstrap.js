import crypto from 'crypto';

function parseCookies(cookieHeader) {
  const out = {};
  const raw = cookieHeader || '';
  raw.split(';').forEach(part => {
    const [k, ...rest] = part.trim().split('=');
    if (!k) return;
    out[k] = decodeURIComponent(rest.join('=') || '');
  });
  return out;
}

function serializeCookie(name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.httpOnly) parts.push('HttpOnly');
  if (opts.secure) parts.push('Secure');
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  return parts.join('; ');
}

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  let uid = cookies.fiayer_uid;

  if (!uid) {
    uid = crypto.randomUUID();
    res.setHeader(
      'Set-Cookie',
      serializeCookie('fiayer_uid', uid, {
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365,
      })
    );
  }

  res.status(200).json({ uid });
}

