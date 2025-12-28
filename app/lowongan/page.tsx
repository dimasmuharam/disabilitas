import Link from "next/link"
import { MapPin, Briefcase, DollarSign, Filter, Search, Building2, CheckCircle } from "lucide-react"

// Kategori Filter Granular
const disabilityCategories = [
  "Netra (Total)",
  "Low Vision",
  "Tuli / Wicara",
  "Daksa / Fisik",
  "Mental / Psikososial",
  "Autisme / Neurodivergent",
  "Intelektual"
]

// Data Dummy: Perhatikan 'tags' menggunakan Array [] agar bisa Multi-Label
const jobs = [
  {
    id: 1,
    title: "Customer Service Specialist (Chat Support)",
    company: "PT Telekomunikasi Digital",
    type: "Full-time",
    location: "Jakarta (Hybrid)",
    salary: "Rp 5.000.000 - 7.000.000",
    // BUKTI MULTI LABEL: Bisa Netra DAN Daksa DAN Tuli
    tags: ["Netra (Total)", "Daksa / Fisik", "Tuli / Wicara"],
    posted: "2 hari lalu",
    verified: true,
  },
  {
    id: 2,
    title: "Junior Web Developer",
    company: "Startup Karya Bangsa",
    type: "Kontrak",
    location: "Remote (WFH Total)",
    salary: "Rp 6.000.000 - 9.000.000",
    tags: ["Daksa / Fisik", "Tuli / Wicara", "Autisme / Neurodivergent"],
    posted: "5 jam lalu",
    verified: true,
  },
  {
    id: 3,
    title: "Staff Administrasi & Arsip",
    company: "Kementerian Pelayanan Publik",
    type: "Magang",
    location: "Bandung",
    salary: "Uang Saku Kompetitif",
    tags: ["Tuli / Wicara", "Low Vision", "Intelektual"],
    posted: "1 minggu lalu",
    verified: true,
  },
  {
    id: 4,
    title: "Content Writer",
    company: "Agency Kreatif Maju",
    type: "Freelance",
    location: "Yogyakarta",
    salary: "Project Based",
    tags: ["Mental / Psikososial", "Netra (Total)"],
    posted: "Baru saja",
    verified: false,
  },
]

export default function LowonganPage() {
  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-950 h-full">
      
      {/* HEADER PAGE */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
            Temukan Karir Tanpa Batas
          </h1>
          
          {/* Search Bar */}
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input 
                type="text" 
                placeholder="Cari posisi atau nama perusahaan..." 
                aria-label="Cari lowongan berdasarkan posisi atau perusahaan"
                className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
              />
            </div>
            <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-6 text-sm font-medium text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90">
              Cari
            </button>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR FILTER */}
        <aside className="w-full md:w-64 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-lg text-slate-900 dark:text-slate-50 mb-4">
              <Filter className="h-5 w-5" aria-hidden="true" /> Filter Disabilitas
            </div>
            <div className="space-y-2">
              {disabilityCategories.map((item) => (
                <label key={item} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 p-1 rounded -ml-1">
                  <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Filter Tipe Pekerjaan */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-200">Tipe Pekerjaan</h3>
            <div className="space-y-2">
              {['Full-time', 'Part-time', 'Freelance', 'Magang'].map((item) => (
                <label key={item} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 p-1 rounded -ml-1">
                  <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
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
              Menampilkan <strong>4</strong> lowongan terbaru
            </p>
          </div>

          {jobs.map((job) => (
            <div key={job.id} className="group relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      <Link href={`/lowongan/${job.id}`} className="focus:outline-none focus:underline">
                        {job.title}
                      </Link>
                    </h2>
                    {job.verified && (
                      <span className="inline-flex items-center ml-1" title="Perusahaan Terverifikasi">
                        <CheckCircle className="h-5 w-5 text-blue-500" aria-hidden="true" />
                        <span className="sr-only"> - Perusahaan Terverifikasi</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="text-base font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Building2 className="h-4 w-4" aria-hidden="true" /> {job.company}
                  </div>

                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" aria-hidden="true" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" aria-hidden="true" /> {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" aria-hidden="true" /> {job.salary}
                    </span>
                  </div>

                  {/* Tags Aksesibilitas (Multi-Label) */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[140px] justify-center">
                  <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
                    aria-label={`Lamar posisi ${job.title} di ${job.company}`}
                  >
                    Lamar Sekarang
                  </button>
                  <span className="text-xs text-center text-slate-500">Diposting {job.posted}</span>
                </div>

              </div>
            </div>
          ))}

        </main>
      </div>
    </div>
  )
}
