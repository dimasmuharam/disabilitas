/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // AKTIFKAN SERVER ACTIONS UNTUK VERSI 13.5+
  experimental: {
    serverActions: true,
  },
  // Pastikan image optimization aman jika menggunakan domain eksternal (Supabase Storage)
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com', 'your-supabase-id.supabase.co'],
  },
}

export default nextConfig
