export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-7 w-56 rounded bg-gray-200" />
        <div className="h-4 w-72 rounded bg-gray-200" />
      </div>

      {/* Search */}
      <div className="mb-6 h-11 w-full max-w-md rounded-lg bg-gray-200" />

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 p-4">
          <div className="h-4 w-32 rounded bg-gray-200" />
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center justify-between border-b border-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-gray-200" />
                <div className="h-3 w-48 rounded bg-gray-200" />
              </div>
            </div>
            <div className="h-7 w-20 rounded-full bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-9 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
