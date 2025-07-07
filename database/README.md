# Database Schema untuk Sistem Point

Dokumentasi ini menjelaskan struktur database untuk sistem monetisasi berbasis point di aplikasi CertifikatKu.

## Overview

Sistem point menggunakan model monetisasi sederhana:
- 1 point = 1 download sertifikat
- 1 point = Rp 100
- Member baru mendapat 100 point gratis
- Tidak ada batasan waktu atau jenis keanggotaan pro

## Struktur Tabel

### 1. user_profiles
Menyimpan informasi profil pengguna dan saldo point.

```sql
CREATE TABLE user_profiles (
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
```

**Kolom:**
- `id`: UUID pengguna (foreign key ke auth.users)
- `email`: Email pengguna
- `full_name`: Nama lengkap (opsional)
- `avatar_url`: URL foto profil (opsional)
- `points_balance`: Saldo point saat ini
- `total_points_purchased`: Total point yang pernah dibeli
- `total_points_used`: Total point yang pernah digunakan
- `created_at`: Waktu pembuatan akun
- `updated_at`: Waktu update terakhir

### 2. point_transactions
Menyimpan riwayat transaksi point (pembelian, penggunaan, bonus).

```sql
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Kolom:**
- `id`: UUID transaksi
- `user_id`: ID pengguna
- `type`: Jenis transaksi (purchase/usage/bonus)
- `amount`: Jumlah point (positif untuk penambahan, negatif untuk penggunaan)
- `description`: Deskripsi transaksi
- `reference_id`: ID referensi (opsional, untuk tracking)
- `created_at`: Waktu transaksi

### 3. certificate_downloads
Menyimpan riwayat download sertifikat.

```sql
CREATE TABLE certificate_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  template_name TEXT NOT NULL,
  points_used INTEGER NOT NULL,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Kolom:**
- `id`: UUID download
- `user_id`: ID pengguna
- `template_id`: ID template yang digunakan
- `template_name`: Nama template
- `points_used`: Jumlah point yang digunakan
- `download_url`: URL file download (opsional)
- `created_at`: Waktu download

### 4. usage_stats
Menyimpan statistik penggunaan bulanan.

```sql
CREATE TABLE usage_stats (
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  certificates_created INTEGER DEFAULT 0 NOT NULL,
  templates_used INTEGER DEFAULT 0 NOT NULL,
  points_used INTEGER DEFAULT 0 NOT NULL,
  downloads_count INTEGER DEFAULT 0 NOT NULL,
  PRIMARY KEY (user_id, month)
);
```

**Kolom:**
- `user_id`: ID pengguna
- `month`: Bulan dalam format YYYY-MM
- `certificates_created`: Jumlah sertifikat yang dibuat
- `templates_used`: Jumlah template yang digunakan
- `points_used`: Jumlah point yang digunakan
- `downloads_count`: Jumlah download

## Row Level Security (RLS)

Semua tabel menggunakan RLS untuk memastikan pengguna hanya dapat mengakses data mereka sendiri:

- **SELECT**: Pengguna hanya dapat melihat data mereka sendiri
- **INSERT**: Pengguna hanya dapat menambah data untuk diri mereka sendiri
- **UPDATE**: Pengguna hanya dapat mengupdate data mereka sendiri
- **DELETE**: Cascade delete ketika user dihapus

## Triggers dan Functions

### 1. handle_new_user()
Function yang otomatis dijalankan ketika user baru mendaftar:
- Membuat profil user dengan 100 point gratis
- Mencatat transaksi bonus point

### 2. update_updated_at_column()
Function untuk otomatis mengupdate kolom `updated_at` pada tabel `user_profiles`.

## Cara Penggunaan

### 1. Setup Database
```sql
-- Jalankan script schema.sql di Supabase SQL Editor
-- File: database/schema.sql
```

### 2. Menggunakan Helper Functions

```typescript
import { pointHelpers } from '../lib/supabase'

// Mendapatkan profil user
const { data: profile } = await pointHelpers.getUserProfile(userId)

// Menambah point (pembelian)
const { data } = await pointHelpers.addPoints(
  userId, 
  100, 
  'purchase', 
  'Pembelian 100 point'
)

// Menggunakan point (download sertifikat)
const { data } = await pointHelpers.usePoints(
  userId, 
  1, 
  'Download sertifikat: Template Penghargaan',
  templateId
)

// Mendapatkan riwayat transaksi
const { data: transactions } = await pointHelpers.getPointTransactions(userId)

// Mencatat download sertifikat
const { data } = await pointHelpers.recordCertificateDownload(
  userId,
  templateId,
  'Template Penghargaan',
  1,
  downloadUrl
)
```

### 3. Inisialisasi User Baru
```typescript
// Otomatis dijalankan oleh trigger, atau manual:
const { data } = await pointHelpers.initializeNewUser(
  userId,
  email,
  fullName
)
```

## Monitoring dan Analytics

### Query Statistik Umum

```sql
-- Total point yang beredar
SELECT SUM(points_balance) as total_points_balance FROM user_profiles;

-- Total revenue (point yang dibeli)
SELECT SUM(total_points_purchased * 100) as total_revenue FROM user_profiles;

-- User paling aktif
SELECT 
  up.email,
  up.total_points_used,
  COUNT(cd.id) as total_downloads
FROM user_profiles up
LEFT JOIN certificate_downloads cd ON up.id = cd.user_id
GROUP BY up.id, up.email, up.total_points_used
ORDER BY up.total_points_used DESC
LIMIT 10;

-- Statistik penggunaan bulanan
SELECT 
  month,
  SUM(certificates_created) as total_certificates,
  SUM(points_used) as total_points_used,
  COUNT(DISTINCT user_id) as active_users
FROM usage_stats
GROUP BY month
ORDER BY month DESC;
```

## Backup dan Maintenance

1. **Backup Regular**: Pastikan backup database dilakukan secara berkala
2. **Index Monitoring**: Monitor performa query dengan EXPLAIN ANALYZE
3. **Data Cleanup**: Pertimbangkan archiving data lama jika diperlukan
4. **Security Audit**: Review RLS policies secara berkala

## Migration dan Updates

Untuk update schema di masa depan:
1. Buat migration script baru
2. Test di environment staging
3. Backup production database
4. Jalankan migration dengan downtime minimal
5. Verify data integrity

## Troubleshooting

### Common Issues:

1. **RLS Policy Error**: Pastikan user sudah login dan policy sudah benar
2. **Insufficient Points**: Check saldo sebelum menggunakan point
3. **Duplicate Transactions**: Gunakan reference_id untuk mencegah duplikasi
4. **Performance Issues**: Monitor slow queries dan tambah index jika perlu

### Logs dan Monitoring:

```sql
-- Check failed transactions
SELECT * FROM point_transactions 
WHERE description LIKE '%error%' 
ORDER BY created_at DESC;

-- Monitor point balance anomalies
SELECT * FROM user_profiles 
WHERE points_balance < 0 OR points_balance > 10000;
```