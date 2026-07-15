import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Filipe Sousa — Senior Full-Stack Engineer",
  description:
    "Senior full-stack engineer. React Native + TypeScript on the front, Ruby on Rails + GraphQL on the back. Portfolio, experience, and live engineering metrics.",
  metadataBase: new URL("https://filipeperdigaosousa.github.io"),
  openGraph: {
    title: "Filipe Sousa — Senior Full-Stack Engineer",
    description:
      "React Native + Ruby on Rails. 10y shipping production apps. Live engineering metrics.",
    url: "https://filipeperdigaosousa.github.io",
    siteName: "filipesousa",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-on-surface bg-background">
        <TopNav />
        <main className="flex-1">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
