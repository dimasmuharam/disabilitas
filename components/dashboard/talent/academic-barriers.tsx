"use client";

import React, { useState } from "react";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  GraduationCap, School, Save, CheckCircle2, 
  AlertCircle, Cpu, Handshake, Workflow, AlertTriangle,
  Loader2
} from "lucide-react";

import { 
  EDUCATION_LEVELS, 
  EDUCATION_MODELS, 
  SCHOLARSHIP_TYPES, 
  EDUCATION_BARRIERS,
  UNIVERSITIES,
  UNIVERSITY_MAJORS, 
  ACADEMIC_SUPPORT_RECEIVED,
  ACADEMIC_ASSISTIVE_TOOLS,
  STUDY_RELEVANCE_LEVELS
} from "@/lib/data-static";

interface AcademicBarriersProps {
  user: any;
  profile: any;
  onSuccess?: () => void;
}

export default function AcademicBarriers({ user, profile, onSuccess }: AcademicBarriersProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    education_level: profile?.education_level || "",
    education_model: profile?.education_model || "",
    university: profile?.university || "",
    major: profile?.major || "",
    graduation_date: profile?.graduation_date?.toString() || "", 
    scholarship_type: profile?.scholarship_type || "",
    education_barrier: Array.isArray(profile?.education_barrier) ? profile.education_barrier : [], 
    academic_support_received: profile?.academic_support_received || [],
    academic_assistive_tools: profile?.academic_assistive_tools || [],
    study_relevance: profile?.study_relevance || "",
  });

  const handleMultiToggle = (field: string, value: string) => {
    setFormData((prev: any) => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setMessage({ type: "", text: "" });

    // KONSTRUKSI DATA UNTUK DATABASE INTEGER & ARRAY
    const payload = {
      ...formData,
      // Pastikan tahun dikirim sebagai angka (integer)
      graduation_date: formData.graduation_date ? parseInt(formData.graduation_date) : null,
      // Pastikan hambatan dikirim sebagai Array (Memerlukan Opsi B di atas)
      education_barrier: formData.education_barrier,
      updated_at: new Date()
    };

    try {
      const result = await updateTalentProfile(user.id, payload);
      
      if (result.success) {
        setMessage({ type: "success", text: "Data riset berhasil diperbarui!" });
        if (onSuccess) setTimeout(() => onSuccess(), 1500);
      } else {
        setMessage({ type: "error", text: result.error || "Gagal simpan data." });
        setLoading(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Kesalahan jaringan database." });
      setLoading(false);
    }
  };

  const isCollege = ["Diploma (D1/D2/D3)", "Sarjana (S1 / D4)", "Magister (S2)", "Doktor (S3)"].includes(formData.education_level);

  return (
    <div className="mx-auto max-w-4xl pb-20 font-sans text-slate-900">
      {/* DATALIST UNTUK AUTOCOMPLETE */}
      <datalist id="uni-list">{UNIVERSITIES.map((u, i) => <option key={i} value={u} />)}</datalist>
      <datalist id="major-list">{UNIVERSITY_MAJORS.map((m, i) => <option key={i} value={m} />)}</datalist>

      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter">
          <GraduationCap className="text-emerald-600" size={40} aria-hidden="true" />
          Pendidikan & Riset
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase italic tracking-widest text-slate-400">
          Data tahun lulus dan hambatan digunakan untuk analisis inklusivitas nasional.
        </p>
      </header>

      {/* ARIA-LIVE REGION UNTUK SCREEN READER */}
      <div role="status" aria-live="polite" className="px-4">
        {message.text && (
          <div className={`mb-8 flex items-center gap-4 rounded-3xl border-2 p-6 ${
            message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        
        {/* DETAIL INSTITUSI */}
        <section className="space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm md:p-12">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
            <School className="text-emerald-600" size={20} aria-hidden="true" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Data Akademik</h2>
          </div>
          
          <div className="grid gap-8 text-sm font-bold md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="education_level" className="ml-2 block text-[10px] font-black uppercase text-slate-400">Jenjang</label>
              <select id="education_level" required value={formData.education_level} onChange={(e) => setFormData({...formData, education_level: e.target.value})} className="w-full appearance-none rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold outline-none transition-all focus:border-emerald-600 focus:bg-white">
                <option value="">Pilih Jenjang</option>
                {EDUCATION_LEVELS.map((l, i) => <option key={i} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="university" className="ml-2 block text-[10px] font-black uppercase text-slate-400">{isCollege ? "Nama Perguruan Tinggi" : "Nama Sekolah"}</label>
              <input id="university" list="uni-list" required placeholder="Contoh: Universitas Gadjah Mada" value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold outline-none transition-all focus:border-emerald-600 focus:bg-white" />
            </div>

            <div className="space-y-2">
              <label htmlFor="major" className="ml-2 block text-[10px] font-black uppercase text-slate-400">Program Studi</label>
              <input id="major" list="major-list" required placeholder="Cari atau ketik jurusan..." value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold outline-none transition-all focus:border-emerald-600 focus:bg-white" />
            </div>

            <div className="space-y-2">
              <label htmlFor="graduation_date" className="ml-2 block text-left text-[10px] font-black uppercase text-slate-400">Tahun Lulus (Hanya Angka)</label>
              <input id="graduation_date" required type="number" min="1970" max="2035" placeholder="YYYY" value={formData.graduation_date} onChange={(e) => setFormData({...formData, graduation_date: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold outline-none transition-all focus:border-emerald-600 focus:bg-white" />
            </div>
          </div>
        </section>

        {/* HAMBATAN (SEBAGAI ARRAY UNTUK MULTI-PILIHAN) */}
        <section className="rounded-[4rem] border-2 border-slate-100 bg-slate-900 p-8 shadow-xl md:p-12 text-white">
          <fieldset className="space-y-8">
            <legend className="mb-4 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-amber-400">
              <AlertTriangle size={24} aria-hidden="true" /> Hambatan Selama Pendidikan
            </legend>
            <p className="mb-6 text-[10px] font-bold uppercase italic tracking-widest text-slate-400">Anda dapat memilih lebih dari satu hambatan sesuai pengalaman riil.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {EDUCATION_BARRIERS.map((barrier, i) => (
                <label key={i} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all ${
                  formData.education_barrier.includes(barrier) ? 'bg-slate-800 border-amber-400' : 'border-slate-800 hover:border-slate-700'
                }`}>
                  <input type="checkbox" checked={formData.education_barrier.includes(barrier)} onChange={() => handleMultiToggle('education_barrier', barrier)} className="size-6 accent-amber-400" />
                  <span className="text-[10px] font-black uppercase leading-tight">{barrier}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* TOMBOL SIMPAN */}
        <div className="flex justify-center pb-10 md:justify-end">
          <button type="submit" disabled={loading} className="flex min-w-full items-center justify-center gap-4 rounded-[2.5rem] bg-slate-900 px-16 py-8 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-emerald-600 disabled:bg-slate-400 md:min-w-[320px]">
            {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Simpan Data & Hambatan</>}
          </button>
        </div>
      </form>
    </div>
  );
}
