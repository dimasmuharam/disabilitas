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
    <div className="max-w-4xl mx-auto pb-20 font-sans text-slate-900">
      <datalist id="uni-list">
        {UNIVERSITIES.map((u, i) => <option key={i} value={u} />)}
      </datalist>

      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
          <GraduationCap className="text-emerald-600" size={36} aria-hidden="true" />
          {"Riwayat Akademik"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
          {"Informasi pendidikan terakhir dan identifikasi dukungan untuk data riset."}
        </p>
      </header>

      {/* NOTIFIKASI ARIA-LIVE: Sangat penting untuk Screen Reader */}
      <div aria-live="polite" aria-atomic="true" className="px-4">
        {message.text && (
          <div className={`mb-8 p-6 rounded-[2rem] flex items-center gap-4 border-2 ${
            message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        
        {/* SEKSI 1: DETAIL PENDIDIKAN */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <h2 className="text-xs font-black uppercase text-emerald-600 tracking-[0.2em] flex items-center gap-2">
            <School size={16} aria-hidden="true" /> {"Informasi Institusi"}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-sm font-bold">
            <div className="space-y-2">
              <label htmlFor="edu_level" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Jenjang Pendidikan"}</label>
              <select id="edu_level" required value={formData.education_level} onChange={(e) => setFormData({...formData, education_level: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-emerald-600 outline-none transition-all">
                <option value="">{"Pilih Jenjang"}</option>
                {EDUCATION_LEVELS.map((l, i) => <option key={i} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="uni" className="text-[10px] font-black uppercase text-slate-400 ml-2">
                {isCollege ? "Nama Perguruan Tinggi" : "Nama Sekolah"}
              </label>
              <input id="uni" list="uni-list" required placeholder="Ketik nama institusi..." value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-emerald-600 outline-none" />
            </div>
            <div className="space-y-2">
              <label htmlFor="major" className="text-[10px] font-black uppercase text-slate-400 ml-2">
                {isCollege ? "Program Studi / Jurusan" : "Peminatan / Program Utama"}
              </label>
              <input id="major" required type="text" value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-emerald-600 outline-none" />
            </div>
            <div className="space-y-2">
              <label htmlFor="grad_year" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Tahun Lulus"}</label>
              <input id="grad_year" required type="number" placeholder="Contoh: 2024" value={formData.graduation_date} onChange={(e) => setFormData({...formData, graduation_date: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-emerald-600 outline-none" />
            </div>
            <div className="space-y-2">
              <label htmlFor="edu_model" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Model Pendidikan"}</label>
              <select id="edu_model" required value={formData.education_model} onChange={(e) => setFormData({...formData, education_model: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-emerald-600 outline-none">
                <option value="">{"Pilih Model"}</option>
                {EDUCATION_MODELS.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="scholarship" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Tipe Pembiayaan"}</label>
              <select id="scholarship" value={formData.scholarship_type} onChange={(e) => setFormData({...formData, scholarship_type: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-emerald-600 outline-none">
                <option value="">{"Biaya Mandiri / Bukan Beasiswa"}</option>
                {SCHOLARSHIP_TYPES.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* SEKSI 2: LINEARITAS (RADIO BUTTON) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm">
          <fieldset className="space-y-6">
            <legend className="flex items-center gap-4 mb-4">
              <Workflow className="text-blue-600" size={24} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">{"Linearitas Studi & Pekerjaan"}</span>
            </legend>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              {"Sejauh mana bidang studi pendidikan terakhir Anda relevan dengan pekerjaan saat ini?"}
            </p>
            <div className="grid grid-cols-1 gap-3">
              {STUDY_RELEVANCE_LEVELS.map((level, i) => (
                <label key={i} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${formData.study_relevance === level ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 hover:border-slate-100'}`}>
                  <input type="radio" name="relevance" value={level} checked={formData.study_relevance === level} onChange={(e) => setFormData({...formData, study_relevance: e.target.value})} className="w-6 h-6 accent-blue-600" />
                  <span className="text-sm font-bold text-slate-800 uppercase italic tracking-tight">{level}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* SEKSI 3: AKOMODASI & TOOLS (MULTI-CHECKBOX GROUPS) */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm">
            <fieldset className="space-y-6">
              <legend className="flex items-center gap-4 text-emerald-700 mb-4">
                <Handshake size={24} aria-hidden="true" />
                <span className="text-xs font-black uppercase tracking-tight">{"Dukungan dari Institusi"}</span>
              </legend>
              <div className="space-y-4">
                {ACADEMIC_SUPPORT_RECEIVED.map((item, i) => (
                  <label key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border-2 border-transparent">
                    <input type="checkbox" checked={formData.academic_support_received.includes(item)} onChange={() => handleMultiToggle('academic_support_received', item)} className="w-6 h-6 mt-1 accent-emerald-600" />
                    <span className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-tight">{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm">
            <fieldset className="space-y-6">
              <legend className="flex items-center gap-4 text-purple-700 mb-4">
                <Cpu size={24} aria-hidden="true" />
                <span className="text-xs font-black uppercase tracking-tight">{"Teknologi Asistif Mandiri"}</span>
              </legend>
              <div className="space-y-4">
                {ACADEMIC_ASSISTIVE_TOOLS.map((tool, i) => (
                  <label key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border-2 border-transparent">
                    <input type="checkbox" checked={formData.academic_assistive_tools.includes(tool)} onChange={() => handleMultiToggle('academic_assistive_tools', tool)} className="w-6 h-6 mt-1 accent-purple-600" />
                    <span className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-tight">{tool}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
        </div>

        {/* SEKSI 4: HAMBATAN PENDIDIKAN (MULTI-CHECKBOX UNTUK RISET) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm">
          <fieldset className="space-y-6">
            <legend className="flex items-center gap-4 text-amber-600 mb-4">
              <AlertTriangle size={24} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">{"Hambatan Selama Pendidikan"}</span>
            </legend>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              {"Pilih hambatan yang Anda alami (bisa lebih dari satu) untuk membantu riset BRIN."}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EDUCATION_BARRIERS.map((barrier, i) => (
                <label key={i} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.education_barrier.includes(barrier) ? 'border-amber-600 bg-amber-50' : 'border-slate-100 hover:border-amber-200'}`}>
                  <input type="checkbox" checked={formData.education_barrier.includes(barrier)} onChange={() => handleMultiToggle('education_barrier', barrier)} className="w-6 h-6 accent-amber-600" />
                  <span className="text-[10px] font-black uppercase text-slate-600 leading-snug">{barrier}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* SUBMIT */}
        <div className="flex justify-end pt-6">
          <button type="submit" disabled={loading}
            className="bg-slate-900 text-white px-16 py-6 rounded-[2.5rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-emerald-600 transition-all shadow-2xl disabled:opacity-50"
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
