export default function  Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-pulse">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100/50 overflow-hidden mb-8 h-[300px] relative">
            <div className="h-32 bg-gray-200" />
            <div className="px-6 pb-6 relative">
                 <div className="flex flex-col md:flex-row items-end gap-6 -mt-12">
                     <div className="h-32 w-32 rounded-2xl bg-gray-300 border-4 border-white shrink-0" />
                     <div className="flex-1 w-full space-y-3 pb-2">
                         <div className="h-8 bg-gray-200 rounded w-1/3" />
                         <div className="h-4 bg-gray-200 rounded w-1/4" />
                         <div className="h-4 bg-gray-200 rounded w-2/3" />
                     </div>
                 </div>
            </div>
        </div>

        {/* New Menu Skeleton */}
        <div className="mb-10">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
            <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="min-w-[200px] h-[250px] bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                        <div className="h-32 bg-gray-200 rounded-lg" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                ))}
            </div>
        </div>
        
        <div className="h-px bg-gray-200 my-8" />

        {/* Menu Grid Skeleton */}
        <div>
             <div className="flex justify-between items-center mb-6">
                <div className="h-8 bg-gray-200 rounded w-32" />
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-8 w-20 bg-gray-200 rounded-full" />
                    ))}
                </div>
             </div>
             
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="h-[280px] bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                         <div className="h-40 bg-gray-200 rounded-lg" />
                         <div className="h-4 bg-gray-200 rounded w-3/4" />
                         <div className="h-4 bg-gray-200 rounded w-1/2" />
                         <div className="mt-auto h-6 bg-gray-200 rounded w-1/3" />
                    </div>
                ))}
             </div>
        </div>
        
      </main>
    </div>
  );
}
