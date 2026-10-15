import { describe, it, expect } from 'vitest';
import {
  calcularNormativaUrbana,
  calcularCos,
  calcularCus,
  calcularAreaPermeableMinima,
  calcularCesionDestinos,
  calcularCajonesEstacionamiento,
  obtenerLimitesZonificacion,
  roundToDecimals,
  ZONING_LIMITS,
  esEscenarioInvalido,
} from '../src/utils/calculator';

describe('Urban Calculator Module (COS, CUS & Normativa ZMG / Jalisco)', () => {
  // =========================================================================
  // 1. CÁLCULOS ESTÁNDAR Y REGLAMENTARIOS (CÓDIGO URBANO & REGLAMENTO ZONIFICACIÓN)
  // =========================================================================
  describe('Cálculos estándar de COS y CUS con entradas válidas', () => {
    it('calcula correctamente para predio H3-U estándar (500 m², desplante 320 m², 3 niveles)', () => {
      const res = calcularNormativaUrbana({
        terreno: 500,
        desplante: 320,
        niveles: 3,
        zona: 'H3-U',
      });

      expect(res.isValid).toBe(true);
      expect(res.error).toBeNull();
      // COS = 320 / 500 = 0.64
      expect(res.cos).toBe(0.64);
      // Total construido = 320 * 3 = 960 m²
      expect(res.totalConstruido).toBe(960);
      // CUS = 960 / 500 = 1.92
      expect(res.cus).toBe(1.92);

      // Verificación de límites zonales H3-U (COS máx 0.70, CUS máx 2.10)
      expect(res.maxCos).toBe(0.70);
      expect(res.maxCus).toBe(2.10);
      expect(res.cumpleCos).toBe(true);
      expect(res.cumpleCus).toBe(true);

      // Art. 142 Código Urbano: 20% obligatorio de suelo absorbente permeable
      expect(res.permeableMin).toBe(100.0);
      expect(res.cumplePermeable).toBe(true); // 500 - 320 = 180 m² libres >= 100 m²

      // Art. 176 Código Urbano: 16% cesión de destinos en habitacional
      expect(res.cesionDestinos).toBe(80.0);

      // Dotación estimada de cajones (960 / 65 = 14.77 -> 15 cajones)
      expect(res.cajonesEstacionamiento).toBe(15);
      expect(res.requiereCusmax).toBe(false);
    });

    it('calcula correctamente límites para distintas zonificaciones (H1-U, H2-U, H4-U, MC, MB)', () => {
      const zonas = [
        { code: 'H1-U', maxCos: 0.40, maxCus: 0.80 },
        { code: 'H2-U', maxCos: 0.60, maxCus: 1.20 },
        { code: 'H3-U', maxCos: 0.70, maxCus: 2.10 },
        { code: 'H4-U', maxCos: 0.75, maxCus: 3.00 },
        { code: 'MC', maxCos: 0.80, maxCus: 4.00 },
        { code: 'MB', maxCos: 0.70, maxCus: 2.40 },
        { code: 'CS3', maxCos: 0.80, maxCus: 2.40 },
        { code: 'I1', maxCos: 0.70, maxCus: 1.40 },
      ];

      for (const z of zonas) {
        const lim = obtenerLimitesZonificacion(z.code);
        expect(lim.maxCos).toBe(z.maxCos);
        expect(lim.maxCus).toBe(z.maxCus);
      }
    });

    it('detecta correctamente cuando un proyecto excede el COS o CUS base', () => {
      // 500 m² terreno con 400 m² desplante (COS 0.80 > 0.70) y 5 niveles (CUS 4.0 > 2.10)
      const res = calcularNormativaUrbana({
        terreno: 500,
        desplante: 400,
        niveles: 5,
        zona: 'H3-U',
      });

      expect(res.isValid).toBe(true);
      expect(res.cos).toBe(0.80);
      expect(res.cus).toBe(4.00);
      expect(res.cumpleCos).toBe(false);
      expect(res.cumpleCus).toBe(false);
      expect(res.desplanteExcedente).toBe(50); // 400 - (500 * 0.70 = 350) = 50 m²
      expect(res.construccionExcedente).toBe(950); // 2000 - (500 * 2.10 = 1050) = 950 m²
      expect(res.requiereCusmax).toBe(true);
    });
  });

  // =========================================================================
  // 2. CASOS LÍMITE: ENTRADAS EN CERO (ZERO INPUTS)
  // =========================================================================
  describe('Casos límite con entradas en CERO (0)', () => {
    it('terreno = 0: maneja división por cero de forma segura sin arrojar NaN o Infinity', () => {
      const res = calcularNormativaUrbana({
        terreno: 0,
        desplante: 100,
        niveles: 2,
        zona: 'H3-U',
      });

      expect(res.isValid).toBe(false);
      expect(res.error).toContain('mayor a 0 m²');
      expect(res.cos).toBe(0);
      expect(res.cus).toBe(0);
      expect(res.totalConstruido).toBe(0);
      expect(res.permeableMin).toBe(0);
      expect(res.cesionDestinos).toBe(0);
      expect(Number.isNaN(res.cos)).toBe(false);
      expect(Number.isFinite(res.cos)).toBe(true);
      expect(Number.isFinite(res.cus)).toBe(true);
    });

    it('desplante = 0: predio sin construcción en planta baja', () => {
      const res = calcularNormativaUrbana({
        terreno: 600,
        desplante: 0,
        niveles: 3,
        zona: 'H3-U',
      });

      expect(res.isValid).toBe(true);
      expect(res.cos).toBe(0);
      expect(res.cus).toBe(0);
      expect(res.totalConstruido).toBe(0);
      expect(res.cumpleCos).toBe(true);
      expect(res.cumpleCus).toBe(true);
      expect(res.cajonesEstacionamiento).toBe(0);
      expect(res.desplanteExcedente).toBe(0);
    });

    it('niveles = 0: edificación sin niveles verticales (total construido 0 m²)', () => {
      const res = calcularNormativaUrbana({
        terreno: 400,
        desplante: 200,
        niveles: 0,
        zona: 'H3-U',
      });

      expect(res.isValid).toBe(true);
      expect(res.cos).toBe(0.50);
      expect(res.totalConstruido).toBe(0);
      expect(res.cus).toBe(0);
      expect(res.cumpleCus).toBe(true);
      expect(res.warnings.some((w) => w.includes('0 niveles'))).toBe(true);
    });

    it('todos los valores en 0: manejo seguro e inmediato', () => {
      const res = calcularNormativaUrbana({
        terreno: 0,
        desplante: 0,
        niveles: 0,
        zona: 'H3-U',
      });

      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
      expect(res.cos).toBe(0);
      expect(res.cus).toBe(0);
    });
  });

  // =========================================================================
  // 3. CASOS LÍMITE: ENTRADAS NEGATIVAS (NEGATIVE INPUTS)
  // =========================================================================
  describe('Casos límite con entradas NEGATIVAS (< 0)', () => {
    it('terreno negativo (-500): rechaza y devuelve error sin generar áreas negativas', () => {
      const res = calcularNormativaUrbana({
        terreno: -500,
        desplante: 250,
        niveles: 2,
        zona: 'H3-U',
      });

      expect(res.isValid).toBe(false);
      expect(res.error).toContain('mayor a 0 m²');
      expect(res.cos).toBe(0);
      expect(res.cus).toBe(0);
      expect(res.permeableMin).toBe(0);
      expect(res.cesionDestinos).toBe(0);
    });

    it('desplante negativo (-150): rechaza y devuelve error', () => {
      const res = calcularNormativaUrbana({
        terreno: 500,
        desplante: -150,
        niveles: 2,
        zona: 'H3-U',
      });

      expect(res.isValid).toBe(false);
      expect(res.error).toContain('negativo');
      expect(res.cos).toBe(0);
      expect(res.cus).toBe(0);
    });

    it('niveles negativos (-3): rechaza y devuelve error', () => {
      const res = calcularNormativaUrbana({
        terreno: 500,
        desplante: 200,
        niveles: -3,
        zona: 'H3-U',
      });

      expect(res.isValid).toBe(false);
      expect(res.error).toContain('negativo');
      expect(res.cos).toBe(0);
      expect(res.cus).toBe(0);
    });

    it('todas las entradas negativas: manejo robusto sin colapsar', () => {
      const res = calcularNormativaUrbana({
        terreno: -1000,
        desplante: -500,
        niveles: -4,
        zona: 'H3-U',
      });

      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
      expect(res.cos).toBe(0);
      expect(res.cus).toBe(0);
      expect(res.totalConstruido).toBe(0);
    });
  });

  // =========================================================================
  // 4. CASOS EXTREMOS Y ANOMALÍAS FÍSICAS (BOUNDARY & PHYSICAL EDGE CASES)
  // =========================================================================
  describe('Casos extremos y validaciones físicas', () => {
    it('desplante mayor al terreno (desplante 600 m² > terreno 500 m²): emite advertencia de inviabilidad física', () => {
      const res = calcularNormativaUrbana({
        terreno: 500,
        desplante: 600,
        niveles: 1,
        zona: 'H3-U',
      });

      expect(res.isValid).toBe(true);
      expect(res.cos).toBe(1.20);
      expect(res.cumpleCos).toBe(false);
      expect(res.warnings.some((w) => w.includes('físicamente inviable'))).toBe(true);
      expect(res.warnings.some((w) => w.includes('compromete el 20% obligatorio'))).toBe(true);
    });

    it('desplante que agota el 20% absorbente obligatorio (Art. 142): emite advertencia específica', () => {
      // 500 m² terreno -> permeable mínimo 100 m² (máximo desplante físico 400 m²)
      // Desplante 420 m² cumple en teoría si COS fuera 0.84, pero no deja los 100 m² permeables
      const res = calcularNormativaUrbana({
        terreno: 500,
        desplante: 420,
        niveles: 1,
        zona: 'MC', // MC permite maxCos 0.80
      });

      expect(res.warnings.some((w) => w.includes('compromete el 20% obligatorio'))).toBe(true);
      expect(res.cumplePermeable).toBe(false);
    });

    it('macro-predio (valores numéricos extremadamente grandes): 10,000,000 m²', () => {
      const res = calcularNormativaUrbana({
        terreno: 10_000_000,
        desplante: 4_000_000,
        niveles: 4,
        zona: 'I1',
      });

      expect(res.isValid).toBe(true);
      expect(res.cos).toBe(0.40);
      expect(res.cus).toBe(1.60);
      expect(res.totalConstruido).toBe(16_000_000);
      expect(res.permeableMin).toBe(2_000_000);
    });

    it('micro-predio o fracciones decimales muy pequeñas: 0.5 m²', () => {
      const res = calcularNormativaUrbana({
        terreno: 0.5,
        desplante: 0.2,
        niveles: 1,
        zona: 'H3-U',
      });

      expect(res.isValid).toBe(true);
      expect(res.cos).toBe(0.40);
      expect(res.cus).toBe(0.40);
    });

    it('zonificación desconocida o no especificada: aplica fallback seguro con parámetros H3-U', () => {
      const res = calcularNormativaUrbana({
        terreno: 500,
        desplante: 300,
        niveles: 2,
        zona: 'ZONA_INEXISTENTE_ABC',
      });

      expect(res.isValid).toBe(true);
      expect(res.zonificacionAplicada.maxCos).toBe(0.70);
      expect(res.zonificacionAplicada.maxCus).toBe(2.10);
    });
  });

  // =========================================================================
  // 5. FUNCIONES UNITARIAS AUXILIARES
  // =========================================================================
  describe('Pruebas unitarias de funciones individuales', () => {
    describe('calcularCos()', () => {
      it('calcula correctamente', () => {
        expect(calcularCos(350, 500)).toEqual({ cos: 0.70, isValid: true });
      });

      it('rechaza terreno 0 o negativo', () => {
        expect(calcularCos(100, 0).isValid).toBe(false);
        expect(calcularCos(100, -200).isValid).toBe(false);
      });

      it('rechaza desplante negativo', () => {
        expect(calcularCos(-50, 500).isValid).toBe(false);
      });

      it('rechaza no finitos (NaN, Infinity)', () => {
        expect(calcularCos(NaN, 500).isValid).toBe(false);
        expect(calcularCos(100, Infinity).isValid).toBe(false);
      });
    });

    describe('calcularCus()', () => {
      it('calcula correctamente', () => {
        expect(calcularCus(200, 3, 500)).toEqual({
          cus: 1.20,
          totalConstruido: 600,
          isValid: true,
        });
      });

      it('rechaza terreno <= 0 o niveles negativos', () => {
        expect(calcularCus(200, 3, 0).isValid).toBe(false);
        expect(calcularCus(200, -2, 500).isValid).toBe(false);
      });
    });

    describe('calcularAreaPermeableMinima() (Art. 142 Código Urbano)', () => {
      it('devuelve el 20% exacto para terrenos positivos', () => {
        expect(calcularAreaPermeableMinima(500)).toBe(100.0);
        expect(calcularAreaPermeableMinima(1250)).toBe(250.0);
      });

      it('devuelve 0 para terreno 0 o negativo', () => {
        expect(calcularAreaPermeableMinima(0)).toBe(0);
        expect(calcularAreaPermeableMinima(-400)).toBe(0);
      });
    });

    describe('calcularCesionDestinos() (Art. 176 Código Urbano)', () => {
      it('devuelve el 16% habitacional por defecto', () => {
        expect(calcularCesionDestinos(1000)).toBe(160.0);
      });

      it('devuelve 0 para terrenos nulos o negativos', () => {
        expect(calcularCesionDestinos(0)).toBe(0);
        expect(calcularCesionDestinos(-500)).toBe(0);
      });
    });

    describe('calcularCajonesEstacionamiento()', () => {
      it('redondea hacia arriba al entero superior', () => {
        expect(calcularCajonesEstacionamiento(100, 65)).toBe(2);
        expect(calcularCajonesEstacionamiento(65, 65)).toBe(1);
        expect(calcularCajonesEstacionamiento(0, 65)).toBe(0);
        expect(calcularCajonesEstacionamiento(-50, 65)).toBe(0);
      });
    });

    describe('roundToDecimals()', () => {
      it('evita artefactos de coma flotante de IEEE 754', () => {
        expect(roundToDecimals(0.1 + 0.2, 2)).toBe(0.3);
        expect(roundToDecimals(1 / 3, 2)).toBe(0.33);
        expect(roundToDecimals(2.555, 2)).toBe(2.56);
        expect(roundToDecimals(NaN)).toBe(0);
        expect(roundToDecimals(Infinity)).toBe(0);
      });
    });
  });

  // =========================================================================
  // 6. SUITE DE VALIDACIÓN: ESCENARIOS MATEMÁTICAMENTE INVÁLIDOS & COS IMPOSIBLE
  // =========================================================================
  describe('Escenarios Matemáticamente Inválidos (Alertas Rojas en Calculadora)', () => {
    it('detecta escenario inválido cuando el COS es físicamente imposible (> 1.0)', () => {
      // 500 m² terreno con 650 m² desplante (COS = 1.30 > 1.00)
      const res = calcularNormativaUrbana({
        terreno: 500,
        desplante: 650,
        niveles: 2,
        zona: 'H3-U',
      });

      expect(res.isMathematicallyInvalid).toBe(true);
      expect(res.mathematicalError).toBeDefined();
      expect(res.mathematicalError).toContain('COS imposible');
      expect(res.cos).toBe(1.30);
      expect(res.cumpleCos).toBe(false);
      expect(res.invalidReasons.some((r) => r.includes('> 1.00'))).toBe(true);

      const check = esEscenarioInvalido(res);
      expect(check.isInvalido).toBe(true);
      expect(check.motivo).toContain('COS');
    });

    it('detecta escenario inválido cuando la superficie del terreno es negativa (< 0)', () => {
      const res = calcularNormativaUrbana({
        terreno: -450,
        desplante: 200,
        niveles: 2,
        zona: 'H3-U',
      });

      expect(res.isMathematicallyInvalid).toBe(true);
      expect(res.isValid).toBe(false);
      expect(res.mathematicalError).toContain('terreno');
      expect(res.cos).toBe(0);
      expect(res.cus).toBe(0);

      const check = esEscenarioInvalido(res);
      expect(check.isInvalido).toBe(true);
    });

    it('detecta escenario inválido cuando el desplante es negativo (< 0)', () => {
      const res = calcularNormativaUrbana({
        terreno: 500,
        desplante: -100,
        niveles: 3,
        zona: 'H3-U',
      });

      expect(res.isMathematicallyInvalid).toBe(true);
      expect(res.isValid).toBe(false);
      expect(res.mathematicalError).toContain('desplante');

      const check = esEscenarioInvalido(res);
      expect(check.isInvalido).toBe(true);
    });

    it('detecta escenario inválido cuando los niveles son negativos (< 0)', () => {
      const res = calcularNormativaUrbana({
        terreno: 500,
        desplante: 250,
        niveles: -2,
        zona: 'H3-U',
      });

      expect(res.isMathematicallyInvalid).toBe(true);
      expect(res.isValid).toBe(false);
      expect(res.mathematicalError).toContain('niveles');

      const check = esEscenarioInvalido(res);
      expect(check.isInvalido).toBe(true);
    });

    it('esEscenarioInvalido funciona con entradas parciales antes del cálculo', () => {
      expect(esEscenarioInvalido({ terreno: -100, desplante: 50, niveles: 1 }).isInvalido).toBe(true);
      expect(esEscenarioInvalido({ terreno: 500, desplante: -50, niveles: 1 }).isInvalido).toBe(true);
      expect(esEscenarioInvalido({ terreno: 500, desplante: 50, niveles: -1 }).isInvalido).toBe(true);
      expect(esEscenarioInvalido({ terreno: 400, desplante: 500, niveles: 1 }).isInvalido).toBe(true);
      expect(esEscenarioInvalido({ terreno: 500, desplante: 300, niveles: 2 }).isInvalido).toBe(false);
    });

    it('calcularCos identifica explícitamente COS imposible cuando desplante > terreno', () => {
      const cosResult = calcularCos(600, 500);
      expect(cosResult.cos).toBe(1.20);
      expect(cosResult.isValid).toBe(true);
      expect(cosResult.isImpossibleCos).toBe(true);
      expect(cosResult.error).toContain('COS imposible');
    });

    it('garantiza exactitud en cálculos de COS y CUS en valores cero legítimos', () => {
      // Desplante 0 (sin ocupación en planta baja)
      const resDesplanteCero = calcularNormativaUrbana({
        terreno: 500,
        desplante: 0,
        niveles: 3,
        zona: 'H3-U',
      });
      expect(resDesplanteCero.cos).toBe(0);
      expect(resDesplanteCero.cus).toBe(0);
      expect(resDesplanteCero.totalConstruido).toBe(0);
      expect(resDesplanteCero.isMathematicallyInvalid).toBe(false);
      expect(resDesplanteCero.isValid).toBe(true);

      // Niveles 0 (sin edificación vertical)
      const resNivelesCero = calcularNormativaUrbana({
        terreno: 500,
        desplante: 250,
        niveles: 0,
        zona: 'H3-U',
      });
      expect(resNivelesCero.cos).toBe(0.50);
      expect(resNivelesCero.cus).toBe(0);
      expect(resNivelesCero.totalConstruido).toBe(0);
      expect(resNivelesCero.isMathematicallyInvalid).toBe(false);
      expect(resNivelesCero.isValid).toBe(true);
    });
  });
});

