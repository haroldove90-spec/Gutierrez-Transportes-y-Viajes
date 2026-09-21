import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Check, 
  X, 
  Loader2, 
  Cloud, 
  HardDrive, 
  Camera,
  AlertCircle
} from 'lucide-react';
import { uploadVehiclePhoto } from '../../lib/supabase';

// Oficial fleet photos available in Supabase storage
export const DEFAULT_OFFICIAL_PHOTOS = [
  {
    title: 'Volkswagen Vento (Sedán 5 Pax)',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/vento.png',
  },
  {
    title: 'Toyota Avanza (Familiar 7 Pax)',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/avanzatoyota.png',
  },
  {
    title: 'Mitsubishi L200 Pick-up 4x4 (5 Pax)',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/l200mitsubishi.png',
  },
  {
    title: 'Volkswagen Tiguan (SUV 7 Pax)',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/tiguan.png',
  },
  {
    title: 'Volkswagen Teramont (SUV 7 Pax)',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/teramon.png',
  },
  {
    title: 'Toyota Hiace VIP (Van 12 Pax)',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede12pasajeros.png',
  },
  {
    title: 'Toyota Hiace Gran Confort (Van 14 Pax)',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png',
  },
  {
    title: 'Ford Transit Tourneo (Van 18 Pax)',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/fordtransitde18pasajeros.png',
  },
  {
    title: 'Mercedes Sprinter VIP (20/21 Pax)',
    url: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/sprinterde21pasajeros.png',
  },
  {
    title: 'Autobús Foráneo Gran Turismo',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60',
  }
];

interface VehiclePhotoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
}

export const VehiclePhotoUploader: React.FC<VehiclePhotoUploaderProps> = ({
  value,
  onChange,
  label = 'Fotografía de la Unidad / Vehículo',
  helperText = 'Puedes subir una foto desde tu equipo, pegar un enlace web o seleccionar del catálogo oficial.'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success_cloud' | 'success_local' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.)');
      setUploadStatus('error');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage('');
      setUploadStatus('idle');

      const res = await uploadVehiclePhoto(file);

      if (res.url) {
        onChange(res.url);
        if (res.storageType === 'cloud') {
          setUploadStatus('success_cloud');
        } else {
          setUploadStatus('success_local');
        }
      } else {
        setErrorMessage(res.error || 'Error al procesar la imagen.');
        setUploadStatus('error');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error inesperado al subir la imagen.');
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const isCurrentCloud = value.includes('supabase.co/storage') || value.startsWith('http');
  const isCurrentDataUrl = value.startsWith('data:image');

  return (
    <div className="space-y-3">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-orange-600" />
            <span>{label}</span>
          </label>
          {helperText && (
            <p className="text-[11px] text-neutral-500 font-medium">
              {helperText}
            </p>
          )}
        </div>

        {/* Tab Controls */}
        <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'upload' 
                ? 'bg-neutral-900 text-white shadow-sm' 
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Foto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'url' 
                ? 'bg-neutral-900 text-white shadow-sm' 
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Enlace URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'presets' 
                ? 'bg-neutral-900 text-white shadow-sm' 
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Catálogo Oficial</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SUBIR FOTO DESDE EL DISPOSITIVO */}
      {activeTab === 'upload' && (
        <div className="space-y-2">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={onFileInputChange}
            accept="image/png, image/jpeg, image/webp, image/jpg"
            className="hidden" 
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-orange-500 bg-orange-50/70 scale-[1.01]'
                : 'border-neutral-300 hover:border-orange-500 bg-neutral-50 hover:bg-white'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-orange-600 py-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-xs font-black">Comprimiendo y procesando fotografía...</p>
                <p className="text-[10px] text-neutral-500">Optimizando dimensiones y subiendo</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
                  <Upload className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-black text-neutral-800">
                    Arrastra tu foto aquí o haz clic para seleccionarla
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Soporta JPG, PNG, WEBP de celular o computadora
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-colors shadow-sm"
                >
                  Explorar Archivos
                </button>
              </>
            )}
          </div>

          {/* Upload Status Badges */}
          {uploadStatus === 'success_cloud' && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold">
              <Cloud className="w-4 h-4 text-emerald-600" />
              <span>Foto subida exitosamente a Supabase Cloud Storage (Bucket Autos)</span>
            </div>
          )}

          {uploadStatus === 'success_local' && (
            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl font-bold">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span>Foto optimizada y guardada en formato Base64 de alta resolución</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl font-bold">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{errorMessage || 'Error al procesar la imagen'}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ENLACE URL DIRECTO */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 p-3 bg-neutral-50 border-2 border-neutral-300 rounded-2xl font-bold text-neutral-900 text-xs focus:border-orange-500 focus:bg-white transition-all outline-none font-mono"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                title="Limpiar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">
            Ingresa la URL pública directa de la imagen alojada en Supabase Storage o en la web.
          </p>
        </div>
      )}

      {/* TAB 3: CATÁLOGO OFICIAL SUPABASE */}
      {activeTab === 'presets' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 bg-neutral-50 rounded-2xl border border-neutral-200">
            {DEFAULT_OFFICIAL_PHOTOS.map((preset, idx) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 relative ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/40'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white'
                  }`}
                >
                  <div className="h-14 w-full rounded-lg bg-neutral-900 overflow-hidden relative">
                    <img
                      src={preset.url}
                      alt={preset.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-orange-600/50 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] font-black text-neutral-800 line-clamp-1">
                    {preset.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PREVIEW CONTAINER */}
      {value && (
        <div className="relative rounded-2xl overflow-hidden border-2 border-neutral-200 bg-neutral-900 h-40 w-full group">
          <img
            src={value}
            alt="Vista Previa de la Unidad"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80';
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

          {/* Storage Type Pill */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white border border-white/20">
            {isCurrentDataUrl ? (
              <>
                <HardDrive className="w-3 h-3 text-blue-400" />
                <span>Foto Local / Base64</span>
              </>
            ) : isCurrentCloud ? (
              <>
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span>Supabase Storage / Web</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3 h-3 text-orange-400" />
                <span>Foto Asignada</span>
              </>
            )}
          </div>

          {/* Remove / Change button */}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
            title="Quitar foto"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Bottom Confirmation label */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-[11px] font-black">
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Foto lista para registrar
            </span>
            <span className="text-[10px] text-neutral-300 font-normal">
              Se guardará con la unidad
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
