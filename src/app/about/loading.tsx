export default function Loading() {
  return (
    <main className="min-h-screen bg-white animate-pulse">
      {/* Hero */}
      <section className="relative mb-8 h-[400px] w-full overflow-hidden rounded-b-[3rem] bg-gray-200">
        <div className="flex h-full flex-col items-center justify-center gap-4 px-4">
          <div className="h-10 w-2/3 max-w-md rounded-lg bg-gray-300" />
          <div className="h-5 w-1/2 max-w-lg rounded bg-gray-300" />
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 flex flex-col items-center gap-3">
            <div className="h-8 w-56 rounded bg-gray-200" />
            <div className="h-4 w-2/3 max-w-xl rounded bg-gray-200" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4 rounded-2xl bg-orange-50 p-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-200" />
                <div className="mx-auto h-5 w-32 rounded bg-gray-200" />
                <div className="mx-auto h-4 w-full rounded bg-gray-200" />
                <div className="mx-auto h-4 w-4/5 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
