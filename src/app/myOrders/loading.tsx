export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="mx-auto min-h-screen max-w-7xl bg-white shadow-lg">
        <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 px-4 py-4 backdrop-blur-md">
          <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        </header>

        <main className="space-y-4 p-4 animate-pulse">
          {/* Filter chips */}
          <div className="flex gap-2 overflow-hidden pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-24 flex-shrink-0 rounded-full bg-gray-200" />
            ))}
          </div>

          {/* Order cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-28 rounded bg-gray-200" />
                      <div className="h-3 w-20 rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="h-6 w-16 rounded-full bg-gray-200" />
                </div>
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 p-4">
                  <div className="h-6 w-24 rounded bg-gray-200" />
                  <div className="h-9 w-24 rounded-full bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
