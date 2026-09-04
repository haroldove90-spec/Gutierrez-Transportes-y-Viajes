import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Bus, 
  ShieldCheck, 
  Phone, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import jsPDF from 'jspdf';
import { OFFICIAL_PHONE, OFFICIAL_WHATSAPP, OFFICIAL_PRICING, ROUTE_STOPS } from '../../data/mockData';

interface ClientReportModalProps {
  onClose: () => void;
}

export const ClientReportModal: React.FC<ClientReportModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const reportText = `*GUTIÉRREZ TRANSPORTES Y VIAJES - 18 AÑOS DE EXPERIENCIA*
*REPORTE DE ACTUALIZACIONES Y CHECKLIST DE IMPLEMENTACIÓN*
--------------------------------------------------
Contacto Oficial: WhatsApp ${OFFICIAL_WHATSAPP} | Tel. ${OFFICIAL_PHONE}

✅ 1. MATRIZ OFICIAL DE TARIFAS Y SALIDAS DIARIAS (MÓDULOS: PASAJERO, SECRETARÍA, OPERACIONES):
• MANZANILLO:
  - A Guadalajara (GDL): Sencillo $370 | Redondo $720
  - A Tecomán: Sencillo $60
  - A Colima: Sencillo $120 | Redondo $210
  - Al CAS / Consulado Americano: Sencillo $450 | Redondo $850
  - Al Zoológico de GDL: Sencillo $500 | Redondo $920

• TECOMÁN:
  - A Colima: Sencillo $60
  - A Guadalajara (GDL): Sencillo $330
  - Al CAS / Consulado Americano: Sencillo $400 | Redondo $780

• COLIMA:
  - A Guadalajara (GDL): Sencillo $279 | Redondo $520
  - A Cd. Guzmán: Sencillo $130
  - Al CAS / Consulado Americano: Sencillo $340 | Redondo $650
  - Al Zoológico de GDL: Sencillo $400 | Redondo $780

• CD. GUZMÁN:
  - A Guadalajara (GDL): Sencillo $170 | Redondo $330
  - Al CAS / Consulado Americano: Sencillo $240 | Redondo $450

✅ 2. PUNTOS EXACTOS DE ABORDAJE CON REFERENCIAS FÍSICAS (MÓDULOS: PASAJERO, CHOFER, BOLETOS):
• GUADALAJARA:
  1. Minerva: Afuera del estacionamiento del Burger
  2. Plaza del Sol: Afuera de Súper Colchones
  3. Starbucks: Las Fuentes
  4. Enramada: Restaurante
  5. Cuatas: Gasolinera
  *(En Colima se realiza escala técnica obligatoria de 10 a 15 min)*

• MANZANILLO:
  1. Soriana Híper Manzanillo
  2. AutoZone Manzanillo

• INTERMEDIOS:
  - Kiosko Tecomán Centro (Jardín Principal / Farmacia Guadalajara)
  - Oficina Central Colima (Av. San Fernando frente a Plaza Sevilla)
  - Parada Cd. Guzmán (Glorieta Colón)

✅ 3. PAQUETES ESPECIALES ACTIVOS:
• 🇺🇸 CAS / Consulado Americano (Citas de visado directo y retorno)
• 🦁 Zoológico de Guadalajara (Paquete turístico familiar)
• 🚌 Troncal Salidas Diarias (Manzanillo-Tecomán-Colima-Cd.Guzmán-GDL)

✅ 4. BOLETO DIGITAL OFICIAL Y ESCÁNER QR:
• Identificador de Viaje Sencillo vs. Redondo
• Punto de abordaje con referencia física exacta
• Validación óptica inmediata sin papel
--------------------------------------------------`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const orange = [234, 88, 12]; // #ea580c
      const dark = [24, 24, 27];    // #18181b
      const gray = [113, 113, 122];

      // Header Banner
      doc.setFillColor(orange[0], orange[1], orange[2]);
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('GUTIÉRREZ TRANSPORTES Y VIAJES', 14, 12);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('18 AÑOS DE EXPERIENCIA • VIAJA CÓMODO, SEGURO Y PUNTUAL', 14, 18);
      doc.text('WhatsApp: 312 113 8193   |   Tel. Fijo: 312 312 4237', 14, 24);

      // Title
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('REPORTE EJECUTIVO DE ACTUALIZACIÓN DEL SISTEMA', 14, 38);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-MX')} • Sistema Operativo y Reservas`, 14, 43);

      let y = 52;

      // Section 1: Checklist de Funciones por Módulo
      doc.setFillColor(245, 245, 245);
      doc.rect(14, y - 5, 182, 8, 'F');
      doc.setTextColor(orange[0], orange[1], orange[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('1. CHECKLIST DE FUNCIONES IMPLEMENTADAS POR ROL / MÓDULO', 17, y);
      y += 9;

      const checklistItems = [
        { rol: 'Pasajero / Cliente (Web & App)', desc: 'Selector Sencillo/Redondo con descuento, filtro por paquetes (CAS y Zoológico), puntos de abordaje con referencias físicas, y emisión de boleto QR.' },
        { rol: 'Secretaría / Mostrador', desc: 'Venta rápida en ventanilla y WhatsApp con tarifas oficiales sincronizadas, selección de tipo de viaje y punto de abordaje físico.' },
        { rol: 'Conductor / Operador', desc: 'Manifiesto de pasajeros en ruta indicando parada física exacta (Burger, Súper Colchones, Soriana, etc.) y aviso de escala en Colima.' },
        { rol: 'Operaciones y Finanzas', desc: 'Control de ingresos por tipo de viaje, auditoría de folios y sincronización de capacidad de unidades Sprinter y Hiace.' },
        { rol: 'Boletos Digitales (QR)', desc: 'Desglose claro de boleto sencillo/redondo, teléfono oficial de emergencias y código QR de validación óptica inmediata.' }
      ];

      doc.setFontSize(8.5);
      checklistItems.forEach(item => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(dark[0], dark[1], dark[2]);
        doc.text(`• [${item.rol}]:`, 16, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(item.desc, 130);
        doc.text(lines, 64, y);
        y += Math.max(lines.length * 4.2, 5.5);
      });

      y += 3;

      // Section 2: Matriz Oficial de Tarifas
      doc.setFillColor(245, 245, 245);
      doc.rect(14, y - 5, 182, 8, 'F');
      doc.setTextColor(orange[0], orange[1], orange[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. MATRIZ OFICIAL DE TARIFAS DE SALIDAS DIARIAS', 17, y);
      y += 9;

      const rateGroups = [
        {
          origen: 'MANZANILLO',
          rutas: [
            'A Guadalajara (GDL): Sencillo $370 | Redondo $720',
            'A Tecomán: Sencillo $60',
            'A Colima: Sencillo $120 | Redondo $210',
            'Al CAS / Consulado Americano: Sencillo $450 | Redondo $850',
            'Al Zoológico de GDL: Sencillo $500 | Redondo $920'
          ]
        },
        {
          origen: 'TECOMÁN',
          rutas: [
            'A Colima: Sencillo $60',
            'A Guadalajara (GDL): Sencillo $330',
            'Al CAS / Consulado Americano: Sencillo $400 | Redondo $780'
          ]
        },
        {
          origen: 'COLIMA',
          rutas: [
            'A Guadalajara (GDL): Sencillo $279 | Redondo $520',
            'A Cd. Guzmán: Sencillo $130',
            'Al CAS / Consulado Americano: Sencillo $340 | Redondo $650',
            'Al Zoológico de GDL: Sencillo $400 | Redondo $780'
          ]
        },
        {
          origen: 'CD. GUZMÁN',
          rutas: [
            'A Guadalajara (GDL): Sencillo $170 | Redondo $330',
            'Al CAS / Consulado Americano: Sencillo $240 | Redondo $450'
          ]
        }
      ];

      doc.setFontSize(8.5);
      rateGroups.forEach(group => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(orange[0], orange[1], orange[2]);
        doc.text(`Origen: ${group.origen}`, 16, y);
        y += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(dark[0], dark[1], dark[2]);
        group.rutas.forEach(r => {
          doc.text(`  - ${r}`, 18, y);
          y += 4;
        });
        y += 1.5;
      });

      // Section 3: Puntos de Abordaje Exactos
      doc.setFillColor(245, 245, 245);
      doc.rect(14, y - 5, 182, 8, 'F');
      doc.setTextColor(orange[0], orange[1], orange[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('3. PUNTOS DE ABORDAJE CON REFERENCIAS FÍSICAS', 17, y);
      y += 8;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text('Puntos en Guadalajara:', 16, y);
      y += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.text('1. Minerva: Afuera del estacionamiento del Burger', 18, y); y += 4;
      doc.text('2. Plaza del Sol: Afuera de Súper Colchones', 18, y); y += 4;
      doc.text('3. Starbucks: Las Fuentes', 18, y); y += 4;
      doc.text('4. Enramada: Restaurante', 18, y); y += 4;
      doc.text('5. Cuatas: Gasolinera', 18, y); y += 4;
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(orange[0], orange[1], orange[2]);
      doc.text('*(En Colima se realiza escala técnica de 10 a 15 min)*', 18, y);
      y += 5.5;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text('Puntos en Manzanillo:', 16, y);
      y += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.text('1. Soriana Híper Manzanillo', 18, y); y += 4;
      doc.text('2. AutoZone Manzanillo', 18, y); y += 6;

      // Footer
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 280, 196, 280);
      doc.setFontSize(8);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.text('Gutiérrez Transportes y Viajes • Documento Ejecutivo Oficial de Entrega de Sistema', 14, 285);
      doc.text('Página 1 de 1', 180, 285);

      doc.save('Gutiérrez-Transportes-Reporte-Ejecutivo-Tarifas.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl sm:max-w-3xl my-auto bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-neutral-300 flex flex-col max-h-[92dvh]">
        
        {/* Header */}
        <div className="bg-orange-600 text-white px-5 py-4 flex items-center justify-between border-b-2 border-orange-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-black shadow-md shrink-0">
              <Bus className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider">
                Gutiérrez Transportes y Viajes
              </h3>
              <p className="text-xs text-orange-100 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> 18 Años de Experiencia • Reporte de Implementación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto no-scrollbar space-y-6 text-neutral-900">
          
          {/* Quick Action Banner */}
          <div className="bg-neutral-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-neutral-700">
            <div>
              <p className="text-xs uppercase font-black tracking-wider text-orange-400">Documento Listo para tu Cliente</p>
              <h4 className="text-base sm:text-lg font-black mt-0.5">Descarga el PDF o Copia el Resumen</h4>
              <p className="text-xs text-neutral-300 mt-1">Listo para imprimir, enviar por WhatsApp o adjuntar a propuesta.</p>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleCopyText}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-600"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-orange-400" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs sm:text-sm font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Generando...' : 'Descargar PDF'}</span>
              </button>
            </div>
          </div>

          {/* Section 1: Checklist by Module */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-black uppercase text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Checklist de Funciones por Módulo / Rol
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
              
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="font-black text-orange-600 uppercase text-xs">Módulo Pasajero (Web & App)</span>
                <p className="font-bold text-neutral-900">Reserva, Selección de Viaje y Boletos</p>
                <ul className="text-neutral-600 space-y-1 text-xs list-disc list-inside mt-1">
                  <li>Selector de Viaje Sencillo vs. Redondo con descuento automático.</li>
                  <li>Paquetes directos: 🇺🇸 CAS / Consulado y 🦁 Zoológico GDL.</li>
                  <li>Selección de parada con referencias físicas exactas.</li>
                  <li>Indicador de escala técnica de 10-15 min en Colima.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="font-black text-orange-600 uppercase text-xs">Módulo Secretaría / Mostrador</span>
                <p className="font-bold text-neutral-900">Ventanilla y Cotizaciones WhatsApp</p>
                <ul className="text-neutral-600 space-y-1 text-xs list-disc list-inside mt-1">
                  <li>Venta rápida en ventanilla con matriz de tarifas oficiales.</li>
                  <li>Emisión de boletos redondos con fecha de retorno.</li>
                  <li>Cotizador de renta para viajes especiales y eventos.</li>
                  <li>Sincronización en tiempo real de asientos disponibles.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="font-black text-orange-600 uppercase text-xs">Módulo Conductor / Operador</span>
                <p className="font-bold text-neutral-900">Manifiesto de Ruta y Escáner QR</p>
                <ul className="text-neutral-600 space-y-1 text-xs list-disc list-inside mt-1">
                  <li>Punto de abordaje físico visible por pasajero (Burger, Súper Colchones, etc.).</li>
                  <li>Escáner óptico QR con fondo naranja de alto contraste.</li>
                  <li>Aviso automático de escala de 10 a 15 min en Colima.</li>
                  <li>Validación de abordaje y registro de comprobantes de viaje.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="font-black text-orange-600 uppercase text-xs">Boletos y Contacto Oficial</span>
                <p className="font-bold text-neutral-900">Comprobante Digital y Soporte</p>
                <ul className="text-neutral-600 space-y-1 text-xs list-disc list-inside mt-1">
                  <li>Boleto digital con código QR para check-in sin papel.</li>
                  <li>WhatsApp oficial de atención: 312 113 8193.</li>
                  <li>Teléfono fijo oficial: 312 312 4237.</li>
                  <li>Distintivo oficial "18 Años de Experiencia".</li>
                </ul>
              </div>

            </div>
          </div>

          {/* Section 2: Matriz de Costos */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-black uppercase text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
              <DollarSign className="w-5 h-5 text-orange-600" /> Tarifas Oficiales de Salidas Diarias
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Manzanillo */}
              <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2">
                <p className="font-black text-orange-700 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Salidas desde Manzanillo
                </p>
                <div className="space-y-1 text-neutral-800">
                  <div className="flex justify-between font-bold border-b border-orange-100 pb-1">
                    <span>A Guadalajara (GDL)</span>
                    <span className="text-orange-700">S: $370 | R: $720</span>
                  </div>
                  <div className="flex justify-between font-bold border-b border-orange-100 pb-1">
                    <span>A Tecomán</span>
                    <span className="text-orange-700">S: $60</span>
                  </div>
                  <div className="flex justify-between font-bold border-b border-orange-100 pb-1">
                    <span>A Colima</span>
                    <span className="text-orange-700">S: $120 | R: $210</span>
                  </div>
                  <div className="flex justify-between font-bold border-b border-orange-100 pb-1">
                    <span>Al CAS / Consulado</span>
                    <span className="text-orange-700">S: $450 | R: $850</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Al Zoológico de GDL</span>
                    <span className="text-orange-700">S: $500 | R: $920</span>
                  </div>
                </div>
              </div>

              {/* Colima */}
              <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2">
                <p className="font-black text-orange-700 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Salidas desde Colima
                </p>
                <div className="space-y-1 text-neutral-800">
                  <div className="flex justify-between font-bold border-b border-orange-100 pb-1">
                    <span>A Guadalajara (GDL)</span>
                    <span className="text-orange-700">S: $279 | R: $520</span>
                  </div>
                  <div className="flex justify-between font-bold border-b border-orange-100 pb-1">
                    <span>A Cd. Guzmán</span>
                    <span className="text-orange-700">S: $130</span>
                  </div>
                  <div className="flex justify-between font-bold border-b border-orange-100 pb-1">
                    <span>Al CAS / Consulado</span>
                    <span className="text-orange-700">S: $340 | R: $650</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Al Zoológico de GDL</span>
                    <span className="text-orange-700">S: $400 | R: $780</span>
                  </div>
                </div>
              </div>

              {/* Tecomán */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <p className="font-black text-neutral-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Salidas desde Tecomán
                </p>
                <div className="space-y-1 text-neutral-800">
                  <div className="flex justify-between font-bold border-b border-neutral-200 pb-1">
                    <span>A Colima</span>
                    <span className="text-neutral-900">S: $60</span>
                  </div>
                  <div className="flex justify-between font-bold border-b border-neutral-200 pb-1">
                    <span>A Guadalajara (GDL)</span>
                    <span className="text-neutral-900">S: $330</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Al CAS / Consulado</span>
                    <span className="text-neutral-900">S: $400 | R: $780</span>
                  </div>
                </div>
              </div>

              {/* Cd. Guzmán */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <p className="font-black text-neutral-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Salidas desde Cd. Guzmán
                </p>
                <div className="space-y-1 text-neutral-800">
                  <div className="flex justify-between font-bold border-b border-neutral-200 pb-1">
                    <span>A Guadalajara (GDL)</span>
                    <span className="text-neutral-900">S: $170 | R: $330</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Al CAS / Consulado</span>
                    <span className="text-neutral-900">S: $240 | R: $450</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Puntos de Abordaje Oficiales */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-black uppercase text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
              <MapPin className="w-5 h-5 text-red-600" /> Puntos Oficiales de Abordaje con Referencias
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                <p className="font-black text-neutral-900 uppercase mb-1.5">Puntos en Guadalajara</p>
                <ol className="space-y-1 list-decimal list-inside text-neutral-700 font-medium">
                  <li><strong className="text-neutral-900">Minerva:</strong> Afuera del estacionamiento del Burger.</li>
                  <li><strong className="text-neutral-900">Plaza del Sol:</strong> Afuera de Súper Colchones.</li>
                  <li><strong className="text-neutral-900">Starbucks:</strong> Las Fuentes.</li>
                  <li><strong className="text-neutral-900">Enramada:</strong> Restaurante.</li>
                  <li><strong className="text-neutral-900">Cuatas:</strong> Gasolinera.</li>
                </ol>
                <p className="mt-2 text-[11px] font-bold text-orange-600 bg-orange-100/70 p-2 rounded-xl">
                  * Escala en Colima: Se hace escala técnica de 10 a 15 min.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                <p className="font-black text-neutral-900 uppercase mb-1.5">Puntos en Manzanillo</p>
                <ol className="space-y-1 list-decimal list-inside text-neutral-700 font-medium">
                  <li><strong className="text-neutral-900">Soriana Híper:</strong> Manzanillo.</li>
                  <li><strong className="text-neutral-900">AutoZone:</strong> Manzanillo.</li>
                </ol>
                <p className="mt-3 text-[11px] font-black text-neutral-800 uppercase">Destinos Especiales:</p>
                <ul className="text-neutral-700 space-y-0.5 mt-0.5">
                  <li>• CAS / Consulado Americano GDL (Visados).</li>
                  <li>• Zoológico Guadalajara (Huentitán).</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-600">
            <span>WhatsApp: <strong>{OFFICIAL_WHATSAPP}</strong></span>
            <span>•</span>
            <span>Tel. Fijo: <strong>{OFFICIAL_PHONE}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-black rounded-xl border border-neutral-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-orange-600" />}
              <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Generando PDF...' : 'Descargar PDF Oficial'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
