import type { MetadataRoute } from "next";
import { getProviders } from "@/lib/repository";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hannini-clean.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const providers = await getProviders();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/ar`,
      lastModified: new Date(),
      alternates: { languages: { fr: `${BASE_URL}/fr` } },
    },
    {
      url: `${BASE_URL}/ar/providers`,
      lastModified: new Date(),
      alternates: { languages: { fr: `${BASE_URL}/fr/providers` } },
    },
    {
      url: `${BASE_URL}/ar/businesses`,
      lastModified: new Date(),
      alternates: { languages: { fr: `${BASE_URL}/fr/businesses` } },
    },
    {
      url: `${BASE_URL}/ar/join`,
      lastModified: new Date(),
      alternates: { languages: { fr: `${BASE_URL}/fr/join` } },
    },
    {
      url: `${BASE_URL}/ar/safety`,
      lastModified: new Date(),
      alternates: { languages: { fr: `${BASE_URL}/fr/safety` } },
    },
    {
      url: `${BASE_URL}/ar/conduct`,
      lastModified: new Date(),
      alternates: { languages: { fr: `${BASE_URL}/fr/conduct` } },
    },
    {
      url: `${BASE_URL}/ar/support`,
      lastModified: new Date(),
      alternates: { languages: { fr: `${BASE_URL}/fr/support` } },
    },
  ];

  const providerRoutes: MetadataRoute.Sitemap = providers.map((provider) => ({
    url: `${BASE_URL}/ar/providers/${provider.slug}`,
    lastModified: new Date(),
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr/providers/${provider.slug}`,
      },
    },
  }));

  return [...staticRoutes, ...providerRoutes];
}
