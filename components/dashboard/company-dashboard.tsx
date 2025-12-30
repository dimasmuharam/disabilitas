"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { INDONESIA_CITIES } from "@/lib/data-static"
import { INCLUSIVE_JOB_TEMPLATE } from "@/app/lowongan/create/template"
import { Briefcase, LayoutDashboard, Plus, Users, CheckCircle2, AlertCircle } from "lucide-react"

export default function CompanyDashboard({ user }: { user: any }) {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // State Form Perusahaan
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")

  // State Form Lowongan
  const [activeTab, setActiveTab] = useState("overview") // overview, post-job
  const [jobTitle, setJobTitle] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  const [jobLocation, setJobLocation] = useState("Jakarta Selatan")
  const [jobMsg, setJobMsg] = useState("")

  // Gabungkan template inklusif menjadi string untuk default value deskripsi
  const initialDescription = INCLUSIVE_JOB_TEMPLATE.sections
    .map(s => `${s.heading.toUpperCase()}\n${s.content}\n`)
    .join("\n")

  useEffect(() => {
    fetchCompany()
  }, [])

  // Fungsi untuk otomatis isi template saat buka tab post-job
  useEffect(() => {
    if (activeTab === "post-job" && !jobDesc) {
      setJobDesc(initialDescription)
      setJobTitle(INCLUSIVE_JOB_TEMPLATE.title)
    }
  }, [activeTab])

  async function fetchCompany() {
    const { data } = await supabase.from('companies').select('*').eq('owner_id', user.id).single()
    if (data) {
      setCompany(data)
      setCompanyName(data.name)
    }
    setLoading(false)
  }

  async function createCompany(e: React.FormEvent) {
    e.preventDefault()
    const { data } = await supabase.from('companies').insert({ owner_id: user.id, name: companyName, industry }).select().single()
    if (data) setCompany(data)
  }

  async function postJob(e: React.FormEvent) {
    e.preventDefault()
    setJobMsg("")
    if(!company) return

    const { error } = await supabase.from('jobs').insert({
        company_id: company.id,
        title: jobTitle,
        description: jobDesc,
        location: jobLocation,
        is_active: true
    })

    if(error) {
        setJobMsg("Gagal memposting: " + error.message)
    } else {
        setJobMsg("Sukses! Lowongan inklusif berhasil diposting.")
        setJobTitle("")
        setJobDesc("")
        setTimeout(() => {
            setActiveTab("overview")
            setJobMsg("")
        }, 2000)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data dashboard...</div>

  // 1. Jika Belum Punya Profil PT
  if (!company) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Briefcase className="text-blue-600" /> Profil Perusahaan
        </h2>
        <p className="text-slate-500 mb-6 text-sm">Lengkapi data perusahaan Anda untuk mulai memasang lowongan kerja inklusif.</p>
        <form onSubmit={createCompany} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Perusahaan</label>
            <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-std" placeholder="PT. Nama Perusahaan" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Industri</label>
            <input type="text" required value={industry} onChange={e => setIndustry(e.target.value)} className="input-std" placeholder="Misal: Teknologi, Perbankan" />
          </div>
          <button type="submit" className="btn-primary w-full h-11">Daftarkan Perusahaan</button>
        </form>
      </div>
    )
  }

  // 2. Dashboard Utama
  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold">{company.name}</h2>
            <p className="text-blue-100 flex items-center gap-2 text-sm italic">
               <CheckCircle2 className="h-4 w-4 text-blue-200" /> Member of Inklusi Jadi Nyata
            </p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab("overview")} 
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'overview' ? 'bg-white text-blue-600' : 'bg-blue-700 text-white hover:bg-blue-800'}`}
            >
              <LayoutDashboard className="h-4 w-4 inline mr-2" /> Ikhtisar
            </button>
            <button 
              onClick={() => setActiveTab("post-job")} 
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'post-job' ? 'bg-white text-blue-600' : 'bg-blue-700 text-white hover:bg-blue-800'}`}
            >
              <Plus className="h-4 w-4 inline mr-2" /> Pasang Lowongan
            </button>
        </div>
      </div>

      {/* ISI TAB: OVERVIEW */}
      {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <Users className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-sm font-medium text-slate-500">Total Pelamar</h3>
                <p className="text-3xl font-bold">0</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <Briefcase className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-sm font-medium text-slate-500">Lowongan Aktif</h3>
                <p className="text-3xl font-bold">0</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <Plus className="h-8 w-8 text-orange-600 mb-4" />
                <h3 className="text-sm font-medium text-slate-500">Audit Status</h3>
                <p className="text-lg font-bold text-orange-600 uppercase">Belum Diaudit</p>
            </div>
          </div>
      )}

      {/* ISI TAB: POST JOB */}
      {activeTab === "post-job" && (
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="mb-6">
                <h3 className="text-xl font-bold">Formulir Lowongan Inklusif</h3>
                <p className="text-sm text-slate-500">Gunakan standar riset aksesibilitas yang telah kami sediakan di deskripsi.</p>
            </div>
            
            <form onSubmit={postJob} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Judul Posisi</label>
                        <input 
                          type="text" 
                          required 
                          value={jobTitle} 
                          onChange={e => setJobTitle(e.target.value)} 
                          className="input-std" 
                          placeholder="Misal: Customer Service (Tuna Netra)" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Lokasi Kerja</label>
                        <input 
                          list="cities" 
                          value={jobLocation} 
                          onChange={e => setJobLocation(e.target.value)} 
                          className="input-std" 
                        />
                        <datalist id="cities">
                            {INDONESIA_CITIES.map(c => <option key={c} value={c}/>)}
                        </datalist>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold">Deskripsi, Kualifikasi & Akomodasi</label>
                    <textarea 
                      required 
                      value={jobDesc} 
                      onChange={e => setJobDesc(e.target.value)} 
                      className="input-std min-h-[350px] font-mono text-sm leading-relaxed" 
                      placeholder="Jelaskan detail lowongan..." 
                    />
                    <p className="text-xs text-slate-500 italic">Kami telah menyertakan format standar inklusi minimal. Anda bisa mengeditnya sesuai kebutuhan perusahaan.</p>
                </div>

                {jobMsg && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${jobMsg.includes("Sukses") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                       {jobMsg.includes("Sukses") ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                       <span className="font-medium">{jobMsg}</span>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-3 pt-4">
                    <button type="button" onClick={() => setActiveTab("overview")} className="px-6 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50">Batal</button>
                    <button type="submit" className="btn-primary flex-1 h-11 text-lg">Tayangkan Lowongan Sekarang</button>
                </div>
            </form>
          </div>
      )}
    </div>
  )
}
