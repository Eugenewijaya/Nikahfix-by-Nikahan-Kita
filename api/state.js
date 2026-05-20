import { requireAdmin } from './_auth.js';
import { defaultState, readJsonBody, readState, writeState } from './_state.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      await handleGet(res);
      return;
    }

    if (req.method === 'PUT') {
      if (!requireAdmin(req, res)) return;
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
  const row = await readState();

  if (!row) {
    res.status(200).json({ ok: true, data: defaultState(), initialized: false, updatedAt: null });
    return;
  }

  res.status(200).json({ ok: true, data: row.data, initialized: true, updatedAt: row.updated_at });
}

async function handlePut(req, res) {
  const body = await readJsonBody(req);
  const data = body?.data;

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    res.status(400).json({ ok: false, error: 'Request body must include a data object.' });
    return;
  }

  const updatedAt = await writeState(data);
  res.status(200).json({ ok: true, updatedAt });
}
