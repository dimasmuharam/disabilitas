"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, FileText, Trash2, Sparkles, 
  Briefcase, MapPin, Info, X, CheckCircle2,
  DollarSign, GraduationCap, Heart, Clock, Calendar
} from "lucide-react";

// SINKRONISASI DATA-STATIC (Pastikan file ini sudah di-lock sesuai instruksi Mas)
import { 
  WORK_MODES, 
  INCLUSIVE_JOB_TEMPLATE,
  INDONESIA_CITIES,
  EDUCATION_LEVELS,
  MASTER_ACCOMMODATIONS // Mengambil data akomodasi resmi untuk riset
} from "@/lib/data-static";

export default function JobManager({ company, onSuccess }: { company: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // Inisialisasi State sesuai Skema Database public.jobs
  const initialFormState = {
    title: "",
    description: "",
    requirements: "",
    location: company?.location || "Jakarta Selatan",
    work_mode: WORK_MODES[0],
    salary_min: 0,
    salary_max: 0,
    required_education_level: EDUCATION_LEVELS[0],
    required_education_major: "", // Disimpan sebagai string/array sesuai kebutuhan
    accessibility_note: "",
    preferred_disability_tools: [] as string[], // Multiple Choice dari MASTER_ACCOMMODATIONS
    is_active: true,
    expires_at: ""
  };

  const [jobData, setJobData] = useState(initialFormState);

  useEffect(() => {
    if (company?.id) {
      fetchJobs();
    }
  }, [company?.id]);

  async function fetchJobs() {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });
    setMyJobs(data || []);
  }

  const useTemplate = () => {
    setJobData(prev => ({ ...prev, description: INCLUSIVE_JOB_TEMPLATE }));
    setAnnouncement(`{"Template deskripsi inklusif telah diterapkan ke dalam form."}`);
  };

  const handleAccommodationChange = (name: string) => {
    setJobData(prev => {
      const current = prev.preferred_disability_tools || [];
      const updated = current.includes(name)
        ? current.filter(i => i !== name)
        : [...current, name];
      return { ...prev, preferred_disability_tools: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Auto-generate Unique Slug untuk integritas link
    const slug = `${jobData.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;

    const { error } = await supabase.from("jobs").insert({
      company_id: company.id,
      slug: slug,
      ...jobData,
      updated_at: new Date().toISOString()
    });

    if (!error) {
      setAnnouncement(`{"Lowongan berhasil diterbitkan ke sistem riset."}`);
      setShowForm(false);
      setJobData(initialFormState);
      fetchJobs();
      onSuccess(); // Sinkronisasi ke Overview Dashboard
    } else {
      console.error("Insert Job Error:", error);
      setAnnouncement(`{"Gagal: "}${error.message}`);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`{"Hapus lowongan "}${title}{" secara permanen dari data riset?"}`)) {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (!error) {
        setAnnouncement(`{"Lowongan telah dihapus."}`);
        fetchJobs();
      }
    }
  };
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER MANAGER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <FileText className="text-blue-600" size={24} /> {"Manajemen Lowongan Inklusif"}
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{"Kelola data lowongan kerja untuk kebutuhan riset talenta."}</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl ${showForm ? 'bg-white border-2 border-slate-900 text-slate-900' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
        >
          {showForm ? <><X size={18}/> {"Batal"}</> : <><Plus size={18}/> {"Buat Lowongan Baru"}</>}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-12">
          
          {/* SEKSI 1: IDENTITAS PEKERJAAN */}
          <fieldset className="space-y-6">
            <legend className="text-sm font-black uppercase text-blue-600 pb-4 border-b-2 border-blue-50 w-full mb-8 flex items-center gap-2">
              <Briefcase size={18} /> {"1. Informasi Posisi & Penempatan"}
            </legend>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Nama Jabatan / Posisi"}</label>
                <input required value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold focus:border-blue-600 outline-none" placeholder="Contoh: Analis Data Riset" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Lokasi Penempatan"}</label>
                <select value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold bg-white outline-none focus:border-blue-600">
                  {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Rentang Gaji Bulanan (Rp)"}</label>
                <div className="flex items-center gap-3">
                  <input type="number" placeholder="Min" value={jobData.salary_min} onChange={e => setJobData({...jobData, salary_min: parseInt(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold" />
                  <span className="font-black text-slate-300">{"—"}</span>
                  <input type="number" placeholder="Max" value={jobData.salary_max} onChange={e => setJobData({...jobData, salary_max: parseInt(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Batas Akhir (Deadline)"}</label>
                <div className="relative">
                  <Calendar className="absolute right-4 top-4 text-slate-300" size={18} />
                  <input type="date" value={jobData.expires_at} onChange={e => setJobData({...jobData, expires_at: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Sistem Kerja"}</label>
              <div className="flex flex-wrap gap-2">
                {WORK_MODES.map(mode => (
                  <button key={mode} type="button" onClick={() => setJobData({...jobData, work_mode: mode})} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${jobData.work_mode === mode ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}>{mode}</button>
                ))}
              </div>
            </div>
          </fieldset>

          {/* SEKSI 2: KRITERIA KOMPETENSI */}
          <fieldset className="space-y-8 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
            <legend className="text-[10px] font-black uppercase text-slate-500 px-4 py-1 bg-white border border-slate-200 rounded-full flex items-center gap-2">
              <GraduationCap size={14} /> {"2. Kriteria Kompetensi & Pendidikan"}
            </legend>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Minimal Jenjang Pendidikan"}</label>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_LEVELS.map(lv => (
                  <button key={lv} type="button" onClick={() => setJobData({...jobData, required_education_level: lv})} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${jobData.required_education_level === lv ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}>{lv}</button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Target Jurusan / Bidang Studi"}</label>
              <input value={jobData.required_education_major} onChange={e => setJobData({...jobData, required_education_major: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600" placeholder="Contoh: Teknik Informatika, Sistem Informasi, Manajemen" />
            </div>
          </fieldset>

          {/* SEKSI 3: AKOMODASI & INKLUSIVITAS */}
          <fieldset className="space-y-8">
            <legend className="text-sm font-black uppercase text-emerald-600 pb-4 border-b-2 border-emerald-50 w-full mb-8 flex items-center gap-2">
              <Heart size={18} /> {"3. Dukungan Akomodasi & Aksesibilitas"}
            </legend>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-emerald-700 ml-2">{"Alat Bantu / Akomodasi yang Disediakan (Pilih Sesuai Fasilitas)"}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MASTER_ACCOMMODATIONS.map(acc => (
                  <label key={acc.id} className="flex items-center gap-4 p-4 bg-white border-2 border-slate-50 rounded-2xl cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      checked={jobData.preferred_disability_tools.includes(acc.name)}
                      onChange={() => handleAccommodationChange(acc.name)}
                    />
                    <span className="text-[10px] font-black uppercase text-slate-600">{acc.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Deskripsi Tugas (Gunakan Format Inklusif)"}</label>
              <div className="relative">
                <textarea required rows={8} value={jobData.description} onChange={e => setJobData({...jobData, description: e.target.value})} className="w-full p-6 rounded-[2rem] border-2 border-slate-100 font-medium text-sm leading-relaxed outline-none focus:border-blue-600" placeholder="Jelaskan kualifikasi dan tanggung jawab..." />
                <button type="button" onClick={useTemplate} className="absolute bottom-4 right-4 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[8px] font-black uppercase border border-amber-200 flex items-center gap-2 hover:bg-amber-100 transition-all">
                  <Sparkles size={12} /> {"Gunakan Template"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-emerald-700 ml-2">{"Catatan Tambahan Aksesibilitas"}</label>
              <textarea rows={3} value={jobData.accessibility_note} onChange={e => setJobData({...jobData, accessibility_note: e.target.value})} className="w-full p-6 bg-emerald-50/20 rounded-[2rem] border-2 border-emerald-100 font-medium text-sm outline-none focus:border-emerald-600" placeholder="Misal: Fleksibilitas waktu kerja untuk terapi, tersedia jalur landai, dsb..." />
            </div>
          </fieldset>

          <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3">
            {loading ? <><Clock className="animate-spin" size={20} /> {"MEMPROSES DATA..."}</> : <><CheckCircle2 size={20} /> {"TAYANGKAN LOWONGAN"}</>}
          </button>
        </form>
      ) : (
        /* LIST LOWONGAN */
        <div className="grid gap-4">
          {myJobs.length > 0 ? myJobs.map((job) => (
            <div key={job.id} className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-slate-900 transition-all gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[9px] font-bold text-slate-400 uppercase">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {job.location}</span>
                    <span className="text-blue-600">{job.work_mode}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">{job.required_education_level}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className={`flex-1 md:flex-none text-center px-4 py-2 rounded-xl text-[8px] font-black uppercase ${job.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {job.is_active ? 'Status: Aktif' : 'Status: Tutup'}
                </div>
                <button 
                  onClick={() => handleDelete(job.id, job.title)} 
                  className="p-4 text-slate-300 hover:text-red-600 transition-colors"
                  aria-label={`{"Hapus lowongan "}${job.title}`}
                >
                  <Trash2 size={22} />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-24 border-4 border-dashed border-slate-50 rounded-[4rem] text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Briefcase size={40} />
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">{"Belum ada lowongan yang terdaftar dalam basis data riset."}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
