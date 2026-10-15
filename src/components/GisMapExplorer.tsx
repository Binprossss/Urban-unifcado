import React, { useEffect, useRef, useState } from 'react';
import { URBAN_NODES, TelemetryNode } from '../data/urbanData';
import { MapPin, Navigation, Compass, Layers, ShieldAlert, Sparkles, Building2, ExternalLink } from 'lucide-react';

interface GisMapExplorerProps {
  selectedNode: TelemetryNode;
  onSelectNode: (node: TelemetryNode) => void;
  onAskAiWithCoords?: (lat: number, lng: number, context: string) => void;
}

export const GisMapExplorer: React.FC<GisMapExplorerProps> = ({
  selectedNode,
  onSelectNode,
  onAskAiWithCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: selectedNode.lat,
    lng: selectedNode.lng,
  });
  const [addressSearch, setAddressSearch] = useState('');
  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite' | 'heatmap'>('streets');

  useEffect(() => {
    setCoords({ lat: selectedNode.lat, lng: selectedNode.lng });
    if (leafletMapRef.current && markerRef.current) {
      leafletMapRef.current.setView([selectedNode.lat, selectedNode.lng], 15);
      markerRef.current.setLatLng([selectedNode.lat, selectedNode.lng]);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([selectedNode.lat, selectedNode.lng], 14);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // CartoDB Dark Matter / Voyager tile layer
      const tileUrl =
        activeLayer === 'streets'
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      const tiles = L.tileLayer(tileUrl, { maxZoom: 19 });
      tiles.addTo(map);

      // Custom red pin marker
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="background-color: #c9122f; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([selectedNode.lat, selectedNode.lng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCoords({ lat: Number(pos.lat.toFixed(4)), lng: Number(pos.lng.toFixed(4)) });
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: Number(e.latlng.lat.toFixed(4)), lng: Number(e.latlng.lng.toFixed(4)) });
      });

      // Add a visual circular danger/critical radius (300m buffer)
      L.circle([selectedNode.lat, selectedNode.lng], {
        color: '#c9122f',
        fillColor: '#c9122f',
        fillOpacity: 0.12,
        radius: 280,
      }).addTo(map);

      leafletMapRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      // Map cleanup if unmounted
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressSearch.trim()) return;

    // Fast local lookup
    const found = URBAN_NODES.find((n) =>
      n.name.toLowerCase().includes(addressSearch.toLowerCase()) ||
      n.polygon.toLowerCase().includes(addressSearch.toLowerCase())
    );

    if (found) {
      onSelectNode(found);
    } else {
      // Simulated geocode jump
      const randomOffsetLat = (Math.random() - 0.5) * 0.02;
      const randomOffsetLng = (Math.random() - 0.5) * 0.02;
      const newLat = Number((20.675 + randomOffsetLat).toFixed(4));
      const newLng = Number((-103.365 + randomOffsetLng).toFixed(4));
      setCoords({ lat: newLat, lng: newLng });
      if (leafletMapRef.current && markerRef.current) {
        leafletMapRef.current.setView([newLat, newLng], 15);
        markerRef.current.setLatLng([newLat, newLng]);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-100 flex flex-col">
      {/* Top Map Bar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Explorador GIS y Georreferenciación Normativa
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Arrastra el marcador para inspeccionar densidades, polígonos de impacto y cruces prioritarios
          </p>
        </div>

        {/* Node preset buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {URBAN_NODES.map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => onSelectNode(node)}
                className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-rose-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {node.name.split('&')[0].trim()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map + Side Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
        {/* Leaflet Map Area */}
        <div className="lg:col-span-8 relative bg-slate-950 min-h-[300px] lg:min-h-[380px]">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

          {/* Floating Address Search bar over map */}
          <div className="absolute top-3 left-3 right-3 md:right-auto md:w-80 z-10">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg shadow-lg overflow-hidden">
              <input
                type="text"
                value={addressSearch}
                onChange={(e) => setAddressSearch(e.target.value)}
                placeholder="Buscar cruce (ej. Américas, Minerva...)"
                className="w-full px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 bg-transparent outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition"
              >
                Ir
              </button>
            </form>
          </div>

          {/* Coordinates Pill */}
          <div className="absolute bottom-3 left-3 z-10 bg-slate-950/85 backdrop-blur-sm border border-slate-800 text-[11px] font-mono text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-md">
            <Navigation className="w-3.5 h-3.5 text-rose-400" />
            <span>Lat: <strong className="text-white">{coords.lat}</strong> · Lon: <strong className="text-white">{coords.lng}</strong></span>
          </div>
        </div>

        {/* Real-time Zoning & Regulatory Diagnostic for this point */}
        <div className="lg:col-span-4 bg-[#0d1629] p-4 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Ficha Urbanística
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Zonificación H3-U
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Polígono Municipal:</span>
                <span className="font-semibold text-slate-200 text-right">{selectedNode.polygon}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">COS Máximo permitido:</span>
                <span className="font-mono font-bold text-slate-100">0.70 (70% desplante)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">CUS Máximo:</span>
                <span className="font-mono font-bold text-slate-100">2.10 (3 niveles normativos)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Área permeable requerida:</span>
                <span className="font-mono text-emerald-400 font-semibold">≥ 30% del lote</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Restricción frontal:</span>
                <span className="font-mono text-slate-200">3.00 metros libres</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Aforo Vehicular Pico:</span>
                <span className="font-mono font-bold text-rose-400">{selectedNode.currentTraffic} veh/h</span>
              </div>
            </div>

            {/* Critical alert for this node */}
            <div className="mt-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                <strong>Alerta Normativa:</strong> {selectedNode.criticalPoint}
              </span>
            </div>
          </div>

          {/* Quick Action: Consult with Gemini OLMOS */}
          <div className="space-y-2">
            {onAskAiWithCoords && (
              <>
                <button
                  onClick={() =>
                    onAskAiWithCoords(
                      coords.lat,
                      coords.lng,
                      `Inspección para ${selectedNode.name} (${coords.lat}, ${coords.lng}). Aforo: ${selectedNode.currentTraffic} veh/h, Peatones: ${selectedNode.pedestrians}/h.`
                    )
                  }
                  className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dictaminar Movilidad con URBIN</span>
                </button>
                <button
                  onClick={() =>
                    onAskAiWithCoords(
                      coords.lat,
                      coords.lng,
                      `Analiza este terreno en ${selectedNode.name} (${coords.lat}, ${coords.lng}, Polígono: ${selectedNode.polygon}): ¿Es conveniente construir aquí, qué tipo de edificios admite según la zona, cuál es su altura máxima y qué materiales de cimentación y estructura recomiendas para el suelo de este sector de la ZMG?`
                    )
                  }
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Evaluar Terreno, Alturas & Materiales</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
