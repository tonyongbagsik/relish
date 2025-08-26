const CACHE_NAME = 'staff-consumption-v18';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event)=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(c=>c.addAll(APP_SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', (event)=>{
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

// HTML: network-first; others: cache-first (then stash)
self.addEventListener('fetch', (event)=>{
  const req = event.request;
  if (req.method!=='GET') return;

  const isHTML = req.headers.get('accept')?.includes('text/html');

  if (isHTML){
    event.respondWith(
      fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(req, copy));
        return res;
      }).catch(()=>caches.match(req).then(r=>r || caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      if (cached) return cached;
      return fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(req, copy));
        return res;
      }).catch(()=>caches.match('/index.html'));
    })
  );
});



