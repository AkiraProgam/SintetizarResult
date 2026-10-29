/* Service worker: guarda o app no aparelho para funcionar offline.
   Ao publicar uma versão nova do index.html, aumente o número em VERSION. */
const VERSION = 'v3';
const CACHE = 'sintetizador-exames-' + VERSION;
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('sintetizador-exames-') && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

/* Abre rápido pelo cache e atualiza em segundo plano (a versão nova aparece na próxima abertura). */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((emCache) => {
      const rede = fetch(req).then((resp) => {
        if (resp && resp.ok) { const copia = resp.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
        return resp;
      }).catch(() => emCache || (req.mode === 'navigate' ? caches.match('./index.html') : undefined));
      return emCache || rede;
    })
  );
});
