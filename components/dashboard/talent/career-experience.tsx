"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Briefcase, Save, Plus, Trash2, Building2, 
  MapPin, CheckCircle2, AlertCircle, Info, AlignLeft, ShieldCheck,
  ChevronDown, HelpCircle
} from "lucide-react";

import { 
  CAREER_STATUSES, 
  WORK_MODES, 
  EMPLOYMENT_TYPES, 
  INDONESIA_CITIES,
  EMPLOYER_CATEGORIES,
  GOVERNMENT_AGENCIES_LIST,
  STATE_ENTERPRISES_LIST,
  PRIVATE_COMPANIES_LIST,
  NONPROFIT_ORG_LIST
} from "@/lib/data-static";

interface CareerExperienceProps {
  user: any;
  profile: any;
  onSuccess: () => void;
}

export default function CareerExperience({ user, profile, onSuccess }: CareerExperienceProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [announcement, setAnnouncement] = useState("");
  const [experiences, setExperiences] = useState<any[]>([]);

  const [profileData, setProfileData] = useState({
    career_status: profile?.career_status || "Job Seeker",
    expected_salary: profile?.expected_salary || 0,
    linkedin_url: profile?.linkedin_url || "",
    work_preference: profile?.work_preference || "Hybrid (Kombinasi)", 
    bio: profile?.bio || ""
  });

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  useEffect(() => {
    fetchExperiences();
  }, [user.id]);

  const parseDate = (dateStr: string | null) => {
    if (!dateStr) return { month: "Januari", year: new Date().getFullYear().toString() };
    const date = new Date(dateStr);
    return { month: months[date.getMonth()], year: date.getFullYear().toString() };
  };

  async function fetchExperiences() {
    const { data } = await supabase
      .from("work_experiences")
      .select("*")
      .eq("profile_id", user.id)
      .order("start_date", { ascending: false });
    
    if (data) {
      const formatted = data.map(exp => ({
        ...exp,
        ui_start: parseDate(exp.start_date),
        ui_end: parseDate(exp.end_date),
        is_other_company: false // Flag untuk input manual
      }));
      setExperiences(formatted);
    }
  }

  const handleAddExperience = async () => {
    const newExp = {
      profile_id: user.id,
      company_name: "",
      position: "",
      employer_category: "Perusahaan Swasta",
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      is_current_work: false,
      description: "",
      company_location: "",
      employment_type: "Full-time",
      is_verified: false,
      source_id: null
    };

    const { data, error } = await supabase.from("work_experiences").insert([newExp]).select();
    if (data) {
      const withUI = { ...data[0], ui_start: parseDate(data[0].start_date), ui_end: parseDate(null), is_other_company: false };
      setExperiences([withUI, ...experiences]);
      setAnnouncement("Riwayat baru ditambahkan.");
    }
  };

  const updateExpField = (id: string, field: string, value: any) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const updateUIDate = (id: string, type: 'start' | 'end', part: 'month' | 'year', value: string) => {
    setExperiences(experiences.map(exp => {
      if (exp.id === id) {
        const key = type === 'start' ? 'ui_start' : 'ui_end';
        return { ...exp, [key]: { ...exp[key], [part]: value } };
      }
      return exp;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    setAnnouncement("Memulai proses sinkronisasi data...");

    try {
      // 1. Update Profile (Atomic Step 1)
      const { error: pError } = await supabase.from("profiles").update(profileData).eq("id", user.id);
      if (pError) throw pError;

      // 2. Loop Update Experiences
      for (const exp of experiences) {
        if (!exp.source_id) {
          const startIdx = months.indexOf(exp.ui_start.month) + 1;
          const s_date = `${exp.ui_start.year || '2000'}-${startIdx.toString().padStart(2, '0')}-01`;
          let e_date = null;
          if (!exp.is_current_work && exp.ui_end.year) {
            const endIdx = months.indexOf(exp.ui_end.month) + 1;
            e_date = `${exp.ui_end.year}-${endIdx.toString().padStart(2, '0')}-01`;
          }

          const { error: eError } = await supabase.from("work_experiences").update({
            company_name: exp.company_name,
            position: exp.position,
            company_location: exp.company_location,
            employment_type: exp.employment_type,
            employer_category: exp.employer_category,
            description: exp.description,
            start_date: s_date,
            end_date: e_date,
            is_current_work: exp.is_current_work
          }).eq("id", exp.id);
          
          if (eError) throw eError;

          // LOGIKA RISET: Jika input manual, catat ke manual_input_logs
          const listToSearch = exp.employer_category === "Instansi Pemerintah (ASN)" ? GOVERNMENT_AGENCIES_LIST :
                               exp.employer_category === "BUMN dan BUMD" ? STATE_ENTERPRISES_LIST :
                               exp.employer_category === "Perusahaan Swasta" ? PRIVATE_COMPANIES_LIST : NONPROFIT_ORG_LIST;
          
          if (exp.company_name && !listToSearch.includes(exp.company_name)) {
            await supabase.rpc('log_manual_input', { 
              f_name: 'company_name', 
              i_value: exp.company_name 
            });
          }
        }
      }

      setMessage({ type: "success", text: "Data Karir & Pengalaman Berhasil Disinkronkan!" });
      setAnnouncement("Sukses. Data Anda telah diperbarui di pangkalan data.");
      setTimeout(() => onSuccess(), 2000);
    } catch (err: any) {
      setMessage({ type: "error", text: `Gagal Sinkron: ${err.message}` });
      setAnnouncement(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-20 font-sans text-slate-900 duration-500 animate-in fade-in">
      {/* Hidden Announcement for Screen Readers */}
      <div className="sr-only" aria-live="polite">{announcement}</div>

      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter">
          <Briefcase className="text-blue-600" size={36} /> Karir & Pengalaman
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Pusat Sinkronisasi Riwayat Profesional Anda</p>
      </header>

      {message.text && (
        <div className={`mx-4 mb-8 flex items-center gap-4 rounded-[2rem] border-4 p-6 ${
          message.type === "success" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-red-500 bg-red-50 text-red-800"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10 px-4">
        {/* SECTION: STATUS PROFIL */}
        <section className="space-y-8 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 italic">
            <Info size={16} /> Status & Preferensi
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Status Karir Saat Ini</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
                  value={profileData.career_status}
                  onChange={(e) => setProfileData({...profileData, career_status: e.target.value})}
                >
                  {CAREER_STATUSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Preferensi Model Kerja</label>
              <select className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600" value={profileData.work_preference} onChange={(e) => setProfileData({...profileData, work_preference: e.target.value})}>
                {WORK_MODES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* SECTION: RIWAYAT KERJA */}
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Riwayat Pengalaman</h2>
          <button type="button" onClick={handleAddExperience} className="flex items-center gap-3 rounded-2xl border-4 border-slate-900 bg-white px-6 py-4 text-[10px] font-black uppercase text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-900 hover:text-white transition-all">
            <Plus size={20} /> Tambah Data
          </button>
        </div>

        <div className="space-y-8">
          {experiences.map((exp) => {
            const isFromSystem = !!exp.source_id;
            const currentList = exp.employer_category === "Instansi Pemerintah (ASN)" ? GOVERNMENT_AGENCIES_LIST :
                               exp.employer_category === "BUMN dan BUMD" ? STATE_ENTERPRISES_LIST :
                               exp.employer_category === "Perusahaan Swasta" ? PRIVATE_COMPANIES_LIST : NONPROFIT_ORG_LIST;

            return (
              <div key={exp.id} className={`group relative space-y-8 rounded-[3rem] border-4 p-10 transition-all ${isFromSystem ? 'border-blue-600 bg-blue-50/30' : 'border-slate-900 bg-white shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]'}`}>
                
                {isFromSystem ? (
                  <div className="absolute -top-4 right-10 rounded-full bg-blue-600 px-6 py-2 text-[10px] font-black uppercase italic text-white shadow-xl">
                    <ShieldCheck size={14} className="inline mr-2" /> Data Penempatan Terverifikasi
                  </div>
                ) : (
                  <button type="button" onClick={() => {if(confirm("Hapus riwayat ini?")) handleDeleteExp(exp.id)}} className="absolute right-8 top-8 text-slate-300 hover:text-red-600 transition-colors">
                    <Trash2 size={24} />
                  </button>
                )}

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Kategori Pemberi Kerja</label>
                    <select disabled={isFromSystem} className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600" value={exp.employer_category} onChange={(e) => updateExpField(exp.id, "employer_category", e.target.value)}>
                      {EMPLOYER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <Building2 size={12}/> Nama Instansi/Perusahaan
                    </label>
                    <div className="relative">
                      {!exp.is_other_company ? (
                        <select 
                          disabled={isFromSystem}
                          className="w-full appearance-none rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                          value={exp.company_name}
                          onChange={(e) => {
                            if (e.target.value === "LAINNYA") {
                              updateExpField(exp.id, "is_other_company", true);
                              updateExpField(exp.id, "company_name", "");
                            } else {
                              updateExpField(exp.id, "company_name", e.target.value);
                            }
                          }}
                        >
                          <option value="" disabled>-- Pilih dari Daftar --</option>
                          {currentList.map(item => <option key={item} value={item}>{item}</option>)}
                          <option value="LAINNYA" className="font-black text-blue-600"> + TIDAK ADA DI DAFTAR (INPUT MANUAL)</option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <input 
                            autoFocus
                            type="text"
                            placeholder="Ketik Nama Instansi..."
                            className="w-full rounded-xl border-2 border-blue-600 bg-white p-4 font-bold outline-none"
                            value={exp.company_name}
                            onChange={(e) => updateExpField(exp.id, "company_name", e.target.value)}
                          />
                          <button type="button" onClick={() => updateExpField(exp.id, "is_other_company", false)} className="rounded-xl bg-slate-100 px-4 text-[10px] font-black uppercase">Batal</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Jabatan / Posisi</label>
                    <input disabled={isFromSystem} type="text" className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600" value={exp.position} onChange={(e) => updateExpField(exp.id, "position", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><MapPin size={12}/> Lokasi Kerja</label>
                    <select disabled={isFromSystem} className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600" value={exp.company_location} onChange={(e) => updateExpField(exp.id, "company_location", e.target.value)}>
                      <option value="">-- Pilih Kota --</option>
                      {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-8 pt-4 md:flex-row md:items-end">
                  <fieldset className="flex-1 space-y-3 border-none p-0">
                    <legend className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Periode Mulai</legend>
                    <div className="grid grid-cols-2 gap-2">
                      <select className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 text-xs" value={exp.ui_start.month} onChange={(e) => updateUIDate(exp.id, 'start', 'month', e.target.value)}>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <input type="number" className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 text-xs" value={exp.ui_start.year} onChange={(e) => updateUIDate(exp.id, 'start', 'year', e.target.value)} />
                    </div>
                  </fieldset>

                  <fieldset className="flex-1 space-y-3 border-none p-0">
                    <legend className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Periode Selesai</legend>
                    <div className="grid grid-cols-2 gap-2">
                      <select disabled={exp.is_current_work} className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 text-xs disabled:opacity-30" value={exp.ui_end.month} onChange={(e) => updateUIDate(exp.id, 'end', 'month', e.target.value)}>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <input disabled={exp.is_current_work} type="number" className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 text-xs disabled:opacity-30" value={exp.ui_end.year} onChange={(e) => updateUIDate(exp.id, 'end', 'year', e.target.value)} />
                    </div>
                  </fieldset>

                  <div className="pb-2">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={exp.is_current_work} onChange={(e) => updateExpField(exp.id, "is_current_work", e.target.checked)} className="h-6 w-6 rounded border-4 border-slate-900 accent-blue-600" />
                      <span className="text-[10px] font-black uppercase italic text-blue-600">Masih Aktif</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pt-10">
          <button 
            type="submit" 
            disabled={loading} 
            className="group flex items-center gap-6 rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 px-16 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-white shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] transition-all hover:bg-blue-600 hover:border-blue-600 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Menyinkronkan..." : <><Save size={24} className="group-hover:animate-bounce" /> Simpan Data Profesional</>}
          </button>
        </div>
      </form>
    </div>
  );
}