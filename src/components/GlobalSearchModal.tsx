import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, ArrowRight, Activity, ShieldCheck, Landmark } from 'lucide-react';
import { NORMATIVE_DOCUMENTS } from '../data/urbanData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tab: string, query?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'Cruces Acumulados YOLOv8', desc: 'Conteo en tiempo real de autos y peatones', tab: 'telemetria', icon: Activity },
    { title: 'Código Urbano: COS y CUS', desc: 'Coeficientes de ocupación y absorción H3', tab: 'normatividad', query: 'COS y CUS', icon: Landmark },
    { title: 'Especificación de Rampas Peatonales', desc: 'Pendientes máximas del 8% y losetas podotáctiles', tab: 'normatividad', query: 'rampas', icon: ShieldCheck },
    { title: 'Matriz de Proyectos y Presupuesto', desc: '$14.5M MXN para infraestructura vial', tab: 'decisiones', icon: BookOpen },
  ];

  const matchedArticles = NORMATIVE_DOCUMENTS.flatMap((doc) =>
    doc.articles
      .filter(
        (art) =>
          query.trim() &&
          (art.article.toLowerCase().includes(query.toLowerCase()) ||
            art.content.toLowerCase().includes(query.toLowerCase()) ||
            art.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())))
      )
      .map((art) => ({ ...art, docTitle: doc.title }))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-rose-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca por concepto: COS, CUS, rampa, semáforo, aforo, velocidad, Escuela Politécnica..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
          {query.trim() ? (
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block mb-2 font-bold">
                Artículos Legales Coincidentes ({matchedArticles.length})
              </span>
              {matchedArticles.length === 0 ? (
                <p className="text-slate-400 py-3 text-center">No se encontraron artículos normativos para "{query}".</p>
              ) : (
                <div className="space-y-2">
                  {matchedArticles.map((art, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        onSelectAction('normatividad', art.article);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-rose-500 cursor-pointer transition flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{art.article}</span>
                          <span className="text-[10px] text-rose-400 font-mono">· {art.docTitle}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{art.content}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block mb-2 font-bold">
                Accesos Directos y Consultas Frecuentes
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickLinks.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        onSelectAction(item.tab, item.query);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-start gap-3"
                    >
                      <div className="p-2 rounded-lg bg-rose-600/10 text-rose-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut notice */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Presiona <strong>ESC</strong> para salir</span>
          <span>Búsqueda Vectorial RAG v2.6 · Jalisco</span>
        </div>
      </div>
    </div>
  );
};
