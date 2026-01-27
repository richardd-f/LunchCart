'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Something went wrong!</h2>
          <p className="text-gray-500">
            {error.message || 'An unexpected error occurred.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-full bg-[#F97352] text-white font-medium hover:bg-[#e06241] transition-colors focus:ring-4 focus:ring-[#F97352]/20"
          >
            Try again
          </button>
          
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
