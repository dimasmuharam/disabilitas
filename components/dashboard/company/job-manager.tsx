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

  // FIX: Fungsi Edit yang Aman dari NULL dan Meta-data
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
    setAnnouncement(`Mengedit lowongan ${job.title}`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Hapus lowongan ${title}?`)) {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (!error) { fetchJobs(); }
    }
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
    
    // Pastikan ID tidak ikut dikirim jika sedang tambah baru (Upsert butuh ID jika edit)
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
      alert(`Error: ${error.message}`);
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
          
          {/* 1. INFORMASI DASAR */}
          <fieldset className="space-y-6">
            <legend className="text-sm font-black uppercase text-blue-600 pb-2 border-b-2 border-blue-50 w-full mb-8">1. Informasi Pekerjaan & Gaji</legend>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="title" className="text-[10px] font-black uppercase text-slate-400 ml-2">Nama Posisi</label>
                <input id="title" required value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold focus:border-blue-600 outline-none" placeholder="Digital Marketing Specialist" />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-[10px] font-black uppercase text-slate-400 ml-2">Lokasi Penempatan</label>
                <select id="location" value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold bg-white outline-none">
                  {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2"><DollarSign size={12}/> Rentang Gaji (Rp)</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={jobData.salary_min} onChange={e => setJobData({...jobData, salary_min: parseInt(e.target.value) || 0})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold" />
                  <span className="font-black text-slate-300">—</span>
                  <input type="number" value={jobData.salary_max} onChange={e => setJobData({...jobData, salary_max: parseInt(e.target.value) || 0})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="expires" className="text-[10px] font-black uppercase text-slate-400 ml-2">Tutup Lowongan</label>
                <input id="expires" type="date" value={jobData.expires_at} onChange={e => setJobData({...jobData, expires_at: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none" />
              </div>
            </div>
          </fieldset>

          {/* 2. KRITERIA KOMPETENSI (LOGIKA ARRAY FIX) */}
          <fieldset className="space-y-8 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
            <legend className="text-[10px] font-black uppercase text-slate-500 px-4 py-1 bg-white border border-slate-200 rounded-full flex items-center gap-2 italic">
              <GraduationCap size={14} /> 2. Kriteria Pendidikan & Kompetensi
            </legend>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-400 ml-2">Minimal Pendidikan</p>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_LEVELS.map(lv => (
                  <label key={lv} className="flex items-center gap-2 p-3 bg-white rounded-xl border-2 border-slate-100 has-[:checked]:border-slate-900 cursor-pointer transition-all">
                    <input type="radio" name="edu_level" value={lv} checked={jobData.required_education_level === lv} onChange={() => setJobData({...jobData, required_education_level: lv})} className="w-4 h-4 accent-slate-900" />
                    <span className="text-[10px] font-bold uppercase">{lv}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">Keahlian / Skill Utama <Tag size={12}/></label>
              <div className="relative">
                <input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Ketik skill (contoh: Excel, Coding, Desain)..." className="w-full p-4 rounded-2xl border-2 border-white font-bold outline-none focus:border-emerald-600 shadow-sm" />
                {skillSearch && (
                  <ul className="absolute z-30 w-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl max-h-48 overflow-y-auto p-2">
                    {SKILLS_LIST.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).map(s => (
                      <li key={s}><button type="button" onClick={() => toggleTag('required_skills', s)} className="w-full text-left p-3 hover:bg-emerald-50 rounded-xl font-bold text-[10px] uppercase">{s}</button></li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {jobData.required_skills.map(s => (
                  <span key={s} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
                    {s} <button type="button" onClick={() => toggleTag('required_skills', s)}><X size={14}/></button>
                  </span>
                ))}
              </div>
            </div>
          </fieldset>

          {/* 3. DESKRIPSI & AKSESIBILITAS */}
          <fieldset className="space-y-8">
            <legend className="text-sm font-black uppercase text-emerald-600 pb-2 border-b-2 border-emerald-50 w-full mb-8 flex items-center gap-2">
              <Accessibility size={18} /> 3. Narasi & Aksesibilitas Riset
            </legend>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic">Deskripsi Kerja (Job Description)</label>
                <textarea required rows={6} value={jobData.description} onChange={e => setJobData({...jobData, description: e.target.value})} className="w-full p-6 rounded-[2rem] border-2 border-slate-100 font-medium text-sm outline-none focus:border-blue-600" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-emerald-700 ml-2 italic font-black">Catatan Inklusi / Aksesibilitas</label>
                <textarea rows={3} value={jobData.accessibility_note} onChange={e => setJobData({...jobData, accessibility_note: e.target.value})} className="w-full p-6 bg-emerald-50/10 border-emerald-100 border-2 rounded-[2rem] font-medium text-sm outline-none focus:border-emerald-600" placeholder="Contoh: Kantor kami ramah disabilitas netra dengan ubin pemandu." />
              </div>
            </div>
          </fieldset>

          <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:bg-slate-900 transition-all shadow-xl flex items-center justify-center gap-3">
            {loading ? <Clock className="animate-spin" /> : <CheckCircle2 />} 
            {isEditing ? "SIMPAN PERUBAHAN DATA" : "TAYANGKAN SEKARANG"}
          </button>
        </form>
      ) : (
        /* LIST VIEW */
        <div className="grid gap-4">
          {myJobs.length > 0 ? myJobs.map(job => (
            <div key={job.id} className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-slate-900 transition-all gap-6 shadow-sm">
              <div className="flex items-center gap-6 text-left">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 transition-all shadow-inner"><Briefcase size={28} /></div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-sm">{job.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {job.location}</span>
                    <span className="text-blue-600">• {job.job_type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={() => handleEdit(job)} className="flex-1 md:flex-none p-4 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 font-black text-[9px] uppercase"><Edit3 size={18} /> EDIT</button>
                <button onClick={() => handleDelete(job.id, job.title)} className="p-4 bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={18} /></button>
              </div>
            </div>
          )) : (
            <div className="p-24 border-4 border-dashed border-slate-100 rounded-[4rem] text-center opacity-50">
              <p className="text-[10px] font-black text-slate-300 uppercase italic">Belum ada lowongan riset.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
