"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
// SINKRONISASI DATA STATIC
import { 
  UNIVERSITIES, 
  TRAINING_PARTNERS, 
  COMMUNITY_PARTNERS,
  SKILLS_LIST 
} from "@/lib/data-static"
import { 
  GraduationCap, Users, Briefcase, MapPin, 
  BarChart3, PieChart, Building2, 
  Award, Globe, CheckCircle, TrendingUp, AlertCircle
} from "lucide-react"

export default function CampusDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ 
    total: 0, 
    wfo: 0, 
    wfh: 0, 
    hired: 0,
    disabilityMap: {} as Record<string, number>,
    cityMap: {} as Record<string, number>,
    ownedSkills: {} as Record<string, number>,
    marketDemandedSkills: [] as string[]
  })
  
  // LOGIKA AKSES: Jika user adalah super_admin, default UI; Jika partner, kunci ke instansinya
  const isSuperAdmin = user?.role === "super_admin"
  const [myCampus, setMyCampus] = useState(user?.partner_institution || "Universitas Indonesia (UI)") 
  const [partnerType, setPartnerType] = useState("University")

  const ALL_PARTNERS = [...UNIVERSITIES, ...TRAINING_PARTNERS, ...COMMUNITY_PARTNERS].sort();

  useEffect(() => {
    fetchStats()
  }, [myCampus, partnerType])

  async function fetchStats() {
    setLoading(true)
    try {
      let talentIds: string[] = []

      // 1. TARIK DATA AFILIASI (SINKRON DENGAN TALENT DASHBOARD)
      if (partnerType === "University") {
        const { data: profiles } = await supabase.from("profiles").select("id").eq("university", myCampus)
        if (profiles) talentIds = profiles.map(p => p.id)
      } else {
        const { data: certs } = await supabase.from("certifications").select("profile_id").eq("organizer_name", myCampus)
        if (certs) talentIds = Array.from(new Set(certs.map(c => c.profile_id)))
      }

      if (talentIds.length > 0) {
        // 2. ANALISA DETAIL PROFIL & STATUS KERJA
        const { data: detailData } = await supabase
          .from("profiles")
          .select("work_preference, disability_type, city, career_status, skills")
          .in("id", talentIds)

        // 3. TARIK DATA MARKET DEMAND (Untuk Skill Gap Analysis)
        const { data: jobSkills } = await supabase.from("jobs").select("required_skills").limit(20)

        if (detailData) {
          const dMap: Record<string, number> = {}
          const cMap: Record<string, number> = {}
          const sMap: Record<string, number> = {}
          
          detailData.forEach(item => {
            if (item.disability_type) dMap[item.disability_type] = (dMap[item.disability_type] || 0) + 1
            if (item.city) cMap[item.city] = (cMap[item.city] || 0) + 1
            
            // Hitung distribusi Skill yang dimiliki alumni
            if (item.skills && Array.isArray(item.skills)) {
              item.skills.forEach((s: string) => {
                sMap[s] = (sMap[s] || 0) + 1
              })
            }
          })

          // Olah data Skill yang paling dicari pasar
          const marketSkills = jobSkills 
            ? Array.from(new Set(jobSkills.flatMap(j => j.required_skills || []))).slice(0, 5)
            : []

          setStats({
            total: detailData.length,
            wfo: detailData.filter(d => d.work_preference === "WFO (Di Kantor)").length,
            wfh: detailData.filter(d => d.work_preference !== "WFO (Di Kantor)").length,
            hired: detailData.filter(d => d.career_status === "Employed").length,
            disabilityMap: dMap,
            cityMap: cMap,
            ownedSkills: sMap,
            marketDemandedSkills: marketSkills
          })
        }
      } else {
        setStats({ total: 0, wfo: 0, wfh: 0, hired: 0, disabilityMap: {}, cityMap: {}, ownedSkills: {}, marketDemandedSkills: [] })
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  return (
    <div className="space-y-8">
      {/* HEADER & KONTROL AKSES */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
              {"Dashboard Analisa Partner Inklusi"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">{"Data Tracer Study dan Pemetaan Kompetensi Alumni."}</p>
          </div>
          <div className="bg-blue-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <CheckCircle size={14} /> {isSuperAdmin ? "Super Admin Mode" : "Official Partner"}
          </div>
        </div>

        {/* Filter ini hanya muncul untuk Super Admin agar bisa memantau semua lembaga */}
        {isSuperAdmin && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Filter Kategori"}</label>
              <select value={partnerType} onChange={(e) => setPartnerType(e.target.value)} className="input-std w-full">
                <option value="University">{"Perguruan Tinggi"}</option>
                <option value="Training Center">{"Lembaga Pelatihan"}</option>
                <option value="Organization">{"Organisasi / Komunitas"}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Cari Lembaga"}</label>
              <input list="partners" value={myCampus} onChange={(e) => setMyCampus(e.target.value)} className="input-std w-full" placeholder="Ketik nama kampus/org..." />
              <datalist id="partners">{ALL_PARTNERS.map(p => <option key={p} value={p} />)}</datalist>
            </div>
          </div>
        )}

        {!isSuperAdmin && (
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
            <Building2 className="text-blue-600" />
            <span className="font-black uppercase text-xs text-blue-800">{"Menampilkan data untuk: "}{myCampus}</span>
          </div>
        )}
      </div>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
          <Users className="text-blue-400 mb-4" size={28} />
          <p className="text-[10px] font-black uppercase opacity-60">{"Total Alumni Terdaftar"}</p>
          <h3 className="text-4xl font-black">{stats.total}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
          <CheckCircle className="text-green-500 mb-4" size={28} />
          <p className="text-[10px] font-black uppercase text-slate-400">{"Terserap Kerja"}</p>
          <h3 className="text-4xl font-black">{stats.hired}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
          <Globe className="text-blue-500 mb-4" size={28} />
          <p className="text-[10px] font-black uppercase text-slate-400">{"Remote Ready"}</p>
          <h3 className="text-4xl font-black">{stats.wfh}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
          <MapPin className="text-red-500 mb-4" size={28} />
          <p className="text-[10px] font-black uppercase text-slate-400">{"Domisili Tersebar"}</p>
          <h3 className="text-4xl font-black">{Object.keys(stats.cityMap).length} <span className="text-xs uppercase">{"Kota"}</span></h3>
        </div>
      </div>

      {/* SKILL GAP ANALYSIS (ADDED VALUE TERBARU) */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200">
        <div className="flex items-center gap-3 mb-8 border-b pb-6">
          <div className="p-3 bg-orange-100 rounded-2xl text-orange-600"><TrendingUp size={24}/></div>
          <div>
            <h3 className="font-black uppercase italic tracking-tighter text-xl">{"Skill Gap Analysis"}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{"Perbandingan kompetensi alumni dengan kebutuhan pasar industri saat ini"}</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{"Keahlian Dominan Alumni"}</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.ownedSkills).sort((a,b) => b[1]-a[1]).slice(0, 10).map(([skill, count]) => (
                <div key={skill} className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase">{skill}</span>
                  <span className="bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded-md font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 bg-orange-50 p-6 rounded-3xl border border-orange-100">
            <h4 className="text-[10px] font-black uppercase text-orange-600 tracking-widest flex items-center gap-2">
              <AlertCircle size={14}/> {"Paling Dicari Perusahaan"}
            </h4>
            <div className="space-y-3">
              {stats.marketDemandedSkills.map(skill => (
                <div key={skill} className="flex justify-between items-center bg-white p-3 rounded-xl border border-orange-200">
                  <span className="text-[10px] font-black uppercase text-slate-700">{skill}</span>
                  {stats.ownedSkills[skill] ? (
                    <span className="text-[8px] font-black text-green-600 uppercase">{"Tersedia"}</span>
                  ) : (
                    <span className="text-[8px] font-black text-red-500 uppercase">{"Butuh Pelatihan"}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STATS RAGAM DISABILITAS & WILAYAH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="font-black uppercase italic tracking-tighter flex items-center gap-2 mb-8">
            <PieChart className="text-blue-600" size={20} /> {"Proporsi Ragam Disabilitas"}
          </h3>
          <div className="space-y-6">
            {Object.entries(stats.disabilityMap).map(([type, count]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                  <span className="text-slate-600">{type}</span>
                  <span className="text-blue-600">{Math.round((count / stats.total) * 100)}% ({count})</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count / stats.total) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="font-black uppercase italic tracking-tighter flex items-center gap-2 mb-8">
            <MapPin className="text-red-500" size={20} /> {"Sebaran Wilayah Terpadat"}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(stats.cityMap).sort((a,b) => b[1]-a[1]).slice(0, 6).map(([city, count]) => (
              <div key={city} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-black uppercase text-slate-700">{city}</span>
                <span className="bg-white px-4 py-1.5 rounded-xl text-[10px] font-black text-blue-600 border border-slate-200 shadow-sm">{count} {"Anggota"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
