import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// Note: Replace these with your actual Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  points_balance: number
  total_points_purchased: number
  total_points_used: number
  created_at: string
  updated_at: string
}

export interface PointTransaction {
  id: string
  user_id: string
  type: 'purchase' | 'usage' | 'bonus'
  amount: number
  description: string
  reference_id?: string
  created_at: string
}

export interface CertificateDownload {
  id: string
  user_id: string
  template_id: string
  template_name: string
  points_used: number
  download_url?: string
  created_at: string
}

export interface UsageStats {
  user_id: string
  month: string
  certificates_created: number
  templates_used: number
  points_used: number
  downloads_count: number
}

// Auth helper functions
const authHelpers = {
  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Export individual auth functions for compatibility
const signUp = authHelpers.signUp
const signIn = authHelpers.signIn
const signOut = authHelpers.signOut
const getCurrentUser = authHelpers.getCurrentUser
const onAuthStateChange = authHelpers.onAuthStateChange

// Point system helper functions
const pointHelpers = {
  // Get user profile with points
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Create or update user profile
  upsertUserProfile: async (profile: Partial<UserProfile>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profile)
      .select()
      .single()
    return { data, error }
  },

  // Add points to user balance
  addPoints: async (userId: string, amount: number, type: 'purchase' | 'bonus', description: string, referenceId?: string) => {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('points_balance, total_points_purchased')
      .eq('id', userId)
      .single()

    if (profileError) return { data: null, error: profileError }

    const newBalance = (profile.points_balance || 0) + amount

    // Get current total_points_purchased for update
    const currentPurchased = type === 'purchase' ? (profile.total_points_purchased || 0) + amount : (profile.total_points_purchased || 0)
    
    // Update user balance
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        points_balance: newBalance,
        total_points_purchased: currentPurchased,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) return { data: null, error: updateError }

    // Record transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type,
        amount,
        description,
        reference_id: referenceId
      })
      .select()
      .single()

    return { data: { newBalance, transaction }, error: transactionError }
  },

  // Use points (deduct from balance)
  usePoints: async (userId: string, amount: number, description: string, referenceId?: string) => {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('points_balance, total_points_used')
      .eq('id', userId)
      .single()

    if (profileError) return { data: null, error: profileError }

    if ((profile.points_balance || 0) < amount) {
      return { data: null, error: { message: 'Insufficient points balance' } }
    }

    const newBalance = profile.points_balance - amount
    const newTotalUsed = (profile.total_points_used || 0) + amount

    // Update user balance
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        points_balance: newBalance,
        total_points_used: newTotalUsed,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) return { data: null, error: updateError }

    // Record transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type: 'usage',
        amount: -amount,
        description,
        reference_id: referenceId
      })
      .select()
      .single()

    return { data: { newBalance, transaction }, error: transactionError }
  },

  // Get point transactions history
  getPointTransactions: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Record certificate download
  recordCertificateDownload: async (userId: string, templateId: string, templateName: string, pointsUsed: number, downloadUrl?: string) => {
    const { data, error } = await supabase
      .from('certificate_downloads')
      .insert({
        user_id: userId,
        template_id: templateId,
        template_name: templateName,
        points_used: pointsUsed,
        download_url: downloadUrl
      })
      .select()
      .single()
    return { data, error }
  },

  // Get download history
  getDownloadHistory: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('certificate_downloads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Get or create usage stats for current month
  getUsageStats: async (userId: string, month?: string) => {
    const targetMonth = month || new Date().toISOString().slice(0, 7) // YYYY-MM format
    
    const { data, error } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('month', targetMonth)
      .single()
    
    return { data: data || null, error }
  },

  // Update usage stats
  updateUsageStats: async (userId: string, updates: Partial<Omit<UsageStats, 'user_id' | 'month'>>) => {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    
    // First try to get existing stats
    const { data: existing } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single()
    
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('usage_stats')
        .update({
          certificates_created: existing.certificates_created + (updates.certificates_created || 0),
          templates_used: existing.templates_used + (updates.templates_used || 0),
          points_used: existing.points_used + (updates.points_used || 0),
          downloads_count: existing.downloads_count + (updates.downloads_count || 0)
        })
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .select()
        .single()
      
      return { data, error }
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('usage_stats')
        .insert({
          user_id: userId,
          month: currentMonth,
          certificates_created: updates.certificates_created || 0,
          templates_used: updates.templates_used || 0,
          points_used: updates.points_used || 0,
          downloads_count: updates.downloads_count || 0
        })
        .select()
        .single()
      
      return { data, error }
    }
  },

  // Initialize new user with bonus points
  initializeNewUser: async (userId: string, email: string, fullName?: string) => {
    // Create user profile with 100 bonus points
    const { data: profile, error: profileError } = await pointHelpers.upsertUserProfile({
      id: userId,
      email,
      full_name: fullName,
      points_balance: 100,
      total_points_purchased: 0,
      total_points_used: 0
    })

    if (profileError) return { data: null, error: profileError }

    // Record bonus transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type: 'bonus',
        amount: 100,
        description: 'Bonus point untuk member baru'
      })
      .select()
      .single()

    return { data: { profile, transaction }, error: transactionError }
  }
}

// Export all modules
export { authHelpers, pointHelpers, signUp, signIn, signOut, getCurrentUser, onAuthStateChange }