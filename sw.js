const CACHE = 'bp-v1';

const ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './blood-pressure-guide.html',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // chrome-extension や POST は無視
  if (!event.request.url.startsWith('http') || event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(res => {
        // ネットワーク成功 → キャッシュ更新して返す
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
