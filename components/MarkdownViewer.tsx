'use client';

import React, { useState } from 'react';
import { AlertCircle, Info, AlertTriangle, ShieldCheck, Check, Copy, Terminal } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
}

function CodeBlock({ code, language = 'text' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-slate-800 bg-[#0a0f1d] overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/60 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono uppercase font-semibold text-slate-300">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-slate-200">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (!content) return <p className="text-slate-500 italic">Sin contenido registrado.</p>;

  const renderBlocks = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Fenced Code Block
      if (line.trim().startsWith('```')) {
        const lang = line.trim().replace('```', '') || 'text';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(<CodeBlock key={`code-${i}`} code={codeLines.join('\n')} language={lang} />);
        i++;
        continue;
      }

      // Alerts
      if (line.trim().startsWith('> [!')) {
        const alertType = line.trim().match(/> \[!(.*?)\]/)?.[1]?.toUpperCase() || 'NOTE';
        const alertLines: string[] = [];
        i++;
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          alertLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }

        let alertColor = 'border-blue-500 bg-blue-950/20 text-blue-200';
        let Icon = Info;
        if (alertType === 'IMPORTANT') {
          alertColor = 'border-emerald-500 bg-emerald-950/20 text-emerald-200';
          Icon = ShieldCheck;
        } else if (alertType === 'WARNING') {
          alertColor = 'border-amber-500 bg-amber-950/20 text-amber-200';
          Icon = AlertTriangle;
        }

        elements.push(
          <div key={`alert-${i}`} className={`my-4 p-4 rounded-xl border-l-4 ${alertColor}`}>
            <div className="flex items-center gap-2 font-semibold text-xs tracking-wider uppercase mb-1">
              <Icon className="w-4 h-4" />
              <span>{alertType}</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{alertLines.join(' ')}</p>
          </div>
        );
        continue;
      }

      // Blockquote
      if (line.trim().startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        elements.push(
          <blockquote key={`quote-${i}`} className="my-3 pl-4 border-l-4 border-slate-700 italic text-slate-400">
            {quoteLines.join(' ')}
          </blockquote>
        );
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-extrabold text-white mt-8 mb-4 pb-2 border-b border-slate-800">
            {line.replace('# ', '')}
          </h1>
        );
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-bold text-slate-100 mt-6 mb-3">
            {line.replace('## ', '')}
          </h2>
        );
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-lg font-semibold text-slate-200 mt-5 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
        i++;
        continue;
      }

      // Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCols = tableLines[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());
          const bodyRows = tableLines.slice(2).map(r => 
            r.split('|').filter(c => c.trim() !== '').map(c => c.trim())
          );

          elements.push(
            <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  <tr>
                    {headerCols.map((h, idx) => (
                      <th key={idx} className="px-4 py-3 border-b border-slate-800">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/30">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Separator
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={`hr-${i}`} className="my-6 border-slate-800" />);
        i++;
        continue;
      }

      // Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const listItems: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          listItems.push(lines[i].trim().substring(2));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="my-3 space-y-1.5 list-disc list-inside text-slate-300 text-sm sm:text-base leading-relaxed pl-2">
            {listItems.map((item, idx) => (
              <li key={idx}>{formatInline(item)}</li>
            ))}
          </ul>
        );
        continue;
      }

      // Paragraph
      if (line.trim().length > 0) {
        elements.push(
          <p key={`p-${i}`} className="my-2.5 text-slate-300 text-sm sm:text-base leading-relaxed">
            {formatInline(line)}
          </p>
        );
      }

      i++;
    }

    return elements;
  };

  const formatInline = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800 text-blue-300 font-mono text-xs font-medium border border-slate-700">
            {part.slice(1, -1)}
          </code>
        );
      }
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return <strong key={bIdx} className="font-semibold text-white">{bPart.slice(2, -2)}</strong>;
        }
        return bPart;
      });
    });
  };

  return <div className="space-y-1">{renderBlocks()}</div>;
}

