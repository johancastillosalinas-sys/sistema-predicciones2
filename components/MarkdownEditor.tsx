'use client';

import React, { useState } from 'react';
import MarkdownViewer from './MarkdownViewer';
import { Bold, Italic, Code, Heading1, Heading2, List, Eye, Edit3, Table, Quote } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}

export default function MarkdownEditor({ value, onChange, minHeight = 'min-h-[350px]' }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const insertSnippet = (before: string, after: string = '') => {
    const textarea = document.getElementById('inmo-markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'texto';
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 50);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0b101b] overflow-hidden shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'write' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'preview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vista Previa</span>
          </button>
        </div>

        {activeTab === 'write' && (
          <div className="flex items-center gap-1 flex-wrap text-slate-400">
            <button
              type="button"
              onClick={() => insertSnippet('## ', '')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
              title="Título H2"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('### ', '')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
              title="Subtítulo H3"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <span className="h-4 w-px bg-slate-800 mx-1" />
            <button
              type="button"
              onClick={() => insertSnippet('**', '**')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
              title="Negrita"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('*', '*')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
              title="Cursiva"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('`', '`')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
              title="Código en línea"
            >
              <Code className="w-4 h-4" />
            </button>
            <span className="h-4 w-px bg-slate-800 mx-1" />
            <button
              type="button"
              onClick={() => insertSnippet('\n- ', '')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
              title="Lista de viñetas"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('\n> [!NOTE]\n> ', '')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
              title="Nota de tasación"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('\n| Parámetro | Valor |\n|---|---|\n| Zona | Residencial |\n', '')}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
              title="Insertar Tabla"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        {activeTab === 'write' ? (
          <textarea
            id="inmo-markdown-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Redacta el informe de tasación o metodología usando Markdown..."
            className={`w-full bg-transparent font-mono text-sm leading-relaxed text-slate-200 placeholder-slate-600 focus:outline-none resize-y ${minHeight}`}
            spellCheck={false}
          />
        ) : (
          <div className={`${minHeight} overflow-y-auto px-2`}>
            {value.trim() ? (
              <MarkdownViewer content={value} />
            ) : (
              <p className="text-slate-500 italic py-8 text-center">
                Escribe en el editor para previsualizar el informe aquí.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

