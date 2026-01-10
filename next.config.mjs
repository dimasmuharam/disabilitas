/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server Actions are enabled by default in Next.js 14.2+
  // Pastikan image optimization aman jika menggunakan domain eksternal (Supabase Storage)
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com', 'your-supabase-id.supabase.co'],
  },
}

export default nextConfig
