"use client";

import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  GraduationCap, School, AlertTriangle, Save, 
  CheckCircle2, AlertCircle, Handshake, Cpu, Workflow,
  ChevronDown
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
  const [isCustomUni, setIsCustomUni] = useState(false);
  
  const manualUniRef = useRef<HTMLInputElement>(null);

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
    manual_university: "" 
  });

  const isCollegeLevel = [
    "Diploma (D1/D2/D3)", 
    "Sarjana (S1 / D4)", 
    "Magister (S2)", 
    "Doktor (S3)"
  ].includes(formData.education_level);

  useEffect(() => {
    if (formData.university && !UNIVERSITIES.includes(formData.university)) {
      setIsCustomUni(true);
      setFormData(prev => ({ ...prev, university: "LAINNYA", manual_university: formData.university }));
    }
  }, []);

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

    try {
      const finalUniversity = formData.university === "LAINNYA" ? formData.manual_university : formData.university;

      // Log manual input jika user mengisi kampus baru
      if (formData.university === "LAINNYA" && formData.manual_university) {
        await supabase.from("manual_input_logs").insert([{
          field_name: "university_name_manual",
          input_value: formData.manual_university
        }]);
      }

      // PREPARASI DATA SESUAI SKEMA TABLE `public.profiles`
      const payload = {
        education_level: formData.education_level,
        education_model: formData.education_model,
        university: finalUniversity,
        major: formData.major,
        // graduat_date di SQL Mas adalah INTEGER
        graduation_date: formData.graduation_date ? parseInt(formData.graduation_date.toString()) : null,
        scholarship_type: formData.scholarship_type,
        // Kolom Array di SQL Mas
        education_barrier: Array.isArray(formData.education_barrier) ? formData.education_barrier : [],
        academic_support_received: Array.isArray(formData.academic_support_received) ? formData.academic_support_received : [],
        academic_assistive_tools: Array.isArray(formData.academic_assistive_tools) ? formData.academic_assistive_tools : [],
        study_relevance: formData.study_relevance,
      };

      // Kita gunakan try-catch blok untuk handle action, karena format respons tidak pasti
      const result: any = await updateTalentProfile(user.id, payload);
      
      // Jika result undefined atau tidak punya properti success, kita asumsikan jika tidak throw error berarti berhasil
      // Namun kita cek tipikal respons action:
      if (result?.error) throw new Error(result.error);

      setMessage({ type: "success", text: "Integrasi Data Akademik Berhasil Disinkronkan!" });
      if (onSuccess) setTimeout(onSuccess, 1500);

    } catch (error: any) {
      console.error("Sinkronisasi Gagal:", error);
      setMessage({ type: "error", text: `Error: ${error.message || "Terjadi kesalahan sistem"}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-20 text-slate-900">
      <datalist id="major-list">
        {UNIVERSITY_MAJORS.map((m, i) => <option key={i} value={m} />)}
      </datalist>

      <header className="mb-10 px-4 text-left">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter">
          <GraduationCap className="text-emerald-600" size={36} /> Riwayat Akademik
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">
          Data riset inklusi pendidikan nasional v2026
        </p>
      </header>

      <div aria-live="polite" className="px-4">
        {message.text && (
          <div className={`mb-8 flex items-center gap-4 rounded-[2rem] border-4 p-6 ${
            message.type === "success" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-red-500 bg-red-50 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        
        {/* SEKSI 1: IDENTITAS INSTITUSI */}
        <section className="space-y-8 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-600 italic">
            <School size={18} /> Informasi Institusi Pendidikan
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2 text-left">
              <label htmlFor="edu_level" className="ml-2 text-[10px] font-black uppercase text-slate-400">Jenjang Pendidikan</label>
              <select id="edu_level" required value={formData.education_level} onChange={(e) => setFormData({...formData, education_level: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600">
                <option value="">-- Pilih Jenjang --</option>
                {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="space-y-2 text-left">
              <label htmlFor="edu_model" className="ml-2 text-[10px] font-black uppercase text-slate-400">Model Pendidikan</label>
              <select id="edu_model" required value={formData.education_model} onChange={(e) => setFormData({...formData, education_model: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600">
                <option value="">-- Pilih Model --</option>
                {EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {isCollegeLevel && (
              <>
                <div className="space-y-2 text-left animate-in fade-in">
                  <label htmlFor="uni" className="ml-2 text-[10px] font-black uppercase text-slate-400">Nama Perguruan Tinggi</label>
                  {!isCustomUni ? (
                    <div className="relative">
                      <select id="uni" required={isCollegeLevel} value={formData.university} 
                        onChange={(e) => {
                          if (e.target.value === "LAINNYA") {
                            setIsCustomUni(true);
                            setFormData({...formData, university: "LAINNYA", manual_university: ""});
                            setTimeout(() => manualUniRef.current?.focus(), 100);
                          } else {
                            setFormData({...formData, university: e.target.value});
                          }
                        }} 
                        className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600"
                      >
                        <option value="">-- Pilih Kampus --</option>
                        {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                        <option value="LAINNYA" className="text-blue-600 font-black italic">+ KAMPUS TIDAK ADA DI LIST</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in zoom-in-95">
                      <input ref={manualUniRef} required={isCollegeLevel && isCustomUni} placeholder="Ketik Nama Kampus..." value={formData.manual_university} onChange={(e) => setFormData({...formData, manual_university: e.target.value})} className="w-full rounded-2xl border-2 border-emerald-600 bg-white p-4 font-bold outline-none" />
                      <button type="button" onClick={() => setIsCustomUni(false)} className="text-[9px] font-black uppercase text-blue-600 underline">Kembali ke Daftar</button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-left animate-in fade-in">
                  <label htmlFor="major" className="ml-2 text-[10px] font-black uppercase text-slate-400">Program Studi / Jurusan</label>
                  <input id="major" list="major-list" required={isCollegeLevel} placeholder="Autocomplete Jurusan..." value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600" />
                </div>
              </>
            )}

            <div className="space-y-2 text-left">
              <label htmlFor="grad_year" className="ml-2 text-[10px] font-black uppercase text-slate-400">Tahun Lulus (Format: YYYY)</label>
              <input id="grad_year" required type="number" placeholder="2024" value={formData.graduation_date} onChange={(e) => setFormData({...formData, graduation_date: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600" />
            </div>

            <div className="space-y-2 text-left">
              <label htmlFor="scholarship" className="ml-2 text-[10px] font-black uppercase text-slate-400">Tipe Pembiayaan</label>
              <select id="scholarship" value={formData.scholarship_type} onChange={(e) => setFormData({...formData, scholarship_type: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600">
                <option value="">Biaya Mandiri</option>
                {SCHOLARSHIP_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* SEKSI 2: RELEVANSI (RADIO) */}
        {isCollegeLevel && (
          <fieldset className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] animate-in slide-in-from-bottom-2 text-left">
            <legend className="sr-only">Linearitas Bidang Studi & Karier</legend>
            <h3 id="relevance-title" className="mb-6 flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-blue-600 italic">
              <Workflow size={24} /> Linearitas Bidang Studi & Karier
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {STUDY_RELEVANCE_LEVELS.map((level, idx) => (
                <label key={level} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all focus-within:ring-4 focus-within:ring-blue-100 ${formData.study_relevance === level ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-slate-50 hover:border-slate-300'}`}>
                  <input 
                    type="radio" 
                    name="relevance" 
                    aria-labelledby={`relevance-title relevance-opt-${idx}`}
                    value={level} 
                    checked={formData.study_relevance === level} 
                    onChange={(e) => setFormData({...formData, study_relevance: e.target.value})} 
                    className="size-5 accent-blue-600" 
                  />
                  <span id={`relevance-opt-${idx}`} className="text-sm font-bold uppercase italic text-slate-800">{level}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* SEKSI 3: DUKUNGAN & TOOLS (MULTI-CHECKBOX) */}
        <div className="grid gap-10 md:grid-cols-2">
          <fieldset className="rounded-[3rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] text-left">
            <legend className="sr-only">Dukungan dari Institusi</legend>
            <h3 id="support-title" className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-tight text-emerald-700 italic">
              <Handshake size={24} /> Dukungan dari Institusi
            </h3>
            <div className="space-y-3">
              {ACADEMIC_SUPPORT_RECEIVED.map((item, idx) => (
                <label key={item} className="flex cursor-pointer items-start gap-4 rounded-xl border-2 border-transparent bg-slate-50 p-4 transition-all hover:bg-slate-100 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
                  <input 
                    type="checkbox" 
                    aria-labelledby={`support-title support-opt-${idx}`}
                    checked={formData.academic_support_received.includes(item)} 
                    onChange={() => handleMultiToggle('academic_support_received', item)} 
                    className="mt-1 size-5 rounded border-gray-300 accent-emerald-600 outline-none" 
                  />
                  <span id={`support-opt-${idx}`} className="text-[10px] font-bold uppercase leading-tight text-slate-600">{item}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-[3rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] text-left">
            <legend className="sr-only">Teknologi Asistif Mandiri</legend>
            <h3 id="tech-title" className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-tight text-purple-700 italic">
              <Cpu size={24} /> Teknologi Asistif Mandiri
            </h3>
            <div className="space-y-3">
              {ACADEMIC_ASSISTIVE_TOOLS.map((tool, idx) => (
                <label key={tool} className="flex cursor-pointer items-start gap-4 rounded-xl border-2 border-transparent bg-slate-50 p-4 transition-all hover:bg-slate-100 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-100">
                  <input 
                    type="checkbox" 
                    aria-labelledby={`tech-title tech-opt-${idx}`}
                    checked={formData.academic_assistive_tools.includes(tool)} 
                    onChange={() => handleMultiToggle('academic_assistive_tools', tool)} 
                    className="mt-1 size-5 rounded border-gray-300 accent-purple-600 outline-none" 
                  />
                  <span id={`tech-opt-${idx}`} className="text-[10px] font-bold uppercase leading-tight text-slate-600">{tool}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* SEKSI 4: HAMBATAN */}
        <fieldset className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(217,119,6,0.15)] text-left">
          <legend className="sr-only">Hambatan Selama Pendidikan</legend>
          <h3 id="barrier-title" className="mb-6 flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-amber-600 italic">
            <AlertTriangle size={24} /> Hambatan Selama Pendidikan
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {EDUCATION_BARRIERS.map((barrier, idx) => (
              <label key={barrier} className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-transparent bg-slate-50 p-4 transition-all hover:bg-slate-100 focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-100">
                <input 
                  type="checkbox" 
                  aria-labelledby={`barrier-title barrier-opt-${idx}`}
                  checked={formData.education_barrier.includes(barrier)} 
                  onChange={() => handleMultiToggle('education_barrier', barrier)} 
                  className="size-5 rounded border-gray-300 accent-amber-600 outline-none" 
                />
                <span id={`barrier-opt-${idx}`} className="text-[10px] font-black uppercase leading-tight text-slate-600">{barrier}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-4 rounded-[2.5rem] bg-slate-900 py-8 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-emerald-600 disabled:opacity-50">
          {loading ? "MENYINKRONKAN DATABASE..." : <><Save size={20} /> SIMPAN PROFIL AKADEMIK</>}
        </button>
      </form>
    </div>
  );
}
