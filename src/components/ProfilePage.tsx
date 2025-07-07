import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, CreditCard, Download, Star, Crown, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { pointHelpers, authHelpers, type UserProfile, type PointTransaction, type UsageStats } from '../lib/supabase';

interface ProfilePageProps {
  onBack: () => void;
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

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'points' | 'usage'>('profile');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await authHelpers.getCurrentUser();
      
      if (currentUser) {
        // Load user profile
        const { data: profile } = await pointHelpers.getUserProfile(currentUser.id);
        if (profile) {
          setUserProfile(profile);
        }

        // Load transactions
        const { data: transactionData } = await pointHelpers.getPointTransactions(currentUser.id, 10);
        if (transactionData) {
          setTransactions(transactionData);
        }

        // Load usage stats
        const { data: statsData } = await pointHelpers.getUsageStats(currentUser.id);
        if (statsData) {
          setUsageStats(statsData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const plans: Plan[] = [
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
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      onBack();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleBuyPoints = () => {
    // Placeholder for payment integration
    alert('Fitur pembelian point akan segera tersedia!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data profil...</p>
        </div>
      </div>
    );
  };

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
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Keluar
            </button>
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
                        onClick={handleBuyPoints}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
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
    </div>
  );
};