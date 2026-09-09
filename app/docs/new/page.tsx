'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { DocCategory } from '@/types';
import MarkdownEditor from '@/components/MarkdownEditor';
import { BookOpen, ArrowLeft, Send, AlertCircle, ShieldAlert, GitCommit, Sparkles } from 'lucide-react';

const CATEGORIES: DocCategory[] = [
  'Metodología',
  'Tasación',
  'Estudio de Mercado',
  'Plusvalía',
  'Regulaciones',
];

function NewInmoDocContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createDocument } = useData();
  const { currentUser, canEdit } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocCategory>('Tasación');
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState(
    '# Informe Técnico de Tasación Inmobiliaria\n\nResumen pericial del inmueble y análisis de comparables de mercado...\n\n## 1. Características Técnicas del Inmueble\n\n| Parámetro | Valor Evaluado |\n|---|---|\n| Área Techada | 95 m² |\n| Habitaciones | 3 |\n| Baños | 2 |\n| Zona | Residencial Moderna |\n\n## 2. Resultado de la Estimación Algorítmica\n\n- **Valor Comercial Estimado:** S/. 195,000\n- **Rango de Negociación:** S/. 179,400 - S/. 210,600\n'
  );
  const [commitMessage, setCommitMessage] = useState('Commit inicial: redacción de informe de tasación');
  const [error, setError] = useState<string | null>(null);

  // Check if routed from Predictor with prefilled query parameters
  useEffect(() => {
    const pMetros = searchParams.get('metros');
    const pHabitaciones = searchParams.get('habitaciones');
    const pBanos = searchParams.get('banos');
    const pZona = searchParams.get('zona');
    const pPrecio = searchParams.get('precio');

    if (pMetros && pPrecio) {
      const zonaCapitalized = (pZona || 'Residencial').charAt(0).toUpperCase() + (pZona || 'Residencial').slice(1);
      const precioNum = Number(pPrecio);
      const minNum = Math.round(precioNum * 0.93);
      const maxNum = Math.round(precioNum * 1.07);

      setTitle(`Informe de Tasación: Inmueble de ${pMetros}m² en Zona ${zonaCapitalized}`);
      setDescription(`Ficha técnica pericial derivada del cálculo algorítmico: S/. ${precioNum.toLocaleString('es-PE')} para propiedad de ${pMetros} m².`);
      setCategory('Tasación');
      setTagsInput(`Tasación, Predictor, ${zonaCapitalized}, Algoritmo`);
      setCommitMessage(`Commit inicial: Tasación algorítmica para inmueble de ${pMetros}m²`);

      setContent(`# Informe Técnico de Tasación Inmobiliaria

> [!IMPORTANT]
> Documento generado a partir de la estimación del **Motor Predictor de Precios de Bienes Raíces**.

---

### 1. Ficha Técnica de la Propiedad

| Parámetro Pericial | Detalle Evaluado |
| :--- | :--- |
| **Superficie Techada** | ${pMetros} m² |
| **Habitaciones / Dormitorios** | ${pHabitaciones || '3'} ambientes |
| **Servicios Higiénicos / Baños** | ${pBanos || '2'} completos |
| **Zona / Entorno Urbano** | ${zonaCapitalized} |

---

### 2. Resultados de la Valorización Comercial

- **Precio Estimado de Mercado:** **S/. ${precioNum.toLocaleString('es-PE')}**
- **Banda Mínima de Cierre:** S/. ${minNum.toLocaleString('es-PE')} (-7%)
- **Banda Máxima de Oferta:** S/. ${maxNum.toLocaleString('es-PE')} (+7%)

\`\`\`
Precio_Base_m2 = S/. 1,200 | Factor_Zona = ${zonaCapitalized}
\`\`\`

---

### 3. Conclusiones y Recomendaciones del Tasador

1. El inmueble se sitúa dentro de la mediana de precios observada en los datasets de mercado.
2. Se sugiere ofertar en el rango intermedio con una holgura de negociación del 5%.
`);
    }
  }, [searchParams]);

  if (!canEdit) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-amber-500/30 bg-amber-950/20 text-center space-y-4">
        <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
        <h1 className="text-xl font-bold text-white">Permiso Denegado</h1>
        <p className="text-xs text-slate-300">
          Tu rol actual (<strong>{currentUser.role}</strong>) solo tiene permisos de lectura e inversión.
          Para redactar informes necesitas el rol de <strong>Tasador (Editor)</strong> o <strong>Administrador</strong>.
        </p>
        <Link
          href="/docs"
          className="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
        >
          Volver a la Central de Información
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Por favor ingresa un título para el informe.');
      return;
    }
    if (!content.trim()) {
      setError('El contenido del informe no puede estar vacío.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newDoc = createDocument({
      title: title.trim(),
      description: description.trim() || 'Sin descripción.',
      category,
      tags: tags.length > 0 ? tags : [category],
      content,
      commitMessage: commitMessage.trim() || 'Commit inicial pericial',
      authorId: currentUser.id,
      authorName: currentUser.name,
    });

    router.push(`/docs/${newDoc.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo de Informes</span>
        </Link>
        <span className="text-xs text-slate-400">
          Tasador en turno: <strong className="text-white">{currentUser.name}</strong>
        </span>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-[#0d131f] shadow-2xl">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Publicar Nuevo Informe Técnico de Tasación</h1>
            <p className="text-xs text-slate-400">
              Redacta con Markdown incorporando tablas periciales, datos de cálculo y formula tus conclusiones
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
              Título del Informe Técnico
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej: Estudio de Valuación Comercial: Lote Residencial en San Isidro"
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Categoría Inmobiliaria
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
                Etiquetas / Tags (Separadas por comas)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tasación, Residencial, Metraje, Valuación"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
              placeholder="Síntesis del objetivo y conclusiones del informe de tasación..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Contenido del Informe en Markdown
            </label>
            <MarkdownEditor value={content} onChange={setContent} minHeight="min-h-[380px]" />
          </div>

          {/* Commit Message Box */}
          <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/15">
            <div className="flex items-center gap-2 mb-1.5">
              <GitCommit className="w-4 h-4 text-indigo-400" />
              <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Mensaje de Commit Requerido (Versionado estilo Git)
              </label>
            </div>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit inicial: primera emisión del informe de tasación..."
              className="w-full px-4 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              href="/docs"
              className="px-5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publicar Informe en el CMS</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewInmoDocPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-400 text-sm">Cargando formulario...</div>}>
      <NewInmoDocContent />
    </Suspense>
  );
}
