import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Image, AlertCircle, CheckCircle, FileImage } from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';

interface UploadModalProps {
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('Custom');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTemplate, templates } = useTemplateStore();

  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a valid file (.jpg, .png, .webp, .svg)';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploadedFile(file);
    
    // Set default template name from file name
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    setTemplateName(fileName);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Simulate upload progress
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setSuccess(true);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleSaveAsTemplate = () => {
    if (!uploadedFile || !previewUrl || !templateName.trim()) {
      setError('Please provide a template name');
      return;
    }
    
    try {
      // Create a new template from the uploaded image
      const template = {
        id: Date.now().toString(),
        name: templateName.trim(),
        description: templateDescription.trim() || 'Uploaded certificate template',
        category: templateCategory,
        tags: ['uploaded', templateCategory.toLowerCase()],
        imageUrl: previewUrl,
        elements: [],
        variables: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      addTemplate(template);
      
      // Show success message with template details
      console.log('Template saved successfully:', template);
      console.log('Total templates in store:', templates.length + 1);
      
      // Close modal after short delay to show success
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      setError('Failed to save template. Please try again.');
      console.error('Template save error:', err);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setSuccess(false);
    setError(null);
    setUploadProgress(0);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('Custom');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Upload Certificate Template</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {!uploadedFile ? (
              <>
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Upload size={32} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Drop your certificate here
                    </h3>
                    <p className="text-gray-500 mb-4">
                      or click to browse files
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Supported formats: JPG, PNG, WebP, SVG</p>
                  <p>Maximum file size: 5MB</p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {/* File Info */}
                <div className="flex items-center justify-center space-x-3">
                  <FileImage size={24} className="text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle size={20} />
                    <span className="font-medium">File processed successfully!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Template Details Form */}
          {success && uploadedFile && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Template Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Enter template description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Academic">Academic</option>
                  <option value="Professional">Professional</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Preview</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Certificate preview"
                  className="w-full h-64 object-contain bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Debug Info */}
          {success && (
            <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
              <p>✓ File validated and processed</p>
              <p>✓ Preview generated successfully</p>
              <p>✓ Ready to save as template</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {uploadedFile && (
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Upload Another
              </button>
            )}
            <button
              onClick={handleSaveAsTemplate}
              disabled={!success || !uploadedFile || !templateName.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Template
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.svg"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
};