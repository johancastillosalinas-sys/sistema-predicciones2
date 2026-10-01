'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, ExternalLink, X, Loader2, Package, ArrowRight, FileArchive } from 'lucide-react';
import { listProjects, importZip, deleteProject, registerSandbox, SandboxProject } from '@/lib/sandboxStore';

export default function UploadedProjects({ query = '' }: { query?: string }) {
  const [items, setItems] = useState<SandboxProject[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const [openProj, setOpenProj] = useState<SandboxProject | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const refresh = () => listProjects().then(setItems).catch(() => {});

  useEffect(() => {
    listProjects().then(setItems).catch(() => {});
    registerSandbox().catch(() => {});
  }, []);

  useEffect(() => {
    if (!openProj) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenProj(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openProj]);

  async function handleFile(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.zip')) return setError('Selecciona un archivo .zip');
    setBusy(true);
    setError('');
    try {
      const name = file.name.replace(/\.zip$/i, '').replace(/[-_]+/g, ' ');
      await registerSandbox();
      await importZip(file, name, 'Proyecto subido por el usuario');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo procesar el ZIP');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  async function open(p: SandboxProject) {
    await registerSandbox().catch(() => {});
    setOpenProj(p);
  }

  async function remove(p: SandboxProject) {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    await deleteProject(p.id);
    refresh();
  }

  const q = query.trim().toLowerCase();
  const visible = items.filter((p) => !q || p.name.toLowerCase().includes(q));
  const src = openProj ? `/sandbox/${openProj.id}/` : '';

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white">Mis proyectos subidos</h2>
          <p className="text-xs text-slate-400 mt-1">Sitios estáticos guardados en este navegador.</p>
        </div>
        <span className="text-xs font-semibold text-slate-400 bg-slate-800/60 border border-slate-700/60 rounded-full px-3 py-1">
          {items.length} {items.length === 1 ? 'proyecto' : 'proyectos'}
        </span>
      </div>

      {/* Franja de subida */}
      <div
        onClick={() => !busy && input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        className={`flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
          drag ? 'border-blue-400 bg-blue-500/10' : 'border-slate-700 bg-[#0D1322]/60 hover:border-blue-500/50'
        }`}
      >
        <input ref={input} type="file" accept=".zip" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
        <div className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/20 text-blue-400 shrink-0">
          {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileArchive className="w-6 h-6" />}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-white">{busy ? 'Procesando ZIP…' : 'Arrastra un .zip aquí o haz clic para seleccionarlo'}</p>
          <p className="text-xs text-slate-400 mt-1">
            Debe contener un <code className="text-blue-300">index.html</code> (o el build <code className="text-blue-300">dist / build / out</code>). Máx. 80 MB.
          </p>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition rounded-lg px-4 py-2 shrink-0">
          <Upload className="w-4 h-4" /> Subir proyecto
        </span>
      </div>

      {/* Lista */}
      {visible.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">
          {items.length === 0 ? 'Aún no has subido proyectos.' : 'Ningún proyecto subido coincide con la búsqueda.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {visible.map((p) => (
            <div key={p.id} onClick={() => open(p)} className="group h-full p-5 rounded-2xl border bg-[#0D1322]/80 border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer transition-all flex flex-col">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl border bg-blue-500/10 border-blue-500/20 text-blue-400"><Package className="w-5 h-5" /></div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">Subido</span>
                  <button onClick={(e) => { e.stopPropagation(); remove(p); }} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-white capitalize mt-4 group-hover:text-blue-400 transition">{p.name}</h3>
              <p className="text-xs text-slate-400 mt-1.5 flex-1">
                {p.fileCount} archivos · {(p.size / 1024 / 1024).toFixed(2)} MB · {new Date(p.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-blue-400 font-semibold">Abrir proyecto</span>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visor */}
      {openProj && (
        <div className="fixed inset-0 z-50 bg-[#070A12] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0D1322]">
            <div className="flex items-center gap-3 min-w-0">
              <Package className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-sm font-semibold text-white capitalize truncate">{openProj.name}</span>
              <span className="hidden sm:inline text-[11px] text-slate-500">Esc para cerrar</span>
            </div>
            <div className="flex items-center gap-2">
              <a href={src} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800">
                <ExternalLink className="w-3.5 h-3.5" /> Nueva pestaña
              </a>
              <button onClick={() => setOpenProj(null)} className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800" title="Cerrar"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <iframe key={openProj.id} src={src} className="flex-1 w-full bg-white" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads" />
        </div>
      )}
    </section>
  );
}