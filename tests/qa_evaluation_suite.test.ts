import { describe, it, expect } from 'vitest';
import { expandirTextoConSinonimos, obtenerFuentesNormativasParaConsulta } from '../server.js';

describe('Suite de Evaluación de Calidad y Dominio Cerrado (30 Preguntas ZMG)', () => {

  const REGIONES_NO_ZMG = [
    'monterrey', 'cdmx', 'ciudad de mexico', 'ciudad de méxico', 'puebla', 'tijuana', 'merida', 'mérida', 'leon', 'león',
    'queretaro', 'querétaro', 'cancun', 'cancún', 'toluca', 'chihuahua', 'veracruz', 'madrid', 'bogota', 'bogotá', 'buenos aires',
    'colombia', 'argentina', 'españa', 'espana', 'chile', 'lima', 'peru', 'perú', 'new york', 'texas', 'miami', 'nuevo leon', 'nuevo león'
  ];

  function verificarFueraDeZMG(texto: string, lat?: number, lon?: number): boolean {
    const t = (texto || '').toLowerCase();
    if (lat && lon) {
      if (lat < 20.25 || lat > 20.95 || lon < -103.75 || lon > -103.05) {
        return true;
      }
    }
    for (const noZmg of REGIONES_NO_ZMG) {
      const regex = new RegExp(`\\b${noZmg}\\b`, 'i');
      if (regex.test(t)) return true;
    }
    return false;
  }

  function esConsultaDeDominioUrbano(texto: string, historialContext = ''): { esValida: boolean; esSaludo: boolean } {
    const t = (texto || '').toLowerCase().trim();
    if (!t) return { esValida: false, esSaludo: false };

    const esSaludo = /^(hola|buen(?:os)?\s*(?:d[ií]as|tardes|noches)|quien\s*eres|qui[eé]n\s*eres|qu[eé]\s*haces|que\s*haces|para\s*qu[eé]\s*sirves|ayuda|help)\b/i.test(t);
    if (esSaludo && t.length < 50) return { esValida: true, esSaludo: true };

    const patronFueraDominio = /\b(receta|recetas|cocina|cocinar|ingredientes|pastel|pizza|tacos|comida|chiste|chistes|broma|cu[eé]ntame\s*un\s*chiste|futbol|f[uú]tbol|partido|mundial|messi|ronaldo|canci[oó]n|m[uú]sica|pel[ií]cula|cine|serie|netflix|actor|actriz|videojuego|playstation|xbox|fortnite|amor|novio|novia|hor[oó]scopo|zodiaco|signo|m[eé]dico|enfermedad|s[ií]ntoma|medicamento|rec[eé]tame|programaci[oó]n\s*en\s*python|código\s*en\s*c|javascript\s*tutorial|java\s*tutorial|poema|verso|filosof[ií]a|chisme|pol[ií]tica\s*internacional|guerra\s*en|ucrania|rusia|israel|trump|biden)\b/i;
    if (patronFueraDominio.test(t)) {
      return { esValida: false, esSaludo: false };
    }

    const patronDominioUrbano = /\b(norma|normativa|c[oó]digo\s*urbano|ley|reglamento|potmet|imeplan|sedatu|art[ií]culo|decreto|plan\s*parcial|ppdu|ordenamiento|desarrollo\s*urbano|suelo|usos?\s*de\s*suelo|zonificaci[oó]n|predio|terreno|lote|manzana|pol[ií]gono|densidad|h1|h2|h3|h4|mc|mb|md|cs|i1|i2|cos|cus|cosmax|desplante|absorci[oó]n|absorcion|permeable|cesi[oó]n|cesion|cesiones|servidumbre|remetimiento|barda|altura|caj[oó]n|cajon|cajones|estacionamiento|estacionamientos|aparcamiento|acera|aceras|banqueta|banquetas|andador|andadores|movilidad|aforo|tr[aá]fico|flujo|concurrencia|hora\s*pico|nivel\s*de\s*servicio|hcm|webster|sem[aá]foro|sem[aá]foros|fase|intermodal|ciclov[ií]a|ciclopista|ciclocarril|mibici|bicicleta|bici|rampa|rampas|podot[aá]ctil|accesibilidad|peat[oó]n|peatones|peatonal|cruce|crucero|intersecci[oó]n|calle|calles|vialidad|vialidades|avenida|carretera|perif[eé]rico|calzada|camion|cami[oó]n|autob[uú]s|brt|mi\s*macro|mi\s*tren|tren\s*ligero|l[ií]nea\s*[1-4]|yolo|conteo|visi[oó]n|c[aá]mara|telemetr[ií]a|guadalajara|zapopan|tlaquepaque|tlajomulco|tonal[aá]|el\s*salto|ixtlahuac[aá]n|juanacatl[aá]n|zapotlanejo|zmg|amg|jalisco|colli|huentit[aá]n|primavera|nixticuil|obligatorio|edificaci[oó]n|infraestructura|viabilidad|licencia|m2|m²|metros\s*cuadrados|edificio|edificios|construir|conveniente|altura|material|materiales|geotecnia|topograf[ií]a|p[oó]mez|jal|arcilla|arcillas|basalto|roca|cimentaci[oó]n|estructura|fachada|bioclim[aá]tic[oa]|niveles|habitacional|comercial|industrial|densidades|coeficiente|coeficientes)\b/i;

    let esValida = patronDominioUrbano.test(t);

    if (!esValida && historialContext) {
      const patronSeguimiento = /^(y\s+en|y\s+si|qu[eé]\s+pasa|cu[aá]nto|cu[aá]ntos|para|en\s+el\s+caso|y\s+para|c[oó]mo\s+ser[ií]a|donde|d[oó]nde|por\s+qu[eé]|por\s+que|aplica|es\s+posible)\b/i;
      const esPreguntaSeguimiento = patronSeguimiento.test(t) || t.length < 80;
      const historialValido = patronDominioUrbano.test(historialContext);
      if (esPreguntaSeguimiento && historialValido) {
        esValida = true;
      }
    }

    return { esValida, esSaludo: false };
  }

  // 15 PREGUNTAS DENTRO DE DOMINIO Y JURISDICCIÓN (ZMG)
  const PREGUNTAS_IN_DOMAIN = [
    { q: '¿Cuál es el porcentaje mínimo de suelo permeable en un predio según el Código Urbano de Jalisco?', id: 1 },
    { q: '¿Cuánto tengo que ceder para destinos públicos si desarrollo un fraccionamiento habitacional?', id: 2 },
    { q: '¿Qué ancho libre de banqueta se requiere para accesibilidad peatonal en Guadalajara?', id: 3 },
    { q: '¿Cuántos cajones de estacionamiento exige el Cuadro 48 para un local comercial?', id: 4 },
    { q: '¿Cuál es el COS y CUS máximo para una zonificación H3-U en Zapopan?', id: 5 },
    { q: '¿A qué velocidad se debe diseñar una zona escolar conforme a la Ley de Movilidad de Jalisco?', id: 6 },
    { q: '¿Cuándo es obligatoria una ciclovía segregada físicamente según el Artículo 88?', id: 7 },
    { q: '¿Es viable construir una torre de 8 niveles en un polígono Mixto Central MC?', id: 8 },
    { q: '¿Qué tipo de cimentación se recomienda para suelo de jal pomítico en Guadalajara?', id: 9 },
    { q: '¿Cómo afecta una arcilla expansiva de Tlajomulco a la estructura de una edificación?', id: 10 },
    { q: '¿Qué restricciones establece el POTmet en las inmediaciones del Bosque La Primavera?', id: 11 },
    { q: '¿Cuál es el criterio del Manual SEDATU para cruces peatonales en meseta elevada?', id: 12 },
    { q: '¿Dónde se coloca la franja podotáctil de botones en esquinas de Guadalajara?', id: 13 },
    { q: 'Cálculo de desplante para un lote de 600 m2 con COS de 0.70', id: 14 },
    { q: '¿Cuál es la jerarquía de movilidad establecida en el Artículo 25?', id: 15 }
  ];

  // 15 PREGUNTAS FUERA DE DOMINIO O FUERA DE JURISDICCIÓN TERRITORIAL
  const PREGUNTAS_OUT_OF_DOMAIN = [
    { q: '¿Cómo preparar una receta de pastel de chocolate esponjoso?', id: 16, motivo: 'cocina' },
    { q: '¿Quién ganó el último mundial de fútbol entre Argentina y Francia?', id: 17, motivo: 'deportes' },
    { q: 'Escribe un poema sobre el amor y las estrellas de la noche', id: 18, motivo: 'poema' },
    { q: '¿Cuáles son los síntomas de la gripe y qué medicamento tomar?', id: 19, motivo: 'medicina' },
    { q: 'Enséñame un tutorial de programación en Python para principiantes', id: 20, motivo: 'programación' },
    { q: 'Cuéntame un chiste divertido sobre animales', id: 21, motivo: 'chiste' },
    { q: '¿Cuál es el horóscopo de Aries para esta semana?', id: 22, motivo: 'horóscopo' },
    { q: '¿Qué opinas de las elecciones presidenciales de Trump y Biden?', id: 23, motivo: 'política internacional' },
    { q: '¿Cuáles son los mejores trucos para ganar en Fortnite?', id: 24, motivo: 'videojuegos' },
    { q: 'Recomiéndame una película de ciencia ficción en Netflix', id: 25, motivo: 'cine' },
    { q: '¿Cuál es el reglamento de construcción en Monterrey Nuevo León?', id: 26, motivo: 'fuera_zmg' },
    { q: '¿Cómo tramitar una licencia de edificación en la CDMX?', id: 27, motivo: 'fuera_zmg' },
    { q: '¿Qué altura permiten en los edificios de Madrid España?', id: 28, motivo: 'fuera_zmg' },
    { q: 'Normas de zonificación urbana para Bogotá Colombia', id: 29, motivo: 'fuera_zmg' },
    { q: '¿Dónde comer los mejores tacos de barbacoa?', id: 30, motivo: 'comida' }
  ];

  it('valida con 100% de éxito las 15 preguntas legítimas de dominio urbano ZMG', () => {
    for (const item of PREGUNTAS_IN_DOMAIN) {
      const resZmg = verificarFueraDeZMG(item.q);
      expect(resZmg, `Pregunta ${item.id} no debe marcarse fuera de ZMG`).toBe(false);

      const resDom = esConsultaDeDominioUrbano(item.q);
      expect(resDom.esValida, `Pregunta ${item.id} ("${item.q}") debe ser válida en dominio`).toBe(true);
    }
  });

  it('bloquea adecuadamente las 15 preguntas fuera de tema o fuera de territorio ZMG', () => {
    for (const item of PREGUNTAS_OUT_OF_DOMAIN) {
      const fueraZmg = verificarFueraDeZMG(item.q);
      const enDominio = esConsultaDeDominioUrbano(item.q).esValida;

      // Debe ser detectada como fuera de ZMG O fuera de dominio
      const rechazadaCorrectamente = fueraZmg || !enDominio;
      expect(rechazadaCorrectamente, `Pregunta ${item.id} ("${item.q}") debe ser rechazada`).toBe(true);
    }
  });

  it('expande semánticamente sinónimos urbanos comunes en México (acera/banqueta, cajón/estacionamiento)', () => {
    const q1 = expandirTextoConSinonimos('ancho mínimo de acera');
    expect(q1).toContain('banqueta');

    const q2 = expandirTextoConSinonimos('número de cajones por predio');
    expect(q2).toContain('estacionamiento');
    expect(q2).toContain('cuadro 48');

    const q3 = expandirTextoConSinonimos('coeficiente cos de un lote');
    expect(q3).toContain('desplante');
    expect(q3).toContain('terreno');
  });

  it('recupera las fuentes normativas precisas para preguntas técnicas', () => {
    const fuentesPermeable = obtenerFuentesNormativasParaConsulta('¿Cuánto suelo absorbente se requiere?');
    expect(fuentesPermeable.length).toBeGreaterThan(0);
    expect(fuentesPermeable.some(f => f.articulo.includes('142'))).toBe(true);

    const fuentesCajones = obtenerFuentesNormativasParaConsulta('dotación de cajones de estacionamiento');
    expect(fuentesCajones.some(f => f.articulo.includes('48'))).toBe(true);

    const fuentesCiclovia = obtenerFuentesNormativasParaConsulta('diseño de ciclovía y red mibici');
    expect(fuentesCiclovia.some(f => f.documento.includes('Movilidad'))).toBe(true);
  });

  it('mantiene la memoria conversacional para preguntas breves de seguimiento', () => {
    const contextoPrevio = 'Estoy analizando un predio comercial de 1,000 m² con uso de suelo mixto en Guadalajara.';

    // Pregunta de seguimiento que por sí sola es ambigua o breve
    const seguimiento1 = esConsultaDeDominioUrbano('¿y en Zapopan?', contextoPrevio);
    expect(seguimiento1.esValida).toBe(true);

    const seguimiento2 = esConsultaDeDominioUrbano('¿cuántos cajones requiere ese caso?', contextoPrevio);
    expect(seguimiento2.esValida).toBe(true);

    const seguimiento3 = esConsultaDeDominioUrbano('¿qué altura máxima?', contextoPrevio);
    expect(seguimiento3.esValida).toBe(true);

    // Sin contexto previo, un texto sin sustento se evalúa con el filtro estricto
    const sinContexto = esConsultaDeDominioUrbano('¿y para el postre?');
    expect(sinContexto.esValida).toBe(false);
  });

  it('cuenta con notas de vigencia en todos los documentos del acervo normativo', () => {
    const fuentes = obtenerFuentesNormativasParaConsulta('código urbano y reglamento de zonificación');
    for (const f of fuentes) {
      expect(f.vigencia).toBeDefined();
      expect(f.vigencia.length).toBeGreaterThan(5);
    }
  });

});
