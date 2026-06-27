import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { QueryProvider } from "@/components/shared/query-provider";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NexusAI - Platform AI Premium",
    template: "%s | NexusAI",
  },
  description:
    "Platform AI SaaS premium dengan akses ke 100+ model AI terbaru. Chat, Image, Vision, Voice, dan lebih banyak lagi.",
  keywords: [
    "AI",
    "ChatGPT",
    "Claude",
    "Gemini",
    "DeepSeek",
    "OpenRouter",
    "AI Platform",
    "Indonesia",
  ],
  authors: [{ name: "NexusAI Team" }],
  creator: "NexusAI",
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.APP_URL,
    title: "NexusAI - Platform AI Premium",
    description: "Akses 100+ model AI terbaru dalam satu platform",
    siteName: "NexusAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexusAI - Platform AI Premium",
    description: "Akses 100+ model AI terbaru dalam satu platform",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={cn(inter.variable, "font-sans min-h-screen bg-background antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              expand
              closeButton
              toastOptions={{
                duration: 4000,
                classNames: {
                  toast: "!bg-card !border-border !text-foreground",
                  description: "!text-muted-foreground",
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
