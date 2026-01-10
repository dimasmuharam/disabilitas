import { MetadataRoute } from 'next'

export const runtime = 'edge';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/'], // Jangan indeks halaman rahasia
    },
    sitemap: 'https://www.disabilitas.com/sitemap.xml',
  }
}
