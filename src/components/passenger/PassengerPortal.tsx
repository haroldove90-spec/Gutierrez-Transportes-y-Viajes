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
  ExternalLink
} from 'lucide-react';
import { OFFICIAL_PRICING, OFFICIAL_PHONE, OFFICIAL_WHATSAPP, OFFICIAL_EXPERIENCE_YEARS } from '../../data/mockData';
import { TripSchedule, Seat, Booking, RoutePricing } from '../../types';
import { ClientReportModal } from '../modals/ClientReportModal';
import { RentalCatalog } from '../common/RentalCatalog';

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
    selectedTripId, 
    setSelectedTripId, 
    tempLockedSeats, 
    lockSeatsTemporarily, 
    releaseTemporarySeatLock, 
    createBooking,
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

  // Dynamic available destinations for chosen origin
  const availableDestinations = useMemo(() => {
    const list = OFFICIAL_PRICING
      .filter(p => p.origin.toLowerCase() === origin.toLowerCase())
      .map(p => p.destination);
    return list.length > 0 ? list : ['Guadalajara (GDL)', 'Colima'];
  }, [origin]);

  const handleOriginChange = (newOrigin: string) => {
    setOrigin(newOrigin);
    const validDests = OFFICIAL_PRICING
      .filter(p => p.origin.toLowerCase() === newOrigin.toLowerCase())
      .map(p => p.destination);
    if (validDests.length > 0 && !validDests.includes(destination)) {
      setDestination(validDests[0]);
    }
  };

  // Calculate pricing based on origin and destination
  const matchedPricing: RoutePricing = OFFICIAL_PRICING.find(
    p => p.origin.toLowerCase() === origin.toLowerCase() &&
         p.destination.toLowerCase() === destination.toLowerCase()
  ) || OFFICIAL_PRICING.find(
    p => (p.origin.toLowerCase().includes(origin.toLowerCase().split(' ')[0]) || origin.toLowerCase().includes(p.origin.toLowerCase())) &&
         (p.destination.toLowerCase().includes(destination.toLowerCase().split(' ')[0]) || destination.toLowerCase().includes(p.destination.toLowerCase()))
  ) || { origin, destination, singlePrice: selectedTrip.basePrice, roundTripPrice: selectedTrip.basePrice * 2 - 20, timeEstimate: '4 hrs', notes: 'Ruta directa troncal' };

  const unitPrice = (tripType === 'redondo' && matchedPricing.roundTripPrice) 
    ? matchedPricing.roundTripPrice 
    : matchedPricing.singlePrice;

  const parcelFee = hasParcel ? (origin.includes('Manzanillo') ? 250 : 150) : 0;
  const petFee = hasPet ? (origin.includes('Manzanillo') ? 250 : 150) : 0;
  const seatSubtotal = unitPrice * selectedSeatNums.length;
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
      origin,
      destination,
      boardingPoint: selectedBoardingStop,
      dropoffPoint: selectedDropoffStop,
      date: travelDate,
      departureTime: selectedTrip.departureTime,
      seatNumbers: selectedSeatNums,
      unitNumber: selectedTrip.vehicleId === 'veh-01' ? 'Unidad 04 (Sprinter)' : 'Unidad 07 (Sprinter)',
      totalAmount,
      paymentMethod,
      paymentStatus: 'paid',
      source: 'web',
      tripType,
      returnDate: tripType === 'redondo' ? returnDate : undefined,
      packageType: matchedPricing.packageType,
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
                      <span className="text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 font-mono">
                        {trip.unitNumber}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <h4 className="text-xl md:text-2xl font-black text-neutral-900">{trip.departureTime}</h4>
                        <span className="text-xs font-bold text-neutral-500">➔ {trip.estimatedArrival}</span>
                      </div>
                      <p className="text-xs text-neutral-600 font-medium mt-1">
                        Conductor: <strong>{trip.driverName}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl md:text-2xl font-black text-neutral-900">
                        ${unitPrice}
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
                <p className="text-xs md:text-sm text-neutral-300 font-medium">Salida: {selectedTrip.departureTime} | Fecha: {travelDate}</p>
              </div>
              <button
                onClick={() => setActiveTab('search')}
                className="text-xs md:text-sm bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl font-bold transition-colors shrink-0"
              >
                Cambiar Viaje
              </button>
            </div>
          </div>

          {/* Seat Map Canvas Container */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200">
            <div className="flex flex-wrap items-center justify-between border-b border-neutral-100 pb-3 mb-4 gap-2">
              <span className="text-sm md:text-base font-black text-neutral-900">
                {selectedTrip.vehicleId === 'veh-03' ? 'Toyota Hiace (14 Plazas)' : 'Mercedes-Benz Sprinter (19 Plazas)'}
              </span>
              <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-neutral-600">
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-neutral-100 border border-neutral-300"></span> Libre</span>
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-orange-600"></span> Tuyo</span>
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-neutral-300"></span> Ocupado</span>
              </div>
            </div>

            {/* Vehicle Front Windshield indicator */}
            <div className="w-32 mx-auto mb-4 bg-neutral-100 text-neutral-600 text-xs font-black text-center py-1 rounded-full uppercase tracking-widest border border-neutral-200">
              Frente / Chofer
            </div>

            {/* Grid of Seats */}
            <div className="max-w-[280px] mx-auto bg-neutral-50 p-4 rounded-3xl border-2 border-neutral-200 space-y-3">
              {[1, 2, 3, 4, 5, 6].map(rowNum => {
                const rowSeats = selectedTrip.seats.filter(s => s.row === rowNum);
                if (rowSeats.length === 0) return null;

                return (
                  <div key={rowNum} className="grid grid-cols-4 gap-2 justify-items-center">
                    {rowSeats.map(seat => {
                      if (seat.type === 'driver') {
                        return (
                          <div key={seat.id} className="w-12 h-12 rounded-xl bg-neutral-200 text-neutral-700 flex flex-col items-center justify-center text-[9px] font-black">
                            <Bus className="w-5 h-5 text-neutral-800" />
                            Chofer
                          </div>
                        );
                      }
                      if (seat.type === 'door') {
                        return (
                          <div key={seat.id} className="w-12 h-12 rounded-xl border-2 border-dashed border-neutral-300 text-neutral-500 flex items-center justify-center text-[9px] font-bold">
                            Puerta
                          </div>
                        );
                      }
                      if (seat.type === 'walkway') {
                        return <div key={seat.id} className="w-5 h-12"></div>;
                      }

                      const isSelected = selectedSeatNums.includes(seat.number);
                      const isSold = seat.status === 'sold' || (seat.status === 'locked' && !isSelected);

                      return (
                        <button
                          key={seat.id}
                          disabled={isSold}
                          onClick={() => toggleSeatSelection(seat)}
                          className={`w-12 h-12 rounded-xl font-black text-sm flex flex-col items-center justify-center transition-all shadow-sm cursor-pointer ${
                            isSelected
                              ? 'bg-orange-600 text-white scale-105 shadow-md ring-2 ring-orange-400'
                              : isSold
                              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                              : 'bg-white text-neutral-900 border-2 border-neutral-300 hover:border-orange-500'
                          }`}
                        >
                          <span className="leading-none">{seat.number}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Boarding Point & Contact Details Form */}
          <form onSubmit={handleCompleteCheckout} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <span className="text-sm md:text-base font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" /> Punto de Abordaje y Pasajero
            </span>

            {/* Boarding & Dropoff Stop Pickers with Exact Physical Landmarks */}
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
                      {stop.city}: {stop.name} — {stop.landmark}
                    </option>
                  ))}
                </select>
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
            <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-neutral-800">
              Mis Boletos Digitales Emitidos
            </h3>
            <span className="text-xs md:text-sm text-neutral-600 font-bold">{bookings.length} boletos</span>
          </div>

          <div className="space-y-3">
            {bookings.map(booking => (
              <div
                key={booking.id}
                onClick={() => onOpenTicket(booking)}
                className="bg-white rounded-3xl p-5 border-2 border-neutral-200 shadow-sm hover:border-orange-500 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-black text-orange-700 bg-orange-100 px-3 py-1 rounded-lg">
                      {booking.id}
                    </span>
                    <h4 className="text-base md:text-lg font-black text-neutral-900 mt-2">{booking.passengerName}</h4>
                    <p className="text-sm font-bold text-neutral-600">{booking.origin} ➔ {booking.destination}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg md:text-xl font-black text-neutral-900">${booking.totalAmount} MXN</span>
                    <p className={`text-xs font-black mt-0.5 ${
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
            ))}
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
            {OFFICIAL_PRICING.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border-2 border-neutral-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm md:text-base font-black text-neutral-900">
                    <span>{item.origin}</span>
                    <span className="text-orange-600">➔</span>
                    <span>{item.destination}</span>
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
                      <span className="text-xs font-black bg-neutral-900 text-white px-2 py-0.5 rounded-md uppercase">
                        {stop.city}
                      </span>
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
    </div>
  );
};
