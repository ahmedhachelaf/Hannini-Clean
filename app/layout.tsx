import type { Metadata, Viewport } from "next";
import { getAppBaseUrl } from "@/lib/app-origin";
import { APP_BUILD_ID, APP_VERSION } from "@/lib/build-info";
import "./globals.css";

const appUrl = getAppBaseUrl();

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("CRITICAL: SUPABASE_URL missing");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("CRITICAL: SERVICE_ROLE_KEY missing");
}

export const metadata: Metadata = {
  title: "Hannini | هَنّيني",
  description: "Hannini is a clean bilingual marketplace MVP for booking trusted home-service providers in Algeria.",
  applicationName: "Hannini",
  metadataBase: appUrl ? new URL(appUrl) : undefined,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hannini",
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
      <body
        data-app-version={APP_VERSION}
        data-build-id={APP_BUILD_ID}
        className="bg-[var(--bg)] text-[var(--ink)] antialiased"
      >
        {children}
      </body>
    </html>
  );
}
