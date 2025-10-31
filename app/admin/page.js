"use client";
import { useEffect, useMemo, useState } from 'react';
import { getFirebase } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { Scanner } from '@yudiel/react-qr-scanner';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_ALLOWED_EMAIL || process.env.ADMIN_ALLOWED_EMAIL;

function extractIdcardId(value) {
  if (!value) return null;
  try {
    const u = new URL(value);
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[0] === 'idcard' && parts[1] ? parts[1] : parts.pop();
  } catch {
    // Not a URL, maybe raw id
    return value.trim();
  }
}

export default function AdminPage() {
  const { auth, provider } = useMemo(() => getFirebase(), []);
  const [user, setUser] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [eventName, setEventName] = useState('Respawn');
  const [name, setName] = useState('');
  const [decoded, setDecoded] = useState('');
  const [status, setStatus] = useState('');
  const [scannerActive, setScannerActive] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      const email = u?.email || '';
      setAllowed(!!email && (!!ADMIN_EMAIL ? email.toLowerCase() === ADMIN_EMAIL.toLowerCase() : true));
    });
  }, [auth]);

  const doLogin = async () => {
    await signInWithPopup(auth, provider);
  };
  const doLogout = async () => {
    await signOut(auth);
  };

  const logEvent = async (raw) => {
    const id = extractIdcardId(raw || decoded);
    if (!id) {
      setStatus('No QR/ID detected');
      return;
    }
    setStatus('Submitting…');
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, name, idcardId: id, adminEmail: user?.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus(`Logged ✔ (${id})`);
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin</h1>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-zinc-300">{user.email}</div>
              <button onClick={doLogout} className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700">Sign out</button>
            </div>
          ) : (
            <button onClick={doLogin} className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500">Sign in with Google</button>
          )}
        </header>

        {!user ? (
          <p className="text-zinc-400">Please sign in with your Google account.</p>
        ) : !allowed ? (
          <div className="rounded-lg border border-red-900 bg-red-950/30 p-4">
            <p className="text-red-300">Access denied. Your email is not authorized.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <h2 className="font-medium mb-3">Event</h2>
              <div className="space-y-3">
                <label className="block text-sm text-zinc-400">Event name</label>
                <select value={eventName} onChange={(e)=>setEventName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2">
                  <option>Respawn</option>
                </select>
                <label className="block text-sm text-zinc-400">Name</label>
                <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Scanned person's name (optional)" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"/>
                <label className="block text-sm text-zinc-400">Manual ID/URL</label>
                <input value={decoded} onChange={(e)=>setDecoded(e.target.value)} placeholder="Paste QR contents or /idcard/ID" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"/>
                <button onClick={() => logEvent()} className="w-full mt-2 rounded bg-sky-600 hover:bg-sky-500 py-2">Log now</button>
                {status && <div className="text-xs text-zinc-400">{status}</div>}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-medium">QR Scanner</h2>
                <button onClick={()=>setScannerActive(v=>!v)} className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700">{scannerActive ? 'Stop' : 'Start'}</button>
              </div>
              {scannerActive ? (
                <Scanner
                  onScan={(result) => {
                    if (!result) return;
                    const text = Array.isArray(result) ? result[0]?.rawValue || result[0]?.data : (result?.rawValue || result?.data || String(result));
                    if (text) {
                      setDecoded(text);
                      logEvent(text);
                    }
                  }}
                  onError={(err) => setStatus('Camera error: ' + (err?.message || err))}
                  components={{ finder: true }}
                  constraints={{ facingMode: 'environment' }}
                  styles={{ container: { width: '100%', borderRadius: 12, overflow: 'hidden' } }}
                />
              ) : (
                <div className="h-64 grid place-items-center text-zinc-400">Scanner paused</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
