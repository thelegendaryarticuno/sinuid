export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-semibold mb-3">College ID • 3D</h1>
        <p className="text-zinc-400 mb-8">Generate a shareable 3D ID card and manage scans from the admin console.</p>
        <div className="flex gap-3 justify-center">
          <a href="/idcard" className="px-5 py-3 rounded-lg bg-sky-600 hover:bg-sky-500">Create ID Card</a>
          <a href="/admin" className="px-5 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700">Admin</a>
        </div>
      </div>
    </div>
  );
}
