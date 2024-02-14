const staticCacheName = "s-app-v1";
const dynamicCacheName = "d-app-v1";

const assetUrls = [
  "/",
  "index.html",
  "/js/app.js",
  "/js/ui.js",
  "/js/materialize.min.js",
  "/css/styles.css",
  "/css/materialize.min.css",
  "/img/pic1.png",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://fonts.gstatic.com/s/materialicons/v141/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
];

// install sw
self.addEventListener("install", async (event) => {
  //console.log("install");
  const cache = await caches.open(staticCacheName);
  console.log("caching shell assets");
  await cache.addAll(assetUrls);
});

// activate events
self.addEventListener("activate", async (event) => {
  //console.log("activate");
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name !== staticCacheName)
      .filter((name) => name !== dynamicCacheName)
      .map((name) => caches.delete(name))
  );
});

// fetch events
self.addEventListener("fetch", (event) => {
  //console.log("fetch event");
  const { request } = event;

  const url = new URL(request.url);
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached ?? (await fetch(request));
}

async function networkFirst(request) {
  const cache = await caches.open(dynamicCacheName);
  try {
    const response = await fetch(request);
    await cache.put(request, response.clone());
    return response;
  } catch (e) {
    // const cached = await cache.match(request);
    // return cached ?? (await caches.match("/offline.html"));
  }
}
