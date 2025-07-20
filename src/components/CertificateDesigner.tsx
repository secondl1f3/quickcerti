import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Save, Download, Eye, Undo, Redo, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Canvas } from './Canvas';
import { Sidebar } from './Sidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { DataManager } from './DataManager';
import { PreviewModal } from './PreviewModal';
import { GenerateModal } from './GenerateModal';
import { DesignElement, Tool } from '../types';
import { DesignService, InsufficientPointsError } from '../services/designService';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useDesignStore } from '../store/designStore';
import { useDatasetStore } from '../store/datasetStore';
import { usePointStore } from '../store/pointStore';

import { getUserProfile } from '../services/userService';
import { CertificateGenerator } from '../utils/certificateGenerator';

interface CertificateDesignerProps {
  elements: DesignElement[];
  selectedElement: DesignElement | null;
  onElementsChange: (elements: DesignElement[]) => void;
  onElementSelect: (elementId: string | null) => void;
  onElementUpdate: (id: string, updates: Partial<DesignElement>) => void;
  onElementAdd: (element: DesignElement) => void;
  onElementDelete: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onBack: () => void;
}

interface SaveStatus {
  type: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
}

interface GenerateStatus {
  type: 'idle' | 'generating' | 'success' | 'error' | 'insufficient-points';
  message?: string;
  requiredPoints?: number;
  currentPoints?: number;
}

interface PointsCheck {
  hasEnoughPoints: boolean;
  requiredPoints: number;
  currentPoints: number;
}

export const CertificateDesigner: React.FC<CertificateDesignerProps> = ({
  elements,
  selectedElement,
  onElementsChange,
  onElementSelect,
  onElementUpdate,
  onElementAdd,
  onElementDelete,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onBack,
}) => {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ type: 'idle' });
  const [generateStatus, setGenerateStatus] = useState<GenerateStatus>({ type: 'idle' });
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showBuyPoints, setShowBuyPoints] = useState(false);
  const [pointsCheck, setPointsCheck] = useState<PointsCheck | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { profile, fetchUserProfile } = useUserStore();
  const { setElements } = useDesignStore();
  const { data, variables, currentDataset } = useDatasetStore();
  const pointStore = usePointStore();

  // Auto-save functionality
  const autoSaveTimeoutRef = useRef<number | null>(null);

  // Load user profile on component mount
  useEffect(() => {
    if (user && !profile) {
      fetchUserProfile();
    }
  }, [user, profile, fetchUserProfile]);

  // Sync elements with design store for preview
  useEffect(() => {
    setElements(elements);
  }, [elements, setElements]);

  const handleSaveProgress = useCallback(async () => {
    if (elements.length === 0) return;

    try {
      setSaveStatus({ type: 'saving', message: 'Menyimpan...' });
      
      const design = await DesignService.saveOrUpdateDesign(
        {
          name: `Certificate Design ${new Date().toLocaleDateString()}`,
          elements,
          pageCount,
        },
        currentDesignId || undefined
      );
      
      setCurrentDesignId(design.id);
      setSaveStatus({ type: 'saved', message: 'Tersimpan' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ type: 'idle' });
      }, 3000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus({ 
        type: 'error', 
        message: 'Gagal menyimpan. Coba lagi.' 
      });
    }
  }, [elements, pageCount, currentDesignId]);

  // Auto-save when elements change
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (elements.length > 0) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSaveProgress();
      }, 5000); // Auto-save after 5 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [elements, handleSaveProgress]);

  const handleGenerateAndDownload = useCallback(async () => {
    if (elements.length === 0) {
      setGenerateStatus({
        type: 'error',
        message: 'Tidak ada elemen untuk digenerate. Tambahkan konten terlebih dahulu.'
      });
      return;
    }

    if (data.length === 0) {
      setGenerateStatus({
        type: 'error',
        message: 'Tidak ada data untuk digenerate. Tambahkan data terlebih dahulu melalui Data Manager.'
      });
      return;
    }

    // Open GenerateModal for local generation with point deduction
    setShowGenerateModal(true);
    
    // Clear any previous status
    setGenerateStatus({ type: 'idle' });
  }, [elements, data, variables, pageCount, currentDesignId, fetchUserProfile, pointStore, user]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'select') {
      onElementSelect(null);
    }
  }, [activeTool, onElementSelect]);

  const handleElementClick = useCallback((element: DesignElement, e: React.MouseEvent) => {
    e.stopPropagation();
    onElementSelect(element.id);
  }, [onElementSelect]);

  // Check points when data changes
  useEffect(() => {
    const checkPoints = async () => {
      if (elements.length > 0) {
        try {
          const check = await DesignService.checkPointsBeforeGeneration(pageCount);
          setPointsCheck(check);
        } catch (error) {
          console.error('Error checking points:', error);
        }
      }
    };

    checkPoints();
  }, [pageCount]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Kembali
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Certificate Designer
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Page Count */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Halaman:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={pageCount}
                onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            

            

            
            {/* Undo/Redo */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 transition-colors"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 transition-colors"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
            
            {/* Save Progress Button */}
            <button
              onClick={handleSaveProgress}
              disabled={saveStatus.type === 'saving'}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              {saveStatus.type === 'saving' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveStatus.type === 'saved' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : saveStatus.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-600" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saveStatus.message || 'Simpan Progress'}</span>
            </button>
            
            {/* Preview Button */}
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            
            {/* Generate & Download Button */}
            <button
              onClick={handleGenerateAndDownload}
              disabled={generateStatus.type === 'generating'}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                generateStatus.type === 'generating'
                  ? 'bg-emerald-400 text-white cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {generateStatus.type === 'generating' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {generateStatus.type === 'generating'
                  ? 'Menggenerate...'
                  : 'Generate & Download'
                }
              </span>
            </button>
          </div>
        </div>
        
        {/* Status Messages */}
        {generateStatus.type !== 'idle' && (
          <div className={`mt-3 p-3 rounded-lg ${
            generateStatus.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : generateStatus.type === 'insufficient-points'
              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {generateStatus.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{generateStatus.message}</span>
              {generateStatus.type === 'insufficient-points' && (
                <button
                  onClick={() => setShowBuyPoints(true)}
                  className="ml-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                >
                  Buy Points
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        <Sidebar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onDataManager={() => setShowDataManager(true)}
          onGenerate={handleGenerateAndDownload}
          onBackToTemplateSelection={onBack}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
        />
        
        <div className="flex-1 relative">
          <Canvas
            ref={canvasRef}
            activeTool={activeTool}
            elements={elements}
            selectedElement={selectedElement}
            onCanvasClick={handleCanvasClick}
            onElementClick={handleElementClick}
            onElementUpdate={onElementUpdate}
            onElementAdd={onElementAdd}
          />
        </div>
        
        <PropertiesPanel
          selectedElement={selectedElement}
          onElementUpdate={onElementUpdate}
          variables={[]}
        />
      </div>
      
      {/* Data Manager Modal */}
      {showDataManager && (
        <DataManager onClose={() => setShowDataManager(false)} />
      )}
      
      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal onClose={() => setShowPreview(false)} />
      )}
      
      {/* Generate Modal */}
      {showGenerateModal && (
        <GenerateModal onClose={() => setShowGenerateModal(false)} />
      )}
      
      {/* Buy Points Modal */}
      {showBuyPoints && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insufficient Points</h3>
            <p className="text-gray-600 mb-4">
              You need more points to generate this certificate.
            </p>
            {pointsCheck && (
              <div className="bg-gray-50 p-3 rounded mb-4">
                <p className="text-sm text-gray-600">
                  Required: <span className="font-medium">{pointsCheck.requiredPoints} points</span>
                </p>
                <p className="text-sm text-gray-600">
                  Available: <span className="font-medium">{pointsCheck.currentPoints} points</span>
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Need: <span className="font-medium">{pointsCheck.requiredPoints - pointsCheck.currentPoints} more points</span>
                </p>
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBuyPoints(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.location.href = '/buy-points';
                }}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Buy Points
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateDesigner;