import { Pool } from 'pg';

let _pool;

export function getPool() {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    _pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 30_000 });
  }
  return _pool;
}

export async function query(text, params) {
  const pool = getPool();
  const res = await pool.query(text, params);
  return res;
}

export async function ensureTables() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS idcards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS logs (
      id BIGSERIAL PRIMARY KEY,
      event_name TEXT NOT NULL,
      name TEXT,
      idcard_id TEXT,
      admin_email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}
