import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Login } from './Login'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, signOut } = useAuth()

  console.log('🛡️ ProtectedRoute state:', { hasUser: !!user, loading, userEmail: user?.email })

  if (loading) {
    console.log('⏳ ProtectedRoute: Still loading auth state')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    console.log('🚫 ProtectedRoute: No user, showing login')
    return <Login onSuccess={() => {
      console.log('🔄 Login success callback triggered')
      // Auth state will update automatically via AuthContext
    }} />
  }

  console.log('✅ ProtectedRoute: User authenticated, showing protected content')
  return <>{children}</>
}