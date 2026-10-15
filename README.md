# 🏛️ UrbanBuild · URBIN AI (Urban Intelligence Core)

**UrbanBuild** es una plataforma integral de analítica de movilidad urbana en tiempo real, peritaje normativo automatizado, visión computacional y matriz ejecutiva de toma de decisiones para el **Área Metropolitana de Guadalajara (ZMG / AMG)**.

---

## 🚀 Motor de Inteligencia Artificial: Gemini 3.8 Flash

La plataforma integra **Gemini 3.8 Flash (`gemini-3.8-flash`)** como motor primario y unificado en todos sus módulos y flujos de trabajo:
- **Consultas Normativas & Chat Pericial (`/api/chat`):** Procesamiento de lenguaje natural con memoria multi-turno, guardrails de código cerrado y recuperación de fuentes jurídicas.
- **Diagnóstico Multimodal de Predios y Terrenos (`/api/analizar`):** Inspección visual de fotografías y planos catastrales para determinar aptitud de suelo, viabilidad de edificación, altura máxima y materiales recomendados (cimentación y estructura).
- **Generador de Dictámenes Urbanos (`/api/dictamen`):** Elaboración de informes técnicos de intervención vial, mitigación y cálculo exacto de COS/CUS.
- **Matriz de Decisiones & Síntesis de Proyectos (`/api/decisiones/sintetizar`):** Generación estructurada de metas cuantificables, carteras de inversión y análisis de impacto ciudadano.
- **Telemetría y Visión Artificial (`/api/nvidia-vision`):** Conteo objetivo de aforos (peatones, vehículos, bicicletas y motocicletas).
- **Arquitectura de Respaldo Multicapa:** En caso de demoras o cuotas de red, el sistema conmuta automáticamente a `gemini-flash-latest` y finalmente a un motor experto normativo local de contingencia.

---

## 📜 Acervo Documental RAG & Marco Normativo Oficial (ZMG)

La plataforma opera bajo el principio de **código cerrado y dominio estrictamente restringido**, respondiendo exclusivamente a partir de los documentos normativos oficiales de Jalisco y el AMG:

| Documento Oficial | Ámbito | Ejes Clave y Artículos | Nota de Vigencia y Reformas |
| :--- | :---: | :--- | :--- |
| **Código Urbano para el Estado de Jalisco** | Estatal | Art. 142 (20% suelo permeable obligatorio), Art. 176 y 218 (16% cesiones públicas municipales), Art. 45 (banquetas accesibles). | *Decreto base 22221 publicado en 2008 con reformas acumuladas vigentes a 2026.* |
| **Reglamento Estatal de Zonificación de Jalisco** | Metropolitano | Cuadros 10 al 21 (matrices de uso H1 a H4, Mixto Central MC, Comercial CR, Industrial I1) y Cuadro 48 (dotación de cajones). | *Vigente en los 9 municipios de la ZMG.* |
| **Ley de Movilidad, Seguridad Vial y Transporte de Jalisco** | Estatal | Decreto 28855/LXIII/22: Art. 25 (Jerarquía de Movilidad), Art. 54 y 124 (límites de velocidad y entornos escolares a 20 km/h), Art. 88 y 309 (ciclovías confinadas). | *Armonizada con la Ley General de Movilidad federal.* |
| **Plan de Ordenamiento Territorial Metropolitano (POTmet)** | Metropolitano | Instrumento rector del **IMEPLAN** para Polígonos de Consolidación Urbana (PCU) y protección de La Primavera, Huentitán y Nixticuil. | *Aprobado por la Junta de Coordinación Metropolitana.* |
| **Manual de Calles: Diseño Vial para Ciudades Mexicanas (SEDATU)** | Federal | Secciones 3.2 y 4.1 (geometría de cruceros, mesetas peatonales y radios de esquina ≤ 3.5m). | *Versión oficial federal 2.0.* |
| **Reglamento para Personas con Discapacidad de Guadalajara** | Municipal | Art. 24 (guías podotáctiles de botones de 60cm con 70% contraste cromático). | *Reglamento Municipal vigente.* |

> **Nota sobre vigencia legal:** El Código Urbano es un decreto base de 2008 que ha recibido diversas reformas periódicas del Congreso del Estado de Jalisco; el sistema incluye citas precisas con recordatorios de verificación en el Periódico Oficial *"El Estado de Jalisco"*.

---

## 🛡️ Seguridad, Límites de Uso y Guardrails

1. **Límite de Uso por IP (Rate Limiting):**
   - Endpoints de IA protegidos con límite de **30 solicitudes por minuto por dirección IP** para salvaguardar la cuota de Gemini y mitigar denegaciones de servicio.
   - Retorno estándar HTTP `429 Too Many Requests` con cabeceras `Retry-After`, `X-RateLimit-Limit` y `X-RateLimit-Remaining`.
2. **Protección contra Fuerza Bruta en Login:**
   - Bloqueo temporal de 15 minutos tras 5 intentos fallidos consecutivos por IP en `/api/login`.
3. **Guardrail Territorial ZMG (9 Municipios):**
   - La plataforma restringe su operación exclusivamente a: **Guadalajara, Zapopan, San Pedro Tlaquepaque, Tlajomulco de Zúñiga, Tonalá, El Salto, Ixtlahuacán de los Membrillos, Juanacatlán y Zapotlanejo**.
   - Consultas fuera de esta demarcación (ej. CDMX, Monterrey, Madrid) son rechazadas educadamente explicando la jurisdicción.
4. **Guardrail de Dominio Cerrado:**
   - Filtro temático estricto que rechaza preguntas fuera de contexto (recetas de cocina, chistes, deportes, medicina, programación ajena o política no urbana).
5. **Registro de Preguntas Sin Resolver (`/api/admin/preguntas-sin-respuesta`):**
   - Auditoría automática en memoria de consultas rechazadas o fuera de acervo para orientar la carga de nuevos documentos normativos.

---

## 📡 Referencia de la API REST

### Endpoints Públicos / Operativos
- `GET /api/health`: Diagnóstico general del servicio, modelo activo (`gemini-3.8-flash`), acervo documental y estado de API.
- `POST /api/chat`: Chat con URBIN. Acepta `prompt`, `lat`, `lon`, `historial` (memoria multi-turno) o archivos adjuntos en `multipart/form-data`. Devuelve `reply`, `sources` y `datos_normativos`.
- `POST /api/analizar`: Análisis multimodal con Gemini 3.8 Flash y visión artificial. Acepta archivos (`image/*`, `video/*`, `application/pdf`) y modos (`terreno`, `normativa`, `yolo`).
- `POST /api/dictamen`: Generación de dictamen técnico paramétrico. Parámetros: `landArea`, `landUse`, `trafficData` (`zona`, `peatones`, `vehiculos`, etc.).
- `POST /api/decisiones/sintetizar`: Síntesis JSON de objetivos y proyectos de inversión pública en la ZMG.
- `POST /api/nvidia-vision`: Conteo telemétrico de objetos en imágenes urbanas.

### Endpoints Administrativos y de Sesión
- `GET /api/sesion`: Verificación de sesión de usuario y privilegios (`admin` o `invitado`).
- `POST /api/login`: Inicio de sesión protegido con cookie HttpOnly y Rate Limiting.
- `POST /api/logout`: Cierre de sesión y destrucción de cookie de autenticación.
- `GET /api/admin/preguntas-sin-respuesta`: Consulta de bitácora de preguntas no resueltas (requiere rol admin).

---

## 💻 Instalación y Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (.env)
cp .env.example .env
# Definir GEMINI_API_KEY en .env

# 3. Iniciar servidor de desarrollo en puerto 3000
npm run dev

# 4. Ejecutar pruebas automáticas
npm test

# 5. Compilar para producción
npm run build
npm start
```
