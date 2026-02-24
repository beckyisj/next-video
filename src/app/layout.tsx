import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Video — YouTube Producer",
  description:
    "Find your next video idea backed by data. Discover what's working for channels one step ahead of yours.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Next Video — YouTube Producer",
    description:
      "Find your next video idea backed by data. Discover what's working for channels one step ahead of yours.",
    url: "https://nextvideo.youtubeproducer.app",
    siteName: "YouTube Producer",
    images: [
      {
        url: "https://nextvideo.youtubeproducer.app/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Video — YouTube Producer",
    description:
      "Find your next video idea backed by data. Discover what's working for channels one step ahead of yours.",
    images: ["https://nextvideo.youtubeproducer.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-75ZD55B9SQ" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-75ZD55B9SQ');
            `,
          }}
        />
      </head>
      <body
        className={`${manrope.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <SubscriptionProvider>
          <div className="flex-1">
          {children}
          </div>
          <footer className="py-6 border-t border-foreground/10">
            <div className="flex flex-col items-center gap-2 text-xs text-foreground/40">
              <p>
                A{" "}
                <a href="https://youtubeproducer.app" className="text-foreground/60 hover:text-foreground/80 transition-colors">
                  YouTube Producer
                </a>
                {" "}tool by{" "}
                <a href="https://beckyisj.substack.com/" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground/80 transition-colors">
                  Becky Isjwara
                </a>
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <a href="https://beckyisj.substack.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground/70 transition-colors">Substack</a>
                <a href="https://www.linkedin.com/in/beckyisj/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground/70 transition-colors">LinkedIn</a>
                <a href="https://go.beckyisj.com/workwithme" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground/80 font-medium transition-colors">Work with me</a>
                <a href="https://go.beckyisj.com/30min" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground/80 font-medium transition-colors">Book a call</a>
                <a href="https://checkout.beckyisj.com/b/fZu28rbL49uNasD1tReAg00" target="_blank" rel="noopener noreferrer" className="hover:text-foreground/70 transition-colors inline-flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                    <line x1="6" y1="1" x2="6" y2="4" />
                    <line x1="10" y1="1" x2="10" y2="4" />
                    <line x1="14" y1="1" x2="14" y2="4" />
                  </svg>
                  Tip jar
                </a>
              </div>
            </div>
          </footer>
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
