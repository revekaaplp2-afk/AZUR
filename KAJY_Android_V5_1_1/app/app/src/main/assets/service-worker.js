/* KAJY POS — Service Worker offline-first renforcé */
const CACHE_VERSION = 'kajy-shell-v4-offline';
const APP_CACHE = `${CACHE_VERSION}-app`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_PAGE = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#4338ca"><title>KAJY POS — Hors ligne</title><body style="font:16px system-ui;background:#f8fafc;color:#0f172a;padding:2rem;max-width:680px;margin:auto"><h1>KAJY POS est temporairement hors ligne</h1><p>La page de l’application n’a pas encore été mise en cache sur cet appareil.</p><p>Reconnectez-vous une fois, ouvrez KAJY POS, puis réessayez. Les données déjà enregistrées localement restent sur cet appareil.</p><button onclick="location.reload()" style="padding:.7rem 1rem;border:0;border-radius:.6rem;background:#4338ca;color:white">Réessayer</button></body></html>`;
const CORE_ASSETS = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const appCache = await caches.open(APP_CACHE);
    // Précharger la racine / page publiée si le serveur expose index.html.
    for (const asset of CORE_ASSETS.slice(0, 2)) {
      try {
        const response = await fetch(asset, { cache: 'reload' });
        if (response && response.ok) await appCache.put(asset, response.clone());
      } catch (_) { /* le cache de la page est alimenté dès sa première navigation */ }
    }
    const runtime = await caches.open(RUNTIME_CACHE);
    await Promise.all(CORE_ASSETS.slice(2).map(async url => {
      try {
        const response = await fetch(url, { mode: 'no-cors', cache: 'reload' });
        if (response && (response.ok || response.type === 'opaque')) await runtime.put(url, response);
      } catch (_) { /* une dépendance distante absente ne bloque pas le POS */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => !key.startsWith(CACHE_VERSION)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'KAJY_SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'KAJY_CLEAR_RUNTIME_CACHE') {
    event.waitUntil(caches.delete(RUNTIME_CACHE));
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Ne jamais mettre en cache les API, endpoints de synchronisation ou données privées distantes.
  if (url.pathname.includes('/api/') || url.searchParams.has('sync')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(APP_CACHE);
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) await cache.put(request, fresh.clone());
        return fresh;
      } catch (_) {
        const cached = await cache.match(request, { ignoreSearch: true })
          || await cache.match(new URL('./', self.registration.scope).href)
          || await cache.match(new URL('./index.html', self.registration.scope).href);
        if (cached) return cached;
        return new Response(OFFLINE_PAGE, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }, status: 200 });
      }
    })());
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  event.respondWith((async () => {
    const cache = await caches.open(sameOrigin ? APP_CACHE : RUNTIME_CACHE);
    const cached = await cache.match(request, { ignoreSearch: false });
    if (cached) {
      // Stale-while-revalidate : servir immédiatement la copie hors ligne et actualiser en arrière-plan.
      event.waitUntil(fetch(request).then(response => {
        if (response && (response.ok || response.type === 'opaque')) return cache.put(request, response.clone());
      }).catch(() => {}));
      return cached;
    }
    try {
      const response = await fetch(request);
      if (response && (response.ok || response.type === 'opaque')) await cache.put(request, response.clone());
      return response;
    } catch (_) {
      return new Response('', { status: 504, statusText: 'Ressource indisponible hors ligne' });
    }
  })());
});
