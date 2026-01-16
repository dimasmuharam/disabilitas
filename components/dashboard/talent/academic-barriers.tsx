"use client";

import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import { 
  GraduationCap, School, AlertTriangle, Save, 
  CheckCircle2, AlertCircle, Handshake, Cpu, Workflow,
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
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Standar: Tambahkan Canonical Link secara dinamis
  useEffect(() => {
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", window.location.origin + window.location.pathname);
    if (!document.head.contains(link)) document.head.appendChild(link);
  }, []);

  const [formData, setFormData] = useState({
    education_level: profile?.education_level || "",
    education_model: profile?.education_model || "",
    university: profile?.university || "",
    major: profile?.major || "",
    graduation_date: profile?.graduation_date || "",
    scholarship_type: profile?.scholarship_type || "",
    education_barrier: Array.isArray(profile?.education_barrier) ? profile.education_barrier : [], 
    academic_support_received: Array.isArray(profile?.academic_support_received) ? profile.academic_support_received : [],
    academic_assistive_tools: Array.isArray(profile?.academic_assistive_tools) ? profile.academic_assistive_tools : [],
    study_relevance: profile?.study_relevance || "",
  });

  const isCollegeLevel = [
    "Diploma (D1/D2/D3)", "Sarjana (S1 / D4)", "Magister (S2)", "Doktor (S3)"
  ].includes(formData.education_level);

  const showEducationModel = formData.education_level && !isCollegeLevel;

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

    if (!user?.id) {
      setLoading(false);
      setMessage({ type: "error", text: "ID PENGGUNA TIDAK DITEMUKAN. SILAKAN LOGIN ULANG." });
      return;
    }

    try {
      // Mapping Payload - Sinkronisasi dengan kolom database profiles
      const payload = {
        education_level: formData.education_level || null,
        education_model: isCollegeLevel ? "Reguler" : (formData.education_model || null),
        university: isCollegeLevel ? formData.university : null,
        major: isCollegeLevel ? formData.major : null,
        graduation_date: formData.graduation_date ? parseInt(formData.graduation_date.toString()) : null,
        scholarship_type: formData.scholarship_type || null,
        education_barrier: formData.education_barrier,
        academic_support_received: formData.academic_support_received,
        academic_assistive_tools: formData.academic_assistive_tools,
        study_relevance: isCollegeLevel ? formData.study_relevance : null,
        // Biarkan database handle updated_at secara otomatis atau gunakan ini jika kolom wajib manual:
        updated_at: new Date().toISOString(),
      };

      // UPDATE LANGSUNG KE SUPABASE - Melewati hambatan Server Action Next.js 13
      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

      if (error) throw error;

      setMessage({ type: "success", text: "DATA AKADEMIK BERHASIL DISINKRONKAN!" });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => feedbackRef.current?.focus(), 200);
      if (onSuccess) setTimeout(onSuccess, 2000);

    } catch (error: any) {
      console.error("Critical Sync Error:", error);
      setMessage({ 
        type: "error", 
        text: `GAGAL DISIMPAN. DETAIL SYSTEM: ${error.message.toUpperCase()}` 
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => feedbackRef.current?.focus(), 200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-20 text-slate-900">
      <datalist id="uni-list">
        {UNIVERSITIES.map((u, i) => <option key={i} value={u} />)}
      </datalist>
      <datalist id="major-list">
        {UNIVERSITY_MAJORS.map((m, i) => <option key={i} value={m} />)}
      </datalist>

      <header className="mb-10 px-4 text-left">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic leading-none tracking-tighter text-slate-900">
          <GraduationCap className="text-emerald-600" size={36} /> Riwayat Akademik
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase italic tracking-[0.2em] text-slate-400">
          Data hambatan & dukungan pendidikan sangat penting bagi riset inklusi
        </p>
      </header>

      <div ref={feedbackRef} tabIndex={-1} aria-live="assertive" className="px-4 outline-none">
        {message.text && (
          <div className={`mb-8 flex items-center gap-4 rounded-[2rem] border-4 p-6 ${
            message.type === "success" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-red-500 bg-red-50 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic leading-none">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        <section className="space-y-8 rounded-[3.5rem] border-4 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <h2 id="heading-institution" className="flex items-center gap-2 text-xs font-black uppercase italic tracking-[0.2em] text-emerald-600">
            <School size={18} aria-hidden="true" /> Institusi & Pendidikan
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="edu_level" className="ml-2 text-[10px] font-black uppercase text-slate-400">Jenjang Pendidikan</label>
              <select id="edu_level" required value={formData.education_level} onChange={(e) => setFormData({...formData, education_level: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none transition-all focus:border-emerald-600">
                <option value="">-- Pilih Jenjang --</option>
                {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {showEducationModel && (
              <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                <label htmlFor="edu_model" className="ml-2 text-[10px] font-black uppercase text-slate-400">Model Pendidikan</label>
                <select id="edu_model" required value={formData.education_model} onChange={(e) => setFormData({...formData, education_model: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none transition-all focus:border-emerald-600">
                  <option value="">-- Pilih Model --</option>
                  {EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}

            {isCollegeLevel && (
              <>
                <div className="space-y-2 animate-in fade-in zoom-in-95">
                  <label htmlFor="uni-input" className="ml-2 text-[10px] font-black uppercase text-slate-400">Nama Kampus</label>
                  <input id="uni-input" list="uni-list" required placeholder="Cari kampus..." value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold shadow-inner outline-none focus:border-emerald-600" />
                </div>
                <div className="space-y-2 animate-in fade-in zoom-in-95">
                  <label htmlFor="major-input" className="ml-2 text-[10px] font-black uppercase text-slate-400">Program Studi</label>
                  <input id="major-input" list="major-list" required placeholder="Cari jurusan..." value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold shadow-inner outline-none focus:border-emerald-600" />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="grad_year" className="ml-2 text-[10px] font-black uppercase text-slate-400">Tahun Lulus</label>
              <input id="grad_year" required type="number" placeholder="YYYY" value={formData.graduation_date} onChange={(e) => setFormData({...formData, graduation_date: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600" />
            </div>

            <div className="space-y-2">
              <label htmlFor="scholarship" className="ml-2 text-[10px] font-black uppercase text-slate-400">Tipe Beasiswa</label>
              <select id="scholarship" value={formData.scholarship_type} onChange={(e) => setFormData({...formData, scholarship_type: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600">
                <option value="">Biaya Mandiri</option>
                {SCHOLARSHIP_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </section>

        {isCollegeLevel && (
          <fieldset className="rounded-[3.5rem] border-4 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <legend id="legend-relevance" className="mb-6 flex items-center gap-4 px-2 text-xs font-black uppercase italic leading-none tracking-[0.2em] text-blue-600">
              <Workflow size={24} aria-hidden="true" /> Linearitas Studi & Karier
            </legend>
            <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-labelledby="legend-relevance">
              {STUDY_RELEVANCE_LEVELS.map((level) => (
                <label key={level} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all ${formData.study_relevance === level ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-slate-50 hover:border-slate-300'}`}>
                  <input type="radio" name="relevance" value={level} checked={formData.study_relevance === level} onChange={(e) => setFormData({...formData, study_relevance: e.target.value})} className="size-5 accent-blue-600" />
                  <span className="text-sm font-bold uppercase italic text-slate-800">{level}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="grid gap-10 md:grid-cols-2">
          <fieldset className="rounded-[3.5rem] border-4 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <legend id="legend-support" className="mb-6 flex items-center gap-3 px-2 text-xs font-black uppercase italic leading-none tracking-tight text-emerald-700">
              <Handshake size={24} aria-hidden="true" /> Dukungan Institusi
            </legend>
            <div className="space-y-3">
              {ACADEMIC_SUPPORT_RECEIVED.map((item) => (
                <label key={item} className="flex cursor-pointer items-start gap-4 rounded-xl border-2 border-transparent bg-slate-50 p-4 transition-all hover:bg-slate-100">
                  <input type="checkbox" aria-describedby="legend-support" checked={formData.academic_support_received.includes(item)} onChange={() => handleMultiToggle('academic_support_received', item)} className="mt-1 size-5 accent-emerald-600" />
                  <span className="text-[10px] font-bold uppercase italic leading-tight text-slate-600">{item}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-[3.5rem] border-4 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <legend id="legend-tools" className="mb-6 flex items-center gap-3 px-2 text-xs font-black uppercase italic leading-none tracking-tight text-purple-700">
              <Cpu size={24} aria-hidden="true" /> Teknologi Asistif
            </legend>
            <div className="space-y-3">
              {ACADEMIC_ASSISTIVE_TOOLS.map((tool) => (
                <label key={tool} className="flex cursor-pointer items-start gap-4 rounded-xl border-2 border-transparent bg-slate-50 p-4 transition-all hover:bg-slate-100">
                  <input type="checkbox" aria-describedby="legend-tools" checked={formData.academic_assistive_tools.includes(tool)} onChange={() => handleMultiToggle('academic_assistive_tools', tool)} className="mt-1 size-5 accent-purple-600" />
                  <span className="text-[10px] font-bold uppercase italic leading-tight text-slate-600">{tool}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <fieldset className="rounded-[3.5rem] border-4 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(245,158,11,0.1)]">
          <legend id="legend-barriers" className="mb-6 flex items-center gap-4 px-2 text-xs font-black uppercase italic leading-none tracking-[0.2em] text-amber-600">
            <AlertTriangle size={24} aria-hidden="true" /> Hambatan Pendidikan
          </legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {EDUCATION_BARRIERS.map((barrier) => (
              <label key={barrier} className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-transparent bg-slate-50 p-4 transition-all hover:bg-slate-100">
                <input type="checkbox" aria-describedby="legend-barriers" checked={formData.education_barrier.includes(barrier)} onChange={() => handleMultiToggle('education_barrier', barrier)} className="size-5 accent-amber-600" />
                <span className="text-[10px] font-bold uppercase italic leading-tight text-slate-600">{barrier}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button 
          type="submit" 
          disabled={loading} 
          className="flex w-full items-center justify-center gap-4 rounded-[2.5rem] bg-slate-900 py-8 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? <><Loader2 className="animate-spin" size={24} /> MENYINKRONKAN DATA...</> : <><Save size={24} /> SIMPAN DATA AKADEMIK</>}
        </button>
      </form>
    </div>
  );
}