import React, { useState, useEffect } from 'react';
import { X, FileText, Image, Download, AlertCircle, CheckCircle, Coins } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { useDesignStore } from '../store/designStore';
import { CertificateGenerator } from '../utils/certificateGenerator';
import { useTranslation } from '../i18n/i18nContext';
import { useAuthStore } from '../store/authStore';
import { usePointStore } from '../store/pointStore';

interface GenerateModalProps {
  onClose: () => void;
}

export const GenerateModal: React.FC<GenerateModalProps> = ({ onClose }) => {
  const { data, variables } = useDataStore();
  const { elements } = useDesignStore();
  const { user } = useAuthStore();
  const { userPoints, fetchUserPoints, createTransaction } = usePointStore();
  const [format, setFormat] = useState<'pdf' | 'png' | 'jpg'>('pdf');
  const [quality, setQuality] = useState(90);
  const [filenameField, setFilenameField] = useState(variables[0]?.name || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { t } = useTranslation();

  // Fetch user points when modal opens
  useEffect(() => {
    fetchUserPoints();
  }, [fetchUserPoints]);

  // Calculate required points (1 point per certificate)
  const requiredPoints = data.length;
  const hasEnoughPoints = userPoints >= requiredPoints;

  const handleGenerate = async () => {
    if (data.length === 0) {
      setError('No data available for generation');
      return;
    }

    if (elements.length === 0) {
      setError(t('noDesignElements'));
      return;
    }

    if (!hasEnoughPoints) {
      setError(`Insufficient points. Required: ${requiredPoints}, Available: ${userPoints}`);
      return;
    }

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // Deduct points before generation
      if (user?.id) {
        await createTransaction({
          userId: user.id,
          type: 'USAGE',
          amount: requiredPoints,
          description: `Certificate download - ${data.length} ${format.toUpperCase()} files`
        });
        
        // Refresh user points
        await fetchUserPoints();
      }

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

  const handleConfirmGenerate = () => {
    setShowConfirmation(false);
    handleGenerate();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
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

          {/* Point Balance & Cost */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Point Balance</h3>
              <div className="flex items-center space-x-1">
                <Coins size={16} className="text-yellow-600" />
                <span className="font-medium text-gray-900">{userPoints}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Required points:</span>
                <span className={`font-medium ${hasEnoughPoints ? 'text-green-600' : 'text-red-600'}`}>
                  {requiredPoints}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining after download:</span>
                <span className={`font-medium ${hasEnoughPoints ? 'text-gray-900' : 'text-red-600'}`}>
                  {hasEnoughPoints ? userPoints - requiredPoints : 'Insufficient'}
                </span>
              </div>
            </div>
            {!hasEnoughPoints && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  ⚠️ You need {requiredPoints - userPoints} more points to download
                </p>
              </div>
            )}
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

          {/* Confirmation Dialog */}
          {showConfirmation && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800 mb-2">Confirm Download</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    This will deduct <strong>{requiredPoints} points</strong> from your balance to download {data.length} {format.toUpperCase()} {data.length === 1 ? 'file' : 'files'}.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancelConfirmation}
                      className="px-3 py-1 text-sm border border-yellow-300 text-yellow-700 rounded hover:bg-yellow-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmGenerate}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    >
                      Confirm & Download
                    </button>
                  </div>
                </div>
              </div>
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
              disabled={isGenerating || data.length === 0 || elements.length === 0 || !hasEnoughPoints}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Download size={20} />
              <span>
                {isGenerating 
                  ? `${progress}%` 
                  : showConfirmation
                  ? 'Confirming...'
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