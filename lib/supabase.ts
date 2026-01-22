import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Prevent build failures by checking for required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  // Only warn during build, not fail
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  Supabase environment variables not set. Client will not function properly.');
  }
}

// Client standar untuk browser (Aman & Terbatas)
// Use placeholder values during build if env vars are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

/**
 * Fungsi ini khusus digunakan di Server (Server Actions/API)
 * untuk mendapatkan akses penuh ke database.
 */
export const createAdminClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceKey) {
    // Jika kunci tidak ditemukan, berikan peringatan di log server
    if (process.env.NODE_ENV !== 'production') {
      console.warn("⚠️  SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di environment server.");
    }
    return supabase; 
  }

  if (!supabaseUrl) {
    console.warn("⚠️  SUPABASE_URL tidak ditemukan di environment server.");
    return supabase;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Untuk kompatibilitas kode lama (opsional)
export const supabaseAdmin = typeof window === 'undefined' ? createAdminClient() : supabase;