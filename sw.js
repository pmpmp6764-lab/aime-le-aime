const CACHE = "aime-offline-v1";
const FILES = ["./","index.html","app.js","style.css","hearts.svg","cast/rain.jpg","cast/student.jpg","cast/boss.png","cast/rain.mp4"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
