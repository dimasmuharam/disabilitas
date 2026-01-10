"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, FileText, Trash2, Sparkles, 
  Briefcase, MapPin, Info, X, CheckCircle2,
  GraduationCap, Clock, Search, Tag, Edit3, Monitor, 
  DollarSign, Accessibility, HelpCircle, BookOpen, RotateCcw
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
    id: "" as string,
    slug: "" as string,
    title: "",
    description: "",
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

  const fetchJobs = useCallback(async () => {
    if (!company?.id) return;
    const supabase = createClient()
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });
    setMyJobs(data || []);
  }, [company?.id]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleEdit = (job: any) => {
    setJobData({
      id: job.id,
      slug: job.slug || "",
      title: job.title || "",
      description: job.description || "",
      location: job.location || company?.location || "",
      work_mode: job.work_mode || WORK_MODES[0],
      job_type: job.job_type || EMPLOYMENT_TYPES[0],
      salary_min: job.salary_min || 0,
      salary_max: job.salary_max || 0,
      required_education_level: job.required_education_level || EDUCATION_LEVELS[5],
      required_education_major: Array.isArray(job.required_education_major) ? job.required_education_major : [],
      required_skills: Array.isArray(job.required_skills) ? job.required_skills : [],
      preferred_disability_tools: Array.isArray(job.preferred_disability_tools) ? job.preferred_disability_tools : [],
      accessibility_note: job.accessibility_note || "",
      is_active: job.is_active ?? true,
      expires_at: job.expires_at || ""
    });
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTag = (field: 'required_education_major' | 'required_skills' | 'preferred_disability_tools', value: string) => {
    setJobData(prev => {
      const current = prev[field] || [];
      const isExist = current.includes(value);
      const updated = isExist ? current.filter(i => i !== value) : [...current, value];
      setAnnouncement(isExist ? `Dihapus: ${value}` : `Ditambah: ${value}`);
      return { ...prev, [field]: updated };
    });
    if (field === 'required_education_major') setMajorSearch("");
    if (field === 'required_skills') setSkillSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient()
    
    const payload = { ...jobData };
    if (!isEditing) delete (payload as any).id;

    const currentSlug = isEditing && jobData.slug
      ? jobData.slug 
      : `${jobData.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;

    const { error } = await supabase.from("jobs").upsert({
      ...payload,
      company_id: company.id,
      slug: currentSlug,
      updated_at: new Date().toISOString()
    });

    if (!error) {
      setShowForm(false);
      setIsEditing(false);
      setJobData(initialFormState);
      fetchJobs();
      onSuccess();
    } else {
      alert(`Gagal: ${error.message}`);
    }
    setLoading(false);
  };
  return (
    <div className="mx-auto max-w-6xl space-y-8 text-left font-sans duration-500 animate-in fade-in">
      <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

      {/* HEADER */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-[2rem] border-2 border-slate-900 bg-white p-6 shadow-sm sm:flex-row">
        <h2 className="flex w-full items-center gap-3 text-xl font-black uppercase italic tracking-tighter text-slate-900 sm:w-auto">
          <FileText className="shrink-0 text-blue-600" size={24} /> 
          {showForm ? (isEditing ? "Perbarui Lowongan" : "Tayangkan Karir Inklusif") : "Dashboard Rekrutmen"}
        </h2>
        <button 
          onClick={() => { setShowForm(!showForm); if (showForm) { setIsEditing(false); setJobData(initialFormState); } }}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-md transition-all sm:w-auto ${showForm ? 'border-2 border-slate-900 bg-white text-slate-900' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
        >
          {showForm ? <><X size={16}/> Batalkan</> : <><Plus size={16}/> Tambah Lowongan</>}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-12 rounded-[3.5rem] border-2 border-slate-900 bg-white p-6 font-black uppercase tracking-tighter shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:p-12">
          
          {/* 1. INFORMASI PEKERJAAN */}
          <fieldset className="space-y-8">
            <legend className="mb-8 w-full border-b-4 border-blue-50 pb-2 text-sm font-black uppercase italic text-blue-600">1. Identitas & Lokasi</legend>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <label htmlFor="title" className="ml-2 text-[10px] text-slate-400">Nama Posisi</label>
                <input id="title" required value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-5 font-bold outline-none focus:border-blue-600 focus:bg-white" />
              </div>
              <div className="space-y-3">
                <label htmlFor="location" className="ml-2 text-[10px] text-slate-400">Kota Penempatan</label>
                <select id="location" value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full appearance-none rounded-2xl border-2 border-slate-50 bg-white p-5 font-bold outline-none focus:border-blue-600">
                  {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-4 md:col-span-2">
                <label className="ml-2 flex items-center gap-2 text-[10px] italic text-slate-400"><DollarSign size={14}/> Rentang Gaji (Rp)</label>
                <div className="flex items-center gap-4">
                  <input aria-label="Min Gaji" type="number" value={jobData.salary_min} onChange={e => setJobData({...jobData, salary_min: parseInt(e.target.value) || 0})} className="flex-1 rounded-2xl border-2 border-slate-50 bg-slate-50 p-5 font-bold outline-none" />
                  <span className="text-slate-200">—</span>
                  <input aria-label="Max Gaji" type="number" value={jobData.salary_max} onChange={e => setJobData({...jobData, salary_max: parseInt(e.target.value) || 0})} className="flex-1 rounded-2xl border-2 border-slate-50 bg-slate-50 p-5 font-bold outline-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label htmlFor="expires" className="ml-2 text-[10px] italic text-slate-400">Batas Waktu</label>
                <input id="expires" type="date" value={jobData.expires_at} onChange={e => setJobData({...jobData, expires_at: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-5 font-bold outline-none" />
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-inner">
                <p className="text-[10px] italic text-blue-600">Metode Kerja</p>
                <div className="flex flex-wrap gap-2">
                  {WORK_MODES.map(m => (
                    <label key={m} className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-white bg-white p-3 has-[:checked]:border-blue-600">
                      <input type="radio" name="work_mode" value={m} checked={jobData.work_mode === m} onChange={() => setJobData({...jobData, work_mode: m})} className="size-4 accent-blue-600" />
                      <span className="text-[10px] font-bold">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-inner">
                <p className="text-[10px] italic text-indigo-600">Tipe Kontrak</p>
                <div className="flex flex-wrap gap-2">
                  {EMPLOYMENT_TYPES.map(t => (
                    <label key={t} className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-white bg-white p-3 has-[:checked]:border-indigo-600">
                      <input type="radio" name="job_type" value={t} checked={jobData.job_type === t} onChange={() => setJobData({...jobData, job_type: t})} className="size-4 accent-indigo-600" />
                      <span className="text-[10px] font-bold">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>

          {/* 2. KOMPETENSI */}
          <fieldset className="relative space-y-10 overflow-hidden rounded-[3.5rem] bg-slate-900 p-8 text-white shadow-2xl md:p-12">
            <legend className="flex items-center gap-2 rounded-full bg-blue-400 px-6 py-2 text-[10px] font-black uppercase italic tracking-widest text-slate-900">
              <GraduationCap size={16} /> 2. Kualifikasi Kompetensi
            </legend>
            <div className="space-y-6">
              <p className="text-[11px] italic text-blue-400">Jenjang Pendidikan Minimal</p>
              <div className="flex flex-wrap gap-3">
                {EDUCATION_LEVELS.map(lv => (
                  <label key={lv} className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-white/10 bg-white/5 p-4 has-[:checked]:border-blue-400">
                    <input type="radio" name="edu_level" value={lv} checked={jobData.required_education_level === lv} onChange={() => setJobData({...jobData, required_education_level: lv})} className="size-4 accent-blue-400" />
                    <span className="text-xs font-black">{lv}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label htmlFor="major-in" className="text-[11px] italic text-blue-400">Target Jurusan Pendidikan</label>
              <div className="relative">
                <input id="major-in" value={majorSearch} onChange={(e) => setMajorSearch(e.target.value)} placeholder="Cari Jurusan..." className="w-full rounded-2xl border-2 border-white/10 bg-white/5 p-5 text-sm font-bold outline-none focus:border-blue-400" />
                {majorSearch && (
                  <ul className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border-2 border-slate-700 bg-slate-800 p-3">
                    {UNIVERSITY_MAJORS.filter(m => m.toLowerCase().includes(majorSearch.toLowerCase())).map(m => (
                      <li key={m} className="mb-1"><button type="button" onClick={() => toggleTag('required_education_major', m)} className="w-full rounded-xl p-3 text-left text-[10px] font-bold uppercase hover:bg-blue-600">{m}</button></li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {jobData.required_education_major.map(m => (
                  <span key={m} className="flex items-center gap-3 rounded-xl bg-blue-500 px-4 py-2 text-[10px] text-white shadow-lg">
                    {m} <button type="button" aria-label={`Hapus jurusan ${m}`} onClick={() => toggleTag('required_education_major', m)} className="hover:text-red-300"><X size={16}/></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4 border-t border-white/10 pt-8">
              <label htmlFor="skill-in" className="text-[11px] italic text-emerald-400">Keahlian (Skills) Utama</label>
              <div className="relative">
                <input id="skill-in" value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Cari Skill..." className="w-full rounded-2xl border-2 border-white/10 bg-white/5 p-5 text-sm font-bold outline-none focus:border-emerald-400" />
                {skillSearch && (
                  <ul className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border-2 border-slate-700 bg-slate-800 p-3">
                    {SKILLS_LIST.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).map(s => (
                      <li key={s} className="mb-1"><button type="button" onClick={() => toggleTag('required_skills', s)} className="w-full rounded-xl p-3 text-left text-[10px] font-bold uppercase hover:bg-emerald-600">{s}</button></li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {jobData.required_skills.map(s => (
                  <span key={s} className="flex items-center gap-3 rounded-xl bg-emerald-500 px-4 py-2 text-[10px] text-white shadow-lg">
                    {s} <button type="button" aria-label={`Hapus keahlian ${s}`} onClick={() => toggleTag('required_skills', s)} className="hover:text-red-300"><X size={16}/></button>
                  </span>
                ))}
              </div>
            </div>
          </fieldset>

          {/* 3. AKOMODASI */}
          <fieldset className="space-y-10">
            <legend className="mb-8 flex w-full items-center gap-2 border-b-4 border-emerald-50 pb-2 text-sm font-black uppercase italic text-emerald-600">
              <Accessibility size={20} /> 3. Dukungan Akomodasi & Inklusi
            </legend>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ACCOMMODATION_TYPES.map(acc => (
                <label key={acc} className="group flex cursor-pointer items-center gap-4 rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm transition-all hover:bg-emerald-50/50 has-[:checked]:border-emerald-600">
                  <input type="checkbox" checked={jobData.preferred_disability_tools.includes(acc)} onChange={() => toggleTag('preferred_disability_tools', acc)} className="size-6 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-[10px] font-black leading-tight text-slate-700">{acc}</span>
                </label>
              ))}
            </div>
            
            <div className="space-y-8 border-t-2 border-dashed border-slate-50 pt-10">
              <div className="space-y-3">
                <label htmlFor="desc" className="ml-2 text-[10px] text-slate-400">Deskripsi Kerja (Job Description)</label>
                <textarea id="desc" required rows={8} value={jobData.description} onChange={e => setJobData({...jobData, description: e.target.value})} className="w-full rounded-[3rem] border-2 border-slate-100 bg-slate-50/20 p-8 text-base font-medium shadow-inner outline-none focus:border-blue-600" />
              </div>

              {/* TEMPLATE DIPINDAHKAN KE CATATAN AKSESIBILITAS SESUAI INSTRUKSI */}
              <div className="space-y-4 rounded-[3.5rem] border-2 border-emerald-100 bg-emerald-50/20 p-8">
                <div className="flex items-center justify-between px-2">
                  <label htmlFor="acc-note" className="flex items-center gap-2 text-[11px] font-black italic text-emerald-700">
                    <Sparkles size={16}/> Catatan Aksesibilitas Khusus
                  </label>
                  <button type="button" onClick={() => setJobData(p => ({...p, accessibility_note: INCLUSIVE_JOB_TEMPLATE}))} className="flex items-center gap-1 text-[9px] font-black uppercase italic text-blue-600 underline transition-all">
                    <Sparkles size={12}/> Gunakan Template Aksesibilitas
                  </button>
                </div>
                <textarea id="acc-note" rows={4} value={jobData.accessibility_note} onChange={e => setJobData({...jobData, accessibility_note: e.target.value})} className="w-full rounded-[2.5rem] border-2 border-emerald-200 bg-white p-6 text-sm font-medium shadow-sm outline-none focus:border-emerald-600" />
                <p className="ml-4 text-[9px] font-bold lowercase italic leading-relaxed text-emerald-400">Bantu talenta memahami lingkungan kerjanya dengan narasi yang jujur dan inklusif.</p>
              </div>
            </div>
          </fieldset>

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-4 rounded-[3.5rem] bg-blue-600 py-8 text-sm font-black uppercase tracking-[0.4em] text-white shadow-2xl transition-all hover:bg-slate-900 active:scale-95 disabled:opacity-50">
            {loading ? <Clock className="animate-spin" /> : <CheckCircle2 />} 
            {isEditing ? "Konfirmasi Perubahan Data" : "Publikasikan Lowongan Inklusif"}
          </button>
        </form>
      ) : (
        /* LIST LOWONGAN */
        <div className="grid gap-6">
          {myJobs.length > 0 ? myJobs.map(job => (
            <div key={job.id} className="group flex flex-col items-center justify-between gap-8 rounded-[3.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-slate-900 md:flex-row">
              <div className="flex flex-1 items-center gap-8 text-left">
                <div className="flex size-20 items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 text-slate-400 shadow-inner transition-all group-hover:bg-blue-50"><Briefcase size={36} /></div>
                <div>
                  <h4 className="text-lg font-black uppercase italic leading-none tracking-tight text-slate-900">{job.title}</h4>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[9px] font-black italic text-slate-400">
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-red-500"/> {job.location}</span>
                    <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-blue-600">{job.job_type}</span>
                    <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-emerald-600">{job.work_mode}</span>
                  </div>
                </div>
              </div>
              <div className="flex w-full items-center gap-4 border-t border-slate-50 pt-6 md:w-auto md:border-l-2 md:border-t-0 md:pl-8 md:pt-0">
                <button onClick={() => handleEdit(job)} className="flex-1 rounded-2xl bg-slate-100 px-8 py-4 text-[10px] font-black uppercase italic text-slate-500 shadow-sm transition-all hover:bg-slate-900 hover:text-white md:flex-none">Edit</button>
                <button onClick={async () => { if(confirm(`Hapus ${job.title}?`)) { const supabase = createClient(); await supabase.from("jobs").delete().eq("id", job.id); fetchJobs(); } }} aria-label={`Hapus ${job.title}`} className="rounded-2xl bg-slate-100 p-4 text-slate-400 shadow-sm transition-all hover:bg-red-600 hover:text-white"><Trash2 size={20} /></button>
              </div>
            </div>
          )) : (
            <div className="rounded-[5rem] border-4 border-dashed border-slate-100 p-32 text-center font-black uppercase italic tracking-[0.4em] text-slate-300 opacity-40">Belum ada lowongan riset aktif.</div>
          )}
        </div>
      )}
    </div>
  );
}
