export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Banner / profile image */}
      <div className="h-32 w-full rounded-xl bg-gray-200" />

      {/* Form fields */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-11 w-full rounded-lg bg-gray-200" />
        </div>
      ))}

      {/* Textarea */}
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-gray-200" />
        <div className="h-24 w-full rounded-lg bg-gray-200" />
      </div>

      <div className="h-11 w-32 rounded-lg bg-gray-300" />
    </div>
  );
}
