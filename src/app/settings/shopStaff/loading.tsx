export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Add staff row */}
      <div className="flex gap-2">
        <div className="h-11 flex-1 rounded-lg bg-gray-200" />
        <div className="h-11 w-28 rounded-lg bg-gray-300" />
      </div>

      {/* Staff list */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-36 rounded bg-gray-200" />
                <div className="h-3 w-44 rounded bg-gray-200" />
              </div>
            </div>
            <div className="h-7 w-16 rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
