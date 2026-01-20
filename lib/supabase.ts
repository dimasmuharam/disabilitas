import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Client standar untuk browser (Aman & Terbatas)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Fungsi ini khusus digunakan di Server (Server Actions/API)
 * untuk mendapatkan akses penuh ke database.
 */
export const createAdminClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceKey) {
    // Jika kunci tidak ditemukan, berikan peringatan di log server
    console.error("SERVICE_ROLE_KEY tidak ditemukan di environment server.");
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