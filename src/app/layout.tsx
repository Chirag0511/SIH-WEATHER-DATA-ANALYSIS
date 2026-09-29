import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'National Weather Intelligence Platform (India) | राष्ट्रीय मौसम आसूचना मंच',
  description: 'AI-assisted weather intelligence platform aggregating Doppler radar feeds, satellite reanalysis, social signals, and verified citizen ground-truth reports for India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#020c1b] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
