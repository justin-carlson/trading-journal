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

import Link from "next/link";
import AccountSelector from "@/components/AccountSelector";
import ImportForm from "@/components/ImportForm";
import NavLinks from "@/components/NavLinks";
import SettingsLink from "@/components/SettingsLink";

export const metadata: Metadata = {
  title: "Trading Journal",
  description: "Personal, local-first trading journal",
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
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var theme=localStorage.getItem("theme");document.documentElement.dataset.theme=theme==="light"?"light":"dark"}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-[var(--border)] px-5 py-3 flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">
            Trading&nbsp;Journal
          </Link>
          <NavLinks />
          <div className="ml-auto flex items-start gap-3">
            <AccountSelector />
            <ImportForm />
            <SettingsLink />
          </div>
        </header>
        <main className="flex-1 px-5 py-6">{children}</main>
      </body>
    </html>
  );
}
