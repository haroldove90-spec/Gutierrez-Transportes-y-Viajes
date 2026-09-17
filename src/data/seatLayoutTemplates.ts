import { SeatLayoutTemplate, Seat, SeatCellType } from '../types';

export const DEFAULT_SEAT_TEMPLATES: SeatLayoutTemplate[] = [
  // 1. Mercedes-Benz Sprinter (20 Asientos)
  {
    id: 'template-sprinter-20',
    name: 'Mercedes-Benz Sprinter (20 Asientos)',
    vehicleType: 'van',
    rows: 7,
    cols: 4,
    totalSeats: 20,
    isDefault: true,
    description: 'Configuración estándar ejecutiva de 20 plazas con pasillo central y fila trasera de 4 asientos.',
    createdAt: '2026-09-01',
    cells: [
      // Fila 1 (Cabina delantera)
      { id: 'c-1-1', row: 1, col: 1, type: 'driver' },
      { id: 'c-1-2', row: 1, col: 2, type: 'door' },
      { id: 'c-1-3', row: 1, col: 3, type: 'walkway' },
      { id: 'c-1-4', row: 1, col: 4, type: 'seat', seatNumber: 1 },

      // Fila 2
      { id: 'c-2-1', row: 2, col: 1, type: 'seat', seatNumber: 2 },
      { id: 'c-2-2', row: 2, col: 2, type: 'seat', seatNumber: 3 },
      { id: 'c-2-3', row: 2, col: 3, type: 'walkway' },
      { id: 'c-2-4', row: 2, col: 4, type: 'seat', seatNumber: 4 },

      // Fila 3
      { id: 'c-3-1', row: 3, col: 1, type: 'seat', seatNumber: 5 },
      { id: 'c-3-2', row: 3, col: 2, type: 'seat', seatNumber: 6 },
      { id: 'c-3-3', row: 3, col: 3, type: 'walkway' },
      { id: 'c-3-4', row: 3, col: 4, type: 'seat', seatNumber: 7 },

      // Fila 4
      { id: 'c-4-1', row: 4, col: 1, type: 'seat', seatNumber: 8 },
      { id: 'c-4-2', row: 4, col: 2, type: 'seat', seatNumber: 9 },
      { id: 'c-4-3', row: 4, col: 3, type: 'walkway' },
      { id: 'c-4-4', row: 4, col: 4, type: 'seat', seatNumber: 10 },

      // Fila 5
      { id: 'c-5-1', row: 5, col: 1, type: 'seat', seatNumber: 11 },
      { id: 'c-5-2', row: 5, col: 2, type: 'seat', seatNumber: 12 },
      { id: 'c-5-3', row: 5, col: 3, type: 'walkway' },
      { id: 'c-5-4', row: 5, col: 4, type: 'seat', seatNumber: 13 },

      // Fila 6
      { id: 'c-6-1', row: 6, col: 1, type: 'seat', seatNumber: 14 },
      { id: 'c-6-2', row: 6, col: 2, type: 'seat', seatNumber: 15 },
      { id: 'c-6-3', row: 6, col: 3, type: 'walkway' },
      { id: 'c-6-4', row: 6, col: 4, type: 'seat', seatNumber: 16 },

      // Fila 7 (Posterior 4 plazas)
      { id: 'c-7-1', row: 7, col: 1, type: 'seat', seatNumber: 17 },
      { id: 'c-7-2', row: 7, col: 2, type: 'seat', seatNumber: 18 },
      { id: 'c-7-3', row: 7, col: 3, type: 'seat', seatNumber: 19 },
      { id: 'c-7-4', row: 7, col: 4, type: 'seat', seatNumber: 20 },
    ]
  },

  // 2. Toyota Hiace Gran Confort (14 Asientos)
  {
    id: 'template-hiace-14',
    name: 'Toyota Hiace Gran Confort (14 Asientos)',
    vehicleType: 'van',
    rows: 5,
    cols: 4,
    totalSeats: 14,
    isDefault: true,
    description: 'Configuración estándar para camionetas Toyota Hiace de 14 plazas con pasillo lateral.',
    createdAt: '2026-09-01',
    cells: [
      // Fila 1
      { id: 'h-1-1', row: 1, col: 1, type: 'driver' },
      { id: 'h-1-2', row: 1, col: 2, type: 'door' },
      { id: 'h-1-3', row: 1, col: 3, type: 'walkway' },
      { id: 'h-1-4', row: 1, col: 4, type: 'seat', seatNumber: 1 },

      // Fila 2
      { id: 'h-2-1', row: 2, col: 1, type: 'seat', seatNumber: 2 },
      { id: 'h-2-2', row: 2, col: 2, type: 'seat', seatNumber: 3 },
      { id: 'h-2-3', row: 2, col: 3, type: 'walkway' },
      { id: 'h-2-4', row: 2, col: 4, type: 'seat', seatNumber: 4 },

      // Fila 3
      { id: 'h-3-1', row: 3, col: 1, type: 'seat', seatNumber: 5 },
      { id: 'h-3-2', row: 3, col: 2, type: 'seat', seatNumber: 6 },
      { id: 'h-3-3', row: 3, col: 3, type: 'walkway' },
      { id: 'h-3-4', row: 3, col: 4, type: 'seat', seatNumber: 7 },

      // Fila 4
      { id: 'h-4-1', row: 4, col: 1, type: 'seat', seatNumber: 8 },
      { id: 'h-4-2', row: 4, col: 2, type: 'seat', seatNumber: 9 },
      { id: 'h-4-3', row: 4, col: 3, type: 'walkway' },
      { id: 'h-4-4', row: 4, col: 4, type: 'seat', seatNumber: 10 },

      // Fila 5 (Posterior)
      { id: 'h-5-1', row: 5, col: 1, type: 'seat', seatNumber: 11 },
      { id: 'h-5-2', row: 5, col: 2, type: 'seat', seatNumber: 12 },
      { id: 'h-5-3', row: 5, col: 3, type: 'seat', seatNumber: 13 },
      { id: 'h-5-4', row: 5, col: 4, type: 'seat', seatNumber: 14 },
    ]
  },

  // 3. Ford Transit / Urvan (15 Asientos)
  {
    id: 'template-transit-15',
    name: 'Ford Transit / Urvan (15 Asientos)',
    vehicleType: 'van',
    rows: 5,
    cols: 4,
    totalSeats: 15,
    isDefault: false,
    description: 'Diseño para vans medianas con asiento de copiloto doble y 15 asientos para pasajeros.',
    createdAt: '2026-09-01',
    cells: [
      // Fila 1
      { id: 't-1-1', row: 1, col: 1, type: 'driver' },
      { id: 't-1-2', row: 1, col: 2, type: 'walkway' },
      { id: 't-1-3', row: 1, col: 3, type: 'seat', seatNumber: 1 },
      { id: 't-1-4', row: 1, col: 4, type: 'seat', seatNumber: 2 },

      // Fila 2
      { id: 't-2-1', row: 2, col: 1, type: 'door' },
      { id: 't-2-2', row: 2, col: 2, type: 'walkway' },
      { id: 't-2-3', row: 2, col: 3, type: 'seat', seatNumber: 3 },
      { id: 't-2-4', row: 2, col: 4, type: 'seat', seatNumber: 4 },

      // Fila 3
      { id: 't-3-1', row: 3, col: 1, type: 'seat', seatNumber: 5 },
      { id: 't-3-2', row: 3, col: 2, type: 'seat', seatNumber: 6 },
      { id: 't-3-3', row: 3, col: 3, type: 'walkway' },
      { id: 't-3-4', row: 3, col: 4, type: 'seat', seatNumber: 7 },

      // Fila 4
      { id: 't-4-1', row: 4, col: 1, type: 'seat', seatNumber: 8 },
      { id: 't-4-2', row: 4, col: 2, type: 'seat', seatNumber: 9 },
      { id: 't-4-3', row: 4, col: 3, type: 'walkway' },
      { id: 't-4-4', row: 4, col: 4, type: 'seat', seatNumber: 10 },

      // Fila 5
      { id: 't-5-1', row: 5, col: 1, type: 'seat', seatNumber: 11 },
      { id: 't-5-2', row: 5, col: 2, type: 'seat', seatNumber: 12 },
      { id: 't-5-3', row: 5, col: 3, type: 'seat', seatNumber: 13 },
      { id: 't-5-4', row: 5, col: 4, type: 'seat', seatNumber: 14 },
    ]
  },

  // 4. Chevrolet Suburban / SUV VIP (7 Asientos)
  {
    id: 'template-suburban-7',
    name: 'Chevrolet Suburban / SUV VIP (7 Asientos)',
    vehicleType: 'camion',
    rows: 3,
    cols: 3,
    totalSeats: 7,
    isDefault: false,
    description: 'Configuración de camioneta SUV de lujo: Copiloto, Asientos de Capitán intermedios y bancada posterior.',
    createdAt: '2026-09-01',
    cells: [
      // Fila 1
      { id: 's-1-1', row: 1, col: 1, type: 'driver' },
      { id: 's-1-2', row: 1, col: 2, type: 'walkway' },
      { id: 's-1-3', row: 1, col: 3, type: 'seat', seatNumber: 1 },

      // Fila 2
      { id: 's-2-1', row: 2, col: 1, type: 'seat', seatNumber: 2 },
      { id: 's-2-2', row: 2, col: 2, type: 'walkway' },
      { id: 's-2-3', row: 2, col: 3, type: 'seat', seatNumber: 3 },

      // Fila 3
      { id: 's-3-1', row: 3, col: 1, type: 'seat', seatNumber: 4 },
      { id: 's-3-2', row: 3, col: 2, type: 'seat', seatNumber: 5 },
      { id: 's-3-3', row: 3, col: 3, type: 'seat', seatNumber: 6 },
    ]
  },

  // 5. Auto Sedán Ejecutivo (VW Jetta / Vento - 4 Asientos)
  {
    id: 'template-sedan-4',
    name: 'Auto Sedán Ejecutivo (4 Asientos)',
    vehicleType: 'auto',
    rows: 2,
    cols: 3,
    totalSeats: 4,
    isDefault: false,
    description: 'Diseño para automóviles compactos y ejecutivos (1 copiloto + 3 plazas traseras).',
    createdAt: '2026-09-01',
    cells: [
      // Fila 1
      { id: 'a-1-1', row: 1, col: 1, type: 'driver' },
      { id: 'a-1-2', row: 1, col: 2, type: 'walkway' },
      { id: 'a-1-3', row: 1, col: 3, type: 'seat', seatNumber: 1 },

      // Fila 2
      { id: 'a-2-1', row: 2, col: 1, type: 'seat', seatNumber: 2 },
      { id: 'a-2-2', row: 2, col: 2, type: 'seat', seatNumber: 3 },
      { id: 'a-2-3', row: 2, col: 3, type: 'seat', seatNumber: 4 },
    ]
  }
];

/**
 * Convierte una plantilla de diagrama en una lista de asientos `Seat[]` para un viaje programado,
 * preservando cualquier estado ya vendido/ocupado de asientos previos.
 */
export function buildSeatsFromTemplate(template: SeatLayoutTemplate, existingSeats: Seat[] = []): Seat[] {
  const existingMap = new Map<number, Seat>();
  existingSeats.forEach(s => {
    if (s.number > 0) {
      existingMap.set(s.number, s);
    }
  });

  const seats: Seat[] = [];

  template.cells.forEach(cell => {
    if (cell.type === 'empty') return;

    if (cell.type === 'driver') {
      seats.push({
        id: `s-drv-${cell.row}-${cell.col}`,
        number: 0,
        row: cell.row,
        col: cell.col,
        type: 'driver',
        status: 'sold'
      });
      return;
    }

    if (cell.type === 'door') {
      seats.push({
        id: `s-door-${cell.row}-${cell.col}`,
        number: 0,
        row: cell.row,
        col: cell.col,
        type: 'door',
        status: 'available'
      });
      return;
    }

    if (cell.type === 'walkway') {
      seats.push({
        id: `s-aisle-${cell.row}-${cell.col}`,
        number: 0,
        row: cell.row,
        col: cell.col,
        type: 'walkway',
        status: 'available'
      });
      return;
    }

    if (cell.type === 'seat') {
      const seatNum = cell.seatNumber || 1;
      const prev = existingMap.get(seatNum);

      seats.push({
        id: prev?.id || `seat-${seatNum}`,
        number: seatNum,
        row: cell.row,
        col: cell.col,
        type: 'standard',
        status: prev?.status || 'available',
        lockedBy: prev?.lockedBy,
        lockedUntil: prev?.lockedUntil,
        passengerName: prev?.passengerName,
        ticketId: prev?.ticketId,
      });
    }
  });

  return seats;
}

/**
 * Retorna la plantilla adecuada para un vehículo basándose en su ID de plantilla asignada o su capacidad.
 */
export function getTemplateForVehicle(
  templates: SeatLayoutTemplate[],
  templateId?: string,
  capacity?: number
): SeatLayoutTemplate {
  if (templateId) {
    const found = templates.find(t => t.id === templateId);
    if (found) return found;
  }

  if (capacity) {
    // Buscar la que coincida en capacidad
    const match = templates.find(t => t.totalSeats === capacity);
    if (match) return match;

    if (capacity <= 5) {
      const sedan = templates.find(t => t.id === 'template-sedan-4');
      if (sedan) return sedan;
    }
    if (capacity <= 8) {
      const suv = templates.find(t => t.id === 'template-suburban-7');
      if (suv) return suv;
    }
    if (capacity <= 16) {
      const hiace = templates.find(t => t.id === 'template-hiace-14');
      if (hiace) return hiace;
    }
    if (capacity >= 17) {
      const sprinter = templates.find(t => t.id === 'template-sprinter-20');
      if (sprinter) return sprinter;
    }
  }

  return templates[0] || DEFAULT_SEAT_TEMPLATES[0];
}
