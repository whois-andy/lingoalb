const CACHE = 'lingoalb-v1';
const OFFLINE_URL = '/offline';

const STATIC = [
  '/',
  '/offline',
  '/dashboard',
  '/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // API requests: network only, no cache
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ message: 'Nuk ka lidhje interneti.' }), {
          headers: { 'Content-Type': 'application/json' }, status: 503,
        })
      )
    );
    return;
  }

  // Pages: network-first, fallback to cache, then offline page
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(cached => {
          if (cached) return cached;
          if (e.request.headers.get('Accept')?.includes('text/html')) {
            return caches.match(OFFLINE_URL);
          }
        })
      )
  );
});
