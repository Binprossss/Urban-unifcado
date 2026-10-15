/**
 * UrbanBuild - Motor Experto de Aptitud de Terreno, Tipologías de Edificación, Alturas y Materiales
 * Fundamentado en:
 * - Código Urbano del Estado de Jalisco (Art. 142, 176, 218 y reformas)
 * - Reglamento Estatal de Zonificación de Jalisco (Cuadros 10 al 21, Matrices de Usos)
 * - POTmet (IMEPLAN - Plan de Ordenamiento Territorial Metropolitano ZMG)
 * - Normas Técnicas Complementarias de Diseño Sísmico y Estructural del Estado de Jalisco
 */

export type TipoSueloZMG =
  | 'pomez_jalisco'      // Jal / Toba pomítica (Común en Guadalajara, Zapopan, Providencia)
  | 'arcilloso_expansivo' // Arcillas negras expansivas (Tlajomulco, Tonalá, El Salto)
  | 'rocoso_basaltico'    // Roca basáltica / Cerro del Colli / Huentitán
  | 'aluvial_lacustre'    // Aluvión / Márgenes lacustres / Cajititlán / Atemajac
  | 'relleno_heterogeneo'; // Antiguos cauces entubados (San Juan de Dios, Plaza del Sol)

export type TopografiaTerreno =
  | 'plano'         // Pendiente < 5%
  | 'moderada'      // Pendiente 5% a 15%
  | 'escarpada'     // Pendiente > 15% (Laderas Colli, Huentitán)
  | 'hondonada';     // Punto bajo de cuenca con riesgo de anegamiento

export interface TerrenoCaracteristicas {
  superficieM2: number;
  frenteMetros?: number;
  fondoMetros?: number;
  zonaUrbana: string; // H1-U, H2-U, H3-U, H4-U, MC, MB, CS3, I1
  municipio?: string; // Guadalajara, Zapopan, Tlajomulco, etc.
  tipoSuelo: TipoSueloZMG;
  topografia: TopografiaTerreno;
  colindanciaVial?: 'local_residencial' | 'colectora' | 'arteria_principal' | 'avenida_brt';
}

export interface RecomendacionEdificacion {
  tipologiaRecomendada: string;
  esConvenienteConstruir: boolean;
  viabilidadGeneral: 'Alta Viabilidad' | 'Viabilidad Condicionada' | 'Baja Viabilidad / Restringido';
  nivelRiesgo: 'Bajo' | 'Moderado' | 'Alto';
  resumenDictamen: string;
  
  // Alturas y Coeficientes
  alturaMaximaNiveles: number;
  alturaMaximaMetros: number;
  fundamentoAltura: string;
  cosRecomendado: number;
  cusRecomendado: number;
  desplanteMaxM2: number;
  construccionTotalM2: number;
  areaPermeableM2: number; // 20% obligatorio Art. 142

  // Materiales de Construcción dictaminados
  materialesCimentacion: {
    sistema: string;
    descripcion: string;
    resistenciaMinima: string;
  };
  materialesEstructura: {
    sistema: string;
    materiales: string[];
    especificacion: string;
  };
  materialesEnvolventeYFachada: {
    recomendados: string[];
    acabadosSustentables: string[];
    revestimientosEvitar: string[];
  };

  // Justificación técnica y normativa
  fundamentoJuridico: string[];
  condicionantesTecnicas: string[];
  eficienciaSustentable: string[];
}

export const TIPOS_SUELO_METADATA: Record<TipoSueloZMG, {
  nombre: string;
  descripcion: string;
  capacidadCargaAprox: string; // kg/cm2 o ton/m2
  municipiosFrecuentes: string;
  comportamientoSismico: string;
}> = {
  pomez_jalisco: {
    nombre: 'Jal / Toba Pomítica (Pómez Guadalajara)',
    descripcion: 'Suelo de origen volcánico típico del Valle de Atemajac. Friccionante con alta permeabilidad, compresibilidad moderada y buena respuesta sísmica cuando está confinado.',
    capacidadCargaAprox: '1.2 - 2.5 kg/cm²',
    municipiosFrecuentes: 'Guadalajara Centro/Poniente, Zapopan Central, Providencia, Minerva',
    comportamientoSismico: 'Tipo I / II (Zona de transición estable)',
  },
  arcilloso_expansivo: {
    nombre: 'Arcilla Expansiva (Vertisoles Negros)',
    descripcion: 'Suelos con alto potencial de contracción y expansión volumétrica ante cambios de humedad. Suceptibles a asentamientos diferenciales y fisuras estructurales.',
    capacidadCargaAprox: '0.8 - 1.5 kg/cm²',
    municipiosFrecuentes: 'Tlajomulco de Zúñiga, Tonalá, El Salto, Valle Imperial',
    comportamientoSismico: 'Tipo III (Suelo blando con amplificación de periodos largos)',
  },
  rocoso_basaltico: {
    nombre: 'Roca Basáltica y Andesítica Firme',
    descripcion: 'Estratos rocosos de alta competencia y cohesión mecánica. Excelente soporte para cimentaciones pesadas y torres elevadas.',
    capacidadCargaAprox: '4.0 - 8.0+ kg/cm²',
    municipiosFrecuentes: 'Paseos del Sol, Cerro del Colli, Huentitán, Bugambilias',
    comportamientoSismico: 'Tipo I (Roca firme, mínima amplificación dinámica)',
  },
  aluvial_lacustre: {
    nombre: 'Depósito Aluvial / Limo Lacustre',
    descripcion: 'Sedimentos finos saturados con nivel freático somero (1.5 - 3.5 m). Requiere abatimiento de agua o cajones de cimentación compensada.',
    capacidadCargaAprox: '0.6 - 1.2 kg/cm²',
    municipiosFrecuentes: 'Ribera de Cajititlán, Cuenca de Atemajac, Chapalita baja',
    comportamientoSismico: 'Tipo III (Alta deformabilidad y riesgo de licuación localizada)',
  },
  relleno_heterogeneo: {
    nombre: 'Relleno Antrópico / Cauce Antiguo Modificado',
    descripcion: 'Materiales no consolidados en antiguos arroyos entubados o depresiones rellenadas. Prohibida cimentación superficial directa sin mejoramiento.',
    capacidadCargaAprox: '< 0.8 kg/cm² (Heterogénea)',
    municipiosFrecuentes: 'Entorno Río San Juan de Dios, Plaza del Sol, El Chicalote',
    comportamientoSismico: 'Crítico (Asentamientos diferenciales severos)',
  },
};

export const TOPOGRAFIA_METADATA: Record<TopografiaTerreno, {
  nombre: string;
  impactoEdificacion: string;
  restriccionCorte: string;
}> = {
  plano: {
    nombre: 'Plano regular (< 5% pendiente)',
    impactoEdificacion: 'Ideal para desplantes ortogonales sin muros de contención mayores.',
    restriccionCorte: 'Movimiento de tierras estándar, fácil drenaje por gravedad.',
  },
  moderada: {
    nombre: 'Pendiente Moderada (5% a 15%)',
    impactoEdificacion: 'Excelente para proyectos escalonados, semisótanos y terrazas aprovechables.',
    restriccionCorte: 'Requiere muretes de contención perimetrales y estabilización de taludes.',
  },
  escarpada: {
    nombre: 'Pendiente Escarpada (> 15%)',
    impactoEdificacion: 'Restricción severa POTmet: Prohibida torre masiva continua; sólo edificación aterrazada.',
    restriccionCorte: 'Estudio de mecánica de rocas obligatorio; taludes con anclajes y concreto lanzado.',
  },
  hondonada: {
    nombre: 'Hondonada / Vaso Natural de Escurrimiento',
    impactoEdificacion: 'Alto riesgo de inundación pluvial; requiere nivel de piso terminado +0.90m sobre rasante.',
    restriccionCorte: 'Obligatorio sistema de cárcamo de bombeo y pozos de absorción certificados.',
  },
};

/**
 * Función central de evaluación pericial por terreno
 */
export function evaluarConvenienciaPorTerreno(input: TerrenoCaracteristicas): RecomendacionEdificacion {
  const { superficieM2, zonaUrbana, tipoSuelo, topografia, colindanciaVial } = input;
  const superficie = Math.max(1, superficieM2);

  // 1. Identificar zona base
  let cosNormativo = 0.70;
  let cusNormativo = 2.10;
  let nivelesBase = 3;
  let nombreZona = 'Habitacional Densidad Media (H3-U)';
  let tipoUso = 'residencial';

  switch (zonaUrbana) {
    case 'H1-U':
      cosNormativo = 0.40; cusNormativo = 0.80; nivelesBase = 2; nombreZona = 'Habitacional Densidad Mínima'; tipoUso = 'unifamiliar_baja'; break;
    case 'H2-U':
      cosNormativo = 0.60; cusNormativo = 1.20; nivelesBase = 2; nombreZona = 'Habitacional Densidad Baja'; tipoUso = 'unifamiliar_media'; break;
    case 'H3-U':
      cosNormativo = 0.70; cusNormativo = 2.10; nivelesBase = 3; nombreZona = 'Habitacional Densidad Media'; tipoUso = 'mixto_residencial'; break;
    case 'H4-U':
      cosNormativo = 0.75; cusNormativo = 3.00; nivelesBase = 4; nombreZona = 'Habitacional Densidad Alta'; tipoUso = 'plurifamiliar_vertical'; break;
    case 'MC':
      cosNormativo = 0.80; cusNormativo = 4.00; nivelesBase = 8; nombreZona = 'Mixto Central Metropolitano'; tipoUso = 'mixto_torres'; break;
    case 'MB':
      cosNormativo = 0.70; cusNormativo = 2.40; nivelesBase = 4; nombreZona = 'Mixto Barrial Comercio y Vivienda'; tipoUso = 'mixto_comercial'; break;
    case 'CS3':
      cosNormativo = 0.80; cusNormativo = 2.40; nivelesBase = 4; nombreZona = 'Comercio y Servicios Distrital'; tipoUso = 'comercial_servicios'; break;
    case 'I1':
      cosNormativo = 0.70; cusNormativo = 1.40; nivelesBase = 2; nombreZona = 'Industrial Ligero e Inofensivo'; tipoUso = 'industrial_bodegas'; break;
    default:
      cosNormativo = 0.70; cusNormativo = 2.10; nivelesBase = 3; break;
  }

  // 2. Moduladores por tipo de suelo y topografía
  let alturaMaximaNiveles = nivelesBase;
  let esConvenienteConstruir = true;
  let viabilidadGeneral: RecomendacionEdificacion['viabilidadGeneral'] = 'Alta Viabilidad';
  let nivelRiesgo: RecomendacionEdificacion['nivelRiesgo'] = 'Bajo';
  const condicionantesTecnicas: string[] = [];
  const fundamentoJuridico: string[] = [
    'Código Urbano del Estado de Jalisco: Art. 142 (Área absorbente 20% obligatoria en predio).',
    'Código Urbano del Estado de Jalisco: Art. 176 (Cesión de destinos públicos 16% en desarrollo habitacional / 13% en comercial).',
    'Reglamento Estatal de Zonificación: Matriz de compatibilidad y coeficientes COS/CUS.',
    'Normas Técnicas Ambientales de Jalisco: Protección de acuíferos y recarga hidrológica ZMG.'
  ];

  // Ajustes de conveniencia según superficie del lote
  if (superficie < 90 && (zonaUrbana === 'H3-U' || zonaUrbana === 'H4-U' || zonaUrbana === 'MC')) {
    condicionantesTecnicas.push(`Lote menor a 90 m²: Incompatible con desarrollo plurifamiliar vertical. Se limita a vivienda unifamiliar o local comercial en PB.`);
    alturaMaximaNiveles = Math.min(alturaMaximaNiveles, 2);
  } else if (superficie >= 1000 && (zonaUrbana === 'MC' || zonaUrbana === 'H4-U') && colindanciaVial === 'arteria_principal') {
    // Bonificación de densidad en corredores de transporte de acuerdo a POTmet
    alturaMaximaNiveles = Math.min(16, Math.floor(nivelesBase * 1.8));
    condicionantesTecnicas.push(`Predio apto para transferencia de derechos CUSMAX (POTmet IMEPLAN corredores de movilidad sustentable).`);
  }

  // Filtros por SUELO
  if (tipoSuelo === 'arcilloso_expansivo') {
    nivelRiesgo = 'Moderado';
    viabilidadGeneral = 'Viabilidad Condicionada';
    condicionantesTecnicas.push('Presencia de arcillas expansivas activas: Prohibida zapata aislada superficial sin mejoramiento.');
    condicionantesTecnicas.push('Obligatorio colchón de grava triturada compactada de 40-60 cm y losa de cimentación aligerada o contratrabes de rigidez.');
    if (alturaMaximaNiveles > 5) {
      alturaMaximaNiveles = 5;
      condicionantesTecnicas.push('Restricción de altura a 5 niveles a menos de pilotear a estrato firme (> 8.0m de profundidad).');
    }
  } else if (tipoSuelo === 'relleno_heterogeneo') {
    nivelRiesgo = 'Alto';
    viabilidadGeneral = 'Baja Viabilidad / Restringido';
    condicionantesTecnicas.push('Relleno antrópico / antiguo cauce: Riesgo alto de hundimientos diferenciales.');
    condicionantesTecnicas.push('Cimentación profunda obligatoria mediante micropilotes o pilotes prebarrenados hincados hasta roca.');
    if (alturaMaximaNiveles > 3) alturaMaximaNiveles = 3;
  } else if (tipoSuelo === 'aluvial_lacustre') {
    nivelRiesgo = 'Moderado';
    viabilidadGeneral = 'Viabilidad Condicionada';
    condicionantesTecnicas.push('Nivel freático somero y depósitos lacustres: Requiere cárcamos de bombeo y muros pantalla o losa de supresión hidrostática.');
    if (alturaMaximaNiveles > 6) alturaMaximaNiveles = 6;
  } else if (tipoSuelo === 'rocoso_basaltico') {
    condicionantesTecnicas.push('Suelo basáltico de alta capacidad portante (> 4 kg/cm²): Excelente estabilidad sísmica y soporte de cargas verticales.');
    if (zonaUrbana === 'MC' && superficie >= 600) {
      alturaMaximaNiveles = Math.max(alturaMaximaNiveles, 10);
    }
  }

  // Filtros por TOPOGRAFÍA
  if (topografia === 'escarpada') {
    viabilidadGeneral = 'Viabilidad Condicionada';
    nivelRiesgo = nivelRiesgo === 'Bajo' ? 'Moderado' : 'Alto';
    alturaMaximaNiveles = Math.min(alturaMaximaNiveles, 3);
    cosNormativo = Math.min(cosNormativo, 0.50);
    condicionantesTecnicas.push('Pendiente superior al 15%: Restricción ambiental POTmet. Prohibidas grandes excavaciones continuas; edificación aterrazada escalonada con muros gavión o concreto armado.');
  } else if (topografia === 'hondonada') {
    viabilidadGeneral = 'Viabilidad Condicionada';
    nivelRiesgo = 'Alto';
    condicionantesTecnicas.push('Riesgo de escurrimiento pluvial torrencial: El desplante debe elevarse +80 cm sobre nivel de calle e incorporar jardines de lluvia con infiltración acelerada.');
  }

  // 3. Tipología constructiva y materiales sugeridos
  let tipologiaRecomendada = '';
  const materialesEstructura = {
    sistema: '',
    materiales: [] as string[],
    especificacion: '',
  };
  const materialesCimentacion = {
    sistema: '',
    descripcion: '',
    resistenciaMinima: 'f\'c = 250 kg/cm²',
  };
  const materialesEnvolventeYFachada = {
    recomendados: [] as string[],
    acabadosSustentables: [] as string[],
    revestimientosEvitar: [] as string[],
  };

  // Asignar materiales y tipología
  if (tipoUso === 'industrial_bodegas') {
    tipologiaRecomendada = 'Nave Industrial Ligera, Centro Logístico o Almacén Tecnológico con Patio de Maniobras';
    materialesEstructura.sistema = 'Estructura Metálica A-572 Grado 50 con Marcos Rígidos de Acero y Cubierta Térmica SSR-KR18';
    materialesEstructura.materiales = ['Perfiles de acero estructural IPR/IR', 'Cubierta termoacústica panel sandwich PIR', 'Pisos industriales de concreto con fibra metálica'];
    materialesEstructura.especificacion = 'Resistencia a viento 140 km/h y sobrecargas de operación industrial.';
    materialesCimentacion.sistema = 'Zapatas Aisladas con Trabe de Liga Perimetral y Pedestales de Concreto Armado';
    materialesCimentacion.descripcion = 'Diseñado para anclaje de columnas metálicas y pisos de alta capacidad de carga puntual.';
    materialesEnvolventeYFachada.recomendados = ['Panel metálico aislado arquitectónico', 'Faldón de block hueco de concreto confinado a 2.50m', 'Louvers de ventilación pasiva gravimétrica'];
    materialesEnvolventeYFachada.acabadosSustentables = ['Láminas translúcidas de policarbonato 12% para iluminación diurna natural', 'Pinturas reflectivas blancas de alta emisividad solar (SRI > 82)'];
    materialesEnvolventeYFachada.revestimientosEvitar = ['Mampostería simple sin refuerzo', 'Fachadas de vidrio continuo sin amortiguamiento acústico'];
  } else if (alturaMaximaNiveles >= 6 || zonaUrbana === 'MC') {
    tipologiaRecomendada = `Edificio de Uso Mixto Vertical (Comercio en Planta Baja + Oficinas / Departamentos Residenciales en Pisos Superiores)`;
    materialesEstructura.sistema = 'Estructura Híbrida de Concreto Armado con Núcleos de Cortante y Trabes Preforzadas Postensadas';
    materialesEstructura.materiales = ['Concreto estructural f\'c = 350 - 450 kg/cm²', 'Acero de refuerzo ASTM A615 Grado 60', 'Losas postensadas aligeradas'];
    materialesEstructura.especificacion = 'Factor sísmico ZMG Q=3 o Q=4 con amortiguamiento viscoelástico.';
    materialesCimentacion.sistema = tipoSuelo === 'rocoso_basaltico'
      ? 'Zapatas Corridas / Losa Maciza de Cimentación de 80 cm sobre estrato rocoso'
      : 'Losa de Cimentación Compensada de 1.10m con Muros de Contención Milán de Sótano';
    materialesCimentacion.descripcion = 'Aprovechamiento de 1 a 3 niveles subterráneos para dotación obligatoria de cajones de estacionamiento según Cuadro 48.';
    materialesEnvolventeYFachada.recomendados = ['Fachada ventilada de porcelanato extruido o terracota', 'Vidrio doble Low-E con cámara de gas argón (control térmico ZMG)', 'Celosías cerámicas tradicionales de la región (Tlaquepaque/Tonalá) para sombra solar pasiva'];
    materialesEnvolventeYFachada.acabadosSustentables = ['Concreto aparente con aditivos impermeabilizantes ecológicos', 'Jardineras colgantes en balcones como barrera térmica microclimática'];
    materialesEnvolventeYFachada.revestimientosEvitar = ['Pinturas plásticas que bloqueen la transpiración', 'Muro cortina de cristal monolítico sin parasoles (provoca efecto invernadero severo)'];
  } else if (zonaUrbana === 'H4-U' || alturaMaximaNiveles >= 4) {
    tipologiaRecomendada = 'Complejo Habitacional Plurifamiliar Vertical de Mediana Altura (Townhouses o Departamentos en 4 Niveles)';
    materialesEstructura.sistema = 'Muros de Carga de Mampostería Confinada de Concreto y Columnas de Concreto Armado';
    materialesEstructura.materiales = ['Block de concreto vibrocomprimido de alta resistencia (resistencia neta > 100 kg/cm²)', 'Castillos y dalas ahogadas con concreto f\'c = 250 kg/cm²', 'Vigueta y bovedilla de poliestireno o losa maciza perimetral'];
    materialesEstructura.especificacion = 'Muros confinados en dos direcciones ortogonales con arriostramiento sísmico.';
    materialesCimentacion.sistema = 'Zapatas Corridas de Concreto Armado con Contratrabes Rigidizadoras';
    materialesCimentacion.descripcion = 'Desplante a mínimo 1.20m para librar capa vegetal y arcillas superficiales.';
    materialesEnvolventeYFachada.recomendados = ['Aplanados de mortero cemento-arena hidrófugo', 'Ladrillo de jaltepec / adobón regional aparente con sellador acrílico permeable al vapor', 'Cancelería de aluminio anodizado línea europea con rotura de puente térmico'];
    materialesEnvolventeYFachada.acabadosSustentables = ['Techos verdes ligeros de sedum o azotea con pintura elastomérica blanca reflectiva', 'Adoquín permeable tipo ecológico en cajones de estacionamiento al aire libre'];
    materialesEnvolventeYFachada.revestimientosEvitar = ['Tabique rojo recocido defectuoso con alto salitre', 'Piedras pesadas en cantiliver sin fijación mecánica'];
  } else {
    tipologiaRecomendada = 'Residencia Unifamiliar Sustentable o Dúplex de Arquitectura Bioclimática';
    materialesEstructura.sistema = 'Mampostería Confinada Tradicional de Ladrillo Rojo Recocido o Block con Marcos Rígidos Ligeros';
    materialesEstructura.materiales = ['Ladrillo de barro recocido regional o block térmico de jaltepec', 'Concreto armado f\'c = 200 - 250 kg/cm²', 'Vigas IPR de acero en claros mayores a 4.5 metros'];
    materialesEstructura.especificacion = 'Excelente masa térmica para amortiguar la oscilación térmica cálida del clima semihúmedo de Guadalajara.';
    materialesCimentacion.sistema = 'Zapatas Corridas de Mampostería de Piedra Brava o Losa de Cimentación de 20 cm';
    materialesCimentacion.descripcion = 'Cimentación elástica y económica con capa separadora de polietileno de 600 calibres contra humedad ascendente.';
    materialesEnvolventeYFachada.recomendados = ['Estucos minerales a la cal tradicionales', 'Madera tratada para exteriores o perfiles de madera compuesta (WPC)', 'Parasoles de acero y herrería artesanal'];
    materialesEnvolventeYFachada.acabadosSustentables = ['Pavimento permeable tipo Adocreto césped en el 20% absorbente', 'Calentadores solares integrados en azotea y cisterna de captación pluvial'];
    materialesEnvolventeYFachada.revestimientosEvitar = ['Piedra laja no fijada que se desprenda con sismos leves'];
  }

  // Cálculos de áreas
  const alturaMetros = alturaMaximaNiveles * 3.10; // Promedio 3.10m por entrepiso en ZMG
  const desplanteMaxM2 = Math.round(superficie * cosNormativo);
  const construccionTotalM2 = Math.round(superficie * Math.min(cusNormativo, cosNormativo * alturaMaximaNiveles));
  const areaPermeableM2 = Math.round(superficie * 0.20); // 20% obligatorio Art. 142

  // Eficiencia sustentable
  const eficienciaSustentable = [
    `Reserva del 20% permeable (${areaPermeableM2} m²): Obligatoria por Art. 142 del Código Urbano para recarga del acuífero Atemajac-Toluquilla.`,
    `Aprovechamiento Solar Pasivo: Orientación preferente Norte-Sur para fachadas principales de estancia para minimizar asoleamiento vespertino en ZMG.`,
    `Ventilación Cruzada: Cruce de ventilación natural aprovechando los vientos dominantes del Oeste/Suroeste en la metrópoli tapatía.`,
    `Materiales Regionales de Baja Huella de Carbono: Uso de jaltepec, toba pomítica y ladrillo artesanal de Tonalá que reducen la huella de transporte.`
  ];

  const resumenDictamen = `Para este predio de **${superficie.toLocaleString()} m²** ubicado en zonificación **${zonaUrbana} (${nombreZona})** con suelo **${TIPOS_SUELO_METADATA[tipoSuelo].nombre}** y topografía **${TOPOGRAFIA_METADATA[topografia].nombre}**, la IA dictamina **${viabilidadGeneral.toUpperCase()}** para el desarrollo de: **${tipologiaRecomendada}**.\n\n` +
    `• **Altura conveniente:** Máximo **${alturaMaximaNiveles} niveles** (${alturaMetros.toFixed(1)} metros de rasante a cumbrera).\n` +
    `• **Superficie de ocupación (COS):** Hasta **${desplanteMaxM2} m²** en planta baja (${(cosNormativo * 100).toFixed(0)}%).\n` +
    `• **Construcción total edificable (CUS):** Hasta **${construccionTotalM2} m²**.\n` +
    `• **Suelo absorbente permeable (Art. 142):** Mínimo **${areaPermeableM2} m²** libres de losas o concreto.\n` +
    `• **Materiales clave recomendados:** ${materialesEstructura.sistema}; cimentación con ${materialesCimentacion.sistema}; y fachadas con ${materialesEnvolventeYFachada.recomendados.slice(0, 2).join(' y ')}.`;

  return {
    tipologiaRecomendada,
    esConvenienteConstruir,
    viabilidadGeneral,
    nivelRiesgo,
    resumenDictamen,
    alturaMaximaNiveles,
    alturaMaximaMetros: parseFloat(alturaMetros.toFixed(1)),
    fundamentoAltura: `Determinado por el Reglamento Estatal de Zonificación (Cuadros normativos para ${zonaUrbana}) y restricciones geotécnicas del suelo (${tipoSuelo}).`,
    cosRecomendado: cosNormativo,
    cusRecomendado: cusNormativo,
    desplanteMaxM2,
    construccionTotalM2,
    areaPermeableM2,
    materialesCimentacion,
    materialesEstructura,
    materialesEnvolventeYFachada,
    fundamentoJuridico,
    condicionantesTecnicas,
    eficienciaSustentable,
  };
}
