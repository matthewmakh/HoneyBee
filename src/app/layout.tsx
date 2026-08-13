import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Honeybee Referral Club',
    template: '%s · Honeybee Referral Club',
  },
  description:
    'Connect homeowners with vetted service providers and earn commission on every completed job. A referral marketplace built on trust and results.',
  openGraph: {
    title: 'Honeybee Referral Club',
    description:
      'Connect homeowners with vetted service providers and earn commission on every completed job.',
    url: siteUrl,
    siteName: 'Honeybee Referral Club',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Honeybee Referral Club',
    description:
      'Connect homeowners with vetted service providers and earn commission on every completed job.',
  },
};

export const viewport: Viewport = {
  themeColor: '#1B2745',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
