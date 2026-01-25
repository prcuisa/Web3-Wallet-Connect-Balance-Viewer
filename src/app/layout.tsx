import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web3 Wallet Connect - Blockchain Wallet Interface",
  description: "Connect your MetaMask wallet and view your blockchain balances. Support for ETH and ERC-20 tokens.",
  keywords: ["Web3", "Wallet", "Blockchain", "MetaMask", "Ethereum", "DeFi", "Crypto"],
  authors: [{ name: "Web3 Developer" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Web3 Wallet Connect",
    description: "Connect your MetaMask wallet and view blockchain balances",
    url: "https://chat.z.ai",
    siteName: "Web3 Wallet",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web3 Wallet Connect",
    description: "Connect your MetaMask wallet and view blockchain balances",
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
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
