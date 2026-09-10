import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoutePricing, RouteStop } from '../../types';
import { 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Copy, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  AlertCircle, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  Clock, 
  ArrowRightLeft, 
  ShieldCheck, 
  Code, 
  Database, 
  MapPin, 
  ExternalLink,
  Sparkles,
  Filter
} from 'lucide-react';

const SQL_SCHEMA_SCRIPT = `-- ==========================================================
-- SCRIPT SQL: GESTIÓN DE TARIFAS Y PRECIOS DE PUNTOS DE ABORDAJE
-- SISTEMA TRANSPORTES GUTIÉRREZ (PostgreSQL / Supabase)
-- ==========================================================

-- 1. Tabla maestra de tarifas de ruta
CREATE TABLE IF NOT EXISTS public.route_pricings (
  id TEXT PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  single_price NUMERIC(10, 2) NOT NULL,
  round_trip_price NUMERIC(10, 2),
  time_estimate TEXT DEFAULT '2.5 hrs',
  notes TEXT,
  package_type TEXT DEFAULT 'estandar',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Asegurar columna fare_price en la tabla de puntos de abordaje
ALTER TABLE public.route_stops 
ADD COLUMN IF NOT EXISTS fare_price NUMERIC(10, 2);

-- 3. Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_route_pricings_origin_dest 
ON public.route_pricings(origin, destination);

CREATE INDEX IF NOT EXISTS idx_route_pricings_active 
ON public.route_pricings(is_active);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.route_pricings ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de acceso (lectura pública, escritura autenticada o servicio)
CREATE POLICY IF NOT EXISTS "Permitir lectura de tarifas"
ON public.route_pricings FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Permitir insercion y actualizacion de tarifas"
ON public.route_pricings FOR ALL
USING (true)
WITH CHECK (true);

-- 6. Inserción de tarifas oficiales base
INSERT INTO public.route_pricings (id, origin, destination, single_price, round_trip_price, time_estimate, package_type, is_active, notes)
VALUES 
  ('fare-mzn-gdl', 'Manzanillo', 'Guadalajara', 370.00, 720.00, '4.5 hrs', 'estandar', true, 'Tarifa troncal costa-metrópoli. Escala obligatoria en Colima.'),
  ('fare-gdl-mzn', 'Guadalajara', 'Manzanillo', 370.00, 720.00, '4.5 hrs', 'estandar', true, 'Retorno con paradas en Minerva, Plaza del Sol y Las Fuentes.'),
  ('fare-col-gdl', 'Colima', 'Guadalajara', 279.00, 540.00, '2.5 hrs', 'estandar', true, 'Salida directa desde Oficina San Fernando y escala autopista.'),
  ('fare-gdl-col', 'Guadalajara', 'Colima', 279.00, 540.00, '2.5 hrs', 'estandar', true, 'Ruta directa vía autopista 54D.'),
  ('fare-tec-gdl', 'Tecomán', 'Guadalajara', 330.00, 640.00, '3.5 hrs', 'estandar', true, 'Abordaje en Kiosko Jardín Principal.'),
  ('fare-gdl-tec', 'Guadalajara', 'Tecomán', 330.00, 640.00, '3.5 hrs', 'estandar', true, 'Retorno a Tecomán.'),
  ('fare-guz-gdl', 'Cd. Guzmán', 'Guadalajara', 170.00, 320.00, '1.5 hrs', 'estandar', true, 'Conexión sur de Jalisco Glorieta Colón.'),
  ('fare-gdl-guz', 'Guadalajara', 'Cd. Guzmán', 170.00, 320.00, '1.5 hrs', 'estandar', true, 'Salida hacia Cd. Guzmán.'),
  ('fare-mzn-col', 'Manzanillo', 'Colima', 130.00, 250.00, '1.5 hrs', 'estandar', true, 'Tramo interurbano estatal.'),
  ('fare-col-mzn', 'Colima', 'Manzanillo', 130.00, 250.00, '1.5 hrs', 'estandar', true, 'Tramo estatal hacia costa.'),
  ('fare-gdl-cas', 'Colima / Manzanillo', 'Cas/Consulado (Visa)', 450.00, 850.00, 'Directo', 'cas_visa', true, 'Servicio especial con traslado directo a citas consulares de visa americana.'),
  ('fare-gdl-zoo', 'Colima / Manzanillo', 'Zoológico Guadalajara', 500.00, 950.00, 'Directo', 'zoologico', true, 'Paquete turístico y familiar recreativo hacia Huentitán.')
ON CONFLICT (id) DO UPDATE 
SET single_price = EXCLUDED.single_price,
    round_trip_price = EXCLUDED.round_trip_price,
    updated_at = NOW();`;

export const RouteFaresManager: React.FC = () => {
  const { 
    routePricings, 
    addRoutePricing, 
    updateRoutePricing, 
    toggleRoutePricingStatus, 
    deleteRoutePricing, 
    resetRoutePricingsToDefault,
    routeStops,
    updateRouteStop,
    showNotification
  } = useApp();

  // Active view inside the Fares module: 'routes' | 'stops' | 'sql'
  const [activeSubTab, setActiveSubTab] = useState<'routes' | 'stops' | 'sql'>('routes');
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterPackage, setFilterPackage] = useState<string>('all');

  // Modal State for Route Fares (Crear / Editar)
  const [isFareModalOpen, setIsFareModalOpen] = useState(false);
  const [editingFare, setEditingFare] = useState<RoutePricing | null>(null);

  // Form Fields
  const [formOrigin, setFormOrigin] = useState('Manzanillo');
  const [formDestination, setFormDestination] = useState('Guadalajara');
  const [formSinglePrice, setFormSinglePrice] = useState<number>(370);
  const [formRoundTripPrice, setFormRoundTripPrice] = useState<number | ''>(720);
  const [formTimeEstimate, setFormTimeEstimate] = useState('4.5 hrs');
  const [formPackageType, setFormPackageType] = useState<'estandar' | 'cas_visa' | 'zoologico'>('estandar');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formNotes, setFormNotes] = useState('');

  // Delete Confirmation State
  const [deletingFareId, setDeletingFareId] = useState<string | null>(null);

  // Editing Boarding Point Fare Inline
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [stopPriceInput, setStopPriceInput] = useState<number | ''>('');

  // Copy SQL State
  const [copiedSql, setCopiedSql] = useState(false);

  // Computed metrics
  const activeFaresCount = routePricings.filter(p => p.isActive !== false).length;
  const inactiveFaresCount = routePricings.length - activeFaresCount;
  const specialPackagesCount = routePricings.filter(p => p.packageType && p.packageType !== 'estandar').length;

  // Filtered Route Fares
  const filteredFares = routePricings.filter(fare => {
    const matchesSearch = 
      fare.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fare.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fare.notes && fare.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const isActive = fare.isActive !== false;
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && isActive) || 
      (filterStatus === 'inactive' && !isActive);

    const matchesPackage = 
      filterPackage === 'all' || 
      (fare.packageType === filterPackage) ||
      (filterPackage === 'estandar' && (!fare.packageType || fare.packageType === 'estandar'));

    return matchesSearch && matchesStatus && matchesPackage;
  });

  // Open modal to add a new route fare
  const handleOpenAddFare = () => {
    setEditingFare(null);
    setFormOrigin('Colima');
    setFormDestination('Guadalajara');
    setFormSinglePrice(279);
    setFormRoundTripPrice(540);
    setFormTimeEstimate('2.5 hrs');
    setFormPackageType('estandar');
    setFormIsActive(true);
    setFormNotes('');
    setIsFareModalOpen(true);
  };

  // Open modal to edit an existing route fare
  const handleOpenEditFare = (fare: RoutePricing) => {
    setEditingFare(fare);
    setFormOrigin(fare.origin);
    setFormDestination(fare.destination);
    setFormSinglePrice(fare.singlePrice);
    setFormRoundTripPrice(fare.roundTripPrice !== undefined ? fare.roundTripPrice : '');
    setFormTimeEstimate(fare.timeEstimate || '2.5 hrs');
    setFormPackageType((fare.packageType as any) || 'estandar');
    setFormIsActive(fare.isActive !== false);
    setFormNotes(fare.notes || '');
    setIsFareModalOpen(true);
  };

  // Submit route fare form (Create or Update)
  const handleFareSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formOrigin.trim() || !formDestination.trim()) {
      showNotification('Especifica el origen y destino de la tarifa.', 'error');
      return;
    }

    if (formSinglePrice <= 0) {
      showNotification('El precio sencillo debe ser mayor a cero.', 'error');
      return;
    }

    if (editingFare && editingFare.id) {
      updateRoutePricing(editingFare.id, {
        origin: formOrigin.trim(),
        destination: formDestination.trim(),
        singlePrice: Number(formSinglePrice),
        roundTripPrice: formRoundTripPrice === '' ? undefined : Number(formRoundTripPrice),
        timeEstimate: formTimeEstimate.trim(),
        packageType: formPackageType,
        isActive: formIsActive,
        notes: formNotes.trim()
      });
    } else {
      addRoutePricing({
        origin: formOrigin.trim(),
        destination: formDestination.trim(),
        singlePrice: Number(formSinglePrice),
        roundTripPrice: formRoundTripPrice === '' ? undefined : Number(formRoundTripPrice),
        timeEstimate: formTimeEstimate.trim(),
        packageType: formPackageType,
        isActive: formIsActive,
        notes: formNotes.trim()
      });
    }

    setIsFareModalOpen(false);
  };

  // Save quick price for boarding point
  const handleSaveStopPrice = (stop: RouteStop) => {
    const newPrice = stopPriceInput === '' ? undefined : Number(stopPriceInput);
    updateRouteStop(stop.id, { farePrice: newPrice });
    setEditingStopId(null);
    setStopPriceInput('');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    showNotification('Script SQL copiado al portapapeles para ejecutar en Supabase.', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-black text-white p-6 md:p-8 rounded-3xl border-2 border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-md">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-2xl font-black uppercase tracking-wider text-white">
                  Gestión de Tarifas y Precios
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  En Vivo
                </span>
              </div>
              <p className="text-xs md:text-sm text-neutral-400">
                Control maestro para editar, actualizar, activar, desactivar o crear tarifas por viaje y fijar precios por punto de abordaje.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenAddFare}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-xs md:text-sm rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Tarifa</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Deseas restablecer las tarifas a los valores base oficiales de Transportes Gutiérrez?')) {
                  resetRoutePricingsToDefault();
                }
              }}
              className="px-3 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition-all border border-neutral-700 cursor-pointer"
              title="Restablecer tarifas predeterminadas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restablecer Base</span>
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800">
            <span className="text-[11px] font-black text-neutral-400 uppercase">Tarifas Totales</span>
            <p className="text-xl md:text-2xl font-black text-white mt-0.5">{routePricings.length}</p>
          </div>
          <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800">
            <span className="text-[11px] font-black text-emerald-400 uppercase">Tarifas Activas</span>
            <p className="text-xl md:text-2xl font-black text-emerald-400 mt-0.5">{activeFaresCount}</p>
          </div>
          <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800">
            <span className="text-[11px] font-black text-neutral-400 uppercase">Desactivadas</span>
            <p className="text-xl md:text-2xl font-black text-neutral-400 mt-0.5">{inactiveFaresCount}</p>
          </div>
          <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800">
            <span className="text-[11px] font-black text-purple-400 uppercase">Paquetes Especiales</span>
            <p className="text-xl md:text-2xl font-black text-purple-400 mt-0.5">{specialPackagesCount}</p>
          </div>
        </div>
      </div>

      {/* Module Sub-tabs */}
      <div className="flex items-center gap-2 border-b-2 border-neutral-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('routes')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'routes'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Tarifario de Rutas ({routePricings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stops')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'stops'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Precios por Punto de Abordaje ({routeStops.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sql')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'sql'
              ? 'bg-neutral-900 text-white shadow-md'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-500" />
          <span>Script SQL Supabase</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: TARIFARIO DE RUTAS (CRUD COMPLETO) */}
      {/* ======================================================== */}
      {activeSubTab === 'routes' && (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-neutral-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por origen, destino, paquete o notas..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-xs md:text-sm font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Toggle */}
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl border border-neutral-200 text-xs font-black">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      filterStatus === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                    }`}
                  >
                    Todas ({routePricings.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('active')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      filterStatus === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-neutral-600'
                    }`}
                  >
                    Activas ({activeFaresCount})
                  </button>
                  <button
                    onClick={() => setFilterStatus('inactive')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      filterStatus === 'inactive' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-600'
                    }`}
                  >
                    Inactivas ({inactiveFaresCount})
                  </button>
                </div>

                {/* Package Filter */}
                <select
                  value={filterPackage}
                  onChange={e => setFilterPackage(e.target.value)}
                  className="px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-2xl text-xs font-black text-neutral-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos los Paquetes</option>
                  <option value="estandar">Ruta Estándar</option>
                  <option value="cas_visa">CAS Consulado Visa</option>
                  <option value="zoologico">Zoológico GDL</option>
                </select>
              </div>
            </div>
          </div>

          {/* List of Fares */}
          {filteredFares.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-neutral-300 space-y-3">
              <DollarSign className="w-12 h-12 text-neutral-400 mx-auto" />
              <h4 className="text-base font-black text-neutral-800">No se encontraron tarifas</h4>
              <p className="text-xs md:text-sm text-neutral-500 max-w-md mx-auto">
                No hay tarifas registradas con los filtros seleccionados. Puedes crear una nueva tarifa con el botón superior.
              </p>
              <button
                onClick={handleOpenAddFare}
                className="mt-2 px-4 py-2.5 bg-orange-600 text-white rounded-2xl text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" /> Crear Nueva Tarifa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFares.map((fare) => {
                const isActive = fare.isActive !== false;
                const isSpecial = fare.packageType && fare.packageType !== 'estandar';

                return (
                  <div 
                    key={fare.id}
                    className={`bg-white rounded-3xl p-5 border-2 transition-all shadow-xs flex flex-col justify-between gap-4 ${
                      isActive ? 'border-neutral-200 hover:border-orange-300' : 'border-neutral-200 bg-neutral-50/70 opacity-75'
                    }`}
                  >
                    {/* Top Row: Route Origin -> Destination & Badges */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Active Status Badge Toggle */}
                          <button
                            onClick={() => fare.id && toggleRoutePricingStatus(fare.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                            }`}
                            title="Haz clic para activar o desactivar esta tarifa"
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>ACTIVA</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                                <span>DESACTIVADA</span>
                              </>
                            )}
                          </button>

                          {/* Package Type Badge */}
                          {fare.packageType === 'cas_visa' && (
                            <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-xl text-xs font-black">
                              ⭐ Trámite Visa CAS
                            </span>
                          )}
                          {fare.packageType === 'zoologico' && (
                            <span className="bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-xl text-xs font-black">
                              🦁 Paquete Zoológico
                            </span>
                          )}
                          {(!fare.packageType || fare.packageType === 'estandar') && (
                            <span className="bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-0.5 rounded-xl text-xs font-bold">
                              Troncal Regular
                            </span>
                          )}

                          {/* Estimated Time */}
                          {fare.timeEstimate && (
                            <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-xl flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              {fare.timeEstimate}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Route Header */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <h4 className="text-base md:text-lg font-black text-neutral-900 flex items-center gap-2">
                            <span>{fare.origin}</span>
                            <ArrowRightLeft className="w-4 h-4 text-orange-500 shrink-0" />
                            <span>{fare.destination}</span>
                          </h4>
                        </div>
                      </div>

                      {/* Pricing Details Banner */}
                      <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
                        <div>
                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">
                            Boleto Sencillo
                          </span>
                          <p className="text-lg md:text-xl font-black text-neutral-900 mt-0.5">
                            ${fare.singlePrice.toLocaleString('es-MX')}{' '}
                            <span className="text-xs font-bold text-neutral-500">MXN</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">
                            Viaje Redondo (Ahorro)
                          </span>
                          <p className="text-lg md:text-xl font-black text-orange-600 mt-0.5">
                            {fare.roundTripPrice ? (
                              <>
                                ${fare.roundTripPrice.toLocaleString('es-MX')}{' '}
                                <span className="text-xs font-bold text-neutral-500">MXN</span>
                              </>
                            ) : (
                              <span className="text-xs font-bold text-neutral-400">No configurado</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Notes / Policies */}
                      {fare.notes && (
                        <p className="text-xs text-neutral-600 bg-white border border-neutral-200 p-2.5 rounded-xl font-medium">
                          ℹ️ {fare.notes}
                        </p>
                      )}
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[140px]">
                        ID: {fare.id}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditFare(fare)}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer border border-neutral-200"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => setDeletingFareId(fare.id || null)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-200"
                          title="Eliminar tarifa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: PRECIOS POR PUNTO DE ABORDAJE */}
      {/* ======================================================== */}
      {activeSubTab === 'stops' && (
        <div className="space-y-4">
          <div className="bg-amber-50 p-5 rounded-3xl border-2 border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-700" />
              <h4 className="text-sm md:text-base font-black uppercase tracking-wider">
                Precios Asignados a Puntos de Abordaje
              </h4>
            </div>
            <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
              Aquí puedes fijar o ajustar directamente la tarifa cobrada cuando el pasajero o ventanilla eligen un punto de abordaje específico (ej. Paradas en Manzanillo, Tecomán, Colima, Guzmán, Cas/Consulado o Zoológico). Si dejas el precio vacío, el sistema utilizará la tarifa base general de la ruta.
            </p>
          </div>

          <div className="bg-white rounded-3xl border-2 border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-900 text-white uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-4 font-black">Orden</th>
                    <th className="py-3.5 px-4 font-black">Ubicación / Ciudad</th>
                    <th className="py-3.5 px-4 font-black">Referencia Física</th>
                    <th className="py-3.5 px-4 font-black text-center">Estado</th>
                    <th className="py-3.5 px-4 font-black text-right">Tarifa Asignada</th>
                    <th className="py-3.5 px-4 font-black text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-medium">
                  {routeStops.map((stop) => {
                    const isEditing = editingStopId === stop.id;

                    return (
                      <tr key={stop.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold font-mono text-neutral-500">
                          #{stop.order}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                          <div>
                            <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md inline-block mr-1.5">
                              {stop.city}
                            </span>
                            <span className="font-black">{stop.name}</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5 font-normal">{stop.address}</p>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-700 text-xs">
                          {stop.landmark}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                            stop.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                          }`}>
                            {stop.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-neutral-400 font-bold">$</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="Base"
                                value={stopPriceInput}
                                onChange={e => setStopPriceInput(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-24 p-1.5 bg-white border-2 border-orange-500 rounded-xl font-bold text-xs text-right focus:outline-none"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div>
                              {stop.farePrice !== undefined && stop.farePrice > 0 ? (
                                <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl text-xs md:text-sm inline-flex items-center gap-1">
                                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                  ${stop.farePrice.toLocaleString('es-MX')} MXN
                                </span>
                              ) : (
                                <span className="text-xs text-neutral-400 italic">
                                  Tarifa estándar de ruta
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleSaveStopPrice(stop)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                                title="Guardar tarifa"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStopId(null);
                                  setStopPriceInput('');
                                }}
                                className="p-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-xl cursor-pointer"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingStopId(stop.id);
                                setStopPriceInput(stop.farePrice !== undefined ? stop.farePrice : '');
                              }}
                              className="px-2.5 py-1.5 bg-neutral-100 hover:bg-orange-600 hover:text-white text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-neutral-200"
                            >
                              Fijar Precio
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: SCRIPT SQL PARA BASE DE DATOS */}
      {/* ======================================================== */}
      {activeSubTab === 'sql' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 text-white p-6 rounded-3xl border-2 border-neutral-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-6 h-6 text-emerald-400" />
                <h4 className="text-base font-black text-white">
                  Script SQL de Tablas de Tarifas y Precios
                </h4>
              </div>

              <button
                onClick={handleCopySql}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Copiado' : 'Copiar Script SQL'}</span>
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Puedes copiar y pegar este código directamente en el <strong>SQL Editor</strong> de tu panel de Supabase para que las tarifas y precios de puntos de abordaje persistan en tu base de datos PostgreSQL de producción.
            </p>

            <div className="relative">
              <pre className="bg-black text-emerald-400 font-mono text-xs p-4 rounded-2xl overflow-x-auto max-h-[420px] border border-neutral-800 selection:bg-emerald-900">
                {SQL_SCHEMA_SCRIPT}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREAR / EDITAR TARIFA DE RUTA */}
      {/* ======================================================== */}
      {isFareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-neutral-300 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-neutral-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="font-black text-base text-white">
                    {editingFare ? 'Editar Tarifa de Ruta' : 'Registrar Nueva Tarifa'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Define costos sencillos, redondos y condiciones de viaje.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFareModalOpen(false)}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFareSubmit} className="p-6 overflow-y-auto space-y-4 text-xs md:text-sm">
              {/* Origin & Destination */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                    Origen *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Manzanillo"
                    value={formOrigin}
                    onChange={e => setFormOrigin(e.target.value)}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                    Destino *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Guadalajara"
                    value={formDestination}
                    onChange={e => setFormDestination(e.target.value)}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Single Price & Round Trip Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                    Precio Boleto Sencillo ($ MXN) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      placeholder="370"
                      value={formSinglePrice}
                      onChange={e => setFormSinglePrice(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-black text-neutral-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                    Precio Viaje Redondo ($ MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="720"
                      value={formRoundTripPrice}
                      onChange={e => setFormRoundTripPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-black text-neutral-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Time Estimate & Package Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                    Tiempo Estimado de Viaje
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 4.5 hrs"
                    value={formTimeEstimate}
                    onChange={e => setFormTimeEstimate(e.target.value)}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                    Modalidad / Paquete
                  </label>
                  <select
                    value={formPackageType}
                    onChange={e => setFormPackageType(e.target.value as any)}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="estandar">Regular Troncal</option>
                    <option value="cas_visa">CAS Consulado (Visa)</option>
                    <option value="zoologico">Zoológico GDL</option>
                  </select>
                </div>
              </div>

              {/* Notes / Políticas */}
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Notas / Observaciones y Políticas
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Incluye seguro de viajero y escala técnica en San Fernando."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-xs md:text-sm font-medium text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Active Toggle Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-3 p-3.5 bg-neutral-50 rounded-2xl border-2 border-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={e => setFormIsActive(e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded-lg cursor-pointer accent-orange-600"
                  />
                  <div>
                    <span className="font-black text-neutral-900 text-xs">Tarifa Activa</span>
                    <p className="text-[10px] text-neutral-500">Visible para compra en línea y venta en ventanilla</p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFareModalOpen(false)}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold text-xs cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingFare ? 'Guardar Cambios' : 'Crear Tarifa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN */}
      {/* ======================================================== */}
      {deletingFareId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border-2 border-neutral-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-neutral-900 text-base">¿Eliminar esta tarifa?</h4>
              <p className="text-xs text-neutral-500 mt-1">
                Esta acción retirará la tarifa del catálogo activo. Podrás restablecer los valores base cuando lo necesites.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingFareId(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteRoutePricing(deletingFareId);
                  setDeletingFareId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-md"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
