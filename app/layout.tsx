import type { Metadata, Viewport } from "next";
import "./globals.css";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  "https://hannini-clean.vercel.app";

function normalizeBaseUrl(value: string) {
  return value.startsWith("http") ? value : `https://${value}`;
}

export const metadata: Metadata = {
  title: "Henini | هنيني",
  description: "Henini is a clean bilingual marketplace MVP for booking trusted home-service providers in Algeria.",
  applicationName: "Henini",
  metadataBase: appUrl ? new URL(normalizeBaseUrl(appUrl)) : undefined,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Henini",
  },
  icons: {
    icon: [
      { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/pwa/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className="bg-[var(--bg)] text-[var(--ink)] antialiased">{children}</body>
    </html>
  );
}
