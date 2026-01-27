import Link from 'next/link';
 
export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Page Not Found</h2>
          <p className="text-gray-500">
            Could not find the requested resource.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full bg-[#F97352] text-white font-medium hover:bg-[#e06241] transition-colors focus:ring-4 focus:ring-[#F97352]/20"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
