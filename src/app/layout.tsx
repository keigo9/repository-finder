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
  title: "GitHub Repository Finder",
  description:
    "GitHub APIを使用してリポジトリを検索・詳細表示するウェブアプリケーション",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "GitHub Repository Finder",
    description:
      "GitHub APIを使用してリポジトリを検索・詳細表示するウェブアプリケーション",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    title: "GitHub Repository Finder",
    description:
      "GitHub APIを使用してリポジトリを検索・詳細表示するウェブアプリケーション",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
