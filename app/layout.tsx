import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Arabic } from 'next/font/google'
import './globals.css'

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
})

export const metadata: Metadata = {
  title: 'Meta Ads Tool',
  description: 'Professional Meta Ads Management Tool',
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={`bg-[#0a0a0a] ${notoSansArabic.variable}`}>
      <body className="antialiased font-arabic">
        {children}
      </body>
    </html>
  )
}
