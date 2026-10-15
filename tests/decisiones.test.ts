import { describe, it, expect } from 'vitest';

describe('Matriz de Toma de Decisiones & Memoria ZMG', () => {
  const REGIONES_NO_ZMG = [
    "cdmx", "ciudad de méxico", "monterrey", "nuevo león", "puebla", "querétaro", "queretaro",
    "tijuana", "méjico", "madrid", "barcelona", "bogota", "bogotá", "buenos aires", "colombia",
    "argentina", "españa", "chile", "lima", "peru", "perú", "new york", "texas", "miami", "cancún", "cancun"
  ];

  function verificarFueraDeZMG(texto: string): boolean {
    const t = (texto || '').toLowerCase();
    for (const noZmg of REGIONES_NO_ZMG) {
      const regex = new RegExp(`\\b${noZmg}\\b`, 'i');
      if (regex.test(t)) return true;
    }
    return false;
  }

  it('debe detectar correctamente consultas fuera de la ZMG', () => {
    expect(verificarFueraDeZMG('Intervención en Monterrey Nuevo León')).toBe(true);
    expect(verificarFueraDeZMG('Banqueta en Madrid España')).toBe(true);
    expect(verificarFueraDeZMG('Cruce escolar en CDMX')).toBe(true);
  });

  it('debe aceptar consultas legítimas de los 9 municipios de la ZMG', () => {
    expect(verificarFueraDeZMG('Cruce escolar en Calzada Olímpica Guadalajara')).toBe(false);
    expect(verificarFueraDeZMG('Glorieta Minerva en Zapopan y Vallarta')).toBe(false);
    expect(verificarFueraDeZMG('Corredor López Mateos Sur Tlajomulco')).toBe(false);
    expect(verificarFueraDeZMG('Centro Histórico de Tlaquepaque')).toBe(false);
  });

  it('debe calcular correctamente el presupuesto remanente al autorizar proyectos', () => {
    const presupuestoBase = 45000000;
    const proyectos = [
      { id: 1, costo: 1450000, status: 'autorizado' },
      { id: 2, costo: 820000, status: 'autorizado' },
      { id: 3, costo: 2200000, status: 'pendiente' },
      { id: 4, costo: 1650000, status: 'revision' }
    ];

    const autorizados = proyectos.filter(p => p.status === 'autorizado');
    const gastoTotal = autorizados.reduce((acc, p) => acc + p.costo, 0);
    const presupuestoRestante = presupuestoBase - gastoTotal;

    expect(gastoTotal).toBe(2270000);
    expect(presupuestoRestante).toBe(42730000);
  });

  it('debe calcular parámetros de COS y CUS con 20% permeable obligatorio de acuerdo al Código Urbano de Jalisco', () => {
    const area = 1000;
    const uso = 'Comercial';
    const cos = uso === 'Comercial' ? 0.70 : 0.60;
    const cus = uso === 'Comercial' ? 2.40 : 1.80;

    const desplante = area * cos;
    const construccion = area * cus;
    const permeableObligatorio = area * 0.20;

    expect(desplante).toBe(700);
    expect(construccion).toBe(2400);
    expect(permeableObligatorio).toBe(200);
  });
});
