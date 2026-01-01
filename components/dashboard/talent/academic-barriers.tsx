"use client";

import React, { useState } from "react";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  GraduationCap, BookOpen, School, Calendar, 
  AlertTriangle, Save, CheckCircle2, AlertCircle,
  Building, MapPin, Award
} from "lucide-react";
import { 
  EDUCATION_LEVELS, 
  EDUCATION_MODELS, 
  SCHOLARSHIP_TYPES, 
  EDUCATION_BARRIERS,
  UNIVERSITIES 
} from "@/lib/data-static";

interface AcademicBarriersProps {
  user: any;
  profile: any;
  onSuccess?: () => void;
}

export default function AcademicBarriers({ user, profile, onSuccess }: AcademicBarriersProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // State Management dengan Data Real
  const [formData, setFormData] = useState({
    education_level: profile?.education_level || "",
    education_model: profile?.education_model || "",
    university: profile?.university || "",
    major: profile?.major || "",
    graduation_date: profile?.graduation_date || "",
    scholarship_type: profile?.scholarship_type || "",
    education_barrier: profile?.education_barrier || [], // Array untuk multi-select hambatan
  });

  const handleBarrierToggle = (barrier: string) => {
    setFormData((prev: any) => {
      const current = prev.education_barrier || [];
      const updated = current.includes(barrier)
        ? current.filter((b: string) => b !== barrier)
        : [...current, barrier];
      return { ...prev, education_barrier: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateTalentProfile(user.id, formData);
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "Data Akademik & Hambatan berhasil disimpan!" });
      if (onSuccess) onSuccess();
    } else {
      setMessage({ type: "error", text: `Gagal menyimpan: ${result.error}` });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4">
          <GraduationCap className="text-emerald-600" size={36} />
          {"Riwayat Akademik"}
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
          {"Informasi pendidikan terakhir dan identifikasi hambatan untuk data riset."}
        </p>
      </header>

      {/* NOTIFIKASI ARIA-LIVE */}
      {message.text && (
        <div 
          role="status" aria-live="polite"
          className={`mb-8 p-6 rounded-[2rem] flex items-center gap-4 border-2 ${
            message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* SEKSI 1: DETAIL PENDIDIKAN (WAJIB) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="edu_level" className="text-[10px] font-black uppercase text-slate-400 px-2">{"Jenjang Pendidikan (Wajib)"}</label>
              <select 
                id="edu_level" required
                value={formData.education_level}
                onChange={(e) => setFormData({...formData, education_level: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-all"
              >
                <option value="">{"Pilih Jenjang"}</option>
                {EDUCATION_LEVELS.map((l, i) => <option key={i} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="edu_model" className="text-[10px] font-black uppercase text-slate-400 px-2">{"Model Pendidikan (Wajib)"}</label>
              <select 
                id="edu_model" required
                value={formData.education_model}
                onChange={(e) => setFormData({...formData, education_model: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-all"
              >
                <option value="">{"Pilih Model"}</option>
                {EDUCATION_MODELS.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="uni" className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-2"><Building size={12}/> {"Nama Institusi / Universitas (Wajib)"}</label>
              <input 
                id="uni" list="uni-list" required
                placeholder="Cari atau ketik nama kampus..."
                value={formData.university}
                onChange={(e) => setFormData({...formData, university: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-all"
              />
              <datalist id="uni-list">
                {UNIVERSITIES.map((u, i) => <option key={i} value={u} />)}
              </datalist>
            </div>
            <div className="space-y-2">
              <label htmlFor="major" className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-2"><BookOpen size={12}/> {"Jurusan / Program Studi (Wajib)"}</label>
              <input 
                id="major" required type="text"
                value={formData.major}
                onChange={(e) => setFormData({...formData, major: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="grad_date" className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-2"><Calendar size={12}/> {"Tanggal / Tahun Lulus (Wajib)"}</label>
              <input 
                id="grad_date" required type="date"
                value={formData.graduation_date}
                onChange={(e) => setFormData({...formData, graduation_date: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="scholarship" className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-2"><Award size={12}/> {"Status Beasiswa (Opsional)"}</label>
              <select 
                id="scholarship"
                value={formData.scholarship_type}
                onChange={(e) => setFormData({...formData, scholarship_type: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-all"
              >
                <option value="">{"Bukan Penerima Beasiswa"}</option>
                {SCHOLARSHIP_TYPES.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* SEKSI 2: HAMBATAN PENDIDIKAN (WAJIB - UNTUK RISET BRIN) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-4 text-amber-600 mb-2">
            <AlertTriangle size={24} />
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">{"Hambatan Selama Pendidikan (Multi-select)"}</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
            {"Data ini membantu kami melakukan riset mengenai aksesibilitas pendidikan di Indonesia secara anonim."}
          </p>
          <div className="flex flex-wrap gap-3">
            {EDUCATION_BARRIERS.map((barrier, i) => (
              <button
                key={i} type="button"
                onClick={() => handleBarrierToggle(barrier)}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${
                  formData.education_barrier.includes(barrier)
                    ? "bg-amber-600 border-amber-600 text-white shadow-lg"
                    : "bg-white border-slate-100 text-slate-400 hover:border-amber-200"
                }`}
              >
                {barrier}
              </button>
            ))}
          </div>
        </section>

        {/* SUBMIT */}
        <div className="flex justify-end pt-6">
          <button 
            type="submit" disabled={loading}
            className="bg-emerald-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-slate-900 transition-all shadow-xl shadow-emerald-200"
          >
            {loading ? "Menyimpan..." : (
              <>
                <Save size={20} /> {"Simpan Riwayat Akademik"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
