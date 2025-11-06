import IDCardCanvas from '@/components/IDCardCanvas.jsx';
import { query } from '@/lib/db';
import { signQrToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export default async function IDCardViewPage({ params }) {
  // In Next.js 16, params is a Promise in some cases. Await it before use.
  const { id: rawId } = await params;
  let data = null;
  try {
    const id = String(rawId || '').trim();
    const res = await query('SELECT id, name, created_at FROM idcards WHERE id=$1 LIMIT 1', [id]);
    data = res.rowCount ? res.rows[0] : null;
  } catch (e) {
    console.error('Error loading ID card', params.id, e);
  }
  if (!data) {
    return (
      <div className="min-h-screen grid place-items-center bg-black text-zinc-200">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">ID Card not found</h1>
          <p className="text-zinc-400 mt-2">The link may be invalid or expired.</p>
        </div>
      </div>
    );
  }
  // Create a short-lived QR token that encodes name + id
  const token = signQrToken({ id: data.id, name: data.name, ttlSeconds: 120 });
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* ID Card Canvas */}
        <IDCardCanvas name={data.name} url={token} />

        {/* Info Section */}
        <div className="mt-6 text-center text-xs sm:text-sm text-zinc-500">
          <p>Click the button below the card to view the scannable QR code</p>
        </div>
      </div>
    </div>
  );
}
