// Sirve los proyectos subidos (guardados en IndexedDB) bajo /sandbox/<id>/...
const DB_NAME = 'portfolio-sandbox';

const openDB = () =>
  new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });

async function getFile(id, path) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction('files').objectStore('files').get(id + '/' + path);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => e.respondWith(handle(e)));

async function handle(e) {
  const req = e.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return fetch(req);

  let id, path;
  const m = url.pathname.match(/^\/sandbox\/([^/]+)(\/(.*))?$/);
  if (m) {
    if (!m[2]) return Response.redirect(url.pathname + '/' + url.search, 301);
    id = m[1];
    path = m[3] || '';
  } else if (e.clientId) {
    // Rutas absolutas (/assets/app.js) pedidas desde una página del proyecto
    const client = await self.clients.get(e.clientId);
    const cm = client && client.url.match(/\/sandbox\/([^/]+)\//);
    if (!cm) return fetch(req);
    id = cm[1];
    path = url.pathname.slice(1);
  } else {
    return fetch(req);
  }

  try { path = decodeURIComponent(path); } catch {}
  if (path === '' || path.endsWith('/')) path += 'index.html';

  let rec = await getFile(id, path);
  if (!rec) {
    const wantsHtml = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
    if (wantsHtml && !/\.[a-z0-9]+$/i.test(path)) rec = await getFile(id, 'index.html'); // fallback SPA
  }
  if (!rec) return m ? new Response('Archivo no encontrado: ' + path, { status: 404 }) : fetch(req);
  return new Response(rec.blob, { headers: { 'Content-Type': rec.type, 'Cache-Control': 'no-store' } });
}