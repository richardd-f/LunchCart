import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { SessionProvider } from "@/components/SessionProvider";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL 
  ? process.env.NEXT_PUBLIC_BASE_URL 
  : "http://localhost:3000";


export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  // 3. Dynamic Title Template
  title: {
    default: "Kantin Sanjose | Pesan Makan Online",
    template: "%s | Kantin Sanjose",
  },
  description: "Website resmi Kantin Sanjose. Pesan makanan dan minuman online dengan mudah di SMA Santo Yoseph Denpasar. Hemat waktu, tanpa antri.",
  
  // 4. Base URL helps Google resolve relative links
  metadataBase: new URL(BASE_URL),
  
  keywords: ["Kantin Sanjose", "SMA Santo Yoseph Denpasar", "Pesan Makanan", "Kantin Sekolah", "Denpasar", "LunchCart"],
  authors: [{ name: "Felitech" }],
  
  // 5. Open Graph (How it looks on WhatsApp/Facebook)
  openGraph: {
    title: "Kantin Sanjose",
    description: "Pesan makanan online di SMA Santo Yoseph Denpasar. Cepat dan Praktis.",
    url: BASE_URL,
    siteName: "Kantin Sanjose",
    locale: "id_ID", 
    type: "website",
    images: [
      {
        url: "/og-image.jpeg", // You need to add this image to your public folder
        width: 1200,
        height: 630,
        alt: "Kantin Sanjose Preview",
      },
    ],
  },

  // 6. Twitter Card (How it looks on X)
  twitter: {
    card: "summary_large_image",
    title: "Kantin Sanjose",
    description: "Pesan makanan online di SMA Santo Yoseph Denpasar.",
    images: ["/og-image.jpeg"],
  },

  // 7. Robots (Instructions for Google Bot)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 8. Changed lang to "id" because the content is Indonesian
    <html lang="id">
      {/* Google tag (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-0ZD56GMYJ2"
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-0ZD56GMYJ2');
        `}
      </Script>

      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <SessionProvider>
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <NavBar />
          <NavbarSpace />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}

// Simple spacer to avoid navbar overlap if fixed, though layout seems to use flex-grow
function NavbarSpace() {
  return null; 
}