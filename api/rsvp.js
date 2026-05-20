import { defaultState, readJsonBody, readState, writeState } from './_state.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      await handleUpsert(req, res);
      return;
    }

    if (req.method === 'DELETE') {
      await handleDelete(req, res);
      return;
    }

    res.setHeader('Allow', 'POST, DELETE, OPTIONS');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      ok: false,
      error: error.statusCode === 503 ? error.message : 'RSVP request failed.',
    });
  }
}

async function handleUpsert(req, res) {
  const body = await readJsonBody(req);
  const rsvp = sanitizeRsvp(body?.rsvp);

  if (!rsvp) {
    res.status(400).json({ ok: false, error: 'Request body must include a valid RSVP.' });
    return;
  }

  const row = await readState();
  const state = row?.data || defaultState();
  const existing = Array.isArray(state.rsvps) ? state.rsvps : [];
  const nextRsvps = existing.some((item) => item.guestSlug === rsvp.guestSlug)
    ? existing.map((item) => (item.guestSlug === rsvp.guestSlug ? { ...item, ...rsvp } : item))
    : [{ id: `rsvp-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), ...rsvp }, ...existing];

  const updatedAt = await writeState({ ...state, rsvps: nextRsvps });
  res.status(200).json({ ok: true, data: { ...state, rsvps: nextRsvps }, updatedAt });
}

async function handleDelete(req, res) {
  const body = await readJsonBody(req);
  const guestSlug = String(body?.guestSlug || '').trim();

  if (!guestSlug) {
    res.status(400).json({ ok: false, error: 'guestSlug is required.' });
    return;
  }

  const row = await readState();
  const state = row?.data || defaultState();
  const nextRsvps = (Array.isArray(state.rsvps) ? state.rsvps : []).filter((item) => item.guestSlug !== guestSlug);
  const updatedAt = await writeState({ ...state, rsvps: nextRsvps });
  res.status(200).json({ ok: true, data: { ...state, rsvps: nextRsvps }, updatedAt });
}

function sanitizeRsvp(value) {
  if (!value || typeof value !== 'object') return null;
  const guestSlug = String(value.guestSlug || '').trim();
  const guestName = String(value.guestName || '').trim();
  if (!guestSlug || !guestName) return null;

  return {
    id: value.id,
    guestSlug,
    guestName,
    attendance: String(value.attendance || 'Hadir').slice(0, 40),
    pax: String(value.pax || '1').slice(0, 4),
    note: String(value.note || '').slice(0, 1200),
    updatedAt: value.updatedAt || new Date().toISOString(),
  };
}
