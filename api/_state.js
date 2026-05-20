import { defaultInvitation } from '../src/data.js';
import { ensureStateTable, getSql } from './_db.js';

export const STATE_ID = 'default';

export async function readState() {
  await ensureStateTable();
  const sql = getSql();
  const rows = await sql`
    SELECT data, updated_at
    FROM invitation_state
    WHERE id = ${STATE_ID}
    LIMIT 1
  `;

  return rows[0] || null;
}

export async function writeState(data) {
  await ensureStateTable();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO invitation_state (id, data, updated_at)
    VALUES (${STATE_ID}, ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (id)
    DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    RETURNING updated_at
  `;

  return rows[0]?.updated_at;
}

export function defaultState() {
  return JSON.parse(JSON.stringify(defaultInvitation));
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}
