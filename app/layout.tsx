import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "E-Quickly — Recettes & Courses Intelligentes",
  description: "Découvrez des recettes délicieuses, planifiez vos repas et faites vos courses intelligemment avec E-Quickly.",
  keywords: "recettes, cuisine, IA, courses, ingrédients, planification repas, panier intelligent",
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍽️</text></svg>',
        type: 'image/svg+xml',
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{ backgroundColor: '#FFFCF7', color: '#1A1A2E' }}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
