"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Briefcase, Save, Plus, Trash2, Linkedin, 
  MapPin, DollarSign, CheckCircle2, AlertCircle, Info, AlignLeft, Building2, ShieldCheck
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
    if (!dateStr) return { month: "Januari", year: "" };
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
        ui_end: parseDate(exp.end_date)
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
      source_id: null // Data manual selalu null
    };

    const { data } = await supabase.from("work_experiences").insert([newExp]).select();
    if (data) {
      const withUI = { ...data[0], ui_start: parseDate(data[0].start_date), ui_end: parseDate(null) };
      setExperiences([withUI, ...experiences]);
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

  const handleDeleteExp = async (id: string) => {
    const { error } = await supabase.from("work_experiences").delete().eq("id", id);
    if (!error) setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await supabase.from("profiles").update(profileData).eq("id", user.id);

      for (const exp of experiences) {
        // HANYA UPDATE DATA MANUAL (Yang tidak punya source_id)
        if (!exp.source_id) {
          const startIdx = months.indexOf(exp.ui_start.month) + 1;
          const s_date = `${exp.ui_start.year || '2000'}-${startIdx.toString().padStart(2, '0')}-01`;
          let e_date = null;
          if (!exp.is_current_work && exp.ui_end.year) {
            const endIdx = months.indexOf(exp.ui_end.month) + 1;
            e_date = `${exp.ui_end.year}-${endIdx.toString().padStart(2, '0')}-01`;
          }

          await supabase.from("work_experiences").update({
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
        }
      }

      setMessage({ type: "success", text: "Data Berhasil Disimpan. Mengalihkan ke Overview..." });
      setTimeout(() => onSuccess(), 2000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-20 font-sans text-slate-900 duration-500 animate-in fade-in">
      <datalist id="gov-list">{GOVERNMENT_AGENCIES_LIST.map(a => <option key={a} value={a} />)}</datalist>
      <datalist id="state-list">{STATE_ENTERPRISES_LIST.map(b => <option key={b} value={b} />)}</datalist>
      <datalist id="private-list">{PRIVATE_COMPANIES_LIST.map(s => <option key={s} value={s} />)}</datalist>
      <datalist id="city-list">{INDONESIA_CITIES.map(city => <option key={city} value={city} />)}</datalist>
      <datalist id="nonprofit-list">{NONPROFIT_ORG_LIST.map(n => <option key={n} value={n} />)}</datalist>

      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter">
          <Briefcase className="text-blue-600" size={36} /> {"Karir & Pengalaman"}
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{"Lengkapi data kerja Anda untuk tampil makin meyakinkan di hadapan recruter."}</p>
      </header>

      <div aria-live="polite" className="px-4">
        {message.text && (
          <div className={`mb-8 flex items-center gap-4 rounded-[2rem] border-2 p-6 ${
            message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 px-4">
        {/* SEKSI PROFIL */}
        <section className="space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600"><Info size={16} /> {"Status & Preferensi"}</h2>
          <div className="grid gap-6 text-sm font-bold md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="career_status" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Status Karir"}</label>
              <select id="career_status" className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600" value={profileData.career_status} onChange={(e) => setProfileData({...profileData, career_status: e.target.value})}>
                {CAREER_STATUSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="work_pref" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Preferensi Model Kerja"}</label>
              <select id="work_pref" className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600" value={profileData.work_preference} onChange={(e) => setProfileData({...profileData, work_preference: e.target.value})}>
                {WORK_MODES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="salary" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Ekspektasi Gaji"}</label>
              <input id="salary" type="number" className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold" value={profileData.expected_salary} onChange={(e) => setProfileData({...profileData, expected_salary: parseInt(e.target.value) || 0})} />
            </div>
            <div className="space-y-2">
              <label htmlFor="linkedin" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"LinkedIn URL"}</label>
              <input id="linkedin" type="url" className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold" value={profileData.linkedin_url} onChange={(e) => setProfileData({...profileData, linkedin_url: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2 text-sm font-bold">
            <label htmlFor="bio" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Bio Profesional"}</label>
            <textarea id="bio" rows={4} className="w-full rounded-[2rem] border-2 border-slate-100 bg-slate-50 p-6 font-bold italic outline-none" value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} />
          </div>
        </section>

        {/* DAFTAR PEKERJAAN */}
        <div className="flex items-center justify-between px-4">
          <h2 className="text-xl font-black uppercase italic tracking-tighter">{"Daftar Riwayat Kerja"}</h2>
          <button type="button" onClick={handleAddExperience} className="flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-slate-900"><Plus size={20} /> {"Tambah Riwayat"}</button>
        </div>

        <div className="space-y-8">
          {experiences.map((exp, index) => {
            const isFromSystem = !!exp.source_id; // Deteksi data sistem

            return (
              <section key={exp.id} aria-label={`Riwayat ${index + 1}`} className={`group relative space-y-8 rounded-[3rem] border-2 bg-white p-10 shadow-sm ${isFromSystem ? 'border-blue-200 bg-blue-50/10' : 'border-slate-100'}`}>
                
                {isFromSystem ? (
                  <div className="absolute right-8 top-8 flex animate-pulse items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-[10px] font-black uppercase text-white shadow-lg">
                    <ShieldCheck size={14} /> {"Hasil Penempatan Sistem"}
                  </div>
                ) : (
                  <button type="button" onClick={() => handleDeleteExp(exp.id)} className="absolute right-8 top-8 text-slate-300 transition-colors hover:text-red-600"><Trash2 size={24} /></button>
                )}

                <div className="grid gap-8 text-sm font-bold text-slate-900 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor={`cat-${exp.id}`} className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Kategori Employer"}</label>
                    <select disabled={isFromSystem} id={`cat-${exp.id}`} className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 disabled:opacity-60" value={exp.employer_category} onChange={(e) => updateExpField(exp.id, "employer_category", e.target.value)}>
                      {EMPLOYER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`comp-${exp.id}`} className="ml-2 flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400"><Building2 size={12}/> {"Nama Instansi"}</label>
                    <input disabled={isFromSystem} id={`comp-${exp.id}`} type="text" list={exp.employer_category === "Instansi Pemerintah (ASN)" ? "gov-list" : exp.employer_category === "BUMN dan BUMD" ? "state-list" : exp.employer_category === "Perusahaan Swasta" ? "private-list" : exp.employer_category === "Lembaga Nonprofit" ? "nonprofit-list" : ""} className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 disabled:opacity-60" value={exp.company_name} onChange={(e) => updateExpField(exp.id, "company_name", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`pos-${exp.id}`} className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Jabatan"}</label>
                    <input disabled={isFromSystem} id={`pos-${exp.id}`} type="text" className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-4 font-bold disabled:opacity-60" value={exp.position} onChange={(e) => updateExpField(exp.id, "position", e.target.value)} />
                  </div>

                  <div className="space-y-2">
  <label htmlFor={`loc-${exp.id}`} className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Lokasi (Kota/Kabupaten)"}</label>
  <div className="relative">
    <MapPin className="absolute left-4 top-4 text-slate-400" size={16} aria-hidden="true" />
    <input 
      disabled={isFromSystem}
      id={`loc-${exp.id}`} 
      type="text" 
      list="city-list" // <--- Ini kunci penghubungnya
      placeholder="Cari Kota/Kabupaten..."
      className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-4 pl-12 font-bold outline-none focus:border-blue-600 disabled:opacity-60" 
      value={exp.company_location} 
      onChange={(e) => updateExpField(exp.id, "company_location", e.target.value)} 
    />
  </div>
</div>
                  <div className="space-y-2">
                    <label htmlFor={`type-${exp.id}`} className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Ikatan Kerja"}</label>
                    <select disabled={isFromSystem} id={`type-${exp.id}`} className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-4 font-bold disabled:opacity-60" value={exp.employment_type} onChange={(e) => updateExpField(exp.id, "employment_type", e.target.value)}>
                      {EMPLOYMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>

                  <fieldset className="m-0 grid grid-cols-2 gap-4 border-none p-0">
                    <legend className="mb-2 ml-2 text-[10px] font-bold uppercase text-slate-400">{"Waktu Mulai"}</legend>
                    <select aria-label="Bulan Mulai" disabled={isFromSystem} className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-4 font-bold disabled:opacity-60" value={exp.ui_start.month} onChange={(e) => updateUIDate(exp.id, 'start', 'month', e.target.value)}>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                    <input aria-label="Tahun Mulai" type="number" disabled={isFromSystem} className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-4 font-bold disabled:opacity-60" value={exp.ui_start.year} onChange={(e) => updateUIDate(exp.id, 'start', 'year', e.target.value)} />
                  </fieldset>

                  <fieldset className="m-0 grid grid-cols-2 gap-4 border-none p-0">
                    <legend className="mb-2 ml-2 text-[10px] font-bold uppercase text-slate-400">{"Waktu Selesai"}</legend>
                    <select aria-label="Bulan Selesai" disabled={exp.is_current_work} className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-4 font-bold disabled:opacity-30" value={exp.ui_end.month} onChange={(e) => updateUIDate(exp.id, 'end', 'month', e.target.value)}>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                    <input aria-label="Tahun Selesai" type="number" disabled={exp.is_current_work} className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-4 font-bold disabled:opacity-30" value={exp.ui_end.year} onChange={(e) => updateUIDate(exp.id, 'end', 'year', e.target.value)} />
                  </fieldset>
                </div>

                <div className="space-y-6 pt-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={exp.is_current_work} onChange={(e) => updateExpField(exp.id, "is_current_work", e.target.checked)} className="size-6 accent-blue-600" />
                    <span className="text-[11px] font-black uppercase italic text-blue-600">{"Masih aktif bekerja"} {isFromSystem && "(Dapat diselesaikan jika berhenti)"}</span>
                  </label>
                  <div className="space-y-2 text-sm font-bold">
                    <label htmlFor={`desc-${exp.id}`} className="ml-2 flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400"><AlignLeft size={14} /> {"Rincian Pekerjaan"}</label>
                    <textarea disabled={isFromSystem} id={`desc-${exp.id}`} rows={4} className="w-full rounded-[2rem] border-2 border-transparent bg-slate-50 p-6 font-bold outline-none focus:border-blue-600 disabled:opacity-60" value={exp.description} onChange={(e) => updateExpField(exp.id, "description", e.target.value)} />
                  </div>
                </div>
              </section>
            )
          })}
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="flex items-center gap-4 rounded-[2rem] bg-slate-900 px-12 py-5 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-blue-600 disabled:opacity-50">
            {loading ? "Menyimpan..." : <><Save size={20} /> {"Simpan Profil Karir"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
