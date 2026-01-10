"use client";

import React, { useState } from "react";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  GraduationCap, BookOpen, School, Calendar, 
  AlertTriangle, Save, CheckCircle2, AlertCircle,
  Building, Award, Cpu, Handshake, Workflow
} from "lucide-react";

// SINKRONISASI DATA-STATIC
import { 
  EDUCATION_LEVELS, 
  EDUCATION_MODELS, 
  SCHOLARSHIP_TYPES, 
  EDUCATION_BARRIERS,
  UNIVERSITIES,
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

  // State Management dengan Data Real + 3 Variabel Baru
  const [formData, setFormData] = useState({
    education_level: profile?.education_level || "",
    education_model: profile?.education_model || "",
    university: profile?.university || "",
    major: profile?.major || "",
    graduation_date: profile?.graduation_date || "", // Menggunakan tahun saja
    scholarship_type: profile?.scholarship_type || "",
    education_barrier: profile?.education_barrier || [], 
    academic_support_received: profile?.academic_support_received || [], // Baru
    academic_assistive_tools: profile?.academic_assistive_tools || [], // Baru
    study_relevance: profile?.study_relevance || "", // Baru
  });

  // Fungsi toggle universal untuk multi-checkbox
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
    setLoading(true);
    setMessage({ type: "", text: "" });

    const result = await updateTalentProfile(user.id, formData);
    
    if (result.success) {
      setMessage({ type: "success", text: "Data Berhasil Disimpan. Mengalihkan ke Overview..." });
      // Screen reader akan membaca pesan sukses karena aria-live
      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } else {
      setMessage({ type: "error", text: `Gagal menyimpan: ${result.error}` });
      setLoading(false);
    }
  };

  // Logika Smart: Cek apakah jenjang perguruan tinggi
  const isCollege = ["D3", "D4", "S1", "S2", "S3"].includes(formData.education_level);

  return (
    <div className="mx-auto max-w-4xl pb-20 font-sans text-slate-900">
      <datalist id="uni-list">
        {UNIVERSITIES.map((u, i) => <option key={i} value={u} />)}
      </datalist>

      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter">
          <GraduationCap className="text-emerald-600" size={36} aria-hidden="true" />
          {"Riwayat Akademik"}
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {"Informasi pendidikan terakhir dan identifikasi dukungan untuk data riset."}
        </p>
      </header>

      {/* NOTIFIKASI ARIA-LIVE: Sangat penting untuk Screen Reader */}
      <div aria-live="polite" aria-atomic="true" className="px-4">
        {message.text && (
          <div className={`mb-8 flex items-center gap-4 rounded-[2rem] border-2 p-6 ${
            message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        
        {/* SEKSI 1: DETAIL PENDIDIKAN */}
        <section className="space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
            <School size={16} aria-hidden="true" /> {"Informasi Institusi"}
          </h2>
          <div className="grid gap-8 text-sm font-bold md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="edu_level" className="ml-2 text-[10px] font-black uppercase text-slate-400">{"Jenjang Pendidikan"}</label>
              <select id="edu_level" required value={formData.education_level} onChange={(e) => setFormData({...formData, education_level: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none transition-all focus:border-emerald-600">
                <option value="">{"Pilih Jenjang"}</option>
                {EDUCATION_LEVELS.map((l, i) => <option key={i} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="uni" className="ml-2 text-[10px] font-black uppercase text-slate-400">
                {isCollege ? "Nama Perguruan Tinggi" : "Nama Sekolah"}
              </label>
              <input id="uni" list="uni-list" required placeholder="Ketik nama institusi..." value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-emerald-600" />
            </div>
            <div className="space-y-2">
              <label htmlFor="major" className="ml-2 text-[10px] font-black uppercase text-slate-400">
                {isCollege ? "Program Studi / Jurusan" : "Peminatan / Program Utama"}
              </label>
              <input id="major" required type="text" value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-emerald-600" />
            </div>
            <div className="space-y-2">
              <label htmlFor="grad_year" className="ml-2 text-[10px] font-black uppercase text-slate-400">{"Tahun Lulus"}</label>
              <input id="grad_year" required type="number" placeholder="Contoh: 2024" value={formData.graduation_date} onChange={(e) => setFormData({...formData, graduation_date: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-emerald-600" />
            </div>
            <div className="space-y-2">
              <label htmlFor="edu_model" className="ml-2 text-[10px] font-black uppercase text-slate-400">{"Model Pendidikan"}</label>
              <select id="edu_model" required value={formData.education_model} onChange={(e) => setFormData({...formData, education_model: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-emerald-600">
                <option value="">{"Pilih Model"}</option>
                {EDUCATION_MODELS.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="scholarship" className="ml-2 text-[10px] font-black uppercase text-slate-400">{"Tipe Pembiayaan"}</label>
              <select id="scholarship" value={formData.scholarship_type} onChange={(e) => setFormData({...formData, scholarship_type: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-emerald-600">
                <option value="">{"Biaya Mandiri / Bukan Beasiswa"}</option>
                {SCHOLARSHIP_TYPES.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* SEKSI 2: LINEARITAS (RADIO BUTTON) */}
        <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <fieldset className="space-y-6">
            <legend className="mb-4 flex items-center gap-4">
              <Workflow className="text-blue-600" size={24} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">{"Linearitas Studi & Pekerjaan"}</span>
            </legend>
            <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-slate-400">
              {"Sejauh mana bidang studi pendidikan terakhir Anda relevan dengan pekerjaan saat ini?"}
            </p>
            <div className="grid grid-cols-1 gap-3">
              {STUDY_RELEVANCE_LEVELS.map((level, i) => (
                <label key={i} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all ${formData.study_relevance === level ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 hover:border-slate-100'}`}>
                  <input type="radio" name="relevance" value={level} checked={formData.study_relevance === level} onChange={(e) => setFormData({...formData, study_relevance: e.target.value})} className="size-6 accent-blue-600" />
                  <span className="text-sm font-bold uppercase italic tracking-tight text-slate-800">{level}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* SEKSI 3: AKOMODASI & TOOLS (MULTI-CHECKBOX GROUPS) */}
        <div className="grid gap-8 md:grid-cols-2">
          <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
            <fieldset className="space-y-6">
              <legend className="mb-4 flex items-center gap-4 text-emerald-700">
                <Handshake size={24} aria-hidden="true" />
                <span className="text-xs font-black uppercase tracking-tight">{"Dukungan dari Institusi"}</span>
              </legend>
              <div className="space-y-4">
                {ACADEMIC_SUPPORT_RECEIVED.map((item, i) => (
                  <label key={i} className="flex cursor-pointer items-start gap-4 rounded-xl border-2 border-transparent p-3 transition-all hover:bg-slate-50">
                    <input type="checkbox" checked={formData.academic_support_received.includes(item)} onChange={() => handleMultiToggle('academic_support_received', item)} className="mt-1 size-6 accent-emerald-600" />
                    <span className="text-xs font-bold uppercase leading-relaxed tracking-tight text-slate-600">{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
            <fieldset className="space-y-6">
              <legend className="mb-4 flex items-center gap-4 text-purple-700">
                <Cpu size={24} aria-hidden="true" />
                <span className="text-xs font-black uppercase tracking-tight">{"Teknologi Asistif Mandiri"}</span>
              </legend>
              <div className="space-y-4">
                {ACADEMIC_ASSISTIVE_TOOLS.map((tool, i) => (
                  <label key={i} className="flex cursor-pointer items-start gap-4 rounded-xl border-2 border-transparent p-3 transition-all hover:bg-slate-50">
                    <input type="checkbox" checked={formData.academic_assistive_tools.includes(tool)} onChange={() => handleMultiToggle('academic_assistive_tools', tool)} className="mt-1 size-6 accent-purple-600" />
                    <span className="text-xs font-bold uppercase leading-relaxed tracking-tight text-slate-600">{tool}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
        </div>

        {/* SEKSI 4: HAMBATAN PENDIDIKAN (MULTI-CHECKBOX UNTUK RISET) */}
        <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <fieldset className="space-y-6">
            <legend className="mb-4 flex items-center gap-4 text-amber-600">
              <AlertTriangle size={24} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">{"Hambatan Selama Pendidikan"}</span>
            </legend>
            <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-slate-400">
              {"Pilih hambatan yang Anda alami (bisa lebih dari satu) untuk membantu riset BRIN."}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {EDUCATION_BARRIERS.map((barrier, i) => (
                <label key={i} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all ${formData.education_barrier.includes(barrier) ? 'border-amber-600 bg-amber-50' : 'border-slate-100 hover:border-amber-200'}`}>
                  <input type="checkbox" checked={formData.education_barrier.includes(barrier)} onChange={() => handleMultiToggle('education_barrier', barrier)} className="size-6 accent-amber-600" />
                  <span className="text-[10px] font-black uppercase leading-snug text-slate-600">{barrier}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* SUBMIT */}
        <div className="flex justify-end pt-6">
          <button type="submit" disabled={loading}
            className="flex items-center gap-4 rounded-[2.5rem] bg-slate-900 px-16 py-6 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : (
              <>
                <Save size={20} aria-hidden="true" /> {"Simpan Profil Akademik"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
