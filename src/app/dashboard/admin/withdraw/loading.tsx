export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-7 w-56 rounded bg-gray-200" />
        <div className="h-4 w-72 rounded bg-gray-200" />
      </div>

      {/* Search */}
      <div className="mb-6 h-11 w-full max-w-md rounded-lg bg-gray-200" />

      {/* Shop list */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-200" />
              </div>
            </div>
            <div className="h-9 w-28 rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
