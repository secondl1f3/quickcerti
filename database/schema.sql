-- Database schema for point system
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  points_balance INTEGER DEFAULT 100 NOT NULL,
  total_points_purchased INTEGER DEFAULT 0 NOT NULL,
  total_points_used INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Point transactions table
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Certificate downloads table
CREATE TABLE IF NOT EXISTS certificate_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  template_name TEXT NOT NULL,
  points_used INTEGER NOT NULL,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Usage statistics table
CREATE TABLE IF NOT EXISTS usage_stats (
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  certificates_created INTEGER DEFAULT 0 NOT NULL,
  templates_used INTEGER DEFAULT 0 NOT NULL,
  points_used INTEGER DEFAULT 0 NOT NULL,
  downloads_count INTEGER DEFAULT 0 NOT NULL,
  PRIMARY KEY (user_id, month)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificate_downloads_user_id ON certificate_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_certificate_downloads_created_at ON certificate_downloads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_month ON usage_stats(user_id, month);

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for point_transactions
CREATE POLICY "Users can view own transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON point_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for certificate_downloads
CREATE POLICY "Users can view own downloads" ON certificate_downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own downloads" ON certificate_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for usage_stats
CREATE POLICY "Users can view own stats" ON usage_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON usage_stats
  FOR ALL USING (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, points_balance, total_points_purchased, total_points_used)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    100, -- Bonus 100 points for new users
    0,
    0
  );
  
  -- Record bonus transaction
  INSERT INTO public.point_transactions (user_id, type, amount, description)
  VALUES (
    NEW.id,
    'bonus',
    100,
    'Bonus point untuk member baru'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sample data (optional - remove in production)
-- INSERT INTO user_profiles (id, email, full_name, points_balance, total_points_purchased, total_points_used)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   'demo@example.com',
--   'Demo User',
--   250,
--   200,
--   50
-- );

-- INSERT INTO point_transactions (user_id, type, amount, description)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000000', 'bonus', 100, 'Bonus point untuk member baru'),
--   ('00000000-0000-0000-0000-000000000000', 'purchase', 200, 'Pembelian 200 point'),
--   ('00000000-0000-0000-0000-000000000000', 'usage', -50, 'Download sertifikat: Template Penghargaan');