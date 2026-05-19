import { neon } from '@neondatabase/serverless';

let sqlClient = null;

export function getSql() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL is not configured.');
    error.statusCode = 503;
    throw error;
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

export async function ensureStateTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS invitation_state (
      id text PRIMARY KEY,
      data jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
}
