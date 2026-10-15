import React, { useState } from 'react';
import { YOLO_OBJECT_SERIES, ObjectDetectionSec } from '../data/urbanData';
import { Eye, Layers, Activity, Truck, Car, Bike, Bus } from 'lucide-react';

export const YoloObjectsChart: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const seriesMeta = [
    { key: 'auto', label: 'Auto', color: '#f87171', fill: 'rgba(248, 113, 113, 0.25)', icon: Car },
    { key: 'bicicleta', label: 'Bicicleta', color: '#4ade80', fill: 'rgba(74, 222, 128, 0.25)', icon: Bike },
    { key: 'bus', label: 'Bus', color: '#c084fc', fill: 'rgba(192, 132, 252, 0.25)', icon: Bus },
    { key: 'camion', label: 'Camión', color: '#2dd4bf', fill: 'rgba(45, 212, 191, 0.25)', icon: Truck },
    { key: 'motocicleta', label: 'Motocicleta', color: '#fbbf24', fill: 'rgba(251, 191, 36, 0.25)', icon: Activity },
    { key: 'persona', label: 'Persona', color: '#60a5fa', fill: 'rgba(96, 165, 250, 0.25)', icon: Layers },
  ];

  const width = 840;
  const height = 300;
  const padding = { top: 25, right: 35, bottom: 40, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const maxVal = 6.0;
  const maxSec = 7;

  const getX = (sec: number) => padding.left + (sec / maxSec) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - (val / maxVal) * graphHeight;

  const buildLinePath = (key: keyof ObjectDetectionSec) => {
    return YOLO_OBJECT_SERIES.map((pt, i) => {
      const x = getX(pt.second);
      const y = getY(pt[key] as number);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const buildAreaPath = (key: keyof ObjectDetectionSec) => {
    const line = buildLinePath(key);
    const startX = getX(YOLO_OBJECT_SERIES[0].second);
    const endX = getX(YOLO_OBJECT_SERIES[YOLO_OBJECT_SERIES.length - 1].second);
    const zeroY = getY(0);
    return `${line} L ${endX} ${zeroY} L ${startX} ${zeroY} Z`;
  };

  const activePoint = hoverIndex !== null ? YOLO_OBJECT_SERIES[hoverIndex] : YOLO_OBJECT_SERIES[YOLO_OBJECT_SERIES.length - 1];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-100">
      {/* Title & Legend filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Conteo de Objetos por Segundo — ejm1
            </h3>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              Clasificación Multiclase
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Desglose instantáneo de parque vehicular y micromovilidad detectados por visión artificial
          </p>
        </div>

        {/* Legend buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedClass(null)}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
              selectedClass === null
                ? 'bg-slate-800 text-white border border-slate-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          {seriesMeta.map((s) => {
            const isSelected = selectedClass === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSelectedClass(isSelected ? null : s.key)}
                className={`px-2 py-1 text-xs rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-white ring-1'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{ borderColor: s.color }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas Area Chart */}
      <div className="mt-4 bg-[#0b1329] border border-slate-800/90 rounded-xl p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[620px] max-h-[320px]"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Grid lines horizontal */}
          {[0, 1, 2, 3, 4, 5].map((val) => (
            <g key={`y-grid-${val}`}>
              <line
                x1={padding.left}
                y1={getY(val)}
                x2={width - padding.right}
                y2={getY(val)}
                stroke="#1e293b"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={getY(val) + 3}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Grid lines vertical (seconds 0 to 7) */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((sec, idx) => (
            <g key={`x-grid-${sec}`}>
              <line
                x1={getX(sec)}
                y1={padding.top}
                x2={getX(sec)}
                y2={height - padding.bottom}
                stroke="#1e293b"
                strokeWidth="1"
              />
              <text
                x={getX(sec)}
                y={height - padding.bottom + 18}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {sec}
              </text>

              {/* Hover trigger zone */}
              <rect
                x={getX(sec) - graphWidth / (maxSec * 2)}
                y={padding.top}
                width={graphWidth / maxSec}
                height={graphHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            </g>
          ))}

          {/* Areas & Lines */}
          {seriesMeta.map((s) => {
            const isVisible = selectedClass === null || selectedClass === s.key;
            if (!isVisible) return null;

            return (
              <g key={`series-${s.key}`}>
                {/* Shaded Area */}
                <path
                  d={buildAreaPath(s.key as keyof ObjectDetectionSec)}
                  fill={s.fill}
                  className="transition-all duration-200"
                />
                {/* Stroke Line */}
                <path
                  d={buildLinePath(s.key as keyof ObjectDetectionSec)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Circles */}
                {YOLO_OBJECT_SERIES.map((pt, i) => (
                  <circle
                    key={`dot-${s.key}-${i}`}
                    cx={getX(pt.second)}
                    cy={getY(pt[s.key as keyof ObjectDetectionSec] as number)}
                    r={hoverIndex === i ? 4.5 : 3}
                    fill={s.color}
                    stroke="#0b1329"
                    strokeWidth="1.5"
                  />
                ))}
              </g>
            );
          })}

          {/* Vertical scrub indicator if hovered */}
          {hoverIndex !== null && (
            <line
              x1={getX(YOLO_OBJECT_SERIES[hoverIndex].second)}
              y1={padding.top}
              x2={getX(YOLO_OBJECT_SERIES[hoverIndex].second)}
              y2={height - padding.bottom}
              stroke="#e2e8f0"
              strokeDasharray="2 2"
              strokeWidth="1.5"
            />
          )}

          {/* Axis Titles */}
          <text
            x={-height / 2 + 10}
            y="14"
            transform="rotate(-90)"
            fill="#94a3b8"
            fontSize="10"
            textAnchor="middle"
          >
            Objetos detectados
          </text>
          <text
            x={width / 2}
            y={height - 6}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="middle"
          >
            Tiempo (segundos)
          </text>
        </svg>
      </div>

      {/* Snapshot metrics for current point */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4">
        {seriesMeta.map((s) => {
          const val = activePoint[s.key as keyof ObjectDetectionSec] as number;
          const Icon = s.icon;
          return (
            <div
              key={`metric-${s.key}`}
              className="bg-slate-800/60 border border-slate-700/80 rounded-lg p-2.5 flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">{s.label}</span>
                <span className="text-lg font-bold font-mono text-white tabular-nums">
                  {val.toFixed(1)}
                </span>
              </div>
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ backgroundColor: `${s.color}20`, color: s.color }}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
