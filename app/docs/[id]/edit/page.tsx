'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { DocCategory } from '@/types';
import MarkdownEditor from '@/components/MarkdownEditor';
import { Edit3, ArrowLeft, GitCommit, AlertCircle, ShieldAlert } from 'lucide-react';

const CATEGORIES: DocCategory[] = [
  'Metodología',
  'Tasación',
  'Estudio de Mercado',
  'Plusvalía',
  'Regulaciones',
];

export default function EditInmoDocPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { docs, updateDocument } = useData();
  const { currentUser, canEdit } = useAuth();

  const doc = docs.find((d) => d.id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocCategory>('Tasación');
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (doc) {
      setTitle(doc.title);
      setDescription(doc.description);
      setCategory(doc.category);
      setTagsInput(doc.tags ? doc.tags.join(', ') : '');
      setContent(doc.content);
      setCommitMessage(`Actualización v${doc.currentVersion + 1}: revisión pericial de valores`);
    }
  }, [doc]);

  if (!canEdit) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-amber-500/30 bg-amber-950/20 text-center space-y-4">
        <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
        <h1 className="text-xl font-bold text-white">Permiso Denegado</h1>
        <p className="text-xs text-slate-300">
          Tu rol actual (<strong>{currentUser.role}</strong>) no tiene permisos de edición en los informes periciales.
        </p>
        <Link
          href={`/docs/${id}`}
          className="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
        >
          Volver a la Lectura
        </Link>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-slate-800 bg-slate-900/40 text-center space-y-4">
        <h1 className="text-xl font-bold text-white">Informe No Encontrado</h1>
        <Link
          href="/docs"
          className="inline-block px-4 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs"
        >
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('El título no puede estar vacío.');
      return;
    }
    if (!content.trim()) {
      setError('El contenido no puede estar vacío.');
      return;
    }
    if (!commitMessage.trim()) {
      setError('Debes ingresar un mensaje de commit describiendo los cambios periciales.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updated = updateDocument(
      doc.id,
      {
        title: title.trim(),
        description: description.trim(),
        category,
        tags,
        content,
        commitMessage: commitMessage.trim(),
        editorId: currentUser.id,
        editorName: currentUser.name,
      }
    );

    if (updated) {
      router.push(`/docs/${doc.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <Link
          href={`/docs/${doc.id}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancelar y volver al informe</span>
        </Link>
        <span className="text-xs font-mono text-indigo-400">
          Guardando versión v{doc.currentVersion + 1}
        </span>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-[#0d131f] shadow-2xl">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Editar Informe de Tasación</h1>
            <p className="text-xs text-slate-400">
              Modifica los valores y registra un commit inmutable con tus observaciones periciales
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Título del Informe
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-base font-semibold text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocCategory)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Etiquetas / Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Resumen Ejecutivo
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Contenido del Informe en Markdown
            </label>
            <MarkdownEditor value={content} onChange={setContent} minHeight="min-h-[400px]" />
          </div>

          {/* Commit Message Box */}
          <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-2">
            <div className="flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-indigo-400" />
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Mensaje de Commit Requerido (Estilo GitHub)
              </label>
            </div>
            <input
              type="text"
              required
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="ej: Actualizados coeficientes de depreciación física y precios de comparables"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400">
              Quedará registrado que <strong>{currentUser.name}</strong> emitió esta nueva versión pericial.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              href={`/docs/${doc.id}`}
              className="px-5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition cursor-pointer"
            >
              <GitCommit className="w-4 h-4" />
              <span>Guardar Commit y Publicar v{doc.currentVersion + 1}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

