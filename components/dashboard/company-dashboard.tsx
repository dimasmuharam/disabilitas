"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { INDONESIA_CITIES } from "@/lib/data-static"

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

  useEffect(() => {
    fetchCompany()
  }, [])

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

    // Insert ke tabel JOBS
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
        setJobMsg("Sukses! Lowongan berhasil diposting.")
        setJobTitle("")
        setJobDesc("")
        setActiveTab("overview")
    }
  }

  if (loading) return <div>Memuat data...</div>

  // 1. Jika Belum Punya Profil PT
  if (!company) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-lg border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-4">Profil Perusahaan</h2>
        <form onSubmit={createCompany} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nama Perusahaan</label><input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-std" /></div>
          <div><label className="block text-sm font-medium mb-1">Industri</label><input type="text" required value={industry} onChange={e => setIndustry(e.target.value)} className="input-std" /></div>
          <button type="submit" className="btn-primary w-full">Daftarkan Perusahaan</button>
        </form>
      </div>
    )
  }

  // 2. Dashboard Utama
  return (
    <div className="space-y-6">
      {/* Header PT */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-100 dark:border-indigo-900 flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">{company.name}</h2>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">Industri: {company.industry}</p>
        </div>
        <button onClick={() => setActiveTab("post-job")} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 font-bold">+ Pasang Lowongan</button>
      </div>

      {/* TABS */}
      {activeTab === "overview" && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-bold mb-4">Statistik Rekrutmen</h3>
            <p className="text-slate-500">Belum ada data pelamar aktif. Silakan pasang lowongan kerja baru.</p>
          </div>
      )}

      {activeTab === "post-job" && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-bold mb-4">Formulir Lowongan Kerja</h3>
            <form onSubmit={postJob} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Judul Posisi</label>
                    <input type="text" required value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="input-std" placeholder="Misal: Customer Service (Disabilitas Netra)" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Lokasi</label>
                    <input list="cities" value={jobLocation} onChange={e => setJobLocation(e.target.value)} className="input-std" />
                    <datalist id="cities">{INDONESIA_CITIES.map(c => <option key={c} value={c}/>)}</datalist>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Deskripsi & Syarat</label>
                    <textarea required value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="input-std h-32" placeholder="Jelaskan kualifikasi..." />
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setActiveTab("overview")} className="px-4 py-2 border rounded text-slate-600">Batal</button>
                    <button type="submit" className="btn-primary flex-1">Tayangkan Lowongan</button>
                </div>
                {jobMsg && <p className="text-green-600 font-bold mt-2">{jobMsg}</p>}
            </form>
          </div>
      )}
    </div>
  )
}
