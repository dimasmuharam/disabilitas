/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Aktifkan Server Actions untuk penanganan form yang lebih modern
  experimental: {
    serverActions: true,
  },
  images: {
    // remotePatterns adalah cara standar Next.js 14+ untuk verifikasi domain gambar
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Untuk foto profil Google Login
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // Untuk foto profil GitHub Login
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Membuka akses untuk semua bucket storage Supabase Mas
      },
    ],
  },
}

export default nextConfig
