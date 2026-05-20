import { getBearerToken, signAdminToken, validateAdminCredentials, verifyAdminToken } from './_auth.js';
import { readJsonBody } from './_state.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      const username = String(body?.username || '');
      const password = String(body?.password || '');

      if (!validateAdminCredentials(username, password)) {
        res.status(401).json({ ok: false, error: 'ID atau password admin salah.' });
        return;
      }

      res.status(200).json({
        ok: true,
        user: { username, role: 'admin' },
        token: signAdminToken(username),
      });
      return;
    }

    if (req.method === 'GET') {
      const claims = verifyAdminToken(getBearerToken(req));
      if (!claims) {
        res.status(401).json({ ok: false, error: 'Session admin tidak valid.' });
        return;
      }

      res.status(200).json({ ok: true, user: { username: claims.sub, role: claims.role } });
      return;
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch {
    res.status(500).json({ ok: false, error: 'Admin auth request failed.' });
  }
}
