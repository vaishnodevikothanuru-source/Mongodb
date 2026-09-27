import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import Navbar from '@/components/Navbar';
import DbStatusBanner from '@/components/DbStatusBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Public Transportation Assistant | Your Smarter Way to Commute',
  description:
    'Plan smarter, travel better. Personalized public transportation recommendations based on live route conditions, travel time, cost, crowd levels, and individual commuter preferences.',
  keywords: [
    'smart transit',
    'public transportation',
    'commute planner',
    'metro routes',
    'bus timings',
    'crowd monitoring',
    'live delays',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white`}>
        <AuthProvider>
          <DbStatusBanner />
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
