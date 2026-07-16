import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import OnboardingTour from '@/components/OnboardingTour';
import SWRegistration from '@/components/SWRegistration';

export const metadata: Metadata = {
  title: 'LingoAlb — Mëso Gjuhë të Huaja Përmes Shqipes',
  description: 'Platforma e parë shqiptare për mësimin e gjuhëve të huaja.',
  keywords: 'mëso anglisht, gjuhë të huaja, shqip, LingoAlb',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'LingoAlb' },
  openGraph: {
    title: 'LingoAlb',
    description: 'Mëso gjuhë të huaja përmes shqipes',
    type: 'website',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'theme-color': '#1B4FD8',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1B4FD8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LingoAlb" />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
        <OnboardingTour />
        <SWRegistration />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1E293B',
              color: '#F1F5F9',
              borderRadius: '12px',
              border: '1px solid #334155',
              fontFamily: 'var(--font-plus-jakarta)',
            },
            success: { iconTheme: { primary: '#2DC653', secondary: '#fff' } },
            error: { iconTheme: { primary: '#E63946', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
