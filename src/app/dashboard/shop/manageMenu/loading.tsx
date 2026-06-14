export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Menu</h1>
          <p className="text-sm text-gray-500">Create, update, and organize your shop&apos;s menu items.</p>
        </div>

        <div className="animate-pulse space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="h-10 w-64 rounded-lg bg-gray-200" />
            <div className="h-10 w-32 rounded-lg bg-gray-300" />
          </div>

          {/* Menu grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3 rounded-xl border border-gray-100 bg-white p-4">
                <div className="h-40 rounded-lg bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-6 w-1/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
