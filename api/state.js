import { ensureStateTable, getSql } from './_db.js';

const STATE_ID = 'default';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    await ensureStateTable();

    if (req.method === 'GET') {
      await handleGet(res);
      return;
    }

    if (req.method === 'PUT') {
      await handlePut(req, res);
      return;
    }

    res.setHeader('Allow', 'GET, PUT, OPTIONS');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      ok: false,
      error: error.statusCode === 503 ? error.message : 'Database request failed.',
    });
  }
}

async function handleGet(res) {
  const sql = getSql();
  const rows = await sql`
    SELECT data, updated_at
    FROM invitation_state
    WHERE id = ${STATE_ID}
    LIMIT 1
  `;

  if (rows.length === 0) {
    res.status(404).json({ ok: false, data: null, error: 'State has not been initialized.' });
    return;
  }

  res.status(200).json({ ok: true, data: rows[0].data, updatedAt: rows[0].updated_at });
}

async function handlePut(req, res) {
  const body = await readJsonBody(req);
  const data = body?.data;

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    res.status(400).json({ ok: false, error: 'Request body must include a data object.' });
    return;
  }

  const sql = getSql();
  const rows = await sql`
    INSERT INTO invitation_state (id, data, updated_at)
    VALUES (${STATE_ID}, ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (id)
    DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    RETURNING updated_at
  `;

  res.status(200).json({ ok: true, updatedAt: rows[0].updated_at });
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}
