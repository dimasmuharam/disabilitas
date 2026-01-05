"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, FileText, Trash2, Sparkles, 
  Briefcase, MapPin, Info, X, CheckCircle2
} from "lucide-react";
import { 
  WORK_MODES, 
  INCLUSIVE_JOB_TEMPLATE,
  INDONESIA_CITIES 
} from "@/lib/data-static";

export default function JobManager({ company, onSuccess }: { company: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: company?.location || "Jakarta Selatan",
    work_mode: WORK_MODES[0],
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
    setAnnouncement(`{"Template deskripsi inklusif telah diterapkan ke form."}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from("jobs").insert({
      company_id: company.id,
      ...jobData,
      updated_at: new Date().toISOString()
    });

    if (!error) {
      setAnnouncement(`{"Lowongan berhasil diterbitkan."}`);
      setShowForm(false);
      fetchJobs();
      onSuccess(); // Otomatis kembali ke Overview
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <FileText className="text-blue-600" size={24} /> {"Manajemen Lowongan"}
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl"
        >
          {showForm ? <><X size={18}/> {"Batal"}</> : <><Plus size={18}/> {"Buat Lowongan"}</>}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8">
          <div className="flex justify-between items-center border-b pb-6">
            <h3 className="text-sm font-black uppercase text-blue-600">{"Detail Lowongan Berbasis Kompetensi"}</h3>
            <button 
              type="button" 
              onClick={useTemplate}
              className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 border border-amber-200"
            >
              <Sparkles size={14} /> {"Gunakan Format Deskripsi Inklusif"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Nama Posisi / Pekerjaan"}</label>
                <input 
                  required
                  placeholder="Masukkan posisi..."
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
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none bg-white"
                >
                  {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Sistem Kerja"}</label>
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
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[9px] font-bold text-blue-700 leading-relaxed uppercase flex items-start gap-2">
                  <Info size={14} className="shrink-0" />
                  {"Ingat: Fokuslah pada kualifikasi keterampilan. Disabilitas.com akan mencocokkan profil berdasarkan kompetensi, bukan hambatan."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Deskripsi, Kualifikasi, & Dukungan Akomodasi"}</label>
            <textarea 
              required
              rows={10}
              value={jobData.description}
              onChange={e => setJobData({...jobData, description: e.target.value})}
              className="w-full p-6 rounded-[2rem] border-2 border-slate-100 text-sm leading-relaxed outline-none focus:border-blue-600 font-medium"
              placeholder="Sebutkan skill yang dibutuhkan dan dukungan alat bantu yang tersedia di kantor..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-slate-900 transition-all shadow-xl shadow-blue-100"
          >
            {loading ? "MEMPROSES..." : "TAYANGKAN LOWONGAN"}
          </button>
        </form>
      ) : (
        /* DAFTAR LOWONGAN */
        <div className="grid gap-4">
          {myJobs.length > 0 ? myJobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 flex justify-between items-center group hover:border-slate-900 transition-all">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors italic font-black">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{job.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[9px] font-bold text-slate-400 uppercase">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {job.location}</span>
                    <span>{"•"}</span>
                    <span className="text-blue-600">{job.work_mode}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(job.id)} className="p-3 text-red-200 hover:text-red-600 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          )) : (
            <div className="p-20 border-2 border-dashed border-slate-100 rounded-[3rem] text-center opacity-50">
              <p className="text-[10px] font-black text-slate-300 uppercase italic">{"Belum ada lowongan aktif."}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
