import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 1. Client Standar (Aman untuk semua halaman termasuk Homepage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. Client Admin (Gunakan fungsi agar tidak langsung dieksekusi di browser)
export const getSupabaseAdmin = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (typeof window !== 'undefined') {
    // Jika terpanggil di browser, arahkan ke client biasa (keamanan)
    return supabase 
  }

  if (!serviceKey) {
    console.warn("Admin Service Key is missing")
    return supabase
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Untuk memudahkan import di admin.ts
export const supabaseAdmin = getSupabaseAdmin()