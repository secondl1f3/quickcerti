import React, { useState, useEffect } from 'react';
import { X, CreditCard, Copy, MessageCircle, Clock, Check, ExternalLink } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { pointHelpers } from '../lib/supabase';

interface BuyPointsModalProps {
  user?: SupabaseUser | null;
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface PointPackage {
  points: number
  price: number
  popular?: boolean
}

const pointPackages: PointPackage[] = [
  { points: 50, price: 5000 },
  { points: 100, price: 10000, popular: true },
  { points: 250, price: 25000 },
  { points: 500, price: 50000 },
  { points: 1000, price: 100000 }
]

const bankInfo = {
  bankName: 'Bank BCA',
  accountNumber: '1234567890',
  accountName: 'PT Sakan Labs Innovations',
  branch: 'Cabang Jakarta Pusat'
}

export default function BuyPointsModal({ user, isOpen, onClose, onSuccess }: BuyPointsModalProps) {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [selectedPackage, setSelectedPackage] = useState<PointPackage | null>(null)
  const [customPoints, setCustomPoints] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [step, setStep] = useState(1) // 1: Select, 2: Payment Info, 3: WhatsApp, 4: Waiting
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadUserProfile()
    }
  }, [user?.id])

  const loadUserProfile = async () => {
    try {
      const { data: profile } = await pointHelpers.getUserProfile(user!.id)
      if (profile) {
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const currentPoints = isCustom ? parseInt(customPoints) || 0 : selectedPackage?.points || 0
  const currentPrice = currentPoints * 100 // 1 point = Rp 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const generateTransactionId = () => {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `TRX${timestamp.slice(-6)}${random}`
  }

  const handleSelectPackage = (pkg: PointPackage) => {
    setSelectedPackage(pkg)
    setIsCustom(false)
    setCustomPoints('')
  }

  const handleCustomPoints = () => {
    setIsCustom(true)
    setSelectedPackage(null)
  }

  const handleProceedToPayment = async () => {
    if (currentPoints <= 0 || !user?.id) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      const newTransactionId = generateTransactionId()
      setTransactionId(newTransactionId)
      
      // Create pending transaction record in database
      const { error: transactionError } = await pointHelpers.recordPointTransaction(
        user.id,
        'purchase',
        currentPoints,
        `Pembelian ${currentPoints} point - Pending Payment`,
        newTransactionId
      )
        
      if (transactionError) {
        throw new Error('Gagal membuat transaksi: ' + transactionError.message)
      }
        
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendToWhatsApp = () => {
    const message = `Halo, saya ingin konfirmasi pembayaran pembelian point:\n\n` +
      `📋 Detail Transaksi:\n` +
      `• ID Transaksi: ${transactionId}\n` +
      `• Jumlah Point: ${currentPoints.toLocaleString('id-ID')} point\n` +
      `• Total Pembayaran: ${formatCurrency(currentPrice)}\n\n` +
      `💳 Transfer ke:\n` +
      `• Bank: ${bankInfo.bankName}\n` +
      `• No. Rekening: ${bankInfo.accountNumber}\n` +
      `• Atas Nama: ${bankInfo.accountName}\n\n` +
      `Mohon konfirmasi setelah transfer berhasil. Terima kasih! 🙏`

    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    // Move to waiting step
    setStep(4)
  }



  const resetModal = () => {
    setStep(1)
    setSelectedPackage(null)
    setIsCustom(false)
    setCustomPoints('')
    setTransactionId('')
    setCopiedField(null)
    setIsProcessing(false)
    setError(null)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              {step === 1 ? 'Beli Point' : 
               step === 2 ? 'Informasi Transfer' : 
               step === 3 ? 'Kirim Bukti Pembayaran' :
               'Menunggu Konfirmasi'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Saldo saat ini: <span className="font-medium">{(userProfile?.points || 0).toLocaleString('id-ID')} point</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg mx-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="p-6">
          {/* Step 1: Select Points */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Pilih Paket Point</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pointPackages.map((pkg) => (
                    <div 
                      key={pkg.points}
                      className={`cursor-pointer transition-all duration-200 border rounded-lg ${
                        selectedPackage?.points === pkg.points 
                          ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-500' 
                          : 'hover:shadow-md border-gray-200'
                      }`}
                      onClick={() => handleSelectPackage(pkg)}
                    >
                      <div className="p-4">
                        <div className="text-center relative">
                          {pkg.popular && (
                            <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium bg-orange-500 text-white rounded-full">
                              Populer
                            </span>
                          )}
                          <div className="text-2xl font-bold text-blue-600">{pkg.points.toLocaleString('id-ID')}</div>
                          <div className="text-sm text-gray-600 mb-2">Point</div>
                          <div className="text-lg font-semibold">{formatCurrency(pkg.price)}</div>
                          <div className="text-xs text-gray-500">Rp 100/point</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              <div>
                <h3 className="text-lg font-medium mb-4">Atau Jumlah Custom</h3>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label htmlFor="customPoints" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Point</label>
                    <input
                      id="customPoints"
                      type="number"
                      placeholder="Masukkan jumlah point"
                      value={customPoints}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCustomPoints(e.target.value)
                        handleCustomPoints()
                      }}
                      min="1"
                      max="10000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Biaya</label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                      {isCustom && customPoints ? formatCurrency(parseInt(customPoints) * 100) : 'Rp 0'}
                    </div>
                  </div>
                </div>
                {isCustom && customPoints && (
                  <p className="text-sm text-gray-600 mt-2">
                    Minimum: 1 point • Maximum: 10.000 point
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleProceedToPayment}
                  disabled={currentPoints === 0 || isProcessing}
                  className="min-w-[120px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Memproses...
                    </>
                  ) : (
                    'Lanjutkan'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Detail Pembelian</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>ID Transaksi:</span>
                    <span className="font-mono font-medium">{transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jumlah Point:</span>
                    <span className="font-medium">{currentPoints.toLocaleString('id-ID')} point</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Harga per Point:</span>
                    <span>Rp 100</span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Pembayaran:</span>
                    <span className="text-blue-600">{formatCurrency(currentPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Informasi Transfer
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Transfer ke rekening berikut dan simpan bukti pembayaran
                  </p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nama Bank</label>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="font-medium">{bankInfo.bankName}</span>
                        <button
                          onClick={() => copyToClipboard(bankInfo.bankName, 'bank')}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {copiedField === 'bank' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nomor Rekening</label>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="font-mono font-medium">{bankInfo.accountNumber}</span>
                        <button
                          onClick={() => copyToClipboard(bankInfo.accountNumber, 'account')}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {copiedField === 'account' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Atas Nama</label>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="font-medium">{bankInfo.accountName}</span>
                        <button
                          onClick={() => copyToClipboard(bankInfo.accountName, 'name')}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {copiedField === 'name' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Cabang</label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <span className="font-medium">{bankInfo.branch}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Penting!</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Transfer sesuai dengan nominal yang tertera</li>
                      <li>• Simpan bukti transfer untuk konfirmasi</li>
                      <li>• Point akan ditambahkan setelah pembayaran dikonfirmasi</li>
                      <li>• Proses konfirmasi maksimal 1x24 jam</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Kembali
                </button>
                <button onClick={handleSendToWhatsApp} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  Kirim ke WhatsApp
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Waiting for Confirmation */}
          {step === 4 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Menunggu Konfirmasi Pembayaran</h3>
              <p className="text-gray-600 mb-6">
                Kami akan memverifikasi pembayaran Anda dan menambahkan point dalam 1-24 jam.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>ID Transaksi:</strong> {transactionId}<br/>
                  <strong>Jumlah Point:</strong> {currentPoints.toLocaleString('id-ID')} point<br/>
                  <strong>Total Pembayaran:</strong> {formatCurrency(currentPrice)}
                </p>
              </div>
              

              
              <button
                onClick={resetModal}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}