import { Outfit, Inter } from 'next/font/google'
import { headers } from 'next/headers'
import '../styles/globals.css'
import Header from '../components/Header'

// Both families are variable fonts — omitting `weight` loads a single
// variable woff2 per family (~100 KB total) instead of 9 static weight files
// (~266 KB), and every weight from 100–900 renders with real glyphs
// (previously `font-black`/900 synthesized faux-bold because 900 wasn't in
// the static set).
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Parse the site URL defensively so a malformed NEXT_PUBLIC_SITE_URL can't
// throw at module load and break the build / request.
function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://xanadu.com'
  try {
    return new URL(raw)
  } catch {
    return new URL('https://xanadu.com')
  }
}

export const metadata = {
  metadataBase: resolveSiteUrl(),
  title: 'Xanadu — Global Vision, Local Execution',
  description:
    'Xanadu is a multi-disciplinary business group founded and led by Hessain Al Menawy — building and scaling businesses across emerging sectors in MENA, at the intersection of traditional industries and digital transformation.',
  icons: {
    icon: '/brand/Xanadu_Holding_Color.ico',
  },
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Xanadu — Global Vision, Local Execution',
    description:
      'A multi-disciplinary business group building and scaling businesses across emerging sectors in MENA — with offices in Egypt, Oman, and Mauritius.',
    type: 'website',
    siteName: 'Xanadu',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xanadu — Global Vision, Local Execution',
    description:
      'A multi-disciplinary business group building and scaling businesses across emerging sectors in MENA — with offices in Egypt, Oman, and Mauritius.',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Per-request CSP nonce from proxy.ts. Reading it here also tells
  // Next.js to stamp the nonce onto the scripts it injects.
  const nonce = (await headers()).get('x-nonce') ?? ''

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable}`}
      // The inline script below adds the `js` class to <html> before paint,
      // which intentionally diverges from the server-rendered markup — silence
      // that expected mismatch (same pattern as theme-color scripts).
      suppressHydrationWarning
    >
      <body>
        {/* Runs synchronously before paint so GSAP-hidden content only hides
            for JS-capable clients. Without JS the page stays visible
            (progressive enhancement). Must be the first child of <body> so it
            runs before the reveal items are parsed/painted. See `html.js`
            scoping in styles/globals.css. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        <Header />
        {children}
      </body>
    </html>
  )
}
