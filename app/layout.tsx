import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "next-themes";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

import { UserProvider } from "@/lib/context/user-context";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Info 3112 Project",
  description: "Fanshawe group project",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} min-h-screen flex flex-col antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <Header/>
            <main className="flex flex-col flex-1">{children}</main>
            <Footer/>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
