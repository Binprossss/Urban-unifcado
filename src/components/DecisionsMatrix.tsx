import React, { useState } from 'react';
import { INITIAL_PROJECTS, UrbanProject } from '../data/urbanData';
import { CheckCircle2, Clock, AlertCircle, Plus, DollarSign, Users, Award, ShieldAlert, ArrowUpRight, Filter } from 'lucide-react';

interface DecisionsMatrixProps {
  onOpenAiWithContext?: (query: string) => void;
}

export const DecisionsMatrix: React.FC<DecisionsMatrixProps> = ({ onOpenAiWithContext }) => {
  const [projects, setProjects] = useState<UrbanProject[]>(INITIAL_PROJECTS);
  const [filter, setFilter] = useState<'all' | 'urgente' | 'autorizada'>('all');
  const [totalBudget, setTotalBudget] = useState<number>(14500000);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCost, setNewCost] = useState(1200000);
  const [newType, setNewType] = useState<UrbanProject['type']>('Cruce Seguro');

  // Authorize project handler
  const handleAuthorize = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          // If was not authorized, deduct budget
          if (p.status !== 'Autorizada') {
            setTotalBudget((b) => Math.max(0, b - p.estimatedCost));
          }
          return { ...p, status: 'Autorizada' };
        }
        return p;
      })
    );
  };

  const handleReview = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'En Revisión' } : p))
    );
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation.trim()) return;

    const newProj: UrbanProject = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim(),
      location: newLocation.trim(),
      type: newType,
      estimatedCost: Number(newCost),
      priorityScore: 8.5,
      priorityLevel: 'Alta',
      pedestrianBenefit: 6500,
      status: 'Pendiente',
      regulatoryBasis: 'Código Urbano Jalisco Art. 45 + Manual SEDATU',
      description: 'Propuesta técnica ingresada a través de la mesa pericial UrbanBuild.',
    };

    setProjects([newProj, ...projects]);
    setShowNewModal(false);
    setNewTitle('');
    setNewLocation('');
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === 'urgente') return p.priorityLevel === 'Crítica';
    if (filter === 'autorizada') return p.status === 'Autorizada';
    return true;
  });

  const authorizedCount = projects.filter((p) => p.status === 'Autorizada').length;
  const pendingCount = projects.filter((p) => p.status === 'Pendiente').length;
  const totalBeneficiaries = projects.reduce((acc, p) => acc + p.pedestrianBenefit, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Budget Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-sm">
              <Award className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-white uppercase tracking-tight">
              Toma de Decisiones y Panel Ejecutivo
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Priorización estratégica de proyectos de infraestructura peatonal y ciclista, asignación de presupuesto municipal y autorización de obras auditadas por RAG y visión YOLO.
          </p>
        </div>

        <div className="bg-slate-950 border border-rose-800/40 p-4 rounded-xl text-left md:text-right shrink-0">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block font-mono">
            Presupuesto Municipal Disponible
          </span>
          <span className="text-2xl font-extrabold font-mono text-white tabular-nums tracking-tight">
            ${totalBudget.toLocaleString('es-MX')} MXN
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
            Fondo de Infraestructura Sostenible GDL
          </span>
        </div>
      </div>

      {/* KPI metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-amber-500 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Proyectos en Cola</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{pendingCount}</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[11px] text-amber-400 mt-1 block">Requieren validación técnica</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-emerald-500 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Obras Autorizadas</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{authorizedCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">En ejecución presupuestal</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-blue-500 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cumplimiento Normativo</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">96.4%</span>
            <Award className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[11px] text-blue-400 mt-1 block">Validado contra Código Urbano</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-rose-500 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Impacto Peatonal Diario</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              +{totalBeneficiaries.toLocaleString()}
            </span>
            <Users className="w-5 h-5 text-rose-400" />
          </div>
          <span className="text-[11px] text-rose-400 mt-1 block">Transeúntes y ciclistas protegidos</span>
        </div>
      </div>

      {/* Projects Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Filters & Actions Header */}
        <div className="p-5 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Matriz de Intervención Prioritaria IA
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter segments */}
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  filter === 'all' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({projects.length})
              </button>
              <button
                onClick={() => setFilter('urgente')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  filter === 'urgente' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Urgentes
              </button>
              <button
                onClick={() => setFilter('autorizada')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  filter === 'autorizada' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Autorizadas
              </button>
            </div>

            <button
              onClick={() => setShowNewModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>Nueva Propuesta</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] font-mono">
              <tr>
                <th className="p-3.5 font-semibold">Polígono / Proyecto</th>
                <th className="p-3.5 font-semibold">Tipo de Obra</th>
                <th className="p-3.5 font-semibold text-right">Inversión Est.</th>
                <th className="p-3.5 font-semibold text-center">Score IA</th>
                <th className="p-3.5 font-semibold">Estatus</th>
                <th className="p-3.5 font-semibold text-right">Acciones Ejecutivas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProjects.map((p) => {
                const isUrgent = p.priorityLevel === 'Crítica';
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm">{p.title}</div>
                      <div className="text-[11px] text-slate-400">{p.location}</div>
                      <div className="text-[10px] text-rose-400 font-mono mt-0.5">
                        Base: {p.regulatoryBasis}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-200">{p.type}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        +{p.pedestrianBenefit.toLocaleString()} usuarios/día
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white tabular-nums text-sm">
                      ${p.estimatedCost.toLocaleString('es-MX')}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          isUrgent
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {p.priorityScore.toFixed(1)} / 10 ({p.priorityLevel})
                      </span>
                    </td>
                    <td className="p-3.5">
                      {p.status === 'Autorizada' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Autorizada
                        </span>
                      ) : p.status === 'En Revisión' ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> En Revisión
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-slate-500" /> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {p.status !== 'Autorizada' ? (
                        <>
                          <button
                            onClick={() => handleAuthorize(p.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
                          >
                            Autorizar
                          </button>
                          <button
                            onClick={() => handleReview(p.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition cursor-pointer"
                          >
                            Revisar
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-mono">Licitación en curso</span>
                      )}
                      {onOpenAiWithContext && (
                        <button
                          onClick={() =>
                            onOpenAiWithContext(
                              `Justificación técnica para el proyecto "${p.title}" (${p.location}). Costo estimado $${p.estimatedCost}. Fundamento: ${p.regulatoryBasis}.`
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 font-medium text-xs transition cursor-pointer"
                          title="Consultar dictamen legal con OLMOS"
                        >
                          Dictamen IA
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-500" /> Registrar Propuesta de Intervención Urbana
            </h3>
            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nombre del Proyecto</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ej. Reductor Trapezoidal y Banqueta Accesible"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cruce o Ubicación</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="ej. Av. Niños Héroes & Av. Chapultepec"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-rose-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipo de Intervención</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-rose-500"
                  >
                    <option value="Cruce Seguro">Cruce Seguro</option>
                    <option value="Ciclovía">Ciclovía</option>
                    <option value="Pacificación de Tránsito">Pacificación de Tránsito</option>
                    <option value="Semaforización Inteligente">Semaforización Inteligente</option>
                    <option value="Accesibilidad Universal">Accesibilidad Universal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Costo Estimado (MXN)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition shadow-md"
                >
                  Ingresar a Matriz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
