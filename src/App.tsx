/**
 * UrbanBuild | Plataforma de Inteligencia Urbana y Movilidad
 * Basada en la arquitectura visual y diseño corporativo de Hikvision México (www.hikvision.com/mx/)
 * Colaboración: Escuela Politécnica de Guadalajara & PIMUS Jalisco
 */

import React, { useState, useEffect } from 'react';
import {
  Car,
  Users,
  Compass,
  FileText,
  Award,
  Shield,
  Search,
  Bot,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  X,
  Upload,
  RotateCcw,
  Globe,
  Phone,
  Video,
  Radar,
  Cpu,
  Eye,
  Sliders,
  Play,
  Pause,
  Download,
  Server,
  HelpCircle,
  BarChart3,
  MapPin,
  FileCheck,
  Calculator,
  Mountain,
  Sun,
  Moon
} from 'lucide-react';

import { URBAN_NODES, TelemetryNode } from './data/urbanData';
import { YoloCrucesChart } from './components/YoloCrucesChart';
import { YoloObjectsChart } from './components/YoloObjectsChart';
import { YoloLanesChart } from './components/YoloLanesChart';
import { GisMapExplorer } from './components/GisMapExplorer';
import { NormativeViewer } from './components/NormativeViewer';
import { DecisionsMatrix } from './components/DecisionsMatrix';
import { AdminPanel } from './components/AdminPanel';
import { OlmosChatModal } from './components/OlmosChatModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { UrbanCalculator } from './components/UrbanCalculator';
import { TerrainAdvisor } from './components/TerrainAdvisor';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'inicio' | 'soluciones' | 'telemetria' | 'gis' | 'normatividad' | 'calculadora' | 'terreno' | 'decisiones' | 'admin'
  >('inicio');

  const [selectedNode, setSelectedNode] = useState<TelemetryNode>(URBAN_NODES[0]);
  const [isOlmosOpen, setIsOlmosOpen] = useState(false);
  const [olmosInitialQuery, setOlmosInitialQuery] = useState<string | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Hero carousel slides (Hikvision style)
  const heroSlides = [
    {
      badge: 'Soluciones de Tráfico Inteligente (ITS)',
      title: 'Inteligencia Artificial para un Futuro Urbano Seguro',
      description:
        'De los datos a mejores ciudades. Analizamos la movilidad urbana en tiempo real con visión por computadora YOLOv8 y cámaras DeepinView para generar recomendaciones sustentadas en la normativa vigente.',
      actionText: 'Ver Telemetría en Vivo',
      actionTab: 'telemetria' as const,
      image:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop',
    },
    {
      badge: 'Tecnología TandemVu & DeepinView',
      title: 'Monitoreo Perimetral y Cruces Seguros en Guadalajara',
      description:
        'Supervisión continua en nodos críticos metropolitanos: Av. Vallarta, Glorieta Minerva y el entorno escolar de la Escuela Politécnica de Guadalajara con radar y clasificación multiclase.',
      actionText: 'Explorar Mapa GIS',
      actionTab: 'gis' as const,
      image:
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1920&auto=format&fit=crop',
    },
    {
      badge: 'Marco Legal y RAG Vectorial',
      title: 'Cruce Normativo con el Código Urbano de Jalisco',
      description:
        'Dictámenes técnicos automatizados según el Código Urbano, la Ley de Movilidad Sostenible y el Manual de Calles SEDATU para agilizar la priorización de obras públicas.',
      actionText: 'Consultar Normativa RAG',
      actionTab: 'normatividad' as const,
      image:
        'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1920&auto=format&fit=crop',
    },
  ];

  const HERO_IMAGE_PRESETS = [
    { title: 'Ciudad Moderna & Rascacielos', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop' },
    { title: 'Tráfico Urbano y Luces Nocturnas', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1920&auto=format&fit=crop' },
    { title: 'Centro Tecnológico ITS', url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1920&auto=format&fit=crop' },
    { title: 'Corredor Metropolitano Aéreo', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop' },
    { title: 'Avenida Urbana Guadalajara', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920&auto=format&fit=crop' },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [customHeroImage, setCustomHeroImage] = useState<string>(() => {
    return localStorage.getItem('urban_custom_hero_image') || '';
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  const activeHeroBackground = customHeroImage || heroSlides[currentSlide].image;

  const handleNextSlide = () => {
    setIsAutoPlay(false);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setIsAutoPlay(false);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleSelectPresetImage = (url: string) => {
    setCustomHeroImage(url);
    localStorage.setItem('urban_custom_hero_image', url);
    setShowImageModal(false);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setCustomHeroImage(customUrlInput.trim());
    localStorage.setItem('urban_custom_hero_image', customUrlInput.trim());
    setShowImageModal(false);
    setCustomUrlInput('');
  };

  const handleResetToCarousel = () => {
    setCustomHeroImage('');
    localStorage.removeItem('urban_custom_hero_image');
    setShowImageModal(false);
  };

  // Live CMS State
  const [cmsHeroBadge, setCmsHeroBadge] = useState('Sistema de Movilidad Inteligente');
  const [cmsHeroTitle, setCmsHeroTitle] = useState('Inteligencia Artificial para un Futuro Seguro');
  const [cmsHeroDesc, setCmsHeroDesc] = useState(
    'De los datos a mejores ciudades. Analizamos la movilidad urbana en tiempo real para generar recomendaciones de intervención basadas en normativa vigente.'
  );

  const [isInlineEdit, setIsInlineEdit] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('urbanbuild_theme') || localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      const themeStr = next ? 'dark' : 'light';
      try {
        localStorage.setItem('urbanbuild_theme', themeStr);
        localStorage.setItem('theme', themeStr);
      } catch {}
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const role = localStorage.getItem('urbanbuild_role');
    setIsAdminLoggedIn(role === 'admin');

    const saved = localStorage.getItem('urban_cms_index.html');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.badge) setCmsHeroBadge(d.badge);
        if (d.title) setCmsHeroTitle(d.title);
        if (d.desc) setCmsHeroDesc(d.desc);
      } catch (e) {}
    }
  }, []);

  const toggleInlineEdit = () => {
    const role = localStorage.getItem('urbanbuild_role');
    if (role !== 'admin') {
      window.location.href = 'login.html?redirect=index.html';
      return;
    }
    if (!isInlineEdit) {
      setIsInlineEdit(true);
    } else {
      setIsInlineEdit(false);
      const data = {
        badge: cmsHeroBadge,
        title: cmsHeroTitle,
        desc: cmsHeroDesc
      };
      localStorage.setItem('urban_cms_index.html', JSON.stringify(data));
    }
  };

  const [userRole, setUserRole] = useState<'admin' | 'perito' | 'observador'>('admin');

  // Auto-play hero slider
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlay && activeTab === 'inicio') {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5500);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, activeTab, heroSlides.length]);

  const openOlmosWithQuery = (query: string) => {
    setOlmosInitialQuery(query);
    setIsOlmosOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans selection:bg-[#c9122f] selection:text-white">
      {/* BARRA DE NAVEGACIÓN */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="text-3xl font-bold tracking-tighter">
              <button onClick={() => setActiveTab('inicio')} className="text-black hover:opacity-90 cursor-pointer">
                Urban
              </button>
              <button onClick={() => setActiveTab('admin')} className="text-[#c9122f] hover:underline cursor-pointer">
                Build
              </button>
            </div>

            <div className="hidden md:flex space-x-8 items-center text-sm font-semibold">
              <button
                onClick={() => setActiveTab('inicio')}
                className={`py-2 transition-colors cursor-pointer ${
                  activeTab === 'inicio' ? 'text-[#c9122f] border-b-2 border-[#c9122f]' : 'text-gray-600 hover:text-[#c9122f]'
                }`}
              >
                Inicio
              </button>
              <a
                href="estadisticas.html"
                className="text-gray-600 hover:text-[#c9122f] transition-colors py-2 flex items-center gap-1"
              >
                <span>Estadísticas</span>
              </a>
              <button
                onClick={() => setActiveTab('normatividad')}
                className={`py-2 transition-colors cursor-pointer ${
                  activeTab === 'normatividad' ? 'text-[#c9122f] border-b-2 border-[#c9122f]' : 'text-gray-600 hover:text-[#c9122f]'
                }`}
              >
                Normativa
              </button>
              <button
                onClick={() => setActiveTab('calculadora')}
                className={`py-2 transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'calculadora' ? 'text-[#c9122f] border-b-2 border-[#c9122f]' : 'text-gray-600 hover:text-[#c9122f]'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-[#c9122f]" />
                <span>Calculadora COS/CUS</span>
              </button>
              <button
                onClick={() => setActiveTab('terreno')}
                className={`py-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'terreno' ? 'text-[#c9122f] border-b-2 border-[#c9122f]' : 'text-gray-600 hover:text-[#c9122f]'
                }`}
              >
                <Mountain className="w-3.5 h-3.5 text-[#c9122f]" />
                <span className="font-bold">Detector Terreno</span>
                <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-mono font-bold">IA</span>
              </button>
              <button
                onClick={() => openOlmosWithQuery('Recomendaciones de intervención pericial para cruces peatonales')}
                className="text-gray-600 hover:text-[#c9122f] transition-colors py-2 cursor-pointer"
              >
                Recomendaciones
              </button>
              <button
                onClick={() => setActiveTab('decisiones')}
                className={`py-2 transition-colors cursor-pointer ${
                  activeTab === 'decisiones' ? 'text-[#c9122f] border-b-2 border-[#c9122f]' : 'text-gray-600 hover:text-[#c9122f]'
                }`}
              >
                Toma de Decisiones
              </button>
            </div>

            {/* Iconos a la derecha (Robot, Interruptor de tema, Iniciar Sesión, Buscador) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {isAdminLoggedIn && (
                <button
                  id="nav-robot-btn"
                  onClick={toggleInlineEdit}
                  className={`transition focus:outline-none cursor-pointer p-2 rounded-lg ${
                    isInlineEdit ? 'text-emerald-500 font-bold scale-110' : 'text-gray-600 dark:text-gray-300 hover:text-[#c9122f]'
                  }`}
                  title={isInlineEdit ? 'Guardar Cambios en Vivo' : 'Modo Edición en Vivo'}
                >
                  <Bot className="w-5 h-5" />
                </button>
              )}

              {/* Interruptor de Tema (Modo Claro / Modo Oscuro) al lado del botón Iniciar Sesión */}
              <button
                id="theme-toggle"
                onClick={toggleTheme}
                type="button"
                className="p-2 rounded-lg text-gray-600 dark:text-gray-200 hover:text-[#c9122f] dark:hover:text-[#c9122f] hover:bg-gray-100 dark:hover:bg-slate-800 transition focus:outline-none cursor-pointer flex items-center justify-center border border-gray-200 dark:border-slate-700"
                title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                aria-label="Alternar tema claro y oscuro"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600 dark:text-gray-200" />
                )}
              </button>

              {/* Botón de Iniciar Sesión (no cambia si estás logeado o no) */}
              <button
                onClick={() => setActiveTab('admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-100 hover:text-[#c9122f] dark:hover:text-[#c9122f] border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 transition shadow-xs focus:outline-none cursor-pointer"
                title="Iniciar Sesión / Administración"
              >
                <Shield className="w-4 h-4 text-[#c9122f]" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </button>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-600 dark:text-gray-300 hover:text-[#c9122f] transition focus:outline-none cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                title="Buscar Documental Global (RAG)"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile subnavigation bar */}
          <div className="flex lg:hidden overflow-x-auto py-2.5 border-t border-gray-100 gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('inicio')}
              className={`px-3 py-1 rounded-md whitespace-nowrap ${
                activeTab === 'inicio' ? 'bg-[#c9122f] text-white' : 'text-gray-600'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setActiveTab('telemetria')}
              className={`px-3 py-1 rounded-md whitespace-nowrap ${
                activeTab === 'telemetria' ? 'bg-[#c9122f] text-white' : 'text-gray-600'
              }`}
            >
              Estadísticas
            </button>
            <button
              onClick={() => setActiveTab('gis')}
              className={`px-3 py-1 rounded-md whitespace-nowrap ${
                activeTab === 'gis' ? 'bg-[#c9122f] text-white' : 'text-gray-600'
              }`}
            >
              GIS
            </button>
            <button
              onClick={() => setActiveTab('normatividad')}
              className={`px-3 py-1 rounded-md whitespace-nowrap ${
                activeTab === 'normatividad' ? 'bg-[#c9122f] text-white' : 'text-gray-600'
              }`}
            >
              Normativa
            </button>
            <button
              onClick={() => setActiveTab('calculadora')}
              className={`px-3 py-1 rounded-md whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'calculadora' ? 'bg-[#c9122f] text-white' : 'text-gray-600'
              }`}
            >
              <Calculator className="w-3 h-3" />
              Calculadora
            </button>
            <button
              onClick={() => setActiveTab('decisiones')}
              className={`px-3 py-1 rounded-md whitespace-nowrap ${
                activeTab === 'decisiones' ? 'bg-[#c9122f] text-white' : 'text-gray-600'
              }`}
            >
              Decisiones
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1 rounded-md whitespace-nowrap ${
                activeTab === 'admin' ? 'bg-[#c9122f] text-white' : 'text-gray-600'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1">
        {/* VIEW 1: INICIO (HOME ESTILO HIKVISION MÉXICO) */}
        {activeTab === 'inicio' && (
          <div className="space-y-16">
            {/* HERO SLIDER ESTILO HIKVISION CON CAMBIO DE IMÁGENES */}
            <section
              className="relative text-white py-24 sm:py-32 lg:py-36 bg-[#1a1a1a] bg-cover bg-center transition-all duration-700 ease-in-out overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.85)), url('${activeHeroBackground}')`,
              }}
              onClick={() => {
                const slide = heroSlides[currentSlide];
                if (slide?.actionTab) {
                  setActiveTab(slide.actionTab);
                } else {
                  openOlmosWithQuery('');
                }
              }}
              title="Toca cualquier lugar de la imagen para ingresar a este módulo"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto pointer-events-none">
                <div className="max-w-3xl space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[#c9122f] font-bold text-xs uppercase tracking-widest block font-mono">
                      {heroSlides[currentSlide].badge}
                    </span>
                    {customHeroImage && (
                      <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Imagen Personalizada
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-tight">
                    {currentSlide === 0 ? cmsHeroTitle : heroSlides[currentSlide].title}
                  </h1>

                  <p className="text-gray-200 text-sm sm:text-lg leading-relaxed font-normal">
                    {currentSlide === 0 ? cmsHeroDesc : heroSlides[currentSlide].description}
                  </p>
                </div>
              </div>

              {/* BOLAS ROJAS INDICADORAS: SOLO INDICADORES DE DIAPOSITIVA (SIN NINGÚN BOTÓN) */}
              <div className="relative z-20 w-full mt-6 flex justify-center items-center gap-2.5">
                {heroSlides.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAutoPlay(false);
                      setCurrentSlide(idx);
                    }}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx
                        ? 'w-8 bg-[#c9122f] shadow-md shadow-red-600/50'
                        : 'w-2.5 bg-red-950/70 border border-red-700/60 hover:bg-[#c9122f] hover:scale-125'
                    }`}
                    title={`Diapositiva ${idx + 1}`}
                  />
                ))}
              </div>
            </section>

            {/* SECCIÓN ARQUITECTURA DEL SISTEMA (DISEÑO IMDOC-DELTA) */}
            <section className="py-20 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
                <h2 className="text-3xl font-extrabold text-black uppercase tracking-wider mb-2">
                  Arquitectura del Sistema
                </h2>
                <div className="w-12 h-1 bg-[#c9122f] mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm">
                  Selecciona cualquier fase para acceder a su módulo dedicado.
                </p>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Estadísticas */}
                  <div className="card-architecture p-6 relative flex flex-col justify-between">
                    <div>
                      <div className="text-[#c9122f] text-2xl mb-4">
                        <BarChart3 className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-black uppercase mb-2">
                        1. Estadísticas
                      </h3>
                      <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                        Generación de datos estructurados por hora/zona y mapas de calor.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <a
                        href="estadisticas.html"
                        className="text-[#c9122f] hover:text-[#a00e25] font-bold text-xs uppercase tracking-wider inline-flex items-center"
                      >
                        Ver Estadísticas (Página Aparte) <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </a>
                      <button
                        onClick={() => setActiveTab('telemetria')}
                        className="text-gray-500 hover:text-black font-semibold text-[11px] uppercase tracking-wider block text-left cursor-pointer"
                      >
                        Ver Telemetría en Index
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Normativa */}
                  <div className="card-architecture p-6 relative flex flex-col justify-between">
                    <span className="absolute top-4 right-4 bg-[#c9122f] text-white text-[10px] font-bold px-2.5 py-0.5 rounded">
                      CORE IA
                    </span>
                    <div>
                      <div className="text-[#c9122f] text-2xl mb-4">
                        <FileText className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-black uppercase mb-2">
                        2. Normativa
                      </h3>
                      <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                        Cruce de datos con reglamentos y normativas municipales vigentes.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('normatividad')}
                      className="text-[#c9122f] hover:text-[#a00e25] font-bold text-xs uppercase tracking-wider inline-flex items-center text-left cursor-pointer"
                    >
                      Ver Documentos PDF & RAG <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </button>
                  </div>

                  {/* Card 3: Recomendaciones */}
                  <div className="card-architecture p-6 relative flex flex-col justify-between">
                    <div>
                      <div className="text-[#c9122f] text-2xl mb-4">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-black uppercase mb-2">
                        3. Recomendaciones
                      </h3>
                      <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                        Guía de intervención visual y estructural con fundamento normativo.
                      </p>
                    </div>
                    <button
                      onClick={() => openOlmosWithQuery('Generar recomendaciones de intervención urbana pericial')}
                      className="text-[#c9122f] hover:text-[#a00e25] font-bold text-xs uppercase tracking-wider inline-flex items-center text-left cursor-pointer"
                    >
                      Ver Reportes <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </button>
                  </div>

                  {/* Card 4: Toma de Decisiones */}
                  <div className="card-architecture p-6 relative flex flex-col justify-between">
                    <div>
                      <div className="text-[#c9122f] text-2xl mb-4">
                        <Award className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-black uppercase mb-2">
                        4. Toma de Decisiones
                      </h3>
                      <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                        Panel ejecutivo para priorización de proyectos y presupuesto.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('decisiones')}
                      className="text-[#c9122f] hover:text-[#a00e25] font-bold text-xs uppercase tracking-wider inline-flex items-center text-left cursor-pointer"
                    >
                      Acceder al Panel <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </button>
                  </div>

                  {/* Card 6: Calculadora COS & CUS */}
                  <div className="card-architecture p-6 relative flex flex-col justify-between">
                    <span className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded">
                      ART. 142 & 176
                    </span>
                    <div>
                      <div className="text-[#c9122f] text-2xl mb-4">
                        <Calculator className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-black uppercase mb-2">
                        6. Calculadora COS & CUS
                      </h3>
                      <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                        Validación de coeficientes urbanos (COS/CUS), absorción del 20% y detección de escenarios inválidos.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('calculadora')}
                      className="text-[#c9122f] hover:text-[#a00e25] font-bold text-xs uppercase tracking-wider inline-flex items-center text-left cursor-pointer"
                    >
                      Abrir Calculadora <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </button>
                  </div>

                  {/* Card 7: Detector por Terreno & Edificación IA */}
                  <div className="card-architecture p-6 relative flex flex-col justify-between border-2 border-[#c9122f]/30 bg-gradient-to-br from-white via-red-50/20 to-white">
                    <span className="absolute top-4 right-4 bg-[#c9122f] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm">
                      NUEVA IA GEOTÉCNICA
                    </span>
                    <div>
                      <div className="text-[#c9122f] text-2xl mb-4">
                        <Mountain className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-black uppercase mb-2">
                        7. Detector por Terreno & Edificación
                      </h3>
                      <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                        La IA detecta aptitud por tipo de suelo (jal, arcilla, roca), dictamina si es conveniente construir, qué tipo de edificios, su altura máxima y materiales sugeridos.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('terreno')}
                      className="text-[#c9122f] hover:text-[#a00e25] font-bold text-xs uppercase tracking-wider inline-flex items-center text-left cursor-pointer"
                    >
                      Evaluar Terreno con IA <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* LIVE TELEMETRY SHOWCASE ON HOME */}
            <section className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 gap-3">
                  <div>
                    <span className="text-[#c9122f] font-bold text-xs uppercase tracking-widest block font-mono">
                      Inferencia en Tiempo Real
                    </span>
                    <h3 className="text-2xl font-extrabold text-black uppercase tracking-tight">
                      Muestra de Cruces Acumulados — YOLOv8 Nodo #26
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('telemetria')}
                    className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition"
                  >
                    Ver Todas las Gráficas
                  </button>
                </div>

                <YoloCrucesChart />
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: TELEMETRÍA (ESTADÍSTICAS & YOLO) */}
        {activeTab === 'telemetria' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header banner similar to estadisticas.html */}
            <div className="bg-[#1a1a1a] text-white p-8 rounded-md border-t-4 border-[#c9122f] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#c9122f] text-white flex items-center justify-center font-bold text-base shadow">
                    2
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider">
                    Estadísticas y Análisis de Movilidad
                  </h1>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm max-w-2xl">
                  Conteo por hora y por zona, flujos peatonales, vehiculares y ciclistas, puntos críticos y composición por carril generados por los modelos YOLOv8.
                </p>
              </div>

              {/* Node selector */}
              <div className="bg-[#2d2d2d] p-3 rounded border border-gray-700 text-xs font-mono">
                <span className="text-gray-400 block mb-1">SELECCIONAR NODO METROPOLITANO:</span>
                <select
                  value={selectedNode.id}
                  onChange={(e) => {
                    const found = URBAN_NODES.find((n) => n.id === e.target.value);
                    if (found) setSelectedNode(found);
                  }}
                  className="bg-black text-white px-3 py-1.5 rounded border border-gray-600 font-bold outline-none cursor-pointer"
                >
                  {URBAN_NODES.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* The 3 Exact Charts from the User's uploaded images */}
            <div className="space-y-8">
              <YoloCrucesChart />
              <YoloObjectsChart />
              <YoloLanesChart />
            </div>
          </div>
        )}

        {/* VIEW 3: GIS EXPLORER */}
        {activeTab === 'gis' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div className="bg-white border-l-4 border-[#c9122f] p-6 shadow-sm rounded-r-md">
              <h2 className="text-2xl font-extrabold text-black uppercase tracking-tight">
                Explorador GIS y Georreferenciación de Movilidad
              </h2>
              <p className="text-gray-600 text-xs mt-1">
                Visualiza los nodos críticos de la Zona Metropolitana de Guadalajara, calcula coeficientes de ocupación (COS/CUS) y verifica servidumbres urbanas.
              </p>
            </div>

            <GisMapExplorer
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
              onAskAiWithCoords={(lat, lng, ctx) =>
                openOlmosWithQuery(`Dictamen para coordenadas [Lat: ${lat}, Lon: ${lng}]. Contexto: ${ctx}`)
              }
            />
          </div>
        )}

        {/* VIEW 4: NORMATIVIDAD & RAG */}
        {activeTab === 'normatividad' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#c9122f] text-white flex items-center justify-center shadow">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black uppercase">
                    Calculadora Normativa COS & CUS
                  </h3>
                  <p className="text-xs text-gray-500">
                    Calcula ocupación, edificación y absorción del 20% (Art. 142) con alertas automáticas de escenarios matemáticamente inválidos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('calculadora')}
                className="bg-[#c9122f] hover:bg-[#a00e25] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                <Calculator className="w-3.5 h-3.5" /> Abrir Calculadora <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <NormativeViewer
              onAskAiWithArticle={(query) => openOlmosWithQuery(query)}
            />
          </div>
        )}

        {/* VIEW: CALCULADORA COS & CUS */}
        {activeTab === 'calculadora' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div className="bg-white border-l-4 border-[#c9122f] p-6 shadow-sm rounded-r-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-7 h-7 rounded bg-[#c9122f] text-white flex items-center justify-center font-bold text-xs">
                    <Calculator className="w-4 h-4" />
                  </span>
                  <h2 className="text-2xl font-extrabold text-black uppercase tracking-tight">
                    Calculadora Normativa COS & CUS
                  </h2>
                </div>
                <p className="text-gray-600 text-xs">
                  Cálculo de Coeficiente de Ocupación del Suelo (COS), Coeficiente de Utilización del Suelo (CUS), suelo permeable del 20% (Art. 142) y cesiones municipales (Art. 176 Código Urbano de Jalisco).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openOlmosWithQuery('¿Cuáles son los límites de COS, CUS y cesiones según el Código Urbano de Jalisco?')}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Bot className="w-3.5 h-3.5 text-[#c9122f]" /> Consultar Normativa IA
                </button>
              </div>
            </div>

            <UrbanCalculator
              onSendToAi={(query) => openOlmosWithQuery(query)}
            />
          </div>
        )}

        {/* VIEW: DETECTOR POR TERRENO, EDIFICACIÓN & MATERIALES */}
        {activeTab === 'terreno' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <TerrainAdvisor
              onSendToAiChat={(prompt) => openOlmosWithQuery(prompt)}
            />
          </div>
        )}

        {/* VIEW 5: DECISIONES */}
        {activeTab === 'decisiones' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <DecisionsMatrix
              onOpenAiWithContext={(query) => openOlmosWithQuery(query)}
            />
          </div>
        )}

        {/* VIEW 6: ADMIN PRO */}
        {activeTab === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <AdminPanel
              cmsHeroBadge={cmsHeroBadge}
              cmsHeroTitle={cmsHeroTitle}
              cmsHeroDesc={cmsHeroDesc}
              cmsHeroImage={customHeroImage || heroSlides[0].image}
              onUpdateCms={(b, t, d, img) => {
                setCmsHeroBadge(b);
                setCmsHeroTitle(t);
                setCmsHeroDesc(d);
                if (img) {
                  setCustomHeroImage(img);
                  localStorage.setItem('urban_custom_hero_image', img);
                }
              }}
              userRole={userRole}
              onChangeUserRole={setUserRole}
            />
          </div>
        )}
      </main>

      {/* 4. BOTÓN FLOTANTE ESTILO URBIN IA DE HIKVISION */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => openOlmosWithQuery('')}
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            fontWeight: 'bold',
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            border: '1px solid #d1d5db',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            if (window.innerWidth > 768) (e.currentTarget as HTMLElement).style.width = '175px';
          }}
          onMouseLeave={(e) => {
            if (window.innerWidth > 768) (e.currentTarget as HTMLElement).style.width = '56px';
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <Bot style={{ width: '24px', height: '24px', color: '#c9122f' }} />
            <span
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '10px',
                height: '10px',
                backgroundColor: '#22c55e',
                borderRadius: '50%',
                border: '2px solid #ffffff',
              }}
            />
          </div>
          <span
            style={{
              whiteSpace: 'nowrap',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              paddingRight: '16px',
              fontWeight: 700,
            }}
          >
            URBIN IA
          </span>
        </button>
      </div>

      {/* 5. MODALES GLOBALES */}
      <OlmosChatModal
        isOpen={isOlmosOpen}
        onClose={() => setIsOlmosOpen(false)}
        initialQuery={olmosInitialQuery}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAction={(tab, query) => {
          if (['inicio', 'telemetria', 'gis', 'normatividad', 'calculadora', 'decisiones', 'admin'].includes(tab)) {
            setActiveTab(tab as any);
          }
          if (query) {
            openOlmosWithQuery(`Consulta de búsqueda: ${query}`);
          }
        }}
      />

      {/* MODAL DE CAMBIO DE IMÁGENES DE FONDO */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#c9122f]" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Galería y Selector de Imagen de Fondo
                </h3>
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2.5 font-mono">
                Imágenes Predefinidas de Movilidad & Ciudad
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {HERO_IMAGE_PRESETS.map((item, idx) => {
                  const isSelected = activeHeroBackground === item.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectPresetImage(item.url)}
                      className={`group relative rounded-xl overflow-hidden border cursor-pointer transition ${
                        isSelected
                          ? 'border-[#c9122f] ring-2 ring-[#c9122f]/50'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-24 object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-2.5 flex flex-col justify-end">
                        <span className="text-[11px] font-bold text-white leading-tight">
                          {item.title}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-mono text-[#c9122f] font-bold mt-0.5">
                            ✓ Activa ahora
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Input */}
            <form onSubmit={handleApplyCustomUrl} className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <label className="block font-bold text-slate-300 uppercase tracking-wider font-mono text-[11px]">
                O ingresa una URL personalizada de imagen:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/tu-imagen-aqui..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-[#c9122f]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-[#c9122f] hover:bg-[#a00e25] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md shrink-0"
                >
                  Aplicar Fondo
                </button>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleResetToCarousel}
                className="text-rose-400 hover:text-rose-300 underline font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Carrusel Automático de Diapositivas</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. HIKVISION CORPORATE FOOTER */}
      <footer className="bg-[#1a1a1a] text-gray-400 py-12 border-t-4 border-[#c9122f] mt-auto text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-8 border-b border-gray-800">
            {/* Col 1 */}
            <div>
              <div className="text-2xl font-bold tracking-tighter text-white mb-3">
                Urban<span className="text-[#c9122f]">Build</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                Plataforma de Inteligencia Urbana, Visión Computacional y Movilidad Sostenible. Desarrollada para municipios y organismos públicos de movilidad.
              </p>
              <span className="text-[11px] font-mono text-gray-500 block">
                Escuela Politécnica de Guadalajara · PIMUS Jalisco
              </span>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Soluciones e Inteligencia
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setActiveTab('telemetria')} className="hover:text-white transition cursor-pointer">
                    Tráfico Inteligente (ITS)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('gis')} className="hover:text-white transition cursor-pointer">
                    Georreferenciación y Aforos GIS
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('normatividad')} className="hover:text-white transition cursor-pointer">
                    Cruce Normativo RAG
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('decisiones')} className="hover:text-white transition cursor-pointer">
                    Matriz de Inversión Municipal
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Normativas Vectorizadas
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setActiveTab('normatividad')} className="hover:text-white transition cursor-pointer">
                    Código Urbano de Jalisco
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('normatividad')} className="hover:text-white transition cursor-pointer">
                    Ley de Movilidad y Seguridad Vial
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('normatividad')} className="hover:text-white transition cursor-pointer">
                    Manual de Calles SEDATU
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('normatividad')} className="hover:text-white transition cursor-pointer">
                    Reglamento de Accesibilidad GDL
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Contacto México & Soporte
              </h4>
              <p className="text-xs text-gray-400 mb-2">
                Av. Revolución #1500, Sector Reforma, Guadalajara, Jalisco, México.
              </p>
              <div className="space-y-1 font-mono text-[11px]">
                <p>Tel: +52 (33) 3837-4400</p>
                <p>Email: soporte@urbanbuild.gdl.gob.mx</p>
                <p className="text-emerald-400 font-bold">Línea Pericial 24/7 Activa</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p>&copy; 2026 UrbanBuild Systems. Todos los derechos reservados. Escuela Politécnica de Guadalajara.</p>
            <div className="flex items-center gap-6 text-[11px]">
              <span className="hover:text-white cursor-pointer">Aviso de Privacidad</span>
              <span className="hover:text-white cursor-pointer">Términos de Servicio</span>
              <span
                onClick={() => setActiveTab('admin')}
                className="text-[#c9122f] hover:underline cursor-pointer font-bold"
              >
                Acceso Administrador
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
