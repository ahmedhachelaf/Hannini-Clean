const CACHE_NAME = "hannini-shell-v2";
const OFFLINE_ASSETS = ["/", "/ar", "/fr", "/manifest.webmanifest"];

function getLocaleFallback(pathname) {
  return pathname.startsWith("/fr") ? "/fr" : "/ar";
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok && request.url.startsWith(self.location.origin)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request).then((cached) => cached ?? caches.match(getLocaleFallback(new URL(request.url).pathname)));
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok && request.url.startsWith(self.location.origin)) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const acceptsHtml = event.request.headers.get("accept")?.includes("text/html");

  if (event.request.mode === "navigate" || acceptsHtml) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (!requestUrl.origin.startsWith(self.location.origin)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    cacheFirst(event.request).catch(() => caches.match(getLocaleFallback(requestUrl.pathname))),
  );
});
