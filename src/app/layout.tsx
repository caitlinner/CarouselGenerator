import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sunflower Carousel Generator",
  description: "Generate stunning AI carousel stories for recovery & sobriety content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist-sans)]" style={{ background: '#F9F7F4', color: '#1a1a2e' }}>
        <nav className="px-6 py-4 flex items-center justify-between text-white" style={{ background: 'linear-gradient(135deg, #4A1A8A 0%, #8B5DC8 100%)' }}>
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="text-2xl">🌻</span>
            <span>Sunflower Carousel Generator</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/gallery" className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors">
              📂 My Carousels
            </Link>
            <Link href="/create" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: '#F5C518', color: '#1a1a2e' }}>
              + Create Carousel
            </Link>
          </div>
        </nav>
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}
