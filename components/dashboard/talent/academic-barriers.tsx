"use client";

import React, { useState } from "react";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  GraduationCap, School, Save, CheckCircle2, 
  AlertCircle, Cpu, Handshake, Workflow, AlertTriangle 
} from "lucide-react";

// SINKRONISASI TOTAL DENGAN DATA-STATIC MAS DIMAS
import { 
  EDUCATION_LEVELS, 
  EDUCATION_MODELS, 
  SCHOLARSHIP_TYPES, 
  EDUCATION_BARRIERS,
  UNIVERSITIES,
  UNIVERSITY_MAJORS, // Sesuai dengan file data-static.ts Mas
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
    graduation_date: profile?.graduation_date || "",
    scholarship_type: profile?.scholarship_type || "",
    education_barrier: profile?.education_barrier || [], 
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
    setLoading(true);
    setMessage({ type: "", text: "" });

    const result = await updateTalentProfile(user.id, formData);
    
    if (result.success) {
      setMessage({ type: "success", text: "Data Berhasil Disimpan. Mengalihkan..." });
      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } else {
      setMessage({ type: "error", text: `Gagal menyimpan: ${result.error}` });
      setLoading(false);
    }
  };

  const isCollege = ["Diploma (D1/D2/D3)", "Sarjana (S1 / D4)", "Magister (S2)", "Doktor (S3)"].includes(formData.education_level);

  return (
    <div className="mx-auto max-w-4xl pb-20 text-slate-900">
      {/* DATALIST UNIVERSITAS & JURUSAN */}
      <datalist id="uni-list">
        {UNIVERSITIES.map((u, i) => <option key={i} value={u} />)}
      </datalist>
      <datalist id="major-list">
        {UNIVERSITY_MAJORS.map((m, i) => <option key={i} value={m} />)}
      </datalist>

      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter italic">
          <GraduationCap className="text-emerald-600" size={36} aria-hidden="true" />
          Riwayat Akademik
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">
          Sinkronisasi data pendidikan untuk kebutuhan riset talenta inklusif.
        </p>
      </header>

      {/* ALERT NOTIFICATION */}
      <div aria-live="polite" className="px-4">
        {message.text && (
          <div className={`mb-8 flex items-center gap-4 rounded-[2rem] border-2 p-6 animate-in zoom-in-95 duration-300 ${
            message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        {/* SEKSI 1: DETAIL INSTITUSI */}
        <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm space-y-8">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
            <School size={16} aria-hidden="true" /> Informasi Institusi
          </h2>
          <div className="grid gap-8 text-sm font-bold md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Jenjang Pendidikan</label>
              <select required value={formData.education_level} onChange={(e) => setFormData({...formData, education_level: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none transition-all focus:border-emerald-600">
                <option value="">Pilih Jenjang</option>
                {EDUCATION_LEVELS.map((l, i) => <option key={i} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="ml-2 text-[10px] font-black uppercase text-slate-400">{isCollege ? "Nama Perguruan Tinggi" : "Nama Sekolah"}</label>
              <input list="uni-list" required placeholder="Ketik nama institusi..." value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-emerald-600" />
            </div>
            <div className="space-y-2">
              <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Jurusan / Peminatan</label>
              <input list="major-list" required placeholder="Cari atau ketik jurusan..." value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-emerald-600" />
            </div>
            <div className="space-y-2">
              <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Tahun Lulus</label>
              <input required type="number" min="1970" max="2035" value={formData.graduation_date} onChange={(e) => setFormData({...formData, graduation_date: e.target.value})} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-emerald-600" />
            </div>
          </div>
        </section>

        {/* SEKSI 2: LINEARITAS STUDI */}
        <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <fieldset className="space-y-6">
            <legend className="mb-4 flex items-center gap-4 text-blue-600">
              <Workflow size={24} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Linearitas Studi & Karir</span>
            </legend>
            <div className="grid grid-cols-1 gap-3">
              {STUDY_RELEVANCE_LEVELS.map((level, i) => (
                <label key={i} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all ${formData.study_relevance === level ? 'border-blue-600 bg-blue-50' : 'border-slate-50 hover:border-slate-100'}`}>
                  <input type="radio" checked={formData.study_relevance === level} onChange={() => setFormData({...formData, study_relevance: level})} className="size-6 accent-blue-600" />
                  <span className="text-sm font-bold uppercase italic text-slate-800">{level}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* SEKSI 3: DUKUNGAN & TOOLS */}
        <div className="grid gap-8 md:grid-cols-2">
          <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
            <h3 className="mb-6 flex items-center gap-3 text-emerald-700">
              <Handshake size={24} aria-hidden="true" />
              <span className="text-xs font-black uppercase">Dukungan Kampus</span>
            </h3>
            <div className="space-y-3">
              {ACADEMIC_SUPPORT_RECEIVED.map((item, i) => (
                <label key={i} className="flex cursor-pointer items-start gap-4 rounded-xl p-2 hover:bg-slate-50 transition-colors">
                  <input type="checkbox" checked={formData.academic_support_received.includes(item)} onChange={() => handleMultiToggle('academic_support_received', item)} className="mt-1 size-5 accent-emerald-600 shrink-0" />
                  <span className="text-[10px] font-bold uppercase leading-relaxed text-slate-600">{item}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
            <h3 className="mb-6 flex items-center gap-3 text-purple-700">
              <Cpu size={24} aria-hidden="true" />
              <span className="text-xs font-black uppercase">Teknologi Bantu</span>
            </h3>
            <div className="space-y-3">
              {ACADEMIC_ASSISTIVE_TOOLS.map((tool, i) => (
                <label key={i} className="flex cursor-pointer items-start gap-4 rounded-xl p-2 hover:bg-slate-50 transition-colors">
                  <input type="checkbox" checked={formData.academic_assistive_tools.includes(tool)} onChange={() => handleMultiToggle('academic_assistive_tools', tool)} className="mt-1 size-5 accent-purple-600 shrink-0" />
                  <span className="text-[10px] font-bold uppercase leading-relaxed text-slate-600">{tool}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="group flex items-center gap-4 rounded-[2.5rem] bg-slate-900 px-16 py-6 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-emerald-600 disabled:opacity-50">
            {loading ? "Menyimpan..." : <><Save size={20} /> Simpan Data Akademik</>}
          </button>
        </div>
      </form>
    </div>
  );
}
