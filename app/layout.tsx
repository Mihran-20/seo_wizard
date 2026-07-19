import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Alt Text Generator & Image WebP Converter",
  description: "Free tool to compress images to WebP and automatically generate SEO-optimized alt texts using Gemini AI.",
  verification: {
    google: "oc-AUvWhQOYqie2epDCXtIr1tavr1DAxTFO8WnFateg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Եթե ուզում ես հենց meta թեգով, ապա այն պետք է լինի head-ի մեջ */}
        <meta name="google-site-verification" content="oc-AUvWhQOYqie2epDCXtIr1tavr1DAxTFO8WnFateg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col bg-slate-950 text-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}