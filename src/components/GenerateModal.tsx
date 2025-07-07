import React, { useState } from 'react';
import { X, FileText, Image, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { useDesignStore } from '../store/designStore';
import { CertificateGenerator } from '../utils/certificateGenerator';
import { useTranslation } from '../i18n/i18nContext';

interface GenerateModalProps {
  onClose: () => void;
}

export const GenerateModal: React.FC<GenerateModalProps> = ({ onClose }) => {
  const { data, variables } = useDataStore();
  const { elements } = useDesignStore();
  const [format, setFormat] = useState<'pdf' | 'png' | 'jpg'>('pdf');
  const [quality, setQuality] = useState(90);
  const [filenameField, setFilenameField] = useState(variables[0]?.name || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  const handleGenerate = async () => {
    if (data.length === 0) {
      setError('No data available for generation');
      return;
    }

    if (elements.length === 0) {
      setError(t('noDesignElements'));
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      const generator = new CertificateGenerator(elements, variables);
      
      await generator.generateCertificates(
        data,
        {
          format,
          quality,
          filenameField,
        },
        (progressValue) => {
          setProgress(progressValue);
        }
      );

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFileExtension = () => {
    return format === 'pdf' ? '.pdf' : format === 'png' ? '.png' : '.jpg';
  };

  const getDownloadInfo = () => {
    if (data.length === 1) {
      return t('singleCertificateDownload', { format: format.toUpperCase() });
    } else {
      return t('multipleCertificatesDownload', { count: data.length, format: format.toUpperCase() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{t('generateCertificates')}</h2>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('outputFormat')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'pdf', label: 'PDF', icon: FileText },
                { value: 'png', label: 'PNG', icon: Image },
                { value: 'jpg', label: 'JPG', icon: Image },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setFormat(value as any)}
                  disabled={isGenerating}
                  className={`p-3 rounded-lg border flex flex-col items-center space-y-1 transition-colors disabled:opacity-50 ${
                    format === value
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{label === 'PDF' ? t('pdfDocument') : label === 'PNG' ? t('pngImage') : t('jpgImage')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality (for image formats) */}
          {(format === 'png' || format === 'jpg') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('imageQuality')}: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                disabled={isGenerating}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Lower size</span>
                <span>Higher quality</span>
              </div>
            </div>
          )}

          {/* Filename Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filename Field
            </label>
            <select
              value={filenameField}
              onChange={(e) => setFilenameField(e.target.value)}
              disabled={isGenerating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
            >
              <option value="">Use default naming</option>
              {variables.map((variable) => (
                <option key={variable.name} value={variable.name}>
                  {variable.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              This field will be used to name the generated files
            </p>
          </div>

          {/* Generation Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{t('downloadInformation')}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Files to generate: <span className="font-medium">{data.length}</span></p>
              <p>Format: <span className="font-medium">{format.toUpperCase()}</span></p>
              <p>Variables: <span className="font-medium">{variables.length}</span></p>
              <p>Elements: <span className="font-medium">{elements.length}</span></p>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                📦 {getDownloadInfo()}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">
                {t('certificatesGenerated')}
              </p>
            </div>
          )}

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating certificates...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                {data.length > 1 ? 'Creating ZIP file...' : 'Processing certificate...'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isGenerating ? t('generating') : t('cancel')}
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || data.length === 0 || elements.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Download size={20} />
              <span>
                {isGenerating 
                  ? `${progress}%` 
                  : t('generateDownload')
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};