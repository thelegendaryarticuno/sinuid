import { NextResponse } from 'next/server';
import { ensureTables, query } from '@/lib/db';

export async function POST(req) {
  try {
    await ensureTables();
    const { eventName, name, idcardId, adminEmail } = await req.json();
    if (!eventName || !adminEmail) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    await query(
      'INSERT INTO logs (event_name, name, idcard_id, admin_email) VALUES ($1,$2,$3,$4)',
      [eventName, name || null, idcardId || null, adminEmail]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('POST /api/logs error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
