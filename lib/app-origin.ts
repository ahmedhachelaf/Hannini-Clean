function normalizeBaseUrl(value: string) {
  return value.startsWith("http") ? value : `https://${value}`;
}

export function getAppBaseUrl() {
  const previewUrl = process.env.VERCEL_URL;
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const vercelEnv = process.env.VERCEL_ENV;

  const selected =
    vercelEnv === "production"
      ? configuredUrl ?? previewUrl ?? productionUrl
      : previewUrl ?? configuredUrl ?? productionUrl;

  return selected ? normalizeBaseUrl(selected) : "https://hannini-clean.vercel.app";
}
