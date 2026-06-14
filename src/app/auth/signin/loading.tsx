export default function Loading() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-pulse rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-orange-100/50 backdrop-blur-xl">
        <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-gray-200" />
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-4 w-56 rounded bg-gray-200" />
        </div>
        <div className="h-12 w-full rounded-xl bg-gray-200" />
        <div className="mx-auto mt-6 h-3 w-3/4 rounded bg-gray-200" />
      </div>
    </div>
  );
}
