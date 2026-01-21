import React from 'react';

export function Footer() {
  return (
    <footer className="bg-[#F97352] text-white py-7 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* <h3 className="text-lg font-semibold mb-2">
          Need help or have a question?
        </h3>
        <p className="text-sm text-white/80 mb-6 max-w-sm mx-auto">
          We are here to assist you with any issues or inquiries regarding the lunch service.
        </p>
        
        <a 
          href="mailto:help@kantinsanjose.school" 
          className="inline-flex items-center justify-center px-6 py-2 bg-white text-[#F97352] font-medium text-sm rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
          Contact Support
        </a> */}
        
        <div className=" border-white/20 text-xs font-medium text-white/60">
          &copy; {new Date().getFullYear()} LunchCart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
