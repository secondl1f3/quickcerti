import React, { useState } from 'react'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface UserProfileProps {
  user?: SupabaseUser | null;
  signOut?: () => Promise<{ error: any }>;
  onViewProfile?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, signOut, onViewProfile }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoggingOut(false)
      setIsDropdownOpen(false)
    }
  }

  if (!user) return null

  const userEmail = user.email || 'User'
  const userInitial = userEmail.charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">{userInitial}</span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
            {userEmail}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{userInitial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userEmail}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email_confirmed_at ? 'Terverifikasi' : 'Belum terverifikasi'}
                  </p>
                </div>
              </div>
            </div>

            <div className="py-2">
              {onViewProfile && (
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  onClick={() => {
                    setIsDropdownOpen(false)
                    onViewProfile()
                  }}
                >
                  <User className="w-4 h-4" />
                  <span>Lihat Profil</span>
                </button>
              )}
              
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                onClick={() => {
                  setIsDropdownOpen(false)
                  // Add profile settings functionality here
                }}
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan Profil</span>
              </button>
              
              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}