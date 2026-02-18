export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4">
        {/* Placeholder for Admin Sidebar */}
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            <li><a href="/admin" className="block p-2 hover:bg-gray-100">Overview</a></li>
            <li><a href="/admin/exhibitions" className="block p-2 hover:bg-gray-100">Exhibitions</a></li>
            <li><a href="/admin/artists" className="block p-2 hover:bg-gray-100">Artists</a></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
