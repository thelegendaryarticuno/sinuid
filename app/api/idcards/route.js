import { NextResponse } from 'next/server';
import { ensureTables, query } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req) {
  try {
    await ensureTables();
    const body = await req.json();
    const name = (body?.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const id = randomUUID();
    await query('INSERT INTO idcards (id, name) VALUES ($1, $2)', [id, name]);
    return NextResponse.json({ id, name });
  } catch (e) {
    console.error('POST /api/idcards error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
