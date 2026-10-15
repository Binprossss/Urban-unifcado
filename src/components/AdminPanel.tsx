import React, { useState } from 'react';
import { INITIAL_SYSTEM_LOGS, SystemLog } from '../data/urbanData';
import {
  Settings,
  Edit3,
  FileCode,
  Network,
  Users,
  Terminal,
  Download,
  Trash2,
  Plus,
  Save,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Shield,
  Server
} from 'lucide-react';

interface AdminPanelProps {
  cmsHeroBadge: string;
  cmsHeroTitle: string;
  cmsHeroDesc: string;
  cmsHeroImage?: string;
  onUpdateCms: (badge: string, title: string, desc: string, image?: string) => void;
  userRole: 'admin' | 'perito' | 'observador';
  onChangeUserRole: (role: 'admin' | 'perito' | 'observador') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  cmsHeroBadge,
  cmsHeroTitle,
  cmsHeroDesc,
  cmsHeroImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop',
  onUpdateCms,
  userRole,
  onChangeUserRole,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'editor' | 'rag' | 'apis' | 'users' | 'logs'>('config');

  // Config tab state
  const [tone, setTone] = useState<'Adaptativo' | 'Tecnico' | 'Simplificado'>('Adaptativo');
  const [criticalThreshold, setCriticalThreshold] = useState<number>(1500);

  // CMS editor state
  const [badgeInput, setBadgeInput] = useState(cmsHeroBadge);
  const [titleInput, setTitleInput] = useState(cmsHeroTitle);
  const [descInput, setDescInput] = useState(cmsHeroDesc);
  const [imageInput, setImageInput] = useState(cmsHeroImage);

  // RAG docs state
  const [ragDocs, setRagDocs] = useState([
    { id: 1, name: 'Código Urbano del Estado de Jalisco', fragments: 1420, active: true },
    { id: 2, name: 'Ley de Movilidad y Transporte Sostenible', fragments: 980, active: true },
    { id: 3, name: 'Manual de Calles SEDATU (Diseño Vial)', fragments: 2100, active: true },
    { id: 4, name: 'Reglamento de Accesibilidad de Guadalajara', fragments: 450, active: true },
  ]);
  const [newDocName, setNewDocName] = useState('');

  // APIs state
  const [apis, setApis] = useState([
    { id: 1, name: 'Core IA Principal (Google Gemini Flash ZMG)', endpoint: '/api/chat', status: 'Activo', ping: '28ms' },
    { id: 2, name: 'Microservicio RAG & Vector Store (Secta / UrbanBuild)', endpoint: 'https://www.sectaaldiosdeloscamastros.com/api', status: 'Activo', ping: '38ms' },
    { id: 3, name: 'Visión por Computadora (YOLOv8 Edge & Aforo)', endpoint: '/api/analizar', status: 'Activo', ping: '18ms' },
    { id: 4, name: 'Servicio Geocodificador CartoDB GIS', endpoint: 'https://carto.com/tiles/voyager', status: 'Activo', ping: '31ms' },
  ]);
  const [newApiName, setNewApiName] = useState('');
  const [newApiUrl, setNewApiUrl] = useState('');

  // Users state
  const [users, setUsers] = useState([
    { id: 1, name: 'admin_gdl', role: 'Administrador General', status: 'Activo', institute: 'Escuela Politécnica de Guadalajara' },
    { id: 2, name: 'perito_vial_udeg', role: 'Perito Especialista RAG', status: 'Activo', institute: 'Colegio de Ingenieros Civiles' },
    { id: 3, name: 'observador_ciudadano', role: 'Observador', status: 'Activo', institute: 'PIMUS Jalisco' },
  ]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Perito Especialista RAG');

  // Logs state
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_SYSTEM_LOGS);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveCMS = () => {
    onUpdateCms(badgeInput, titleInput, descInput, imageInput);
    addLog('CMS: Textos e imagen de encabezado sincronizados con éxito.', 'INFO');
    showToast('¡Página principal actualizada y guardada con éxito!');
  };

  const handleSaveConfig = () => {
    addLog(`CONFIG: Parámetros actualizados (Tono: ${tone}, Umbral: ${criticalThreshold} veh/h)`, 'INFO');
    showToast('Configuración del sistema guardada.');
  };

  const addLog = (message: string, level: SystemLog['level'] = 'INFO') => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      module: 'RAG_CORE',
      message,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleAddRagDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    setRagDocs([
      ...ragDocs,
      { id: Date.now(), name: newDocName.trim(), fragments: 520, active: true },
    ]);
    addLog(`RAG: Nuevo reglamento indexado: "${newDocName.trim()}"`, 'INFO');
    setNewDocName('');
    showToast('Reglamento añadido a la base vectorial.');
  };

  const handleDeleteRagDoc = (id: number) => {
    setRagDocs(ragDocs.filter((d) => d.id !== id));
    addLog(`RAG: Documento ID ${id} eliminado de la base vectorial.`, 'WARN');
    showToast('Documento eliminado.');
  };

  const handleAddApi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiName.trim() || !newApiUrl.trim()) return;
    setApis([
      ...apis,
      { id: Date.now(), name: newApiName.trim(), endpoint: newApiUrl.trim(), status: 'Activo', ping: '25ms' },
    ]);
    addLog(`API: Endpoint "${newApiName.trim()}" conectado.`, 'INFO');
    setNewApiName('');
    setNewApiUrl('');
    showToast('API registrada exitosamente.');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    setUsers([
      ...users,
      { id: Date.now(), name: newUserName.trim(), role: newUserRole, status: 'Activo', institute: 'Gobierno de Guadalajara' },
    ]);
    addLog(`AUTH: Usuario pericial "${newUserName.trim()}" registrado.`, 'INFO');
    setNewUserName('');
    showToast('Usuario registrado con éxito.');
  };

  const exportConfigJson = () => {
    const data = {
      config: { tone, criticalThreshold },
      cms: { badge: badgeInput, title: titleInput, desc: descInput },
      ragDocs,
      apis,
      users,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbanbuild_config_backup_${Date.now()}.json`;
    a.click();
    showToast('Resguardo de configuración exportado en JSON.');
  };

  const exportLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbanbuild_audit_logs_${Date.now()}.log`;
    a.click();
    showToast('Logs de auditoría descargados.');
  };

  const filteredLogs = logs.filter((l) => {
    const matchesFilter = logFilter === 'ALL' || l.level === logFilter;
    const matchesSearch =
      l.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.timestamp.includes(logSearch);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl font-semibold text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-sm">
              <Shield className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-white uppercase tracking-tight">
              Panel de Administración y Auditoría Pro
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Consola centralizada para gestión de parámetros de tráfico, actualización en vivo de contenidos CMS, sincronización RAG y monitoreo de APIs de visión artificial.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-slate-300">Rol:</span>
            <select
              value={userRole}
              onChange={(e) => onChangeUserRole(e.target.value as any)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="admin" className="bg-slate-900">Admin GDL</option>
              <option value="perito" className="bg-slate-900">Perito Especialista</option>
              <option value="observador" className="bg-slate-900">Observador</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex flex-wrap items-center gap-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'config' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" /> Configuración General
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'editor' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Edit3 className="w-4 h-4" /> Editor Web Principal (CMS)
        </button>
        <button
          onClick={() => setActiveTab('rag')}
          className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'rag' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" /> Base RAG ({ragDocs.length})
        </button>
        <button
          onClick={() => setActiveTab('apis')}
          className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'apis' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Network className="w-4 h-4" /> Endpoints y APIs ({apis.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'users' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Roles y Accesos ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'logs' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" /> Auditoría y Logs
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
        {/* Tab 1: Config */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Parámetros del Sistema y Umbrales de Tráfico</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define el comportamiento del núcleo de análisis y alertas críticas.</p>
              </div>
              <button
                onClick={exportConfigJson}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Exportar Backup JSON
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <label className="block font-semibold text-slate-300">Tono del Asistente Normativo OLMOS</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-rose-500"
                >
                  <option value="Adaptativo">Adaptativo (Técnico Pericial y Ciudadano)</option>
                  <option value="Tecnico">Estrictamente Técnico (Solo Peritos y Notarios Urbanos)</option>
                  <option value="Simplificado">Simplificado (Ciudadanía y Juntas de Vecinos)</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Ajusta la profundidad de citas de artículos en las respuestas automáticas de OLMOS.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-slate-300">Umbral de Alerta Crítica de Flujo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={criticalThreshold}
                    onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono outline-none focus:border-rose-500"
                  />
                  <span className="text-slate-400 font-mono text-xs whitespace-nowrap">vehículos/h</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Flujos detectados por YOLO que superen este valor activan recomendación obligatoria de cruce a nivel.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleSaveConfig}
                className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" /> Guardar Parámetros
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: CMS Editor */}
        {activeTab === 'editor' && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Editor Web Principal (index.html)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Modifica los textos principales de la carátula y el lema institucional.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Insignia / Subtítulo Hero</label>
                <input
                  type="text"
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título Principal (H1)</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-bold outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descripción de la Plataforma</label>
                <textarea
                  rows={3}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">URL de Imagen de Fondo Hero</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono text-xs outline-none focus:border-rose-500"
                  />
                  {imageInput && (
                    <img src={imageInput} alt="Preview" className="w-12 h-10 object-cover rounded border border-slate-700" />
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Imágenes rápidas:</span>
                  <button
                    type="button"
                    onClick={() => setImageInput('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop')}
                    className="hover:text-rose-400 underline cursor-pointer"
                  >
                    Ciudad Moderna
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setImageInput('https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1920&auto=format&fit=crop')}
                    className="hover:text-rose-400 underline cursor-pointer"
                  >
                    Tráfico Nocturno
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setImageInput('https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1920&auto=format&fit=crop')}
                    className="hover:text-rose-400 underline cursor-pointer"
                  >
                    Movilidad Inteligente
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleSaveCMS}
                className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" /> Guardar y Sincronizar en Vivo
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: RAG */}
        {activeTab === 'rag' && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Base de Conocimiento RAG</h3>
              <p className="text-xs text-slate-400 mt-0.5">Administra los reglamentos y gacetas vectorizadas que alimentan al modelo de IA.</p>
            </div>

            <div className="space-y-3">
              {ragDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-white">{doc.name}</h4>
                    <span className="text-[11px] text-emerald-400 font-mono mt-0.5 block">
                      ✓ Vectorizado ({doc.fragments} embeddings activos)
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteRagDoc(doc.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition"
                    title="Eliminar de la base"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddRagDoc} className="pt-4 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Nombre del nuevo reglamento (ej. Reglamento de Imagen Urbana GDL 2026)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition shrink-0"
              >
                Subir y Vectorizar
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: APIs */}
        {activeTab === 'apis' && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Gestión de Endpoints y Microservicios</h3>
              <p className="text-xs text-slate-400 mt-0.5">Supervisión en tiempo real de latencia y estado de servicios de visión y RAG.</p>
            </div>

            <div className="space-y-3">
              {apis.map((api) => (
                <div
                  key={api.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{api.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{api.endpoint}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {api.status}
                    </span>
                    <span className="text-slate-400 text-[11px]">lat: {api.ping}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddApi} className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newApiName}
                onChange={(e) => setNewApiName(e.target.value)}
                placeholder="Nombre del servicio (ej. API Semáforos Inteligentes)"
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-rose-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newApiUrl}
                  onChange={(e) => setNewApiUrl(e.target.value)}
                  placeholder="https://api.urbanbuild.com/v2/..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-rose-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition shrink-0"
                >
                  Conectar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: Users */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Control de Accesos y Roles Periciales</h3>
              <p className="text-xs text-slate-400 mt-0.5">Asignación de facultades para dictaminación, autorización de gasto y revisión de aforos.</p>
            </div>

            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{u.name}</span>
                    <span className="text-slate-400 text-[11px]">{u.institute}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-rose-950/70 border border-rose-800/40 text-rose-300 px-2 py-0.5 rounded text-[11px] font-mono">
                      {u.role}
                    </span>
                    <span className="text-emerald-400 font-bold">{u.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddUser} className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Nombre de usuario (ej. perito_gonzalez)"
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-rose-500"
              />
              <div className="flex gap-2">
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-rose-500"
                >
                  <option value="Administrador General">Administrador General</option>
                  <option value="Perito Especialista RAG">Perito Especialista RAG</option>
                  <option value="Observador">Observador</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition shrink-0"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 6: Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Consola de Auditoría y Eventos del Núcleo</h3>
                <p className="text-xs text-slate-400 mt-0.5">Registro de eventos de inferencia YOLO, consultas vectoriales y autorizaciones.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-xs font-mono">
                  {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLogFilter(lvl)}
                      className={`px-2 py-1 rounded transition cursor-pointer ${
                        logFilter === lvl ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <button
                  onClick={exportLogs}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Descargar registro de eventos"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLogs([])}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Limpiar consola"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Input */}
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Filtrar por texto de evento..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 outline-none"
            />

            {/* Terminal Box */}
            <div className="bg-[#070d19] border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-80 overflow-y-auto space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-4 italic">No hay registros con los filtros actuales.</div>
              ) : (
                filteredLogs.map((log) => {
                  const isWarn = log.level === 'WARN';
                  const isErr = log.level === 'ERROR';
                  return (
                    <div key={log.id} className="flex items-start gap-2.5 border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          isErr
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : isWarn
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="text-slate-300 flex-1">{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
