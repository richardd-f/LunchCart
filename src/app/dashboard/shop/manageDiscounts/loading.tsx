export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Discounts</h1>
          <p className="text-sm text-gray-500">Create order-level discounts and attach them to your menus.</p>
        </div>

        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-10 w-64 rounded-lg bg-gray-200" />
            <div className="h-10 w-36 rounded-lg bg-gray-300" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3 rounded-xl border border-gray-100 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-1/2 rounded bg-gray-200" />
                  <div className="h-5 w-12 rounded-full bg-gray-200" />
                </div>
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-4 w-1/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
