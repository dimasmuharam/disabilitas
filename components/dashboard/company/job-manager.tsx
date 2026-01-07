"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, FileText, Trash2, Sparkles, 
  Briefcase, MapPin, Info, X, CheckCircle2,
  DollarSign, GraduationCap, Heart, Clock, Calendar
} from "lucide-react";

import { 
  WORK_MODES, 
  INCLUSIVE_JOB_TEMPLATE,
  INDONESIA_CITIES,
  EDUCATION_LEVELS,
  ACCOMMODATION_TYPES,
  UNIVERSITY_MAJORS,
  EMPLOYMENT_TYPES 
} from "@/lib/data-static";

export default function JobManager({ company, onSuccess }: { company: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const initialFormState = {
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

  const handleArrayToggle = (field: 'preferred_disability_tools' | 'required_education_major', value: string) => {
    setJobData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(i => i !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Generate slug unik untuk integritas data riset
    const slug = `${jobData.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;

    const { error } = await supabase.from("jobs").insert({
      company_id: company.id,
      slug: slug,
      ...jobData,
      updated_at: new Date().toISOString()
    });

    if (!error) {
      setAnnouncement("Lowongan berhasil diterbitkan.");
      setShowForm(false);
      setJobData(initialFormState);
      fetchJobs();
      onSuccess();
    } else {
      setAnnouncement(`{"Gagal: "}${error.message}`);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`{"Hapus lowongan "}${title}{"?"}`)) {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (!error) {
        setAnnouncement("Lowongan telah dihapus.");
        fetchJobs();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <FileText className="text-blue-600" size={24} /> {"Manajemen Lowongan"}
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 shadow-xl hover:bg-blue-600 transition-all"
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
                <input id="job-title" required value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold focus:border-blue-600 outline-none transition-all" placeholder="Contoh: Admin Operasional" />
              </div>
              <div className="space-y-2">
                <label htmlFor="job-location" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Lokasi Kerja"}</label>
                <select id="job-location" value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold bg-white outline-none focus:border-blue-600 transition-all">
                  {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Tipe Kontrak Pekerjaan"}</label>
              <div className="flex flex-wrap gap-4">
                {EMPLOYMENT_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-2xl border-2 border-transparent has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 transition-all">
                    <input type="radio" name="job_type" value={type} checked={jobData.job_type === type} onChange={() => setJobData({...jobData, job_type: type})} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                    <span className="text-[10px] font-black uppercase text-slate-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Rentang Gaji Bulanan (Rp)"}</label>
                <div className="flex items-center gap-3">
                  <input aria-label="Gaji Minimal" type="number" placeholder="Min" value={jobData.salary_min} onChange={e => setJobData({...jobData, salary_min: parseInt(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600 transition-all" />
                  <span className="font-black text-slate-300">{"—"}</span>
                  <input aria-label="Gaji Maksimal" type="number" placeholder="Max" value={jobData.salary_max} onChange={e => setJobData({...jobData, salary_max: parseInt(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="expiry-date" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Batas Akhir Lowongan"}</label>
                <input id="expiry-date" type="date" value={jobData.expires_at} onChange={e => setJobData({...jobData, expires_at: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600 transition-all" />
              </div>
            </div>
          </fieldset>

          {/* SEKSI 2: PENDIDIKAN */}
          <fieldset className="space-y-8 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
            <legend className="text-[10px] font-black uppercase text-slate-500 px-4 py-1 bg-white border border-slate-200 rounded-full flex items-center gap-2">
              <GraduationCap size={14} /> {"2. Kriteria Pendidikan & Jurusan"}
            </legend>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Jenjang Minimal Pendidikan"}</label>
              <div className="flex flex-wrap gap-3">
                {EDUCATION_LEVELS.map(lv => (
                  <label key={lv} className="flex items-center gap-3 p-4 bg-white border-2 border-transparent has-[:checked]:border-slate-900 rounded-2xl cursor-pointer transition-all">
                    <input type="radio" name="edu_level" value={lv} checked={jobData.required_education_level === lv} onChange={() => setJobData({...jobData, required_education_level: lv})} className="w-5 h-5 text-slate-900 focus:ring-slate-900" />
                    <span className="text-[10px] font-black uppercase text-slate-700">{lv}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Target Jurusan (Bisa Pilih Banyak)"}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {UNIVERSITY_MAJORS.map(major => (
                  <label key={major} className="flex items-center gap-4 p-4 bg-white border-2 border-slate-100 has-[:checked]:border-blue-600 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all">
                    <input type="checkbox" checked={jobData.required_education_major.includes(major)} onChange={() => handleArrayToggle('required_education_major', major)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-[10px] font-black uppercase text-slate-600">{major}</span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          {/* SEKSI 3: AKOMODASI */}
          <fieldset className="space-y-8">
            <legend className="text-sm font-black uppercase text-emerald-600 pb-4 border-b-2 border-emerald-50 w-full mb-8 flex items-center gap-2">
              <Heart size={18} /> {"3. Dukungan Akomodasi & Inklusi"}
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ACCOMMODATION_TYPES.map(acc => (
                <label key={acc} className="flex items-center gap-4 p-4 bg-white border-2 border-slate-100 has-[:checked]:border-emerald-600 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-all">
                  <input type="checkbox" checked={jobData.preferred_disability_tools.includes(acc)} onChange={() => handleArrayToggle('preferred_disability_tools', acc)} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-slate-600">{acc}</span>
                </label>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="description" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Deskripsi Tugas"}</label>
                <button type="button" onClick={() => setJobData(p => ({...p, description: INCLUSIVE_JOB_TEMPLATE}))} className="text-[9px] font-black text-blue-600 underline italic uppercase hover:text-blue-800">{"Gunakan Template Inklusif"}</button>
              </div>
              <textarea id="description" required rows={8} value={jobData.description} onChange={e => setJobData({...jobData, description: e.target.value})} className="w-full p-6 rounded-[2rem] border-2 border-slate-100 font-medium text-sm outline-none focus:border-blue-600 transition-all shadow-inner bg-slate-50/30" placeholder="Jelaskan detail tanggung jawab..." />
            </div>
            <div className="space-y-2">
              <label htmlFor="acc-note" className="text-[10px] font-black uppercase text-emerald-700 ml-2">{"Catatan Aksesibilitas Tambahan"}</label>
              <textarea id="acc-note" rows={3} value={jobData.accessibility_note} onChange={e => setJobData({...jobData, accessibility_note: e.target.value})} className="w-full p-6 bg-emerald-50/10 rounded-[2rem] border-2 border-emerald-100 font-medium text-sm outline-none focus:border-emerald-600 transition-all" placeholder="Misal: Kantor memiliki lift ramah braille, lingkungan tenang..." />
            </div>
          </fieldset>

          <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3">
            {loading ? <><Clock className="animate-spin" size={20} /> {"MEMPROSES DATA..."}</> : <><CheckCircle2 size={20} /> {"TAYANGKAN LOWONGAN"}</>}
          </button>
        </form>
      ) : (
        /* LIST LOWONGAN */
        <div className="grid gap-4">
          {myJobs.length > 0 ? myJobs.map(job => (
            <div key={job.id} className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-slate-900 transition-all gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {job.location}</span>
                    <span className="text-blue-600">{"• "} {job.job_type}</span>
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{"• "} {job.work_mode}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase ${job.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {job.is_active ? 'Status: Aktif' : 'Status: Tutup'}
                </div>
                <button onClick={() => handleDelete(job.id, job.title)} className="p-4 text-slate-200 hover:text-red-600 transition-colors" aria-label={`{"Hapus lowongan "}${job.title}`}><Trash2 size={22} /></button>
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
