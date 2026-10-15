import React, { useState, useMemo, useRef } from 'react';
import {
  Building2,
  Mountain,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  Hammer,
  FileCheck,
  Leaf,
  ChevronDown,
  Compass,
  ArrowRight,
  Send,
  HelpCircle,
  Maximize2,
  Camera,
  X,
  Upload
} from 'lucide-react';
import {
  evaluarConvenienciaPorTerreno,
  TIPOS_SUELO_METADATA,
  TOPOGRAFIA_METADATA,
  TipoSueloZMG,
  TopografiaTerreno,
  TerrenoCaracteristicas,
  RecomendacionEdificacion
} from '../utils/terrainAdvisor';

interface TerrainAdvisorProps {
  onSendToAiChat?: (promptText: string) => void;
  initialSuperficie?: number;
  initialZona?: string;
}

export const TerrainAdvisor: React.FC<TerrainAdvisorProps> = ({
  onSendToAiChat,
  initialSuperficie = 500,
  initialZona = 'H3-U'
}) => {
  const [superficie, setSuperficie] = useState<number>(initialSuperficie);
  const [zona, setZona] = useState<string>(initialZona);
  const [tipoSuelo, setTipoSuelo] = useState<TipoSueloZMG>('pomez_jalisco');
  const [topografia, setTopografia] = useState<TopografiaTerreno>('plano');
  const [municipio, setMunicipio] = useState<string>('Guadalajara');
  const [colindanciaVial, setColindanciaVial] = useState<'local_residencial' | 'colectora' | 'arteria_principal' | 'avenida_brt'>('colectora');
  const [isConsultingGemini, setIsConsultingGemini] = useState<boolean>(false);
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [terrainPhoto, setTerrainPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const terrainInputRef = useRef<HTMLInputElement>(null);

  // Ejecución del motor experto local
  const evaluacion = useMemo<RecomendacionEdificacion>(() => {
    return evaluarConvenienciaPorTerreno({
      superficieM2: superficie,
      zonaUrbana: zona,
      tipoSuelo,
      topografia,
      municipio,
      colindanciaVial,
    });
  }, [superficie, zona, tipoSuelo, topografia, municipio, colindanciaVial]);

  // Consulta en vivo a la IA (Gemini 3.8 Flash multimodal si hay foto / Render RAG / URBIN)
  const handleConsultarIaEnVivo = async () => {
    setIsConsultingGemini(true);
    setGeminiResponse(null);

    const promptTecnico = `Dictamen Pericial de Aptitud de Terreno y Recomendación Edificatoria ZMG:
- Predio de ${superficie} m² en el municipio de ${municipio}, Jalisco.
- Zonificación urbana: ${zona}.
- Tipo de estrato de suelo: ${TIPOS_SUELO_METADATA[tipoSuelo].nombre}.
- Topografía del terreno: ${TOPOGRAFIA_METADATA[topografia].nombre}.
- Vialidad colindante: ${colindanciaVial}.
${terrainPhoto ? `\n[Nota pericial: Se adjunta fotografía del terreno real "${terrainPhoto.name}". Inspecciona visualmente la pendiente aparente, estrato superficial y colindancias].` : ''}

Determina con fundamento en el Código Urbano de Jalisco (Art. 142 y 176), POTmet IMEPLAN y Reglamentos de Construcción:
1. ¿Es conveniente construir en este terreno y con qué nivel de viabilidad geotécnica y normativa?
2. ¿Qué tipo específico de edificio y tipología de uso es la más conveniente?
3. ¿Cuál es la altura máxima conveniente (niveles y metros) y coeficientes COS/CUS recomendados?
4. ¿Qué materiales de construcción son los ideales para la cimentación, estructura resistente y envolventes/fachadas ante las condiciones sísmicas y de suelo de la ZMG?
5. Obligatoriedad del 20% permeable y recomendaciones sustentables bioclimáticas.`;

    try {
      let res;
      if (terrainPhoto) {
        const formData = new FormData();
        formData.append('archivo', terrainPhoto);
        formData.append('pregunta', promptTecnico);
        formData.append('modo', 'terreno');
        formData.append('session_id', 'urban_terrain_advisor');
        res = await fetch('/api/analizar', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptTecnico,
            session_id: 'urban_terrain_advisor',
          }),
        });
      }

      if (res.ok) {
        const data = await res.json();
        setGeminiResponse(data.reply || data.respuesta || data.respuesta_texto || 'Dictamen procesado.');
      } else {
        setGeminiResponse('No se pudo conectar con el servicio en este momento. Se muestra el dictamen pericial local.');
      }
    } catch (err: any) {
      setGeminiResponse('Error de conexión con el núcleo de IA. El motor pericial local permanece activo con plena validez matemática.');
    } finally {
      setIsConsultingGemini(false);
    }
  };

  const handleEnviarAlChatGlobal = () => {
    if (!onSendToAiChat) return;
    const promptTexto = `Evalúa este terreno en ${municipio} (ZMG): Superficie ${superficie} m², zonificación ${zona}, suelo ${TIPOS_SUELO_METADATA[tipoSuelo].nombre}, topografía ${TOPOGRAFIA_METADATA[topografia].nombre}. ¿Es conveniente construir, qué tipo de edificio, qué altura y qué materiales sugieres según la normativa de Jalisco?`;
    onSendToAiChat(promptTexto);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header con estilo institucional UrbanBuild */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 border-b border-gray-800">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-[#c9122f] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">
              IA URBANA & GEOTECNIA ZMG
            </span>
            <span className="bg-indigo-900/90 text-indigo-200 border border-indigo-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-300" /> Gemini 3.8 Flash
            </span>
            <span className="bg-emerald-900/80 text-emerald-300 border border-emerald-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> POTmet IMEPLAN & Código Urbano
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase flex items-center gap-3">
            <Mountain className="w-8 h-8 text-[#c9122f]" />
            <span>Detector de Terreno, Tipología Edificatoria y Materiales</span>
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Nuestra inteligencia artificial analiza las propiedades físicas del terreno (estrato de suelo, pendiente y superficie) junto a la zonificación oficial de Jalisco para dictaminar si es conveniente edificar, qué tipo de proyecto admite, su altura máxima segura y los materiales constructivos idóneos.
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* PARÁMETROS DE ENTRADA DEL TERRENO */}
        <div className="bg-gray-50/80 p-5 sm:p-6 rounded-xl border border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#c9122f]" />
            <span>1. Parámetros y Características del Lote / Terreno</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Superficie */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Superficie del Terreno (m²):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="50000"
                  value={superficie}
                  onChange={(e) => setSuperficie(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[#c9122f] outline-none shadow-sm"
                  placeholder="Ej. 500"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 font-mono text-xs">m²</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block">
                Área neta catastral o de escritura pública.
              </span>
            </div>

            {/* Zonificación */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Zonificación Urbana Reglamentaria:
              </label>
              <select
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#c9122f] outline-none shadow-sm"
              >
                <option value="H1-U">H1-U · Densidad Mínima Unifamiliar (COS 0.40 / CUS 0.80)</option>
                <option value="H2-U">H2-U · Densidad Baja Unifamiliar (COS 0.60 / CUS 1.20)</option>
                <option value="H3-U">H3-U · Densidad Media Residencial (COS 0.70 / CUS 2.10)</option>
                <option value="H4-U">H4-U · Densidad Alta Plurifamiliar (COS 0.75 / CUS 3.00)</option>
                <option value="MC">MC · Mixto Central Metropolitano (COS 0.80 / CUS 4.00)</option>
                <option value="MB">MB · Mixto Barrial Comercio y Vivienda (COS 0.70 / CUS 2.40)</option>
                <option value="CS3">CS3 · Comercio y Servicios Distrital (COS 0.80 / CUS 2.40)</option>
                <option value="I1">I1 · Industrial Ligero / Parque Tecnológico (COS 0.70 / CUS 1.40)</option>
              </select>
              <span className="text-[10px] text-gray-500 mt-1 block">
                Según Plan Parcial de Desarrollo Urbano municipal.
              </span>
            </div>

            {/* Municipio ZMG */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Municipio de la ZMG:
              </label>
              <select
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#c9122f] outline-none shadow-sm"
              >
                <option value="Guadalajara">Guadalajara</option>
                <option value="Zapopan">Zapopan</option>
                <option value="San Pedro Tlaquepaque">San Pedro Tlaquepaque</option>
                <option value="Tlajomulco de Zúñiga">Tlajomulco de Zúñiga</option>
                <option value="Tonalá">Tonalá</option>
                <option value="El Salto">El Salto</option>
                <option value="Ixtlahuacán de los Membrillos">Ixtlahuacán de los Membrillos</option>
                <option value="Juanacatlán">Juanacatlán</option>
                <option value="Zapotlanejo">Zapotlanejo</option>
              </select>
              <span className="text-[10px] text-gray-500 mt-1 block">
                Cobertura oficial de los 9 municipios metropolitanos.
              </span>
            </div>

            {/* Tipo de Suelo / Geotecnia */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Estrato Geotécnico / Tipo de Suelo:
              </label>
              <select
                value={tipoSuelo}
                onChange={(e) => setTipoSuelo(e.target.value as TipoSueloZMG)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#c9122f] outline-none shadow-sm"
              >
                <option value="pomez_jalisco">Jal / Toba Pomítica (Pómez Guadalajara / Valle Atemajac)</option>
                <option value="arcilloso_expansivo">Arcilla Expansiva (Vertisoles / Tlajomulco / Tonalá)</option>
                <option value="rocoso_basaltico">Roca Basáltica Firme (Colli / Huentitán / Bugambilias)</option>
                <option value="aluvial_lacustre">Depósito Aluvial / Limo Lacustre (Nivel freático alto)</option>
                <option value="relleno_heterogeneo">Relleno Antrópico / Antiguo Cauce Entubado</option>
              </select>
              <span className="text-[10px] text-blue-700 font-medium mt-1 block">
                Capacidad portante: {TIPOS_SUELO_METADATA[tipoSuelo].capacidadCargaAprox}
              </span>
            </div>

            {/* Topografía / Pendiente */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Topografía y Pendiente del Terreno:
              </label>
              <select
                value={topografia}
                onChange={(e) => setTopografia(e.target.value as TopografiaTerreno)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#c9122f] outline-none shadow-sm"
              >
                <option value="plano">Plano Regular (&lt; 5% de pendiente)</option>
                <option value="moderada">Pendiente Moderada (5% a 15% con desnivel suave)</option>
                <option value="escarpada">Pendiente Escarpada (&gt; 15% ladera o barranca)</option>
                <option value="hondonada">Hondonada / Vaso Natural de Escurrimiento Pluvial</option>
              </select>
              <span className="text-[10px] text-gray-500 mt-1 block">
                {TOPOGRAFIA_METADATA[topografia].impactoEdificacion}
              </span>
            </div>

            {/* Vialidad Colindante */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Jerarquía de la Calle Colindante:
              </label>
              <select
                value={colindanciaVial}
                onChange={(e) => setColindanciaVial(e.target.value as any)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#c9122f] outline-none shadow-sm"
              >
                <option value="local_residencial">Calle Local Residencial (12m a 15m ancho)</option>
                <option value="colectora">Vialidad Colectora (18m a 24m ancho con transporte)</option>
                <option value="arteria_principal">Arteria Principal Metropolitana (&gt; 30m ancho)</option>
                <option value="avenida_brt">Corredor Masivo BRT / Tren Ligero (Mi Macro / Mi Tren)</option>
              </select>
              <span className="text-[10px] text-gray-500 mt-1 block">
                Define potencial de transferencia de derechos CUSMAX.
              </span>
            </div>
          </div>
        </div>

        {/* DICTAMEN PERICIAL EJECUTIVO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tarjeta de Viabilidad y Conveniencia */}
          <div className="lg:col-span-4 space-y-4">
            <div className={`p-5 rounded-xl border ${
              evaluacion.viabilidadGeneral === 'Alta Viabilidad'
                ? 'bg-emerald-50/70 border-emerald-300'
                : evaluacion.viabilidadGeneral === 'Viabilidad Condicionada'
                ? 'bg-amber-50/70 border-amber-300'
                : 'bg-red-50/70 border-red-300'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                  Dictamen de Conveniencia
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  evaluacion.nivelRiesgo === 'Bajo'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : evaluacion.nivelRiesgo === 'Moderado'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}>
                  Riesgo {evaluacion.nivelRiesgo}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                {evaluacion.viabilidadGeneral === 'Alta Viabilidad' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : evaluacion.viabilidadGeneral === 'Viabilidad Condicionada' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
                )}
                <h4 className="text-base font-extrabold text-gray-900">
                  {evaluacion.viabilidadGeneral}
                </h4>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed mb-3">
                {evaluacion.esConvenienteConstruir
                  ? 'Es técnica y jurídicamente conveniente construir bajo las condicionantes normativas del Código Urbano de Jalisco.'
                  : 'Requiere estudios geotécnicos especiales de mecánica de suelos antes de tramitar licencia de construcción.'}
              </p>

              <div className="pt-3 border-t border-gray-200/70 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Suelo detectado:</span>
                  <span className="font-semibold text-gray-900 text-right">{TIPOS_SUELO_METADATA[tipoSuelo].nombre.split('(')[0]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Capacidad de carga:</span>
                  <span className="font-mono font-bold text-gray-900">{TIPOS_SUELO_METADATA[tipoSuelo].capacidadCargaAprox}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Comportamiento sísmico:</span>
                  <span className="font-semibold text-gray-800 text-[11px]">{TIPOS_SUELO_METADATA[tipoSuelo].comportamientoSismico}</span>
                </div>
              </div>
            </div>

            {/* Alturas y Coeficientes Normativos */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3 text-xs">
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-2 border-b border-gray-100">
                <ArrowUpRight className="w-4 h-4 text-[#c9122f]" />
                <span>Altura y Coeficientes Máximos Sugeridos</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Altura en Niveles</span>
                  <span className="text-xl font-black font-mono text-[#c9122f]">
                    {evaluacion.alturaMaximaNiveles} Niveles
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    ≈ {evaluacion.alturaMaximaMetros} m a cumbrera
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">COS Permitido</span>
                  <span className="text-xl font-black font-mono text-gray-900">
                    {evaluacion.cosRecomendado.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {evaluacion.desplanteMaxM2} m² desplante
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">CUS Utilización</span>
                  <span className="text-xl font-black font-mono text-gray-900">
                    {evaluacion.cusRecomendado.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {evaluacion.construccionTotalM2} m² máx
                  </span>
                </div>

                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 uppercase block font-semibold">20% Permeable (Art. 142)</span>
                  <span className="text-xl font-black font-mono text-emerald-700">
                    {evaluacion.areaPermeableM2} m²
                  </span>
                  <span className="text-[10px] text-emerald-600 block">
                    Suelo natural libre
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 leading-tight">
                *Parámetros calculados según el <strong>Reglamento Estatal de Zonificación de Jalisco</strong> y la capacidad portante del estrato geotécnico.
              </p>
            </div>
          </div>

          {/* Ficha de Tipología y Materiales Específicos */}
          <div className="lg:col-span-8 space-y-4">
            {/* Tipología Sugerida */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-[11px] font-bold text-[#c9122f] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> Tipología de Edificación Conveniente
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">
                  {zona} · {municipio}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 leading-snug">
                {evaluacion.tipologiaRecomendada}
              </h3>

              <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 leading-relaxed">
                <strong>Dictamen Pericial URBIN:</strong> {evaluacion.resumenDictamen}
              </div>

              {/* Condicionantes Técnicas */}
              {evaluacion.condicionantesTecnicas.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Condicionantes y Restricciones Específicas del Terreno
                  </h5>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    {evaluacion.condicionantesTecnicas.map((cond, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-amber-600 font-bold text-xs">•</span>
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* MATERIALES CONSTRUCTIVOS RECOMENDADOS */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-100">
                <Hammer className="w-4 h-4 text-[#c9122f]" />
                <span>Materiales de Construcción Sugeridos según Suelo y Altura</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Cimentación */}
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      1. Cimentación Recomendada
                    </span>
                    <h5 className="font-bold text-gray-900 mb-1 leading-snug">
                      {evaluacion.materialesCimentacion.sistema}
                    </h5>
                    <p className="text-[11px] text-gray-600 leading-relaxed mb-2">
                      {evaluacion.materialesCimentacion.descripcion}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-200 text-[10px] text-gray-500 font-mono">
                    Resistencia mín: <strong className="text-gray-900">{evaluacion.materialesCimentacion.resistenciaMinima}</strong>
                  </div>
                </div>

                {/* Estructura Resistente */}
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      2. Estructura y Muros
                    </span>
                    <h5 className="font-bold text-gray-900 mb-1 leading-snug">
                      {evaluacion.materialesEstructura.sistema}
                    </h5>
                    <div className="text-[11px] text-gray-600 space-y-1 mb-2">
                      {evaluacion.materialesEstructura.materiales.map((mat, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-[#c9122f] font-bold">✓</span> {mat}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200 text-[10px] text-gray-500">
                    {evaluacion.materialesEstructura.especificacion}
                  </div>
                </div>

                {/* Envolvente y Fachadas */}
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      3. Fachadas y Envolvente Bioclimática
                    </span>
                    <h5 className="font-bold text-gray-900 mb-1 leading-snug">
                      Materiales Aislantes y Tradicionales ZMG
                    </h5>
                    <div className="text-[11px] text-gray-600 space-y-1 mb-2">
                      {evaluacion.materialesEnvolventeYFachada.recomendados.map((rec, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-emerald-600 font-bold">✓</span> {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200 text-[10px] text-red-600">
                    Evitar: {evaluacion.materialesEnvolventeYFachada.revestimientosEvitar[0]}
                  </div>
                </div>
              </div>

              {/* Eficiencia Sustentable y Código Urbano Art. 142 */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs space-y-1.5">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  Criterios Bioclimáticos & Sustentabilidad ZMG
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-800">
                  {evaluacion.eficienciaSustentable.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-600">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACCIONES DE CONSULTA CON LA IA EN VIVO */}
        <div className="p-5 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-1.5 flex-1">
            <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-[#c9122f]" />
              <span>¿Deseas profundizar este dictamen con el RAG Pericial de URBIN?</span>
            </h4>
            <p className="text-xs text-gray-300">
              Ejecuta una consulta especializada cruzando el Plan Parcial del distrito con Gemini 3.8 Flash y la base de datos oficial de Jalisco.
            </p>
            {photoPreview && terrainPhoto && (
              <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg text-xs mt-1">
                <img src={photoPreview} alt="Foto del terreno" className="w-6 h-6 rounded object-cover border border-slate-600" />
                <span className="font-mono text-[11px] text-slate-300 truncate max-w-[160px]">{terrainPhoto.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTerrainPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="text-slate-400 hover:text-red-400 p-0.5"
                  title="Quitar foto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <input
              type="file"
              ref={terrainInputRef}
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setTerrainPhoto(file);
                  setPhotoPreview(URL.createObjectURL(file));
                }
              }}
            />
            <button
              type="button"
              onClick={() => terrainInputRef.current?.click()}
              className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm"
              title="Adjuntar fotografía real del predio para inspección multimodal"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>{terrainPhoto ? 'Foto Adjunta' : 'Subir Foto Predio'}</span>
            </button>

            <button
              onClick={handleConsultarIaEnVivo}
              disabled={isConsultingGemini}
              className="px-4 py-2.5 rounded-lg bg-[#c9122f] hover:bg-[#a00e25] text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow disabled:opacity-50"
            >
              {isConsultingGemini ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando Dictamen...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Consultar IA en Vivo</span>
                </>
              )}
            </button>

            {onSendToAiChat && (
              <button
                onClick={handleEnviarAlChatGlobal}
                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#c9122f]" />
                <span>Abrir en Chat OLMOS</span>
              </button>
            )}
          </div>
        </div>

        {/* RESPUESTA DE LA IA EN VIVO (SI SE GENERÓ) */}
        {geminiResponse && (
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 shadow-inner space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#c9122f]" />
                Dictamen Técnico Oficial Generado por URBIN AI Core
              </span>
              <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                CÓDIGO URBANO JALISCO VIGENTE
              </span>
            </div>
            <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans pt-1">
              {geminiResponse}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
