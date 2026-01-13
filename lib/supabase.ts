import { createClient } from '@supabase/supabase-js'

// Pastikan variabel diawali dengan NEXT_PUBLIC_ agar bisa dibaca di sisi browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing!")
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
