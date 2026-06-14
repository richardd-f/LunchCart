export default function Loading() {
  return (
    <div className="relative flex flex-1 flex-col pb-24 md:pb-10 animate-pulse">
      <div className="mx-auto my-auto w-full max-w-7xl md:px-6 md:py-8">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-12">
          {/* Left: Image */}
          <div className="aspect-square w-full bg-gray-200 md:rounded-2xl" />

          {/* Right: Details */}
          <div className="space-y-6 px-4 py-6 md:py-0">
            {/* Shop header */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-200" />
              </div>
            </div>

            {/* Title & price */}
            <div className="space-y-3">
              <div className="h-8 w-2/3 rounded bg-gray-200" />
              <div className="h-7 w-32 rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-5 w-20 rounded-full bg-gray-200" />
                <div className="h-5 w-16 rounded-full bg-gray-200" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
              <div className="h-4 w-4/6 rounded bg-gray-200" />
            </div>

            {/* Add to cart */}
            <div className="h-12 w-full rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
