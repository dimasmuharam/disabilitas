import { createClient } from '@supabase/supabase-js'

// Masukkan Project URL (https://...)
const supabaseUrl = 'https://dsexxsnedfxbdngscdni.supabase.co'

// Masukkan ANON / PUBLISHABLE Key (sb_publishable_...)
// PENTING: Hanya kunci PUBLIC yang boleh ditaruh di sini karena repo ini terbuka.
const supabaseKey = 'sb_publishable_a4zU6uSZiIWbj3Im9DPM5Q_tXTgKVFO'

export const supabase = createClient(supabaseUrl, supabaseKey)
