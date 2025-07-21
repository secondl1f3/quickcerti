import React, { useState, useCallback, useRef, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { AuthWrapper } from './components/AuthWrapper';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NavigationHeader } from './components/NavigationHeader';
import { useDesignStore } from './store/designStore';
import { useDataStore } from './store/dataStore';
import { useAuthStore } from './store/authStore';
import { DesignElement, Tool } from './types';
import { I18nProvider } from './i18n/i18nContext';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { Footer } from './components/Footer';

// Lazy load components that are not needed immediately
const Sidebar = lazy(() => import('./components/Sidebar').then(module => ({ default: module.Sidebar })));
const Canvas = lazy(() => import('./components/Canvas').then(module => ({ default: module.Canvas })));
const PropertiesPanel = lazy(() => import('./components/PropertiesPanel').then(module => ({ default: module.PropertiesPanel })));
const DataManager = lazy(() => import('./components/DataManager').then(module => ({ default: module.DataManager })));
const GenerateModal = lazy(() => import('./components/GenerateModal').then(module => ({ default: module.GenerateModal })));
const TemplateModal = lazy(() => import('./components/TemplateModal').then(module => ({ default: module.TemplateModal })));
const PreviewModal = lazy(() => import('./components/PreviewModal').then(module => ({ default: module.PreviewModal })));
const ExportModal = lazy(() => import('./components/ExportModal').then(module => ({ default: module.ExportModal })));
const TemplateSelection = lazy(() => import('./components/TemplateSelection').then(module => ({ default: module.TemplateSelection })));
const UploadTemplate = lazy(() => import('./components/UploadTemplate').then(module => ({ default: module.UploadTemplate })));
const EditorHeader = lazy(() => import('./components/EditorHeader').then(module => ({ default: module.EditorHeader })));
const BuyPoints = lazy(() => import('./components/BuyPoints').then(module => ({ default: module.BuyPoints })));
const PaymentWaiting = lazy(() => import('./components/PaymentWaiting').then(module => ({ default: module.PaymentWaiting })));
const TransactionHistory = lazy(() => import('./components/TransactionHistory').then(module => ({ default: module.TransactionHistory })));
const Profile = lazy(() => import('./components/Profile').then(module => ({ default: module.Profile })));
const CertificateHub = lazy(() => import('./components/CertificateHub').then(module => ({ default: module.CertificateHub })));
const CertificateDesigner = lazy(() => import('./components/CertificateDesigner').then(module => ({ default: module.CertificateDesigner })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
  </div>
);

type AppView = 'auth' | 'landing' | 'template-selection' | 'editor' | 'profile' | 'certificate-hub' | 'admin';

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
      case '/admin':
        return 'admin';
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
    elements,
    selectedElement,
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
      'certificate-hub': '/certificate-hub',
      'admin': '/admin'
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
              onBack={handleBackNavigation}
              onHome={() => handleNavigateToView('landing')}
              onProfile={() => handleNavigateToView('profile')}
              onSignOut={handleSignOut}
              onBuyPoints={() => navigate('/buy-points')}
              onTransactionHistory={() => navigate('/transaction-history')}
              onAdmin={() => navigate('/admin')}
            />
            <div className="flex-1 flex flex-col">
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
              <Footer />
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
                // Create a new image to get the actual dimensions
                const img = new Image();
                img.onload = () => {
                  // Use the actual image dimensions
                  const backgroundElement = {
                    id: Date.now().toString(),
                    type: 'image' as const,
                    x: 0,
                    y: 0,
                    width: img.width,
                    height: img.height,
                    position: { x: 0, y: 0 },
                    size: { width: img.width, height: img.height },
                    rotation: 0,
                    opacity: 1,
                    zIndex: 0,
                    imageUrl: imageUrl,
                    locked: true // Lock the background so it can't be accidentally moved
                  };
                  
                  setElements([backgroundElement]);
                  setShowUploadTemplate(false);
                  handleNavigateToView('editor');
                };
                img.src = imageUrl;
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
               onBack={handleBackNavigation}
               onHome={() => handleNavigateToView('landing')}
               onProfile={() => handleNavigateToView('profile')}
               onSignOut={handleSignOut}
               onBuyPoints={() => navigate('/buy-points')}
               onTransactionHistory={() => navigate('/transaction-history')}
               onAdmin={() => navigate('/admin')}
             />
            <div className="flex-1 flex flex-col">
              <div className="flex-1">
                <Profile />
              </div>
              <Footer />
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
              onBack={handleBackNavigation}
              onHome={() => handleNavigateToView('landing')}
              onProfile={() => handleNavigateToView('profile')}
              onSignOut={handleSignOut}
              onBuyPoints={() => navigate('/buy-points')}
              onTransactionHistory={() => navigate('/transaction-history')}
              onAdmin={() => navigate('/admin')}
            />
            <div className="flex-1 flex flex-col">
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
                    if (template.templateUrl) {
                      const img = new Image();
                      img.onload = () => {
                        const backgroundElement = {
                          id: Date.now().toString(),
                          type: 'image' as const,
                          x: 0,
                          y: 0,
                          width: img.width,
                          height: img.height,
                          position: { x: 0, y: 0 },
                          size: { width: img.width, height: img.height },
                          rotation: 0,
                          opacity: 1,
                          zIndex: 0,
                          imageUrl: template.templateUrl,
                          locked: true
                        };
                        
                        setElements([backgroundElement, ...(Array.isArray(template.elements) ? template.elements : [])]);
                        handleNavigateToView('editor');
                      };
                      img.src = template.templateUrl;
                    } else {
                      setElements(template.elements);
                      handleNavigateToView('editor');
                    }
                  }}
                />
              </div>
              <Footer />
            </div>
            
            {/* Upload Template Modal */}
            {showUploadTemplate && (
              <UploadTemplate 
                onClose={() => setShowUploadTemplate(false)}
                onUploadSuccess={(imageUrl) => {
                  // Create a new image to get the actual dimensions
                  const img = new Image();
                  img.onload = () => {
                    // Use the actual image dimensions
                    const backgroundElement = {
                      id: Date.now().toString(),
                      type: 'image' as const,
                      x: 0,
                      y: 0,
                      width: img.width,
                      height: img.height,
                      position: { x: 0, y: 0 },
                      size: { width: img.width, height: img.height },
                      rotation: 0,
                      opacity: 1,
                      zIndex: 0,
                      imageUrl: imageUrl,
                      locked: true
                    };
                    
                    setElements([backgroundElement]);
                    setShowUploadTemplate(false);
                    handleNavigateToView('editor');
                  };
                  img.src = imageUrl;
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
          <Route path="/" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppContent />
            </Suspense>
          } />
          <Route path="/auth" element={<AuthWrapper onAuthSuccess={() => window.location.href = '/'} />} />
          <Route path="/landing" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppContent />
            </Suspense>
          } />
          <Route path="/template-selection" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppContent />
            </Suspense>
          } />
          <Route path="/certificate-hub" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppContent />
            </Suspense>
          } />
          <Route path="/editor" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppContent />
            </Suspense>
          } />
          <Route path="/profile" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppContent />
            </Suspense>
          } />
          <Route path="/buy-points" element={
            <ProtectedRoute onRedirectToAuth={() => window.location.href = '/auth'}>
              <div className="h-screen flex flex-col bg-gray-50">
                <NavigationHeader
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
                  onAdmin={() => window.location.href = '/admin'}
                />
                <div className="flex-1 flex flex-col">
                  <div className="flex-1">
                    <Suspense fallback={<LoadingSpinner />}>
                      <BuyPoints />
                    </Suspense>
                  </div>
                  <Footer />
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/payment-waiting/:transactionId" element={
            <ProtectedRoute onRedirectToAuth={() => window.location.href = '/auth'}>
              <div className="h-screen flex flex-col bg-gray-50">
                <NavigationHeader
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
                  onAdmin={() => window.location.href = '/admin'}
                />
                <div className="flex-1 flex flex-col">
                  <div className="flex-1">
                    <Suspense fallback={<LoadingSpinner />}>
                      <PaymentWaiting />
                    </Suspense>
                  </div>
                  <Footer />
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/transaction-history" element={
            <ProtectedRoute onRedirectToAuth={() => window.location.href = '/auth'}>
              <div className="h-screen flex flex-col bg-gray-50">
                <NavigationHeader
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
                  onAdmin={() => window.location.href = '/admin'}
                />
                <div className="flex-1 flex flex-col">
                  <div className="flex-1">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TransactionHistory />
                    </Suspense>
                  </div>
                  <Footer />
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminProtectedRoute onRedirectToAuth={() => window.location.href = '/auth'}>
              <div className="min-h-screen flex flex-col">
                <div className="flex-1">
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminDashboard />
                  </Suspense>
                </div>
                <Footer />
              </div>
            </AdminProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </I18nProvider>
    </Router>
  );
}

export default App;