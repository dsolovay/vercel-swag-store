import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const titleTemplate = {
  default: "Vercel Swag Store",
  template: "%s | Vercel Swag Store",
};
const description = "Vercel Swag Store certification exercise for Dan Solovay";

async function Footer() {
  "use cache";
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 max-h-14 items-center justify-center text-sm text-gray-600">
          © {year} Vercel Swag Store
        </div>
      </div>
    </footer>
  );
}

export const metadata: Metadata = {
  title: titleTemplate,
  description: description,
  openGraph: {
    title: titleTemplate,
    description: description,
  },
  metadataBase: process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="bg-white border-b">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <Image
                  src="Vercel_Symbol_0.svg"
                  height={45}
                  width={45}
                  alt="Vercel Logo"
                />
                <span className="text-xl font-bold text-gray-900">
                  Vercel Swag Store
                </span>
              </div>
              {/* Navigation */}
              <nav className="flex gap-6">
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Home
                </Link>
                <Link
                  href="/search"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Search
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <Suspense fallback={<div>Loading footer...</div>}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
