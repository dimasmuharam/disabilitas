"use client"

// TAMBAHKAN INI JUGA AGAR AMAN
export const runtime = 'edge' 

// ... import lainnya ...
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { MapPin, Briefcase, DollarSign, Filter, Search, Building2, CheckCircle } from "lucide-react"

// Kategori untuk Sidebar
const disabilityCategories = [
  "Netra (Total)", "Low Vision", "Tuli / Wicara", "Daksa / Fisik", 
  "Mental / Psikososial", "Autisme / Neurodivergent", "Intelektual"
]

const jobTypes = ['Full-time', 'Part-time', 'Freelance', 'Magang', 'Kontrak']

export default function LowonganPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // State untuk Filter & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDisabilities, setSelectedDisabilities] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  useEffect(() => {
    fetchJobs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDisabilities, selectedTypes]) // Auto-fetch saat filter checkbox berubah

  async function fetchJobs() {
    setLoading(true)
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            is_verified
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      // 1. Filter Search (Judul)
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
      }

      // 2. Filter Disabilitas (Array contains)
      if (selectedDisabilities.length > 0) {
        query = query.contains('disability_tags', selectedDisabilities)
      }

      // 3. Filter Tipe Pekerjaan (Exact match di salah satu)
      if (selectedTypes.length > 0) {
        query = query.in('job_type', selectedTypes)
      }

      const { data, error } = await query

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.log("Error fetching jobs", error)
    } finally {
      setLoading(false)
    }
  }

  // Helper: Format Rupiah
  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return "Kompetitif"
    const format = (n: number) => n?.toLocaleString('id-ID')
    if (min && max) return `Rp ${format(min)} - ${format(max)}`
    return `Rp ${format(min || max)}`
  }

  // Helper: Waktu Relatif (X hari lalu)
  const timeAgo = (dateString: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 3600 * 24))
    if (days === 0) return "Hari ini"
    if (days === 1) return "Kemarin"
    return `${days} hari lalu`
  }

  // Handler Checkbox
  const handleFilterChange = (item: string, type: 'disability' | 'type') => {
    if (type === 'disability') {
      setSelectedDisabilities(prev => 
        prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
      )
    } else {
      setSelectedTypes(prev => 
        prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
      )
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs()
  }

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen">
      
      {/* HEADER PAGE */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
            Temukan Karir Tanpa Batas
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari posisi pekerjaan..." 
                aria-label="Cari lowongan berdasarkan posisi"
                className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-6 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Cari
            </button>
          </form>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR FILTER */}
        <aside className="w-full md:w-64 space-y-8">
          
          {/* Filter Disabilitas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-lg text-slate-900 dark:text-slate-50 mb-4">
              <Filter className="h-5 w-5" aria-hidden="true" /> Filter Disabilitas
            </div>
            <div className="space-y-2">
              {disabilityCategories.map((item) => (
                <label key={item} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 p-1 rounded -ml-1">
                  <input 
                    type="checkbox" 
                    checked={selectedDisabilities.includes(item)}
                    onChange={() => handleFilterChange(item, 'disability')}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Filter Tipe Pekerjaan */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-200">Tipe Pekerjaan</h3>
            <div className="space-y-2">
              {jobTypes.map((item) => (
                <label key={item} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 p-1 rounded -ml-1">
                  <input 
                    type="checkbox" 
                    checked={selectedTypes.includes(item)}
                    onChange={() => handleFilterChange(item, 'type')}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* LIST LOWONGAN */}
        <main className="flex-1 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400" role="status">
              Menampilkan <strong>{jobs.length}</strong> lowongan aktif
            </p>
          </div>

          {loading ? (
             <div className="space-y-4">
               {[1,2,3].map(i => (
                 <div key={i} className="h-40 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
               ))}
             </div>
          ) : jobs.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500">Tidak ada lowongan yang cocok dengan filter Anda.</p>
                <button 
                  onClick={() => { setSelectedDisabilities([]); setSelectedTypes([]); setSearchQuery(""); }}
                  className="mt-2 text-blue-600 hover:underline text-sm"
                >
                  Reset Filter
                </button>
             </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="group relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        <Link href={`/lowongan/${job.id}`} className="focus:outline-none focus:underline">
                          {job.title}
                        </Link>
                      </h2>
                      {/* Cek Verifikasi dari tabel Companies */}
                      {job.companies?.is_verified && (
                        <span className="inline-flex items-center ml-1" title="Perusahaan Terverifikasi">
                          <CheckCircle className="h-5 w-5 text-blue-500" aria-hidden="true" />
                          <span className="sr-only"> - Perusahaan Terverifikasi</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="text-base font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Building2 className="h-4 w-4" aria-hidden="true" /> 
                      {job.companies?.name || "Perusahaan Mitra"}
                    </div>

                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" aria-hidden="true" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" aria-hidden="true" /> {job.job_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" aria-hidden="true" /> 
                        {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                    </div>

                    {/* Tags Aksesibilitas (Multi-Label) */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {job.disability_tags && job.disability_tags.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[140px] justify-center">
                    <Link href={`/lowongan/${job.id}`}>
                        <button className="w-full inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
                          aria-label={`Lamar posisi ${job.title}`}
                        >
                          Lamar Sekarang
                        </button>
                    </Link>
                    <span className="text-xs text-center text-slate-500">
                        Diposting {timeAgo(job.created_at)}
                    </span>
                  </div>

                </div>
              </div>
            ))
          )}

        </main>
      </div>
    </div>
  )
}
