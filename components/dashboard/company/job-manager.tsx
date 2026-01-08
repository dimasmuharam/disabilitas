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
    setAnnouncement(`Masuk ke mode edit untuk lowongan ${job.title}`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Hapus lowongan ${title}?`)) {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (!error) {
        setAnnouncement("Lowongan berhasil dihapus.");
        fetchJobs();
      }
    }
  };

  // FUNGSI TAGGING AKSESIBEL
  const toggleTag = (field: 'required_education_major' | 'required_skills' | 'preferred_disability_tools', value: string) => {
    setJobData(prev => {
      const current = prev[field] || [];
      const isExist = current.includes(value);
      const updated = isExist ? current.filter(i => i !== value) : [...current, value];
      
      setAnnouncement(isExist ? `Dihapus: ${value}` : `Ditambahkan: ${value}`);
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

    const { error } = await supabase.from("jobs").upsert({
      ...jobData,
      company_id: company.id,
      slug: currentSlug,
      updated_at: new Date().toISOString()
    });

    if (!error) {
      setAnnouncement(isEditing ? "Data berhasil diperbarui." : "Lowongan berhasil diterbitkan.");
      setShowForm(false);
      setIsEditing(false);
      setJobData(initialFormState);
      fetchJobs();
      onSuccess();
    } else {
      setAnnouncement(`Gagal menyimpan: ${error.message}`);
    }
    setLoading(false);
  };
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border-2 border-slate-900 shadow-sm">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-slate-900">
          <FileText className="text-blue-600" size={24} /> 
          {showForm ? (isEditing ? "Edit Lowongan" : "Tayangkan Lowongan") : "Manajemen Lowongan"}
        </h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) { setIsEditing(false); setJobData(initialFormState); }
          }}
          className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-md ${showForm ? 'bg-white border-2 border-slate-900 text-slate-900' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
        >
          {showForm ? <><X size={16}/> Batal</> : <><Plus size={16}/> Lowongan Baru</>}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-12">
          
          {/* 1. IDENTITAS & GAJI */}
          <fieldset className="space-y-6">
            <legend className="text-sm font-black uppercase text-blue-600 pb-2 border-b-2 border-blue-50 w-full mb-8">1. Informasi Pekerjaan & Gaji</legend>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="title" className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">Nama Posisi <HelpCircle size={12} className="text-slate-300" /></label>
                <input id="title" required value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold focus:border-blue-600 outline-none" placeholder="Contoh: Digital Marketing Specialist" />
                <p className="text-[9px] text-slate-400 italic ml-2 font-medium">Contoh: Admin Operasional, Web Developer, atau Staff Gudang.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-[10px] font-black uppercase text-slate-400 ml-2">Lokasi Penempatan</label>
                <select id="location" value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold bg-white">
                  {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="text-[9px] text-slate-400 italic ml-2 font-medium">Pilih kota domisili kantor tempat talenta akan bekerja.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2"><DollarSign size={12}/> Rentang Gaji Bulanan (Rp)</label>
                <div className="flex items-center gap-3">
                  <input aria-label="Gaji Minimal" type="number" value={jobData.salary_min} onChange={e => setJobData({...jobData, salary_min: parseInt(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold" />
                  <span className="font-black text-slate-300">—</span>
                  <input aria-label="Gaji Maksimal" type="number" value={jobData.salary_max} onChange={e => setJobData({...jobData, salary_max: parseInt(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold" />
                </div>
                <p className="text-[9px] text-slate-400 italic ml-2 font-medium">Isi nominal angka saja. Gunakan 0 jika tidak ingin menampilkan gaji.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="expires" className="text-[10px] font-black uppercase text-slate-400 ml-2">Tutup Lowongan</label>
                <input id="expires" type="date" value={jobData.expires_at} onChange={e => setJobData({...jobData, expires_at: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold" />
                <p className="text-[9px] text-slate-400 italic ml-2 font-medium">Sistem akan menyembunyikan lowongan setelah tanggal ini.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-3 border-l-4 border-blue-100 pl-4">
                <p id="label-workmode" className="text-[10px] font-black uppercase text-slate-400">Sistem Kerja (Work Mode)</p>
                <div role="radiogroup" aria-labelledby="label-workmode" className="flex flex-wrap gap-3">
                  {WORK_MODES.map(m => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer p-3 bg-white border-2 border-slate-100 rounded-xl has-[:checked]:border-blue-600 shadow-sm">
                      <input type="radio" name="work_mode" value={m} checked={jobData.work_mode === m} onChange={() => setJobData({...jobData, work_mode: m})} className="w-4 h-4 accent-blue-600" />
                      <span className="text-[10px] font-bold uppercase">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3 border-l-4 border-indigo-100 pl-4">
                <p id="label-jobtype" className="text-[10px] font-black uppercase text-slate-400">Tipe Kontrak</p>
                <div role="radiogroup" aria-labelledby="label-jobtype" className="flex flex-wrap gap-3">
                  {EMPLOYMENT_TYPES.map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer p-3 bg-white border-2 border-slate-100 rounded-xl has-[:checked]:border-indigo-600 shadow-sm">
                      <input type="radio" name="job_type" value={t} checked={jobData.job_type === t} onChange={() => setJobData({...jobData, job_type: t})} className="w-4 h-4 accent-indigo-600" />
                      <span className="text-[10px] font-bold uppercase">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>

          {/* 2. PENDIDIKAN & SKILL (TAGGING) */}
          <fieldset className="space-y-8 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
            <legend className="text-[10px] font-black uppercase text-slate-500 px-4 py-1 bg-white border border-slate-200 rounded-full flex items-center gap-2">
              <GraduationCap size={14} /> 2. Kriteria Pendidikan & Kompetensi
            </legend>
            
            <div className="space-y-4">
              <p id="label-edu" className="text-[10px] font-black uppercase text-slate-400 ml-2">Minimal Jenjang Pendidikan</p>
              <div role="radiogroup" aria-labelledby="label-edu" className="flex flex-wrap gap-2">
                {EDUCATION_LEVELS.map(lv => (
                  <label key={lv} className="flex items-center gap-2 p-3 bg-white rounded-xl border-2 border-slate-100 has-[:checked]:border-slate-900 cursor-pointer shadow-sm">
                    <input type="radio" name="edu_level" value={lv} checked={jobData.required_education_level === lv} onChange={() => setJobData({...jobData, required_education_level: lv})} className="w-4 h-4 accent-slate-900" />
                    <span className="text-[10px] font-bold uppercase">{lv}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label htmlFor="major-search" className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">Target Jurusan (Cari & Tambah) <Search size={12}/></label>
              <div className="relative">
                <input id="major-search" value={majorSearch} onChange={(e) => setMajorSearch(e.target.value)} placeholder="Contoh: Ketik Informatika atau Akuntansi..." className="w-full p-4 rounded-2xl border-2 border-white font-bold outline-none focus:border-blue-600 shadow-sm" />
                {majorSearch && (
                  <ul className="absolute z-30 w-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl max-h-48 overflow-y-auto p-2" role="listbox">
                    {UNIVERSITY_MAJORS.filter(m => m.toLowerCase().includes(majorSearch.toLowerCase())).map(m => (
                      <li key={m} role="option"><button type="button" onClick={() => toggleTag('required_education_major', m)} className="w-full text-left p-3 hover:bg-blue-50 rounded-xl font-bold text-[10px] uppercase">{m}</button></li>
                    ))}
                  </ul>
                )}
              </div>
              <ul className="flex flex-wrap gap-2" aria-label="Jurusan terpilih">
                {jobData.required_education_major.map(m => (
                  <li key={m} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
                    {m} <button type="button" aria-label={`Hapus ${m}`} onClick={() => toggleTag('required_education_major', m)}><X size={14}/></button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-200">
              <label htmlFor="skill-search" className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">Keahlian (Skills) yang Diperlukan <Tag size={12}/></label>
              <div className="relative">
                <input id="skill-search" value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Contoh: Ketik Microsoft Excel atau Copywriting..." className="w-full p-4 rounded-2xl border-2 border-white font-bold outline-none focus:border-emerald-600 shadow-sm" />
                {skillSearch && (
                  <ul className="absolute z-30 w-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl max-h-48 overflow-y-auto p-2" role="listbox">
                    {SKILLS_LIST.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).map(s => (
                      <li key={s} role="option"><button type="button" onClick={() => toggleTag('required_skills', s)} className="w-full text-left p-3 hover:bg-emerald-50 rounded-xl font-bold text-[10px] uppercase">{s}</button></li>
                    ))}
                  </ul>
                )}
              </div>
              <ul className="flex flex-wrap gap-2" aria-label="Skill terpilih">
                {jobData.required_skills.map(s => (
                  <li key={s} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
                    {s} <button type="button" aria-label={`Hapus ${s}`} onClick={() => toggleTag('required_skills', s)}><X size={14}/></button>
                  </li>
                ))}
              </ul>
            </div>
          </fieldset>

          {/* 3. AKOMODASI & NARASI (CORE DATA RISET) */}
          <fieldset className="space-y-8">
            <legend className="text-sm font-black uppercase text-emerald-600 pb-2 border-b-2 border-emerald-50 w-full mb-8 flex items-center gap-2">
              <Accessibility size={18} /> 3. Dukungan Akomodasi & Aksesibilitas
            </legend>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-emerald-700 ml-2 font-black italic">Pilih Akomodasi yang Tersedia:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label htmlFor="reqs" className="text-[10px] font-black uppercase text-slate-400 ml-2">Syarat Administratif (Requirements)</label>
                <textarea id="reqs" rows={4} value={jobData.requirements} onChange={e => setJobData({...jobData, requirements: e.target.value})} className="w-full p-6 rounded-[2rem] border-2 border-slate-100 font-medium text-sm outline-none focus:border-blue-600 bg-slate-50/20" placeholder="Contoh: Bersedia lembur jika dibutuhkan, minimal pengalaman 2 tahun di bidang yang sama." />
                <p className="text-[9px] text-slate-400 italic ml-2">Masukkan syarat administratif selain pendidikan dan keahlian.</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="desc" className="text-[10px] font-black uppercase text-slate-400 ml-2">Deskripsi Kerja (Job Description)</label>
                  <button type="button" onClick={() => setJobData(p => ({...p, description: INCLUSIVE_JOB_TEMPLATE}))} className="text-[9px] font-black text-blue-600 underline uppercase italic">Gunakan Template</button>
                </div>
                <textarea id="desc" required rows={6} value={jobData.description} onChange={e => setJobData({...jobData, description: e.target.value})} className="w-full p-6 rounded-[2rem] border-2 border-slate-100 font-medium text-sm shadow-inner bg-slate-50/30 outline-none focus:border-blue-600" placeholder="Jelaskan apa yang akan dikerjakan setiap harinya." />
              </div>
              <div className="space-y-2">
                <label htmlFor="acc-note" className="text-[10px] font-black uppercase text-emerald-700 ml-2">Catatan Aksesibilitas (Penting untuk Riset)</label>
                <textarea id="acc-note" rows={3} value={jobData.accessibility_note} onChange={e => setJobData({...jobData, accessibility_note: e.target.value})} className="w-full p-6 bg-emerald-50/10 border-emerald-100 border-2 rounded-[2rem] font-medium text-sm outline-none focus:border-emerald-600" placeholder="Jelaskan detail dukungan seperti lingkungan ramah sensorik, budaya kerja tertulis, atau ketersediaan pendamping." />
              </div>
            </div>
          </fieldset>

          <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:bg-slate-900 transition-all shadow-xl flex items-center justify-center gap-3">
            {loading ? <Clock className="animate-spin" /> : <CheckCircle2 />} 
            {isEditing ? "Simpan Perubahan Lowongan" : "Tayangkan Lowongan Inklusif"}
          </button>
        </form>
      ) : (
        /* LIST LOWONGAN */
        <div className="grid gap-4">
          {myJobs.length > 0 ? myJobs.map(job => (
            <div key={job.id} className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-slate-900 transition-all gap-6 shadow-sm">
              <div className="flex items-center gap-6 text-left">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-inner"><Briefcase size={28} /></div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {job.location}</span>
                    <span className="text-blue-600">• {job.job_type}</span>
                    <span className="text-emerald-600">• {job.work_mode}</span>
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
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200"><Briefcase size={40} /></div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Belum ada lowongan riset yang terdaftar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
