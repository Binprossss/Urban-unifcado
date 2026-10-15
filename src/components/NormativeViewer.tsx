import React, { useState } from 'react';
import { NORMATIVE_DOCUMENTS, NormativeDocument } from '../data/urbanData';
import { BookOpen, Search, FileText, CheckCircle2, Copy, Sparkles, Scale, ExternalLink, Download } from 'lucide-react';

interface NormativeViewerProps {
  onAskAiWithArticle?: (articleText: string) => void;
}

export const NormativeViewer: React.FC<NormativeViewerProps> = ({ onAskAiWithArticle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredArticles = NORMATIVE_DOCUMENTS.flatMap((doc) => {
    if (selectedDocId !== 'all' && doc.id !== selectedDocId) return [];

    return doc.articles
      .filter((art) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          art.article.toLowerCase().includes(q) ||
          art.chapter.toLowerCase().includes(q) ||
          art.content.toLowerCase().includes(q) ||
          art.technicalRule.toLowerCase().includes(q) ||
          art.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .map((art) => ({ ...art, docTitle: doc.title, docScope: doc.scope, docId: doc.id }));
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-sm">
              <Scale className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-white uppercase tracking-tight">
              Normativa Urbana y Base Vectorizada (RAG)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Instrumentos legales y reglamentos técnicos vectorizados para consulta pericial, sustentación de proyectos y cálculo de coeficientes de ocupación y utilización de suelo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-rose-500" />
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Corpus Oficial</span>
              <span className="text-xs font-bold text-white">4 Reglamentos Indexados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Pills & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por artículo, concepto técnico (ej. rampas, COS, CUS, velocidad, banquetas, meseta)..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        {/* Document Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <button
            onClick={() => setSelectedDocId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedDocId === 'all'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Todos los Códigos
          </button>
          {NORMATIVE_DOCUMENTS.map((doc) => {
            const isSelected = selectedDocId === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {doc.shortTitle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {NORMATIVE_DOCUMENTS.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDocId(doc.id)}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              selectedDocId === doc.id
                ? 'bg-slate-800/90 border-rose-500 shadow-md'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40">
                  {doc.scope}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{doc.category}</span>
              </div>
              <h4 className="text-xs font-bold text-white leading-snug">{doc.title}</h4>
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{doc.description}</p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{doc.articlesCount} Artículos</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Vectorizado
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filtered Articles Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <span>{filteredArticles.length} Artículos encontrados</span>
          <span>Base sincronizada con PIMUS Jalisco 2026</span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
            No se encontraron artículos con el término <strong>"{searchQuery}"</strong>. Intenta buscar "rampas", "COS", "CUS", "velocidad" o "banquetas".
          </div>
        ) : (
          filteredArticles.map((art, idx) => {
            const copyKey = `${art.docId}-${art.article}`;
            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider block">
                      {art.docTitle} · {art.docScope}
                    </span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                      <span>{art.article}</span>
                      <span className="text-slate-400 text-xs font-normal">· {art.chapter}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(copyKey, `${art.docTitle}, ${art.article}: "${art.content}"`)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>{copiedId === copyKey ? '¡Copiado!' : 'Citar'}</span>
                    </button>
                    {onAskAiWithArticle && (
                      <button
                        onClick={() =>
                          onAskAiWithArticle(
                            `Explícame la aplicación práctica y criterios de inspección del ${art.article} de "${art.docTitle}": ${art.content}`
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Consultar con OLMOS</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 font-serif">
                  "{art.content}"
                </p>

                {/* Technical Rule Callout */}
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 flex items-start gap-2.5">
                  <Scale className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-rose-300 uppercase tracking-widest block">
                      Criterio Técnico Operativo
                    </span>
                    <p className="text-xs text-rose-100 font-medium mt-0.5">{art.technicalRule}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-slate-400">
                  <span className="font-mono text-slate-500">Etiquetas:</span>
                  {art.tags.map((t, i) => (
                    <span key={i} className="text-slate-300 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
