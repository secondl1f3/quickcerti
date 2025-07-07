import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, authHelpers, pointHelpers } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  extendSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null)
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null)

  // Auto-logout after 1 hour of inactivity
  const AUTO_LOGOUT_TIME = 60 * 60 * 1000 // 1 hour in milliseconds
  const WARNING_TIME = 55 * 60 * 1000 // Show warning 5 minutes before logout

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    // Clear existing timers
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }
    if (warningTimer) {
      clearTimeout(warningTimer)
    }
    
    if (user) {
      // Set warning timer (5 minutes before logout)
      const warnTimer = setTimeout(() => {
        const shouldExtend = window.confirm(
          'Sesi Anda akan berakhir dalam 5 menit karena tidak ada aktivitas. Klik OK untuk memperpanjang sesi atau Cancel untuk logout sekarang.'
        )
        
        if (shouldExtend) {
          resetInactivityTimer() // Reset timer if user wants to extend
        } else {
          signOut() // Logout immediately if user chooses
        }
      }, WARNING_TIME)
      
      // Set auto-logout timer
      const logoutTimer = setTimeout(async () => {
        console.log('Auto-logout due to inactivity')
        await signOut()
      }, AUTO_LOGOUT_TIME)
      
      setWarningTimer(warnTimer)
      setInactivityTimer(logoutTimer)
    }
  }

  // Track user activity
  const trackActivity = () => {
    if (user) {
      resetInactivityTimer()
    }
  }

  // Ensure user has a profile in user_profiles table
  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: profile, error } = await pointHelpers.getUserProfile(user.id)
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating new user profile for:', user.email)
        await pointHelpers.initializeNewUser(
          user.id,
          user.email || '',
          user.user_metadata?.full_name
        )
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
      // Don't let profile creation errors block the auth flow
    }
  }

  useEffect(() => {
    // Fallback timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('⚠️ Loading timeout reached, forcing loading to false')
      setLoading(false)
    }, 5000) // 5 second timeout

    // Get initial session
    const getInitialSession = async () => {
      console.log('🔄 Getting initial session...')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('📊 Initial session:', { hasSession: !!session, userEmail: session?.user?.email })
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Check if user has profile for existing session
        if (session?.user) {
          console.log('👤 User found, ensuring profile exists')
          // Run profile creation in background, don't wait for it
          ensureUserProfile(session.user).catch(console.error)
          resetInactivityTimer() // Start inactivity timer for existing session
        }
        
        console.log('✅ Initial session setup complete, setting loading to false')
        clearTimeout(loadingTimeout)
        setLoading(false)
      } catch (error) {
        console.error('❌ Error getting initial session:', error)
        clearTimeout(loadingTimeout)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', { event, user: session?.user?.email, hasSession: !!session })
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Check if user has profile, create if not exists
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          console.log('✅ User signed in, ensuring profile exists')
          // Run profile creation in background, don't wait for it
          ensureUserProfile(session.user).catch(console.error)
          resetInactivityTimer() // Start/reset timer on sign in or token refresh
        } else if (event === 'SIGNED_OUT') {
           console.log('👋 User signed out, clearing timers')
           // Clear all timers on sign out
           if (inactivityTimer) {
             clearTimeout(inactivityTimer)
             setInactivityTimer(null)
           }
           if (warningTimer) {
             clearTimeout(warningTimer)
             setWarningTimer(null)
           }
         }
        
        setLoading(false)
        console.log('📊 Auth state updated:', { user: session?.user?.email, loading: false })
      }
    )

    return () => {
       subscription.unsubscribe()
       clearTimeout(loadingTimeout)
       if (inactivityTimer) {
         clearTimeout(inactivityTimer)
       }
       if (warningTimer) {
         clearTimeout(warningTimer)
       }
     }
  }, [])

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    const result = await authHelpers.signUp(email, password)
    setLoading(false)
    return result
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const result = await authHelpers.signIn(email, password)
    setLoading(false)
    return result
  }

  const signOut = async () => {
    setLoading(true)
    
    // Clear all timers
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
      setInactivityTimer(null)
    }
    if (warningTimer) {
      clearTimeout(warningTimer)
      setWarningTimer(null)
    }
    
    const result = await authHelpers.signOut()
    setLoading(false)
    return result
  }

  // Function to extend session manually
  const extendSession = () => {
    if (user) {
      resetInactivityTimer()
    }
  }

  // Set up activity listeners
  useEffect(() => {
    if (user) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
      
      events.forEach(event => {
        document.addEventListener(event, trackActivity, true)
      })
      
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, trackActivity, true)
        })
      }
    }
  }, [user])

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    extendSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}