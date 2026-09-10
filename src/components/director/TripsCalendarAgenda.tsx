import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Bus, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Palmtree, 
  CheckCircle2, 
  Plus, 
  AlertCircle,
  BellRing,
  Users,
  Filter
} from 'lucide-react';
import { TripSchedule } from '../../types';

export const TripsCalendarAgenda: React.FC = () => {
  const { 
    trips, 
    vehicles, 
    drivers, 
    charterAssignments, 
    addTrip,
    sendManualWakeUpAlarm 
  } = useApp();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    today.toISOString().substring(0, 10)
  );
  const [filterType, setFilterType] = useState<'all' | 'route' | 'tour'>('all');
  const [showAddTripModal, setShowAddTripModal] = useState<boolean>(false);

  // Form for registering a new scheduled trip
  const [newTripForm, setNewTripForm] = useState({
    routeTitle: 'Manzanillo ⇄ Guadalajara (Troncal)',
    origin: 'Manzanillo, Col.',
    destination: 'Guadalajara (GDL)',
    date: today.toISOString().substring(0, 10),
    departureTime: '07:00 AM',
    estimatedArrival: '11:00 AM',
    vehicleId: vehicles[0]?.id || '',
    driverId: drivers[0]?.id || '',
    basePrice: 480
  });

  // Calendar math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(now.toISOString().substring(0, 10));
  };

  // Build unified list of trips + charter tours
  const allEvents = useMemo(() => {
    const routeEvents = trips.map(t => ({
      id: t.id,
      type: 'route' as const,
      title: t.routeTitle,
      origin: t.origin,
      destination: t.destination,
      date: t.date || today.toISOString().substring(0, 10),
      time: t.departureTime,
      arrival: t.estimatedArrival,
      vehicleId: t.vehicleId,
      driverId: t.driverId,
      status: t.status,
      occupiedSeats: t.occupiedSeatsCount,
      capacity: 19,
      revenue: t.totalRevenue,
      tripObj: t
    }));

    const tourEvents = charterAssignments.map(c => ({
      id: c.id,
      type: 'tour' as const,
      title: `Tour ${c.destination} (${c.clientName})`,
      origin: c.origin,
      destination: c.destination,
      date: c.startDate,
      endDate: c.endDate,
      time: c.startTime || '08:00 AM',
      arrival: c.returnTime || '20:00 PM',
      vehicleId: c.vehicleId,
      driverId: c.driverId,
      status: c.status,
      occupiedSeats: 0,
      capacity: 20,
      revenue: c.totalAmount,
      charterObj: c
    }));

    return [...routeEvents, ...tourEvents];
  }, [trips, charterAssignments, today]);

  // Group events by date string (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof allEvents> = {};
    allEvents.forEach(e => {
      const d = e.date;
      if (!map[d]) map[d] = [];
      map[d].push(e);
    });
    return map;
  }, [allEvents]);

  // Filtered events for the selected day
  const selectedDayEvents = useMemo(() => {
    const dayList = eventsByDate[selectedDateStr] || [];
    if (filterType === 'all') return dayList;
    return dayList.filter(e => e.type === filterType);
  }, [eventsByDate, selectedDateStr, filterType]);

  // Upcoming events from selected date onward
  const upcomingEvents = useMemo(() => {
    return allEvents
      .filter(e => e.date >= selectedDateStr)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 10);
  }, [allEvents, selectedDateStr]);

  const handleCreateTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripForm.origin || !newTripForm.destination) return;

    addTrip({
      routeTitle: newTripForm.routeTitle,
      origin: newTripForm.origin,
      destination: newTripForm.destination,
      date: newTripForm.date,
      departureTime: newTripForm.departureTime,
      estimatedArrival: newTripForm.estimatedArrival,
      vehicleId: newTripForm.vehicleId,
      driverId: newTripForm.driverId,
      status: 'scheduled',
      basePrice: Number(newTripForm.basePrice),
      stops: []
    });

    setShowAddTripModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-600">
              <CalendarIcon className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-wider">Control Operativo</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 mt-1">
              Agenda de Próximos Viajes
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 font-medium">
              Calendario interactivo de salidas regulares troncales y tours turísticos privados.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleGoToday}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs md:text-sm font-black transition-colors cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={() => setShowAddTripModal(true)}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-orange-600 text-white rounded-xl text-xs md:text-sm font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-orange-400" /> Programar Corrida
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Selected Day Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Interactive Calendar (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-neutral-200 space-y-4">
          {/* Calendar Month Header Controls */}
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-black text-neutral-900 flex items-center gap-2">
              <span>{monthNames[currentMonth]} {currentYear}</span>
            </h3>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                aria-label="Mes Anterior"
                className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Siguiente Mes"
                className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center font-black text-[11px] md:text-xs text-neutral-400 uppercase py-2 border-b border-neutral-100">
            <span>Dom</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[70px] md:min-h-[85px] bg-neutral-50/50 rounded-2xl p-1.5 opacity-40"></div>
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isSelected = selectedDateStr === dateStr;
              const isToday = dateStr === today.toISOString().substring(0, 10);

              const hasRoute = dayEvents.some(e => e.type === 'route');
              const hasTour = dayEvents.some(e => e.type === 'tour');

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`min-h-[70px] md:min-h-[85px] p-1.5 md:p-2 rounded-2xl flex flex-col justify-between text-left transition-all cursor-pointer relative border ${
                    isSelected 
                      ? 'bg-orange-50/80 border-orange-500 shadow-sm ring-2 ring-orange-400/30' 
                      : isToday 
                        ? 'bg-neutral-900 text-white border-neutral-900' 
                        : 'bg-neutral-50/70 hover:bg-neutral-100 border-neutral-200 text-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs md:text-sm font-black ${isSelected ? 'text-orange-600' : isToday ? 'text-white' : 'text-neutral-900'}`}>
                      {dayNumber}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-black bg-orange-600 text-white px-1.5 py-0.2 rounded-md">
                        Hoy
                      </span>
                    )}
                  </div>

                  {/* Badges / mini markers for day events */}
                  <div className="space-y-1 w-full mt-1">
                    {dayEvents.slice(0, 2).map((ev, idx) => (
                      <div 
                        key={idx} 
                        className={`text-[9px] md:text-[10px] truncate font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                          ev.type === 'tour'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : isSelected
                              ? 'bg-orange-200/60 text-orange-900'
                              : isToday 
                                ? 'bg-neutral-800 text-neutral-200' 
                                : 'bg-white text-neutral-800 border border-neutral-200'
                        }`}
                      >
                        {ev.type === 'tour' ? <Palmtree className="w-2.5 h-2.5 shrink-0 text-purple-600" /> : <Bus className="w-2.5 h-2.5 shrink-0 text-orange-600" />}
                        <span className="truncate">{ev.time.split(' ')[0]} {ev.destination.split(' ')[0]}</span>
                      </div>
                    ))}

                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-black text-neutral-500 block text-right">
                        +{dayEvents.length - 2} más
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs text-neutral-600 flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-white border border-neutral-300"></span>
                <span className="font-bold">Corrida Regular</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-purple-100 border border-purple-300"></span>
                <span className="font-bold text-purple-900">Tour / Particular</span>
              </div>
            </div>
            <span className="font-bold text-neutral-400">Total Programados: {allEvents.length}</span>
          </div>
        </div>

        {/* Right: Selected Date Itinerary & Upcoming List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Date Box */}
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600">Fecha Seleccionada</span>
                <h3 className="text-lg md:text-xl font-black text-neutral-900">
                  {selectedDateStr}
                </h3>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${filterType === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  Todos ({eventsByDate[selectedDateStr]?.length || 0})
                </button>
                <button
                  onClick={() => setFilterType('route')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${filterType === 'route' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  Rutas
                </button>
                <button
                  onClick={() => setFilterType('tour')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${filterType === 'tour' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  Tours
                </button>
              </div>
            </div>

            {/* List of trips on selected date */}
            <div className="space-y-3">
              {selectedDayEvents.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 space-y-2">
                  <CalendarIcon className="w-8 h-8 text-neutral-300 mx-auto" />
                  <p className="text-sm font-bold text-neutral-700">Sin salidas programadas para este día</p>
                  <p className="text-xs text-neutral-400">Puedes programar una corrida regular o registrar un tour privado.</p>
                  <button
                    onClick={() => {
                      setNewTripForm(prev => ({ ...prev, date: selectedDateStr }));
                      setShowAddTripModal(true);
                    }}
                    className="mt-2 px-3 py-1.5 bg-neutral-900 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-orange-400" /> Programar Salida
                  </button>
                </div>
              ) : (
                selectedDayEvents.map(event => {
                  const vehicle = vehicles.find(v => v.id === event.vehicleId);
                  const driver = drivers.find(d => d.id === event.driverId);

                  return (
                    <div 
                      key={event.id}
                      className={`p-4 rounded-2xl border-2 shadow-xs space-y-3 ${
                        event.type === 'tour' 
                          ? 'bg-purple-50/40 border-purple-200' 
                          : 'bg-neutral-50/70 border-neutral-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block ${
                            event.type === 'tour' ? 'bg-purple-100 text-purple-900' : 'bg-orange-100 text-orange-900'
                          }`}>
                            {event.type === 'tour' ? '🌴 Tour Turístico Particular' : '🚌 Ruta Troncal Regular'}
                          </span>
                          <h4 className="text-sm md:text-base font-black text-neutral-900 mt-1">
                            {event.origin} ➔ {event.destination}
                          </h4>
                          <p className="text-xs text-neutral-500 font-bold flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-orange-600" />
                            Salida: {event.time} • Estimada: {event.arrival}
                          </p>
                        </div>

                        <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-white border border-neutral-200 text-neutral-900 shrink-0">
                          {event.type === 'route' ? `${event.occupiedSeats} / ${event.capacity} Plazas` : `$${event.revenue.toLocaleString()} MXN`}
                        </span>
                      </div>

                      {/* Vehicle and Driver tags */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-neutral-200/80">
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase font-black">Unidad:</span>
                          <p className="font-black text-neutral-900 truncate">
                            {vehicle?.unitNumber || 'Sin Asignar'} ({vehicle?.model || 'Van'})
                          </p>
                          <p className="text-[10px] text-neutral-500 font-mono font-bold">Placa: {vehicle?.plate || 'S/P'}</p>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase font-black">Operador:</span>
                          <p className="font-black text-neutral-900 truncate">
                            {driver?.name || 'Por asignar'}
                          </p>
                          {driver?.phone && (
                            <p className="text-[10px] text-neutral-500 font-bold flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-emerald-600" /> {driver.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          event.status === 'scheduled' || event.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-900'
                            : event.status === 'boarding'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {event.status}
                        </span>

                        {driver && (
                          <button
                            onClick={() => sendManualWakeUpAlarm(driver.id, event.id, `Recordatorio: Salida programada hacia ${event.destination} a las ${event.time}`)}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-orange-50 hover:text-orange-600 text-neutral-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 border border-neutral-200"
                            title="Enviar alarma / despertador al chofer"
                          >
                            <BellRing className="w-3 h-3 text-orange-500" /> Recordar al Chofer
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Next 10 Trips Quick Preview */}
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-neutral-200 space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-orange-600" /> Próximas Salidas en Calendario
            </h4>

            <div className="space-y-2 max-h-[350px] overflow-y-auto no-scrollbar">
              {upcomingEvents.map(ev => (
                <div 
                  key={ev.id}
                  onClick={() => setSelectedDateStr(ev.date)}
                  className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-between gap-2 cursor-pointer transition-colors text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-orange-600">{ev.date}</span>
                      <span className="text-neutral-400">•</span>
                      <span className="font-bold text-neutral-900">{ev.time}</span>
                    </div>
                    <p className="font-black text-neutral-800 truncate mt-0.5">{ev.title}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                    ev.type === 'tour' ? 'bg-purple-100 text-purple-900' : 'bg-neutral-200 text-neutral-800'
                  }`}>
                    {ev.type === 'tour' ? 'Tour' : 'Ruta'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Programar Corrida Regular */}
      {showAddTripModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border-2 border-neutral-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Programar Nueva Corrida</h3>
                <p className="text-xs text-neutral-500 font-medium">Asigna unidad y chofer a la salida en calendario</p>
              </div>
              <button 
                onClick={() => setShowAddTripModal(false)}
                className="text-neutral-400 hover:text-neutral-800 font-black text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTripSubmit} className="space-y-3.5 text-xs md:text-sm">
              <div>
                <label className="block font-black text-neutral-700 mb-1">Título de la Ruta</label>
                <input 
                  type="text"
                  value={newTripForm.routeTitle}
                  onChange={e => setNewTripForm(prev => ({ ...prev, routeTitle: e.target.value }))}
                  required
                  className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Origen</label>
                  <input 
                    type="text"
                    value={newTripForm.origin}
                    onChange={e => setNewTripForm(prev => ({ ...prev, origin: e.target.value }))}
                    required
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Destino</label>
                  <input 
                    type="text"
                    value={newTripForm.destination}
                    onChange={e => setNewTripForm(prev => ({ ...prev, destination: e.target.value }))}
                    required
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Fecha</label>
                  <input 
                    type="date"
                    value={newTripForm.date}
                    onChange={e => setNewTripForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Hora Salida</label>
                  <input 
                    type="text"
                    value={newTripForm.departureTime}
                    onChange={e => setNewTripForm(prev => ({ ...prev, departureTime: e.target.value }))}
                    placeholder="07:00 AM"
                    required
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Tarifa Base ($)</label>
                  <input 
                    type="number"
                    value={newTripForm.basePrice}
                    onChange={e => setNewTripForm(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                    required
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Unidad Flotilla</label>
                  <select
                    value={newTripForm.vehicleId}
                    onChange={e => setNewTripForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  >
                    {vehicles.filter(v => v.status !== 'maintenance').map(v => (
                      <option key={v.id} value={v.id}>
                        {v.unitNumber} ({v.model} - {v.capacity} pl.)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black text-neutral-700 mb-1">Chofer Asignado</label>
                  <select
                    value={newTripForm.driverId}
                    onChange={e => setNewTripForm(prev => ({ ...prev, driverId: e.target.value }))}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.status === 'available' ? '(Disponible)' : `(${d.status})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddTripModal(false)}
                  className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-black cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-lg cursor-pointer transition-all active:scale-98"
                >
                  Guardar en Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
