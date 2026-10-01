import JSZip from 'jszip';

const DB_NAME = 'portfolio-sandbox';
const MAX_ZIP_MB = 80;

export interface SandboxProject {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  fileCount: number;
  size: number;
}

const MIME: Record<string, string> = {
  html: 'text/html; charset=utf-8', htm: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8', json: 'application/json; charset=utf-8',
  map: 'application/json', txt: 'text/plain; charset=utf-8', csv: 'text/csv; charset=utf-8',
  svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', webp: 'image/webp', ico: 'image/x-icon', avif: 'image/avif',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf',
  mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg', wav: 'audio/wav',
  wasm: 'application/wasm', pdf: 'application/pdf', xml: 'application/xml',
};
const mimeOf = (p: string) => MIME[p.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore('projects', { keyPath: 'id' });
      db.createObjectStore('files'); // clave: `${id}/${ruta}`
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const done = (tx: IDBTransaction) =>
  new Promise<void>((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error);
  });

export async function listProjects(): Promise<SandboxProject[]> {
  const db = await openDB();
  const req = db.transaction('projects').objectStore('projects').getAll();
  return new Promise((res, rej) => {
    req.onsuccess = () => res((req.result as SandboxProject[]).sort((a, b) => b.createdAt - a.createdAt));
    req.onerror = () => rej(req.error);
  });
}

export async function deleteProject(id: string) {
  const db = await openDB();
  const tx = db.transaction(['projects', 'files'], 'readwrite');
  tx.objectStore('projects').delete(id);
  tx.objectStore('files').delete(IDBKeyRange.bound(`${id}/`, `${id}/\uffff`));
  await done(tx);
}

export async function importZip(file: File, name: string, description: string): Promise<SandboxProject> {
  if (file.size > MAX_ZIP_MB * 1024 * 1024) throw new Error(`El ZIP supera ${MAX_ZIP_MB} MB.`);
  const zip = await JSZip.loadAsync(file);
  const paths = Object.keys(zip.files).filter(
    (p) => !zip.files[p].dir && !p.startsWith('__MACOSX/') && !p.endsWith('.DS_Store') && !p.includes('node_modules/')
  );

  // Carpeta raíz = la del index.html menos profundo (soporta ZIPs con carpeta contenedora, dist/, build/, out/)
  const indexes = paths.filter((p) => /(^|\/)index\.html$/i.test(p)).sort((a, b) => a.split('/').length - b.split('/').length);
  if (!indexes.length) {
    const pkg = paths.find((p) => /(^|\/)package\.json$/.test(p));
    const py = paths.some((p) => /\.py$|requirements\.txt$/.test(p));
    throw new Error(
      pkg
        ? 'Este ZIP es código fuente (tiene package.json pero no index.html). Ejecuta "npm run build" y sube la carpeta compilada (dist, build u out).'
        : py
        ? 'Los proyectos con backend (Python, Node, etc.) no se pueden ejecutar aquí. Solo se admiten sitios estáticos con index.html.'
        : 'No se encontró un index.html dentro del ZIP.'
    );
  }
  const prefix = indexes[0].slice(0, indexes[0].length - 'index.html'.length);
  const selected = paths.filter((p) => p.startsWith(prefix));

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const entries: [string, { blob: Blob; type: string }][] = [];
  let size = 0;
  for (const p of selected) {
    const rel = p.slice(prefix.length);
    const type = mimeOf(rel);
    const data = await zip.file(p)!.async('arraybuffer');
    size += data.byteLength;
    entries.push([`${id}/${rel}`, { blob: new Blob([data], { type }), type }]);
  }

  const project: SandboxProject = { id, name, description, createdAt: Date.now(), fileCount: entries.length, size };
  const db = await openDB();
  const tx = db.transaction(['projects', 'files'], 'readwrite');
  tx.objectStore('projects').put(project);
  entries.forEach(([k, v]) => tx.objectStore('files').put(v, k));
  await done(tx);
  return project;
}

let swReady: Promise<ServiceWorkerRegistration> | null = null;
export function registerSandbox() {
  if (!swReady) {
    if (!('serviceWorker' in navigator)) return Promise.reject(new Error('Tu navegador no soporta Service Workers.'));
    swReady = navigator.serviceWorker
      .register('/sandbox/sw.js', { scope: '/sandbox/' })
      .then(async (reg) => {
        const sw = reg.installing || reg.waiting || reg.active;
        if (sw && sw.state !== 'activated') {
          await new Promise<void>((resolve) => {
            sw.addEventListener('statechange', () => {
              if (sw.state === 'activated' || sw.state === 'redundant') resolve();
            });
          });
        }
        return reg;
      })
      .catch((err) => {
        swReady = null; // permite reintentar si falló
        throw err;
      });
  }
  return swReady;
}