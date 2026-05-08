self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open("app-cache-v1").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./app.js",
        "./data.js",
        "./manifest.json",
      ]);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    // Busca cambios de GitLab
    fetch(event.request).catch(() => {
      // Si no hay internet, caché
      return caches.match(event.request);
    }),
  );
});
