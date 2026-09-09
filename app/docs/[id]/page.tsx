'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import MarkdownViewer from '@/components/MarkdownViewer';
import HistoryModal from '@/components/HistoryModal';
import { 
  ArrowLeft, 
  Edit3, 
  History, 
  Trash2, 
  GitCommit, 
  Calendar, 
  User as UserIcon, 
  Tag, 
  Share2,
  Check,
  TrendingUp
} from 'lucide-react';

export default function InmoDocDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { docs, deleteDocument } = useData();
  const { canEdit, isAdmin } = useAuth();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const doc = docs.find((d) => d.id === id);

  if (!doc) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-slate-800 bg-slate-900/40 text-center space-y-4">
        <h1 className="text-xl font-bold text-white">Informe No Encontrado</h1>
        <p className="text-xs text-slate-400">
          El informe solicitado no existe o fue retirado del repositorio.
        </p>
        <Link
          href="/docs"
          className="inline-block px-4 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs"
        >
          Volver a la Central de Información
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar "${doc.title}"? Esta acción no se puede deshacer.`)) {
      deleteDocument(doc.id);
      router.push('/docs');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const latestVersion = doc.versions[doc.versions.length - 1];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Informes</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Historial ({doc.versions.length} commits)</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Compartir</span>
              </>
            )}
          </button>

          {canEdit && (
            <Link
              href={`/docs/${doc.id}/edit`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Informe</span>
            </Link>
          )}

          {isAdmin && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
              title="Eliminar informe"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {doc.category}
          </span>
          <span className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800">
            <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
            Versión v{doc.currentVersion}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          {doc.title}
        </h1>

        <p className="text-base text-slate-300 leading-relaxed font-normal">
          {doc.description}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              Tasador / Autor: <strong className="text-slate-200">{doc.authorName}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Última revisión: <strong className="text-slate-200">{doc.updatedAt}</strong>
            </span>
          </div>

          {latestVersion && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-[11px] text-slate-300">
              <GitCommit className="w-3 h-3 text-indigo-400" />
              <span className="truncate max-w-xs">{latestVersion.commitMessage}</span>
            </div>
          )}
        </div>

        {doc.tags && doc.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {doc.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800"
              >
                <Tag className="w-3 h-3 text-slate-500" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <article className="p-6 sm:p-10 rounded-3xl border border-slate-800 bg-[#0d131f] shadow-2xl">
        <MarkdownViewer content={doc.content} />
      </article>

      {/* Cross link to the predictor */}
      <div className="p-5 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/20 to-emerald-950/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
        <div>
          <p className="font-bold text-white text-sm">¿Deseas contrastar esta información con el modelo en vivo?</p>
          <p className="text-slate-400 mt-0.5">
            Prueba la calculadora de tasación ingresando metros cuadrados, número de recámaras y zona.
          </p>
        </div>
        <Link
          href="/predictor"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shrink-0 transition"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Calcular en el Predictor</span>
        </Link>
      </div>

      <HistoryModal
        doc={doc}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
}

