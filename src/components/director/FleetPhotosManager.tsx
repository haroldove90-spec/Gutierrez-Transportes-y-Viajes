import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Car, 
  Camera, 
  Check, 
  Sparkles, 
  X, 
  Trash2,
  Power,
  Plus,
  Edit3,
  Users,
  DollarSign,
  AlertTriangle,
  Fuel,
  Database,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Briefcase
} from 'lucide-react';
import { RentalCar } from '../../types';

// Oficial Supabase storage vehicle photos uploaded by user
export const OFFICIAL_VEHICLE_PHOTOS = [
  {
    title: 'Volkswagen Vento (5 Pasajeros)',
    brand: 'Volkswagen',
    category: 'Sedán',
    capacity: 5,
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/vento.png',
  },
  {
    title: 'Toyota Avanza (7 Pasajeros)',
    brand: 'Toyota',
    category: 'Familiar',
    capacity: 7,
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/avanzatoyota.png',
  },
  {
    title: 'Mitsubishi L200 Pick-up 4x4 (5 Pasajeros)',
    brand: 'Mitsubishi',
    category: 'Pick-up / Trabajo & Aventura',
    capacity: 5,
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/l200mitsubishi.png',
  },
  {
    title: 'Volkswagen Tiguan (7 Pasajeros)',
    brand: 'Volkswagen',
    category: 'SUV',
    capacity: 7,
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/tiguan.png',
  },
  {
    title: 'Volkswagen Teramont (7 Pasajeros)',
    brand: 'Volkswagen',
    category: 'SUV',
    capacity: 7,
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/teramon.png',
  },
  {
    title: 'Toyota Hiace VIP (12 Pasajeros)',
    brand: 'Toyota',
    category: 'Camioneta / Van',
    capacity: 12,
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede12pasajeros.png',
  },
  {
    title: 'Toyota Hiace Gran Confort (14/15 Pasajeros)',
    brand: 'Toyota',
    category: 'Camioneta / Van',
    capacity: 14,
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png',
  },
  {
    title: 'Ford Transit Tourneo (18 Pasajeros)',
    brand: 'Ford',
    category: 'Camioneta / Van',
    capacity: 18,
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/fordtransitde18pasajeros.png',
  },
  {
    title: 'Mercedes-Benz Sprinter (20/21 Pasajeros)',
    brand: 'Mercedes-Benz',
    category: 'Sprinter Ejecutiva',
    capacity: 20,
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/sprinterde21pasajeros.png',
  }
];

export const FleetPhotosManager: React.FC = () => {
  const { 
    rentalCars, 
    updateRentalCarImage, 
    toggleRentalCarAvailability, 
    deleteRentalCar, 
    addRentalCar, 
    updateRentalCar,
    setShowSupabaseModal 
  } = useApp();

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Photo Edit Modal State
  const [editingPhotoCar, setEditingPhotoCar] = useState<RentalCar | null>(null);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [previewError, setPreviewError] = useState<boolean>(false);

  // Details Edit Modal State
  const [editingCar, setEditingCar] = useState<RentalCar | null>(null);

  // Add Car Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newCarForm, setNewCarForm] = useState<Omit<RentalCar, 'id'>>({
    name: '',
    brand: 'Toyota',
    category: 'Camioneta / Van',
    capacity: 14,
    dailyRateWithoutDriver: 1800,
    dailyRateWithDriver: 2800,
    transmission: 'Automática',
    hasAC: true,
    fuelType: 'Gasolina',
    luggageCapacity: '4 maletas grandes',
    image: OFFICIAL_VEHICLE_PHOTOS[6].url,
    available: true,
    features: ['Aire acondicionado', 'Asientos reclinables', 'Audio Bluetooth']
  });

  // Delete Confirmation Modal State
  const [carToDelete, setCarToDelete] = useState<RentalCar | null>(null);

  // Filtered List
  const filteredCars = rentalCars.filter(car => {
    // Search match
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const matchName = car.name.toLowerCase().includes(term);
      const matchBrand = car.brand.toLowerCase().includes(term);
      const matchCat = car.category.toLowerCase().includes(term);
      if (!matchName && !matchBrand && !matchCat) return false;
    }

    // Category match
    if (filterCategory !== 'all') {
      if (filterCategory === 'van' && !(car.category === 'Camioneta / Van' || car.category === 'Sprinter Ejecutiva')) return false;
      if (filterCategory === 'suv' && car.category !== 'SUV') return false;
      if (filterCategory === 'sedan' && car.category !== 'Sedán') return false;
      if (filterCategory === 'familiar' && car.category !== 'Familiar') return false;
      if (filterCategory === 'pickup' && car.category !== 'Pick-up / Trabajo & Aventura') return false;
    }

    // Status match
    if (filterStatus === 'active' && !car.available) return false;
    if (filterStatus === 'inactive' && car.available) return false;

    return true;
  });

  const activeCount = rentalCars.filter(c => c.available).length;
  const inactiveCount = rentalCars.filter(c => !c.available).length;

  // Handlers for Photo Editing
  const handleOpenEditPhoto = (car: RentalCar) => {
    setEditingPhotoCar(car);
    setInputUrl(car.image || '');
    setPreviewError(false);
  };

  const handleSavePhoto = () => {
    if (!editingPhotoCar) return;
    const finalUrl = inputUrl.trim();
    if (!finalUrl) return;
    updateRentalCarImage(editingPhotoCar.id, finalUrl);
    setEditingPhotoCar(null);
  };

  // Handlers for Adding
  const handleSaveNewCar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarForm.name.trim() || !newCarForm.brand.trim()) return;

    addRentalCar(newCarForm);
    setIsAddModalOpen(false);
    // Reset form
    setNewCarForm({
      name: '',
      brand: 'Toyota',
      category: 'Camioneta / Van',
      capacity: 14,
      dailyRateWithoutDriver: 1800,
      dailyRateWithDriver: 2800,
      transmission: 'Automática',
      hasAC: true,
      fuelType: 'Gasolina',
      luggageCapacity: '4 maletas grandes',
      image: OFFICIAL_VEHICLE_PHOTOS[6].url,
      available: true,
      features: ['Aire acondicionado', 'Asientos reclinables', 'Audio Bluetooth']
    });
  };

  // Handlers for Editing Details
  const handleSaveEditCar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;
    updateRentalCar(editingCar.id, editingCar);
    setEditingCar(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!carToDelete) return;
    deleteRentalCar(carToDelete.id);
    setCarToDelete(null);
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
      
      {/* Main Header & Controls */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-black uppercase tracking-wider">
            <Car className="w-3.5 h-3.5" /> Catálogo Exclusivo de Renta de Flotilla
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
            Gestión de Autos y Camionetas de Renta
          </h2>
          <p className="text-xs md:text-sm text-neutral-600 max-w-2xl leading-relaxed">
            Control integral del catálogo de vehículos para renta privada con y sin chofer. Activa, desactiva o elimina unidades, ajusta tarifas y actualiza las fotos oficiales de los vehículos.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowSupabaseModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold text-xs md:text-sm transition-all cursor-pointer shadow-sm"
            title="Ver código SQL para Supabase"
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>SQL Supabase</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs md:text-sm transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Agregar Auto / Van</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por marca, modelo o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs md:text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {/* Status Filter */}
          <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-300 text-xs font-bold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Todos ({rentalCars.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                filterStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Activos ({activeCount})</span>
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                filterStatus === 'inactive'
                  ? 'bg-neutral-600 text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Desactivados ({inactiveCount})</span>
            </button>
          </div>

          {/* Category Dropdown/Selector */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="all">Todas las Categorías</option>
            <option value="van">Vans y Sprinters</option>
            <option value="suv">SUVs Familiares y Gran Lujo</option>
            <option value="sedan">Sedanes</option>
            <option value="familiar">Familiar (Avanza)</option>
            <option value="pickup">Pick-up 4x4 / Trabajo</option>
          </select>
        </div>
      </div>

      {/* Grid of Rental Cars */}
      {filteredCars.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-neutral-300 space-y-4">
          <Car className="w-16 h-16 text-neutral-300 mx-auto" />
          <div>
            <h3 className="text-lg font-black text-neutral-800">No se encontraron vehículos</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              No hay ningún auto o van que coincida con los filtros seleccionados.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterStatus('all');
            }}
            className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => {
            const isAvailable = car.available;

            return (
              <div 
                key={car.id}
                className={`bg-white rounded-3xl border-2 transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                  isAvailable 
                    ? 'border-neutral-200 hover:border-neutral-300' 
                    : 'border-neutral-300 bg-neutral-50/70 opacity-90'
                }`}
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="relative h-52 w-full bg-neutral-950 overflow-hidden group">
                    <img 
                      src={car.image} 
                      alt={car.name}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        !isAvailable ? 'grayscale-[50%] opacity-80' : ''
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80';
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                      <span className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black text-white border border-white/20">
                        {car.brand}
                      </span>
                      <span className="bg-orange-600 text-white px-2.5 py-1 rounded-full text-[11px] font-black shadow-sm">
                        {car.category}
                      </span>
                    </div>

                    {/* Passenger Capacity Badge */}
                    <div className="absolute top-3 right-3 bg-neutral-900/90 text-white border border-white/20 px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 shadow-md">
                      <Users className="w-3 h-3 text-orange-400" />
                      <span>{car.capacity} Pax</span>
                    </div>

                    {/* Bottom Floating Status Tag inside image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 shadow-lg ${
                        isAvailable 
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40' 
                          : 'bg-neutral-800 text-neutral-300 ring-2 ring-neutral-600/40'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-neutral-500'}`}></span>
                        {isAvailable ? 'DISPONIBLE PARA RENTA' : 'DESACTIVADO / INACTIVO'}
                      </span>

                      {/* Photo change overlay icon */}
                      <button
                        onClick={() => handleOpenEditPhoto(car)}
                        className="p-2 rounded-full bg-black/70 hover:bg-orange-600 text-white backdrop-blur-md transition-all cursor-pointer border border-white/20"
                        title="Cambiar Foto"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    {/* Title */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-black text-neutral-900 leading-snug">
                          {car.name}
                        </h3>
                        <p className="text-xs text-neutral-500 font-medium">
                          {car.brand} • {car.category}
                        </p>
                      </div>
                    </div>

                    {/* Daily Rates Box */}
                    <div className="grid grid-cols-2 gap-2 bg-neutral-50 rounded-2xl p-3 border border-neutral-200">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          Sin Chofer
                        </p>
                        <p className="text-sm font-black text-neutral-900">
                          ${car.dailyRateWithoutDriver.toLocaleString()} <span className="text-[10px] font-normal text-neutral-500">MXN/día</span>
                        </p>
                      </div>
                      <div className="border-l border-neutral-200 pl-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                          Con Chofer
                        </p>
                        <p className="text-sm font-black text-orange-600">
                          ${car.dailyRateWithDriver.toLocaleString()} <span className="text-[10px] font-normal text-orange-700">MXN/día</span>
                        </p>
                      </div>
                    </div>

                    {/* Vehicle Specs */}
                    <div className="space-y-1.5 text-xs text-neutral-600 font-medium">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Transmisión:</span>
                        <span className="font-bold text-neutral-900">{car.transmission}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Combustible:</span>
                        <span className="font-bold text-neutral-900">{car.fuelType}</span>
                      </div>
                      {car.luggageCapacity && (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Cajuela/Equipaje:</span>
                          <span className="font-bold text-neutral-900 text-right truncate max-w-[170px]">{car.luggageCapacity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Toggle Active/Inactive Button */}
                    <button
                      onClick={() => toggleRentalCarAvailability(car.id)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer border ${
                        isAvailable
                          ? 'bg-neutral-100 hover:bg-amber-50 text-neutral-800 hover:text-amber-800 border-neutral-300 hover:border-amber-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm'
                      }`}
                      title={isAvailable ? 'Desactivar de renta' : 'Activar para renta'}
                    >
                      <Power className={`w-3.5 h-3.5 ${isAvailable ? 'text-neutral-500' : 'text-white'}`} />
                      <span>{isAvailable ? 'Desactivar' : 'Activar Auto'}</span>
                    </button>

                    {/* Edit Details Button */}
                    <button
                      onClick={() => setEditingCar({ ...car })}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs border border-neutral-300 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Editar Tarifas</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Change Photo Button */}
                    <button
                      onClick={() => handleOpenEditPhoto(car)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-orange-600 text-white font-black text-xs transition-all cursor-pointer shadow-sm"
                    >
                      <Camera className="w-3.5 h-3.5 text-orange-400" />
                      <span>Cambiar Foto</span>
                    </button>

                    {/* Delete Car Button */}
                    <button
                      onClick={() => setCarToDelete(car)}
                      className="p-2.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 transition-all cursor-pointer"
                      title={`Eliminar permanentemente ${car.name}`}
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

      {/* ========================================================================= */}
      {/* MODAL 1: CAMBIAR FOTO DE VEHÍCULO */}
      {/* ========================================================================= */}
      {editingPhotoCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-neutral-800 shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">
                    Cambiar Fotografía de Vehículo
                  </h3>
                  <p className="text-xs text-neutral-500 font-bold">
                    {editingPhotoCar.brand} {editingPhotoCar.name} ({editingPhotoCar.category})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPhotoCar(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Preview */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                <span>Vista Previa de la Fotografía</span>
                {inputUrl && !previewError && (
                  <span className="text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Enlace válido
                  </span>
                )}
              </label>

              <div className="relative h-56 w-full rounded-2xl bg-neutral-900 overflow-hidden border-2 border-neutral-300 flex items-center justify-center">
                {inputUrl && !previewError ? (
                  <img
                    src={inputUrl}
                    alt="Previsualización"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <div className="text-center p-6 text-neutral-400">
                    <Car className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-bold">
                      {previewError ? 'Error al cargar imagen. Verifica la URL.' : 'Ingresa una URL o selecciona una foto abajo'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-700">
                Enlace Directo de la Fotografía (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    setPreviewError(false);
                  }}
                  placeholder="https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/..."
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-neutral-300 text-xs md:text-sm font-mono focus:border-orange-500 focus:outline-none bg-neutral-50"
                />
                {inputUrl && (
                  <button
                    onClick={() => {
                      setInputUrl('');
                      setPreviewError(false);
                    }}
                    className="px-3 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold text-xs"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Quick Pick from Official Photos */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Fotografías Oficiales de Flotilla Supabase
              </label>
              
              <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1 bg-neutral-50 rounded-2xl border border-neutral-200">
                {OFFICIAL_VEHICLE_PHOTOS.map((photo, idx) => {
                  const isSelected = inputUrl === photo.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputUrl(photo.url);
                        setPreviewError(false);
                      }}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/40'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <div className="h-14 w-full rounded-lg bg-neutral-900 overflow-hidden relative">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-orange-600/50 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-neutral-900 line-clamp-1 leading-tight">
                          {photo.title}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          {photo.category} • {photo.capacity} Pax
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingPhotoCar(null)}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 font-bold text-xs md:text-sm text-neutral-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={!inputUrl.trim() || previewError}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black text-xs md:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Guardar Fotografía
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: AGREGAR NUEVO AUTO O VAN AL CATÁLOGO */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-neutral-800 shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Plus className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">
                    Agregar Auto o Van al Catálogo
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium">
                    Ingresa los datos del vehículo para incorporarlo inmediatamente a la flota de renta.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Marca del Vehículo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Toyota, Mercedes-Benz, Ford, etc."
                    value={newCarForm.brand}
                    onChange={(e) => setNewCarForm({ ...newCarForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm font-bold focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Modelo / Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Hiace Gran Confort, Sprinter VIP, etc."
                    value={newCarForm.name}
                    onChange={(e) => setNewCarForm({ ...newCarForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm font-bold focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Categoría *
                  </label>
                  <select
                    value={newCarForm.category}
                    onChange={(e) => setNewCarForm({ ...newCarForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm font-bold focus:border-orange-500 focus:outline-none bg-white"
                  >
                    <option value="Camioneta / Van">Camioneta / Van (11-18 Pax)</option>
                    <option value="Sprinter Ejecutiva">Sprinter Ejecutiva (20-21 Pax)</option>
                    <option value="SUV">SUV (7 Pasajeros)</option>
                    <option value="Familiar">Familiar (Avanza 7 Pax)</option>
                    <option value="Sedán">Sedán (5 Pasajeros)</option>
                    <option value="Pick-up / Trabajo & Aventura">Pick-up / Trabajo & Aventura 4x4</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Capacidad de Pasajeros *
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    required
                    value={newCarForm.capacity}
                    onChange={(e) => setNewCarForm({ ...newCarForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm font-bold focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-2xl border border-orange-200">
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Tarifa Sin Chofer (MXN/día) *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      step="50"
                      required
                      value={newCarForm.dailyRateWithoutDriver}
                      onChange={(e) => setNewCarForm({ ...newCarForm, dailyRateWithoutDriver: Number(e.target.value) })}
                      className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl text-sm font-black focus:border-orange-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-orange-800 block mb-1">
                    Tarifa Con Chofer (MXN/día) *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-orange-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      step="50"
                      required
                      value={newCarForm.dailyRateWithDriver}
                      onChange={(e) => setNewCarForm({ ...newCarForm, dailyRateWithDriver: Number(e.target.value) })}
                      className="w-full pl-9 pr-3 py-2 border border-orange-300 rounded-xl text-sm font-black text-orange-700 focus:border-orange-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Transmisión
                  </label>
                  <input
                    type="text"
                    value={newCarForm.transmission}
                    onChange={(e) => setNewCarForm({ ...newCarForm, transmission: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Combustible
                  </label>
                  <input
                    type="text"
                    value={newCarForm.fuelType}
                    onChange={(e) => setNewCarForm({ ...newCarForm, fuelType: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Capacidad Equipaje
                  </label>
                  <input
                    type="text"
                    value={newCarForm.luggageCapacity}
                    onChange={(e) => setNewCarForm({ ...newCarForm, luggageCapacity: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Photo selection for new car */}
              <div>
                <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                  Fotografía de la Unidad (URL)
                </label>
                <input
                  type="url"
                  value={newCarForm.image}
                  onChange={(e) => setNewCarForm({ ...newCarForm, image: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-mono mb-2"
                />

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {OFFICIAL_VEHICLE_PHOTOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewCarForm({ ...newCarForm, image: p.url })}
                      className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        newCarForm.image === p.url ? 'border-orange-600 ring-2 ring-orange-500/40' : 'border-neutral-200'
                      }`}
                      title={p.title}
                    >
                      <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 font-bold text-xs text-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs md:text-sm shadow-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Guardar y Publicar Auto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDITAR DETALLES Y TARIFAS */}
      {/* ========================================================================= */}
      {editingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-neutral-800 shadow-2xl max-w-xl w-full p-6 md:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">
                    Editar Datos y Tarifas
                  </h3>
                  <p className="text-xs text-neutral-500 font-bold">
                    {editingCar.brand} {editingCar.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCar(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCar} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={editingCar.brand}
                    onChange={(e) => setEditingCar({ ...editingCar, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Nombre / Modelo
                  </label>
                  <input
                    type="text"
                    value={editingCar.name}
                    onChange={(e) => setEditingCar({ ...editingCar, name: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Capacidad (Pasajeros)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingCar.capacity}
                    onChange={(e) => setEditingCar({ ...editingCar, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Disponibilidad
                  </label>
                  <select
                    value={editingCar.available ? 'yes' : 'no'}
                    onChange={(e) => setEditingCar({ ...editingCar, available: e.target.value === 'yes' })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm font-bold bg-white"
                  >
                    <option value="yes">Disponible para Renta</option>
                    <option value="no">Desactivado / Taller</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-orange-50/60 p-4 rounded-2xl border border-orange-200">
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">
                    Tarifa Sin Chofer (MXN/día)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editingCar.dailyRateWithoutDriver}
                    onChange={(e) => setEditingCar({ ...editingCar, dailyRateWithoutDriver: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm font-black bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-orange-800 block mb-1">
                    Tarifa Con Chofer (MXN/día)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editingCar.dailyRateWithDriver}
                    onChange={(e) => setEditingCar({ ...editingCar, dailyRateWithDriver: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-orange-300 rounded-xl text-sm font-black text-orange-700 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingCar(null)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 font-bold text-xs text-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-orange-600 text-white font-black text-xs md:text-sm shadow-md transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRMACIÓN DE ELIMINACIÓN PERMANENTE */}
      {/* ========================================================================= */}
      {carToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-red-500 shadow-2xl max-w-md w-full p-6 md:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-neutral-900">
                ¿Eliminar {carToDelete.brand} {carToDelete.name}?
              </h3>
              <p className="text-xs text-neutral-600">
                Esta acción eliminará de forma permanente el vehículo del catálogo de rentas, tanto en este dispositivo como en la base de datos de Supabase.
              </p>
            </div>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
              <p className="text-xs font-black text-red-800">
                {carToDelete.brand} {carToDelete.name} ({carToDelete.category})
              </p>
              <p className="text-[11px] text-red-600 font-medium mt-0.5">
                Capacidad: {carToDelete.capacity} Pasajeros
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCarToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-neutral-300 font-bold text-xs text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
