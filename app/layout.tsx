import type { Metadata } from 'next'
import { Noto_Serif, DM_Sans, DM_Mono } from 'next/font/google'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/seo'
import CookieConsent from '@/components/privacy/CookieConsent'
import ConsentScripts from '@/components/privacy/ConsentScripts'
import './globals.css'

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
  display: 'swap',
})

const BASE_URL = SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'SikshyaNepal – Nepal Education Information Platform',
    template: '%s | SikshyaNepal',
  },
  description:
    'Find Nepal schools, colleges, programs, exam results, notices, scholarships and education news with source details where available.',
  keywords: [
    'Nepal education',
    'schools Nepal',
    'colleges Nepal',
    'TU results',
    'KU notices',
    'university programs Nepal',
    'Nepal college admission',
    'scholarship Nepal',
    'NEB results',
    'entrance exam Nepal',
  ],
  authors: [{ name: 'SikshyaNepal', url: BASE_URL }],
  creator: 'SikshyaNepal',
  publisher: 'SikshyaNepal',
  openGraph: {
    type: 'website',
    locale: 'en_NP',
    url: BASE_URL,
    siteName: 'SikshyaNepal',
    title: 'SikshyaNepal – Nepal Education Information Platform',
    description:
      'Find colleges, university programs, exam results, notices, scholarships, and education news in Nepal.',
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'SikshyaNepal - Education Portal for Nepal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SikshyaNepal – Nepal Education Information Platform',
    description: 'Find colleges, programs, results and notices for Nepal education.',
    images: [`${BASE_URL}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${notoSerif.variable} ${dmSans.variable} ${dmMono.variable} font-sans antialiased`}>
        <a href="#main-content" className="sr-only z-[300] rounded-lg bg-white px-4 py-3 font-bold text-primary focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to main content</a>
        <JsonLd data={{ '@context': 'https://schema.org', '@graph': [{ '@type': 'WebSite', '@id': `${BASE_URL}/#website`, url: BASE_URL, name: 'SikshyaNepal', description: 'Source-aware education information for students and families in Nepal.', inLanguage: ['en', 'ne'], publisher: { '@id': `${BASE_URL}/#organization` }, potentialAction: { '@type': 'SearchAction', target: `${BASE_URL}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }, { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'SikshyaNepal', url: BASE_URL, logo: { '@type': 'ImageObject', url: `${BASE_URL}/opengraph-image` }, areaServed: { '@type': 'Country', name: 'Nepal' }, knowsAbout: ['Schools in Nepal', 'Colleges in Nepal', 'Nepal education admissions', 'University programs in Nepal', 'Scholarships in Nepal', 'Nepal examination results'] }] }} />
        {children}

        <ConsentScripts />
        <CookieConsent />
      </body>
    </html>
  )
}
