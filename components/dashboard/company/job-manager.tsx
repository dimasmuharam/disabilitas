"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, FileText, Trash2, Sparkles, 
  Briefcase, MapPin, Info, X, CheckCircle2,
  GraduationCap, Heart, Clock, Calendar,
  Search, Tag, Edit3
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
    slug: "" as string, // SEKARANG SUDAH DIDEFINISIKAN
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    // Logika slug yang aman dari Type Error
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
      setAnnouncement(isEditing ? "Lowongan diperbarui." : "Lowongan diterbitkan.");
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
      <div className="sr-only" aria-live="polite">{announcement}</div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <FileText className="text-blue-600" size={24} /> 
          {showForm ? (isEditing ? "Edit Lowongan" : "Buat Lowongan") : "Manajemen Lowongan"}
        </h2>
        <button 
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setIsEditing(false);
              setJobData(initialFormState);
            } else {
              setShowForm(true);
            }
          }}
          className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl ${showForm ? 'bg-white border-2 border-slate-900 text-slate-900' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
        >
          {showForm ? <><X size={18}/> {"Batal"}</> : <><Plus size={18}/> {"Buat Lowongan"}</>}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-12">
          
          {/* SEKSI 1: DASAR */}
          <fieldset className="space-y-6">
            <legend className="text-sm font-black uppercase text-blue-600 pb-4 border-b-2 border-blue-50 w-full mb-8">{"1. Informasi Dasar Pekerjaan"}</legend>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="job-title" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Nama Posisi"}</label>
                <input id="job-title" required value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold focus:border-blue-600 outline-none" placeholder="Contoh: Admin Operasional" />
              </div>
              <div className="space-y-2">
                <label htmlFor="job-location" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Lokasi Kerja"}</label>
                <select id="job-location" value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold bg-white outline-none">
                  {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Tipe Kontrak"}</label>
                <select value={jobData.job_type} onChange={e => setJobData({...jobData, job_type: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold bg-white outline-none">
                  {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Gaji Minimal (Rp)"}</label>
                <input type="number" value={jobData.salary_min} onChange={e => setJobData({...jobData, salary_min: parseInt(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Gaji Maksimal (Rp)"}</label>
                <input type="number" value={jobData.salary_max} onChange={e => setJobData({...jobData, salary_max: parseInt(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold" />
              </div>
            </div>
          </fieldset>

          {/* SEKSI 2: PENDIDIKAN & SKILL (TAGGING MODEL) */}
          <fieldset className="space-y-8 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
            <legend className="text-[10px] font-black uppercase text-slate-500 px-4 py-1 bg-white border border-slate-200 rounded-full flex items-center gap-2">
              <GraduationCap size={14} /> {"2. Kriteria Kompetensi"}
            </legend>
            
            {/* JURUSAN SEARCH */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Cari & Tambah Jurusan"}</label>
              <div className="relative">
                <Search className="absolute left-4 top-4 text-slate-300" size={18} />
                <input 
                  value={majorSearch}
                  onChange={(e) => setMajorSearch(e.target.value)}
                  placeholder="Ketik jurusan (contoh: Informatika)..."
                  className="w-full p-4 pl-12 rounded-2xl border-2 border-white font-bold outline-none focus:border-blue-600 shadow-sm"
                />
                {majorSearch && (
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-2 space-y-1">
                    {UNIVERSITY_MAJORS.filter(m => m.toLowerCase().includes(majorSearch.toLowerCase())).map(m => (
                      <button key={m} type="button" onClick={() => toggleTag('required_education_major', m)} className="w-full text-left p-3 hover:bg-blue-50 rounded-xl font-bold text-[10px] uppercase transition-colors">{m}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {jobData.required_education_major.map(m => (
                  <span key={m} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2 animate-in zoom-in">
                    {m} <X size={14} className="cursor-pointer hover:text-red-300" onClick={() => toggleTag('required_education_major', m)} />
                  </span>
                ))}
              </div>
            </div>

            {/* SKILLS SEARCH */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Cari & Tambah Skills"}</label>
              <div className="relative">
                <Tag className="absolute left-4 top-4 text-slate-300" size={18} />
                <input 
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Ketik skill (contoh: Administrasi)..."
                  className="w-full p-4 pl-12 rounded-2xl border-2 border-white font-bold outline-none focus:border-blue-600 shadow-sm"
                />
                {skillSearch && (
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-2 space-y-1">
                    {SKILLS_LIST.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).map(s => (
                      <button key={s} type="button" onClick={() => toggleTag('required_skills', s)} className="w-full text-left p-3 hover:bg-emerald-50 rounded-xl font-bold text-[10px] uppercase transition-colors">{s}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {jobData.required_skills.map(s => (
                  <span key={s} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2 animate-in zoom-in">
                    {s} <X size={14} className="cursor-pointer hover:text-red-300" onClick={() => toggleTag('required_skills', s)} />
                  </span>
                ))}
              </div>
            </div>
          </fieldset>

          {/* SEKSI 3: AKOMODASI */}
          <fieldset className="space-y-8">
            <legend className="text-sm font-black uppercase text-emerald-600 pb-4 border-b-2 border-emerald-50 w-full mb-8 flex items-center gap-2">
              <Heart size={18} /> {"3. Dukungan Inklusi & Aksesibilitas"}
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ACCOMMODATION_TYPES.map(acc => (
                <label key={acc} className="flex items-center gap-4 p-4 bg-white border-2 border-slate-100 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/30 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-all">
                  <input type="checkbox" checked={jobData.preferred_disability_tools.includes(acc)} onChange={() => toggleTag('preferred_disability_tools', acc)} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-slate-600">{acc}</span>
                </label>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="description" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Deskripsi Lengkap"}</label>
                <button type="button" onClick={() => setJobData(p => ({...p, description: INCLUSIVE_JOB_TEMPLATE}))} className="text-[9px] font-black text-blue-600 underline italic uppercase">{"Gunakan Template Inklusif"}</button>
              </div>
              <textarea id="description" required rows={6} value={jobData.description} onChange={e => setJobData({...jobData, description: e.target.value})} className="w-full p-6 rounded-[2rem] border-2 border-slate-100 font-medium text-sm shadow-inner bg-slate-50/30 outline-none focus:border-blue-600" />
            </div>
          </fieldset>

          <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3">
            {loading ? <><Clock className="animate-spin" size={20} /> {"MENYIMPAN DATA..."}</> : <><CheckCircle2 size={20} /> {isEditing ? "SIMPAN PERUBAHAN" : "TAYANGKAN LOWONGAN"}</>}
          </button>
        </form>
      ) : (
        /* LIST LOWONGAN */
        <div className="grid gap-4">
          {myJobs.length > 0 ? myJobs.map(job => (
            <div key={job.id} className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-slate-900 transition-all gap-6">
              <div className="flex items-center gap-6 text-left">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"><Briefcase size={28} /></div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[9px] font-bold text-slate-400 uppercase">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {job.location}</span>
                    <span className="text-blue-600">{job.job_type}</span>
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{job.work_mode}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(job)} 
                  className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm"
                  aria-label={`{"Edit lowongan "}${job.title}`}
                >
                  <Edit3 size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(job.id, job.title)} 
                  className="p-4 bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm"
                  aria-label={`{"Hapus lowongan "}${job.title}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-24 border-4 border-dashed border-slate-50 rounded-[4rem] text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Briefcase size={40} />
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">{"Belum ada lowongan riset yang terdaftar."}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
