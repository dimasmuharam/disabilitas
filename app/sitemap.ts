import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/client/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.disabilitas.com'
  const supabase = createClient()

  // 1. Ambil semua ID lowongan dari database untuk sitemap dinamis
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, updated_at')
    .eq('is_active', true)

  const jobUrls = (jobs || []).map((job) => ({
    url: `${baseUrl}/lowongan/${job.id}`,
    lastModified: new Date(job.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // 2. Daftar halaman statis
  const staticPages = [
    '',
    '/lowongan',
    '/tentang',
    '/bisnis',
    '/kampus',
    '/aksesibilitas',
    '/daftar',
    '/masuk',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return [...staticPages, ...jobUrls]
}
