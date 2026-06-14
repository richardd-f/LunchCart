export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Shop Wallet</h1>
        <p className="text-gray-600">Summary of your finance shop history.</p>
      </div>

      <div className="animate-pulse space-y-6">
        {/* Balance cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-8 w-40 rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Transactions table */}
        <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="h-5 w-40 rounded bg-gray-200" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between border-b border-gray-50 py-3">
              <div className="space-y-2">
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-200" />
              </div>
              <div className="h-5 w-20 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
