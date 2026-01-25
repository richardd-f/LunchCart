import React from 'react';

// Icons as components for cleanliness
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[#F97352]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[#F97352]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);

const QrCodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[#F97352]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
  </svg>
);


export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] rounded-b-[3rem] overflow-hidden mb-8">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/header.webp')",
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content Container */}
        <div className="relative h-full flex flex-col justify-center items-center px-4 text-center z-10">
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">
              Reimagining School Lunch
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-sm">
              LunchCart is built to solve the queue problem in school canteens, making your break time actually yours.
            </p>
          </div>
        </div>
      </section>

      {/* Mission / How it works */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why LunchCart?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We know that break times are short and queues are long. We&apos;re here to fix that with a simple, digital solution.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-orange-50 p-8 rounded-2xl text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <ClockIcon />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Skip the Queue</h3>
              <p className="text-gray-600">
                Don&apos;t waste your precious break time standing in line. Pre-order your food before the bell rings.
              </p>
            </div>

            <div className="bg-orange-50 p-8 rounded-2xl text-center space-y-4 hover:shadow-lg transition-shadow">
               <div className="flex justify-center mb-4">
                <PhoneIcon />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Easy Pre-order</h3>
              <p className="text-gray-600">
                Browse menus and pay upfront directly from your phone. No cash fumbling, no waiting.
              </p>
            </div>

            <div className="bg-orange-50 p-8 rounded-2xl text-center space-y-4 hover:shadow-lg transition-shadow">
               <div className="flex justify-center mb-4">
                <QrCodeIcon />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Seamless Pickup</h3>
              <p className="text-gray-600">
                Just show your QR code at the counter to verify your order and grab your food instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Get in Touch</h2>
          <p className="text-gray-600">
            Have questions, feedback, or encountered an issue? We&apos;re here to help.
          </p>
          <a 
            href="mailto:felitech.dev@gmail.com" 
            className="inline-block bg-[#F97352] text-white font-semibold py-3 px-8 rounded-full hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
          >
            felitech.dev@gmail.com
          </a>
        </div>
      </section>
    </main>
  );
}
