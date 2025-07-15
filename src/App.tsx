import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { DataManager } from './components/DataManager';
import { GenerateModal } from './components/GenerateModal';
import { TemplateModal } from './components/TemplateModal';
import { PreviewModal } from './components/PreviewModal';
import { ExportModal } from './components/ExportModal';
import { LandingPage } from './components/LandingPage';
import { TemplateSelection } from './components/TemplateSelection';
import { UploadTemplate } from './components/UploadTemplate';
import { AuthWrapper } from './components/AuthWrapper';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NavigationHeader, APP_NAVIGATION_STEPS } from './components/NavigationHeader';
import { EditorHeader } from './components/EditorHeader';
import { useDesignStore } from './store/designStore';
import { useDataStore } from './store/dataStore';
import { useAuthStore } from './store/authStore';
import { DesignElement, Tool } from './types';
import { I18nProvider } from './i18n/i18nContext';

type AppView = 'auth' | 'landing' | 'template-selection' | 'editor';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const { isAuthenticated, initializeAuth, signOut } = useAuthStore();

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && currentView === 'auth') {
      setCurrentView('landing');
    }
    // Don't redirect unauthenticated users away from landing page
    // They can access landing page but need to login for other features
  }, [isAuthenticated, currentView]);
  const [showDataManager, setShowDataManager] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUploadTemplate, setShowUploadTemplate] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  
  const { 
    selectedElement, 
    elements, 
    addElement, 
    updateElement, 
    deleteElement,
    selectElement,
    clearSelection,
    undo,
    redo,
    canUndo,
    canRedo,
    setElements
  } = useDesignStore();
  
  const { data, variables } = useDataStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'select') {
      clearSelection();
    }
  }, [activeTool, clearSelection]);

  const handleElementClick = useCallback((element: DesignElement, e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  }, [selectElement]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z':
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          e.preventDefault();
          break;
        case 'y':
          redo();
          e.preventDefault();
          break;
        case 'Delete':
        case 'Backspace':
          if (selectedElement) {
            deleteElement(selectedElement.id);
          }
          e.preventDefault();
          break;
      }
    }
  }, [undo, redo, selectedElement, deleteElement]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Navigation handlers
  const handleNavigateToView = (view: AppView) => {
    // Allow unauthenticated users to access landing page
    // Prevent navigation to other protected views if not authenticated
    if (!isAuthenticated && view !== 'auth' && view !== 'landing') {
      setCurrentView('auth');
      return;
    }
    
    setCurrentView(view);
    // Close any open modals when navigating
    setShowUploadTemplate(false);
    setShowDataManager(false);
    setShowGenerateModal(false);
    setShowTemplateModal(false);
    setShowPreviewModal(false);
    setShowExportModal(false);
  };

  const handleSignOut = () => {
    signOut();
    setCurrentView('auth');
    // Close any open modals
    setShowUploadTemplate(false);
    setShowDataManager(false);
    setShowGenerateModal(false);
    setShowTemplateModal(false);
    setShowPreviewModal(false);
    setShowExportModal(false);
  };

  const handleAuthSuccess = () => {
    setCurrentView('landing');
  };

  const handleBackNavigation = () => {
    switch (currentView) {
      case 'editor':
        setCurrentView('template-selection');
        break;
      case 'template-selection':
        setCurrentView('landing');
        break;
      case 'landing':
        // Don't allow going back from landing if authenticated
        // User should use sign out instead
        break;
      case 'auth':
        // No back navigation from auth
        break;
      default:
        break;
    }
  };

  const getNavigationSteps = () => {
    return APP_NAVIGATION_STEPS.map(step => ({
      ...step,
      onClick: step.id !== currentView ? () => handleNavigateToView(step.id as AppView) : undefined,
    }));
  };

  if (currentView === 'auth') {
    return (
      <I18nProvider defaultLanguage="id">
        <AuthWrapper onAuthSuccess={handleAuthSuccess} />
      </I18nProvider>
    );
  }

  if (currentView === 'landing') {
    return (
      <I18nProvider defaultLanguage="id">
        <LandingPage onGetStarted={() => {
          if (isAuthenticated) {
            handleNavigateToView('template-selection');
          } else {
            setCurrentView('auth');
          }
        }} />
      </I18nProvider>
    );
  }

  if (currentView === 'template-selection') {
    return (
      <I18nProvider defaultLanguage="id">
        <ProtectedRoute onRedirectToAuth={() => setCurrentView('auth')}>
          <div className="h-screen flex flex-col bg-gray-50">
            <NavigationHeader
              currentStep="template-selection"
              steps={getNavigationSteps()}
              onBack={handleBackNavigation}
              onHome={() => handleNavigateToView('landing')}
              onSignOut={handleSignOut}
            />
            <div className="flex-1">
              <TemplateSelection 
              onCreateNew={() => {
                console.log('Create New clicked');
                handleNavigateToView('editor');
              }}
              onUseTemplate={() => {
                console.log('Use Template clicked');
                setShowTemplateModal(true);
              }}
              onUploadTemplate={() => {
                console.log('Upload Template clicked');
                setShowUploadTemplate(true);
              }}
            />
          </div>
          
          {/* Modals for template-selection view */}
          {showTemplateModal && (
            <TemplateModal 
              onClose={() => setShowTemplateModal(false)}
              onTemplateSelect={() => {
                setShowTemplateModal(false);
                handleNavigateToView('editor');
              }}
            />
          )}
          
          {showUploadTemplate && (
            <UploadTemplate 
              onClose={() => setShowUploadTemplate(false)}
              onUploadSuccess={(imageUrl) => {
                // Create a background image element from the uploaded image
                const backgroundElement = {
                  id: Date.now().toString(),
                  type: 'image' as const,
                  x: 0,
                  y: 0,
                  width: 800,
                  height: 600,
                  position: { x: 0, y: 0 },
                  size: { width: 800, height: 600 },
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  imageUrl: imageUrl,
                  locked: true // Lock the background so it can't be accidentally moved
                };
                
                setElements([backgroundElement]);
                setShowUploadTemplate(false);
                handleNavigateToView('editor');
              }}
            />
          )}
        </div>
        </ProtectedRoute>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider defaultLanguage="id">
      <ProtectedRoute onRedirectToAuth={() => setCurrentView('auth')}>
        <div className="h-screen flex flex-col bg-gray-50">
          <EditorHeader
            onBack={() => handleNavigateToView('template-selection')}
            onSave={() => console.log('Save project')}
            onPreview={() => setShowPreviewModal(true)}
            onExport={() => setShowExportModal(true)}
            onUndo={() => undo()}
            onRedo={() => redo()}
            canUndo={canUndo}
            canRedo={canRedo}
            projectName="Sertifikat Saya"
            onSignOut={handleSignOut}
          />
        <div className="flex-1 flex bg-gray-100">
          <Sidebar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            onDataManager={() => setShowDataManager(true)}
            onGenerate={() => setShowGenerateModal(true)}
            onTemplates={() => setShowTemplateModal(true)}
            onPreview={() => setShowPreviewModal(true)}
            onBackToTemplateSelection={() => handleNavigateToView('template-selection')}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
          />
          
          <div className="flex-1 relative">
            <Canvas
              ref={canvasRef}
              activeTool={activeTool}
              elements={elements}
              selectedElement={selectedElement}
              onCanvasClick={handleCanvasClick}
              onElementClick={handleElementClick}
              onElementUpdate={updateElement}
              onElementAdd={addElement}
            />
          </div>
          
          <PropertiesPanel
            selectedElement={selectedElement}
            onElementUpdate={updateElement}
            variables={variables}
          />
        </div>

        {/* Modals */}
        {showDataManager && (
          <DataManager onClose={() => setShowDataManager(false)} />
        )}
        
        {showGenerateModal && (
          <GenerateModal onClose={() => setShowGenerateModal(false)} />
        )}
        
        {showPreviewModal && (
          <PreviewModal onClose={() => setShowPreviewModal(false)} />
        )}
        
        {showExportModal && (
          <ExportModal onClose={() => setShowExportModal(false)} />
        )}
        </div>
      </ProtectedRoute>
    </I18nProvider>
  );
}

export default App;