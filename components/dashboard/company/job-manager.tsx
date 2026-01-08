"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, FileText, Trash2, Sparkles, 
  Briefcase, MapPin, Info, X, CheckCircle2,
  GraduationCap, Heart, Clock, Calendar,
  Search, Tag, Edit3, Monitor, ListChecks
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
    requirements: "", // Kolom Syarat Kualifikasi
    location: company?.location || "Jakarta Selatan",
    work_mode: WORK_MODES[0], // Sinkron dengan data-static
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
        setAnnouncement("Lowongan berhasil dihapus.");
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
    setMajorSearch("");
    setSkillSearch("");
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
      setAnnouncement(isEditing ? "Update berhasil." : "Lowongan baru tayang.");
      setShowForm(false);
      setIsEditing(false);
      setJobData(initialFormState);
      fetchJobs();
      onSuccess();
    } else {
      setAnnouncement(`{"Gagal: "}${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border-2 border-slate-900">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <FileText className="text-blue-600" size={24} /> 
          {showForm ? (isEditing ? "Edit Lowongan" : "Input Lowongan") : "Manajemen Lowongan"}
        </h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) { setIsEditing(false); setJobData(initialFormState); }
          }}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] flex items-center gap-2"
        >
          {showForm ? <><X size={16}/> Batal</> : <><Plus size={16}/> Tambah Lowongan</>}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-12">
          
          <fieldset className="space-y-6">
            <legend className="text-sm font-black uppercase text-blue-600 pb-2 border-b-2 border-blue-50 w-full mb-6">1. Identitas Pekerjaan</legend>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="title" className="text-[10px] font-black uppercase text-slate-400 ml-2">Nama Jabatan</label>
                <input id="title" required value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600" />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-[10px] font-black uppercase text-slate-400 ml-2">Lokasi Kantor</label>
                <select id="location" value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold bg-white">
                  {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Sistem Kerja (Work Mode)</label>
                <div className="flex flex-wrap gap-4">
                  {WORK_MODES.map(m => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border-2 border-slate-50 has-[:checked]:border-blue-600">
                      <input type="radio" name="work_mode" value={m} checked={jobData.work_mode === m} onChange={() => setJobData({...jobData, work_mode: m})} className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipe Kontrak</label>
                <div className="flex flex-wrap gap-4">
                  {EMPLOYMENT_TYPES.map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border-2 border-slate-50 has-[:checked]:border-indigo-600">
                      <input type="radio" name="job_type" value={t} checked={jobData.job_type === t} onChange={() => setJobData({...jobData, job_type: t})} className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-8 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
            <legend className="text-[10px] font-black uppercase text-slate-500 px-4 py-1 bg-white border border-slate-200 rounded-full flex items-center gap-2"><GraduationCap size={14} /> 2. Kriteria & Keahlian</legend>
            
            <div className="space-y-4">
              <label htmlFor="major-search" className="text-[10px] font-black uppercase text-slate-400 ml-2">Target Jurusan (Multiple)</label>
              <div className="relative">
                <Search className="absolute left-4 top-4 text-slate-300" size={20} />
                <input id="major-search" value={majorSearch} onChange={(e) => setMajorSearch(e.target.value)} placeholder="Cari jurusan..." className="w-full p-4 pl-12 rounded-2xl border-2 border-white font-bold outline-none focus:border-blue-600 shadow-sm" />
                {majorSearch && (
                  <ul className="absolute z-30 w-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl max-h-56 overflow-y-auto p-2">
                    {UNIVERSITY_MAJORS.filter(m => m.toLowerCase().includes(majorSearch.toLowerCase())).map(m => (
                      <li key={m}><button type="button" onClick={() => toggleTag('required_education_major', m)} className="w-full text-left p-3 hover:bg-blue-600 hover:text-white rounded-xl font-bold text-[10px] uppercase">{m}</button></li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {jobData.required_education_major.map(m => (
                  <span key={m} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
                    {m} <button type="button" aria-label={`Hapus ${m}`} onClick={() => toggleTag('required_education_major', m)}><X size={14}/></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-200">
              <label htmlFor="skill-search" className="text-[10px] font-black uppercase text-slate-400 ml-2">Skill yang Dibutuhkan (Multiple)</label>
              <div className="relative">
                <Tag className="absolute left-4 top-4 text-slate-300" size={20} />
                <input id="skill-search" value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Cari skill..." className="w-full p-4 pl-12 rounded-2xl border-2 border-white font-bold outline-none focus:border-emerald-600 shadow-sm" />
                {skillSearch && (
                  <ul className="absolute z-30 w-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl max-h-56 overflow-y-auto p-2">
                    {SKILLS_LIST.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).map(s => (
                      <li key={s}><button type="button" onClick={() => toggleTag('required_skills', s)} className="w-full text-left p-3 hover:bg-emerald-600 hover:text-white rounded-xl font-bold text-[10px] uppercase">{s}</button></li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {jobData.required_skills.map(s => (
                  <span key={s} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
                    {s} <button type="button" aria-label={`Hapus ${s}`} onClick={() => toggleTag('required_skills', s)}><X size={14}/></button>
                  </span>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-8">
            <legend className="text-sm font-black uppercase text-emerald-600 pb-2 border-b-2 border-emerald-50 w-full mb-6 flex items-center gap-2"><Heart size={18} /> 3. Narasi & Syarat Tambahan</legend>
            <div className="space-y-2">
              <label htmlFor="reqs" className="text-[10px] font-black uppercase text-slate-400 ml-2">Kualifikasi Umum (Requirements)</label>
              <textarea id="reqs" rows={4} value={jobData.requirements} onChange={e => setJobData({...jobData, requirements: e.target.value})} className="w-full p-6 rounded-[2rem] border-2 border-slate-100 font-medium text-sm" placeholder="Contoh: Domisili Jakarta, Pengalaman min. 1 tahun..." />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="desc" className="text-[10px] font-black uppercase text-slate-400 ml-2">Deskripsi Tugas</label>
                <button type="button" onClick={() => setJobData(p => ({...p, description: INCLUSIVE_JOB_TEMPLATE}))} className="text-[9px] font-black text-blue-600 underline">Gunakan Template Inklusif</button>
              </div>
              <textarea id="desc" required rows={6} value={jobData.description} onChange={e => setJobData({...jobData, description: e.target.value})} className="w-full p-6 rounded-[2rem] border-2 border-slate-100 font-medium text-sm shadow-inner bg-slate-50/30" />
            </div>
          </fieldset>

          <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase text-sm shadow-xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-all">
            {loading ? <Clock className="animate-spin" /> : <CheckCircle2 />} 
            {isEditing ? "Update Lowongan" : "Tayangkan Lowongan"}
          </button>
        </form>
      ) : (
        <div className="grid gap-4">
          {myJobs.length > 0 ? myJobs.map(job => (
            <div key={job.id} className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-slate-900 transition-all gap-6 shadow-sm">
              <div className="flex items-center gap-6 text-left">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Briefcase size={28} /></div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-sm">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {job.location}</span>
                    <span className="text-blue-600">• {job.work_mode}</span>
                    <span className="text-indigo-600">• {job.job_type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={() => handleEdit(job)} className="flex-1 md:flex-none p-4 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 font-black text-[9px] uppercase"><Edit3 size={18} /> Edit</button>
                <button onClick={() => handleDelete(job.id, job.title)} className="p-4 bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={18} /></button>
              </div>
            </div>
          )) : (
            <div className="p-20 border-4 border-dashed border-slate-50 rounded-[4rem] text-center opacity-50"><p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">Belum ada lowongan.</p></div>
          )}
        </div>
      )}
    </div>
  );
}
