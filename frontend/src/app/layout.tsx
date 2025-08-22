import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/store/Providers';
import { NotificationSystem } from '@/components/NotificationSystem';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Taskly - Task Management App',
  description: 'A modern task management application built with Next.js',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#3b82f6',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          <NotificationSystem />
          {children}
        </Providers>
      </body>
    </html>
  );
}
