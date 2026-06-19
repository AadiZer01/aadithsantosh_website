import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aadithsantosh.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Aadith Santosh | Independent Equity Research',
    template: '%s | Aadith Santosh',
  },
  description: 'Fundamentals-driven analysis of Indian public equities. In-depth research on business quality, valuation, and 12–18 month return potential.',
  openGraph: {
    type: 'website',
    siteName: 'Aadith Santosh — Equity Research',
    title: 'Aadith Santosh | Independent Equity Research',
    description: 'Fundamentals-driven analysis of Indian public equities. In-depth research on business quality, valuation, and 12–18 month return potential.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aadith Santosh | Independent Equity Research',
    description: 'Fundamentals-driven analysis of Indian public equities. In-depth research on business quality, valuation, and 12–18 month return potential.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper font-sans">
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-D1954NFFBL" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-D1954NFFBL');
        `}</Script>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
