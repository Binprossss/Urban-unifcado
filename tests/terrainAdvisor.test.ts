import { describe, it, expect } from 'vitest';
import {
  evaluarConvenienciaPorTerreno,
  TIPOS_SUELO_METADATA,
  TOPOGRAFIA_METADATA,
} from '../src/utils/terrainAdvisor';

describe('Terrain Advisor Module - Detección por Terreno, Altura y Materiales', () => {
  it('evalúa correctamente predio estándar en H3-U (500 m², suelo pómez)', () => {
    const evaluacion = evaluarConvenienciaPorTerreno({
      superficieM2: 500,
      zonaUrbana: 'H3-U',
      tipoSuelo: 'pomez_jalisco',
      topografia: 'plano',
      municipio: 'Guadalajara',
    });

    expect(evaluacion.esConvenienteConstruir).toBe(true);
    expect(evaluacion.viabilidadGeneral).toBe('Alta Viabilidad');
    expect(evaluacion.alturaMaximaNiveles).toBe(3);
    expect(evaluacion.alturaMaximaMetros).toBeCloseTo(9.3, 1);
    expect(evaluacion.cosRecomendado).toBe(0.70);
    expect(evaluacion.desplanteMaxM2).toBe(350);
    expect(evaluacion.areaPermeableM2).toBe(100); // 20% obligatorio Art. 142
    expect(evaluacion.tipologiaRecomendada).toContain('Residencia Unifamiliar');

    // Materiales
    expect(evaluacion.materialesCimentacion.sistema).toContain('Zapatas');
    expect(evaluacion.materialesEstructura.sistema).toContain('Mampostería Confinada');
    expect(evaluacion.materialesEnvolventeYFachada.recomendados.length).toBeGreaterThan(0);
  });

  it('aplica restricciones geotécnicas para suelo arcilloso expansivo en Tlajomulco', () => {
    const evaluacion = evaluarConvenienciaPorTerreno({
      superficieM2: 800,
      zonaUrbana: 'H4-U',
      tipoSuelo: 'arcilloso_expansivo',
      topografia: 'plano',
      municipio: 'Tlajomulco de Zúñiga',
    });

    expect(evaluacion.esConvenienteConstruir).toBe(true);
    expect(evaluacion.viabilidadGeneral).toBe('Viabilidad Condicionada');
    expect(evaluacion.nivelRiesgo).toBe('Moderado');
    expect(evaluacion.condicionantesTecnicas.some(c => c.toLowerCase().includes('arcillas expansivas'))).toBe(true);
  });

  it('permite torres verticales de uso mixto en Mixto Central (MC) con roca basáltica', () => {
    const evaluacion = evaluarConvenienciaPorTerreno({
      superficieM2: 1200,
      zonaUrbana: 'MC',
      tipoSuelo: 'rocoso_basaltico',
      topografia: 'plano',
      municipio: 'Zapopan',
      colindanciaVial: 'arteria_principal',
    });

    expect(evaluacion.viabilidadGeneral).toBe('Alta Viabilidad');
    expect(evaluacion.alturaMaximaNiveles).toBeGreaterThanOrEqual(8);
    expect(evaluacion.tipologiaRecomendada).toContain('Uso Mixto');
    expect(evaluacion.materialesEstructura.materiales.some(m => m.toLowerCase().includes('concreto'))).toBe(true);
    expect(evaluacion.materialesCimentacion.sistema).toContain('rocoso');
  });

  it('restringe adecuadamente altura y pide terrazas en topografía escarpada (>15%)', () => {
    const evaluacion = evaluarConvenienciaPorTerreno({
      superficieM2: 1500,
      zonaUrbana: 'MC',
      tipoSuelo: 'rocoso_basaltico',
      topografia: 'escarpada',
      municipio: 'Guadalajara',
    });

    expect(evaluacion.viabilidadGeneral).toBe('Viabilidad Condicionada');
    expect(evaluacion.alturaMaximaNiveles).toBeLessThanOrEqual(3);
    expect(evaluacion.condicionantesTecnicas.some(c => c.toLowerCase().includes('pendiente'))).toBe(true);
  });

  it('recomienda estructura metálica para zonificación industrial I1', () => {
    const evaluacion = evaluarConvenienciaPorTerreno({
      superficieM2: 3000,
      zonaUrbana: 'I1',
      tipoSuelo: 'pomez_jalisco',
      topografia: 'plano',
      municipio: 'El Salto',
    });

    expect(evaluacion.tipologiaRecomendada).toContain('Industrial');
    expect(evaluacion.materialesEstructura.sistema).toContain('Acero');
    expect(evaluacion.materialesCimentacion.sistema).toContain('Zapatas Aisladas');
  });
});
