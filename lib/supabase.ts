import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// Kunci Master (Hanya bisa dibaca di sisi server, jangan pakai NEXT_PUBLIC_)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing!")
}

// 1. Client Publik (Untuk User Biasa)
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// 2. Client Master (Khusus Admin/Server Action)
// Ini yang akan menembus RLS dan menampilkan data 10 responden Mas
export const supabaseAdmin = createClient(
  supabaseUrl || '', 
  supabaseServiceKey || '', // Menggunakan Service Role Key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)