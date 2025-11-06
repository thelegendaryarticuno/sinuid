"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IDCardFormPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/idcards', { method: 'POST', body: JSON.stringify({ name }), headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      router.push(`/idcard/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 text-zinc-50 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900/60 border border-zinc-800 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold mb-4">Generate ID Card</h1>
        <p className="text-sm text-zinc-400 mb-6">Enter your name and generate a shareable 3D ID card.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500" value={name} onChange={(e)=>setName(e.target.value)} required maxLength={64}/>
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button disabled={loading} className="w-full rounded-lg bg-sky-600 hover:bg-sky-500 transition py-2.5 font-medium">
            {loading ? 'Generating…' : 'Generate ID Card'}
          </button>
        </form>
      </div>
    </div>
  );
}
