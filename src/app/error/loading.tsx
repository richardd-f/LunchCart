export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md animate-pulse space-y-6 text-center">
        <div className="mx-auto h-8 w-48 rounded bg-gray-200" />
        <div className="mx-auto h-4 w-64 rounded bg-gray-200" />
        <div className="mx-auto h-10 w-36 rounded-full bg-gray-200" />
      </div>
    </main>
  );
}
