import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'SikshyaNepal - Nepal\'s #1 Education Portal',
    template: '%s | SikshyaNepal',
  },
  description: 'Find colleges, university programs, exam results, notices, scholarships, and education news in Nepal.',
  keywords: ['Nepal education', 'colleges Nepal', 'TU results', 'KU notices', 'university programs Nepal'],
  authors: [{ name: 'SikshyaNepal' }],
  metadataBase: new URL('https://sikshyanepal.com'),
  openGraph: {
    type: 'website',
    locale: 'en_NP',
    url: 'https://sikshyanepal.com',
    siteName: 'SikshyaNepal',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
