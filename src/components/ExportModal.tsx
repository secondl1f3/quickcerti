import React, { useState } from 'react';
import { X, Download, FileImage, FileText, Printer, Settings } from 'lucide-react';
import { useDesignStore } from '../store/designStore';
import { useDataStore } from '../store/dataStore';

interface ExportModalProps {
  onClose: () => void;
}

type ExportFormat = 'png' | 'jpg' | 'pdf' | 'svg';
type ExportQuality = 'low' | 'medium' | 'high' | 'ultra';

interface ExportSettings {
  format: ExportFormat;
  quality: ExportQuality;
  width: number;
  height: number;
  dpi: number;
  transparent: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const { elements } = useDesignStore();
  const { variables } = useDataStore();
  
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 'high',
    width: 800,
    height: 600,
    dpi: 300,
    transparent: false,
  });
  
  const [isExporting, setIsExporting] = useState(false);

  const formatOptions = [
    { value: 'png', label: 'PNG', icon: FileImage, description: 'Terbaik untuk web dan media sosial' },
    { value: 'jpg', label: 'JPG', icon: FileImage, description: 'Ukuran file kecil, cocok untuk email' },
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Ideal untuk pencetakan profesional' },
    { value: 'svg', label: 'SVG', icon: Settings, description: 'Vector, dapat diperbesar tanpa batas' },
  ];

  const qualityOptions = [
    { value: 'low', label: 'Rendah (72 DPI)', description: 'Ukuran file kecil' },
    { value: 'medium', label: 'Sedang (150 DPI)', description: 'Seimbang kualitas dan ukuran' },
    { value: 'high', label: 'Tinggi (300 DPI)', description: 'Kualitas cetak standar' },
    { value: 'ultra', label: 'Ultra (600 DPI)', description: 'Kualitas cetak premium' },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would implement the actual export logic
      console.log('Exporting with settings:', settings);
      console.log('Elements to export:', elements);
      
      // Create a download link (placeholder)
      const link = document.createElement('a');
      link.href = '#'; // This would be the actual file URL
      link.download = `sertifikat.${settings.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const updateSettings = (updates: Partial<ExportSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const getFileSizeEstimate = () => {
    const baseSize = settings.width * settings.height;
    const qualityMultiplier = {
      low: 0.1,
      medium: 0.3,
      high: 0.6,
      ultra: 1.0,
    }[settings.quality];
    
    const formatMultiplier = {
      png: 1.2,
      jpg: 0.3,
      pdf: 0.8,
      svg: 0.1,
    }[settings.format];
    
    const estimatedKB = Math.round((baseSize * qualityMultiplier * formatMultiplier) / 1000);
    
    if (estimatedKB > 1000) {
      return `~${(estimatedKB / 1000).toFixed(1)} MB`;
    }
    return `~${estimatedKB} KB`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export Sertifikat</h2>
              <p className="text-sm text-gray-600">Pilih format dan kualitas export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Format File
            </label>
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ format: option.value as ExportFormat })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      settings.format === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${
                        settings.format === option.value ? 'text-emerald-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Kualitas
            </label>
            <div className="space-y-2">
              {qualityOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="quality"
                    value={option.value}
                    checked={settings.quality === option.value}
                    onChange={(e) => updateSettings({ quality: e.target.value as ExportQuality })}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Lebar (px)
              </label>
              <input
                type="number"
                value={settings.width}
                onChange={(e) => updateSettings({ width: parseInt(e.target.value) || 800 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="100"
                max="5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tinggi (px)
              </label>
              <input
                type="number"
                value={settings.height}
                onChange={(e) => updateSettings({ height: parseInt(e.target.value) || 600 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="100"
                max="5000"
              />
            </div>
          </div>

          {/* Additional Options */}
          {settings.format === 'png' && (
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.transparent}
                  onChange={(e) => updateSettings({ transparent: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                />
                <span className="text-sm font-medium text-gray-900">
                  Background Transparan
                </span>
              </label>
            </div>
          )}

          {/* File Size Estimate */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Estimasi Ukuran File:</span>
              <span className="text-sm text-gray-600">{getFileSizeEstimate()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Mengexport...' : 'Export Sekarang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};