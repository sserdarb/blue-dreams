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
  title: "Blue Dreams Resort Torba | 5 Yıldızlı Her Şey Dahil",
  description: "Bodrum Torba'da eşsiz bir tatil deneyimi. 5 yıldızlı lüks otelimizde denize sıfır konaklama, spa, restoranlar ve daha fazlası.",
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

