"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, FileText, Trash2, Sparkles, 
  Briefcase, MapPin, Info, X, CheckCircle2,
  GraduationCap, Heart, Clock, Calendar,
  Search, Tag, Edit3, Monitor, DollarSign,
  Accessibility, ListChecks, HelpCircle, BookOpen, RotateCcw
} from "lucide-react";

import { 
  WORK_MODES, 
  INCLUSIVE_JOB_TEMPLATE, // Ini yang akan dipindah
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
      id: job.id,
      slug: job.slug || "",
      title: job.title || "",
      description: job.description || "",
      requirements: job.requirements || "",
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
    setAnnouncement(`Mengedit lowongan ${job.title}`);
  };

  const toggleTag = (field: 'required_education_major' | 'required_skills' | 'preferred_disability_tools', value: string) => {
    setJobData(prev => {
      const current = prev[field] || [];
      const isExist = current.includes(value);
      const updated = isExist ? current.filter(i => i !== value) : [...current, value];
      return { ...prev, [field]: updated };
    });
    if (field === 'required_education_major') setMajorSearch("");
    if (field === 'required_skills') setSkillSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
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
      alert(`Error simpan: ${error.message}`);
    }
    setLoading(false);
  };
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border-2 border-slate-900 gap-4">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-slate-900 text-left w-full sm:w-auto">
          <FileText className="text-blue-600 shrink-0" size={24} /> 
          {showForm ? (isEditing ? "Edit Lowongan" : "Posting Baru") : "Manajemen Karir Inklusif"}
        </h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) { setIsEditing(false); setJobData(initialFormState); }
          }}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-md ${showForm ? 'bg-white border-2 border-slate-900 text-slate-900' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
        >
          {showForm ? <><X size={16}/> Batal</> : <><Plus size={16}/> Terbitkan Lowongan</>}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-12 rounded-[3.5rem] border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-12 text-left font-black uppercase tracking-tighter transition-all">
          
          {/* SECTION 1: DASAR */}
          <fieldset className="space-y-8">
            <legend className="text-sm font-black uppercase text-blue-600 pb-2 border-b-4 border-blue-50 w-full mb-8 italic">1. Identitas Pekerjaan</legend>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label htmlFor="title" className="text-[10px] text-slate-400 ml-2">Posisi Jabatan</label>
                <input id="title" required value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none font-bold" placeholder="Contoh: Admin Gudang" />
              </div>
              <div className="space-y-3">
                <label htmlFor="location" className="text-[10px] text-slate-400 ml-2">Domisili Penempatan</label>
                <select id="location" value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-5 rounded-2xl border-2 border-slate-50 bg-white font-bold outline-none focus:border-blue-600">
                  {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] text-blue-600 italic">Sistem Kerja</p>
                <div className="flex flex-wrap gap-2">
                  {WORK_MODES.map(m => (
                    <label key={m} className="flex items-center gap-2 p-3 bg-white border-2 border-slate-50 rounded-xl has-[:checked]:border-blue-600 shadow-sm transition-all">
                      <input type="radio" name="work_mode" value={m} checked={jobData.work_mode === m} onChange={() => setJobData({...jobData, work_mode: m})} className="w-4 h-4 accent-blue-600" />
                      <span className="text-[10px] font-bold">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] text-indigo-600 italic">Tipe Hubungan Kerja</p>
                <div className="flex flex-wrap gap-2">
                  {EMPLOYMENT_TYPES.map(t => (
                    <label key={t} className="flex items-center gap-2 p-3 bg-white border-2 border-slate-50 rounded-xl has-[:checked]:border-indigo-600 shadow-sm transition-all">
                      <input type="radio" name="job_type" value={t} checked={jobData.job_type === t} onChange={() => setJobData({...jobData, job_type: t})} className="w-4 h-4 accent-indigo-600" />
                      <span className="text-[10px] font-bold">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>

          {/* SECTION 2: KOMPETENSI */}
          <fieldset className="space-y-10 p-8 bg-slate-900 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
            <legend className="text-[10px] font-black uppercase text-slate-900 px-6 py-2 bg-blue-400 rounded-full flex items-center gap-2 tracking-widest italic">
              <GraduationCap size={16} /> 2. Kriteria Kompetensi & Jurusan
            </legend>
            <div className="space-y-6">
              <p className="text-[11px] text-blue-400 italic">Jenjang Pendidikan Minimal</p>
              <div className="flex flex-wrap gap-3">
                {EDUCATION_LEVELS.map(lv => (
                  <label key={lv} className="flex items-center gap-2 p-4 bg-white/5 rounded-2xl border-2 border-white/10 has-[:checked]:border-blue-400 has-[:checked]:bg-blue-400/10 transition-all">
                    <input type="radio" name="edu_level" value={lv} checked={jobData.required_education_level === lv} onChange={() => setJobData({...jobData, required_education_level: lv})} className="w-4 h-4 accent-blue-400" />
                    <span className="text-xs font-black">{lv}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] text-blue-400 italic">Target Jurusan Pendidikan</label>
              <div className="relative">
                <input value={majorSearch} onChange={(e) => setMajorSearch(e.target.value)} placeholder="Cari Jurusan..." className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/10 focus:border-blue-400 outline-none text-sm font-bold" />
                {majorSearch && (
                  <ul className="absolute z-30 w-full mt-2 bg-slate-800 border-2 border-slate-700 rounded-2xl p-3 max-h-56 overflow-y-auto">
                    {UNIVERSITY_MAJORS.filter(m => m.toLowerCase().includes(majorSearch.toLowerCase())).map(m => (
                      <li key={m} className="mb-1"><button type="button" onClick={() => toggleTag('required_education_major', m)} className="w-full text-left p-3 hover:bg-blue-600 rounded-xl font-bold text-[10px] uppercase transition-colors">{m}</button></li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {jobData.required_education_major.map(m => (
                  <span key={m} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-[10px] flex items-center gap-3">
                    {m} <button type="button" aria-label={`Hapus jurusan ${m}`} onClick={() => toggleTag('required_education_major', m)} className="hover:text-red-300"><X size={16}/></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4 border-t border-white/10 pt-8">
              <label className="text-[11px] text-emerald-400 italic">Keahlian (Skills) Utama</label>
              <div className="relative">
                <input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Cari Skill..." className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/10 focus:border-emerald-400 outline-none text-sm font-bold" />
                {skillSearch && (
                  <ul className="absolute z-30 w-full mt-2 bg-slate-800 border-2 border-slate-700 rounded-2xl p-3 max-h-56 overflow-y-auto">
                    {SKILLS_LIST.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).map(s => (
                      <li key={s} className="mb-1"><button type="button" onClick={() => toggleTag('required_skills', s)} className="w-full text-left p-3 hover:bg-emerald-600 rounded-xl font-bold text-[10px] uppercase transition-colors">{s}</button></li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {jobData.required_skills.map(s => (
                  <span key={s} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] flex items-center gap-3">
                    {s} <button type="button" aria-label={`Hapus keahlian ${s}`} onClick={() => toggleTag('required_skills', s)} className="hover:text-red-300"><X size={16}/></button>
                  </span>
                ))}
              </div>
            </div>
          </fieldset>

          {/* SECTION 3: AKOMODASI */}
          <fieldset className="space-y-10">
            <legend className="text-sm font-black uppercase text-emerald-600 pb-2 border-b-4 border-emerald-50 w-full mb-8 flex items-center gap-2 italic">
              <Accessibility size={20} /> 3. Dukungan Akomodasi
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACCOMMODATION_TYPES.map(acc => (
                <label key={acc} className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-3xl has-[:checked]:border-emerald-600 transition-all hover:bg-emerald-50/50 shadow-sm group">
                  <input type="checkbox" checked={jobData.preferred_disability_tools.includes(acc)} onChange={() => toggleTag('preferred_disability_tools', acc)} className="w-6 h-6 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] font-black text-slate-700 leading-tight uppercase">{acc}</span>
                </label>
              ))}
            </div>
            
            <div className="space-y-6 pt-10 border-t-2 border-slate-50 border-dashed">
              <div className="space-y-3">
                <label htmlFor="desc" className="text-[10px] text-slate-400 ml-2">Deskripsi Kerja (Job Description)</label>
                <textarea id="desc" required rows={6} value={jobData.description} onChange={e => setJobData({...jobData, description: e.target.value})} className="w-full p-8 rounded-[3rem] border-2 border-slate-100 font-medium text-base shadow-inner bg-slate-50/20 outline-none focus:border-blue-600" placeholder="Tuliskan tugas harian talenta di posisi ini..." />
              </div>

              {/* CATATAN AKSESIBILITAS: Tombol Template dipindah ke sini! */}
              <div className="space-y-4 p-8 bg-emerald-50/20 rounded-[3.5rem] border-2 border-emerald-100">
                <div className="flex justify-between items-center px-2">
                  <label htmlFor="acc-note" className="text-[11px] text-emerald-700 font-black flex items-center gap-2">
                    <Sparkles size={16}/> Catatan Aksesibilitas Khusus
                  </label>
                  <button type="button" onClick={() => setJobData(p => ({...p, accessibility_note: INCLUSIVE_JOB_TEMPLATE}))} className="text-[9px] text-blue-600 underline font-black flex items-center gap-1 uppercase italic transition-all hover:text-blue-900">
                    <Sparkles size={12}/> Gunakan Template Aksesibilitas
                  </button>
                </div>
                <textarea id="acc-note" rows={4} value={jobData.accessibility_note} onChange={e => setJobData({...jobData, accessibility_note: e.target.value})} className="w-full p-6 bg-white border-2 border-emerald-200 rounded-[2.5rem] font-medium text-sm outline-none focus:border-emerald-600 shadow-sm" placeholder="Contoh: Kami memberikan instruksi tertulis dan lisan secara fleksibel." />
                <p className="text-[9px] text-emerald-400 italic ml-4 leading-relaxed font-bold lowercase">Bantu talenta memahami lingkungan kerjanya dengan narasi yang jujur dan inklusif.</p>
              </div>
            </div>
          </fieldset>

          <button type="submit" disabled={loading} className="w-full py-8 bg-blue-600 text-white rounded-[3.5rem] font-black uppercase tracking-[0.4em] text-sm hover:bg-slate-900 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50">
            {loading ? <Clock className="animate-spin" /> : <CheckCircle2 />} 
            {isEditing ? "Konfirmasi Perubahan Data" : "Publikasikan Lowongan Riset"}
          </button>
        </form>
      ) : (
        /* LIST LOWONGAN */
        <div className="grid gap-6">
          {myJobs.length > 0 ? myJobs.map(job => (
            <div key={job.id} className="bg-white p-8 rounded-[3.5rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-slate-900 transition-all gap-8 shadow-sm">
              <div className="flex items-center gap-8 text-left flex-1">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 transition-all shadow-inner border border-slate-100"><Briefcase size={36} /></div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-lg italic tracking-tight">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-[10px] font-black text-slate-400 italic">
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-red-500"/> {job.location}</span>
                    <span className="text-blue-600 px-2 py-0.5 bg-blue-50 rounded-lg">{job.job_type}</span>
                    <span className="text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-lg">{job.work_mode}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto pt-6 md:pt-0 md:pl-8 border-t md:border-t-0 md:border-l-2 border-slate-50">
                <button onClick={() => handleEdit(job)} className="flex-1 md:flex-none px-8 py-4 bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-sm font-black text-[10px] uppercase tracking-widest italic">Edit</button>
                <button onClick={() => handleDelete(job.id, job.title)} aria-label={`Hapus lowongan ${job.title}`} className="p-4 bg-slate-100 text-slate-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={20} /></button>
              </div>
            </div>
          )) : (
            <div className="p-32 border-4 border-dashed border-slate-100 rounded-[5rem] text-center opacity-40 font-black uppercase italic text-slate-300 tracking-[0.4em]">Belum ada lowongan riset aktif.</div>
          )}
        </div>
      )}
    </div>
  );
}
