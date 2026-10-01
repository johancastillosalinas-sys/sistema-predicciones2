'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, ExternalLink, X, Loader2, Package, ArrowRight } from 'lucide-react';
import { listProjects, importZip, deleteProject, registerSandbox, SandboxProject } from '@/lib/sandboxStore';

export default function UploadedProjects() {
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

  const src = openProj ? `/sandbox/${openProj.id}/` : '';

  return (
    <>
      {/* Tarjeta de subida */}
      <div
        onClick={() => !busy && input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        className={`p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 min-h-[200px] ${
          drag ? 'border-blue-400 bg-blue-500/10' : 'border-slate-700 bg-[#0D1322]/60 hover:border-blue-500/50'
        }`}
      >
        <input ref={input} type="file" accept=".zip" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
        <div className="p-3 rounded-2xl border bg-blue-500/10 border-blue-500/20 text-blue-400">
          {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
        </div>
        <h3 className="text-lg font-bold text-white">{busy ? 'Procesando ZIP…' : 'Subir proyecto (.zip)'}</h3>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Arrastra aquí un sitio estático con <code className="text-blue-300">index.html</code> (o el build <code className="text-blue-300">dist / build / out</code>) y se abrirá dentro del contenedor.
        </p>
        {error && <p className="text-xs text-red-400 max-w-xs">{error}</p>}
      </div>

      {/* Proyectos subidos */}
      {items.map((p) => (
        <div key={p.id} onClick={() => open(p)} className="group p-6 rounded-3xl border bg-[#0D1322]/80 border-slate-800 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl border bg-blue-500/10 border-blue-500/20 text-blue-400"><Package className="w-6 h-6" /></div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">Subido</span>
                <button onClick={(e) => { e.stopPropagation(); remove(p); }} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white capitalize group-hover:text-blue-400 transition">{p.name}</h3>
              <p className="text-xs text-slate-400 mt-2">{p.fileCount} archivos · {(p.size / 1024 / 1024).toFixed(2)} MB · {new Date(p.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-blue-400 font-semibold">Abrir proyecto</span>
            <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      ))}

      {/* Visor dentro del contenedor */}
      {openProj && (
        <div className="fixed inset-0 z-50 bg-[#070A12] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0D1322]">
            <span className="text-sm font-semibold text-white capitalize">{openProj.name}</span>
            <div className="flex items-center gap-2">
              <a href={src} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700">
                <ExternalLink className="w-3.5 h-3.5" /> Nueva pestaña
              </a>
              <button onClick={() => setOpenProj(null)} className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <iframe key={openProj.id} src={src} className="flex-1 w-full bg-white" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads" />
        </div>
      )}
    </>
  );
}