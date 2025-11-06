import { NextResponse } from 'next/server';
import { ensureTables, query } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req) {
  try {
    await ensureTables();
    const body = await req.json();
    const name = (body?.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    // Check if a card already exists for this name (case-insensitive)
    const found = await query('SELECT id, name FROM idcards WHERE lower(name)=lower($1) LIMIT 1', [name]);
    if (found.rowCount > 0) {
      return NextResponse.json({ id: found.rows[0].id, name: found.rows[0].name, existed: true });
    }
    const id = randomUUID();
    await query('INSERT INTO idcards (id, name) VALUES ($1, $2)', [id, name]);
    return NextResponse.json({ id, name, existed: false });
  } catch (e) {
    console.error('POST /api/idcards error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
