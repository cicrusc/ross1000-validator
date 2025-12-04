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
  title: "ROSS 1000 Validator – Validazione File TXT",
  description:
    "Applicazione web per la validazione di file ROSS 1000. Carica file TXT, correggi errori e ottieni file TXT validi secondo le specifiche ISTAT. Interfaccia moderna e feedback in tempo reale.",
  keywords: [
    "ROSS 1000",
    "validator",
    "file TXT",
    "ISTAT",
    "hotel",
    "formattazione dati",
    "Next.js",
    "React",
    "TypeScript",
  ],
  authors: [{ name: "cicrush" }],
  openGraph: {
    title: "ROSS 1000 Validator",
    description:
      "Strumento per validare file ROSS 1000 e ottenere TXT validi conformi alle specifiche ISTAT con interfaccia user-friendly.",
    siteName: "ROSS 1000 Validator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ROSS 1000 Validator",
    description:
      "Validator ROSS 1000 per hotel e strutture ricettive: correggi errori e ottieni file TXT validi secondo le specifiche ISTAT.",
  },
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
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
