import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PlusCircle, 
  FileText, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Lock, 
  ShieldCheck,
  Sparkles,
  Bus,
  ArrowRightLeft,
  MapPin,
  Phone,
  Car
} from 'lucide-react';
import { RentalQuote, RentalCar } from '../../types';
import { ROUTE_STOPS, OFFICIAL_PRICING, OFFICIAL_PHONE, OFFICIAL_WHATSAPP, OFFICIAL_EXPERIENCE_YEARS } from '../../data/mockData';
import { ClientReportModal } from '../modals/ClientReportModal';
import { RentalCatalog } from '../common/RentalCatalog';

interface SecretaryPortalProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTicket: (booking: any) => void;
}

export const SecretaryPortal: React.FC<SecretaryPortalProps> = ({ activeTab, setActiveTab, onOpenTicket }) => {
  const { 
    trips, 
    vehicles, 
    drivers,
    rentalCars,
    quotes, 
    createRentalQuote, 
    convertQuoteToReservation, 
    createBooking, 
    showNotification 
  } = useApp();

  // Quick Counter Sale Form State
  const [counterPassengerName, setCounterPassengerName] = useState('');
  const [counterPhone, setCounterPhone] = useState('');
  const [counterTripId, setCounterTripId] = useState(trips[0]?.id || '');
  const [counterSeatNum, setCounterSeatNum] = useState<number>(5);
  const [counterPaymentMethod, setCounterPaymentMethod] = useState<'cash_counter' | 'card' | 'spei'>('cash_counter');
  const [counterTripType, setCounterTripType] = useState<'sencillo' | 'redondo'>('sencillo');
  const [counterBoardingPoint, setCounterBoardingPoint] = useState<string>(
    'Soriana Híper Manzanillo (Soriana Híper Manzanillo)'
  );
  const [showClientReport, setShowClientReport] = useState<boolean>(false);

  // Dynamic Rental Quote Form State
  const [clientName, setClientName] = useState('Dra. Claudia Vaca (Congreso Médico)');
  const [clientPhone, setClientPhone] = useState('312-144-8822');
  const [clientEmail, setClientEmail] = useState('cvaca@hospitalmed.org');
  const [rentalOrigin, setRentalOrigin] = useState('Colima');
  const [rentalDestination, setRentalDestination] = useState('Guadalajara Expo / Cintermex');
  const [departureDate, setDepartureDate] = useState('2026-09-15 07:00');
  const [returnDate, setReturnDate] = useState('2026-09-17 19:00');
  const [paxCount, setPaxCount] = useState<number>(14);
  const [rentalDays, setRentalDays] = useState<number>(2);
  const [vehicleModel, setVehicleModel] = useState<string>('Toyota Hiace (14 Pasajeros)');
  const [includesDriver, setIncludesDriver] = useState<boolean>(true);
  const [assignedDriverForQuote, setAssignedDriverForQuote] = useState<string>(drivers[0]?.id || 'drv-01');
  const [baseRent, setBaseRent] = useState<number>(8000); // 2 days * 4000
  const [estFuel, setEstFuel] = useState<number>(2500);
  const [estTolls, setEstTolls] = useState<number>(1200);
  const [driverFee, setDriverFee] = useState<number>(1600);
  const [selectedUnitForReservation, setSelectedUnitForReservation] = useState<string>(vehicles[0]?.id || 'veh-sp20-01');
  const [selectedDriverForReservation, setSelectedDriverForReservation] = useState<string>(drivers[0]?.id || 'drv-01');

  const quoteSubtotal = baseRent;
  const quoteTotal = baseRent + estFuel + estTolls + (includesDriver ? driverFee : 0);
  const quoteAdvance = Math.round(quoteTotal * 0.3); // 30% advance

  // Auto-calculate base rent when vehicleModel, includesDriver, or rentalDays changes
  const updateVehicleSelection = (modelName: string, days: number = rentalDays, withDriver: boolean = includesDriver) => {
    setVehicleModel(modelName);
    const matched = rentalCars.find(c => c.name.toLowerCase() === modelName.toLowerCase() || modelName.toLowerCase().includes(c.name.toLowerCase()));
    if (matched) {
      setPaxCount(matched.capacity);
      const rate = withDriver ? matched.dailyRateWithDriver : matched.dailyRateWithoutDriver;
      setBaseRent(rate * days);
    }
  };

  const handleSelectCarForQuote = (car: RentalCar) => {
    setVehicleModel(car.name);
    setPaxCount(car.capacity);
    const rate = includesDriver ? car.dailyRateWithDriver : car.dailyRateWithoutDriver;
    setBaseRent(rate * rentalDays);
    setActiveTab('quotes');
    showNotification(`Unidad ${car.name} cargada al cotizador.`, 'info');
  };

  const handleCreateCounterSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterPassengerName.trim() || !counterPhone.trim()) {
      showNotification('Ingresa nombre y teléfono.', 'error');
      return;
    }

    const trip = trips.find(t => t.id === counterTripId) || trips[0];
    
    // Look up official pricing
    const matchedPricing = OFFICIAL_PRICING.find(
      p => (p.origin.toLowerCase().includes(trip.origin.toLowerCase().split(' ')[0]) || trip.origin.toLowerCase().includes(p.origin.toLowerCase())) &&
           (p.destination.toLowerCase().includes(trip.destination.toLowerCase().split(' ')[0]) || trip.destination.toLowerCase().includes(p.destination.toLowerCase()))
    );

    const price = (counterTripType === 'redondo' && matchedPricing?.roundTripPrice) 
      ? matchedPricing.roundTripPrice 
      : (matchedPricing?.singlePrice || trip.basePrice);

    const newBooking = createBooking({
      tripId: trip.id,
      passengerName: counterPassengerName,
      passengerPhone: counterPhone,
      passengerEmail: 'mostrador@transportesgutierrez.com',
      origin: trip.origin,
      destination: trip.destination,
      boardingPoint: counterBoardingPoint,
      dropoffPoint: trip.destination,
      date: trip.date,
      departureTime: trip.departureTime,
      seatNumbers: [counterSeatNum],
      unitNumber: trip.vehicleId === 'veh-01' ? 'Unidad 04 (Sprinter)' : 'Unidad 07 (Sprinter)',
      totalAmount: price,
      paymentMethod: counterPaymentMethod,
      paymentStatus: 'paid',
      source: 'counter',
      tripType: counterTripType,
      packageType: matchedPricing?.packageType,
      addons: {}
    });

    setCounterPassengerName('');
    setCounterPhone('');
    onOpenTicket(newBooking);
  };

  const handleGenerateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    createRentalQuote({
      clientName,
      clientPhone,
      clientEmail,
      origin: rentalOrigin,
      destination: rentalDestination,
      departureDate,
      returnDate,
      paxCount,
      vehicleModel,
      includesDriver,
      subtotal: quoteSubtotal,
      estimatedFuel: estFuel,
      estimatedTolls: estTolls,
      driverFee: includesDriver ? driverFee : 0,
      totalPrice: quoteTotal,
      advancePaymentRequired: quoteAdvance,
      advancePaid: 0,
      notes: 'Cotización emitida en mostrador.'
    });

    setActiveTab('crm');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-neutral-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Tab 1: Venta Rápida en Mostrador / WhatsApp */}
      {activeTab === 'counter' && (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          
          {/* Official Company Banner with Contact and Report button */}
          <div className="bg-neutral-900 text-white rounded-3xl p-5 md:p-6 border border-neutral-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black shadow-lg shrink-0">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base md:text-lg font-black uppercase">Gutiérrez Transportes y Viajes</h3>
                  <span className="bg-orange-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    {OFFICIAL_EXPERIENCE_YEARS} Años
                  </span>
                </div>
                <p className="text-xs text-neutral-300 font-medium mt-0.5">
                  WhatsApp: <strong className="text-orange-400">{OFFICIAL_WHATSAPP}</strong> • Fijo: <strong>{OFFICIAL_PHONE}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowClientReport(true)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs md:text-sm font-black rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>Reporte Cliente & Tarifas (PDF)</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
              <span className="text-sm md:text-base font-black text-orange-600 uppercase tracking-wider flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Venta en Ventanilla / WhatsApp
              </span>
              <span className="text-xs md:text-sm bg-neutral-900 text-white font-black px-3 py-1 rounded-full">
                Inventario Sincronizado
              </span>
            </div>

            {/* Trip Type Selector */}
            <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-2xl border border-neutral-200 w-fit">
              <button
                type="button"
                onClick={() => setCounterTripType('sencillo')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                  counterTripType === 'sencillo' ? 'bg-orange-600 text-white shadow-xs' : 'text-neutral-700'
                }`}
              >
                Viaje Sencillo
              </button>
              <button
                type="button"
                onClick={() => setCounterTripType('redondo')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  counterTripType === 'redondo' ? 'bg-orange-600 text-white shadow-xs' : 'text-neutral-700'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Viaje Redondo
              </button>
            </div>

            <form onSubmit={handleCreateCounterSale} className="space-y-4 text-sm">
              {/* Trip selection */}
              <div>
                <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Seleccionar Corrida</label>
                <select
                  value={counterTripId}
                  onChange={e => setCounterTripId(e.target.value)}
                  className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-sm md:text-base"
                >
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.departureTime} - {t.routeTitle} (${t.basePrice} MXN)
                    </option>
                  ))}
                </select>
              </div>

              {/* Boarding Stop Picker */}
              <div>
                <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-600" /> Punto de Abordaje Oficial
                </label>
                <select
                  value={counterBoardingPoint}
                  onChange={e => setCounterBoardingPoint(e.target.value)}
                  className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-xs md:text-sm"
                >
                  {ROUTE_STOPS.map(stop => (
                    <option key={stop.id} value={`${stop.city}: ${stop.name} (${stop.landmark})`}>
                      {stop.city} — {stop.name} [{stop.landmark}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Seat number quick select */}
              <div>
                <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Número de Asiento</label>
                <select
                  value={counterSeatNum}
                  onChange={e => setCounterSeatNum(Number(e.target.value))}
                  className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-sm md:text-base"
                >
                  {[1, 2, 5, 6, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19].map(num => (
                    <option key={num} value={num}>Asiento #{num}</option>
                  ))}
                </select>
              </div>

              {/* Passenger Info */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Nombre del Pasajero</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Roberto Guzmán"
                    value={counterPassengerName}
                    onChange={e => setCounterPassengerName(e.target.value)}
                    className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="312-314-8899"
                    value={counterPhone}
                    onChange={e => setCounterPhone(e.target.value)}
                    className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Método de Cobro</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setCounterPaymentMethod('cash_counter')}
                    className={`p-3 rounded-2xl border-2 text-xs md:text-sm font-black transition-all cursor-pointer ${
                      counterPaymentMethod === 'cash_counter' ? 'bg-orange-50 border-orange-600 text-orange-800' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                    }`}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setCounterPaymentMethod('card')}
                    className={`p-3 rounded-2xl border-2 text-xs md:text-sm font-black transition-all cursor-pointer ${
                      counterPaymentMethod === 'card' ? 'bg-orange-50 border-orange-600 text-orange-800' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                    }`}
                  >
                    💳 Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => setCounterPaymentMethod('spei')}
                    className={`p-3 rounded-2xl border-2 text-xs md:text-sm font-black transition-all cursor-pointer ${
                      counterPaymentMethod === 'spei' ? 'bg-orange-50 border-orange-600 text-orange-800' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                    }`}
                  >
                    📱 SPEI
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-sm md:text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShieldCheck className="w-5 h-5" /> Emitir Pasaje Inmediato
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Cotizador Dinámico de Rentas */}
      {activeTab === 'quotes' && (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-sm md:text-base font-black text-orange-600 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-5 h-5" /> Cotizador de Rentas Privadas y Turísticas
              </span>
              <span className="text-xs md:text-sm bg-neutral-100 font-bold px-3 py-1 rounded-full text-neutral-700">
                Flujo 2 (PDF)
              </span>
            </div>

            <form onSubmit={handleGenerateQuote} className="space-y-4 text-sm">
              <div className="space-y-3">
                <div>
                  <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Cliente / Razón Social</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-sm md:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Teléfono WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Destino</label>
                    <input
                      type="text"
                      required
                      value={rentalDestination}
                      onChange={e => setRentalDestination(e.target.value)}
                      className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle, Days & Driver Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">
                    Unidad Oficial de Renta
                  </label>
                  <select
                    value={vehicleModel}
                    onChange={e => updateVehicleSelection(e.target.value)}
                    className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-800 text-sm md:text-base"
                  >
                    {rentalCars.map(car => (
                      <option key={car.id} value={car.name}>
                        {car.name} — Sin chofer: ${car.dailyRateWithoutDriver.toLocaleString()} / día | Con chofer: ${car.dailyRateWithDriver.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">
                    Días de Renta
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={rentalDays}
                    onChange={e => {
                      const days = Math.max(1, Number(e.target.value));
                      setRentalDays(days);
                      updateVehicleSelection(vehicleModel, days, includesDriver);
                    }}
                    className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Driver Inclusion Toggle & Operator Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includesDriver}
                      onChange={e => {
                        const withDriver = e.target.checked;
                        setIncludesDriver(withDriver);
                        updateVehicleSelection(vehicleModel, rentalDays, withDriver);
                      }}
                      className="w-5 h-5 accent-orange-600 rounded"
                    />
                    <div>
                      <span className="text-xs md:text-sm font-black text-neutral-800 block">
                        Incluye Chofer Certificado
                      </span>
                      <span className="text-[11px] text-neutral-500 font-medium">
                        Operador federal capacitado de Gutiérrez Transportes
                      </span>
                    </div>
                  </label>
                </div>

                {includesDriver ? (
                  <div>
                    <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">
                      Operador Asignado (7 Choferes)
                    </label>
                    <select
                      value={assignedDriverForQuote}
                      onChange={e => setAssignedDriverForQuote(e.target.value)}
                      className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-800 text-sm md:text-base"
                    >
                      {drivers.map(drv => (
                        <option key={drv.id} value={drv.id}>
                          {drv.name} ({drv.status === 'available' ? 'Disponible' : 'En Ruta'})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-2xl text-xs text-amber-900 font-medium flex items-center gap-2">
                    <Car className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Renta libre sin chofer. Requiere INE, licencia y tarjeta para depósito.</span>
                  </div>
                )}
              </div>

              {/* Price Calculation Matrix */}
              <div className="bg-neutral-50 p-4 md:p-5 rounded-2xl border-2 border-neutral-200 space-y-2 text-xs md:text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Renta Base ({rentalDays} {rentalDays === 1 ? 'día' : 'días'} {includesDriver ? 'con chofer' : 'sin chofer'}):</span>
                  <span className="font-bold">${baseRent.toLocaleString('es-MX')} MXN</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Combustible Estimado:</span>
                  <span className="font-bold">${estFuel.toLocaleString('es-MX')} MXN</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Casetas de Peaje:</span>
                  <span className="font-bold">${estTolls.toLocaleString('es-MX')} MXN</span>
                </div>
                {includesDriver && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Viáticos de Operador:</span>
                    <span className="font-bold">${driverFee.toLocaleString('es-MX')} MXN</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-900 font-black border-t border-neutral-200 pt-2 text-sm md:text-base">
                  <span>Presupuesto Total:</span>
                  <span className="text-orange-600 text-lg md:text-xl font-black">${quoteTotal.toLocaleString('es-MX')} MXN</span>
                </div>
                <div className="flex justify-between text-neutral-500 text-xs">
                  <span>Anticipo Requerido (30%):</span>
                  <span className="font-bold text-neutral-800">${quoteAdvance.toLocaleString('es-MX')} MXN</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-sm md:text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" /> Generar Presupuesto y Guardar en CRM
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('rental_catalog')}
                  className="w-full py-4 bg-neutral-900 hover:bg-black text-white rounded-2xl font-black text-sm md:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Car className="w-5 h-5 text-orange-400" /> Ver Catálogo Visual y Tarifas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: CRM Pipeline & Seguimiento */}
      {activeTab === 'crm' && (
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900">CRM & Pipeline de Rentas</h3>
              <p className="text-xs md:text-sm text-neutral-500 font-bold">Alertas automáticas a 24h, 48h y 7 días</p>
            </div>
            <span className="text-xs md:text-sm font-black text-orange-700 bg-orange-100 px-3 py-1 rounded-xl">
              {quotes.length} cotizaciones
            </span>
          </div>

          <div className="space-y-3">
            {quotes.map(q => (
              <div
                key={q.id}
                className={`bg-white rounded-3xl p-5 border-2 shadow-xs space-y-3 ${
                  q.status === 'reserved' ? 'border-emerald-300 bg-emerald-50/10' : 'border-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {q.id}
                      </span>
                      <h4 className="text-base md:text-lg font-black text-neutral-900">{q.clientName}</h4>
                    </div>
                    <p className="text-xs md:text-sm text-neutral-500 mt-1">Destino: <strong className="text-neutral-900">{q.destination}</strong></p>
                  </div>

                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                    q.status === 'reserved' ? 'bg-emerald-100 text-emerald-800' :
                    q.status === 'followup_24h' ? 'bg-amber-100 text-amber-800' :
                    q.status === 'followup_48h' ? 'bg-purple-100 text-purple-800' : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {q.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-neutral-50 p-3 rounded-2xl text-xs md:text-sm">
                  <div>
                    <span className="text-neutral-400 uppercase font-bold text-[10px] md:text-xs">Monto</span>
                    <p className="font-black text-neutral-900">${q.totalPrice}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 uppercase font-bold text-[10px] md:text-xs">Anticipo</span>
                    <p className="font-black text-emerald-700">${q.advancePaid > 0 ? q.advancePaid : q.advancePaymentRequired}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 uppercase font-bold text-[10px] md:text-xs">Saldo</span>
                    <p className="font-black text-orange-600">${q.balanceRemaining}</p>
                  </div>
                </div>

                {q.status !== 'reserved' ? (
                  <div className="pt-3 border-t border-neutral-100 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="font-bold text-neutral-600 block mb-1">Unidad a Bloquear:</label>
                        <select
                          value={selectedUnitForReservation}
                          onChange={e => setSelectedUnitForReservation(e.target.value)}
                          className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-800"
                        >
                          {vehicles.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.unitNumber} ({v.model} - {v.capacity}p)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-neutral-600 block mb-1">Operador a Asignar (7 Choferes):</label>
                        <select
                          value={selectedDriverForReservation}
                          onChange={e => setSelectedDriverForReservation(e.target.value)}
                          className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-800"
                        >
                          {drivers.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.status === 'available' ? 'Disponible' : 'En Ruta'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => convertQuoteToReservation(q.id, selectedUnitForReservation, selectedDriverForReservation)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Convertir en Reserva (Bloquear Flota y Operador)
                    </button>
                  </div>
                ) : (
                  <div className="pt-1 text-xs md:text-sm text-emerald-800 font-black flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> Unidad y Chofer bloqueados contra colisiones en calendario.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Calendario de Disponibilidad */}
      {activeTab === 'calendar' && (
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" /> Disponibilidad Central de Unidades
            </h3>
            <p className="text-sm text-neutral-600">
              Consulta en cuadrícula visual qué unidades están libres, apartadas o en viaje.
            </p>

            <div className="space-y-3 pt-2">
              {vehicles.map(v => (
                <div key={v.id} className="p-4 rounded-2xl bg-neutral-50 border-2 border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm md:text-base text-neutral-900">{v.unitNumber}</span>
                      <span className="text-xs text-neutral-500 font-mono font-bold">({v.plate})</span>
                    </div>
                    <p className="text-xs md:text-sm text-neutral-600">{v.model} • Capacidad: {v.capacity} Pax</p>
                  </div>
                  <span className={`text-xs font-black px-3 py-1.5 rounded-full uppercase ${
                    v.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                    v.status === 'in_route' ? 'bg-orange-100 text-orange-800' :
                    v.status === 'reserved_rent' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {v.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Catálogo Oficial de Autos de Renta (Con y Sin Chofer) */}
      {activeTab === 'rental_catalog' && (
        <RentalCatalog onSelectCarForQuote={handleSelectCarForQuote} />
      )}

      {/* Client Implementation & Rates PDF Report Modal */}
      {showClientReport && (
        <ClientReportModal onClose={() => setShowClientReport(false)} />
      )}
    </div>
  );
};
