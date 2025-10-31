import { NextResponse } from 'next/server';
import { ensureTables, query } from '@/lib/db';
import { verifyQrToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    await ensureTables();
    const { token, eventName = 'Respawn', adminEmail } = await req.json();
    if (!token || !adminEmail) return NextResponse.json({ error: 'Missing token/adminEmail' }, { status: 400 });
    let decoded;
    try {
      decoded = verifyQrToken(token);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    const { id: idcardId, name } = decoded || {};
    await query(
      'INSERT INTO logs (event_name, name, idcard_id, admin_email) VALUES ($1,$2,$3,$4)',
      [eventName, name || null, idcardId || null, adminEmail]
    );
    return NextResponse.json({ ok: true, idcardId, name });
  } catch (e) {
    console.error('POST /api/scan error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
