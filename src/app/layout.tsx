import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: {
    default: "Hisheb - Your Financial Compass",
    template: "%s | Hisheb"
  },
  description: "Track your expenses, manage your budget, and achieve financial clarity with Hisheb. The simplest way to manage your daily finances.",
  keywords: ["expense tracker", "budget manager", "finance app", "money management", "hisheb"],
  authors: [{ name: "Hisheb Team" }],
  creator: "Hisheb Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hisheb.ujjal.in",
    title: "Hisheb - Your Financial Compass",
    description: "Track your expenses, manage your budget, and achieve financial clarity.",
    siteName: "Hisheb",
    images: [
      {
        url: "/placeholder.svg", // Use a real OG image if available
        width: 1200,
        height: 630,
        alt: "Hisheb Financial Compass",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hisheb - Your Financial Compass",
    description: "Track your expenses, manage your budget, and achieve financial clarity.",
    images: ["/placeholder.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${jakarta.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
