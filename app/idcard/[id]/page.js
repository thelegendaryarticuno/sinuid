import IDCardCanvas from '@/components/IDCardCanvas.jsx';

async function getData(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/idcards/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function IDCardViewPage({ params }) {
  const data = await getData(params.id);
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
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const url = `${site}/idcard/${data.id}`;
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-medium mb-4">Your ID Card</h1>
        <IDCardCanvas name={data.name} url={url} />
      </div>
    </div>
  );
}
