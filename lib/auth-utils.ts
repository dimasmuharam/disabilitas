/**
 * Utility functions for error handling in authentication flows
 */

/**
 * Profile data structure
 */
export interface Profile {
  id: string
  email?: string
  full_name?: string
  role?: string
  [key: string]: any
}

/**
 * Error structure from Supabase
 */
export interface AuthError {
  message?: string
  code?: string
  [key: string]: any
}

/**
 * Map Supabase authentication errors to user-friendly messages
 * @param error - The error object from Supabase
 * @returns User-friendly error message
 */
export function getAuthErrorMessage(error: AuthError | Error | any): string {
  const errorMessage = error?.message || ''
  
  // Define error patterns and their corresponding messages
  const errorPatterns = [
    {
      patterns: ['duplicate key', 'already exists', 'already registered'],
      message: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun Anda.'
    },
    {
      patterns: ['Email not confirmed', 'email not verified'],
      message: 'Email belum diverifikasi. Silakan cek kotak masuk Anda.'
    },
    {
      patterns: ['Invalid email', 'invalid email format'],
      message: 'Format email tidak valid. Silakan periksa kembali.'
    },
    {
      patterns: ['Password', 'password too short', 'weak password'],
      message: 'Kata sandi harus minimal 6 karakter.'
    },
    {
      patterns: ['profil', 'profile'],
      message: `Terjadi kesalahan saat menyimpan profil: ${errorMessage}`
    },
    {
      patterns: ['captcha', 'turnstile'],
      message: 'Verifikasi keamanan gagal. Silakan coba lagi.'
    },
    {
      patterns: ['Invalid login', 'Invalid credentials'],
      message: 'Email atau password salah.'
    },
    {
      patterns: ['rate limit', 'too many requests'],
      message: 'Terlalu banyak percobaan. Silakan tunggu beberapa saat.'
    },
    {
      patterns: ['network', 'fetch failed', 'ENOTFOUND'],
      message: 'Koneksi bermasalah. Silakan periksa internet Anda.'
    }
  ]

  // Check each pattern
  for (const { patterns, message } of errorPatterns) {
    if (patterns.some(pattern => errorMessage.toLowerCase().includes(pattern.toLowerCase()))) {
      return message
    }
  }

  // Default error message
  return errorMessage || 'Terjadi kesalahan sistem. Silakan coba lagi.'
}

/**
 * Check if profile needs update based on existing data
 * @param profile - Existing profile data
 * @param updates - New data to compare against
 * @returns true if profile needs update
 */
export function profileNeedsUpdate(
  profile: Partial<Profile>,
  updates: { role?: string, fullName?: string, email?: string }
): boolean {
  const roleChanged = updates.role !== undefined && profile.role !== updates.role
  const fullNameMissing = updates.fullName !== undefined && (!profile.full_name || profile.full_name !== updates.fullName)
  const emailMissing = updates.email !== undefined && !profile.email
  
  return roleChanged || fullNameMissing || emailMissing
}

/**
 * Retry a database operation with exponential backoff
 * Useful for handling race conditions with database triggers
 * @param operation - Async function to retry
 * @param maxAttempts - Maximum number of retry attempts
 * @returns Result of the operation
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Add delay with exponential backoff (except first attempt)
      if (attempt > 0) {
        const delay = Math.min(200 * Math.pow(2, attempt - 1), 1000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      
      return await operation()
    } catch (error) {
      lastError = error
      console.log(`[RETRY] Attempt ${attempt + 1}/${maxAttempts} failed:`, error)
    }
  }
  
  throw lastError
}
