import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Bus, 
  Check, 
  ShieldCheck, 
  Package, 
  Dog, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Timer,
  FileText,
  Phone,
  Sparkles,
  ArrowRightLeft,
  Navigation,
  ExternalLink,
  Trash2,
  Palmtree,
  LayoutGrid,
  Tag,
  Compass,
  Car
} from 'lucide-react';
import { OFFICIAL_PRICING, OFFICIAL_PHONE, OFFICIAL_WHATSAPP, OFFICIAL_EXPERIENCE_YEARS } from '../../data/mockData';
import { TripSchedule, Seat, Booking, RoutePricing } from '../../types';
import { ClientReportModal } from '../modals/ClientReportModal';
import { RentalCatalog } from '../common/RentalCatalog';
import { SeatDiagramViewer } from '../common/SeatDiagramViewer';

interface PassengerPortalProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTicket: (booking: Booking) => void;
}

export const PassengerPortal: React.FC<PassengerPortalProps> = ({ activeTab, setActiveTab, onOpenTicket }) => {
  const { 
    trips, 
    bookings, 
    routeStops,
    routePricings,
    seatTemplates,
    charterAssignments,
    selectedTripId, 
    setSelectedTripId, 
    tempLockedSeats, 
    lockSeatsTemporarily, 
    releaseTemporarySeatLock, 
    createBooking,
    deleteBooking,
    purgeAllBookings,
    showNotification 
  } = useApp();

  // Search filter states
  const [origin, setOrigin] = useState<string>('Manzanillo');
  const [destination, setDestination] = useState<string>('Guadalajara (GDL)');
  const [travelDate, setTravelDate] = useState<string>('2026-09-02');
  const [paxCount, setPaxCount] = useState<number>(1);
  const [tripType, setTripType] = useState<'sencillo' | 'redondo'>('sencillo');
  const [returnDate, setReturnDate] = useState<string>('2026-09-05');
  const [showClientReport, setShowClientReport] = useState<boolean>(false);

  // Tours tab states
  const [tourSearchTerm, setTourSearchTerm] = useState<string>('');
  const [tourCategoryFilter, setTourCategoryFilter] = useState<'all' | 'tours' | 'routes'>('all');

  // Seat selection states
  const [selectedSeatNums, setSelectedSeatNums] = useState<number[]>([3]);
  const [selectedBoardingStop, setSelectedBoardingStop] = useState<string>('Soriana Híper Manzanillo (Soriana Híper Manzanillo)');
  const [selectedDropoffStop, setSelectedDropoffStop] = useState<string>('Minerva (Burger) - Afuera del estacionamiento del Burger');
  
  // Passenger Info & Addons
  const [passengerName, setPassengerName] = useState<string>('María Elena Torres');
  const [passengerPhone, setPassengerPhone] = useState<string>('314-889-1022');
  const [passengerEmail, setPassengerEmail] = useState<string>('elena.torres@gmail.com');
  const [hasParcel, setHasParcel] = useState<boolean>(false);
  const [hasPet, setHasPet] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei' | 'cash_counter' | 'oxxo'>('card');

  const selectedTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  // Active pricings managed by admin
  const activePricings = useMemo(() => {
    return routePricings.filter(p => p.isActive !== false);
  }, [routePricings]);

  // Dynamic available destinations for chosen origin
  const availableDestinations = useMemo(() => {
    const list = activePricings
      .filter(p => p.origin.toLowerCase() === origin.toLowerCase())
      .map(p => p.destination);
    return list.length > 0 ? list : ['Guadalajara (GDL)', 'Colima'];
  }, [origin, activePricings]);

  const handleOriginChange = (newOrigin: string) => {
    setOrigin(newOrigin);
    const validDests = activePricings
      .filter(p => p.origin.toLowerCase() === newOrigin.toLowerCase())
      .map(p => p.destination);
    if (validDests.length > 0 && !validDests.includes(destination)) {
      setDestination(validDests[0]);
    }
  };

  // Calculate pricing based on origin and destination
  const matchedPricing: RoutePricing = activePricings.find(
    p => p.origin.toLowerCase() === origin.toLowerCase() &&
         p.destination.toLowerCase() === destination.toLowerCase()
  ) || activePricings.find(
    p => (p.origin.toLowerCase().includes(origin.toLowerCase().split(' ')[0]) || origin.toLowerCase().includes(p.origin.toLowerCase())) &&
         (p.destination.toLowerCase().includes(destination.toLowerCase().split(' ')[0]) || destination.toLowerCase().includes(p.destination.toLowerCase()))
  ) || { origin, destination, singlePrice: selectedTrip.basePrice, roundTripPrice: selectedTrip.basePrice * 2 - 20, timeEstimate: '4 hrs', notes: 'Ruta directa troncal' };

  // Check if chosen boarding stop has a specific price assigned by admin
  const matchedBoardingStop = routeStops.find(s => 
    selectedBoardingStop.includes(s.name) || 
    selectedBoardingStop === `${s.city}: ${s.name} (${s.landmark})`
  );

  const baseUnitPrice = (tripType === 'redondo' && matchedPricing.roundTripPrice) 
    ? matchedPricing.roundTripPrice 
    : matchedPricing.singlePrice;

  // If the boarding stop has an explicit farePrice set by admin, apply it!
  const unitPrice = (matchedBoardingStop?.farePrice && matchedBoardingStop.farePrice > 0)
    ? (tripType === 'redondo' ? (matchedBoardingStop.farePrice * 2 - 20) : matchedBoardingStop.farePrice)
    : baseUnitPrice;

  const isSelectedTripTour = Boolean(selectedTrip?.isTour);
  const effectiveUnitPrice = isSelectedTripTour
    ? (selectedTrip.basePrice || 650)
    : unitPrice;

  const parcelFee = hasParcel ? (origin.includes('Manzanillo') ? 250 : 150) : 0;
  const petFee = hasPet ? (origin.includes('Manzanillo') ? 250 : 150) : 0;
  const seatSubtotal = effectiveUnitPrice * selectedSeatNums.length;
  const totalAmount = seatSubtotal + parcelFee + petFee;

  const handleSelectTrip = (trip: TripSchedule) => {
    setSelectedTripId(trip.id);
    setSelectedSeatNums([]);
    setActiveTab('seats');
  };

  const toggleSeatSelection = (seat: Seat) => {
    if (seat.status === 'sold' || seat.type === 'driver' || seat.type === 'door' || seat.type === 'walkway') {
      return;
    }

    let updated: number[];
    if (selectedSeatNums.includes(seat.number)) {
      updated = selectedSeatNums.filter(n => n !== seat.number);
    } else {
      updated = [...selectedSeatNums, seat.number];
    }
    
    setSelectedSeatNums(updated);
    if (updated.length > 0) {
      lockSeatsTemporarily(selectedTrip.id, updated);
    } else {
      releaseTemporarySeatLock();
    }
  };

  const handleCompleteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeatNums.length === 0) {
      showNotification('Por favor selecciona al menos un asiento.', 'error');
      return;
    }
    if (!passengerName.trim() || !passengerPhone.trim()) {
      showNotification('Ingresa nombre y teléfono de contacto.', 'error');
      return;
    }

    const newBooking = createBooking({
      tripId: selectedTrip.id,
      passengerName,
      passengerPhone,
      passengerEmail,
      origin: selectedTrip.origin || origin,
      destination: selectedTrip.destination || destination,
      boardingPoint: selectedBoardingStop,
      dropoffPoint: selectedDropoffStop,
      date: selectedTrip.date || travelDate,
      departureTime: selectedTrip.departureTime,
      seatNumbers: selectedSeatNums,
      unitNumber: selectedTrip.unitNumber || (selectedTrip.vehicleId === 'veh-sp20-01' ? 'Unidad 04 (Sprinter)' : 'Unidad Flotilla'),
      totalAmount,
      paymentMethod,
      paymentStatus: 'paid',
      source: 'web',
      tripType: isSelectedTripTour ? 'sencillo' : tripType,
      returnDate: tripType === 'redondo' ? returnDate : undefined,
      packageType: isSelectedTripTour ? 'Tour Turístico' : matchedPricing.packageType,
      addons: {
        parcel: hasParcel,
        parcelFee,
        pet: hasPet,
        petFee
      }
    });

    onOpenTicket(newBooking);
    setActiveTab('tickets');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-neutral-100 p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* Tab 1: Itinerarios / Búsqueda */}
      {activeTab === 'search' && (
        <div className="max-w-5xl mx-auto w-full space-y-6">
          
          {/* Official Company Banner with 18 Years & Contact */}
          <div className="bg-neutral-900 text-white rounded-3xl p-5 md:p-6 border border-neutral-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg md:text-xl font-black uppercase tracking-wide">Gutiérrez Transportes y Viajes</h2>
                  <span className="bg-orange-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    {OFFICIAL_EXPERIENCE_YEARS} Años de Experiencia
                  </span>
                </div>
                <p className="text-xs md:text-sm text-neutral-300 font-medium mt-0.5">
                  Salidas diarias en unidades ejecutivas • WhatsApp: <strong className="text-orange-400">{OFFICIAL_WHATSAPP}</strong> • Fijo: <strong>{OFFICIAL_PHONE}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowClientReport(true)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs md:text-sm font-black rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>Reporte Cliente y Tarifas (PDF)</span>
            </button>
          </div>

          {/* Quick Package Selector Pills */}
          <div className="bg-white rounded-2xl p-3 border border-neutral-200 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-500 shrink-0 px-2">
              Paquetes Rápidos:
            </span>
            <button
              onClick={() => { handleOriginChange('Manzanillo'); setDestination('Guadalajara (GDL)'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                destination.includes('Guadalajara') ? 'bg-orange-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              🚌 Salidas Diarias Troncal
            </button>
            <button
              onClick={() => { handleOriginChange('Manzanillo'); setDestination('CAS / Consulado Americano'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                destination.includes('CAS') ? 'bg-orange-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              🇺🇸 CAS / Consulado Americano
            </button>
            <button
              onClick={() => { handleOriginChange('Manzanillo'); setDestination('Zoológico de GDL'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                destination.includes('Zoológico') ? 'bg-orange-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              🦁 Zoológico Guadalajara
            </button>
          </div>

          {/* Header Card with Search Controls */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-5">
            
            {/* Trip Type Selector (Sencillo vs Redondo) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setTripType('sencillo')}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                    tripType === 'sencillo' ? 'bg-orange-600 text-white shadow-xs' : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  Viaje Sencillo
                </button>
                <button
                  type="button"
                  onClick={() => setTripType('redondo')}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    tripType === 'redondo' ? 'bg-orange-600 text-white shadow-xs' : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Viaje Redondo (Ahorro)
                </button>
              </div>

              {/* Colima scale alert pill */}
              <div className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span>⏱️</span> En Colima se hace escala técnica de 10 a 15 min
              </div>
            </div>

            {/* Origin & Destination pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-neutral-50 rounded-2xl p-4 border-2 border-neutral-200 focus-within:border-orange-500 transition-all">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-neutral-500 uppercase tracking-wider">Origen</p>
                  <select
                    value={origin}
                    onChange={e => handleOriginChange(e.target.value)}
                    className="w-full bg-transparent font-black text-neutral-900 text-base md:text-lg focus:outline-none cursor-pointer mt-0.5"
                  >
                    <option value="Manzanillo">Manzanillo (Soriana / AutoZone)</option>
                    <option value="Tecomán">Tecomán (Kiosko Centro)</option>
                    <option value="Colima">Colima (Oficina Central San Fernando)</option>
                    <option value="Cd. Guzmán">Cd. Guzmán (Glorieta Colón)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-neutral-50 rounded-2xl p-4 border-2 border-neutral-200 focus-within:border-orange-500 transition-all">
                <div className="w-3.5 h-3.5 rounded-full bg-orange-600 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-neutral-500 uppercase tracking-wider">Destino</p>
                  <select
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    className="w-full bg-transparent font-black text-neutral-900 text-base md:text-lg focus:outline-none cursor-pointer mt-0.5"
                  >
                    {availableDestinations.map(dest => (
                      <option key={dest} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date, Return Date (if Redondo), & Pax */}
            <div className={`grid grid-cols-1 ${tripType === 'redondo' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
              <div className="bg-neutral-50 p-4 rounded-2xl border-2 border-neutral-200">
                <p className="text-xs font-black text-neutral-500 uppercase flex items-center gap-1.5 tracking-wider">
                  <Calendar className="w-4 h-4 text-orange-600" /> Fecha de Salida
                </p>
                <input
                  type="date"
                  value={travelDate}
                  onChange={e => setTravelDate(e.target.value)}
                  className="w-full bg-transparent font-black text-neutral-900 text-base md:text-lg mt-1 focus:outline-none cursor-pointer"
                />
              </div>

              {tripType === 'redondo' && (
                <div className="bg-orange-50/70 p-4 rounded-2xl border-2 border-orange-200">
                  <p className="text-xs font-black text-orange-700 uppercase flex items-center gap-1.5 tracking-wider">
                    <Calendar className="w-4 h-4 text-orange-600" /> Fecha de Retorno
                  </p>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full bg-transparent font-black text-neutral-900 text-base md:text-lg mt-1 focus:outline-none cursor-pointer"
                  />
                </div>
              )}

              <div className="bg-neutral-50 p-4 rounded-2xl border-2 border-neutral-200">
                <p className="text-xs font-black text-neutral-500 uppercase flex items-center gap-1.5 tracking-wider">
                  <Users className="w-4 h-4 text-orange-600" /> Número de Pasajeros
                </p>
                <select
                  value={paxCount}
                  onChange={e => setPaxCount(Number(e.target.value))}
                  className="w-full bg-transparent font-black text-neutral-900 text-base md:text-lg mt-1 focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 Pasajero</option>
                  <option value={2}>2 Pasajeros</option>
                  <option value={3}>3 Pasajeros</option>
                  <option value={4}>4+ Pasajeros</option>
                </select>
              </div>
            </div>

            {/* Official Fare Pill with Sencillo / Redondo Display */}
            <div className="bg-orange-50/90 border-2 border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs md:text-sm text-orange-700 font-black uppercase tracking-wider">
                    Tarifa Oficial • {tripType === 'redondo' ? 'Viaje Redondo' : 'Viaje Sencillo'}
                  </p>
                  {tripType === 'redondo' && matchedPricing.roundTripPrice && (
                    <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Ahorro: ${(matchedPricing.singlePrice * 2) - matchedPricing.roundTripPrice} MXN
                    </span>
                  )}
                </div>
                <p className="text-sm md:text-base text-neutral-700 font-medium mt-0.5">{matchedPricing.notes}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-2xl md:text-3xl font-black text-orange-600">${unitPrice} MXN</p>
                {matchedPricing.roundTripPrice && tripType === 'sencillo' && (
                  <p className="text-xs md:text-sm text-neutral-600 font-bold">
                    Opción Redondo: ${matchedPricing.roundTripPrice} MXN
                  </p>
                )}
                {tripType === 'redondo' && (
                  <p className="text-xs text-neutral-500 font-medium">Incluye ida y vuelta</p>
                )}
              </div>
            </div>
          </div>

          {/* Available Departures List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-neutral-800">
                Salidas Disponibles para esta Fecha
              </h3>
              <span className="text-xs md:text-sm text-neutral-500 font-bold">{trips.length} corridas programadas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.map(trip => (
                <div
                  key={trip.id}
                  className={`bg-white rounded-3xl p-5 border-2 transition-all shadow-xs ${
                    selectedTripId === trip.id
                      ? 'border-orange-600 ring-2 ring-orange-500/20'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 font-mono">
                          {trip.unitNumber}
                        </span>
                        {trip.isTour ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 flex items-center gap-1">
                            <Palmtree className="w-3 h-3 text-purple-600" /> Tour Turístico
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                            Ruta Regular
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <h4 className="text-xl md:text-2xl font-black text-neutral-900">{trip.departureTime}</h4>
                        <span className="text-xs font-bold text-neutral-500">➔ {trip.estimatedArrival}</span>
                      </div>
                      <p className="text-xs text-neutral-600 font-medium mt-1">
                        Conductor: <strong>{trip.driverName}</strong>
                      </p>
                      {trip.routeTitle && (
                        <p className="text-xs text-neutral-800 font-black mt-0.5">{trip.routeTitle}</p>
                      )}
                      {(() => {
                        const tmpl = seatTemplates.find(t => t.id === trip.layoutTemplateId);
                        return tmpl ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mt-1 border border-purple-200">
                            <LayoutGrid className="w-3 h-3 text-purple-500" /> {tmpl.name}
                          </span>
                        ) : null;
                      })()}
                    </div>

                    <div className="text-right">
                      <span className="text-xl md:text-2xl font-black text-neutral-900">
                        ${trip.isTour ? (trip.basePrice || unitPrice) : unitPrice}
                      </span>
                      <p className="text-xs text-neutral-500 font-bold">por persona</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      {trip.totalSeats - trip.occupiedSeatsCount} asientos disponibles
                    </span>
                    <button
                      onClick={() => handleSelectTrip(trip)}
                      className="px-4 py-2 bg-neutral-900 hover:bg-orange-600 text-white text-xs md:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Elegir Asientos</span>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Modal Reporte para Cliente */}
      {showClientReport && (
        <ClientReportModal onClose={() => setShowClientReport(false)} />
      )}

      {/* Tab 2: Mapa Interactivo de Asientos & Checkout */}
      {activeTab === 'seats' && (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Trip Header Banner */}
          <div className="bg-black text-white rounded-3xl p-5 md:p-6 shadow-md space-y-3 border-2 border-neutral-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs md:text-sm font-black uppercase tracking-wider text-orange-400">
                Paso 2: Selección de Plazas
              </span>
              {tempLockedSeats && (
                <span className="text-xs bg-orange-600/40 text-orange-200 font-black px-3 py-1 rounded-full flex items-center gap-1.5 border border-orange-500/50">
                  <Timer className="w-4 h-4 animate-spin" /> Bloqueo temporal 10 min activo
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-base md:text-lg font-black text-white">{selectedTrip.routeTitle}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-300 font-medium mt-1">
                  <span className="flex items-center gap-1 text-orange-400 font-bold">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    Salida: {selectedTrip.date || travelDate} a las {selectedTrip.departureTime}
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    Tarifa: ${effectiveUnitPrice} MXN / boleto
                  </span>
                  {selectedTrip.isTour && (
                    <>
                      <span className="text-neutral-500">•</span>
                      <span className="text-purple-300 font-black flex items-center gap-1">
                        <Palmtree className="w-3.5 h-3.5 text-purple-400" /> Tour Especial
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveTab(selectedTrip.isTour ? 'tours' : 'search')}
                className="text-xs md:text-sm bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl font-bold transition-colors shrink-0"
              >
                {selectedTrip.isTour ? 'Ver Otros Tours' : 'Cambiar Viaje'}
              </button>
            </div>
          </div>

          {/* Seat Map Canvas Container */}
          {(() => {
            const tripTemplate = seatTemplates.find(t => t.id === selectedTrip.layoutTemplateId)
              || seatTemplates.find(t => t.totalSeats === selectedTrip.seats.filter(s => s.type === 'standard').length)
              || seatTemplates[0];

            const diagramTitle = tripTemplate
              ? `${tripTemplate.name} (${selectedTrip.seats.filter(s => s.type === 'standard').length} Asientos)`
              : `Diagrama de Asientos (${selectedTrip.seats.filter(s => s.type === 'standard').length} Asientos)`;

            return (
              <SeatDiagramViewer
                seats={selectedTrip.seats}
                selectedSeatNumbers={selectedSeatNums}
                onSeatClick={(seatNum, seat) => {
                  if (seat) {
                    toggleSeatSelection(seat);
                  } else {
                    const found = selectedTrip.seats.find(s => s.number === seatNum);
                    if (found) toggleSeatSelection(found);
                  }
                }}
                interactive={true}
                title={diagramTitle}
                subtitle="Toca los asientos para seleccionarlos. 🟢 Verde = Libre/Disponible, 🔴 Rojo = Vendido/Ocupado, 🟠 Naranja = Seleccionado"
              />
            );
          })()}

          {/* Boarding Point & Contact Details Form */}
          <form onSubmit={handleCompleteCheckout} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <span className="text-sm md:text-base font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" /> Punto de Abordaje y Pasajero
            </span>

            {/* Boarding & Dropoff Stop Pickers with Exact Physical Landmarks and Google Maps Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">
                  Punto de Abordaje Oficial (con Referencia)
                </label>
                <select
                  value={selectedBoardingStop}
                  onChange={e => setSelectedBoardingStop(e.target.value)}
                  className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-xs md:text-sm font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                >
                  {routeStops.filter(s => s.isActive).map(stop => (
                    <option key={stop.id} value={`${stop.city}: ${stop.name} (${stop.landmark})`}>
                      {stop.city}: {stop.name} — {stop.landmark} {stop.farePrice ? `(Tarifa: $${stop.farePrice} MXN)` : ''}
                    </option>
                  ))}
                </select>

                {/* Live Boarding Location & Google Maps Link Preview */}
                {(() => {
                  const currentStop = routeStops.find(s => 
                    selectedBoardingStop.includes(s.name) || 
                    selectedBoardingStop === `${s.city}: ${s.name} (${s.landmark})`
                  );
                  if (!currentStop) return null;
                  return (
                    <div className="mt-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <p className="font-black text-neutral-900 flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          {currentStop.landmark}
                        </p>
                        <p className="text-neutral-500 text-[11px] mt-0.5 truncate">{currentStop.address}</p>
                      </div>
                      {currentStop.mapsUrl && (
                        <a
                          href={currentStop.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-all shrink-0 cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Ver en Google Maps</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">
                  Punto de Descenso Oficial
                </label>
                <select
                  value={selectedDropoffStop}
                  onChange={e => setSelectedDropoffStop(e.target.value)}
                  className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-xs md:text-sm font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                >
                  {routeStops.filter(s => s.isActive).map(stop => (
                    <option key={stop.id} value={`${stop.city}: ${stop.name} (${stop.landmark})`}>
                      {stop.city}: {stop.name} — {stop.landmark}
                    </option>
                  ))}
                </select>

                {/* Live Dropoff Location & Google Maps Link Preview */}
                {(() => {
                  const currentStop = routeStops.find(s => 
                    selectedDropoffStop.includes(s.name) || 
                    selectedDropoffStop === `${s.city}: ${s.name} (${s.landmark})`
                  );
                  if (!currentStop) return null;
                  return (
                    <div className="mt-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <p className="font-black text-neutral-900 flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          {currentStop.landmark}
                        </p>
                        <p className="text-neutral-500 text-[11px] mt-0.5 truncate">{currentStop.address}</p>
                      </div>
                      {currentStop.mapsUrl && (
                        <a
                          href={currentStop.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-all shrink-0 cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Ver en Google Maps</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Passenger Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Nombre Completo del Pasajero</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. María Elena Torres"
                  value={passengerName}
                  onChange={e => setPassengerName(e.target.value)}
                  className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-sm md:text-base font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="314-123-4567"
                    value={passengerPhone}
                    onChange={e => setPassengerPhone(e.target.value)}
                    className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-sm md:text-base font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={passengerEmail}
                    onChange={e => setPassengerEmail(e.target.value)}
                    className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl text-sm md:text-base font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <p className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Servicios Adicionales en Ruta</p>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border-2 border-neutral-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-orange-600" />
                  <span className="text-sm md:text-base text-neutral-900 font-bold">Paquetería o Encomienda</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs md:text-sm text-neutral-600 font-black">+$250 MXN</span>
                  <input
                    type="checkbox"
                    checked={hasParcel}
                    onChange={e => setHasParcel(e.target.checked)}
                    className="w-5 h-5 accent-orange-600 rounded"
                  />
                </div>
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border-2 border-neutral-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Dog className="w-5 h-5 text-orange-600" />
                  <span className="text-sm md:text-base text-neutral-900 font-bold">Mascota en Transportadora Rígida</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs md:text-sm text-neutral-600 font-black">+$250 MXN</span>
                  <input
                    type="checkbox"
                    checked={hasPet}
                    onChange={e => setHasPet(e.target.checked)}
                    className="w-5 h-5 accent-orange-600 rounded"
                  />
                </div>
              </label>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <p className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Método de Pago</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border-2 text-xs md:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'card' ? 'bg-orange-50 border-orange-600 text-orange-800 ring-1 ring-orange-500' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-orange-600" /> Tarjeta Débito/Crédito
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('spei')}
                  className={`p-3 rounded-2xl border-2 text-xs md:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'spei' ? 'bg-orange-50 border-orange-600 text-orange-800 ring-1 ring-orange-500' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                  }`}
                >
                  <Wallet className="w-4 h-4 md:w-5 md:h-5 text-orange-600" /> Transferencia SPEI
                </button>
              </div>
            </div>

            {/* Price Summary & Submit Button */}
            <div className="pt-3 border-t border-neutral-100 space-y-3">
              <div className="flex items-center justify-between text-sm md:text-base">
                <span className="text-neutral-500 font-medium">Asientos seleccionados:</span>
                <span className="font-black text-neutral-900">
                  {selectedSeatNums.length > 0 ? `#${selectedSeatNums.join(', #')}` : 'Ninguno'}
                </span>
              </div>
              <div className="flex items-center justify-between text-base md:text-lg">
                <span className="font-black text-neutral-900">Total a Pagar:</span>
                <span className="text-2xl md:text-3xl font-black text-orange-600">${totalAmount} MXN</span>
              </div>

              <button
                type="submit"
                disabled={selectedSeatNums.length === 0}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-base md:text-lg shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer active:scale-98"
              >
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
                Pagar y Generar Boleto QR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Mis Boletos Emitidos */}
      {activeTab === 'tickets' && (
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-neutral-800">
                Mis Boletos Digitales Emitidos
              </h3>
              <p className="text-xs text-neutral-500">Boletos registrados en el sistema y sincronizados con la base de datos</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-neutral-600 font-bold">{bookings.length} boletos</span>
              {bookings.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Deseas eliminar TODOS los boletos emitidos? Se liberarán los asientos y se borrarán permanentemente.')) {
                      purgeAllBookings();
                    }
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1 border border-red-200"
                  title="Eliminar todos los boletos registrados"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Limpiar Todo
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-neutral-200 text-center space-y-2">
                <p className="text-sm font-black text-neutral-700">No hay boletos emitidos actualmente</p>
                <p className="text-xs text-neutral-400">Los boletos comprados o reservados aparecerán aquí listos para viajar.</p>
              </div>
            ) : (
              bookings.map(booking => (
                <div
                  key={booking.id}
                  onClick={() => onOpenTicket(booking)}
                  className="bg-white rounded-3xl p-5 border-2 border-neutral-200 shadow-sm hover:border-orange-500 transition-all cursor-pointer relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-orange-700 bg-orange-100 px-3 py-1 rounded-lg">
                          {booking.id}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          booking.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {booking.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </div>
                      <h4 className="text-base md:text-lg font-black text-neutral-900 mt-2">{booking.passengerName}</h4>
                      <p className="text-sm font-bold text-neutral-600">{booking.origin} ➔ {booking.destination}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg md:text-xl font-black text-neutral-900">${booking.totalAmount} MXN</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Estás seguro de eliminar definitivamente el boleto #${booking.id} de ${booking.passengerName}? Se liberarán sus asientos y se borrará de Supabase.`)) {
                              deleteBooking(booking.id);
                            }
                          }}
                          className="p-1.5 bg-neutral-100 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                          title="Eliminar boleto definitivamente de la base de datos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className={`text-xs font-black ${
                        booking.checkInStatus === 'checked_in' ? 'text-emerald-700' : 'text-orange-600'
                      }`}>
                        {booking.checkInStatus === 'checked_in' ? '✓ Abordó' : 'Pendiente de abordar'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-neutral-100 text-xs md:text-sm">
                    <div>
                      <span className="text-neutral-400 uppercase font-black text-[10px] md:text-xs">Fecha</span>
                      <p className="font-black text-neutral-800">{booking.date}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 uppercase font-black text-[10px] md:text-xs">Asientos</span>
                      <p className="font-black text-orange-600">#{booking.seatNumbers.join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-400 uppercase font-black text-[10px] md:text-xs">Ver QR</span>
                      <p className="font-black text-neutral-900 flex items-center justify-end gap-1">
                        <QrCode className="w-4 h-4 text-orange-600" /> Abrir Pass
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Tarifario Oficial & Escalas */}
      {activeTab === 'routes' && (
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <div className="bg-white rounded-3xl p-6 border-2 border-neutral-200 shadow-sm space-y-2">
            <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-orange-600 flex items-center gap-2">
              <Bus className="w-5 h-5" /> Tarifario Oficial Corredor Troncal
            </h3>
            <p className="text-sm md:text-base text-neutral-600 font-medium">
              Precios regulados para Manzanillo ⇄ Tecomán ⇄ Colima ⇄ Guadalajara con escalas y paradas especiales.
            </p>
          </div>

          <div className="space-y-3">
            {activePricings.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border-2 border-neutral-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm md:text-base font-black text-neutral-900">
                    <span>{item.origin}</span>
                    <span className="text-orange-600">➔</span>
                    <span>{item.destination}</span>
                    {item.packageType === 'cas_visa' && (
                      <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md ml-1">
                        CAS Visa
                      </span>
                    )}
                    {item.packageType === 'zoologico' && (
                      <span className="text-[10px] font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md ml-1">
                        Zoológico
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-neutral-500 font-medium mt-0.5">{item.notes} • ~{item.timeEstimate}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-base md:text-lg font-black text-orange-600">${item.singlePrice} MXN</span>
                  {item.roundTripPrice && (
                    <p className="text-xs font-bold text-neutral-500">Redondo: ${item.roundTripPrice}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Ubicaciones de Partida y Enlaces Google Maps */}
          <div className="bg-white rounded-3xl p-6 border-2 border-neutral-200 shadow-sm space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" /> Puntos Oficiales de Abordaje & GPS
                </h3>
                <p className="text-xs md:text-sm text-neutral-600 font-medium mt-0.5">
                  Ubicaciones con enlace directo a Google Maps para que puedas llegar sin contratiempos.
                </p>
              </div>
              <span className="text-xs font-black bg-orange-100 text-orange-800 px-3 py-1 rounded-full w-fit">
                {routeStops.filter(s => s.isActive).length} Puntos Habilitados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {routeStops.filter(s => s.isActive).map((stop) => (
                <div key={stop.id} className="p-4 bg-neutral-50 rounded-2xl border-2 border-neutral-200 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black bg-neutral-900 text-white px-2 py-0.5 rounded-md uppercase">
                          {stop.city}
                        </span>
                        {stop.farePrice !== undefined && stop.farePrice > 0 && (
                          <span className="text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                            ${stop.farePrice} MXN
                          </span>
                        )}
                      </div>
                      {stop.isSpecialPoint && (
                        <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                          ⭐ Especial
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-sm text-neutral-900 leading-snug pt-1">
                      {stop.name}
                    </h4>
                    <p className="text-xs text-neutral-600 font-medium">
                      <span className="font-bold text-neutral-800">Referencia:</span> {stop.landmark}
                    </p>
                    <p className="text-xs text-neutral-500 font-mono">
                      {stop.address}
                    </p>
                  </div>

                  {stop.mapsUrl ? (
                    <a
                      href={stop.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Abrir en Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-neutral-400 italic text-center py-1">
                      Ubicación física en terminal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Catálogo Oficial de Autos y Camionetas de Renta (Con y Sin Chofer) */}
      {activeTab === 'rentals' && (
        <RentalCatalog />
      )}

      {/* Tab 6: Tours Turísticos y Viajes Especiales Disponibles */}
      {activeTab === 'tours' && (
        <div className="max-w-6xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-neutral-900 text-white rounded-3xl p-6 md:p-8 shadow-sm space-y-3 relative overflow-hidden border border-purple-900/50">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs md:text-sm font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <Palmtree className="w-5 h-5 text-purple-400" /> Tours y Viajes Disponibles para Clientes
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
                  Excursiones, Playas y Pueblos Mágicos
                </h2>
                <p className="text-sm text-neutral-300 font-medium max-w-2xl mt-1">
                  Elige el viaje turístico o excursión que más te convenga. Cada tour cuenta con su diagrama de asientos oficial para que selecciones tus lugares antes de confirmar.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-purple-200 uppercase font-black block">Tours Disponibles</span>
                  <span className="text-xl md:text-2xl font-black text-white">
                    {trips.filter(t => t.isTour).length} Tours Activos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xs border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input 
                type="text"
                placeholder="Buscar destino, pueblo o tour..."
                value={tourSearchTerm}
                onChange={e => setTourSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-xs md:text-sm font-bold text-neutral-900 focus:border-purple-600 focus:outline-none"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setTourCategoryFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  tourCategoryFilter === 'all'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Todos los Viajes ({trips.length})
              </button>
              <button
                onClick={() => setTourCategoryFilter('tours')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  tourCategoryFilter === 'tours'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <Palmtree className="w-3.5 h-3.5" />
                Solo Tours Turísticos ({trips.filter(t => t.isTour).length})
              </button>
              <button
                onClick={() => setTourCategoryFilter('routes')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  tourCategoryFilter === 'routes'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Bus className="w-3.5 h-3.5" />
                Rutas Regulares ({trips.filter(t => !t.isTour).length})
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {(() => {
            const displayTrips = trips.filter(trip => {
              const isTour = Boolean(trip.isTour);
              const matchesSearch = !tourSearchTerm ||
                trip.destination.toLowerCase().includes(tourSearchTerm.toLowerCase()) ||
                trip.origin.toLowerCase().includes(tourSearchTerm.toLowerCase()) ||
                (trip.routeTitle && trip.routeTitle.toLowerCase().includes(tourSearchTerm.toLowerCase())) ||
                (trip.notes && trip.notes.toLowerCase().includes(tourSearchTerm.toLowerCase()));

              if (tourCategoryFilter === 'tours') return isTour && matchesSearch;
              if (tourCategoryFilter === 'routes') return !isTour && matchesSearch;
              return matchesSearch;
            });

            if (displayTrips.length === 0) {
              return (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-neutral-300 space-y-3">
                  <Palmtree className="w-12 h-12 text-neutral-300 mx-auto" />
                  <h4 className="text-base font-black text-neutral-800">No se encontraron tours con ese criterio</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Intenta con otra palabra de búsqueda o restablece los filtros para ver todos los viajes turísticos disponibles.
                  </p>
                  <button
                    onClick={() => { setTourSearchTerm(''); setTourCategoryFilter('all'); }}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-black cursor-pointer"
                  >
                    Ver Todos los Viajes
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {displayTrips.map(trip => {
                  const isTour = Boolean(trip.isTour);
                  const freeSeats = trip.seats.filter(s => s.status === 'available' && s.type !== 'driver' && s.type !== 'door' && s.type !== 'walkway').length;
                  const totalStandardSeats = trip.seats.filter(s => s.type === 'standard').length;
                  const assignedTemplate = seatTemplates.find(t => t.id === trip.layoutTemplateId)
                    || seatTemplates.find(t => t.totalSeats === totalStandardSeats)
                    || seatTemplates[0];

                  const ticketPrice = trip.basePrice || (isTour ? 650 : unitPrice);

                  return (
                    <div
                      key={trip.id}
                      className={`bg-white rounded-3xl p-6 border-2 transition-all shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md ${
                        isTour ? 'border-purple-200 hover:border-purple-400' : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Header Badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {isTour ? (
                              <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 flex items-center gap-1.5">
                                <Palmtree className="w-3.5 h-3.5 text-purple-600" /> Tour Turístico
                              </span>
                            ) : (
                              <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 flex items-center gap-1.5 font-mono">
                                <Bus className="w-3.5 h-3.5 text-orange-600" /> Ruta Troncal
                              </span>
                            )}

                            {trip.tourFolio && (
                              <span className="text-[11px] font-mono font-black text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
                                {trip.tourFolio}
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-xl md:text-2xl font-black text-neutral-900 block">
                              ${ticketPrice.toLocaleString()} MXN
                            </span>
                            <span className="text-[10px] text-neutral-500 font-bold block">
                              por persona / boleto
                            </span>
                          </div>
                        </div>

                        {/* Title & Route */}
                        <div>
                          <h3 className="text-lg md:text-xl font-black text-neutral-900 leading-snug">
                            {trip.routeTitle || `${trip.origin} ➔ ${trip.destination}`}
                          </h3>
                          <p className="text-xs text-neutral-600 font-bold mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{trip.origin}</span>
                            <span className="text-neutral-400">➔</span>
                            <span className="text-neutral-900 font-black">{trip.destination}</span>
                          </p>
                        </div>

                        {/* Schedule & Operational Info */}
                        <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase font-black block">Salida</span>
                            <p className="font-black text-neutral-900">{trip.date || travelDate}</p>
                            <p className="text-orange-600 font-bold flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3 text-orange-500" /> {trip.departureTime}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase font-black block">Retorno / Llegada</span>
                            <p className="font-black text-neutral-900">{trip.endDate || trip.date || travelDate}</p>
                            <p className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3 text-emerald-600" /> {trip.estimatedArrival}
                            </p>
                          </div>
                        </div>

                        {/* Plantilla de Diagrama de Asientos Seleccionada */}
                        <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4 text-purple-600 shrink-0" />
                            <div>
                              <span className="text-[10px] text-purple-700 font-black uppercase tracking-wider block">
                                Diagrama Oficial de Asientos
                              </span>
                              <span className="font-black text-neutral-900">
                                {assignedTemplate?.name || 'Plantilla de Asientos Estándar'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full shrink-0">
                            {freeSeats} de {totalStandardSeats} libres
                          </span>
                        </div>

                        {/* Driver & Unit info */}
                        <div className="flex items-center justify-between text-xs text-neutral-600">
                          <span>Unidad: <strong>{trip.unitNumber}</strong></span>
                          <span>Conductor: <strong>{trip.driverName}</strong></span>
                        </div>

                        {/* Itinerary Notes */}
                        {trip.notes && (
                          <p className="text-xs text-neutral-600 italic bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                            <span className="font-black not-italic text-neutral-700">Detalles: </span>
                            {trip.notes}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-neutral-100">
                        <button
                          onClick={() => handleSelectTrip(trip)}
                          className="w-full py-3 px-4 bg-neutral-900 hover:bg-purple-700 active:scale-[0.99] text-white rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                        >
                          <LayoutGrid className="w-4 h-4 text-purple-300" />
                          <span>Elegir Asientos en Diagrama y Reservar</span>
                          <Check className="w-4 h-4 text-emerald-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
