import React from 'react';
import { LANE_TELEMETRY_DATA } from '../data/urbanData';
import { GitBranch, TrendingUp, AlertTriangle, ArrowRightLeft } from 'lucide-react';

export const YoloLanesChart: React.FC = () => {
  // Accumulated time series across 0 - 30 seconds for the 4 lanes (from User's 3rd chart)
  const laneSteps = [
    { sec: 0, out1: 0, out2: 0, in1: 0, in2: 0 },
    { sec: 3, out1: 0, out2: 0, in1: 3, in2: 0 },
    { sec: 5, out1: 0, out2: 0, in1: 3, in2: 2 },
    { sec: 6, out1: 0, out2: 0, in1: 4, in2: 2 },
    { sec: 12, out1: 0, out2: 0, in1: 4, in2: 2 },
    { sec: 14, out1: 0, out2: 0, in1: 5, in2: 3 },
    { sec: 15, out1: 1, out2: 0, in1: 5, in2: 3 },
    { sec: 16, out1: 1, out2: 0, in1: 6, in2: 5 },
    { sec: 18, out1: 1, out2: 2, in1: 6, in2: 5 },
    { sec: 20, out1: 1, out2: 2, in1: 8, in2: 5 },
    { sec: 21, out1: 2, out2: 2, in1: 8, in2: 7 },
    { sec: 22, out1: 2, out2: 2, in1: 9, in2: 8 },
    { sec: 25, out1: 2, out2: 3, in1: 9, in2: 8 },
    { sec: 26, out1: 2, out2: 3, in1: 9, in2: 10 },
    { sec: 30, out1: 2, out2: 3, in1: 9, in2: 10 },
  ];

  const maxVal = 10;
  const barChartWidth = 360;
  const barChartHeight = 220;
  const barPadding = { top: 25, right: 15, bottom: 45, left: 35 };

  const stepChartWidth = 420;
  const stepChartHeight = 220;
  const stepPadding = { top: 25, right: 25, bottom: 45, left: 35 };

  const getStepX = (sec: number) => stepPadding.left + (sec / 30) * (stepChartWidth - stepPadding.left - stepPadding.right);
  const getStepY = (val: number) => stepPadding.top + (stepChartHeight - stepPadding.top - stepPadding.bottom) - (val / 10) * (stepChartHeight - stepPadding.top - stepPadding.bottom);

  const buildStepLine = (key: 'out1' | 'out2' | 'in1' | 'in2') => {
    return laneSteps.map((pt, i) => {
      const x = getStepX(pt.sec);
      const y = getStepY(pt[key]);
      if (i === 0) return `M ${x} ${y}`;
      const prevX = getStepX(laneSteps[i - 1].sec);
      const prevY = getStepY(laneSteps[i - 1][key]);
      return `L ${x} ${prevY} L ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Análisis por Carril y Composición Vehicular — 212470_medium
            </h3>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              Desglose Geométrico
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribución de volumen entre carriles de salida (OUT) y carriles de entrada (IN)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <ArrowRightLeft className="w-3.5 h-3.5 text-rose-400" />
          <span>Total: 24 Vehículos en ventana 30s</span>
        </div>
      </div>

      {/* 3 Panels Grid matching the user's chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">
        {/* Panel 1: Total por carril */}
        <div className="bg-[#0b1329] border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Total por carril
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Unidades</span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${barChartWidth} ${barChartHeight}`} className="w-full h-auto max-h-[220px]">
              {/* Horizontal grid */}
              {[0, 2, 4, 6, 8, 10].map((val) => {
                const y = barPadding.top + (barChartHeight - barPadding.top - barPadding.bottom) - (val / 10) * (barChartHeight - barPadding.top - barPadding.bottom);
                return (
                  <g key={`bar-grid-${val}`}>
                    <line x1={barPadding.left} y1={y} x2={barChartWidth - barPadding.right} y2={y} stroke="#1e293b" strokeWidth="0.8" />
                    <text x={barPadding.left - 6} y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">{val}</text>
                  </g>
                );
              })}

              {/* Bars */}
              {LANE_TELEMETRY_DATA.map((lane, i) => {
                const barWidth = 48;
                const slotWidth = (barChartWidth - barPadding.left - barPadding.right) / 4;
                const x = barPadding.left + i * slotWidth + (slotWidth - barWidth) / 2;
                const graphH = barChartHeight - barPadding.top - barPadding.bottom;
                const barH = (lane.vehicleCount / 10) * graphH;
                const y = barPadding.top + graphH - barH;

                return (
                  <g key={`lane-bar-${i}`}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barH}
                      fill={lane.color}
                      rx="2"
                    />
                    {/* Number on top */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {lane.vehicleCount}
                    </text>
                    {/* Label at bottom angled */}
                    <text
                      x={x + barWidth / 2}
                      y={barChartHeight - barPadding.bottom + 14}
                      fill="#94a3b8"
                      fontSize="7.5"
                      fontFamily="sans-serif"
                      textAnchor="end"
                      transform={`rotate(-15, ${x + barWidth / 2}, ${barChartHeight - barPadding.bottom + 14})`}
                    >
                      {lane.lane}
                    </text>
                  </g>
                );
              })}
              <text x={-barChartHeight / 2 + 10} y="12" transform="rotate(-90)" fill="#64748b" fontSize="8" textAnchor="middle">Vehículos</text>
            </svg>
          </div>
        </div>

        {/* Panel 2: Composición por tipo de vehículo */}
        <div className="bg-[#0b1329] border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Composición por tipo de vehículo
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-400">
              <span className="w-2.5 h-2 bg-[#3b82f6] rounded-xs" /> auto
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${barChartWidth} ${barChartHeight}`} className="w-full h-auto max-h-[220px]">
              {[0, 2, 4, 6, 8, 10].map((val) => {
                const y = barPadding.top + (barChartHeight - barPadding.top - barPadding.bottom) - (val / 10) * (barChartHeight - barPadding.top - barPadding.bottom);
                return (
                  <g key={`comp-grid-${val}`}>
                    <line x1={barPadding.left} y1={y} x2={barChartWidth - barPadding.right} y2={y} stroke="#1e293b" strokeWidth="0.8" />
                    <text x={barPadding.left - 6} y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">{val}</text>
                  </g>
                );
              })}

              {LANE_TELEMETRY_DATA.map((lane, i) => {
                const barWidth = 48;
                const slotWidth = (barChartWidth - barPadding.left - barPadding.right) / 4;
                const x = barPadding.left + i * slotWidth + (slotWidth - barWidth) / 2;
                const graphH = barChartHeight - barPadding.top - barPadding.bottom;
                const barH = (lane.vehicleCount / 10) * graphH;
                const y = barPadding.top + graphH - barH;

                return (
                  <g key={`comp-bar-${i}`}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barH}
                      fill="#3b82f6"
                      rx="2"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={barChartHeight - barPadding.bottom + 14}
                      fill="#94a3b8"
                      fontSize="7.5"
                      fontFamily="sans-serif"
                      textAnchor="end"
                      transform={`rotate(-15, ${x + barWidth / 2}, ${barChartHeight - barPadding.bottom + 14})`}
                    >
                      {lane.lane}
                    </text>
                  </g>
                );
              })}
              <text x={-barChartHeight / 2 + 10} y="12" transform="rotate(-90)" fill="#64748b" fontSize="8" textAnchor="middle">Vehículos</text>
            </svg>
          </div>
        </div>

        {/* Panel 3: Acumulado por segundo */}
        <div className="bg-[#0b1329] border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Acumulado por segundo
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">0 a 30s</span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${stepChartWidth} ${stepChartHeight}`} className="w-full h-auto max-h-[220px]">
              {[0, 2, 4, 6, 8, 10].map((val) => {
                const y = getStepY(val);
                return (
                  <g key={`step-grid-y-${val}`}>
                    <line x1={stepPadding.left} y1={y} x2={stepChartWidth - stepPadding.right} y2={y} stroke="#1e293b" strokeWidth="0.8" />
                    <text x={stepPadding.left - 6} y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">{val}</text>
                  </g>
                );
              })}

              {[0, 5, 10, 15, 20, 25, 30].map((sec) => {
                const x = getStepX(sec);
                return (
                  <g key={`step-grid-x-${sec}`}>
                    <line x1={x} y1={stepPadding.top} x2={x} y2={stepChartHeight - stepPadding.bottom} stroke="#1e293b" strokeWidth="0.8" />
                    <text x={x} y={stepChartHeight - stepPadding.bottom + 14} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">{sec}</text>
                  </g>
                );
              })}

              {/* Step lines for the 4 lanes */}
              <path d={buildStepLine('out1')} fill="none" stroke="#10b981" strokeWidth="2" />
              <path d={buildStepLine('out2')} fill="none" stroke="#059669" strokeWidth="2" />
              <path d={buildStepLine('in1')} fill="none" stroke="#facc15" strokeWidth="2.2" />
              <path d={buildStepLine('in2')} fill="none" stroke="#f59e0b" strokeWidth="2.2" />

              <text x={-stepChartHeight / 2 + 10} y="12" transform="rotate(-90)" fill="#64748b" fontSize="8" textAnchor="middle">Vehículos acumulados</text>
              <text x={stepChartWidth / 2} y={stepChartHeight - 5} fill="#64748b" fontSize="9" textAnchor="middle">Segundos</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Legend & Analytical Insight */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex flex-wrap items-center gap-4 text-slate-300 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#10b981] rounded-sm" /> Carril Izq 1 (OUT)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#059669] rounded-sm" /> Carril Izq 2 (OUT)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#facc15] rounded-sm" /> Carril Der 1 (IN)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#f59e0b] rounded-sm" /> Carril Der 2 (IN)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 px-3 py-1 rounded-md border border-amber-800/40 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Asimetría crítica: 79% del flujo se concentra en los carriles de entrada (IN)</span>
        </div>
      </div>
    </div>
  );
};
