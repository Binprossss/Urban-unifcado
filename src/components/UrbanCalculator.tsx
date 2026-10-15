import React, { useState, useMemo } from 'react';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Info,
  Scale,
  Building,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  calcularNormativaUrbana,
  ZONING_LIMITS,
  CalculatorInputs,
  UrbanZoneLimits,
  esEscenarioInvalido,
} from '../utils/calculator';

interface UrbanCalculatorProps {
  onSendToAi?: (query: string) => void;
  initialValues?: Partial<CalculatorInputs>;
}

export const UrbanCalculator: React.FC<UrbanCalculatorProps> = ({
  onSendToAi,
  initialValues,
}) => {
  const [terreno, setTerreno] = useState<number>(initialValues?.terreno ?? 500);
  const [desplante, setDesplante] = useState<number>(initialValues?.desplante ?? 320);
  const [niveles, setNiveles] = useState<number>(initialValues?.niveles ?? 3);
  const [zona, setZona] = useState<string>(initialValues?.zona ?? 'H3-U');
  const [m2PorCajon, setM2PorCajon] = useState<number>(initialValues?.m2PorCajon ?? 65);

  // Calculation result
  const result = useMemo(() => {
    return calcularNormativaUrbana({
      terreno,
      desplante,
      niveles,
      zona,
      m2PorCajon,
    });
  }, [terreno, desplante, niveles, zona, m2PorCajon]);

  // Check if scenario is mathematically invalid
  const mathValidation = useMemo(() => {
    return esEscenarioInvalido(result);
  }, [result]);

  const handleResetToStandard = () => {
    setTerreno(500);
    setDesplante(320);
    setNiveles(3);
    setZona('H3-U');
    setM2PorCajon(65);
  };

  const handleTriggerImpossibleCos = () => {
    setTerreno(500);
    setDesplante(650); // Desplante 650 m² > 500 m² -> COS = 1.30 (> 1.0)
    setNiveles(2);
    setZona('H3-U');
  };

  const handleTriggerNegativeArea = () => {
    setTerreno(-400); // Terreno negativo
    setDesplante(200);
    setNiveles(2);
    setZona('H3-U');
  };

  const handleTriggerNegativeFootprint = () => {
    setTerreno(500);
    setDesplante(-150); // Desplante negativo
    setNiveles(3);
    setZona('H3-U');
  };

  const handleSendToAi = () => {
    if (!onSendToAi) return;
    const query = `Dictamen Técnico Normativo de Predio:\n- Superficie del Terreno: ${terreno} m²\n- Desplante Planta Baja: ${desplante} m²\n- Niveles de Construcción: ${niveles}\n- Zonificación ZMG: ${zona}\n- COS Resultante: ${result.cos} (Máx: ${result.maxCos})\n- CUS Resultante: ${result.cus} (Máx: ${result.maxCus})\n- Área Permeable Mínima 20% (Art. 142): ${result.permeableMin} m²\n- Cesión de Destinos 16% (Art. 176): ${result.cesionDestinos} m²\n\n¿Cumple con el Código Urbano del Estado de Jalisco y qué recomendaciones periciales aplican?`;
    onSendToAi(query);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden text-slate-800">
      {/* Top Banner */}
      <div className="bg-[#1f2937] text-white p-6 border-t-4 border-[#c9122f] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#c9122f] flex items-center justify-center text-white shadow">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight">
              Calculadora Normativa COS & CUS
            </h2>
            <span className="text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded">
              ZMG / Jalisco
            </span>
          </div>
          <p className="text-xs text-gray-300 max-w-2xl">
            Verificación en tiempo real de coeficientes de ocupación (COS), utilización (CUS), suelo permeable del 20% (Art. 142) y cesiones municipales (Art. 176) según el Código Urbano de Jalisco.
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleResetToStandard}
            className="text-[11px] font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 transition cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3 text-[#c9122f]" /> Estándar H3-U
          </button>
          <button
            type="button"
            onClick={handleTriggerImpossibleCos}
            className="text-[11px] font-semibold bg-red-950/80 hover:bg-red-900 text-red-200 px-3 py-1.5 rounded-lg border border-red-800 transition cursor-pointer flex items-center gap-1"
            title="Prueba de caso límite: Desplante 650 m² en predio de 500 m² (COS 1.30)"
          >
            <AlertTriangle className="w-3 h-3 text-red-400" /> Probar COS Imposible (&gt; 1.0)
          </button>
          <button
            type="button"
            onClick={handleTriggerNegativeArea}
            className="text-[11px] font-semibold bg-red-950/80 hover:bg-red-900 text-red-200 px-3 py-1.5 rounded-lg border border-red-800 transition cursor-pointer flex items-center gap-1"
            title="Prueba de caso límite: Terreno negativo (-400 m²)"
          >
            <AlertTriangle className="w-3 h-3 text-red-400" /> Probar Área Negativa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        {/* LEFT COLUMN: INPUT CONTROLS */}
        <div className="lg:col-span-5 p-6 bg-gray-50/70 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#c9122f]" /> Parámetros del Predio
            </span>
            <span className="text-[11px] font-mono text-gray-500">Datos Físicos</span>
          </div>

          {/* Input 1: Terreno */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="calc-input-terreno" className="font-semibold text-gray-700">
                Superficie Total del Terreno (m²):
              </label>
              <span className={`text-[11px] font-mono font-bold ${terreno <= 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {terreno <= 0 ? 'Inválido (≤ 0)' : `${terreno} m²`}
              </span>
            </div>
            <div className="relative">
              <input
                id="calc-input-terreno"
                type="number"
                value={terreno}
                onChange={(e) => setTerreno(parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-mono border transition outline-none ${
                  terreno <= 0
                    ? 'border-red-500 bg-red-50 text-red-900 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 bg-white text-gray-900 focus:border-[#c9122f] focus:ring-1 focus:ring-[#c9122f]'
                }`}
                placeholder="Ej. 500"
              />
            </div>
            <p className="text-[10px] text-gray-500">
              Superficie bruta del lote. Debe ser estrictamente positiva mayor a 0 m².
            </p>
          </div>

          {/* Input 2: Desplante */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="calc-input-desplante" className="font-semibold text-gray-700">
                Desplante en Planta Baja (m²):
              </label>
              <span
                className={`text-[11px] font-mono font-bold ${
                  desplante < 0 || (terreno > 0 && desplante > terreno)
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {desplante < 0
                  ? 'Negativo'
                  : terreno > 0 && desplante > terreno
                  ? `Supera terreno (${desplante} > ${terreno})`
                  : `${desplante} m²`}
              </span>
            </div>
            <div className="relative">
              <input
                id="calc-input-desplante"
                type="number"
                value={desplante}
                onChange={(e) => setDesplante(parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-mono border transition outline-none ${
                  desplante < 0 || (terreno > 0 && desplante > terreno)
                    ? 'border-red-500 bg-red-50 text-red-900 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 bg-white text-gray-900 focus:border-[#c9122f] focus:ring-1 focus:ring-[#c9122f]'
                }`}
                placeholder="Ej. 320"
              />
            </div>
            <p className="text-[10px] text-gray-500">
              Huella ocupada por la edificación en primer nivel. No puede exceder el área del predio ni ser negativa.
            </p>
          </div>

          {/* Input 3: Niveles */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="calc-input-niveles" className="font-semibold text-gray-700">
                Niveles Edificables:
              </label>
              <span className={`text-[11px] font-mono font-bold ${niveles < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {niveles < 0 ? 'Negativo' : `${niveles} niveles`}
              </span>
            </div>
            <div className="relative">
              <input
                id="calc-input-niveles"
                type="number"
                min="0"
                max="60"
                value={niveles}
                onChange={(e) => setNiveles(parseInt(e.target.value, 10) || 0)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-mono border transition outline-none ${
                  niveles < 0
                    ? 'border-red-500 bg-red-50 text-red-900 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 bg-white text-gray-900 focus:border-[#c9122f] focus:ring-1 focus:ring-[#c9122f]'
                }`}
                placeholder="Ej. 3"
              />
            </div>
          </div>

          {/* Input 4: Zonificación */}
          <div className="space-y-1">
            <label htmlFor="calc-select-zona" className="block text-xs font-semibold text-gray-700">
              Zonificación Normativa (ZMG / PPDUs):
            </label>
            <select
              id="calc-select-zona"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 bg-white text-gray-900 focus:border-[#c9122f] focus:ring-1 focus:ring-[#c9122f] outline-none cursor-pointer"
            >
              <option value="H3-U">H3-U Habitacional Densidad Media (COS: 0.70 / CUS: 2.10)</option>
              <option value="H1-U">H1-U Habitacional Densidad Mínima (COS: 0.40 / CUS: 0.80)</option>
              <option value="H2-U">H2-U Habitacional Densidad Baja (COS: 0.60 / CUS: 1.20)</option>
              <option value="H4-U">H4-U Habitacional Densidad Alta (COS: 0.75 / CUS: 3.00)</option>
              <option value="MC">MC Mixto Central Metropolitano (COS: 0.80 / CUS: 4.00)</option>
              <option value="MB">MB Mixto Barrial Comercial (COS: 0.70 / CUS: 2.40)</option>
              <option value="CS3">CS3 Comercio y Servicios Distrital (COS: 0.80 / CUS: 2.40)</option>
              <option value="I1">I1 Industrial Ligero Inofensivo (COS: 0.70 / CUS: 1.40)</option>
            </select>
          </div>

          {/* Quick test buttons */}
          <div className="pt-2 border-t border-gray-200">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5 font-mono">
              Inyecciones Rápidas de Prueba:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={handleTriggerImpossibleCos}
                className="text-[10px] bg-red-100 hover:bg-red-200 text-red-800 font-bold px-2 py-1 rounded border border-red-300 cursor-pointer"
              >
                Inyectar Desplante &gt; Terreno
              </button>
              <button
                type="button"
                onClick={handleTriggerNegativeFootprint}
                className="text-[10px] bg-red-100 hover:bg-red-200 text-red-800 font-bold px-2 py-1 rounded border border-red-300 cursor-pointer"
              >
                Inyectar Desplante Negativo
              </button>
              <button
                type="button"
                onClick={() => setNiveles(-1)}
                className="text-[10px] bg-red-100 hover:bg-red-200 text-red-800 font-bold px-2 py-1 rounded border border-red-300 cursor-pointer"
              >
                Inyectar Niveles -1
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS & INLINE RED ALERT BOX */}
        <div className="lg:col-span-7 p-6 space-y-5 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#c9122f]" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Dictamen Técnico y Coeficientes
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold border border-gray-200">
              {result.zonificacionAplicada.code}: {result.zonificacionAplicada.nombre}
            </span>
          </div>

          {/* ========================================================================= */}
          {/* INLINE RED ALERT BOX FOR MATHEMATICALLY INVALID SCENARIOS                */}
          {/* ========================================================================= */}
          {(result.isMathematicallyInvalid || !result.isValid || result.cos > 1.0) && (
            <div
              id="calculator-math-error-box"
              data-testid="calculator-math-alert"
              className="bg-red-50 border-2 border-red-500 rounded-xl p-4 text-red-900 shadow-sm flex items-start gap-3.5 transition-all animate-in fade-in"
            >
              <div className="p-2 rounded-lg bg-red-500 text-white shrink-0 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-white bg-red-600 px-2.5 py-0.5 rounded shadow-sm">
                    ⚠️ Escenario Matemáticamente Inválido
                  </span>
                  <span className="text-[11px] font-mono font-bold text-red-700">
                    Inconsistencia Geométrica / Normativa
                  </span>
                </div>

                <p className="text-xs font-bold text-red-950 leading-relaxed">
                  {result.mathematicalError ||
                    result.error ||
                    'Los valores ingresados generan un escenario físicamente o matemáticamente inviable en el lote.'}
                </p>

                {/* Specific Breakdown of Invalid Reasons */}
                <ul className="text-[11px] text-red-800 space-y-1 pt-1 font-medium list-disc list-inside bg-red-100/70 p-2.5 rounded-lg border border-red-200">
                  {terreno <= 0 && (
                    <li>
                      <strong>Superficie de predio nula o negativa ({terreno} m²):</strong> La superficie del terreno debe ser estrictamente mayor a 0 m² para admitir ocupación o subdivisión física.
                    </li>
                  )}
                  {desplante < 0 && (
                    <li>
                      <strong>Superficie de desplante negativa ({desplante} m²):</strong> No es posible ocupar una huella bajo cero en el plano físico.
                    </li>
                  )}
                  {niveles < 0 && (
                    <li>
                      <strong>Niveles de construcción negativos ({niveles}):</strong> El número de niveles debe ser un entero no negativo (&ge; 0).
                    </li>
                  )}
                  {desplante > terreno && terreno > 0 && (
                    <li>
                      <strong>Valor de COS imposible ({result.cos} &gt; 1.00):</strong> El desplante ({desplante} m²) supera el 100% del área del terreno ({terreno} m²). En edificación horizontal no es posible ocupar más superficie en planta baja que la extensión física del lote.
                    </li>
                  )}
                </ul>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetToStandard}
                    className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restablecer a Valores Válidos Estándar
                  </button>
                  <span className="text-[10px] text-red-600 font-mono">
                    Corrige los valores para habilitar el dictamen pericial.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* KPI CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* KPI 1: COS */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  COS (Ocupación del Suelo)
                </span>
                {result.isMathematicallyInvalid || result.cos > 1.0 ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">
                    Imposible
                  </span>
                ) : result.cumpleCos ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Cumple (≤ {result.maxCos})
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    Excede (Máx: {result.maxCos})
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black font-mono ${result.isMathematicallyInvalid || result.cos > 1.0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {result.cos}
                </span>
                <span className="text-xs text-gray-500">
                  ({(result.cos * 100).toFixed(0)}% desplante)
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Máximo permitido en {result.zonificacionAplicada.code}: <strong>{result.desplanteMaxPermitido} m²</strong> (COS {result.maxCos})
              </p>
            </div>

            {/* KPI 2: CUS */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  CUS (Utilización del Suelo)
                </span>
                {result.isMathematicallyInvalid ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">
                    Inválido
                  </span>
                ) : result.cumpleCus ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Cumple (≤ {result.maxCus})
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                    Requiere CUSmax
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black font-mono ${result.isMathematicallyInvalid ? 'text-red-600' : 'text-slate-900'}`}>
                  {result.cus}
                </span>
                <span className="text-xs text-gray-500">
                  coeficiente vertical
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Máximo base permitido: <strong>{result.construccionMaxPermitida} m²</strong> (CUS {result.maxCus})
              </p>
            </div>

            {/* KPI 3: Área Permeable (Art. 142) */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Suelo Absorbente (Art. 142)
                </span>
                {result.isMathematicallyInvalid ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                    Inválido
                  </span>
                ) : result.cumplePermeable ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    20% Garantizado
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">
                    Comprometido
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-700">
                  {result.permeableMin} m²
                </span>
                <span className="text-xs text-gray-500">
                  mínimo obligatorio
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Superficie libre resultante: <strong>{Math.max(0, terreno - desplante)} m²</strong>
              </p>
            </div>

            {/* KPI 4: Cesión de Destinos (Art. 176) */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Cesión Destinos (Art. 176)
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
                  {((result.zonificacionAplicada.cesionDestinos || 0.16) * 100).toFixed(0)}% Municipal
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-blue-700">
                  {result.cesionDestinos} m²
                </span>
                <span className="text-xs text-gray-500">
                  área pública
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Cajones estimados: <strong>{result.cajonesEstacionamiento} cajones</strong> ({m2PorCajon} m²/cajón)
              </p>
            </div>
          </div>

          {/* Action Button: Enviar a URBIN */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Total construido calculado: <strong className="text-gray-900 font-mono">{result.totalConstruido} m²</strong>
            </div>
            {onSendToAi && (
              <button
                type="button"
                onClick={handleSendToAi}
                disabled={result.isMathematicallyInvalid}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition shadow cursor-pointer ${
                  result.isMathematicallyInvalid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#c9122f] hover:bg-[#a00e25] text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Enviar Cálculo a Dictamen URBIN IA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
