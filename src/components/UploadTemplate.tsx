import React, { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Image } from 'lucide-react';
import { TemplateService } from '../services/templateService';

interface UploadTemplateProps {
  onClose: () => void;
  onUploadSuccess: (imageUrl: string) => void;
}

export const UploadTemplate: React.FC<UploadTemplateProps> = ({ onClose, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadStatus('uploading');
    setErrorMessage('');
    setPreviewUrl(null);

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/svg+xml',
      'application/pdf'
    ];
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.pdf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setUploadStatus('error');
      setErrorMessage('Format file tidak didukung. Harap upload file JPG, PNG, WEBP, SVG, atau PDF.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('error');
      setErrorMessage('Ukuran file terlalu besar. Maksimal 10MB.');
      return;
    }

    try {
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Upload template using the service
      const template = await TemplateService.uploadTemplate(file, {
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        isPublic: false,
      });
      
      setUploadStatus('success');
      
      setTimeout(() => {
        // Use the final template URL from the service
        onUploadSuccess(template.templateUrl || template.thumbnail);
        onClose();
        // Clean up object URL
        URL.revokeObjectURL(objectUrl);
      }, 1500);
    } catch (error) {
      console.error('Template upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Gagal mengupload template. Silakan coba lagi.'
      );
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getSupportedFormatsText = () => {
    return 'JPG, PNG, WEBP, SVG, PDF';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Template</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {uploadStatus === 'idle' && (
            <>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drag & Drop Template
                </h3>
                <p className="text-gray-600 mb-4">
                  atau klik tombol di bawah untuk memilih file
                </p>
                <button
                  onClick={openFileDialog}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Pilih File
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p className="mb-2"><strong>Format yang didukung:</strong> {getSupportedFormatsText()}</p>
                <p><strong>Ukuran maksimal:</strong> 10MB</p>
              </div>
            </>
          )}

          {uploadStatus === 'uploading' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Mengupload Template...
              </h3>
              <p className="text-gray-600">
                Mohon tunggu sebentar
              </p>
              {previewUrl && (
                <div className="mt-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-32 max-h-32 mx-auto rounded-lg shadow-md object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Berhasil!
              </h3>
              <p className="text-gray-600 mb-4">
                Template berhasil diupload dan akan segera dimuat
              </p>
              {previewUrl && (
                <div className="mt-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-32 max-h-32 mx-auto rounded-lg shadow-md object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Gagal
              </h3>
              <p className="text-red-600 mb-4">
                {errorMessage}
              </p>
              <button
                onClick={() => {
                  setUploadStatus('idle');
                  setPreviewUrl(null);
                }}
                className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.svg,.pdf,image/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};