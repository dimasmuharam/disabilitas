"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, FileText, Trash2, Sparkles, 
  Eye, CheckCircle2, AlertCircle, X, 
  MapPin, Briefcase, Info 
} from "lucide-react";
import { 
  WORK_MODES, 
  DISABILITY_TYPES, 
  INCLUSIVE_JOB_TEMPLATE,
  INDONESIA_CITIES 
} from "@/lib/data-static";

export default function JobManager({ company, onSuccess }: { company: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // State Form Lowongan Baru
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: company?.location || "Jakarta Selatan",
    work_mode: WORK_MODES[0],
    target_disabilities: [] as string[],
    is_active: true
  });

  useEffect(() => {
    fetchJobs();
  }, [company.id]);

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
    setAnnouncement(`{"Template deskripsi inklusif telah diterapkan."}`);
  };

  const handleToggleDisability = (type: string) => {
    setJobData(prev => ({
      ...prev,
      target_disabilities: prev.target_disabilities.includes(type)
        ? prev.target_disabilities.filter(t => t !== type)
        : [...prev.target_disabilities, type]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobData.title || !jobData.description) return;

    setLoading(true);
    setAnnouncement(`{"Sedang memposting lowongan baru..."}`);

    const { error } = await supabase.from("jobs").insert({
      company_id: company.id,
      ...jobData,
      updated_at: new Date().toISOString()
    });

    if (!error) {
      setAnnouncement(`{"Lowongan berhasil diterbitkan secara publik."}`);
      setShowForm(false);
      fetchJobs();
      onSuccess(); // Redirect ke Overview via Induk
    } else {
      setAnnouncement(`{"Gagal memposting: "}${error.message}`);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(`{"Hapus lowongan ini secara permanen?"}`)) {
      await supabase.from("jobs").delete().eq("id", id);
      fetchJobs();
      setAnnouncement(`{"Lowongan telah dihapus."}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER & ACTION */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
          <FileText className="text-blue-600" size={24} /> {"Manajemen Lowongan"}
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
        >
          {showForm ? <><X size={18}/> {"Batal"}</> : <><Plus size={18}/> {"Buat Lowongan"}</>}
        </button>
      </div>

      {showForm ? (
        /* FORM POSTING LOWONGAN */
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8 animate-in zoom-in-95">
          <div className="flex justify-between items-center border-b pb-6">
            <h3 className="text-sm font-black uppercase text-blue-600">{"Detail Pekerjaan Baru"}</h3>
            <button 
              type="button" 
              onClick={useTemplate}
              className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-amber-100 transition-colors border border-amber-200"
            >
              <Sparkles size={14} /> {"Pakai Template Inklusif"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Judul Posisi"}</label>
                <input 
                  required
                  placeholder="Contoh: Staff Administrasi Inklusif"
                  value={jobData.title}
                  onChange={e => setJobData({...jobData, title: e.target.value})}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Lokasi Kerja"}</label>
                <select 
                  value={jobData.location}
                  onChange={e => setJobData({...jobData, location: e.target.value})}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600 bg-white"
                >
                  {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Model Kerja"}</label>
                <div className="flex flex-wrap gap-2">
                  {WORK_MODES.map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setJobData({...jobData, work_mode: mode})}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${jobData.work_mode === mode ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Ragam Disabilitas yang Dicari"}</label>
                <div className="flex flex-wrap gap-2">
                  {DISABILITY_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleToggleDisability(type)}
                      className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase border transition-all ${jobData.target_disabilities.includes(type) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Deskripsi & Persyaratan Pekerjaan"}</label>
            <textarea 
              required
              rows={10}
              value={jobData.description}
              onChange={e => setJobData({...jobData, description: e.target.value})}
              className="w-full p-6 rounded-[2rem] border-2 border-slate-100 text-sm leading-relaxed outline-none focus:border-blue-600 font-medium"
              placeholder="Gunakan template untuk hasil terbaik..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-slate-900 transition-all shadow-xl shadow-blue-100"
          >
            {loading ? "PROSES PENERBITAN..." : "TAYANGKAN LOWONGAN SEKARANG"}
          </button>
        </form>
      ) : (
        /* DAFTAR LOWONGAN AKTIF */
        <div className="grid gap-4">
          {myJobs.length > 0 ? myJobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-slate-900 transition-all">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{job.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><MapPin size={10}/> {job.location}</span>
                    <span className="text-[9px] font-bold text-blue-600 uppercase italic">{"• "}{job.work_mode}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <div className="text-right mr-4 hidden md:block">
                  <p className="text-[8px] font-black text-slate-300 uppercase">{"Status"}</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase">{"Aktif"}</p>
                </div>
                <button 
                  onClick={() => handleDelete(job.id)}
                  className="p-3 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  aria-label="Hapus Lowongan"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-20 border-2 border-dashed border-slate-100 rounded-[3rem] text-center">
              <Info className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{"Belum ada lowongan terpublikasi."}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
