import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RentalCar } from '../../types';
import { 
  Car, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  MessageCircle, 
  FileText, 
  Fuel, 
  Wind, 
  Gauge, 
  Calendar,
  Sparkles,
  Award,
  PhoneCall
} from 'lucide-react';
import { OFFICIAL_WHATSAPP, OFFICIAL_PHONE } from '../../data/mockData';

interface RentalCatalogProps {
  onSelectCarForQuote?: (car: RentalCar) => void;
}

export const RentalCatalog: React.FC<RentalCatalogProps> = ({ onSelectCarForQuote }) => {
  const { rentalCars } = useApp();
  const [filterCategory, setFilterCategory] = useState<'all' | 'sedan_suv' | 'van'>('all');
  const [selectedRentalType, setSelectedRentalType] = useState<'both' | 'sin_chofer' | 'con_chofer'>('both');

  const filteredCars = rentalCars.filter(car => {
    if (filterCategory === 'sedan_suv') {
      return car.category === 'Sedán' || car.category === 'SUV' || car.category === 'Familiar';
    }
    if (filterCategory === 'van') {
      return car.category === 'Camioneta / Van' || car.category === 'Sprinter Ejecutiva';
    }
    return true;
  });

  const getWhatsAppLink = (car: RentalCar) => {
    const text = encodeURIComponent(
      `Hola Gutiérrez Transportes, me interesa cotizar la unidad: *${car.name}* (${car.capacity} pasajeros). ¿Tienen disponibilidad para próximas fechas?`
    );
    return `https://wa.me/52${OFFICIAL_WHATSAPP}?text=${text}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-neutral-100 p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* Hero Header */}
      <div className="bg-neutral-950 text-white rounded-3xl p-6 md:p-8 border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Flota Oficial de Renta • Con y Sin Chofer
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">
            Autos, SUVs y Camionetas de Renta
          </h1>
          <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
            Tarifas oficiales por día sin chofer o con servicio de operador federal certificado.
            Todas nuestras unidades cuentan con seguro de cobertura amplia y mantenimiento riguroso.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-neutral-300 font-medium">
            <span className="flex items-center gap-1.5 text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Seguro Cobertura Amplia
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <Award className="w-4 h-4 text-orange-400" /> Operadores Calificados
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <PhoneCall className="w-4 h-4 text-blue-400" /> Tel: {OFFICIAL_PHONE}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Switch bar */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Todas las Unidades ({rentalCars.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('sedan_suv')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              filterCategory === 'sedan_suv'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Autos Sedán y SUV (5)
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('van')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              filterCategory === 'van'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Vans & Camionetas Pasaje (4)
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs font-black">
          <button
            type="button"
            onClick={() => setSelectedRentalType('both')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedRentalType === 'both' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Ver Ambas Tarifas
          </button>
          <button
            type="button"
            onClick={() => setSelectedRentalType('sin_chofer')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedRentalType === 'sin_chofer' ? 'bg-orange-600 text-white shadow-xs' : 'text-neutral-600'
            }`}
          >
            Solo Sin Chofer
          </button>
          <button
            type="button"
            onClick={() => setSelectedRentalType('con_chofer')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedRentalType === 'con_chofer' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600'
            }`}
          >
            Solo Con Chofer
          </button>
        </div>
      </div>

      {/* Van Fleet Information Banner */}
      {filterCategory === 'van' && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
              🚐
            </div>
            <div>
              <h4 className="font-black text-sm text-neutral-900">
                Flotilla Oficial Completa: Las 4 Camionetas de Pasajeros
              </h4>
              <p className="text-xs text-neutral-600 font-medium">
                1. Toyota Hiace (14 Pax) • 2. Toyota Hiace (11 Pax) • 3. Ford Transit (18 Pax) • 4. Mercedes-Benz Sprinter (20 Pax)
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-orange-600 text-white px-3 py-1.5 rounded-full shrink-0 shadow-xs">
            4 de 4 Camionetas Visibles
          </span>
        </div>
      )}

      {/* Rental Cars Grid - 4 Columns when viewing Vans for all-in-one view */}
      <div className={`grid gap-6 ${filterCategory === 'van' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredCars.map((car, idx) => (
          <div 
            key={car.id}
            id={`rental-card-${car.id}`}
            className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Image Header with Badges */}
            <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
              <img 
                src={car.image} 
                alt={car.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="bg-neutral-950/80 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {car.brand}
                </span>
                <span className="bg-orange-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full">
                  {car.category}
                </span>
                {filterCategory === 'van' && (
                  <span className="bg-black/80 text-orange-400 border border-orange-400/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {idx + 1} de 4
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                <div>
                  <h3 className="text-lg font-black leading-tight drop-shadow-sm">{car.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-200 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-orange-400" />
                    <span>Hasta {car.capacity} pasajeros</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              
              {/* Rate Cards */}
              <div className="grid grid-cols-2 gap-2">
                {(selectedRentalType === 'both' || selectedRentalType === 'sin_chofer') && (
                  <div className={`p-3 rounded-2xl border transition-all ${
                    selectedRentalType === 'sin_chofer' 
                      ? 'col-span-2 bg-orange-50 border-orange-200' 
                      : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                      Sin Chofer (Día)
                    </div>
                    <div className="text-xl font-black text-neutral-950 mt-0.5">
                      ${car.dailyRateWithoutDriver.toLocaleString('es-MX')}
                      <span className="text-xs font-normal text-neutral-500"> / 24 hrs</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium mt-0.5">
                      Depósito en garantía
                    </div>
                  </div>
                )}

                {(selectedRentalType === 'both' || selectedRentalType === 'con_chofer') && (
                  <div className={`p-3 rounded-2xl border transition-all ${
                    selectedRentalType === 'con_chofer' 
                      ? 'col-span-2 bg-neutral-900 border-neutral-800 text-white' 
                      : 'bg-neutral-900 border-neutral-800 text-white'
                  }`}>
                    <div className="text-[10px] font-black text-orange-400 uppercase tracking-wider">
                      Con Chofer (Día)
                    </div>
                    <div className="text-xl font-black text-white mt-0.5">
                      ${car.dailyRateWithDriver.toLocaleString('es-MX')}
                      <span className="text-xs font-normal text-neutral-300"> / día</span>
                    </div>
                    <div className="text-[10px] text-neutral-300 font-medium mt-0.5">
                      Operador profesional
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="truncate">{car.transmission}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{car.hasAC ? 'Aire Acondicionado' : 'Sin A/C'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{car.fuelType}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{car.capacity} Plazas</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                  Equipamiento & Confort:
                </div>
                {car.features.slice(0, 3).map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                {onSelectCarForQuote && (
                  <button
                    type="button"
                    onClick={() => onSelectCarForQuote(car)}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Cotizar en Sistema</span>
                  </button>
                )}

                <a
                  href={getWhatsAppLink(car)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-neutral-900 hover:bg-black active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Requirements & Rental Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-neutral-900 text-base">Requisitos: Renta Sin Chofer</h3>
              <p className="text-xs text-neutral-500">Trámite ágil para particulares y empresas</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-neutral-700">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
              <strong>INE / Pasaporte Vigente</strong> del conductor titular.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
              <strong>Licencia de conducir vigente</strong> (mínimo 2 años de experiencia).
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
              <strong>Tarjeta de Crédito</strong> para voucher de garantía (bloqueo temporal).
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
              <strong>Comprobante de domicilio</strong> no mayor a 2 meses.
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-neutral-900 text-base">Beneficios: Renta Con Chofer</h3>
              <p className="text-xs text-neutral-500">Viaje sin preocupaciones con operadores certificados</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-neutral-700">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
              <strong>7 Operadores federales calificados</strong> con exámenes médicos y capacitación continua.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
              <strong>Seguro de viajero de cobertura amplia</strong> en todas las autopistas de México.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
              <strong>Despreocúpate de casetas, combustible y rutas</strong>: Cotizamos todo incluido.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
              <strong>Disponibilidad para eventos</strong>: Citas consulares, bodas, congresos o vacaciones familiares.
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};
