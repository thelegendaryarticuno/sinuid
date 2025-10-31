import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_req, { params }) {
  try {
    const id = params.id;
    const res = await query('SELECT id, name, created_at FROM idcards WHERE id=$1', [id]);
    if (res.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } catch (e) {
    console.error('GET /api/idcards/[id] error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
