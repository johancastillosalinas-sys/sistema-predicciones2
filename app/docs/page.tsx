'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { DocCategory } from '@/types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  GitCommit, 
  ArrowRight,
  Tag,
  Building,
  FileText
} from 'lucide-react';

const CATEGORIES: ('ALL' | DocCategory)[] = [
  'ALL',
  'Metodología',
  'Tasación',
  'Estudio de Mercado',
  'Plusvalía',
  'Regulaciones',
];

export default function InmoDocsPage() {
  const { docs } = useData();
  const { canEdit } = useAuth();

  const [selectedCat, setSelectedCat] = useState<'ALL' | DocCategory>('ALL');
  const [search, setSearch] = useState('');

  const filteredDocs = docs.filter((doc) => {
    const matchesCat = selectedCat === 'ALL' || doc.category === selectedCat;
    const cleanSearch = search.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      doc.title.toLowerCase().includes(cleanSearch) ||
      doc.description.toLowerCase().includes(cleanSearch) ||
      doc.tags.some((t) => t.toLowerCase().includes(cleanSearch));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Central de Información & Informes de Tasación
              </h1>
              <p className="text-sm text-slate-400">
                Estudios de mercado, metodologías de valuación y control de versiones con commits
              </p>
            </div>
          </div>
        </div>

        {canEdit ? (
          <Link
            href="/docs/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Informe</span>
          </Link>
        ) : (
          <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-xs text-slate-400 border border-slate-700/60">
            Rol Inversionista: Solo lectura
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCat === cat
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'Todas las Categorías' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, tag o zona..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between p-6 rounded-2xl border border-slate-800 bg-[#0c121e] hover:border-slate-700 transition group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {doc.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-mono text-slate-400">
                    <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
                    v{doc.currentVersion} • {doc.versions.length} commits
                  </span>
                </div>

                <div>
                  <Link
                    href={`/docs/${doc.id}`}
                    className="text-lg font-bold text-white group-hover:text-blue-400 transition line-clamp-2"
                  >
                    {doc.title}
                  </Link>
                  <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-500" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Por: {doc.authorName}</span>
                <Link
                  href={`/docs/${doc.id}`}
                  className="flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 group-hover:translate-x-0.5 transition"
                >
                  <span>Consultar Informe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-slate-800/60 bg-slate-900/20">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No se encontraron informes</h3>
          <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otra categoría o cambiando la búsqueda.</p>
        </div>
      )}
    </div>
  );
}

