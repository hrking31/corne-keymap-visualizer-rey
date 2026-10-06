// Subir la versión cada vez que cambie la lista de archivos: así se borra la caché vieja.
const CACHE = "app-cache-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./app.js",
        "./data.js",
        "./teclado.js",
        "./manifest.json",
        "./icon-192.png",
        "./icon-512.png",
      ]);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter((nombre) => nombre !== CACHE)
            .map((nombre) => caches.delete(nombre)),
        ),
      )
      .then(() => clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    // Primero la red, para ver siempre lo último publicado en GitHub Pages
    fetch(event.request).catch(() => {
      // Si no hay internet, caché
      return caches.match(event.request);
    }),
  );
});
