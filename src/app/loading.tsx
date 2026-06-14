export default function Loading() {
  return (
    <main className="flex flex-1 flex-col pb-10 animate-pulse">
      {/* Hero Skeleton */}
      <section className="relative mb-8 h-[400px] w-full overflow-hidden rounded-b-[3rem] bg-gray-200">
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-4">
          <div className="h-10 w-2/3 max-w-md rounded-lg bg-gray-300" />
          <div className="h-5 w-1/2 max-w-sm rounded bg-gray-300" />
          <div className="mt-2 h-12 w-full max-w-md rounded-full bg-gray-300" />
        </div>
      </section>

      {/* Shop Sections Skeleton */}
      <div className="mx-auto mt-4 flex w-full max-w-6xl flex-1 flex-col space-y-10 px-4">
        {[1, 2].map((section) => (
          <div key={section}>
            <div className="mb-4 h-7 w-48 rounded bg-gray-200" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="min-w-[200px] space-y-3 rounded-xl border border-gray-100 bg-white p-4">
                  <div className="h-32 rounded-lg bg-gray-200" />
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
