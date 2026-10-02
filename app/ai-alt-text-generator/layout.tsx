import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Alt Text Generator for Images | SEO Wizard",
  description:
    "Generate descriptive and SEO-friendly image alt text with AI. Free online AI Alt Text Generator with no registration required.",
  alternates: {
    canonical:
      "https://seo-wizard-one.vercel.app/ai-alt-text-generator",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AiAltTextGeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}