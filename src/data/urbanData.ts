/**
 * UrbanBuild Platform - Urban Mobility & Regulatory Data Core
 * Grounded in Jalisco Urban Code, Mobility Law, SEDATU Complete Streets Manual,
 * and Computer Vision (YOLO) telemetry datasets.
 */

export interface TelemetryNode {
  id: string;
  name: string;
  polygon: string;
  lat: number;
  lng: number;
  currentTraffic: number; // veh/h
  pedestrians: number;    // peatones/h
  cyclists: number;       // ciclistas/h
  buses: number;          // buses/h
  congestionLevel: 'Óptimo' | 'Moderado' | 'Crítico';
  cameraStatus: 'Online' | 'Offline' | 'Calibrando';
  fps: number;
  criticalPoint: string;
}

export interface YoloAccumulatedPoint {
  second: number;
  autos_in: number;
  autos_out: number;
  autos_middle: number;
  personas_in: number;
  personas_out: number;
}

export interface ObjectDetectionSec {
  second: number;
  auto: number;
  bicicleta: number;
  bus: number;
  camion: number;
  motocicleta: number;
  persona: number;
}

export interface LaneTelemetry {
  lane: string;
  type: 'IN' | 'OUT';
  vehicleCount: number;
  color: string;
}

export interface NormativeDocument {
  id: string;
  title: string;
  shortTitle: string;
  scope: 'Estatal' | 'Municipal' | 'Federal';
  category: 'Urbanismo' | 'Movilidad' | 'Zonificación' | 'Accesibilidad';
  description: string;
  articlesCount: number;
  lastUpdated: string;
  articles: {
    article: string;
    chapter: string;
    content: string;
    tags: string[];
    technicalRule: string;
  }[];
}

export interface UrbanProject {
  id: string;
  title: string;
  location: string;
  type: 'Cruce Seguro' | 'Ciclovía' | 'Pacificación de Tránsito' | 'Semaforización Inteligente' | 'Accesibilidad Universal';
  estimatedCost: number; // in MXN
  priorityScore: number; // 0 - 10
  priorityLevel: 'Crítica' | 'Alta' | 'Media';
  pedestrianBenefit: number; // beneficiarios diarios
  status: 'Pendiente' | 'Autorizada' | 'En Revisión' | 'Licitación';
  regulatoryBasis: string;
  description: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  module: 'YOLO_VISION' | 'RAG_CORE' | 'DECISION_ENGINE' | 'AUTH' | 'GIS_SYNC';
  message: string;
}

// Telemetry Nodes in Guadalajara Metropolitan Area
export const URBAN_NODES: TelemetryNode[] = [
  {
    id: 'gdl-01',
    name: 'Av. Vallarta & Av. de las Américas',
    polygon: 'Polígono Poniente - Financiero',
    lat: 20.6752,
    lng: -103.3765,
    currentTraffic: 1848,
    pedestrians: 1256,
    cyclists: 317,
    buses: 94,
    congestionLevel: 'Crítico',
    cameraStatus: 'Online',
    fps: 29.8,
    criticalPoint: 'Intersección saturada en giro a la izquierda; conflicto peatón-auto a 12m'
  },
  {
    id: 'gdl-02',
    name: 'Glorieta Minerva & Av. López Mateos',
    polygon: 'Nodo Metropolitano Minerva',
    lat: 20.6743,
    lng: -103.3874,
    currentTraffic: 2420,
    pedestrians: 640,
    cyclists: 185,
    buses: 130,
    congestionLevel: 'Crítico',
    cameraStatus: 'Online',
    fps: 30.0,
    criticalPoint: 'Incorporación alta velocidad; falta de refugios peatonales intermedios'
  },
  {
    id: 'gdl-03',
    name: 'Calzada Independencia & Av. Juárez',
    polygon: 'Centro Histórico & Corredor BRT',
    lat: 20.6766,
    lng: -103.3421,
    currentTraffic: 1120,
    pedestrians: 3890,
    cyclists: 420,
    buses: 260,
    congestionLevel: 'Moderado',
    cameraStatus: 'Online',
    fps: 30.1,
    criticalPoint: 'Alta densidad peatonal en cruce con estación de Macrobús'
  },
  {
    id: 'gdl-04',
    name: 'Av. Revolución & Calzada Olímpica (Politécnica UdeG)',
    polygon: 'Distrito Universitario & Educación',
    lat: 20.6558,
    lng: -103.3284,
    currentTraffic: 1410,
    pedestrians: 2850,
    cyclists: 512,
    buses: 118,
    congestionLevel: 'Moderado',
    cameraStatus: 'Online',
    fps: 29.4,
    criticalPoint: 'Horario escolar pico (06:45 - 08:30); requerimiento urgente de rampa táctil'
  }
];

// Exact data points parsed from User's "Cruces acumulados — AUTOS / PERSONAS" chart
export const YOLO_ACCUMULATED_DATA: YoloAccumulatedPoint[] = [
  { second: 0, autos_in: 0, autos_out: 1, autos_middle: 0, personas_in: 0, personas_out: 0 },
  { second: 2, autos_in: 2, autos_out: 1, autos_middle: 0, personas_in: 0, personas_out: 0 },
  { second: 5, autos_in: 2, autos_out: 3, autos_middle: 0, personas_in: 0, personas_out: 0 },
  { second: 8, autos_in: 2, autos_out: 3, autos_middle: 0, personas_in: 1, personas_out: 0 },
  { second: 9, autos_in: 2, autos_out: 4, autos_middle: 0, personas_in: 1, personas_out: 0 },
  { second: 12, autos_in: 2, autos_out: 4, autos_middle: 0, personas_in: 1, personas_out: 0 },
  { second: 18, autos_in: 2, autos_out: 4, autos_middle: 0, personas_in: 1, personas_out: 0 },
  { second: 19, autos_in: 2, autos_out: 4, autos_middle: 0, personas_in: 3, personas_out: 0 },
  { second: 20, autos_in: 2, autos_out: 4, autos_middle: 0, personas_in: 4, personas_out: 0 },
  { second: 24, autos_in: 2, autos_out: 4, autos_middle: 0, personas_in: 4, personas_out: 0 },
  { second: 25, autos_in: 2, autos_out: 4, autos_middle: 0, personas_in: 5, personas_out: 0 },
  { second: 28, autos_in: 2, autos_out: 4, autos_middle: 0, personas_in: 5, personas_out: 0 },
  { second: 29, autos_in: 2, autos_out: 4, autos_middle: 0, personas_in: 6, personas_out: 0 },
  { second: 30, autos_in: 2, autos_out: 4, autos_middle: 0, personas_in: 7, personas_out: 1 },
  { second: 31, autos_in: 2, autos_out: 5, autos_middle: 0, personas_in: 7, personas_out: 1 },
  { second: 35, autos_in: 2, autos_out: 5, autos_middle: 0, personas_in: 7, personas_out: 2 },
  { second: 36, autos_in: 2, autos_out: 5, autos_middle: 0, personas_in: 8, personas_out: 2 },
  { second: 39, autos_in: 2, autos_out: 5, autos_middle: 0, personas_in: 8, personas_out: 2 },
  { second: 40, autos_in: 2, autos_out: 6, autos_middle: 0, personas_in: 8, personas_out: 2 },
  { second: 42, autos_in: 2, autos_out: 6, autos_middle: 0, personas_in: 8, personas_out: 2 },
  { second: 43, autos_in: 2, autos_out: 6, autos_middle: 1, personas_in: 8, personas_out: 2 },
  { second: 48, autos_in: 2, autos_out: 6, autos_middle: 1, personas_in: 8, personas_out: 2 },
  { second: 49, autos_in: 2, autos_out: 6, autos_middle: 1, personas_in: 9, personas_out: 2 },
  { second: 55, autos_in: 2, autos_out: 6, autos_middle: 1, personas_in: 9, personas_out: 2 },
  { second: 56, autos_in: 2, autos_out: 7, autos_middle: 1, personas_in: 9, personas_out: 2 },
  { second: 57, autos_in: 2, autos_out: 7, autos_middle: 1, personas_in: 9, personas_out: 2 },
  { second: 58, autos_in: 2, autos_out: 8, autos_middle: 1, personas_in: 9, personas_out: 2 },
  { second: 59, autos_in: 2, autos_out: 8, autos_middle: 1, personas_in: 9, personas_out: 2 },
];

// Exact data points from User's "Conteo de objetos por segundo — ejm1" chart
export const YOLO_OBJECT_SERIES: ObjectDetectionSec[] = [
  { second: 0, auto: 1.2, bicicleta: 0.0, bus: 1.0, camion: 5.2, motocicleta: 0.0, persona: 0.0 },
  { second: 1, auto: 1.9, bicicleta: 1.0, bus: 1.0, camion: 3.8, motocicleta: 1.0, persona: 0.0 },
  { second: 2, auto: 2.0, bicicleta: 0.0, bus: 1.0, camion: 3.5, motocicleta: 1.0, persona: 1.0 },
  { second: 3, auto: 1.0, bicicleta: 0.0, bus: 0.0, camion: 4.1, motocicleta: 1.0, persona: 1.0 },
  { second: 4, auto: 1.7, bicicleta: 0.0, bus: 1.0, camion: 3.1, motocicleta: 0.0, persona: 0.0 },
  { second: 5, auto: 1.4, bicicleta: 0.0, bus: 1.0, camion: 1.9, motocicleta: 0.0, persona: 0.0 },
  { second: 6, auto: 2.3, bicicleta: 0.0, bus: 1.0, camion: 1.2, motocicleta: 0.0, persona: 0.0 },
  { second: 7, auto: 4.4, bicicleta: 0.0, bus: 1.0, camion: 2.4, motocicleta: 0.0, persona: 0.0 },
];

// Exact data points from User's "Total por carril / Composición" chart
export const LANE_TELEMETRY_DATA: LaneTelemetry[] = [
  { lane: 'Carril Izq 1 (OUT)', type: 'OUT', vehicleCount: 2, color: '#10b981' },
  { lane: 'Carril Izq 2 (OUT)', type: 'OUT', vehicleCount: 3, color: '#059669' },
  { lane: 'Carril Der 1 (IN)',  type: 'IN',  vehicleCount: 9, color: '#facc15' },
  { lane: 'Carril Der 2 (IN)',  type: 'IN',  vehicleCount: 10, color: '#f59e0b' },
];

// Legal RAG Corpus
export const NORMATIVE_DOCUMENTS: NormativeDocument[] = [
  {
    id: 'doc-codigo-urbano',
    title: 'Código Urbano para el Estado de Jalisco',
    shortTitle: 'Código Urbano Jalisco',
    scope: 'Estatal',
    category: 'Urbanismo',
    description: 'Normativa rectora del ordenamiento territorial, densidades de edificación, cesiones públicas y coeficientes de ocupación (COS) y utilización (CUS).',
    articlesCount: 412,
    lastUpdated: 'Reforma 2024 / Vigente 2026',
    articles: [
      {
        article: 'Artículo 45',
        chapter: 'Capítulo IV: De la Infraestructura y Espacio Peatonal',
        content: 'Las vías públicas, banquetas y cruces urbanos contarán obligatoriamente con elementos de accesibilidad universal, rampas con pendientes no mayores al 8% y señalización táctica adecuada para garantizar la seguridad de transeúntes.',
        tags: ['accesibilidad', 'rampas', 'banquetas', 'pendientes'],
        technicalRule: 'Pendiente máxima permitida: 8%. Ancho libre peatonal continuo: mínimo 1.50 metros.'
      },
      {
        article: 'Artículo 142',
        chapter: 'Capítulo VIII: Coeficientes de Aprovechamiento (COS y CUS)',
        content: 'El Coeficiente de Ocupación del Suelo (COS) determinará la superficie máxima de desplante de edificación sobre el predio. Para densidades medias (H3), el COS no superará 0.70 y el CUS máximo será 2.10, reservando al menos 30% como área absorbente permeable.',
        tags: ['cos', 'cus', 'absorbente', 'densidad', 'h3'],
        technicalRule: 'COS = Superficie desplantada / Área total del predio. Mínimo 30% superficie permeable no pavimentada.'
      },
      {
        article: 'Artículo 218',
        chapter: 'Capítulo XII: Áreas de Cesión para Destinos Públicos',
        content: 'Todo proyecto de urbanización o fraccionamiento habitacional cederá al Municipio a título gratuito como mínimo el 16% del área vendible para áreas verdes, parques, equipamiento educativo y recreativo.',
        tags: ['cesion', 'areas verdes', 'parques', 'equipamiento'],
        technicalRule: 'Cesión obligatoria: 16% de superficie vendible para parques y equipamiento público municipal.'
      }
    ]
  },
  {
    id: 'doc-ley-movilidad',
    title: 'Ley de Movilidad, Seguridad Vial y Transporte de Jalisco',
    shortTitle: 'Ley de Movilidad Jalisco',
    scope: 'Estatal',
    category: 'Movilidad',
    description: 'Marco legal que consagra el Derecho Humano a la Movilidad, la jerarquía de usuarios y la seguridad vial bajo el enfoque de Sistema Seguro Visión Cero.',
    articlesCount: 298,
    lastUpdated: 'Armonizada Ley General de Movilidad 2025',
    articles: [
      {
        article: 'Artículo 12',
        chapter: 'Capítulo I: De la Jerarquía de la Movilidad',
        content: 'Las políticas públicas de transporte y diseño urbano darán estricta prioridad en el siguiente orden: 1° Personas peatonas, con énfasis en personas con discapacidad y movilidad reducida; 2° Personas ciclistas; 3° Usuarios de transporte público colectivo; 4° Transporte de carga y distribución de bienes; 5° Automotores particulares.',
        tags: ['jerarquia', 'peatones', 'prioridad', 'movilidad reducida'],
        technicalRule: 'La asignación de presupuesto y espacio de calle debe priorizar los modos 1 y 2 por sobre el flujo automotor.'
      },
      {
        article: 'Artículo 54',
        chapter: 'Capítulo VI: Límites de Velocidad Urbana',
        content: 'La velocidad máxima permitida en vías secundarias y calles terciarias será de 30 km/h; en entornos escolares, hospitalarios y asilos será de 20 km/h; y en vías primarias con control de accesos hasta 50 km/h.',
        tags: ['velocidad', 'zonas escolares', 'calles 30', 'seguridad vial'],
        technicalRule: 'Límite en zonas escolares: 20 km/h con reductores trapezoidales a nivel de banqueta obligatorios.'
      },
      {
        article: 'Artículo 88',
        chapter: 'Capítulo IX: Infraestructura Ciclista Confinada',
        content: 'En vialidades con flujos superiores a 1,200 vehículos/hora y velocidades superiores a 40 km/h, la infraestructura ciclista deberá ser obligatoriamente segregada mediante confinamientos físicos de al menos 0.50m de buffer.',
        tags: ['ciclovias', 'confinamiento', 'aforos', 'buffer'],
        technicalRule: 'Ciclovía segregada unidireccional mínima: 1.50m libres + 0.50m de protección física.'
      }
    ]
  },
  {
    id: 'doc-sedatu-calles',
    title: 'Manual de Calles: Diseño Vial para Ciudades Mexicanas (SEDATU)',
    shortTitle: 'Manual de Calles SEDATU',
    scope: 'Federal',
    category: 'Urbanismo',
    description: 'Guía técnica federal de ingeniería de tránsito y diseño geométrico para calles completas, cruceros seguros y reducción de muertes viales.',
    articlesCount: 185,
    lastUpdated: 'SEDATU Versión 2.0',
    articles: [
      {
        article: 'Sección 3.2',
        chapter: 'Capítulo III: Criterios Geométricos de Cruceros',
        content: 'Los radios de curvatura en esquina no deberán exceder 3.00 a 4.50 metros en calles locales y colectoras, a fin de acortar la distancia de cruce peatonal y obligar a los automovilistas a virar a velocidades seguras (< 15 km/h).',
        tags: ['radios de giro', 'cruceros seguros', 'distancia de cruce'],
        technicalRule: 'Radio de esquina máximo: 3.5m con orejas de banqueta peatonales en esquinas.'
      },
      {
        article: 'Sección 4.1',
        chapter: 'Capítulo IV: Cruces Peatonales a Nivel de Banqueta (Mesetas)',
        content: 'En intersecciones donde el aforo peatonal supere 400 personas/hora o en inmediaciones de centros educativos, los pasos peatonales se elevarán a nivel de banqueta (meseta trapezoidal de 0.15m de altura con rampas vehiculares de transición al 10%).',
        tags: ['meseta', 'cruce elevado', 'paso peatonal', 'calmado de transito'],
        technicalRule: 'Altura meseta: 0.15m (enrasado con banqueta); ancho de meseta: mínimo 4.00m; rampa de aproximación vehicular: 1.50m.'
      }
    ]
  },
  {
    id: 'doc-reglamento-gdl',
    title: 'Reglamento para Personas con Discapacidad del Municipio de Guadalajara',
    shortTitle: 'Reglamento Accesibilidad GDL',
    scope: 'Municipal',
    category: 'Accesibilidad',
    description: 'Especificaciones arquitectónicas y urbanas obligatorias para la eliminación de barreras físicas en el espacio público del municipio.',
    articlesCount: 96,
    lastUpdated: 'Reglamento Municipal Guadalajara',
    articles: [
      {
        article: 'Artículo 24',
        chapter: 'Capítulo III: Pavimento Táctil y Señalización Podotáctil',
        content: 'Toda rampa de esquina y aproximación a crucero deberá contar con una franja de advertencia podotáctil de botones de 0.30m a 0.60m de ancho en contraste cromático amarillo o terracota, colocada a 0.30m del borde del arroyo vehicular.',
        tags: ['guia podotactil', 'botones', 'ceguera', 'contraste'],
        technicalRule: 'Franja de advertencia táctil: 60cm de ancho con contraste visual mínimo de 70% sobre el pavimento adyacente.'
      }
    ]
  }
];

// Decision Matrix / Municipal Investment Projects
export const INITIAL_PROJECTS: UrbanProject[] = [
  {
    id: 'proj-01',
    title: 'Intervención Integral Av. Vallarta & Américas',
    location: 'Av. Vallarta & Av. de las Américas',
    type: 'Cruce Seguro',
    estimatedCost: 1850000,
    priorityScore: 9.8,
    priorityLevel: 'Crítica',
    pedestrianBenefit: 14200,
    status: 'Pendiente',
    regulatoryBasis: 'Código Urbano Jalisco Art. 45 + SEDATU Sec 4.1',
    description: 'Construcción de cruce peatonal a nivel de banqueta (meseta), ampliación de orejas en esquinas, reconfiguración semafórica con fase exclusiva peatonal de 28 segundos.'
  },
  {
    id: 'proj-02',
    title: 'Entorno Escolar Seguro Politécnica UdeG',
    location: 'Av. Revolución & Calzada Olímpica',
    type: 'Pacificación de Tránsito',
    estimatedCost: 920000,
    priorityScore: 9.4,
    priorityLevel: 'Crítica',
    pedestrianBenefit: 8900,
    status: 'Autorizada',
    regulatoryBasis: 'Ley de Movilidad Jalisco Art. 54 + Reg. GDL Art. 24',
    description: 'Reductores trapezoidales de velocidad a 20 km/h, semáforo con pulsador peatonal, guías podotáctiles en banquetas circundantes a la Escuela Politécnica.'
  },
  {
    id: 'proj-03',
    title: 'Conexión Ciclista Segregada Circunvalación',
    location: 'Av. Circunvalación División del Norte',
    type: 'Ciclovía',
    estimatedCost: 3400000,
    priorityScore: 8.6,
    priorityLevel: 'Alta',
    pedestrianBenefit: 6300,
    status: 'Pendiente',
    regulatoryBasis: 'Ley de Movilidad Jalisco Art. 88',
    description: 'Ciclovía bidireccional de 2.80m segregada con balizas reflectivas y confinamiento de concreto hidráulico, conexión directa con troncal 3 de tren ligero.'
  },
  {
    id: 'proj-04',
    title: 'Redistribución de Carriles y Radares Nodo Minerva',
    location: 'Glorieta Minerva',
    type: 'Semaforización Inteligente',
    estimatedCost: 2150000,
    priorityScore: 8.1,
    priorityLevel: 'Alta',
    pedestrianBenefit: 5100,
    status: 'En Revisión',
    regulatoryBasis: 'SEDATU Sec 3.2 + Código Urbano Art. 45',
    description: 'Sensores de visión por computadora para conteo dinámico vehicular, ajuste adaptativo de semáforos y refugios peatonales con bolardos de acero al carbono.'
  },
  {
    id: 'proj-05',
    title: 'Rehabilitación de Banquetas y Guías Podotáctiles Centro',
    location: 'Calzada Independencia & Juárez',
    type: 'Accesibilidad Universal',
    estimatedCost: 1650000,
    priorityScore: 7.9,
    priorityLevel: 'Media',
    pedestrianBenefit: 22000,
    status: 'Autorizada',
    regulatoryBasis: 'Reglamento para Personas con Discapacidad GDL Art. 24',
    description: 'Renivelación de 1.4 km de aceras peatonales, eliminación de postes obsoletos, colocación de losetas podotáctiles direccionales y de advertencia.'
  },
  {
    id: 'proj-06',
    title: 'Iluminación Táctica y Bahía de Transporte Masivo',
    location: 'Calzada Independencia Norte (Polígono Estadio)',
    type: 'Pacificación de Tránsito',
    estimatedCost: 1100000,
    priorityScore: 7.4,
    priorityLevel: 'Media',
    pedestrianBenefit: 7800,
    status: 'Licitación',
    regulatoryBasis: 'Manual de Calles SEDATU Sec 5.3',
    description: 'Bahía segregada de ascenso y descenso de pasajeros de transporte público para evitar bloqueo de carriles continuos e iluminación LED a 4500K.'
  }
];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'log-01',
    timestamp: '08:45:12',
    level: 'INFO',
    module: 'YOLO_VISION',
    message: 'Pipeline YOLOv8 iniciado en nodo Av. Vallarta & Américas (FPS: 29.8, Res: 1920x1080).'
  },
  {
    id: 'log-02',
    timestamp: '08:48:33',
    level: 'INFO',
    module: 'RAG_CORE',
    message: 'Base vectorial RAG sincronizada: 4 reglamentos activos (Código Urbano, Movilidad, SEDATU, GDL Accesibilidad).'
  },
  {
    id: 'log-03',
    timestamp: '09:05:19',
    level: 'WARN',
    module: 'YOLO_VISION',
    message: 'Nodo Av. Vallarta: flujo vehicular superó umbral crítico configurado (1,848 veh/h > 1,500 veh/h).'
  },
  {
    id: 'log-04',
    timestamp: '09:12:00',
    level: 'INFO',
    module: 'DECISION_ENGINE',
    message: 'Matriz ejecutiva recalculada: Proyecto #proj-01 asignado a nivel de prioridad Crítica (Score 9.8/10).'
  },
  {
    id: 'log-05',
    timestamp: '09:30:45',
    level: 'INFO',
    module: 'AUTH',
    message: 'Sesión pericial iniciada por Admin_GDL (Escuela Politécnica de Guadalajara).'
  }
];
