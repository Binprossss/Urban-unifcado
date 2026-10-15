import { describe, it, expect } from 'vitest';

describe('Gestor de Subir Archivo Propio & Peritajes Multimodales', () => {
  function formatearTamanoArchivo(bytes: number) {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function clasificarArchivo(filename: string, mimetype: string) {
    const ext = (filename.split('.').pop() || '').toLowerCase();
    if (mimetype.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return { categoria: 'imagen', permiteYoloCanvas: true, permiteTerrenoGemini: true };
    }
    if (mimetype.startsWith('video/') || ['mp4', 'mov', 'webm'].includes(ext)) {
      return { categoria: 'video', permiteYoloCanvas: true, permiteTerrenoGemini: false };
    }
    if (mimetype.includes('pdf') || ext === 'pdf') {
      return { categoria: 'documento', permiteYoloCanvas: false, permiteTerrenoGemini: true };
    }
    return { categoria: 'otro', permiteYoloCanvas: false, permiteTerrenoGemini: false };
  }

  function generarPromptPorModo(modo: string, fileName: string) {
    if (modo === 'terreno') {
      return `Dictamen pericial sobre terreno, viabilidad de edificación, qué tipo de edificios conviene construir, altura máxima en metros y niveles, y materiales de cimentación y estructura recomendados según Código Urbano de Jalisco y POTmet para este predio. Archivo: ${fileName}`;
    }
    if (modo === 'normativa') {
      return `Auditoría de cumplimiento normativo urbanístico: cálculo de COS, CUS, 20% de superficie permeable obligatoria (Art. 142 Código Urbano) y cesiones para destinos (Art. 176) para este predio. Archivo: ${fileName}`;
    }
    return `Analiza detalladamente este archivo con visión artificial YOLO para determinar aforos, conteo de vehículos y peatones, Nivel de Servicio HCM y seguridad vial en la ZMG. Archivo: ${fileName}`;
  }

  it('formatea correctamente tamaños de archivos en KB y MB', () => {
    expect(formatearTamanoArchivo(0)).toBe('0 KB');
    expect(formatearTamanoArchivo(1024)).toBe('1.0 KB');
    expect(formatearTamanoArchivo(512 * 1024)).toBe('512.0 KB');
    expect(formatearTamanoArchivo(2.5 * 1024 * 1024)).toBe('2.50 MB');
  });

  it('clasifica imágenes adecuadamente para visor YOLO y análisis Gemini', () => {
    const res = clasificarArchivo('predio_zapopan.jpg', 'image/jpeg');
    expect(res.categoria).toBe('imagen');
    expect(res.permiteYoloCanvas).toBe(true);
    expect(res.permiteTerrenoGemini).toBe(true);
  });

  it('clasifica videos de aforo vial para reproducción y telemetría', () => {
    const res = clasificarArchivo('aforo_vallarta.mp4', 'video/mp4');
    expect(res.categoria).toBe('video');
    expect(res.permiteYoloCanvas).toBe(true);
  });

  it('clasifica planos y dictámenes en PDF', () => {
    const res = clasificarArchivo('plano_catastral_h3u.pdf', 'application/pdf');
    expect(res.categoria).toBe('documento');
    expect(res.permiteTerrenoGemini).toBe(true);
  });

  it('genera prompts diferenciados por modo de análisis solicitado', () => {
    const pTerreno = generarPromptPorModo('terreno', 'foto.jpg');
    expect(pTerreno).toContain('viabilidad de edificación');
    expect(pTerreno).toContain('altura máxima en metros y niveles');
    expect(pTerreno).toContain('materiales de cimentación');

    const pYolo = generarPromptPorModo('yolo', 'video.mp4');
    expect(pYolo).toContain('visión artificial YOLO');
    expect(pYolo).toContain('Nivel de Servicio HCM');

    const pNormativa = generarPromptPorModo('normativa', 'escritura.pdf');
    expect(pNormativa).toContain('20% de superficie permeable');
    expect(pNormativa).toContain('Art. 142');
  });
});
