import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import AnalyticsScripts, { GTMNoScript } from "@/components/AnalyticsScripts";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://new.bluedreamsresort.com'),
  title: {
    default: 'Blue Dreams Resort Torba | 5 Yıldızlı Her Şey Dahil',
    template: '%s | Blue Dreams Resort'
  },
  description: "Bodrum Torba'da eşsiz bir tatil deneyimi. 5 yıldızlı lüks otelimizde denize sıfır konaklama, spa, restoranlar ve daha fazlası.",
  keywords: ['Bodrum otel', 'Torba otel', '5 yıldızlı otel', 'her şey dahil', 'lüks tatil', 'Blue Dreams Resort', 'Ege tatil'],
  authors: [{ name: 'Blue Dreams Resort' }],
  creator: 'Blue Dreams Resort',
  publisher: 'Blue Dreams Resort',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: ['en_US', 'de_DE', 'ru_RU'],
    url: 'https://new.bluedreamsresort.com',
    siteName: 'Blue Dreams Resort',
    title: 'Blue Dreams Resort Torba | 5 Yıldızlı Her Şey Dahil',
    description: "Bodrum Torba'da eşsiz bir tatil deneyimi. 5 yıldızlı lüks otelimizde denize sıfır konaklama, spa, restoranlar ve daha fazlası.",
    images: [
      {
        url: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg',
        width: 1200,
        height: 630,
        alt: 'Blue Dreams Resort Torba - Bodrum',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blue Dreams Resort Torba | 5 Yıldızlı Her Şey Dahil',
    description: "Bodrum Torba'da eşsiz bir tatil deneyimi.",
    images: ['https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg'],
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
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <AnalyticsScripts />
      </head>
      <body
        className={`${poppins.variable} ${playfair.variable} antialiased font-sans`}
      >
        <GTMNoScript />
        {children}
      </body>
    </html>
  );
}

