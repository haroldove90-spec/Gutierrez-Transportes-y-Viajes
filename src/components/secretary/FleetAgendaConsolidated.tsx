import React, { useState, useMemo } from 'react';
import { Vehicle, TripSchedule, CharterAssignment, Driver, RentalCar } from '../../types';
import { 
  Calendar, 
  Bus, 
  Palmtree, 
  Car, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  User, 
  Phone, 
  ShieldCheck, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  AlertCircle,
  Filter,
  ArrowRight
} from 'lucide-react';

interface FleetAgendaConsolidatedProps {
  vehicles: Vehicle[];
  trips: TripSchedule[];
  charterAssignments: CharterAssignment[];
  drivers: Driver[];
  rentalCars: RentalCar[];
  onSelectForQuote?: (vehicle: Vehicle) => void;
}

export type FleetServiceType = 'all' | 'in_route' | 'tour_contract' | 'rented_no_driver' | 'available' | 'maintenance';

export const FleetAgendaConsolidated: React.FC<FleetAgendaConsolidatedProps> = ({
  vehicles,
  trips,
  charterAssignments,
  drivers,
  rentalCars,
  onSelectForQuote
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [activeFilter, setActiveFilter] = useState<FleetServiceType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(todayStr);
  };

  // Compute status of each vehicle for the selectedDate
  const evaluatedVehicles = useMemo(() => {
    return vehicles.map(v => {
      // 1. Maintenance check
      if (v.status === 'maintenance') {
        return {
          vehicle: v,
          serviceType: 'maintenance' as const,
          label: 'En Taller / Mantenimiento',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
          activeTrip: undefined,
          activeCharter: undefined,
          assignedDriver: drivers.find(d => d.id === v.driverId),
          description: 'Mantenimiento mecánico preventivo o correctivo.'
        };
      }

      // 2. Scheduled Route Trip check for this date
      const routeTrip = trips.find(t => 
        t.vehicleId === v.id && 
        t.date === selectedDate && 
        t.status !== 'cancelled' && 
        t.status !== 'completed'
      );

      if (routeTrip) {
        const assignedDriver = drivers.find(d => d.id === routeTrip.driverId) || drivers.find(d => d.id === v.driverId);
        const soldSeatsCount = routeTrip.seats.filter(s => s.status === 'sold' || s.status === 'locked').length;
        return {
          vehicle: v,
          serviceType: 'in_route' as const,
          label: 'En Ruta Programada',
          badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
          activeTrip: routeTrip,
          activeCharter: undefined,
          assignedDriver,
          description: `Corrida regular: ${routeTrip.origin} ➔ ${routeTrip.destination} (${routeTrip.departureTime}) • ${soldSeatsCount}/${v.capacity} pax.`
        };
      }

      // 3. Tourist Charter / Viaje Turístico check for this date
      const charter = charterAssignments.find(c => 
        c.vehicleId === v.id && 
        (c.status === 'active' || c.status === 'upcoming') &&
        c.startDate <= selectedDate && 
        c.endDate >= selectedDate
      );

      if (charter || v.status === 'tour_contract' || v.tourContractDetails) {
        const tourData = charter || v.tourContractDetails;
        const assignedDriver = charter 
          ? drivers.find(d => d.id === charter.driverId) 
          : drivers.find(d => d.id === v.driverId);

        return {
          vehicle: v,
          serviceType: 'tour_contract' as const,
          label: 'En Viaje Turístico',
          badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
          activeTrip: undefined,
          activeCharter: charter,
          assignedDriver,
          description: `Tour especial: ${tourData?.destination || 'Servicio Turístico'} • Cliente: ${tourData?.clientName || 'Particular'}.`
        };
      }

      // 4. Renta sin Chofer check
      const rentalCar = rentalCars.find(r => 
        (r.vehicleId === v.id || r.unitNumber === v.unitNumber) && 
        (r.available === false || v.status === 'reserved_rent')
      );

      if (rentalCar || v.status === 'reserved_rent') {
        return {
          vehicle: v,
          serviceType: 'rented_no_driver' as const,
          label: 'Rentada Sin Chofer',
          badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
          activeTrip: undefined,
          activeCharter: undefined,
          assignedDriver: undefined,
          description: 'Vehículo arrendado a particular sin conductor federal.'
        };
      }

      // 5. Disponible en Patio
      return {
        vehicle: v,
        serviceType: 'available' as const,
        label: 'Disponible en Patio',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        activeTrip: undefined,
        activeCharter: undefined,
        assignedDriver: drivers.find(d => d.id === v.driverId),
        description: 'Unidad libre en patio, disponible para corridas o cotizaciones.'
      };
    });
  }, [vehicles, trips, charterAssignments, drivers, rentalCars, selectedDate]);

  // Counts by category
  const stats = useMemo(() => {
    return {
      total: evaluatedVehicles.length,
      inRoute: evaluatedVehicles.filter(item => item.serviceType === 'in_route').length,
      tourContract: evaluatedVehicles.filter(item => item.serviceType === 'tour_contract').length,
      rentedNoDriver: evaluatedVehicles.filter(item => item.serviceType === 'rented_no_driver').length,
      available: evaluatedVehicles.filter(item => item.serviceType === 'available').length,
      maintenance: evaluatedVehicles.filter(item => item.serviceType === 'maintenance').length
    };
  }, [evaluatedVehicles]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return evaluatedVehicles.filter(item => {
      const matchesFilter = activeFilter === 'all' ? true : item.serviceType === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ? true : (
        item.vehicle.unitNumber.toLowerCase().includes(q) ||
        item.vehicle.model.toLowerCase().includes(q) ||
        item.vehicle.plate.toLowerCase().includes(q) ||
        (item.assignedDriver?.name.toLowerCase().includes(q) ?? false) ||
        (item.activeTrip?.destination.toLowerCase().includes(q) ?? false) ||
        (item.activeCharter?.destination.toLowerCase().includes(q) ?? false)
      );
      return matchesFilter && matchesSearch;
    });
  }, [evaluatedVehicles, activeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header and Date Navigation Toolbar */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-neutral-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-600 animate-pulse"></span>
              <h3 className="text-lg md:text-xl font-black text-neutral-900 uppercase tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Agenda Consolidada de Unidades y Disponibilidad
              </h3>
            </div>
            <p className="text-xs md:text-sm text-neutral-500 font-medium mt-1">
              Supervisión unificada en tiempo real: Unidades en ruta, en viaje turístico, rentadas sin chofer y disponibles en patio.
            </p>
          </div>

          {/* Date Picker Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200 self-start lg:self-auto">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 shadow-xs border border-neutral-200 transition-colors cursor-pointer"
              title="Día Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="p-2 bg-white rounded-xl font-black text-xs md:text-sm text-neutral-900 border border-neutral-200 shadow-xs cursor-pointer focus:outline-hidden focus:border-orange-500"
            />

            <button
              type="button"
              onClick={handleNextDay}
              className="p-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 shadow-xs border border-neutral-200 transition-colors cursor-pointer"
              title="Día Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToday}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer shadow-xs border ${
                selectedDate === todayStr 
                  ? 'bg-orange-600 text-white border-orange-700' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
              }`}
            >
              Hoy
            </button>
          </div>
        </div>

        {/* 5 Service Classification KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* 1. En Ruta Programada */}
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'in_route' ? 'all' : 'in_route')}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              activeFilter === 'in_route' 
                ? 'bg-orange-500 text-white border-orange-600 shadow-md ring-2 ring-orange-300' 
                : 'bg-orange-50/70 hover:bg-orange-100/70 border-orange-200 text-orange-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <Bus className="w-4 h-4" />
              <span className="text-xl font-black">{stats.inRoute}</span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider mt-1">En Ruta Programada</p>
            <p className={`text-[10px] font-medium mt-0.5 ${activeFilter === 'in_route' ? 'text-orange-100' : 'text-orange-700'}`}>
              Corridas fijas con pasaje
            </p>
          </button>

          {/* 2. En Viaje Turístico */}
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'tour_contract' ? 'all' : 'tour_contract')}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              activeFilter === 'tour_contract' 
                ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300' 
                : 'bg-purple-50/70 hover:bg-purple-100/70 border-purple-200 text-purple-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <Palmtree className="w-4 h-4" />
              <span className="text-xl font-black">{stats.tourContract}</span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider mt-1">Viaje Turístico / Tour</p>
            <p className={`text-[10px] font-medium mt-0.5 ${activeFilter === 'tour_contract' ? 'text-purple-100' : 'text-purple-700'}`}>
              Charters especiales contratados
            </p>
          </button>

          {/* 3. Rentada Sin Chofer */}
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'rented_no_driver' ? 'all' : 'rented_no_driver')}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              activeFilter === 'rented_no_driver' 
                ? 'bg-sky-600 text-white border-sky-700 shadow-md ring-2 ring-sky-300' 
                : 'bg-sky-50/70 hover:bg-sky-100/70 border-sky-200 text-sky-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <Car className="w-4 h-4" />
              <span className="text-xl font-black">{stats.rentedNoDriver}</span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider mt-1">Rentada Sin Chofer</p>
            <p className={`text-[10px] font-medium mt-0.5 ${activeFilter === 'rented_no_driver' ? 'text-sky-100' : 'text-sky-700'}`}>
              Arrendamiento a particulares
            </p>
          </button>

          {/* 4. Disponible en Patio */}
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'available' ? 'all' : 'available')}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              activeFilter === 'available' 
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300' 
                : 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xl font-black">{stats.available}</span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider mt-1">Disponible en Patio</p>
            <p className={`text-[10px] font-medium mt-0.5 ${activeFilter === 'available' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              Listas para cotizar o asignar
            </p>
          </button>

          {/* 5. En Taller / Mantenimiento */}
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'maintenance' ? 'all' : 'maintenance')}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              activeFilter === 'maintenance' 
                ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300' 
                : 'bg-rose-50/70 hover:bg-rose-100/70 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <Wrench className="w-4 h-4" />
              <span className="text-xl font-black">{stats.maintenance}</span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider mt-1">En Taller Mecánico</p>
            <p className={`text-[10px] font-medium mt-0.5 ${activeFilter === 'maintenance' ? 'text-rose-100' : 'text-rose-700'}`}>
              Fuera de servicio temporal
            </p>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-black text-neutral-400 uppercase flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filtrar:
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors shrink-0 ${
                activeFilter === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Todas ({stats.total})
            </button>
            <button
              onClick={() => setActiveFilter('in_route')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors shrink-0 ${
                activeFilter === 'in_route' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-900 hover:bg-orange-200'
              }`}
            >
              Ruta ({stats.inRoute})
            </button>
            <button
              onClick={() => setActiveFilter('tour_contract')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors shrink-0 ${
                activeFilter === 'tour_contract' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
              }`}
            >
              Tours ({stats.tourContract})
            </button>
            <button
              onClick={() => setActiveFilter('rented_no_driver')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors shrink-0 ${
                activeFilter === 'rented_no_driver' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-900 hover:bg-sky-200'
              }`}
            >
              Rentadas ({stats.rentedNoDriver})
            </button>
            <button
              onClick={() => setActiveFilter('available')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors shrink-0 ${
                activeFilter === 'available' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
              }`}
            >
              Libres ({stats.available})
            </button>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar unidad, chofer, placa..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold focus:outline-hidden focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Grid of Vehicle Availability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map(({ vehicle, serviceType, label, badgeColor, activeTrip, activeCharter, assignedDriver, description }) => {
          const isBusy = serviceType === 'in_route' || serviceType === 'tour_contract' || serviceType === 'rented_no_driver';

          return (
            <div
              key={vehicle.id}
              className={`rounded-3xl p-5 border-2 transition-all shadow-xs flex flex-col justify-between ${
                serviceType === 'in_route' ? 'bg-white border-orange-200 ring-1 ring-orange-200/50' :
                serviceType === 'tour_contract' ? 'bg-white border-purple-200 ring-1 ring-purple-200/50' :
                serviceType === 'rented_no_driver' ? 'bg-white border-sky-200 ring-1 ring-sky-200/50' :
                serviceType === 'maintenance' ? 'bg-rose-50/50 border-rose-200' :
                'bg-white border-emerald-200 hover:border-emerald-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Unit, model & Status badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-neutral-900">{vehicle.unitNumber}</span>
                      <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {vehicle.plate}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-neutral-700 mt-0.5">
                      {vehicle.model}
                    </p>
                  </div>

                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${badgeColor}`}>
                    {label}
                  </span>
                </div>

                {/* Specs Pill: Capacity & Odometer */}
                <div className="flex items-center gap-2 text-xs bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-neutral-600">
                  <span className="flex items-center gap-1 font-bold text-neutral-800">
                    <Users className="w-3.5 h-3.5 text-neutral-500" />
                    Capacidad: <strong>{vehicle.capacity} Pasajeros</strong>
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-[11px] font-medium text-neutral-500 truncate">
                    {vehicle.odometer ? `${vehicle.odometer.toLocaleString()} km` : 'Km 0'}
                  </span>
                </div>

                {/* Specific Service Information */}
                {serviceType === 'in_route' && activeTrip && (
                  <div className="p-3 bg-orange-50/80 rounded-2xl border border-orange-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-orange-950 flex items-center gap-1">
                        <Bus className="w-3.5 h-3.5 text-orange-600" /> Corrida Regular
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-200 text-orange-900">
                        {activeTrip.departureTime}
                      </span>
                    </div>
                    <p className="font-black text-neutral-900 text-sm">
                      {activeTrip.origin} ➔ {activeTrip.destination}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-neutral-600 pt-1 border-t border-orange-200/60">
                      <span>Chofer: <strong>{assignedDriver?.name || 'Asignado'}</strong></span>
                      <span className="font-bold text-orange-800">
                        {activeTrip.seats.filter(s => s.status === 'sold' || s.status === 'locked').length} Pasajeros
                      </span>
                    </div>
                  </div>
                )}

                {serviceType === 'tour_contract' && (
                  <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-purple-950 flex items-center gap-1">
                        <Palmtree className="w-3.5 h-3.5 text-purple-600" /> Viaje Turístico Especial
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                        Charter
                      </span>
                    </div>
                    <p className="font-black text-neutral-900 text-sm">
                      {activeCharter?.destination || vehicle.tourContractDetails?.destination || 'Servicio Turístico'}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-neutral-600 pt-1 border-t border-purple-200/60">
                      <span>Cliente: <strong>{activeCharter?.clientName || vehicle.tourContractDetails?.clientName || 'Particular'}</strong></span>
                      <span>Chofer: <strong>{assignedDriver?.name || 'Asignado'}</strong></span>
                    </div>
                  </div>
                )}

                {serviceType === 'rented_no_driver' && (
                  <div className="p-3 bg-sky-50/80 rounded-2xl border border-sky-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sky-950 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-sky-600" /> Renta Sin Chofer
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-200 text-sky-900">
                        Particular
                      </span>
                    </div>
                    <p className="text-neutral-700 text-xs font-medium">
                      Unidad entregada a cliente particular para autoconducción. Sin asignación de chofer federal.
                    </p>
                  </div>
                )}

                {serviceType === 'available' && (
                  <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Lista en patio para el {selectedDate}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Sin conflictos de horario ni contratos concurrentes. Puede asignarse a una nueva salida o cotización de renta.
                    </p>
                  </div>
                )}

                {serviceType === 'maintenance' && (
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-900 font-bold">
                      <Wrench className="w-4 h-4 text-rose-600" />
                      <span>En revisión técnica o taller</span>
                    </div>
                    <p className="text-[11px] text-rose-700">
                      Bloqueada por seguridad. No disponible para programación de salidas.
                    </p>
                  </div>
                )}
              </div>

              {/* Anti-collision Lock Badge & Actions Footer */}
              <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                {isBusy ? (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-500" title="Protección de sistema activa: Esta unidad está bloqueada para evitar dobleteo de reservaciones">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Bloqueada contra dobleteo</span>
                  </div>
                ) : serviceType === 'available' ? (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Disponible al 100%</span>
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-rose-600">Fuera de servicio</span>
                )}

                {serviceType === 'available' && onSelectForQuote && (
                  <button
                    type="button"
                    onClick={() => onSelectForQuote(vehicle)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>Cotizar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredVehicles.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-neutral-200 p-6 space-y-2">
            <Car className="w-8 h-8 mx-auto text-neutral-300" />
            <p className="text-sm font-black text-neutral-700">No se encontraron camionetas con los filtros seleccionados.</p>
            <p className="text-xs text-neutral-400">Intenta cambiando el filtro de estado o la búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
};
