import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SeatLayoutTemplate, SeatLayoutCell, SeatCellType, Vehicle } from '../../types';
import { SeatDiagramViewer } from '../common/SeatDiagramViewer';
import { 
  LayoutGrid, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  Car, 
  Bus, 
  Layers, 
  RefreshCw, 
  Sliders, 
  Eye, 
  Info,
  Sparkles,
  Users
} from 'lucide-react';

export const SeatLayoutBuilder: React.FC = () => {
  const { 
    seatTemplates, 
    saveSeatTemplate, 
    deleteSeatTemplate, 
    vehicles, 
    assignLayoutToVehicle,
    trips 
  } = useApp();

  // Selected tab in this module
  const [activeSubTab, setActiveSubTab] = useState<'templates' | 'assign' | 'live_monitor'>('templates');

  // Selected template for editing or viewing
  const [editingTemplate, setEditingTemplate] = useState<SeatLayoutTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Editor Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'van' | 'auto' | 'camion' | 'autobus'>('van');
  const [formRows, setFormRows] = useState(6);
  const [formCols, setFormCols] = useState(4);
  const [formDesc, setFormDesc] = useState('');
  const [formCells, setFormCells] = useState<SeatLayoutCell[]>([]);
  const [selectedTool, setSelectedTool] = useState<SeatCellType>('seat');

  // Live Monitor Trip Selection
  const [selectedTripIdForMonitor, setSelectedTripIdForMonitor] = useState<string>(
    trips.length > 0 ? trips[0].id : ''
  );

  // Helper to initialize blank cells for rows and cols
  const generateBlankCells = (rows: number, cols: number): SeatLayoutCell[] => {
    const cells: SeatLayoutCell[] = [];
    let seatCount = 1;

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        if (r === 1 && c === 1) {
          cells.push({ id: `c-${r}-${c}`, row: r, col: c, type: 'driver' });
        } else if (r === 1 && c === 2) {
          cells.push({ id: `c-${r}-${c}`, row: r, col: c, type: 'door' });
        } else if (c === 3 && r < rows) {
          cells.push({ id: `c-${r}-${c}`, row: r, col: c, type: 'walkway' });
        } else {
          cells.push({ id: `c-${r}-${c}`, row: r, col: c, type: 'seat', seatNumber: seatCount++ });
        }
      }
    }
    return cells;
  };

  // Open editor with new template
  const handleOpenNew = () => {
    setFormName('Nuevo Diagrama de Van / Auto');
    setFormType('van');
    setFormRows(6);
    setFormCols(4);
    setFormDesc('Configuración personalizada de asientos');
    setFormCells(generateBlankCells(6, 4));
    setIsCreatingNew(true);
    setEditingTemplate(null);
  };

  // Open editor with existing template
  const handleOpenEdit = (template: SeatLayoutTemplate) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormType(template.vehicleType);
    setFormRows(template.rows);
    setFormCols(template.cols);
    setFormDesc(template.description || '');
    setFormCells([...template.cells]);
    setIsCreatingNew(false);
  };

  // Clone existing template
  const handleClone = (template: SeatLayoutTemplate) => {
    const cloned: SeatLayoutTemplate = {
      ...template,
      id: `template-clone-${Date.now()}`,
      name: `${template.name} (Copia)`,
      isDefault: false,
      createdAt: new Date().toISOString().substring(0, 10),
      cells: template.cells.map(c => ({ ...c }))
    };
    saveSeatTemplate(cloned);
  };

  // Update rows or cols in editor
  const handleResizeGrid = (newRows: number, newCols: number) => {
    if (newRows < 1 || newRows > 12 || newCols < 1 || newCols > 6) return;
    setFormRows(newRows);
    setFormCols(newCols);

    // Rebuild or preserve cells
    const cellMap = new Map<string, SeatLayoutCell>();
    formCells.forEach(c => cellMap.set(`${c.row}-${c.col}`, c));

    const updatedCells: SeatLayoutCell[] = [];
    let seatNumber = 1;

    for (let r = 1; r <= newRows; r++) {
      for (let c = 1; c <= newCols; c++) {
        const existing = cellMap.get(`${r}-${c}`);
        if (existing) {
          if (existing.type === 'seat') {
            updatedCells.push({ ...existing, seatNumber: seatNumber++ });
          } else {
            updatedCells.push(existing);
          }
        } else {
          // Default fallback cell
          updatedCells.push({
            id: `c-${r}-${c}`,
            row: r,
            col: c,
            type: 'seat',
            seatNumber: seatNumber++
          });
        }
      }
    }

    setFormCells(updatedCells);
  };

  // Click on a cell in builder
  const handleCellClick = (row: number, col: number) => {
    setFormCells(prev => {
      const next = prev.map(c => {
        if (c.row === row && c.col === col) {
          return {
            ...c,
            type: selectedTool,
            seatNumber: selectedTool === 'seat' ? (c.seatNumber || 1) : undefined
          };
        }
        return c;
      });

      // Renumber seats sequentially
      let sNum = 1;
      return next.map(c => {
        if (c.type === 'seat') {
          return { ...c, seatNumber: sNum++ };
        }
        return { ...c, seatNumber: undefined };
      });
    });
  };

  // Renumber all seats sequentially
  const handleRenumberSeats = () => {
    setFormCells(prev => {
      let sNum = 1;
      return prev.map(c => {
        if (c.type === 'seat') {
          return { ...c, seatNumber: sNum++ };
        }
        return { ...c, seatNumber: undefined };
      });
    });
  };

  // Save current template
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const totalSeats = formCells.filter(c => c.type === 'seat').length;

    saveSeatTemplate({
      id: editingTemplate ? editingTemplate.id : undefined,
      name: formName.trim(),
      vehicleType: formType,
      rows: formRows,
      cols: formCols,
      cells: formCells,
      totalSeats,
      description: formDesc.trim(),
      isDefault: editingTemplate ? editingTemplate.isDefault : false
    });

    setEditingTemplate(null);
    setIsCreatingNew(false);
  };

  const selectedTrip = trips.find(t => t.id === selectedTripIdForMonitor) || trips[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-neutral-700/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/30 border border-orange-500/40 text-orange-400 text-xs font-black uppercase tracking-wider mb-2">
              <LayoutGrid className="w-3.5 h-3.5" /> Módulo de Diagramas de Flotilla
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Configurador de Diagramas y Asientos
            </h2>
            <p className="text-neutral-300 text-sm mt-1 max-w-2xl font-medium">
              Diseña la distribución gráfica de asientos para camionetas y autos (Sprinter, Hiace, Suburban, Sedanes), asigna diagramas a cada unidad y monitorea en tiempo real los lugares disponibles (🟢 Verde) y ocupados (🔴 Rojo).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleOpenNew}
              className="px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-orange-950/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Crear Nuevo Diagrama
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-neutral-700/60 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('templates')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'templates'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <Layers className="w-4 h-4" /> Plantillas de Diagramas ({seatTemplates.length})
          </button>
          <button
            onClick={() => setActiveSubTab('assign')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'assign'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <Car className="w-4 h-4" /> Asignar a Vehículos ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveSubTab('live_monitor')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'live_monitor'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <Users className="w-4 h-4" /> Monitoreo de Pasajeros en Vivo
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: TEMPLATES CATALOG & BUILDER */}
      {activeSubTab === 'templates' && !isCreatingNew && !editingTemplate && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {seatTemplates.map(template => {
              const assignedCount = vehicles.filter(v => v.layoutTemplateId === template.id).length;

              return (
                <div 
                  key={template.id} 
                  className="bg-white rounded-3xl p-5 border-2 border-neutral-200 shadow-sm hover:border-orange-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-neutral-100 text-neutral-700 mb-1 border border-neutral-200">
                          {template.vehicleType.toUpperCase()} • {template.rows} Filas × {template.cols} Columnas
                        </span>
                        <h3 className="text-base font-black text-neutral-900 leading-tight">
                          {template.name}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-orange-50 text-orange-700 font-black text-xs border border-orange-200 shrink-0">
                        {template.totalSeats} Asientos
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 line-clamp-2 mb-4">
                      {template.description || 'Sin descripción adicional.'}
                    </p>

                    {/* Small layout visual preview */}
                    <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 mb-4 flex justify-center">
                      <div 
                        className="grid gap-1 max-w-[150px]"
                        style={{ gridTemplateColumns: `repeat(${template.cols}, minmax(0, 1fr))` }}
                      >
                        {template.cells.slice(0, 24).map(c => (
                          <div 
                            key={c.id} 
                            className={`w-6 h-6 rounded-md text-[8px] font-black flex items-center justify-center ${
                              c.type === 'seat'
                                ? 'bg-emerald-500 text-white'
                                : c.type === 'driver'
                                ? 'bg-neutral-800 text-white'
                                : c.type === 'door'
                                ? 'border border-dashed border-neutral-400 text-neutral-500'
                                : c.type === 'walkway'
                                ? 'bg-neutral-200'
                                : 'opacity-0'
                            }`}
                          >
                            {c.type === 'seat' ? c.seatNumber : c.type === 'driver' ? '☸' : ''}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assigned Vehicles badge */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-bold mb-4">
                      <Car className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{assignedCount} vehículo(s) usando este diagrama</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-100">
                    <button
                      onClick={() => handleOpenEdit(template)}
                      className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-neutral-600" /> Modificar
                    </button>
                    <button
                      onClick={() => handleClone(template)}
                      className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Duplicar para crear otra variante"
                    >
                      <Copy className="w-3.5 h-3.5 text-neutral-600" /> Duplicar
                    </button>
                    {!template.isDefault && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la plantilla "${template.name}"?`)) {
                            deleteSeatTemplate(template.id);
                          }
                        }}
                        className="p-2 rounded-xl hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-all cursor-pointer"
                        title="Eliminar plantilla personalizada"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDITOR MODAL / CANVAS (When creating or editing) */}
      {(isCreatingNew || editingTemplate) && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-orange-400 shadow-xl space-y-6 animate-fadeIn">
          {/* Editor Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-neutral-900">
                  {isCreatingNew ? 'Diseñador de Nuevo Diagrama' : `Editando: ${editingTemplate?.name}`}
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  Haz clic en las celdas de la van para configurar el chofer, asientos, puerta y pasillo.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCreatingNew(false);
                setEditingTemplate(null);
              }}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-6">
            {/* Form Fields: Name, Category, Grid Size */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-neutral-700 uppercase mb-1">
                  Nombre del Diagrama / Modelo
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ej: Mercedes Sprinter VIP 20 Pax"
                  required
                  className="w-full p-2.5 bg-white border-2 border-neutral-200 rounded-xl font-bold text-sm text-neutral-900 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase mb-1">
                  Categoría de Vehículo
                </label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as any)}
                  className="w-full p-2.5 bg-white border-2 border-neutral-200 rounded-xl font-bold text-sm text-neutral-900 focus:border-orange-500"
                >
                  <option value="van">Camioneta Van (Hiace / Sprinter)</option>
                  <option value="camion">Camioneta SUV (Suburban / Tahoe)</option>
                  <option value="auto">Auto Sedán (Jetta / Vento / Versa)</option>
                  <option value="autobus">Autobús Turístico / Irizar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase mb-1">
                  Dimensiones de Cuadrícula
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-neutral-400 block font-black">FILAS</span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={formRows}
                      onChange={e => handleResizeGrid(Number(e.target.value), formCols)}
                      className="w-full p-1.5 text-center bg-white border border-neutral-300 rounded-lg font-bold text-xs"
                    />
                  </div>
                  <span className="text-neutral-400 font-bold mt-3">×</span>
                  <div className="flex-1">
                    <span className="text-[10px] text-neutral-400 block font-black">COLUMNAS</span>
                    <input
                      type="number"
                      min={2}
                      max={6}
                      value={formCols}
                      onChange={e => handleResizeGrid(formRows, Number(e.target.value))}
                      className="w-full p-1.5 text-center bg-white border border-neutral-300 rounded-lg font-bold text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cell Tool Selector (Palette) */}
            <div className="p-4 bg-orange-50/60 rounded-2xl border-2 border-orange-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" /> Herramienta de Pincel (Selecciona para pintar celdas):
                </span>
                <button
                  type="button"
                  onClick={handleRenumberSeats}
                  className="px-3 py-1 bg-white hover:bg-orange-100 text-orange-700 border border-orange-300 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Renumerar Asientos (1, 2, 3...)
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTool('seat')}
                  className={`p-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all border-2 ${
                    selectedTool === 'seat'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-emerald-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-md bg-emerald-500 border border-emerald-600 flex items-center justify-center text-[10px] text-white font-bold">1</span>
                  Asiento Pasajero
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTool('driver')}
                  className={`p-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all border-2 ${
                    selectedTool === 'driver'
                      ? 'bg-neutral-900 text-white border-black shadow-md ring-2 ring-neutral-400'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-500'
                  }`}
                >
                  <span>☸</span>
                  Chofer / Volante
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTool('door')}
                  className={`p-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all border-2 ${
                    selectedTool === 'door'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-300'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-amber-400'
                  }`}
                >
                  <span>🚪</span>
                  Puerta de Entrada
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTool('walkway')}
                  className={`p-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all border-2 ${
                    selectedTool === 'walkway'
                      ? 'bg-sky-700 text-white border-sky-800 shadow-md ring-2 ring-sky-300'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-sky-400'
                  }`}
                >
                  <span>║</span>
                  Pasillo Central
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTool('empty')}
                  className={`p-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all border-2 ${
                    selectedTool === 'empty'
                      ? 'bg-neutral-400 text-white border-neutral-500 shadow-md ring-2 ring-neutral-300'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <span>✕</span>
                  Espacio Vacío
                </button>
              </div>
            </div>

            {/* Interactive Vehicle Diagram Canvas */}
            <div className="relative max-w-md mx-auto bg-neutral-100 p-6 rounded-[3rem] border-4 border-neutral-400 shadow-inner">
              {/* Front Windshield Indicator */}
              <div className="w-44 mx-auto mb-4 bg-sky-200 border-2 border-sky-400 text-sky-950 text-xs font-black text-center py-2 rounded-2xl shadow-xs uppercase tracking-wider flex items-center justify-center gap-2">
                <span>PARABRISAS FRONTAL</span>
              </div>

              {/* Grid of editable cells */}
              <div className="bg-white p-4 rounded-3xl border border-neutral-200 shadow-sm space-y-2.5">
                {Array.from({ length: formRows }, (_, rIndex) => {
                  const r = rIndex + 1;
                  return (
                    <div
                      key={r}
                      className="grid gap-2 justify-center items-center"
                      style={{ gridTemplateColumns: `repeat(${formCols}, minmax(0, 1fr))` }}
                    >
                      {Array.from({ length: formCols }, (_, cIndex) => {
                        const c = cIndex + 1;
                        const cell = formCells.find(item => item.row === r && item.col === c);
                        const cellType = cell?.type || 'empty';

                        return (
                          <button
                            key={`${r}-${c}`}
                            type="button"
                            onClick={() => handleCellClick(r, c)}
                            className={`w-12 h-12 rounded-2xl font-black text-xs flex flex-col items-center justify-center transition-all shadow-xs cursor-pointer border-2 hover:scale-105 active:scale-95 ${
                              cellType === 'seat'
                                ? 'bg-emerald-500 text-white border-emerald-600'
                                : cellType === 'driver'
                                ? 'bg-neutral-900 text-white border-neutral-800'
                                : cellType === 'door'
                                ? 'bg-amber-100 text-amber-800 border-dashed border-amber-400'
                                : cellType === 'walkway'
                                ? 'bg-sky-100 text-sky-700 border-sky-300'
                                : 'bg-neutral-50 text-neutral-300 border-neutral-200 hover:bg-neutral-100'
                            }`}
                            title={`Fila ${r}, Columna ${c}: ${cellType}. Haz clic para pintar.`}
                          >
                            {cellType === 'seat' && (
                              <>
                                <span className="text-sm leading-none">{cell?.seatNumber}</span>
                                <span className="text-[8px] opacity-80">Asiento</span>
                              </>
                            )}
                            {cellType === 'driver' && (
                              <>
                                <span className="text-base leading-none">☸</span>
                                <span className="text-[7px]">CHOFER</span>
                              </>
                            )}
                            {cellType === 'door' && (
                              <>
                                <span className="text-sm leading-none">🚪</span>
                                <span className="text-[7px]">PUERTA</span>
                              </>
                            )}
                            {cellType === 'walkway' && (
                              <span className="text-[10px] font-bold text-sky-600">PASILLO</span>
                            )}
                            {cellType === 'empty' && (
                              <span className="text-neutral-300 text-xs">·</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Rear Bumper Indicator */}
              <div className="w-32 mx-auto mt-4 bg-neutral-200 text-neutral-600 text-[10px] font-black text-center py-1 rounded-full uppercase tracking-widest border border-neutral-300">
                PARTE TRASERA
              </div>
            </div>

            {/* Total Seats Counter & Submit Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-600">Total de Asientos de Pasajero:</span>
                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-base border border-emerald-300">
                  {formCells.filter(c => c.type === 'seat').length} Pasajeros
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 font-bold text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-orange-950/20 cursor-pointer transition-all hover:scale-105"
                >
                  <Save className="w-4 h-4" /> Guardar Diagrama de Asientos
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 2: ASSIGN DIAGRAMS TO FLEET VEHICLES */}
      {activeSubTab === 'assign' && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-neutral-900">
              Asignación de Diagramas a la Flotilla
            </h3>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Configura qué plantilla de asientos le corresponde a cada van, camioneta o automóvil. Cuando se programe un viaje con esa unidad, se cargará su diagrama automáticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map(vehicle => {
              const currentTemplate = seatTemplates.find(t => t.id === vehicle.layoutTemplateId) 
                || seatTemplates.find(t => t.totalSeats === vehicle.capacity)
                || seatTemplates[0];

              return (
                <div 
                  key={vehicle.id} 
                  className="p-4 rounded-2xl border-2 border-neutral-200 hover:border-orange-300 transition-all bg-neutral-50/50 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-neutral-900 text-base">{vehicle.unitNumber}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800">
                          {vehicle.plate}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-neutral-600 mt-0.5">{vehicle.model}</p>
                      <p className="text-xs text-neutral-400 font-medium">
                        Capacidad nominal: <strong>{vehicle.capacity} pasajeros</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">Diagrama Actual</span>
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-black text-xs border border-emerald-200 mt-1">
                        {currentTemplate?.name || 'No asignado'}
                      </span>
                    </div>
                  </div>

                  {/* Selector to change diagram */}
                  <div className="pt-3 border-t border-neutral-200/80">
                    <label className="block text-[11px] font-black text-neutral-700 uppercase mb-1">
                      Asignar Diagrama de Asientos:
                    </label>
                    <select
                      value={vehicle.layoutTemplateId || currentTemplate?.id || ''}
                      onChange={e => assignLayoutToVehicle(vehicle.id, e.target.value)}
                      className="w-full p-2.5 bg-white border-2 border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:border-orange-500 cursor-pointer"
                    >
                      {seatTemplates.map(tmpl => (
                        <option key={tmpl.id} value={tmpl.id}>
                          {tmpl.name} ({tmpl.totalSeats} Asientos)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LIVE OCCUPATION MONITOR */}
      {activeSubTab === 'live_monitor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" /> Monitor en Tiempo Real de Ocupación
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  Supervisa la ocupación en vivo de cada salida programada: Asientos disponibles (🟢 Verde) y vendidos (🔴 Rojo).
                </p>
              </div>

              {/* Trip Selector */}
              <div className="min-w-[280px]">
                <label className="block text-[10px] font-black text-neutral-500 uppercase mb-1">
                  Seleccionar Salida / Corrida:
                </label>
                <select
                  value={selectedTrip?.id || ''}
                  onChange={e => setSelectedTripIdForMonitor(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-xs text-neutral-900 focus:border-orange-500"
                >
                  {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>
                      {trip.origin} ➔ {trip.destination} ({trip.date} • {trip.departureTime})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedTrip && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-neutral-100">
                {/* Visual Seat Diagram */}
                <div className="lg:col-span-2">
                  <SeatDiagramViewer
                    seats={selectedTrip.seats}
                    isAdminView={true}
                    interactive={false}
                    title={`Diagrama del Viaje: ${selectedTrip.origin} ➔ ${selectedTrip.destination}`}
                    subtitle={`Unidad: ${vehicles.find(v => v.id === selectedTrip.vehicleId)?.unitNumber || 'Van'} • Fecha: ${selectedTrip.date} ${selectedTrip.departureTime}`}
                  />
                </div>

                {/* Sold / Occupied Seats List */}
                <div className="bg-neutral-50 rounded-3xl p-5 border border-neutral-200 space-y-4">
                  <h4 className="text-sm font-black text-neutral-900 flex items-center justify-between">
                    <span>Pasaje Registrado</span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {selectedTrip.seats.filter(s => s.status === 'sold' || s.status === 'locked').length} Vendidos
                    </span>
                  </h4>

                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {selectedTrip.seats
                      .filter(s => s.status === 'sold' || s.status === 'locked')
                      .map(seat => (
                        <div 
                          key={seat.id} 
                          className="p-3 bg-white rounded-xl border border-neutral-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-rose-500 text-white font-black flex items-center justify-center text-sm shadow-xs">
                              {seat.number}
                            </span>
                            <div>
                              <p className="font-black text-neutral-900">
                                {seat.passengerName || 'Pasajero Registrado'}
                              </p>
                              <p className="text-[10px] text-neutral-400 font-bold">
                                Folio: {seat.ticketId || 'BOLETO-GUT'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            Ocupado
                          </span>
                        </div>
                      ))}

                    {selectedTrip.seats.filter(s => s.status === 'sold' || s.status === 'locked').length === 0 && (
                      <div className="text-center py-8 text-neutral-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold">Todos los asientos están disponibles (🟢).</p>
                        <p className="text-[11px]">Aún no hay pasaje registrado para esta salida.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
