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
  metadataBase: new URL("https://trading-journal.ai"),
  title: "Trading Journal AI",
  description: "Local-first trading journal for review, recaps, charts, and performance analysis.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Trading Journal AI",
    description: "Local-first trading journal for review, recaps, charts, and performance analysis.",
    url: "/",
    siteName: "Trading Journal AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Trading Journal AI preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading Journal AI",
    description: "Local-first trading journal for review, recaps, charts, and performance analysis.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/brand/trading-journal-ai-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/trading-journal-ai-icon.png" }],
  },
};

export default async function RootLayout({
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
        {children}
      </body>
    </html>
  );
}
