"use client"

// --- TAMBAHAN PENTING UNTUK CLOUDFLARE ---
export const runtime = 'edge'
// ------------------------------------------

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { MapPin, Briefcase, DollarSign, Building2, Calendar, ArrowLeft, CheckCircle, ExternalLink } from "lucide-react"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJobDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function getJobDetail() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            industry,
            website,
            is_verified
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error
      setJob(data)
    } catch (error) {
      console.log("Job not found", error)
    } finally {
      setLoading(false)
    }
  }

  // Helper Format Uang
  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return "Kompetitif"
    const format = (n: number) => n?.toLocaleString('id-ID')
    if (min && max) return `Rp ${format(min)} - ${format(max)}`
    return `Rp ${format(min || max)}`
  }

  if (loading) return <div className="p-20 text-center">Memuat detail lowongan...</div>
  
  if (!job) return (
    <div className="p-20 text-center">
      <h2 className="text-xl font-bold mb-2">Lowongan Tidak Ditemukan</h2>
      <Link href="/lowongan" className="text-blue-600 hover:underline">Kembali ke daftar</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="container px-4 md:px-6 max-w-4xl">
        
        {/* Tombol Kembali */}
        <Link href="/lowongan" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Pencarian
        </Link>

        {/* Header Lowongan */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">{job.title}</h1>
                <div className="flex items-center gap-2 text-lg font-medium text-slate-700 dark:text-slate-300">
                  <Building2 className="h-5 w-5 text-slate-400" /> 
                  {job.companies?.name || "Perusahaan Mitra"}
                  
                  {job.companies?.is_verified && (
                    <span className="inline-flex items-center ml-1" title="Terverifikasi">
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  <MapPin className="h-4 w-4" /> {job.location}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  <Briefcase className="h-4 w-4" /> {job.job_type}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  <DollarSign className="h-4 w-4" /> {formatSalary(job.salary_min, job.salary_max)}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  <Calendar className="h-4 w-4" /> Diposting {new Date(job.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>

            {/* Tombol Lamar (Action) */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              {job.application_url ? (
                 <a 
                   href={job.application_url.includes('@') ? `mailto:${job.application_url}` : job.application_url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center justify-center h-12 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg transition-all"
                 >
                   Lamar Sekarang <ExternalLink className="ml-2 h-4 w-4" />
                 </a>
              ) : (
                 <button disabled className="h-12 rounded-md bg-slate-200 text-slate-500 font-bold cursor-not-allowed">
                   Aplikasi Ditutup
                 </button>
              )}
              <p className="text-xs text-center text-slate-500">
                Anda akan diarahkan ke sistem rekrutmen perusahaan.
              </p>
            </div>
          </div>
        </div>

        {/* Konten Detail */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Kolom Kiri: Deskripsi Utama */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-4 border-b pb-2 border-slate-100 dark:border-slate-800">Deskripsi Pekerjaan</h3>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-line">
                {job.description}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-4 border-b pb-2 border-slate-100 dark:border-slate-800">Kualifikasi</h3>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-line">
                {job.requirements}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Info Aksesibilitas */}
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900 p-6">
              <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Komitmen Inklusi
              </h3>
              <p className="text-sm text-blue-900/80 dark:text-blue-200/80 mb-4">
                Posisi ini terbuka untuk penyandang disabilitas dengan kategori:
              </p>
              <div className="flex flex-wrap gap-2">
                {job.disability_tags && job.disability_tags.length > 0 ? (
                    job.disability_tags.map((tag: string) => (
                        <span key={tag} className="inline-block bg-white dark:bg-slate-950 text-blue-700 dark:text-blue-400 text-xs font-semibold px-2.5 py-1 rounded border border-blue-200 dark:border-blue-800">
                        {tag}
                        </span>
                    ))
                ) : (
                    <span className="text-sm text-slate-500 italic">Semua ragam disabilitas dipersilakan melamar.</span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-bold mb-3">Tentang Perusahaan</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Industri: {job.companies?.industry || "Umum"}
              </p>
              {job.companies?.website && (
                <a 
                  href={job.companies.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                >
                  Kunjungi Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
