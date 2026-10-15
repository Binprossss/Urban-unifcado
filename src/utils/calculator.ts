/**
 * UrbanBuild Platform - Urban Calculator Module
 * Grounded in Código Urbano del Estado de Jalisco (Art. 142, 176)
 * and Reglamento Estatal de Zonificación de Jalisco.
 */

export type UrbanZoneCode =
  | 'H1-U'
  | 'H2-U'
  | 'H3-U'
  | 'H4-U'
  | 'MC'
  | 'MB'
  | 'CS3'
  | 'I1'
  | string;

export interface UrbanZoneLimits {
  code: string;
  nombre: string;
  maxCos: number;
  maxCus: number;
  minAbsorcion: number;
  cesionDestinos: number;
}

export const ZONING_LIMITS: Record<string, UrbanZoneLimits> = {
  'H1-U': {
    code: 'H1-U',
    nombre: 'Habitacional Densidad Mínima Unifamiliar',
    maxCos: 0.40,
    maxCus: 0.80,
    minAbsorcion: 0.20,
    cesionDestinos: 0.16,
  },
  'H2-U': {
    code: 'H2-U',
    nombre: 'Habitacional Densidad Baja Unifamiliar',
    maxCos: 0.60,
    maxCus: 1.20,
    minAbsorcion: 0.20,
    cesionDestinos: 0.16,
  },
  'H3-U': {
    code: 'H3-U',
    nombre: 'Habitacional Densidad Media Unifamiliar',
    maxCos: 0.70,
    maxCus: 2.10,
    minAbsorcion: 0.20,
    cesionDestinos: 0.16,
  },
  'H4-U': {
    code: 'H4-U',
    nombre: 'Habitacional Densidad Alta',
    maxCos: 0.75,
    maxCus: 3.00,
    minAbsorcion: 0.20,
    cesionDestinos: 0.16,
  },
  'MC': {
    code: 'MC',
    nombre: 'Mixto Central Metropolitano',
    maxCos: 0.80,
    maxCus: 4.00,
    minAbsorcion: 0.20,
    cesionDestinos: 0.13,
  },
  'MB': {
    code: 'MB',
    nombre: 'Mixto Barrial Comercio y Servicios',
    maxCos: 0.70,
    maxCus: 2.40,
    minAbsorcion: 0.20,
    cesionDestinos: 0.13,
  },
  'CS3': {
    code: 'CS3',
    nombre: 'Comercio y Servicios Distrital',
    maxCos: 0.80,
    maxCus: 2.40,
    minAbsorcion: 0.20,
    cesionDestinos: 0.13,
  },
  'I1': {
    code: 'I1',
    nombre: 'Industrial Ligero e Inofensivo',
    maxCos: 0.70,
    maxCus: 1.40,
    minAbsorcion: 0.20,
    cesionDestinos: 0.08,
  },
};

export const DEFAULT_ZONING: UrbanZoneLimits = ZONING_LIMITS['H3-U'];

export interface CalculatorInputs {
  terreno: number;
  desplante: number;
  niveles: number;
  zona?: string;
  m2PorCajon?: number;
}

export interface CalculatorResult {
  isValid: boolean;
  error: string | null;
  isMathematicallyInvalid: boolean;
  mathematicalError: string | null;
  invalidReasons: string[];
  warnings: string[];
  cos: number;
  cus: number;
  totalConstruido: number;
  permeableMin: number;
  cesionDestinos: number;
  cajonesEstacionamiento: number;
  maxCos: number;
  maxCus: number;
  cumpleCos: boolean;
  cumpleCus: boolean;
  cumplePermeable: boolean;
  desplanteMaxPermitido: number;
  construccionMaxPermitida: number;
  desplanteExcedente: number;
  construccionExcedente: number;
  requiereCusmax: boolean;
  zonificacionAplicada: UrbanZoneLimits;
}

/**
 * Rounds a number safely to specified decimals without floating-point artifacts.
 */
export function roundToDecimals(val: number, decimals = 2): number {
  if (!Number.isFinite(val)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

/**
 * Resolves zoning parameters with fallback for unknown zonings.
 */
export function obtenerLimitesZonificacion(zona?: string): UrbanZoneLimits {
  if (!zona) return DEFAULT_ZONING;
  const normalized = zona.toUpperCase().trim();
  return ZONING_LIMITS[normalized] || {
    ...DEFAULT_ZONING,
    code: normalized,
    nombre: `Zonificación ${normalized} (Parámetros estándar H3-U)`,
  };
}

/**
 * Calculates COS (Coeficiente de Ocupación del Suelo).
 * Edge cases: terreno <= 0, desplante < 0, or non-finite inputs return safe defaults without throwing.
 * Flags impossible COS values (COS > 1.0, where footprint exceeds lot area).
 */
export function calcularCos(desplante: number, terreno: number): {
  cos: number;
  isValid: boolean;
  isImpossibleCos?: boolean;
  error?: string;
} {
  if (!Number.isFinite(terreno) || !Number.isFinite(desplante)) {
    return { cos: 0, isValid: false, error: 'Los valores de terreno y desplante deben ser numéricos finitos.' };
  }

  if (terreno <= 0) {
    return { cos: 0, isValid: false, error: 'La superficie del terreno debe ser mayor a cero (0 m²).' };
  }

  if (desplante < 0) {
    return { cos: 0, isValid: false, error: 'El desplante en planta baja no puede ser un valor negativo.' };
  }

  const rawCos = desplante / terreno;
  const isImpossibleCos = rawCos > 1.0;
  return {
    cos: roundToDecimals(rawCos, 2),
    isValid: true,
    ...(isImpossibleCos
      ? {
          isImpossibleCos: true,
          error: 'Valor de COS imposible: El desplante en planta baja excede la superficie del predio (COS > 1.00).',
        }
      : {}),
  };
}

/**
 * Calculates CUS (Coeficiente de Utilización del Suelo) and total constructed area.
 * Edge cases: terreno <= 0, desplante < 0, niveles < 0.
 */
export function calcularCus(
  desplante: number,
  niveles: number,
  terreno: number
): {
  cus: number;
  totalConstruido: number;
  isValid: boolean;
  error?: string;
} {
  if (!Number.isFinite(terreno) || !Number.isFinite(desplante) || !Number.isFinite(niveles)) {
    return {
      cus: 0,
      totalConstruido: 0,
      isValid: false,
      error: 'Los parámetros deben ser valores numéricos válidos.',
    };
  }

  if (terreno <= 0) {
    return {
      cus: 0,
      totalConstruido: 0,
      isValid: false,
      error: 'La superficie del terreno debe ser mayor a cero (0 m²).',
    };
  }

  if (desplante < 0) {
    return {
      cus: 0,
      totalConstruido: 0,
      isValid: false,
      error: 'El desplante en planta baja no puede ser negativo.',
    };
  }

  if (niveles < 0) {
    return {
      cus: 0,
      totalConstruido: 0,
      isValid: false,
      error: 'El número de niveles no puede ser negativo.',
    };
  }

  const safeNiveles = Math.floor(niveles);
  const totalConstruido = roundToDecimals(desplante * safeNiveles, 2);
  const rawCus = totalConstruido / terreno;

  return {
    cus: roundToDecimals(rawCus, 2),
    totalConstruido,
    isValid: true,
  };
}

/**
 * Calculates minimum mandatory permeable area (20% under Art. 142 of Código Urbano de Jalisco).
 */
export function calcularAreaPermeableMinima(terreno: number, porcentaje = 0.20): number {
  if (!Number.isFinite(terreno) || terreno <= 0) return 0;
  return roundToDecimals(terreno * porcentaje, 2);
}

/**
 * Calculates mandatory public municipal cession (e.g., 16% under Art. 176 of Código Urbano de Jalisco).
 */
export function calcularCesionDestinos(terreno: number, porcentaje = 0.16): number {
  if (!Number.isFinite(terreno) || terreno <= 0) return 0;
  return roundToDecimals(terreno * porcentaje, 2);
}

/**
 * Estimates parking spaces required based on total built area.
 * Standard urban average: 1 space per 65 m² constructed (or customizable).
 */
export function calcularCajonesEstacionamiento(totalConstruido: number, m2PorCajon = 65): number {
  if (!Number.isFinite(totalConstruido) || totalConstruido <= 0 || m2PorCajon <= 0) return 0;
  return Math.ceil(totalConstruido / m2PorCajon);
}

/**
 * Full regulatory calculator for Jalisco & ZMG.
 * Safely handles edge cases: zero, negative, oversized, or missing inputs.
 */
export function calcularNormativaUrbana(inputs: CalculatorInputs): CalculatorResult {
  const warnings: string[] = [];
  const invalidReasons: string[] = [];
  const zonaInfo = obtenerLimitesZonificacion(inputs.zona);

  const rawTerreno = Number(inputs.terreno);
  const rawDesplante = Number(inputs.desplante);
  const rawNiveles = Number(inputs.niveles);

  // 1. Validation of inputs (Negative areas & non-numeric edge cases)
  if (Number.isNaN(rawTerreno) || Number.isNaN(rawDesplante) || Number.isNaN(rawNiveles)) {
    return createInvalidResult(
      'Todos los campos (terreno, desplante, niveles) deben ser números válidos.',
      zonaInfo,
      true,
      ['Valores no numéricos o indefinidos en los parámetros de cálculo.']
    );
  }

  if (rawTerreno <= 0) {
    return createInvalidResult(
      'La superficie del terreno debe ser un número positivo mayor a 0 m².',
      zonaInfo,
      true,
      ['Superficie del terreno menor o igual a cero (≤ 0 m²): Matemáticamente imposible calcular coeficientes sobre área nula o negativa.']
    );
  }

  if (rawDesplante < 0) {
    return createInvalidResult(
      'El desplante en planta baja no puede ser un valor negativo.',
      zonaInfo,
      true,
      ['Superficie de desplante negativa (< 0 m²): No es posible desplantar un área negativa en el terreno.']
    );
  }

  if (rawNiveles < 0) {
    return createInvalidResult(
      'El número de niveles no puede ser un valor negativo.',
      zonaInfo,
      true,
      ['Número de niveles de construcción negativo (< 0): No es posible edificar niveles bajo cero en este cálculo.']
    );
  }

  // 2. Calculations
  const cosRes = calcularCos(rawDesplante, rawTerreno);
  const cusRes = calcularCus(rawDesplante, rawNiveles, rawTerreno);

  const cos = cosRes.cos;
  const cus = cusRes.cus;
  const totalConstruido = cusRes.totalConstruido;

  const desplanteMaxPermitido = roundToDecimals(rawTerreno * zonaInfo.maxCos, 2);
  const construccionMaxPermitida = roundToDecimals(rawTerreno * zonaInfo.maxCus, 2);
  const permeableMin = calcularAreaPermeableMinima(rawTerreno, zonaInfo.minAbsorcion);
  const cesionDestinos = calcularCesionDestinos(rawTerreno, zonaInfo.cesionDestinos);
  const cajones = calcularCajonesEstacionamiento(totalConstruido, inputs.m2PorCajon || 65);

  // 3. Mathematical invalidity check: Impossible COS values (desplante > terreno or COS > 1.0)
  let isMathematicallyInvalid = false;
  let mathematicalError: string | null = null;

  if (rawDesplante > rawTerreno || cos > 1.0) {
    isMathematicallyInvalid = true;
    mathematicalError = `Valor de COS imposible (${cos}): El desplante (${rawDesplante} m²) excede la superficie del terreno (${rawTerreno} m²). En geometría horizontal de predios urbanos no es posible ocupar más del 100% de la superficie en planta baja.`;
    invalidReasons.push(
      `Valor de COS imposible (${cos} > 1.00): La huella de ocupación en planta baja (${rawDesplante} m²) supera el 100% del área del predio (${rawTerreno} m²).`
    );
    warnings.push(
      `El desplante (${rawDesplante} m²) excede la superficie del terreno (${rawTerreno} m²), lo cual es físicamente inviable en edificación horizontal.`
    );
  }

  // Maximum allowed footprint considering mandatory 20% permeable (Art. 142)
  const areaPermeableObligatoria = permeableMin;
  const maxDesplanteFisico = roundToDecimals(rawTerreno - areaPermeableObligatoria, 2);
  if (rawDesplante > maxDesplanteFisico) {
    warnings.push(
      `El desplante compromete el 20% obligatorio de suelo absorbente permeable según el Artículo 142 del Código Urbano de Jalisco.`
    );
  }

  if (rawNiveles === 0 && rawDesplante > 0) {
    warnings.push('Se indicaron 0 niveles de construcción, por lo que la edificación total es 0 m².');
  }

  const cumpleCos = cos <= zonaInfo.maxCos && rawDesplante <= rawTerreno && !isMathematicallyInvalid;
  const cumpleCus = cus <= zonaInfo.maxCus;
  const cumplePermeable = (rawTerreno - rawDesplante) >= areaPermeableObligatoria;

  const desplanteExcedente = Math.max(0, roundToDecimals(rawDesplante - desplanteMaxPermitido, 2));
  const construccionExcedente = Math.max(0, roundToDecimals(totalConstruido - construccionMaxPermitida, 2));
  const requiereCusmax = !cumpleCus && totalConstruido > 0;

  return {
    isValid: true,
    error: mathematicalError,
    isMathematicallyInvalid,
    mathematicalError,
    invalidReasons,
    warnings,
    cos,
    cus,
    totalConstruido,
    permeableMin,
    cesionDestinos,
    cajonesEstacionamiento: cajones,
    maxCos: zonaInfo.maxCos,
    maxCus: zonaInfo.maxCus,
    cumpleCos,
    cumpleCus,
    cumplePermeable,
    desplanteMaxPermitido,
    construccionMaxPermitida,
    desplanteExcedente,
    construccionExcedente,
    requiereCusmax,
    zonificacionAplicada: zonaInfo,
  };
}

function createInvalidResult(
  errorMsg: string,
  zonaInfo: UrbanZoneLimits,
  isMathematicallyInvalid = true,
  invalidReasons: string[] = []
): CalculatorResult {
  const reasons = invalidReasons.length > 0 ? invalidReasons : [errorMsg];
  return {
    isValid: false,
    error: errorMsg,
    isMathematicallyInvalid,
    mathematicalError: isMathematicallyInvalid ? errorMsg : null,
    invalidReasons: reasons,
    warnings: [],
    cos: 0,
    cus: 0,
    totalConstruido: 0,
    permeableMin: 0,
    cesionDestinos: 0,
    cajonesEstacionamiento: 0,
    maxCos: zonaInfo.maxCos,
    maxCus: zonaInfo.maxCus,
    cumpleCos: false,
    cumpleCus: false,
    cumplePermeable: false,
    desplanteMaxPermitido: 0,
    construccionMaxPermitida: 0,
    desplanteExcedente: 0,
    construccionExcedente: 0,
    requiereCusmax: false,
    zonificacionAplicada: zonaInfo,
  };
}

/**
 * Checks if a calculator scenario or set of inputs is mathematically invalid.
 * Used by UI components to display an inline red alert box.
 */
export function esEscenarioInvalido(inputs: Partial<CalculatorInputs> | CalculatorResult): {
  isInvalido: boolean;
  motivo: string;
} {
  if ('isMathematicallyInvalid' in inputs) {
    const res = inputs as CalculatorResult;
    if (res.isMathematicallyInvalid && res.mathematicalError) {
      return { isInvalido: true, motivo: res.mathematicalError };
    }
    if (!res.isValid && res.error) {
      return { isInvalido: true, motivo: res.error };
    }
    if (res.cos > 1.0) {
      return {
        isInvalido: true,
        motivo: `Valor de COS imposible (${res.cos} > 1.00): El desplante supera la superficie del terreno.`,
      };
    }
    return { isInvalido: false, motivo: '' };
  }

  const t = Number(inputs.terreno);
  const d = Number(inputs.desplante);
  const n = Number(inputs.niveles);

  if (Number.isFinite(t) && t <= 0) {
    return { isInvalido: true, motivo: 'La superficie del terreno debe ser un número positivo mayor a 0 m².' };
  }
  if (Number.isFinite(d) && d < 0) {
    return { isInvalido: true, motivo: 'El desplante en planta baja no puede ser un área negativa (< 0 m²).' };
  }
  if (Number.isFinite(n) && n < 0) {
    return { isInvalido: true, motivo: 'El número de niveles no puede ser un valor negativo (< 0).' };
  }
  if (Number.isFinite(t) && Number.isFinite(d) && t > 0 && d > t) {
    const cosVal = roundToDecimals(d / t, 2);
    return {
      isInvalido: true,
      motivo: `Valor de COS imposible (${cosVal}): El desplante (${d} m²) supera la superficie total del predio (${t} m²).`,
    };
  }

  return { isInvalido: false, motivo: '' };
}
