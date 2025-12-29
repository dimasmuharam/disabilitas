"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
// Import Data Statis
import { INDONESIA_CITIES, UNIVERSITIES, DISABILITY_TOOLS } from "@/lib/data-static"

export default function TalentDashboard({ user }: { user: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [showVerifiedSuccess, setShowVerifiedSuccess] = useState(false)

  // Data State
  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")
  const [gender, setGender] = useState("male")
  const [disabilityCategory, setDisabilityCategory] = useState("")
  const [institutionName, setInstitutionName] = useState("") // Nama Kampus
  const [lastEducation, setLastEducation] = useState("")
  const [skills, setSkills] = useState("")
  const [workPref, setWorkPref] = useState("hybrid")
  const [isConsent, setIsConsent] = useState(false)

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setShowVerifiedSuccess(true)
      router.replace('/dashboard')
    }
    getProfile()
  }, []) 

  async function getProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setFullName(data.full_name || "")
        setCity(data.city || "")
        setGender(data.gender || "male")
        setDisabilityCategory(data.disability_category || "")
        setInstitutionName(data.institution_name || "")
        setLastEducation(data.last_education || "")
        setWorkPref(data.work_preference || "hybrid")
        setSkills(data.skills ? data.skills.join(", ") : "")
        setIsConsent(data.is_research_consent || false)
      }
    } catch (error) {
      console.log("Error loading profile", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg("")

    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        city,
        gender,
        disability_category: disabilityCategory,
        institution_name: institutionName, // Simpan nama kampus
        last_education: lastEducation,
        work_preference: workPref,
        skills: skills.split(",").map((s) => s.trim()),
        is_research_consent: isConsent,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      setMsg("Data berhasil disimpan! Profil Anda kini aktif.")
      setShowVerifiedSuccess(false)
    } catch (error) {
      setMsg("Gagal menyimpan data.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-4">Memuat data talenta...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Halo, {fullName || "Talenta"}!</h2>
        <p className="text-slate-600 dark:text-slate-400">Lengkapi profil untuk riset Tracer Study dan pencocokan kerja.</p>
        
        {showVerifiedSuccess && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md text-sm font-medium">
            ✅ Email berhasil diverifikasi. Akun Anda aktif.
          </div>
        )}
      </div>

      {/* Form Profil */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={updateProfile} className="space-y-6">
           
           {/* SECTION 1: IDENTITAS */}
           <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">1. Identitas & Domisili</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-std" />
                  </div>
                  
                  {/* COMBOBOX KOTA */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Kota Domisili</label>
                    <input 
                      list="cities" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                      className="input-std" 
                      placeholder="Ketik untuk mencari..." 
                    />
                    <datalist id="cities">
                      {INDONESIA_CITIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                    <p className="text-xs text-slate-500 mt-1">Bisa diketik manual jika tidak ada di list.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-std">
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>
              </div>
           </div>

           {/* SECTION 2: DISABILITAS */}
           <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">2. Kondisi Disabilitas</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori Utama</label>
                <select value={disabilityCategory} onChange={(e) => setDisabilityCategory(e.target.value)} className="input-std">
                  <option value="">-- Pilih --</option>
                  <option value="Sensorik Netra">Sensorik Netra (Blind/Low Vision)</option>
                  <option value="Sensorik Rungu">Sensorik Rungu (Tuli/HoH)</option>
                  <option value="Fisik">Fisik / Daksa</option>
                  <option value="Intelektual">Intelektual</option>
                  <option value="Mental">Mental</option>
                  <option value="Non-Disabilitas">Non-Disabilitas</option>
                </select>
              </div>
           </div>

           {/* SECTION 3: PENDIDIKAN & SKILL (TRACER STUDY) */}
           <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">3. Pendidikan & Kompetensi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Jenjang Pendidikan Terakhir</label>
                    <select value={lastEducation} onChange={(e) => setLastEducation(e.target.value)} className="input-std">
                      <option value="">-- Pilih --</option>
                      <option value="SD">SD / Sederajat</option>
                      <option value="SMP">SMP / Sederajat</option>
                      <option value="SMA">SMA / SMK / SMALB</option>
                      <option value="D3">Diploma (D3)</option>
                      <option value="S1">Sarjana (S1)</option>
                      <option value="S2">Magister (S2)</option>
                      <option value="S3">Doktor (S3)</option>
                    </select>
                  </div>

                  {/* COMBOBOX KAMPUS */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Sekolah / Kampus</label>
                    <input 
                      list="campus" 
                      value={institutionName} 
                      onChange={(e) => setInstitutionName(e.target.value)} 
                      className="input-std" 
                      placeholder="Cari nama kampus..." 
                    />
                    <datalist id="campus">
                      {UNIVERSITIES.map((u) => (
                        <option key={u} value={u} />
                      ))}
                    </datalist>
                    <p className="text-xs text-slate-500 mt-1">Jika nama kampus tidak ada, silakan ketik manual lengkap.</p>
                  </div>
              </div>

              <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Skill / Keahlian</label>
                  <textarea value={skills} onChange={(e) => setSkills(e.target.value)} className="input-std h-20" placeholder="Contoh: Microsoft Word, Public Speaking, Python" />
              </div>
           </div>

           {/* SECTION 4: CONSENT */}
           <div className="flex items-start space-x-3 p-4 bg-slate-50 dark:bg-slate-800 rounded">
              <input 
                id="consent" 
                type="checkbox" 
                checked={isConsent}
                onChange={(e) => setIsConsent(e.target.checked)}
                className="mt-1 h-5 w-5 text-blue-600 rounded"
              />
              <label htmlFor="consent" className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Informed Consent:</strong> Saya mengizinkan data ini (anonim) digunakan untuk Riset BRIN & Jurnal JAIP.
              </label>
           </div>

           {/* Tombol Simpan */}
           <button type="submit" disabled={saving} className="btn-primary w-full text-lg">
             {saving ? "Menyimpan..." : "SIMPAN DATA TALENTA"}
           </button>
           {msg && <p className="text-center text-sm mt-2 text-blue-600 font-medium">{msg}</p>}
        </form>
      </div>
    </div>
  )
}
