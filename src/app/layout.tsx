import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "QR Code Generator - Create Beautiful QR Codes Instantly",
  description: "Create beautiful QR codes instantly. Free, Unlimited",
  keywords: ["QR Code", "QR Generator", "Free QR Code", "Unlimited QR Code", "WiFi QR", "VCard QR", "URL QR", "Text QR"],
  authors: [{ name: "Musfiqur Rahman" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "QR Code Generator",
    description: "Create beautiful QR codes instantly. Free, Unlimited",
    url: "/",
    siteName: "QR Code Generator",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1344,
        height: 768,
        alt: "QR Code Generator - Create beautiful QR codes instantly",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Code Generator",
    description: "Create beautiful QR codes instantly. Free, Unlimited",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
