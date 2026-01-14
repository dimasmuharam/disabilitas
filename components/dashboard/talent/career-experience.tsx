"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Briefcase, Save, Plus, Trash2, Building2, 
  MapPin, CheckCircle2, AlertCircle, Info, AlignLeft, ShieldCheck,
  ChevronDown, Loader2
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        is_other_company: false // Untuk handle combobox "Lainnya"
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
    if (data && !error) {
      const withUI = { ...data[0], ui_start: parseDate(data[0].start_date), ui_end: parseDate(null), is_other_company: false };
      setExperiences([withUI, ...experiences]);
      setAnnouncement("Satu baris riwayat kerja baru ditambahkan.");
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
    if (!confirm("Hapus riwayat kerja ini?")) return;
    const { error } = await supabase.from("work_experiences").delete().eq("id", id);
    if (!error) {
      setExperiences(experiences.filter(exp => exp.id !== id));
      setAnnouncement("Riwayat kerja berhasil dihapus.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    setAnnouncement("Sedang menyinkronkan data ke server...");

    try {
      // 1. Sinkronisasi Tabel Profiles
      const { error: pError } = await supabase
        .from("profiles")
        .update({
          career_status: profileData.career_status,
          expected_salary: profileData.expected_salary,
          linkedin_url: profileData.linkedin_url,
          work_preference: profileData.work_preference,
          bio: profileData.bio,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (pError) throw pError;

      // 2. Sinkronisasi Tabel Work Experiences
      for (const exp of experiences) {
        if (!exp.source_id) {
          const startIdx = months.indexOf(exp.ui_start.month) + 1;
          const s_date = `${exp.ui_start.year || '2000'}-${startIdx.toString().padStart(2, '0')}-01`;
          let e_date = null;
          
          if (!exp.is_current_work && exp.ui_end.year) {
            const endIdx = months.indexOf(exp.ui_end.month) + 1;
            e_date = `${exp.ui_end.year}-${endIdx.toString().padStart(2, '0')}-01`;
          }

          const { error: eError } = await supabase
            .from("work_experiences")
            .update({
              company_name: exp.company_name,
              position: exp.position,
              company_location: exp.company_location,
              employment_type: exp.employment_type,
              employer_category: exp.employer_category,
              description: exp.description,
              start_date: s_date,
              end_date: e_date,
              is_current_work: exp.is_current_work
            })
            .eq("id", exp.id);

          if (eError) throw eError;

          // LOGIKA RISET: Cek jika input manual, catat ke manual_input_logs via RPC
          const lists: Record<string, string[]> = {
            "Instansi Pemerintah (ASN)": GOVERNMENT_AGENCIES_LIST,
            "BUMN dan BUMD": STATE_ENTERPRISES_LIST,
            "Perusahaan Swasta": PRIVATE_COMPANIES_LIST,
            "Lembaga Nonprofit": NONPROFIT_ORG_LIST
          };
          
          const currentList = lists[exp.employer_category] || [];
          if (exp.company_name && !currentList.includes(exp.company_name)) {
            await supabase.rpc('log_manual_input', { 
              f_name: 'company_name', 
              i_value: exp.company_name 
            });
          }
        }
      }

      setMessage({ type: "success", text: "Profil Karir Berhasil Disinkronkan!" });
      setAnnouncement("Berhasil. Seluruh data telah diperbarui.");
      setTimeout(() => onSuccess(), 1500);
    } catch (error: any) {
      setMessage({ type: "error", text: `Gagal Sinkron: ${error.message}` });
      setAnnouncement(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-20 font-sans text-slate-900 duration-500 animate-in fade-in">
      {/* Wilayah pengumuman untuk Screen Reader */}
      <div className="sr-only" aria-live="polite">{announcement}</div>

      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter text-slate-900">
          <Briefcase className="text-blue-600" size={36} /> Karir & Pengalaman
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Pusat Data Sinkronisasi Karir Talenta</p>
      </header>

      {/* Pesan Status Aksesibel */}
      <div className="px-4">
        {message.text && (
          <div className={`mb-8 flex items-center gap-4 rounded-[2rem] border-4 p-6 ${
            message.type === "success" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-red-500 bg-red-50 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 px-4">
        {/* SECTION: STATUS & PREFERENSI */}
        <section className="space-y-8 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 italic">
            <Info size={16} /> Status & Preferensi
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="career_status" className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status Karir</label>
              <select 
                id="career_status" 
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all" 
                value={profileData.career_status} 
                onChange={(e) => setProfileData({...profileData, career_status: e.target.value})}
              >
                {CAREER_STATUSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="work_pref" className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Preferensi Kerja</label>
              <select id="work_pref" className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all" value={profileData.work_preference} onChange={(e) => setProfileData({...profileData, work_preference: e.target.value})}>
                {WORK_MODES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="salary" className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ekspektasi Gaji (Rp)</label>
              <input id="salary" type="number" className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 focus:bg-white" value={profileData.expected_salary} onChange={(e) => setProfileData({...profileData, expected_salary: parseInt(e.target.value) || 0})} />
            </div>
            <div className="space-y-2">
              <label htmlFor="linkedin" className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">LinkedIn Profile URL</label>
              <input id="linkedin" type="url" placeholder="https://linkedin.com/in/..." className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 focus:bg-white" value={profileData.linkedin_url} onChange={(e) => setProfileData({...profileData, linkedin_url: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2 text-sm font-bold">
            <label htmlFor="bio" className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Bio Profesional / Tentang Saya</label>
            <textarea id="bio" rows={4} className="w-full rounded-[2rem] border-2 border-slate-100 bg-slate-50 p-6 font-bold italic outline-none focus:border-blue-600 focus:bg-white" value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} />
          </div>
        </section>

        {/* SECTION: DAFTAR RIWAYAT KERJA */}
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Riwayat Pengalaman</h2>
          <button type="button" onClick={handleAddExperience} className="flex items-center gap-3 rounded-2xl border-4 border-slate-900 bg-white px-6 py-4 text-[10px] font-black uppercase text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-900 hover:text-white transition-all">
            <Plus size={20} /> Tambah Riwayat
          </button>
        </div>

        <div className="space-y-8">
          {experiences.map((exp) => {
            const isFromSystem = !!exp.source_id;
            const currentList = exp.employer_category === "Instansi Pemerintah (ASN)" ? GOVERNMENT_AGENCIES_LIST :
                               exp.employer_category === "BUMN dan BUMD" ? STATE_ENTERPRISES_LIST :
                               exp.employer_category === "Perusahaan Swasta" ? PRIVATE_COMPANIES_LIST : NONPROFIT_ORG_LIST;

            return (
              <section key={exp.id} className={`group relative space-y-8 rounded-[3rem] border-4 p-10 transition-all ${isFromSystem ? 'border-blue-600 bg-blue-50/30' : 'border-slate-900 bg-white shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]'}`}>
                
                {isFromSystem ? (
                  <div className="absolute -top-4 right-10 flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-[10px] font-black uppercase italic text-white shadow-xl">
                    <ShieldCheck size={14} /> Data Penempatan Sistem
                  </div>
                ) : (
                  <button type="button" onClick={() => handleDeleteExp(exp.id)} className="absolute right-8 top-8 text-slate-300 hover:text-red-600 transition-colors" title="Hapus baris ini">
                    <Trash2 size={24} />
                  </button>
                )}

                <div className="grid gap-8 text-sm font-bold text-slate-900 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Kategori Employer</label>
                    <select disabled={isFromSystem} className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 disabled:opacity-50" value={exp.employer_category} onChange={(e) => updateExpField(exp.id, "employer_category", e.target.value)}>
                      {EMPLOYER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <Building2 size={12}/> Nama Instansi / Perusahaan
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
                          <option value="LAINNYA" className="font-black text-blue-600 italic">+ TIDAK ADA DI DAFTAR (INPUT MANUAL)</option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <input 
                            autoFocus
                            type="text"
                            placeholder="Ketik Nama Lengkap Instansi..."
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
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Posisi / Jabatan</label>
                    <input disabled={isFromSystem} type="text" className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 disabled:opacity-50" value={exp.position} onChange={(e) => updateExpField(exp.id, "position", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><MapPin size={12}/> Penempatan (Kota)</label>
                    <select disabled={isFromSystem} className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 disabled:opacity-50" value={exp.company_location} onChange={(e) => updateExpField(exp.id, "company_location", e.target.value)}>
                      <option value="">-- Pilih Kota --</option>
                      {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>

                  <fieldset className="grid grid-cols-2 gap-4 border-none p-0">
                    <legend className="mb-2 ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Periode Mulai</legend>
                    <select disabled={isFromSystem} className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 text-xs" value={exp.ui_start.month} onChange={(e) => updateUIDate(exp.id, 'start', 'month', e.target.value)}>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                    <input disabled={isFromSystem} type="number" className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 text-xs" value={exp.ui_start.year} onChange={(e) => updateUIDate(exp.id, 'start', 'year', e.target.value)} />
                  </fieldset>

                  <fieldset className="grid grid-cols-2 gap-4 border-none p-0">
                    <legend className="mb-2 ml-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Periode Selesai</legend>
                    <select disabled={exp.is_current_work} className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 text-xs disabled:opacity-30" value={exp.ui_end.month} onChange={(e) => updateUIDate(exp.id, 'end', 'month', e.target.value)}>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                    <input disabled={exp.is_current_work} type="number" className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 text-xs disabled:opacity-30" value={exp.ui_end.year} onChange={(e) => updateUIDate(exp.id, 'end', 'year', e.target.value)} />
                  </fieldset>
                </div>

                <div className="space-y-6 pt-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={exp.is_current_work} onChange={(e) => updateExpField(exp.id, "is_current_work", e.target.checked)} className="h-6 w-6 rounded border-4 border-slate-900 accent-blue-600" />
                    <span className="text-[11px] font-black uppercase italic text-blue-600 italic">Saya masih aktif bekerja di posisi ini</span>
                  </label>
                  <div className="space-y-2 text-sm font-bold">
                    <label htmlFor={`desc-${exp.id}`} className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest"><AlignLeft size={14} /> Deskripsi Tugas & Tanggung Jawab</label>
                    <textarea disabled={isFromSystem} id={`desc-${exp.id}`} rows={4} className="w-full rounded-[2rem] border-2 border-slate-100 bg-slate-50 p-6 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all disabled:opacity-50" value={exp.description} onChange={(e) => updateExpField(exp.id, "description", e.target.value)} />
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="flex justify-center pt-10">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex items-center gap-4 rounded-[2.5rem] bg-slate-900 px-16 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-white shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] transition-all hover:bg-blue-600 hover:border-blue-600 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Sinkronkan Seluruh Data</>}
          </button>
        </div>
      </form>
    </div>
  );
}