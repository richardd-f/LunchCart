export default function Loading() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <h2 className="text-lg font-bold text-gray-900">Shop Approval</h2>
        <p className="text-sm text-gray-500">Manage shop registrations and statuses.</p>
      </div>

      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-gray-200" />
                <div className="h-3 w-28 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-20 rounded-lg bg-gray-200" />
              <div className="h-9 w-20 rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
