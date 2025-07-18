import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { BuyPoints } from './components/BuyPoints';
import { PaymentWaiting } from './components/PaymentWaiting';
import { TransactionHistory } from './components/TransactionHistory';
import { useDesignStore } from './store/designStore';
import { useDataStore } from './store/dataStore';
import { useAuthStore } from './store/authStore';
import { DesignElement, Tool } from './types';
import { I18nProvider } from './i18n/i18nContext';
import { Profile } from './components/Profile';
import { CertificateHub } from './components/CertificateHub';
import { CertificateDesigner } from './components/CertificateDesigner';

type AppView = 'auth' | 'landing' | 'template-selection' | 'editor' | 'profile' | 'certificate-hub';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Derive current view from route
  const getCurrentView = (): AppView => {
    switch (location.pathname) {
      case '/auth':
        return 'auth';
      case '/template-selection':
        return 'template-selection';
      case '/editor':
        return 'editor';
      case '/profile':
        return 'profile';
      case '/certificate-hub':
        return 'certificate-hub';
      default:
        return 'landing';
    }
  };
  
  const currentView = getCurrentView();
  const { isAuthenticated, initializeAuth, signOut } = useAuthStore();

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && currentView === 'auth') {
      navigate('/');
    }
    // Don't redirect unauthenticated users away from landing page
    // They can access landing page but need to login for other features
  }, [isAuthenticated, currentView, navigate]);
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
      navigate('/auth');
      return;
    }
    
    const routeMap = {
      'auth': '/auth',
      'landing': '/',
      'template-selection': '/template-selection',
      'editor': '/editor',
      'profile': '/profile',
      'certificate-hub': '/certificate-hub'
    };
    
    navigate(routeMap[view]);
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
    navigate('/auth');
    // Close any open modals
    setShowUploadTemplate(false);
    setShowDataManager(false);
    setShowGenerateModal(false);
    setShowTemplateModal(false);
    setShowPreviewModal(false);
    setShowExportModal(false);
  };

  const handleAuthSuccess = () => {
    navigate('/');
  };

  const handleBackNavigation = () => {
    switch (currentView) {
      case 'editor':
        navigate('/certificate-hub');
        break;
      case 'certificate-hub':
        navigate('/');
        break;
      case 'template-selection':
        navigate('/');
        break;
      case 'profile':
        navigate('/');
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
            handleNavigateToView('certificate-hub');
          } else {
            navigate('/auth');
          }
        }} />
      </I18nProvider>
    );
  }

  if (currentView === 'template-selection') {
    return (
      <I18nProvider defaultLanguage="id">
        <ProtectedRoute onRedirectToAuth={() => navigate('/auth')}>
          <div className="h-screen flex flex-col bg-gray-50">
            <NavigationHeader
              currentStep="template-selection"
              steps={getNavigationSteps()}
              onBack={handleBackNavigation}
              onHome={() => handleNavigateToView('landing')}
              onProfile={() => handleNavigateToView('profile')}
              onSignOut={handleSignOut}
              onBuyPoints={() => navigate('/buy-points')}
              onTransactionHistory={() => navigate('/transaction-history')}
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

  if (currentView === 'profile') {
    return (
      <I18nProvider defaultLanguage="id">
        <ProtectedRoute onRedirectToAuth={() => navigate('/auth')}>
          <div className="h-screen flex flex-col bg-gray-50">
            <NavigationHeader
               currentStep="profile"
               steps={getNavigationSteps()}
               onBack={handleBackNavigation}
               onHome={() => handleNavigateToView('landing')}
               onProfile={() => handleNavigateToView('profile')}
               onSignOut={handleSignOut}
               onBuyPoints={() => navigate('/buy-points')}
               onTransactionHistory={() => navigate('/transaction-history')}
             />
            <div className="flex-1">
              <Profile />
            </div>
          </div>
        </ProtectedRoute>
      </I18nProvider>
    );
  }

  if (currentView === 'certificate-hub') {
    return (
      <I18nProvider defaultLanguage="id">
        <ProtectedRoute onRedirectToAuth={() => navigate('/auth')}>
          <div className="h-screen flex flex-col bg-gray-50">
            <NavigationHeader
              currentStep="certificate-hub"
              steps={getNavigationSteps()}
              onBack={handleBackNavigation}
              onHome={() => handleNavigateToView('landing')}
              onProfile={() => handleNavigateToView('profile')}
              onSignOut={handleSignOut}
              onBuyPoints={() => navigate('/buy-points')}
              onTransactionHistory={() => navigate('/transaction-history')}
            />
            <div className="flex-1 overflow-auto">
              <CertificateHub
                onCreateBlank={() => {
                  // Clear any existing elements and go to editor
                  setElements([]);
                  handleNavigateToView('editor');
                }}
                onUploadTemplate={() => {
                  setShowUploadTemplate(true);
                }}
                onSelectTemplate={(template) => {
                  // Create a background image element from the selected template
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
                    imageUrl: template.templateUrl,
                    locked: true
                  };
                  
                  setElements([backgroundElement]);
                  handleNavigateToView('editor');
                }}
              />
            </div>
            
            {/* Upload Template Modal */}
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
                    locked: true
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
      <ProtectedRoute onRedirectToAuth={() => navigate('/auth')}>
        <CertificateDesigner
          elements={elements}
          selectedElement={selectedElement}
          onElementsChange={setElements}
          onElementSelect={(elementId) => elementId ? selectElement(elementId) : clearSelection()}
          onElementUpdate={updateElement}
          onElementAdd={addElement}
          onElementDelete={deleteElement}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onBack={() => handleNavigateToView('certificate-hub')}
        />
      </ProtectedRoute>
    </I18nProvider>
  );
}

function App() {
  return (
    <Router>
      <I18nProvider defaultLanguage="id">
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/auth" element={<AuthWrapper onAuthSuccess={() => window.location.href = '/'} />} />
          <Route path="/landing" element={<AppContent />} />
          <Route path="/template-selection" element={<AppContent />} />
          <Route path="/certificate-hub" element={<AppContent />} />
          <Route path="/editor" element={<AppContent />} />
          <Route path="/profile" element={<AppContent />} />
          <Route path="/buy-points" element={
            <ProtectedRoute onRedirectToAuth={() => window.location.href = '/auth'}>
              <div className="h-screen flex flex-col bg-gray-50">
                <NavigationHeader
                  currentStep="buy-points"
                  steps={APP_NAVIGATION_STEPS}
                  onBack={() => window.history.back()}
                  onHome={() => window.location.href = '/'}
                  onProfile={() => window.location.href = '/profile'}
                  onSignOut={() => {
                    // Clear auth and redirect
                    localStorage.removeItem('auth-storage');
                    window.location.href = '/auth';
                  }}
                  onBuyPoints={() => window.location.href = '/buy-points'}
                  onTransactionHistory={() => window.location.href = '/transaction-history'}
                />
                <div className="flex-1">
                  <BuyPoints />
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/payment-waiting/:transactionId" element={
            <ProtectedRoute onRedirectToAuth={() => window.location.href = '/auth'}>
              <div className="h-screen flex flex-col bg-gray-50">
                <NavigationHeader
                  currentStep="payment-waiting"
                  steps={APP_NAVIGATION_STEPS}
                  onBack={() => window.history.back()}
                  onHome={() => window.location.href = '/'}
                  onProfile={() => window.location.href = '/profile'}
                  onSignOut={() => {
                    // Clear auth and redirect
                    localStorage.removeItem('auth-storage');
                    window.location.href = '/auth';
                  }}
                  onBuyPoints={() => window.location.href = '/buy-points'}
                  onTransactionHistory={() => window.location.href = '/transaction-history'}
                />
                <div className="flex-1">
                  <PaymentWaiting />
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/transaction-history" element={
            <ProtectedRoute onRedirectToAuth={() => window.location.href = '/auth'}>
              <div className="h-screen flex flex-col bg-gray-50">
                <NavigationHeader
                  currentStep="transaction-history"
                  steps={APP_NAVIGATION_STEPS}
                  onBack={() => window.history.back()}
                  onHome={() => window.location.href = '/'}
                  onProfile={() => window.location.href = '/profile'}
                  onSignOut={() => {
                    // Clear auth and redirect
                    localStorage.removeItem('auth-storage');
                    window.location.href = '/auth';
                  }}
                  onBuyPoints={() => window.location.href = '/buy-points'}
                  onTransactionHistory={() => window.location.href = '/transaction-history'}
                />
                <div className="flex-1">
                  <TransactionHistory />
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </I18nProvider>
    </Router>
  );
}

export default App;