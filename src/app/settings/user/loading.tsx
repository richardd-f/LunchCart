export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Avatar row */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-9 w-28 rounded-lg bg-gray-200" />
        </div>
      </div>

      {/* Form fields */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-11 w-full rounded-lg bg-gray-200" />
        </div>
      ))}

      <div className="h-11 w-32 rounded-lg bg-gray-300" />
    </div>
  );
}
