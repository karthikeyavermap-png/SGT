import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { QueryProvider } from '@/lib/query-provider';

export const metadata: Metadata = {
  title: 'PulseDesk | Enterprise Ticketing Platform',
  description: 'Cross-platform ticketing & customer support management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

