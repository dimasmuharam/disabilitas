import { createClient } from '@supabase/supabase-js'

// Dia akan otomatis mengambil dari .env (laptop) atau Cloudflare (online)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
