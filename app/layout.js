import './globals.css'
import { ToastProvider } from '@/components/Toast'

export const metadata = {
  metadataBase: new URL('https://subbiayaveltrust.vercel.app'),
  title: {
    default: 'Subbiayavel Trust | Official Website',
    template: '%s | Subbiayavel Trust',
  },
  description:
    'Official digital content portal for Subbiayavel Charitable Trust (Regd. No. 4/53/2025). Access educational media, video lessons, books, literature, and community announcements.',
  keywords: [
    'Subbiayavel Trust',
    'Subbiayavel Charitable Trust',
    'Subbiayavel Trust official website',
    'charitable trust',
    'social service trust',
    'community welfare',
    'educational media',
    'digital books',
  ],
  authors: [{ name: 'Subbiayavel Charitable Trust' }],
  creator: 'Subbiayavel Charitable Trust',
  publisher: 'Subbiayavel Charitable Trust',
  verification: {
    google: '9Db6kZ63Yi8SyL3Y5qrQ6ZRFIGyH3rs6x9KFdwjo6LM',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Subbiayavel Trust | Official Website',
    description:
      'Official digital content portal for Subbiayavel Charitable Trust (Regd. No. 4/53/2025). Access educational media, video lessons, books, literature, and community announcements.',
    url: 'https://subbiayaveltrust.vercel.app/',
    siteName: 'Subbiayavel Trust',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Subbiayavel Charitable Trust Banner',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Subbiayavel Trust | Official Website',
    description:
      'Official digital content portal for Subbiayavel Charitable Trust (Regd. No. 4/53/2025).',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
}

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NonprofitOrganization',
        '@id': 'https://subbiayaveltrust.vercel.app/#organization',
        name: 'Subbiayavel Charitable Trust',
        alternateName: [
          'Subbiayavel Trust',
          'Subbiayavel Charitable Trust Portal',
          'Subbiayavel Trust Official Website',
        ],
        url: 'https://subbiayaveltrust.vercel.app/',
        logo: {
          '@type': 'ImageObject',
          url: 'https://subbiayaveltrust.vercel.app/logo.png',
          width: 800,
          height: 400,
        },
        image: 'https://subbiayaveltrust.vercel.app/logo.png',
        identifier: 'Regd. No. 4/53/2025',
        description:
          'Official digital content portal for Subbiayavel Charitable Trust (Regd. No. 4/53/2025). Dedicated to sharing educational media, video lessons, literature, and community announcements.',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://subbiayaveltrust.vercel.app/#website',
        url: 'https://subbiayaveltrust.vercel.app/',
        name: 'Subbiayavel Trust',
        description: 'Official Website and Digital Portal for Subbiayavel Charitable Trust',
        publisher: {
          '@id': 'https://subbiayaveltrust.vercel.app/#organization',
        },
        inLanguage: 'en-US',
      },
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved || (prefersDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
