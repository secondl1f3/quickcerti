import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { ArrowLeft, User, CreditCard, Download, Star, Crown, Check, X, Plus } from 'lucide-react'
import { pointHelpers, authHelpers, type UserProfile, type PointTransaction, type UsageStats } from '../lib/supabase'
import BuyPointsModal from './BuyPointsModal';

interface ProfilePageProps {
  onBack: () => void;
  user: any;
  signOut: () => Promise<void>;
}

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  current?: boolean;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, user, signOut }) => {
  const authLoading = false; // Auth loading is handled by ProtectedRoute
  const [activeTab, setActiveTab] = useState<'profile' | 'points' | 'usage'>('profile');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [showBuyPointsModal, setShowBuyPointsModal] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState<string>('Memulai...');
  const [useProgressiveLoading, setUseProgressiveLoading] = useState(true);
  
  // Cache duration: 30 seconds
  const CACHE_DURATION = 30 * 1000;
  const MAX_RETRIES = 3;
  
  // Use refs to prevent infinite loops
  const loadProfileFirstRef = useRef<(() => Promise<void>) | null>(null);
  const loadUserDataRef = useRef<(() => Promise<void>) | null>(null);
  const loadRemainingDataRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // Only load data when auth is not loading, user is available and data hasn't been loaded yet
    // or cache has expired
    const now = Date.now();
    const cacheExpired = now - lastLoadTime > CACHE_DURATION;
    
    if (!authLoading && user?.id && (!dataLoaded || cacheExpired)) {
      // Add small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        if (useProgressiveLoading && loadProfileFirstRef.current) {
          loadProfileFirstRef.current();
        } else if (loadUserDataRef.current) {
          loadUserDataRef.current();
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [authLoading, user?.id, dataLoaded, lastLoadTime, useProgressiveLoading]);
  
  // Helper function for timeout promises
  const timeoutPromise = useCallback((promise: Promise<any>, timeout: number, name: string) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`${name} timeout after ${timeout}ms`)), timeout)
      )
    ]);
  }, []);
  
  // Progressive loading: Load profile first, then other data
  const loadProfileFirst = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress('Memuat profil pengguna...');
      
      console.log('🔄 Progressive loading: Starting with profile for:', user.id);
      
      // Load profile first
      const profileResult = await timeoutPromise(
        pointHelpers.getUserProfile(user.id),
        10000,
        'Profile data'
      );
      console.log('📊 Profile query result:', profileResult);
      
      if (profileResult?.data) {
        setUserProfile(profileResult.data);
        setLoadingProgress('Profil dimuat, memuat data lainnya...');
        console.log('✅ Profile loaded, showing partial UI');
        
        // Show partial UI immediately
        setLoading(false);
        
        // Load remaining data in background
        if (loadRemainingDataRef.current) {
          loadRemainingDataRef.current();
        }
      } else {
        throw new Error('Failed to load profile');
      }
      
    } catch (error) {
      console.error('❌ Progressive loading failed:', error);
      console.log('🔄 Current retry count:', retryCount);
      setError(error instanceof Error ? error.message : 'Gagal memuat profil');
      setLoading(false);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying progressive load (${retryCount + 1}/${MAX_RETRIES})`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (loadProfileFirstRef.current) {
            loadProfileFirstRef.current();
          }
        }, 1000 * (retryCount + 1));
      } else {
        console.log('❌ Max retries reached for loadProfileFirst');
        setDataLoaded(false);
      }
    }
  }, [user?.id, retryCount, timeoutPromise]);
  
  // Assign to ref to prevent infinite loops
  loadProfileFirstRef.current = loadProfileFirst;
  
  // Load remaining data (transactions and stats) in background
  const loadRemainingData = useCallback(async () => {
    if (!user?.id) return;
    
    console.log('🔄 Starting loadRemainingData for user:', user.id);
    
    try {
      setLoadingProgress('Memuat riwayat transaksi dan statistik...');
      
      console.log('🔍 Starting remaining data queries (transactions & usage stats)');
      const [transactionResult, statsResult] = await Promise.allSettled([
        timeoutPromise(pointHelpers.getPointTransactions(user.id, 10), 10000, 'Transaction data'),
        timeoutPromise(pointHelpers.getUsageStats(user.id), 10000, 'Usage stats')
      ]);
      console.log('💰 Transactions query result:', transactionResult);
      console.log('📈 Usage stats query result:', statsResult);
      
      // Process results
      console.log('🔄 Processing remaining data results');
      if (transactionResult.status === 'fulfilled' && transactionResult.value?.data) {
        setTransactions(transactionResult.value.data);
        console.log('💰 Background transactions data set:', transactionResult.value.data.length, 'items');
      } else {
        setTransactions([]);
        console.warn('⚠️ Background transactions loading failed');
      }
      
      if (statsResult.status === 'fulfilled' && statsResult.value?.data) {
        setUsageStats(statsResult.value.data);
        console.log('📈 Background usage stats data set:', statsResult.value.data);
      } else {
        setUsageStats({
          user_id: user.id,
          month: new Date().toISOString().slice(0, 7),
          certificates_created: 0,
          templates_used: 0,
          points_used: 0,
          downloads_count: 0
        });
        console.warn('⚠️ Background usage stats loading failed');
      }
      
      setLastLoadTime(Date.now());
      setDataLoaded(true);
      setLoadingProgress('Selesai');
      
      console.log('✅ Background data loading completed');
      
    } catch (error) {
      console.error('❌ Background loading failed:', error);
      // Don't show error for background loading, just log it
    } finally {
      console.log('🏁 loadRemainingData completed');
    }
  }, [user?.id, timeoutPromise]);
  
  // Assign to ref to prevent infinite loops
  loadRemainingDataRef.current = loadRemainingData;

  const loadUserData = useCallback(async () => {
    // Early return if user is not available
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLoadingProgress('Memuat data profil...');
      const startTime = performance.now();
      console.log('🔄 Starting to load user data for:', user.id);
      
      // Load data with timeout protection (15 seconds each)
      setLoadingProgress('Memuat profil pengguna...');
      console.log('🔍 Starting profile query for user:', user.id);
      const profilePromise = timeoutPromise(
        pointHelpers.getUserProfile(user.id).then(result => {
          const profileTime = performance.now() - startTime;
          console.log(`✅ Profile loaded in ${profileTime.toFixed(2)}ms`);
          console.log('📊 Profile query result:', result);
          return result;
        }),
        15000,
        'Profile loading'
      );
      
      setLoadingProgress('Memuat riwayat transaksi...');
      console.log('🔍 Starting transactions query for user:', user.id);
      const transactionsPromise = timeoutPromise(
        pointHelpers.getPointTransactions(user.id, 10).then(result => {
          const transactionTime = performance.now() - startTime;
          console.log(`✅ Transactions loaded in ${transactionTime.toFixed(2)}ms`);
          console.log('💰 Transactions query result:', result);
          return result;
        }),
        15000,
        'Transactions loading'
      );
      
      setLoadingProgress('Memuat statistik penggunaan...');
      console.log('🔍 Starting usage stats query for user:', user.id);
      const statsPromise = timeoutPromise(
        pointHelpers.getUsageStats(user.id).then(result => {
          const statsTime = performance.now() - startTime;
          console.log(`✅ Usage stats loaded in ${statsTime.toFixed(2)}ms`);
          console.log('📈 Usage stats query result:', result);
          return result;
        }),
        15000,
        'Usage stats loading'
      );
      
      const [profileResult, transactionResult, statsResult] = await Promise.allSettled([
        profilePromise,
        transactionsPromise,
        statsPromise
      ]);
      
      const totalTime = performance.now() - startTime;
      console.log(`🎉 Data loading completed in ${totalTime.toFixed(2)}ms`);
      
      setLoadingProgress('Memproses data...');
      
      setLoadingProgress('Memproses hasil...');
      console.log('🔄 Processing query results:', [profileResult, transactionResult, statsResult]);
      
      // Handle results with fallback data
      if (profileResult.status === 'fulfilled' && profileResult.value?.data) {
        setUserProfile(profileResult.value.data);
        console.log('✅ Profile data set successfully:', profileResult.value.data);
      } else {
        console.warn('⚠️ Profile loading failed, using fallback data');
        setUserProfile({
          id: user.id,
          email: user.email || '',
          points_balance: 0,
          total_points_purchased: 0,
          total_points_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      if (transactionResult.status === 'fulfilled' && transactionResult.value?.data) {
        setTransactions(transactionResult.value.data);
        console.log('✅ Transaction data set successfully:', transactionResult.value.data.length, 'items');
      } else {
        console.warn('⚠️ Transaction loading failed, using empty array');
        setTransactions([]);
      }
      
      if (statsResult.status === 'fulfilled' && statsResult.value?.data) {
        setUsageStats(statsResult.value.data);
        console.log('✅ Usage stats data set successfully:', statsResult.value.data);
      } else {
        console.warn('⚠️ Usage stats loading failed, using default data');
        setUsageStats({
          user_id: user.id,
          month: new Date().toISOString().slice(0, 7),
          certificates_created: 0,
          templates_used: 0,
          points_used: 0,
          downloads_count: 0
        });
      }
      
      setLoadingProgress('Menyelesaikan...');
      
      // Check if any critical data failed to load
      const failedRequests = [
        profileResult.status === 'rejected' ? 'Profile' : null,
        transactionResult.status === 'rejected' ? 'Transactions' : null,
        statsResult.status === 'rejected' ? 'Usage Stats' : null
      ].filter(Boolean);
      
      if (failedRequests.length > 0) {
        console.warn(`⚠️ Some data failed to load: ${failedRequests.join(', ')}`);
        // Don't throw error, just show warning
      }
      
      setLoadingProgress('Selesai');
      setDataLoaded(true);
      setLastLoadTime(Date.now());
      setError(null);
      setRetryCount(0);
      
      const standardLoadTime = performance.now() - startTime;
      console.log(`🎯 Standard loading time: ${standardLoadTime.toFixed(2)}ms`);
      console.log('✅ Standard loading final state:', { 
        hasProfile: !!userProfile, 
        transactionCount: transactions.length, 
        hasUsageStats: !!usageStats 
      });
    } catch (error) {
      console.error('❌ Critical error loading user data:', error);
      console.log('🔄 Retry count:', retryCount);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data. Silakan coba lagi.');
      setDataLoaded(false);
    } finally {
      setLoading(false);
      setLoadingProgress('');
      console.log('🏁 loadUserData completed');
    }
  }, [user?.id, timeoutPromise]);
  
  // Assign to ref to prevent infinite loops
  loadUserDataRef.current = loadUserData;

  const plans: Plan[] = useMemo(() => [
    {
      name: 'Gratis',
      price: 'Rp 0',
      period: '/bulan',
      description: 'Cocok untuk penggunaan personal',
      current: true,
      features: [
        { name: '10 sertifikat per bulan', included: true },
        { name: 'Template dasar', included: true },
        { name: 'Export PDF/PNG', included: true },
        { name: 'Watermark CertifikatKu', included: true },
        { name: 'Batch generation', included: false },
        { name: 'Template premium', included: false },
        { name: 'Custom branding', included: false },
        { name: 'Priority support', included: false },
      ]
    },
    {
      name: 'Pro',
      price: 'Rp 99.000',
      period: '/bulan',
      description: 'Untuk profesional dan bisnis kecil',
      popular: true,
      features: [
        { name: '100 sertifikat per bulan', included: true },
        { name: 'Semua template', included: true },
        { name: 'Export tanpa watermark', included: true },
        { name: 'Batch generation', included: true },
        { name: 'Custom branding', included: true },
        { name: 'Analytics dasar', included: true },
        { name: 'Email support', included: true },
        { name: 'API access', included: false },
      ]
    },
    {
      name: 'Enterprise',
      price: 'Rp 299.000',
      period: '/bulan',
      description: 'Untuk organisasi besar',
      features: [
        { name: 'Unlimited sertifikat', included: true },
        { name: 'Semua template + custom', included: true },
        { name: 'White-label solution', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'API access', included: true },
        { name: 'Priority support', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Dedicated account manager', included: true },
      ]
    }
  ], []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      onBack();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [signOut, onBack]);

  const handleBuyPointsSuccess = useCallback(() => {
    // Refresh user data after successful point purchase
    setDataLoaded(false);
    setLastLoadTime(0); // Force cache invalidation
    setError(null);
    setRetryCount(0);
  }, []);

  const handleRetry = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setDataLoaded(false);
      setLastLoadTime(0);
    }
  }, [retryCount]);



  // Skeleton loading component
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat otentikasi...</p>
          <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
              </div>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                <span className="text-sm text-gray-600">{loadingProgress}</span>
                <button
                  onClick={() => setUseProgressiveLoading(!useProgressiveLoading)}
                  className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 hover:bg-gray-200"
                  title="Toggle progressive loading"
                >
                  {useProgressiveLoading ? 'Progressive' : 'Standard'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <SkeletonLoader />
      </div>
    );
  }

  // Error state with retry option
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gagal Memuat Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            {retryCount < MAX_RETRIES ? (
              <button
                onClick={handleRetry}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Coba Lagi ({retryCount + 1}/{MAX_RETRIES})
              </button>
            ) : (
              <p className="text-sm text-gray-500">Maksimal percobaan tercapai. Silakan refresh halaman.</p>
            )}
            <button
              onClick={onBack}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If auth is done loading but no user, redirect back
  if (!authLoading && !user) {
    onBack();
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
                {loadingProgress !== 'Selesai' && loadingProgress !== 'Memulai...' && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-500"></div>
                    <span>{loadingProgress}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setUseProgressiveLoading(!useProgressiveLoading)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    useProgressiveLoading 
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Toggle loading mode"
                >
                  {useProgressiveLoading ? '⚡ Progressive' : '📦 Standard'}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Keluar
                </button>
              </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profil</span>
              </button>
              <button
                onClick={() => setActiveTab('points')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'points'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Saldo Point</span>
              </button>
              <button
                onClick={() => setActiveTab('usage')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'usage'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Download className="w-5 h-5" />
                <span>Penggunaan</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Profil</h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      {userProfile?.avatar_url ? (
                        <img 
                          src={userProfile.avatar_url} 
                          alt="Profile" 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{userProfile?.full_name || user?.email}</h3>
                      <p className="text-gray-600">Member sejak {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}</p>
                      <div className="flex items-center mt-2">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">Member Aktif</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organisasi
                    </label>
                    <input
                      type="text"
                      placeholder="Nama organisasi/perusahaan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <button className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'points' && (
              <div className="space-y-6">
                {/* Saldo Point */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Saldo Point</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <h3 className="font-medium text-green-900">Point Tersedia</h3>
                        <p className="text-sm text-green-700">1 point = 1 download sertifikat</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-900">{userProfile?.points_balance || 0}</div>
                        <div className="text-sm text-green-700">point</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Harga Point</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <div>• 1 point = Rp 100</div>
                        <div>• 100 point = Rp 10.000</div>
                        <div>• 500 point = Rp 50.000</div>
                        <div>• 1000 point = Rp 100.000</div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t space-y-2">
                      <button 
                        onClick={() => setShowBuyPointsModal(true)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Beli Point
                      </button>
                    </div>
                  </div>
                </div>

                {/* Riwayat Transaksi */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Transaksi</h3>
                  <div className="space-y-3">
                    {transactions.length > 0 ? (
                      transactions.map((transaction) => {
                        const isPositive = transaction.amount > 0;
                        const colorClass = transaction.type === 'bonus' ? 'green' : 
                                         transaction.type === 'purchase' ? 'blue' : 'red';
                        
                        return (
                          <div key={transaction.id} className={`flex justify-between items-center p-3 bg-${colorClass}-50 rounded-lg`}>
                            <div>
                              <div className={`font-medium text-${colorClass}-800`}>{transaction.description}</div>
                              <div className={`text-sm text-${colorClass}-600`}>
                                {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                            <div className={`text-${colorClass}-600 font-bold`}>
                              {isPositive ? '+' : ''}{transaction.amount}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        Belum ada riwayat transaksi
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Penggunaan Bulan Ini</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{usageStats?.certificates_created || 0}</div>
                      <div className="text-sm text-gray-600">Sertifikat Dibuat</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{usageStats?.templates_used || 0}</div>
                      <div className="text-sm text-gray-600">Template Digunakan</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{usageStats?.points_used || 0}</div>
                      <div className="text-sm text-gray-600">Point Terpakai</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">100</div>
                      <div className="text-sm text-gray-600">Bonus Point Gratis</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Akun</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Point Dibeli</span>
                      <span className="font-medium">{userProfile?.total_points_purchased || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Point Terpakai</span>
                      <span className="font-medium">{userProfile?.total_points_used || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saldo Point Saat Ini</span>
                      <span className="font-medium text-blue-600">{userProfile?.points_balance || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Download Bulan Ini</span>
                      <span className="font-medium">{usageStats?.downloads_count || 0}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Download</h3>
                  <div className="text-center text-gray-500 py-8">
                    <Download className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Belum ada riwayat download</p>
                    <p className="text-sm">Sertifikat yang Anda buat akan muncul di sini</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Buy Points Modal */}
      {showBuyPointsModal && (
          <BuyPointsModal
            user={user}
            isOpen={showBuyPointsModal}
            onClose={() => setShowBuyPointsModal(false)}
            onSuccess={() => {
              setShowBuyPointsModal(false);
              handleBuyPointsSuccess();
            }}
        />
      )}
    </div>
  );
};