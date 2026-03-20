import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Henini | هنيني",
  description:
    "Henini is a clean bilingual marketplace MVP for booking trusted home-service providers in Oran.",
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
