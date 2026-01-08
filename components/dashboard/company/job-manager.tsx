"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, FileText, Trash2, Sparkles, 
  Briefcase, MapPin, Info, X, CheckCircle2,
  GraduationCap, Heart, Clock, Calendar,
  Search, Tag, Edit3, Monitor, DollarSign,
  Accessibility, ListChecks, HelpCircle
} from "lucide-react";

import { 
  WORK_MODES, 
  INCLUSIVE_JOB_TEMPLATE,
  INDONESIA_CITIES,
  EDUCATION_LEVELS,
  ACCOMMODATION_TYPES,
  UNIVERSITY_MAJORS,
  EMPLOYMENT_TYPES,
  SKILLS_LIST
} from "@/lib/data-static";

export default function JobManager({ company, onSuccess }: { company: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const [majorSearch, setMajorSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");

  const initialFormState = {
    id: undefined as string | undefined,
    slug: "" as string,
    title: "",
    description: "",
    requirements: "", 
    location: company?.location || "Jakarta Selatan",
    work_mode: WORK_MODES[0],
    job_type: EMPLOYMENT_TYPES[0],
    salary_min: 0,
    salary_max: 0,
    required_education_level: EDUCATION_LEVELS[5], 
    required_education_major: [] as string[],
    required_skills: [] as string[],
    accessibility_note: "",
    preferred_disability_tools: [] as string[],
    is_active: true,
    expires_at: ""
  };

  const [jobData, setJobData] = useState(initialFormState);

  useEffect(() => {
    if (company?.id) fetchJobs();
  }, [company?.id]);

  async function fetchJobs() {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });
    setMyJobs(data || []);
  }

  const handleEdit = (job: any) => {
    setJobData({
      ...job,
      required_education_major: job.required_education_major || [],
      required_skills: job.required_skills || [],
      preferred_disability_tools: job.preferred_disability_tools || []
    });
    setIsEditing(true);
    setShowForm(true);
    setAnnouncement(`{"Mode edit aktif: "}${job.title}`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`{"Hapus lowongan "}${title}{"?"}`)) {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (!error) {
        setAnnouncement("Lowongan berhasil dihapus dari sistem riset.");
        fetchJobs();
      }
    }
  };

  const toggleTag = (field: 'required_education_major' | 'required_skills' | 'preferred_disability_tools', value: string) => {
    setJobData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(i => i !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
    if (field === 'required_education_major') setMajorSearch("");
    if (field === 'required_skills') setSkillSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const currentSlug = jobData.id && jobData.slug
      ? jobData.slug 
      : `${jobData.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;

    // Menghapus key id jika undefined agar tidak mengganggu query
    const { id, ...saveData } = jobData;
    const finalData = jobData.id ? jobData : saveData;

    const { error } = await supabase.from("jobs").upsert({
      ...finalData,
      company_id: company.id,
      slug: currentSlug,
      updated_at: new Date().toISOString()
    });

    if (!error) {
      setAnnouncement(isEditing ? "Data riset lowongan berhasil diperbarui." : "Lowongan baru berhasil ditayangkan.");
      setShowForm(false);
      setIsEditing(false);
      setJobData(initialFormState);
      fetchJobs();
      onSuccess();
    } else {
      setAnnouncement(`{"Gagal menyimpan: "}${error.message}`);
    }
    setLoading(false);
  };
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

      <header className="flex justify-between items-center bg-white p-6 rounded-[2rem] border-2 border-slate-900 shadow-sm">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <FileText className="text-blue-600" size={24} /> 
          {showForm ? (isEditing ? "Perbarui Data Lowongan" : "Input Lowongan Baru") : "Manajemen Lowongan Kerja"}
        </h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) { setIsEditing(false); setJobData(initialFormState); }
          }}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all"
        >
          {showForm ? <><X size={16}/> Batal</> : <><Plus size={16}/> Buat Lowongan</>}
        </button>
      </header>

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-12">
          
          {/* 1. IDENTITAS UTAMA */}
          <fieldset className="space-y-6">
            <legend className="text-sm font-black uppercase text-blue-600 pb-2 border-b-2 border-blue-50 w-full mb-6">1. Identitas Pekerjaan</legend>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="title" className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">Nama Posisi <HelpCircle size={10} title="Contoh: Staff Akuntansi"/></label>
                <input id="title" required value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold focus:border-blue-600 outline-none transition-all" placeholder="Contoh: Digital Marketing Specialist" />
                <p className="text-[9px] text-slate-400 italic ml-2">Masukkan nama jabatan fungsional yang ditawarkan.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-[10px] font-black uppercase text-slate-400 ml-2">Lokasi Penempatan</label>
                <select id="location" value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold bg-white outline-none">
                  {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="text-[9px] text-slate-400 italic ml-2">Pilih kota domisili kantor atau area penugasan.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p id="label-workmode" className="text-[10px] font-black uppercase text-slate-400 ml-2">Sistem Kerja (Work Mode)</p>
                <div role="radiogroup" aria-labelledby="label-workmode" className="flex flex-wrap gap-4">
                  {WORK_MODES.map(m => (
                    <label key={m} className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl border-2 border-slate-100 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 transition-all">
                      <input type="radio" name="work_mode" value={m} checked={jobData.work_mode === m} onChange={() => setJobData({...jobData, work_mode: m})} className="w-5 h-5 accent-blue-600" />
                      <span className="text-[10px] font-bold uppercase">{m}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 italic ml-2">Tentukan apakah pekerjaan ini membutuhkan kehadiran fisik atau bisa remote.</p>
              </div>
              <div className="space-y-3">
                <p id="label-jobtype" className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipe Kontrak</p>
                <div role="radiogroup" aria-labelledby="label-jobtype" className="flex flex-wrap gap-4">
                  {EMPLOYMENT_TYPES.map(t => (
                    <label key={t} className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl border-2 border-slate-100 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 transition-all">
                      <input type="radio" name="job_type" value={t} checked={jobData.job_type === t} onChange={() => setJobData({...jobData, job_type: t})} className="w-5 h-5 accent-indigo-600" />
                      <span className="text-[10px] font-bold uppercase">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Rentang Gaji Bulanan (Rp)</label>
                <div className="flex items-center gap-3">
                  <input aria-label="Gaji Minimal" type="number" value={jobData.salary_min} onChange={e => setJobData({...jobData, salary_min: parseInt(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold" />
                  <span className="font-black text-slate-300">—</span>
                  <input aria-label="Gaji Maksimal" type="number" value={jobData.salary_max} onChange={e => setJobData({...jobData, salary_max: parseInt(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold" />
                </div>
                <p className="text-[9px] text-slate-400 italic ml-2">Isi angka saja (contoh: 5000000). Gunakan 0 jika gaji tidak dipublikasikan.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="expires" className="text-[10px] font-black uppercase text-slate-400 ml-2">Batas Akhir Penayangan</label>
                <input id="expires" type="date" value={jobData.expires_at} onChange={e => setJobData({...jobData, expires_at: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none" />
                <p className="text-[9px] text-slate-400 italic ml-2">Tanggal otomatis lowongan akan ditutup.</p>
              </div>
            </div>
          </fieldset>

          {/* 2. PENDIDIKAN & SKILL (SISTEM TAGGING) */}
          <fieldset className="space-y-8 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
            <legend className="text-[10px] font-black uppercase text-slate-500 px-4 py-1 bg-white border border-slate-200 rounded-full flex items-center gap-2">
              <GraduationCap size={14} /> 2. Kriteria Pendidikan & Kompetensi
            </legend>
            
            <div className="space-y-4">
              <p id="label-edu" className="text-[10px] font-black uppercase text-slate-400 ml-2">Jenjang Pendidikan Minimal</p>
              <div role="radiogroup" aria-labelledby="label-edu" className="flex flex-wrap gap-3">
                {EDUCATION_LEVELS.map(lv => (
                  <label key={lv} className="flex items-center gap-2 p-3 bg-white rounded-xl border-2 border-transparent has-[:checked]:border-slate-900 cursor-pointer shadow-sm">
                    <input type="radio" name="edu_level" value={lv} checked={jobData.required_education_level === lv} onChange={() => setJobData({...jobData, required_education_level: lv})} className="w-4 h-4 accent-slate-900" />
                    <span className="text-[10px] font-bold uppercase">{lv}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* TAGGING JURUSAN */}
            <div className="space-y-4">
              <label htmlFor="major-search" className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">Kriteria Jurusan <Search size={10}/></label>
              <div className="relative">
                <input id="major-search" value={majorSearch} onChange={(e) => setMajorSearch(e.target.value)} placeholder="Contoh: ketik Informatika atau Hukum..." className="w-full p-4 rounded-2xl border-2 border-white font-bold outline-none focus:border-blue-600 shadow-sm" />
                {majorSearch && (
                  <ul className="absolute z-30 w-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl max-h-56 overflow-y-auto p-2" role="listbox">
                    {UNIVERSITY_MAJORS.filter(m => m.toLowerCase().includes(majorSearch.toLowerCase())).map(m => (
                      <li key={m} role="option">
                        <button type="button" onClick={() => toggleTag('required_education_major', m)} className="w-full text-left p-3 hover:bg-blue-600 hover:text-white rounded-xl font-bold text-[10px] uppercase transition-colors">{m}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <ul className="flex flex-wrap gap-2" aria-label="Jurusan yang dipilih">
                {jobData.required_education_major.map(m => (
                  <li key={m} className="px-4 py-2 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase flex items-center gap-2 animate-in zoom-in">
                    {m} <button type="button" aria-label={`Hapus ${m}`} onClick={() => toggleTag('required_education_major', m)}><X size={14}/></button>
                  </li>
                ))}
              </ul>
              <p className="text-[9px] text-slate-400 italic ml-2 font-medium">Bisa menambahkan lebih dari satu jurusan pendidikan yang relevan.</p>
            </div>

            {/* TAGGING SKILLS */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <label htmlFor="skill-search" className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">Keahlian / Skills yang Diperlukan <Tag size={10}/></label>
              <div className="relative">
                <input id="skill-search" value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Contoh: ketik Administrasi atau Web Development..." className="w-full p-4 rounded-2xl border-2 border-white font-bold outline-none focus:border-emerald-600 shadow-sm" />
                {skillSearch && (
                  <ul className="absolute z-30 w-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl max-h-56 overflow-y-auto p-2" role="listbox">
                    {SKILLS_LIST.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).map(s => (
                      <li key={s} role="option">
                        <button type="button" onClick={() => toggleTag('required_skills', s)} className="w-full text-left p-3 hover:bg-emerald-600 hover:text-white rounded-xl font-bold text-[10px] uppercase">{s}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <ul className="flex flex-wrap gap-2" aria-label="Skill yang dipilih">
                {jobData.required_skills.map(s => (
                  <li key={s} className="px-4 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase flex items-center gap-2 animate-in zoom-in">
                    {s} <button type="button" aria-label={`Hapus ${s}`} onClick={() => toggleTag('required_skills', s)}><X size={14}/></button>
                  </li>
                ))}
              </ul>
            </div>
          </fieldset>

          {/* 3. AKOMODASI & NARASI */}
          <fieldset className="space-y-8">
            <legend className="text-sm font-black uppercase text-emerald-600 pb-2 border-b-2 border-emerald-50 w-full mb-8 flex items-center gap-2">
              <Heart size={18} /> 3. Dukungan Inklusi & Aksesibilitas (Riset)
            </legend>
            <div className="space-y-4">
              <p id="label-acc" className="text-[10px] font-black uppercase text-emerald-700 ml-2">Fasilitas Akomodasi Tersedia (Bisa pilih lebih dari satu)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="group" aria-labelledby="label-acc">
                {ACCOMMODATION_TYPES.map(acc => (
                  <label key={acc} className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-emerald-500 transition-all shadow-sm">
                    <input type="checkbox" checked={jobData.preferred_disability_tools.includes(acc)} onChange={() => toggleTag('preferred_disability_tools', acc)} className="w-6 h-6 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-slate-700 leading-tight">{acc}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label htmlFor="requirements" className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2"><ListChecks size={12}/> Kualifikasi Umum (Administratif)</label>
                <textarea id="requirements" rows={4} value={jobData.requirements} onChange={e => setJobData({...jobData, requirements: e.target.value})} className="w-full p-6 rounded-[2rem] border-2 border-slate-100 font-medium text-sm outline-none focus:border-blue-600 bg-slate-50/20 transition-all shadow-inner" placeholder="Contoh: Minimal 2 tahun pengalaman, Bersedia penempatan Jakarta, dsb." />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="desc" className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2"><FileText size={12}/> Deskripsi Pekerjaan</label>
                  <button type="button" onClick={() => setJobData(p => ({...p, description: INCLUSIVE_JOB_TEMPLATE}))} className="text-[9px] font-black text-blue-600 underline uppercase italic hover:text-blue-800">Gunakan Template Inklusif</button>
                </div>
                <textarea id="desc" required rows={6} value={jobData.description} onChange={e => setJobData({...jobData, description: e.target.value})} className="w-full p-6 rounded-[2rem] border-2 border-slate-100 font-medium text-sm shadow-inner bg-slate-50/30 outline-none focus:border-blue-600 transition-all" placeholder="Jelaskan detail tanggung jawab utama posisi ini." />
              </div>
              <div className="space-y-2">
                <label htmlFor="acc-note" className="text-[10px] font-black uppercase text-emerald-700 ml-2 flex items-center gap-2"><Accessibility size={12}/> Catatan Tambahan Aksesibilitas (Sangat Penting untuk Riset)</label>
                <textarea id="acc-note" rows={3} value={jobData.accessibility_note} onChange={e => setJobData({...jobData, accessibility_note: e.target.value})} className="w-full p-6 bg-emerald-50/10 rounded-[2rem] border-2 border-emerald-100 font-medium text-sm outline-none focus:border-emerald-600 transition-all" placeholder="Jelaskan budaya inklusi atau fasilitas khusus yang tidak tertera di pilihan atas." />
              </div>
            </div>
          </fieldset>

          <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:bg-slate-900 transition-all shadow-xl flex items-center justify-center gap-3">
            {loading ? <Clock className="animate-spin" /> : <CheckCircle2 />} 
            {isEditing ? "SIMPAN PERUBAHAN LOWONGAN" : "TAYANGKAN LOWONGAN INKLUSIF"}
          </button>
        </form>
      ) : (
        /* LIST LOWONGAN */
        <div className="grid gap-4">
          {myJobs.length > 0 ? myJobs.map(job => (
            <div key={job.id} className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-slate-900 transition-all gap-6 shadow-sm">
              <div className="flex items-center gap-6 text-left">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"><Briefcase size={28} /></div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {job.location}</span>
                    <span className="text-blue-600 font-black">• {job.job_type}</span>
                    <span className="text-indigo-600 font-black">• {job.work_mode}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={() => handleEdit(job)} className="flex-1 md:flex-none p-4 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 font-black text-[9px] uppercase"><Edit3 size={18} /> Edit</button>
                <button onClick={() => handleDelete(job.id, job.title)} className="p-4 bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm" aria-label={`Hapus lowongan ${job.title}`}><Trash2 size={18} /></button>
              </div>
            </div>
          )) : (
            <div className="p-24 border-4 border-dashed border-slate-50 rounded-[4rem] text-center opacity-50">
              <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-[0.2em]">Belum ada lowongan riset yang terdaftar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
