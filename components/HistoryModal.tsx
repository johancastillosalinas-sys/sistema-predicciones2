'use client';

import React, { useState } from 'react';
import { DocItem, DocumentVersion } from '@/types';
import { GitCommit, History, X, User as UserIcon } from 'lucide-react';
import MarkdownViewer from './MarkdownViewer';

interface HistoryModalProps {
  doc: DocItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ doc, isOpen, onClose }: HistoryModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion>(
    doc.versions[doc.versions.length - 1] || null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-[#0d131f] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Historial de Revisiones (Commits de Tasación)</h2>
              <p className="text-xs text-slate-400 truncate max-w-md">{doc.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Versions List */}
          <div className="w-full md:w-80 p-4 overflow-y-auto bg-slate-950/40 space-y-2 shrink-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
              Registro de Cambios ({doc.versions.length})
            </p>
            {doc.versions.slice().reverse().map((ver) => {
              const isSelected = selectedVersion?.id === ver.id;
              return (
                <button
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500/60 bg-indigo-500/15 shadow-sm'
                      : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-blue-300">
                      <GitCommit className="w-3 h-3 text-indigo-400" />
                      v{ver.version}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ver.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 line-clamp-2">
                    {ver.commitMessage}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                    <UserIcon className="w-3 h-3 text-slate-500" />
                    <span>{ver.authorName}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#0b101b]">
            {selectedVersion ? (
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                        Versión {selectedVersion.version}
                      </span>
                      <h3 className="text-base font-bold text-white">{selectedVersion.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Commit: <em className="text-slate-300">&quot;{selectedVersion.commitMessage}&quot;</em>
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p className="font-medium text-slate-300">{selectedVersion.authorName}</p>
                    <p className="text-[11px]">{new Date(selectedVersion.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <MarkdownViewer content={selectedVersion.content || doc.content} />
                </div>
              </div>
            ) : (
              <p className="text-slate-500 italic text-center py-12">Selecciona una versión para inspeccionar.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-400">
          <span>Historial inmutable con autoría pericial y sello de tiempo</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

