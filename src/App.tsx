import React, { useState, useCallback, useRef, forwardRef, useEffect } from 'react';
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
import { NavigationHeader, APP_NAVIGATION_STEPS } from './components/NavigationHeader';
import { EditorHeader } from './components/EditorHeader';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { useDesignStore } from './store/designStore';
import { useDataStore } from './store/dataStore';
import { DesignElement, Tool } from './types';
import { UserProfile } from './components/UserProfile';
import { ProfilePage } from './components/ProfilePage';
import { I18nProvider } from './i18n/i18nContext';

type AppView = 'landing' | 'login' | 'template-selection' | 'editor' | 'profile';

function AppContent() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');
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
    setCurrentView(view);
    // Close any open modals when navigating
    setShowUploadTemplate(false);
    setShowDataManager(false);
    setShowGenerateModal(false);
    setShowTemplateModal(false);
    setShowPreviewModal(false);
    setShowExportModal(false);
  };

  const handleBackNavigation = () => {
    switch (currentView) {
      case 'editor':
        setCurrentView('template-selection');
        break;
      case 'template-selection':
        setCurrentView('landing');
        break;
      case 'login':
        setCurrentView('landing');
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

  return (
    <I18nProvider defaultLanguage="id">
      {currentView === 'landing' && (
        <LandingPage 
          user={user}
          onGetStarted={() => handleNavigateToView('template-selection')} 
          onLogin={() => setCurrentView('login')}
          onProfile={() => setCurrentView('profile')}
        />
      )}
      
      {currentView === 'login' && (
        <Login onSuccess={() => handleNavigateToView('template-selection')} />
      )}
      
      {(currentView === 'template-selection' || currentView === 'editor' || currentView === 'profile') && (
        <ProtectedRoute>
          {currentView === 'template-selection' && (
            <div className="h-screen flex flex-col bg-gray-50">
              <NavigationHeader
                currentStep="template-selection"
                steps={getNavigationSteps()}
                onBack={handleBackNavigation}
                onHome={() => handleNavigateToView('landing')}
                onViewProfile={() => setCurrentView('profile')}
                user={user}
                signOut={signOut}
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
          )}

          {currentView === 'editor' && (
            <div className="h-screen flex flex-col bg-gray-50">
              <EditorHeader
                  onBack={() => handleNavigateToView('template-selection')}
                  onSave={() => console.log('Save project')}
                  onPreview={() => setShowPreviewModal(true)}
                  onExport={() => setShowExportModal(true)}
                  onUndo={() => undo()}
                  onRedo={() => redo()}
                  onViewProfile={() => setCurrentView('profile')}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  projectName="Sertifikat Saya"
                  user={user}
                  signOut={signOut}
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
            )}
            
          {currentView === 'profile' && (
            <ProfilePage 
              onBack={() => setCurrentView('landing')} 
              user={user}
              signOut={signOut}
            />
          )}
        </ProtectedRoute>
      )}
      

    </I18nProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;