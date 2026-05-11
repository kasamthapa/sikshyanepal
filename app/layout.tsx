import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const BASE_URL = 'https://sikshyanepal.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SikshyaNepal - Nepal's #1 Education Portal",
    template: '%s | SikshyaNepal',
  },
  description:
    'Find colleges, university programs, exam results, notices, scholarships, and education news in Nepal. Your complete guide for higher education in Nepal.',
  keywords: [
    'Nepal education',
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
    title: "SikshyaNepal - Nepal's #1 Education Portal",
    description:
      'Find colleges, university programs, exam results, notices, scholarships, and education news in Nepal.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'SikshyaNepal - Education Portal for Nepal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "SikshyaNepal - Nepal's #1 Education Portal",
    description: 'Find colleges, programs, results and notices for Nepal education.',
    images: [`${BASE_URL}/og-image.png`],
    creator: '@sikshyanepal',
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
  verification: {
    google: 'add-your-google-verification-here',
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}

        {/* OneSignal Web Push SDK — only injected when App ID is configured */}
        {appId && (
          <>
            <Script
              src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
              strategy="afterInteractive"
              defer
            />
            <Script id="onesignal-init" strategy="afterInteractive">
              {`
                window.OneSignalDeferred = window.OneSignalDeferred || [];
                OneSignalDeferred.push(async function(OneSignal) {
                  await OneSignal.init({
                    appId: "${appId}",
                    serviceWorkerPath: "/OneSignalSDKWorker.js",
                    notifyButton: { enable: false },
                    allowLocalhostAsSecureOrigin: true,
                  });
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
