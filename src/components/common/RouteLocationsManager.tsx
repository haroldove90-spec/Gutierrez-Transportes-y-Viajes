import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteStop } from '../../types';
import { 
  MapPin, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Check, 
  Copy, 
  ToggleLeft, 
  ToggleRight, 
  Compass, 
  Search, 
  AlertCircle, 
  Clock, 
  RotateCcw, 
  Navigation,
  CheckCircle2,
  X,
  Sparkles,
  DollarSign
} from 'lucide-react';

const BASE_7_CITIES = [
  'Manzanillo',
  'Tecomán',
  'Colima',
  'Guzmán',
  'Guadalajara',
  'Cas/Consulado',
  'Zoológico'
];

export const RouteLocationsManager: React.FC = () => {
  const { 
    routeStops, 
    addRouteStop, 
    updateRouteStop, 
    toggleRouteStopStatus, 
    deleteRouteStop, 
    resetRouteStopsToDefault,
    showNotification 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<RouteStop | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('Manzanillo');
  const [customCity, setCustomCity] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [formLandmark, setFormLandmark] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formMapsUrl, setFormMapsUrl] = useState('');
  const [formOrder, setFormOrder] = useState(1);
  const [formTimeOffset, setFormTimeOffset] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsSpecial, setFormIsSpecial] = useState(false);
  const [formFarePrice, setFormFarePrice] = useState<number | ''>('');
  const [formNotes, setFormNotes] = useState('');

  // Delete confirmation modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeCount = routeStops.filter(s => s.isActive).length;
  const inactiveCount = routeStops.length - activeCount;

  const handleOpenAddModal = () => {
    setEditingStop(null);
    setFormName('');
    setFormCity('Manzanillo');
    setCustomCity('');
    setIsCustomCity(false);
    setFormLandmark('');
    setFormAddress('');
    setFormMapsUrl('');
    setFormOrder(routeStops.length + 1);
    setFormTimeOffset(0);
    setFormIsActive(true);
    setFormIsSpecial(false);
    setFormFarePrice('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (stop: RouteStop) => {
    setEditingStop(stop);
    setFormName(stop.name);
    
    if (BASE_7_CITIES.includes(stop.city)) {
      setFormCity(stop.city);
      setIsCustomCity(false);
      setCustomCity('');
    } else {
      setFormCity('other');
      setIsCustomCity(true);
      setCustomCity(stop.city);
    }

    setFormLandmark(stop.landmark);
    setFormAddress(stop.address);
    setFormMapsUrl(stop.mapsUrl || '');
    setFormOrder(stop.order);
    setFormTimeOffset(stop.timeOffsetMins);
    setFormIsActive(stop.isActive);
    setFormIsSpecial(!!stop.isSpecialPoint);
    setFormFarePrice(stop.farePrice !== undefined ? stop.farePrice : '');
    setFormNotes(stop.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCity = isCustomCity ? customCity.trim() : formCity;
    if (!selectedCity) {
      showNotification('Especifica la ciudad o región de la ubicación.', 'error');
      return;
    }

    if (!formName.trim()) {
      showNotification('El nombre de la ubicación es obligatorio.', 'error');
      return;
    }

    // Clean Maps URL if user typed without protocol
    let cleanedUrl = formMapsUrl.trim();
    if (cleanedUrl && !cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
      cleanedUrl = `https://${cleanedUrl}`;
    }

    if (editingStop) {
      updateRouteStop(editingStop.id, {
        name: formName.trim(),
        city: selectedCity,
        landmark: formLandmark.trim(),
        address: formAddress.trim(),
        mapsUrl: cleanedUrl || undefined,
        order: Number(formOrder),
        timeOffsetMins: Number(formTimeOffset),
        isActive: formIsActive,
        isSpecialPoint: formIsSpecial,
        farePrice: formFarePrice === '' ? undefined : Number(formFarePrice),
        notes: formNotes.trim() || undefined
      });
    } else {
      addRouteStop({
        name: formName.trim(),
        city: selectedCity,
        landmark: formLandmark.trim(),
        address: formAddress.trim(),
        mapsUrl: cleanedUrl || undefined,
        order: Number(formOrder),
        timeOffsetMins: Number(formTimeOffset),
        isActive: formIsActive,
        isSpecialPoint: formIsSpecial,
        farePrice: formFarePrice === '' ? undefined : Number(formFarePrice),
        notes: formNotes.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  const handleCopyMapsUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showNotification('Enlace de Google Maps copiado al portapapeles.', 'success');
  };

  const filteredStops = routeStops.filter(stop => {
    const matchesSearch = 
      stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.landmark.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = filterCity === 'all' || stop.city === filterCity;
    
    const matchesStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? stop.isActive :
      !stop.isActive;

    return matchesSearch && matchesCity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Highlights */}
      <div className="bg-black text-white p-6 md:p-8 rounded-3xl border-2 border-neutral-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black shadow-lg shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-wider text-white">
                  Puntos de Partida y Ubicaciones GPS
                </h3>
                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Administrador
                </span>
              </div>
              <p className="text-xs md:text-sm text-neutral-400 mt-0.5">
                Configuración de las 7 paradas troncales base, adición de nuevos puntos y enlaces a Google Maps.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Ubicación ( + )</span>
            </button>
          </div>
        </div>

        {/* 7 Base Cities Pill Row */}
        <div className="pt-2 border-t border-neutral-800">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" /> 7 Puntos de Partida Actuales:
          </p>
          <div className="flex flex-wrap gap-2">
            {BASE_7_CITIES.map((city, idx) => {
              const countInCity = routeStops.filter(s => s.city === city && s.isActive).length;
              return (
                <button
                  key={city}
                  onClick={() => setFilterCity(filterCity === city ? 'all' : city)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    filterCity === city
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  <span className="text-orange-400 font-bold">{idx + 1}.</span>
                  <span>{city}</span>
                  <span className="bg-black/40 text-[10px] px-1.5 py-0.2 rounded-md font-mono text-neutral-300">
                    {countInCity}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800">
            <span className="text-xs font-black text-neutral-400 uppercase">Total Puntos</span>
            <p className="text-xl md:text-2xl font-black text-white mt-0.5">{routeStops.length}</p>
          </div>
          <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800">
            <span className="text-xs font-black text-emerald-400 uppercase">Puntos Activos</span>
            <p className="text-xl md:text-2xl font-black text-emerald-400 mt-0.5">{activeCount}</p>
          </div>
          <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800">
            <span className="text-xs font-black text-neutral-400 uppercase">Desactivados</span>
            <p className="text-xl md:text-2xl font-black text-neutral-400 mt-0.5">{inactiveCount}</p>
          </div>
          <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800">
            <span className="text-xs font-black text-orange-400 uppercase">Con Google Maps</span>
            <p className="text-xl md:text-2xl font-black text-orange-400 mt-0.5">
              {routeStops.filter(s => !!s.mapsUrl).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, ciudad, referencia o dirección física..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-xs md:text-sm font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl border border-neutral-200 text-xs font-black">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  filterStatus === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Todas ({routeStops.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  filterStatus === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-neutral-600'
                }`}
              >
                Activas ({activeCount})
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  filterStatus === 'inactive' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-600'
                }`}
              >
                Inactivas ({inactiveCount})
              </button>
            </div>

            {/* Reset to base 7 button */}
            <button
              onClick={() => {
                if (window.confirm('¿Deseas restablecer los puntos de partida a los 7 iniciales oficiales con sus enlaces de Google Maps?')) {
                  resetRouteStopsToDefault();
                }
              }}
              title="Restablecer a los 7 puntos iniciales"
              className="p-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-neutral-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden lg:inline">Restablecer 7 Base</span>
            </button>
          </div>
        </div>
      </div>

      {/* Locations List */}
      <div className="space-y-4">
        {filteredStops.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-neutral-300 space-y-3">
            <Compass className="w-12 h-12 text-neutral-400 mx-auto" />
            <h4 className="text-base font-black text-neutral-800">No se encontraron ubicaciones</h4>
            <p className="text-xs md:text-sm text-neutral-500 max-w-md mx-auto">
              No hay puntos de partida que coincidan con tus filtros. Intenta cambiar el término de búsqueda o agrega una nueva ubicación.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-2 px-4 py-2.5 bg-orange-600 text-white rounded-2xl text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Agregar Nueva Ubicación
            </button>
          </div>
        ) : (
          filteredStops.map((stop) => {
            return (
              <div
                key={stop.id}
                className={`bg-white rounded-3xl p-5 md:p-6 border-2 transition-all shadow-sm ${
                  stop.isActive
                    ? 'border-neutral-200 hover:border-orange-500'
                    : 'border-neutral-200 bg-neutral-50/70 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Active Status Badge / Toggle */}
                      <button
                        onClick={() => toggleRouteStopStatus(stop.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                          stop.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                        }`}
                        title="Haz clic para activar o desactivar este punto"
                      >
                        {stop.isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ACTIVA (Visible)</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                            <span>INACTIVA (Oculta)</span>
                          </>
                        )}
                      </button>

                      {/* City Badge */}
                      <span className="bg-neutral-900 text-white px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider">
                        {stop.city}
                      </span>

                      {/* Fare Price Badge */}
                      {stop.farePrice !== undefined && stop.farePrice > 0 ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs">
                          <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                          ${stop.farePrice.toLocaleString('es-MX')} MXN
                        </span>
                      ) : (
                        <span className="bg-neutral-100 text-neutral-600 border border-neutral-200 px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1">
                          Tarifa Base
                        </span>
                      )}

                      {/* Special Point Badge */}
                      {stop.isSpecialPoint && (
                        <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-xl text-xs font-black">
                          ⭐ Punto Especial
                        </span>
                      )}

                      {/* Order & Time Offset */}
                      <span className="text-xs font-mono font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> +{stop.timeOffsetMins} min
                      </span>
                    </div>

                    {/* Name */}
                    <h4 className="text-base md:text-lg font-black text-neutral-900">
                      {stop.name}
                    </h4>

                    {/* Landmark and Address */}
                    <div className="text-xs md:text-sm text-neutral-600 space-y-1">
                      <p className="flex items-start gap-1.5">
                        <span className="font-black text-neutral-800 shrink-0">📍 Referencia:</span>
                        <span className="font-medium text-neutral-700">{stop.landmark}</span>
                      </p>
                      <p className="flex items-start gap-1.5">
                        <span className="font-black text-neutral-800 shrink-0">🏢 Dirección:</span>
                        <span className="font-medium text-neutral-700">{stop.address}</span>
                      </p>
                      {stop.notes && (
                        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-xl mt-1.5 font-medium">
                          ℹ️ {stop.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions & Google Maps Link */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                    {/* Google Maps Button */}
                    {stop.mapsUrl ? (
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <a
                          href={stop.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl text-xs md:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                        >
                          <Navigation className="w-4 h-4 text-emerald-100" />
                          <span>Abrir en Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                        </a>

                        <button
                          onClick={() => handleCopyMapsUrl(stop.mapsUrl!)}
                          title="Copiar enlace de Google Maps"
                          className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl transition-all cursor-pointer border border-neutral-200 active:scale-95"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 italic bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200">
                        Sin enlace Maps
                      </span>
                    )}

                    {/* Edit & Delete & Toggle Button Group */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleOpenEditModal(stop)}
                        className="flex-1 sm:flex-initial py-2 px-3 bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-800 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-neutral-200"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => toggleRouteStopStatus(stop.id)}
                        className={`flex-1 sm:flex-initial py-2 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          stop.isActive
                            ? 'bg-neutral-100 hover:bg-amber-50 text-neutral-700 hover:text-amber-800 border-neutral-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {stop.isActive ? 'Desactivar' : 'Activar'}
                      </button>

                      <button
                        onClick={() => setDeletingId(stop.id)}
                        className="p-2 bg-neutral-100 hover:bg-red-50 text-neutral-500 hover:text-red-600 rounded-2xl transition-all cursor-pointer border border-neutral-200"
                        title="Eliminar ubicación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Agregar / Editar Ubicación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg my-auto bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-neutral-300 flex flex-col max-h-[92dvh]">
            {/* Modal Header */}
            <div className="bg-black px-5 py-4 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="text-base font-black tracking-wider uppercase text-white">
                    {editingStop ? 'Editar Punto de Partida' : 'Nueva Ubicación de Partida'}
                  </h3>
                  <p className="text-xs text-neutral-400">Configuración manual de parada y Google Maps</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs md:text-sm">
              {/* Name */}
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Nombre de la Ubicación / Parada *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Manzanillo (Soriana Híper / Blvd. Miguel de la Madrid)"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* City Selector */}
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Ciudad o Región *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {BASE_7_CITIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setFormCity(c);
                        setIsCustomCity(false);
                      }}
                      className={`p-2.5 rounded-xl font-bold text-xs text-center border-2 transition-all cursor-pointer ${
                        !isCustomCity && formCity === c
                          ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCity(true);
                      setFormCity('other');
                    }}
                    className={`p-2.5 rounded-xl font-bold text-xs text-center border-2 transition-all cursor-pointer ${
                      isCustomCity
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    + Otra Ciudad
                  </button>
                </div>

                {isCustomCity && (
                  <input
                    type="text"
                    required
                    placeholder="Escribe el nombre de la nueva ciudad / poblado..."
                    value={customCity}
                    onChange={e => setCustomCity(e.target.value)}
                    className="w-full p-3 bg-neutral-50 border-2 border-orange-400 rounded-2xl font-bold text-neutral-900 focus:outline-none"
                  />
                )}
              </div>

              {/* Physical Landmark */}
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Referencia Física Exacta (Visual para el Pasajero) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Afuera del estacionamiento de Burger King Minerva"
                  value={formLandmark}
                  onChange={e => setFormLandmark(e.target.value)}
                  className="w-full p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Physical Address */}
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Dirección Física Completa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Av. Vallarta #2840 esq. Av. López Mateos, Guadalajara, Jal."
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  className="w-full p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Google Maps URL */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border-2 border-emerald-200 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider">
                      Enlace de Google Maps (URL / Compartir)
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormMapsUrl('https://maps.app.goo.gl/Ji9UMZtn3uwVphgu8')}
                      className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all border border-emerald-300"
                    >
                      Pegar link de prueba
                    </button>
                  </div>
                  {formMapsUrl && (
                    <a
                      href={formMapsUrl.startsWith('http') ? formMapsUrl : `https://${formMapsUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1 underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Probar en Google Maps
                    </a>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://maps.app.goo.gl/Ji9UMZtn3uwVphgu8"
                    value={formMapsUrl}
                    onChange={e => setFormMapsUrl(e.target.value)}
                    className="w-full p-3.5 bg-white border-2 border-emerald-300 rounded-xl font-mono text-xs md:text-sm font-bold text-neutral-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-emerald-800 leading-tight">
                  💡 Pega el link corto o largo de Google Maps (ej. <strong>https://maps.app.goo.gl/Ji9UMZtn3uwVphgu8</strong>). Al hacer clic desde su celular, el pasajero o conductor abrirá la app nativa de mapas con la ruta exacta.
                </p>
              </div>

              {/* Order and Time Offset */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                    Orden en Ruta
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formOrder}
                    onChange={e => setFormOrder(Number(e.target.value))}
                    className="w-full p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                    Desfase (Minutos)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    step="5"
                    value={formTimeOffset}
                    onChange={e => setFormTimeOffset(Number(e.target.value))}
                    className="w-full p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Boarding Point Custom Price */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                <label className="block text-xs font-black text-amber-900 uppercase tracking-wider mb-1">
                  Tarifa / Precio Específico de este Punto ($ MXN)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Dejar vacío para usar la tarifa base de la ruta"
                    value={formFarePrice}
                    onChange={e => setFormFarePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-3 bg-white border-2 border-neutral-200 rounded-2xl font-black text-neutral-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-[11px] text-amber-800 mt-1 font-medium">
                  Si defines un precio aquí, se cobrará esta cantidad exacta cuando el pasajero elija abordar en este punto (ej. $450 CAS, $500 Zoológico, $370 Manzanillo, etc.).
                </p>
              </div>

              {/* Checkboxes: Active & Special Point */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl border-2 border-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={e => setFormIsActive(e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded-lg cursor-pointer accent-orange-600"
                  />
                  <div>
                    <span className="font-black text-neutral-900 text-xs">Punto Activo</span>
                    <p className="text-[10px] text-neutral-500">Visible para compra y abordaje</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl border-2 border-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsSpecial}
                    onChange={e => setFormIsSpecial(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded-lg cursor-pointer accent-purple-600"
                  />
                  <div>
                    <span className="font-black text-neutral-900 text-xs">Punto Especial</span>
                    <p className="text-[10px] text-neutral-500">CAS / Zoológico / Turístico</p>
                  </div>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Instrucciones o Notas para el Pasajero
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Presentarse con 15 minutos de anticipación en el área de estacionamiento."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-medium text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl font-black text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white rounded-2xl font-black shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingStop ? 'Guardar Cambios' : 'Registrar Ubicación'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 text-center border-2 border-neutral-200 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-neutral-900">¿Eliminar esta ubicación?</h4>
              <p className="text-xs text-neutral-500 mt-1">
                La ubicación se retirará de las opciones de abordaje. Puedes desactivarla si solo deseas pausarla temporalmente.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl font-black text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteRouteStop(deletingId);
                  setDeletingId(null);
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs shadow-md transition-colors cursor-pointer"
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
