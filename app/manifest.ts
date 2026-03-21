import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Henini",
    short_name: "Henini",
    description: "Trusted home-services marketplace for Algeria with Arabic-first booking and WhatsApp confirmation.",
    lang: "ar",
    start_url: "/ar",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#111111",
    categories: ["business", "lifestyle", "productivity"],
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa/maskable-icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/pwa/maskable-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/brand/henini-mark.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        form_factor: "wide",
      },
    ],
  };
}
