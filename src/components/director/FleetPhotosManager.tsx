import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bus, 
  Car, 
  Camera, 
  Check, 
  ExternalLink, 
  Image as ImageIcon, 
  Sparkles, 
  X, 
  RotateCcw,
  Users,
  Tag
} from 'lucide-react';
import { Vehicle, RentalCar } from '../../types';

// Oficial Supabase storage vehicle photos uploaded by user
export const OFFICIAL_VEHICLE_PHOTOS = [
  {
    title: 'Toyota Avanza (7 Pasajeros)',
    category: 'Familiar',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/avanzatoyota.png',
  },
  {
    title: 'Ford Transit Tourneo (18 Pasajeros)',
    category: 'Van Pasajeros',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/fordtransitde18pasajeros.png',
  },
  {
    title: 'Mitsubishi L200 Pick-up 4x4',
    category: 'Pick-up Trabajo',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/l200mitsubishi.png',
  },
  {
    title: 'Mercedes-Benz Sprinter (20/21 Pasajeros)',
    category: 'Van Ejecutiva',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/sprinterde21pasajeros.png',
  },
  {
    title: 'Volkswagen Teramont (7 Pasajeros)',
    category: 'SUV Gran Lujo',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/teramon.png',
  },
  {
    title: 'Volkswagen Tiguan (7 Pasajeros)',
    category: 'SUV Familiar',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/tiguan.png',
  },
  {
    title: 'Toyota Hiace VIP (11/12 Pasajeros)',
    category: 'Turismo VIP',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede12pasajeros.png',
  },
  {
    title: 'Toyota Hiace Gran Confort (14/15 Pasajeros)',
    category: 'Van Pasajeros',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png',
  },
  {
    title: 'Volkswagen Vento (5 Pasajeros)',
    category: 'Sedán Económico',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/vento.png',
  }
];

export const FleetPhotosManager: React.FC = () => {
  const { vehicles, rentalCars, updateVehicleImage, updateRentalCarImage } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'fleet' | 'rental'>('fleet');

  // Modal editing state
  const [editingTarget, setEditingTarget] = useState<{
    type: 'vehicle' | 'rental';
    id: string;
    name: string;
    currentImage: string;
  } | null>(null);

  const [inputUrl, setInputUrl] = useState<string>('');
  const [previewError, setPreviewError] = useState<boolean>(false);

  const handleOpenEditVehicle = (vehicle: Vehicle) => {
    setEditingTarget({
      type: 'vehicle',
      id: vehicle.id,
      name: `${vehicle.unitNumber} - ${vehicle.model}`,
      currentImage: vehicle.image || ''
    });
    setInputUrl(vehicle.image || '');
    setPreviewError(false);
  };

  const handleOpenEditRentalCar = (car: RentalCar) => {
    setEditingTarget({
      type: 'rental',
      id: car.id,
      name: `${car.brand} ${car.name} (${car.category})`,
      currentImage: car.image || ''
    });
    setInputUrl(car.image || '');
    setPreviewError(false);
  };

  const handleSaveImage = () => {
    if (!editingTarget) return;
    const finalUrl = inputUrl.trim();
    if (!finalUrl) return;

    if (editingTarget.type === 'vehicle') {
      updateVehicleImage(editingTarget.id, finalUrl);
    } else {
      updateRentalCarImage(editingTarget.id, finalUrl);
    }

    setEditingTarget(null);
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Camera className="w-3.5 h-3.5" /> Administrador de Galería de Flotilla
          </div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900">
            Control y Actualización de Fotos de Unidades
          </h2>
          <p className="text-xs md:text-sm text-neutral-600 mt-1 max-w-2xl">
            Personaliza las imágenes de los autobuses, camionetas y autos en tiempo real. Los cambios se reflejan inmediatamente en el catálogo de rentas, portal de choferes, despacho y venta de pasajes.
          </p>
        </div>

        {/* Segmented Filter */}
        <div className="flex bg-neutral-100 p-1.5 rounded-2xl border border-neutral-300 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('fleet')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              activeSubTab === 'fleet'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-neutral-700 hover:text-black hover:bg-neutral-200'
            }`}
          >
            <Bus className="w-4 h-4" /> Flota de Ruta ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveSubTab('rental')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              activeSubTab === 'rental'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-neutral-700 hover:text-black hover:bg-neutral-200'
            }`}
          >
            <Car className="w-4 h-4" /> Catálogo de Renta ({rentalCars.length})
          </button>
        </div>
      </div>

      {/* Subtab 1: Flota Operativa de Ruta */}
      {activeSubTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((veh) => {
            const hasCustomImage = !!veh.image;
            return (
              <div 
                key={veh.id}
                className="bg-white rounded-3xl border-2 border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Vehicle Image */}
                  <div className="relative h-48 w-full bg-neutral-900 overflow-hidden group">
                    {veh.image ? (
                      <img 
                        src={veh.image} 
                        alt={veh.unitNumber}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 bg-neutral-800">
                        <Bus className="w-12 h-12 mb-1 opacity-50" />
                        <span className="text-xs font-bold">Sin foto asignada</span>
                      </div>
                    )}
                    
                    {/* Badge status */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black text-white border border-white/20">
                      {veh.unitNumber}
                    </div>

                    <div className="absolute top-3 right-3 bg-orange-600 text-white px-2.5 py-1 rounded-full text-[11px] font-black shadow-lg">
                      {veh.capacity} Pasajeros
                    </div>
                  </div>

                  {/* Body Specs */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-base font-black text-neutral-900 leading-tight">
                      {veh.model}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-neutral-600 font-mono">
                      <span>Placas: <strong className="text-neutral-900">{veh.plate}</strong></span>
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase ${
                        veh.status === 'in_route' ? 'bg-orange-100 text-orange-800' :
                        veh.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        veh.status === 'reserved_rent' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {veh.status === 'in_route' ? 'En Ruta' :
                         veh.status === 'active' ? 'Disponible' :
                         veh.status === 'reserved_rent' ? 'En Renta' : 'Taller'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 line-clamp-1 font-mono pt-1">
                      Odómetro: {veh.odometer.toLocaleString()} km • Próx. Serv: {veh.nextServiceKm.toLocaleString()} km
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleOpenEditVehicle(veh)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-orange-600 text-white font-black text-xs md:text-sm transition-colors cursor-pointer shadow-sm"
                  >
                    <Camera className="w-4 h-4 text-orange-400 group-hover:text-white" />
                    Cambiar Foto de Unidad
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtab 2: Catálogo de Renta */}
      {activeSubTab === 'rental' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rentalCars.map((car) => (
            <div 
              key={car.id}
              className="bg-white rounded-3xl border-2 border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Car Image */}
                <div className="relative h-48 w-full bg-neutral-900 overflow-hidden group">
                  <img 
                    src={car.image} 
                    alt={car.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black text-white border border-white/20">
                    {car.brand}
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[11px] font-black shadow-lg">
                    {car.capacity} Pasajeros
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-neutral-900 leading-tight">
                      {car.name}
                    </h3>
                    <span className="text-xs bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded-md border border-orange-200">
                      {car.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-600 font-mono pt-1">
                    <span>Sin chofer: <strong className="text-neutral-900">${car.dailyRateWithoutDriver}/día</strong></span>
                    <span>Con chofer: <strong className="text-orange-600">${car.dailyRateWithDriver}/día</strong></span>
                  </div>

                  <div className="text-xs text-neutral-500 line-clamp-1 pt-1">
                    Transmisión: {car.transmission} • {car.fuelType}
                  </div>
                </div>
              </div>

              {/* Footer Action */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleOpenEditRentalCar(car)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-orange-600 text-white font-black text-xs md:text-sm transition-colors cursor-pointer shadow-sm"
                >
                  <Camera className="w-4 h-4 text-orange-400" />
                  Cambiar Foto de Vehículo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-neutral-800 shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">
                    Cambiar Foto de {editingTarget.type === 'vehicle' ? 'Unidad de Flota' : 'Vehículo de Renta'}
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium">
                    {editingTarget.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTarget(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current / Live Preview */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                <span>Vista Previa de la Fotografía</span>
                {inputUrl && (
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
                    <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
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
                Enlace Directo de la Imagen (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    setPreviewError(false);
                  }}
                  placeholder="https://lyjuhvqpvomryytxyztr.supabase.co/.../auto.png"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-neutral-300 text-sm font-mono focus:border-orange-500 focus:outline-none bg-neutral-50"
                />
                {inputUrl && (
                  <button
                    onClick={() => {
                      setInputUrl('');
                      setPreviewError(false);
                    }}
                    className="px-3 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold text-xs"
                    title="Limpiar"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <p className="text-[11px] text-neutral-500">
                Puedes pegar cualquier enlace de Supabase Storage, Imgur, Cloudinary o web.
              </p>
            </div>

            {/* Quick Select from Official Fleet Photos (Supabase links) */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Fotografías Oficiales de la Flotilla (Selección Rápida)
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
                          {photo.category}
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
                onClick={() => setEditingTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 font-bold text-xs md:text-sm text-neutral-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveImage}
                disabled={!inputUrl.trim() || previewError}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black text-xs md:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Guardar Nueva Fotografía
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
