export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 h-8 w-48 rounded bg-gray-200" />

        <div className="space-y-6">
          {[1, 2].map((shop) => (
            <div key={shop} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              {/* Shop Header */}
              <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 p-4">
                <div className="h-4 w-4 rounded-full bg-gray-300" />
                <div className="h-4 w-40 rounded bg-gray-200" />
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {[1, 2].map((item) => (
                  <div key={item} className="flex gap-4 p-4">
                    <div className="h-20 w-20 flex-shrink-0 rounded-md bg-gray-200" />
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-1/3 rounded bg-gray-200" />
                        <div className="h-3 w-1/4 rounded bg-gray-200" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-24 rounded-md bg-gray-200" />
                        <div className="h-5 w-20 rounded bg-gray-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
