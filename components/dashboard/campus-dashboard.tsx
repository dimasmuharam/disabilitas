"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { 
  UNIVERSITIES, 
  TRAINING_PARTNERS, 
  COMMUNITY_PARTNERS 
} from "@/lib/data-static"
import { 
  Users, CheckCircle, Globe, Building2, PieChart, MapPin, TrendingUp 
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
  
  const isSuperAdmin = user?.role === "super_admin"
  // Benchmark: Menggunakan 'university' atau 'organizer_name' sesuai Talent Dashboard
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

      // INTEGRASI 1: Jika Kategori University, cek kolom 'university' di tabel profiles
      if (partnerType === "University") {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("university", myCampus)
        if (profiles) talentIds = profiles.map(p => p.id)
      } 
      // INTEGRASI 2: Jika Pelatihan/Org, cek kolom 'organizer_name' di tabel certifications
      else {
        const { data: certs } = await supabase
          .from("certifications")
          .select("profile_id")
          .eq("organizer_name", myCampus) // Sesuai Benchmark Talent Dashboard
        if (certs) talentIds = Array.from(new Set(certs.map(c => c.profile_id)))
      }

      if (talentIds.length > 0) {
        const { data: detailData } = await supabase
          .from("profiles")
          .select("work_preference, disability_type, city, career_status, skills")
          .in("id", talentIds)

        // Mock market demand untuk Skill Gap (Nanti ditarik dari tabel jobs)
        const marketSkills = ["Analisis Data / Statistik", "Digital Marketing", "Web Development (Frontend/Backend)"];

        if (detailData) {
          const dMap: Record<string, number> = {}
          const cMap: Record<string, number> = {}
          const sMap: Record<string, number> = {}
          
          detailData.forEach(item => {
            if (item.disability_type) dMap[item.disability_type] = (dMap[item.disability_type] || 0) + 1
            if (item.city) cMap[item.city] = (cMap[item.city] || 0) + 1
            if (item.skills) {
              item.skills.forEach((s: string) => {
                sMap[s] = (sMap[s] || 0) + 1
              })
            }
          })

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
      {/* BAGIAN HEADER (Hanya menampilkan filter jika Super Admin) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">
          {"Dashboard Analisa Partner"}
        </h2>
        {isSuperAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <select value={partnerType} onChange={(e) => setPartnerType(e.target.value)} className="input-std">
              <option value="University">{"Perguruan Tinggi"}</option>
              <option value="Training Center">{"Lembaga Pelatihan"}</option>
              <option value="Organization">{"Organisasi / Komunitas"}</option>
            </select>
            <input list="partners" value={myCampus} onChange={(e) => setMyCampus(e.target.value)} className="input-std" placeholder="Pilih Lembaga..." />
            <datalist id="partners">{ALL_PARTNERS.map(p => <option key={p} value={p} />)}</datalist>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 font-black uppercase text-xs text-blue-700">
            {"Lembaga: "}{myCampus}
          </div>
        )}
      </div>

      {/* RINGKASAN STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 text-white p-8 rounded-[2rem]">
          <Users className="text-blue-400 mb-4" size={28} />
          <p className="text-[10px] font-black uppercase opacity-60">{"Total Alumni"}</p>
          <h3 className="text-4xl font-black">{stats.total}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
          <CheckCircle className="text-green-500 mb-4" size={28} />
          <p className="text-[10px] font-black uppercase text-slate-400">{"Terserap Kerja"}</p>
          <h3 className="text-4xl font-black">{stats.hired}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
          <Globe className="text-blue-500 mb-4" size={28} />
          <p className="text-[10px] font-black uppercase text-slate-400">{"Siap Remote"}</p>
          <h3 className="text-4xl font-black">{stats.wfh}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
          <MapPin className="text-red-500 mb-4" size={28} />
          <p className="text-[10px] font-black uppercase text-slate-400">{"Domisili"}</p>
          <h3 className="text-4xl font-black">{Object.keys(stats.cityMap).length} <span className="text-xs uppercase">{"Kota"}</span></h3>
        </div>
      </div>

      {/* MODUL ANALISA SKILL GAP */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200">
        <h3 className="font-black uppercase italic tracking-tighter text-xl mb-6 flex items-center gap-2">
          <TrendingUp className="text-orange-600" size={24}/> {"Analisa Kesenjangan Keahlian"}
        </h3>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-slate-400">{"Keahlian Alumni Anda"}</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.ownedSkills).sort((a,b) => b[1]-a[1]).slice(0, 8).map(([skill, count]) => (
                <span key={skill} className="bg-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase">{skill} ({count})</span>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-slate-400">{"Kebutuhan Pasar vs Ketersediaan"}</h4>
            <div className="space-y-2">
              {stats.marketDemandedSkills.map(skill => (
                <div key={skill} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase">{skill}</span>
                  <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase ${stats.ownedSkills[skill] ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {stats.ownedSkills[skill] ? "Tersedia" : "Butuh Pelatihan"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
