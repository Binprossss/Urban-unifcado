import React, { useState, useMemo } from 'react';
import { YOLO_ACCUMULATED_DATA, YoloAccumulatedPoint } from '../data/urbanData';
import { Play, Pause, RotateCcw, Eye, ArrowUpRight, ShieldCheck, Car, Users } from 'lucide-react';

export const YoloCrucesChart: React.FC = () => {
  const [currentSecond, setCurrentSecond] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<YoloAccumulatedPoint | null>(null);

  // Play animation timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSecond((prev) => {
          if (prev >= 60) return 0;
          return prev + 1;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const filteredData = useMemo(() => {
    return YOLO_ACCUMULATED_DATA.filter((p) => p.second <= currentSecond);
  }, [currentSecond]);

  const currentStats = useMemo(() => {
    if (filteredData.length === 0) return YOLO_ACCUMULATED_DATA[0];
    return filteredData[filteredData.length - 1];
  }, [filteredData]);

  // Dimensions for SVG
  const width = 560;
  const height = 230;
  const padding = { top: 25, right: 25, bottom: 35, left: 35 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Max bounds
  const maxSec = 60;
  const maxAutos = 9;
  const maxPersonas = 10;

  // Helper for coordinates
  const getX = (sec: number) => padding.left + (sec / maxSec) * graphWidth;
  const getYAutos = (val: number) => padding.top + graphHeight - (val / maxAutos) * graphHeight;
  const getYPersonas = (val: number) => padding.top + graphHeight - (val / maxPersonas) * graphHeight;

  // SVG path generators (step after style matching the real detector chart)
  const buildStepPath = (pts: YoloAccumulatedPoint[], key: keyof YoloAccumulatedPoint, isAutos: boolean) => {
    if (pts.length === 0) return '';
    const getY = isAutos ? getYAutos : getYPersonas;
    let d = `M ${getX(pts[0].second)} ${getY(pts[0][key] as number)}`;
    for (let i = 1; i < pts.length; i++) {
      const prevX = getX(pts[i - 1].second);
      const currX = getX(pts[i].second);
      const prevY = getY(pts[i - 1][key] as number);
      const currY = getY(pts[i][key] as number);
      // Horizontal then vertical (step)
      d += ` L ${currX} ${prevY} L ${currX} ${currY}`;
    }
    return d;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Telemetría YOLOv8: Cruces Acumulados
            </h3>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              Nodo Aéreo #26
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Detección de flujos vehiculares y peatonales en ventana temporal de 60 segundos
          </p>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pausar' : 'Reproducir'}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentSecond(60);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Restablecer a 60s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-800/50 px-2.5 py-1 rounded-md">
            t: <span className="font-bold">{currentSecond}s</span> / 60s
          </div>
        </div>
      </div>

      {/* Scrub Slider */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[11px] font-mono text-slate-400">0s</span>
        <input
          type="range"
          min="0"
          max="60"
          value={currentSecond}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentSecond(Number(e.target.value));
          }}
          className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
        />
        <span className="text-[11px] font-mono text-slate-400">60s</span>
      </div>

      {/* Dual Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        {/* Graph 1: AUTOS */}
        <div className="bg-[#0b1329] border border-slate-800/90 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-400" /> Cruces acumulados — AUTOS
            </h4>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-2.5 h-1 rounded bg-sky-500" /> autos_in: {currentStats.autos_in}
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-1 rounded bg-amber-500" /> autos_out: {currentStats.autos_out}
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-1 rounded bg-emerald-500" /> autos_mid: {currentStats.autos_middle}
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[220px]">
              {/* Grid Lines */}
              {[0, 2, 4, 6, 8].map((val) => (
                <g key={`autos-grid-${val}`}>
                  <line
                    x1={padding.left}
                    y1={getYAutos(val)}
                    x2={width - padding.right}
                    y2={getYAutos(val)}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 6}
                    y={getYAutos(val) + 3}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {val}
                  </text>
                </g>
              ))}

              {[0, 10, 20, 30, 40, 50, 60].map((sec) => (
                <g key={`sec-grid-${sec}`}>
                  <line
                    x1={getX(sec)}
                    y1={padding.top}
                    x2={getX(sec)}
                    y2={height - padding.bottom}
                    stroke="#1e293b"
                    strokeWidth="0.8"
                  />
                  <text
                    x={getX(sec)}
                    y={height - padding.bottom + 15}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {sec}
                  </text>
                </g>
              ))}

              {/* Step Lines */}
              <path
                d={buildStepPath(filteredData, 'autos_in', true)}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              <path
                d={buildStepPath(filteredData, 'autos_out', true)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />
              <path
                d={buildStepPath(filteredData, 'autos_middle', true)}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />

              {/* Data points */}
              {filteredData.map((pt, idx) => (
                <g key={`pts-autos-${idx}`}>
                  <circle cx={getX(pt.second)} cy={getYAutos(pt.autos_in)} r="3" fill="#38bdf8" />
                  <circle cx={getX(pt.second)} cy={getYAutos(pt.autos_out)} r="3" fill="#f59e0b" />
                  <circle cx={getX(pt.second)} cy={getYAutos(pt.autos_middle)} r="3" fill="#10b981" />
                </g>
              ))}

              {/* Labels */}
              <text
                x={-height / 2 + 10}
                y="12"
                transform="rotate(-90)"
                fill="#94a3b8"
                fontSize="9"
                textAnchor="middle"
              >
                Cruces acumulados
              </text>
              <text
                x={width / 2}
                y={height - 5}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="middle"
              >
                Segundos
              </text>
            </svg>
          </div>
        </div>

        {/* Graph 2: PERSONAS */}
        <div className="bg-[#0b1329] border border-slate-800/90 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-400" /> Cruces acumulados — PERSONAS
            </h4>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-2.5 h-1 rounded bg-sky-500" /> personas_in: {currentStats.personas_in}
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-1 rounded bg-amber-500" /> personas_out: {currentStats.personas_out}
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[220px]">
              {/* Grid Lines */}
              {[0, 2, 4, 6, 8, 10].map((val) => (
                <g key={`personas-grid-${val}`}>
                  <line
                    x1={padding.left}
                    y1={getYPersonas(val)}
                    x2={width - padding.right}
                    y2={getYPersonas(val)}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 6}
                    y={getYPersonas(val) + 3}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {val}
                  </text>
                </g>
              ))}

              {[0, 10, 20, 30, 40, 50, 60].map((sec) => (
                <g key={`sec-grid-p-${sec}`}>
                  <line
                    x1={getX(sec)}
                    y1={padding.top}
                    x2={getX(sec)}
                    y2={height - padding.bottom}
                    stroke="#1e293b"
                    strokeWidth="0.8"
                  />
                  <text
                    x={getX(sec)}
                    y={height - padding.bottom + 15}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {sec}
                  </text>
                </g>
              ))}

              {/* Step Lines */}
              <path
                d={buildStepPath(filteredData, 'personas_in', false)}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              <path
                d={buildStepPath(filteredData, 'personas_out', false)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />

              {/* Data points */}
              {filteredData.map((pt, idx) => (
                <g key={`pts-personas-${idx}`}>
                  <circle cx={getX(pt.second)} cy={getYPersonas(pt.personas_in)} r="3" fill="#38bdf8" />
                  <circle cx={getX(pt.second)} cy={getYPersonas(pt.personas_out)} r="3" fill="#f59e0b" />
                </g>
              ))}

              {/* Labels */}
              <text
                x={-height / 2 + 10}
                y="12"
                transform="rotate(-90)"
                fill="#94a3b8"
                fontSize="9"
                textAnchor="middle"
              >
                Cruces acumulados
              </text>
              <text
                x={width / 2}
                y={height - 5}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="middle"
              >
                Segundos
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Validación de paso de cebra: Ratio Autos/Peatones = {(currentStats.autos_in + currentStats.autos_out) / Math.max(1, currentStats.personas_in + currentStats.personas_out)} : 1</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Fuente: Telemetría YOLOv8 Sanj-aereo · Latencia inferencia: 14.2ms
        </div>
      </div>
    </div>
  );
};
