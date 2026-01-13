"use client";

import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  GraduationCap, School, AlertTriangle, Save, 
  CheckCircle2, AlertCircle, Handshake, Cpu, Workflow,
  ChevronDown, BookOpen, Search
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

  // Logika Smart: Cek apakah jenjang pendidikan adalah Perguruan Tinggi
  const isCollegeLevel = [
    "Diploma (D1/D2/D3)", 
    "Sarjana (S1 / D4)", 
    "Magister (S2)", 
    "Doktor (S3)"
  ].includes(formData.education_level);

  useEffect(() => {
    if (formData.university && !UNIVERSITIES.includes(formData.university)) {
      setIsCustomUni(true);
      setFormData(prev => ({ ...prev, university: "LAINNYA", manual_university: profile.university }));
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

    const finalUniversity = formData.university === "LAINNYA" ? formData.manual_university : formData.university;

    if (formData.university === "LAINNYA" && formData.manual_university) {
      await supabase.from("manual_input_logs").insert([{
        field_name: "university_name_manual",
        input_value: formData.manual_university
      }]);
    }

    const payload = {
      ...formData,
      university: finalUniversity
    };
    delete (payload as any).manual_university;

    const result = await updateTalentProfile(user.id, payload);
    
    if (result.success) {
      setMessage({ type: "success", text: "Data Akademik Sinkron! Mengalihkan..." });
      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } else {
      setMessage({ type: "error", text: `Gagal: ${result.error}` });
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
          Data riset untuk pemetaan hambatan dan dukungan pendidikan inklusif
        </p>
      </header>

      <div aria-live="assertive" className="px-4">
        {message.text && (
          <div className={`mb-8 flex items-center gap-4 rounded-[2rem] border-4 p-6 ${
            message.type === "success" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-red-500 bg-red-50 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        
        {/* SEKSI 1: DASAR PENDIDIKAN */}
        <section className="space-y-8 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
            <School size={18} /> Detail Institusi Pendidikan
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="edu_level" className="ml-2 text-[10px] font-black uppercase text-slate-400">Jenjang Terakhir</label>
              <select id="edu_level" required value={formData.education_level} onChange={(e) => setFormData({...formData, education_level: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600">
                <option value="">-- Pilih Jenjang --</option>
                {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="edu_model" className="ml-2 text-[10px] font-black uppercase text-slate-400">Model Pendidikan</label>
              <select id="edu_model" required value={formData.education_model} onChange={(e) => setFormData({...formData, education_model: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600">
                <option value="">-- Pilih Model --</option>
                {EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* LOGIKA SMART: HANYA MUNCUL JIKA KULIAH */}
            {isCollegeLevel && (
              <>
                <div className="space-y-2 animate-in fade-in duration-500">
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
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in zoom-in-95">
                      <input ref={manualUniRef} required={isCollegeLevel && isCustomUni} placeholder="Ketik Nama Kampus Lengkap..." value={formData.manual_university} onChange={(e) => setFormData({...formData, manual_university: e.target.value})} className="w-full rounded-2xl border-2 border-emerald-600 bg-white p-4 font-bold outline-none" />
                      <button type="button" onClick={() => setIsCustomUni(false)} className="text-[9px] font-black uppercase text-blue-600 underline ml-2">Kembali ke Daftar</button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 animate-in fade-in duration-500">
                  <label htmlFor="major" className="ml-2 text-[10px] font-black uppercase text-slate-400">Program Studi</label>
                  <input id="major" list="major-list" required={isCollegeLevel} placeholder="Cari atau ketik jurusan..." value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600" />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="grad_year" className="ml-2 text-[10px] font-black uppercase text-slate-400">Tahun Lulus / Estimasi</label>
              <input id="grad_year" required type="number" placeholder="Contoh: 2024" value={formData.graduation_date} onChange={(e) => setFormData({...formData, graduation_date: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600" />
            </div>

            <div className="space-y-2">
              <label htmlFor="scholarship" className="ml-2 text-[10px] font-black uppercase text-slate-400">Tipe Pembiayaan</label>
              <select id="scholarship" value={formData.scholarship_type} onChange={(e) => setFormData({...formData, scholarship_type: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-emerald-600">
                <option value="">Biaya Mandiri</option>
                {SCHOLARSHIP_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* SEKSI 2: LINEARITAS (HIDDEN IF NOT COLLEGE) */}
        {isCollegeLevel && (
          <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] animate-in slide-in-from-bottom-2">
            <h3 className="mb-6 flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              <Workflow size={24} /> Linearitas Bidang Studi & Karier
            </h3>
            <p className="mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Sejauh mana ilmu di bangku kuliah relevan dengan pekerjaan Anda?</p>
            <div className="grid grid-cols-1 gap-3">
              {STUDY_RELEVANCE_LEVELS.map((level) => (
                <label key={level} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all ${formData.study_relevance === level ? 'border-blue-600 bg-blue-50' : 'border-slate-50 hover:border-slate-100'}`}>
                  <input type="radio" name="relevance" value={level} checked={formData.study_relevance === level} onChange={(e) => setFormData({...formData, study_relevance: e.target.value})} className="size-6 accent-blue-600" />
                  <span className="text-sm font-bold uppercase italic text-slate-800">{level}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* SEKSI 3: DUKUNGAN & TOOLS (SANGAT PENTING UNTUK RISET) */}
        <div className="grid gap-10 md:grid-cols-2">
          <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-tight text-emerald-700">
              <Handshake size={24} /> Dukungan dari Institusi
            </h3>
            <div className="space-y-3">
              {ACADEMIC_SUPPORT_RECEIVED.map((item) => (
                <label key={item} className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${formData.academic_support_received.includes(item) ? 'border-emerald-600 bg-emerald-50' : 'border-transparent bg-slate-50'}`}>
                  <input type="checkbox" checked={formData.academic_support_received.includes(item)} onChange={() => handleMultiToggle('academic_support_received', item)} className="mt-1 size-5 accent-emerald-600" />
                  <span className="text-[10px] font-bold uppercase leading-tight text-slate-600">{item}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-tight text-purple-700">
              <Cpu size={24} /> Teknologi Asistif Mandiri
            </h3>
            <div className="space-y-3">
              {ACADEMIC_ASSISTIVE_TOOLS.map((tool) => (
                <label key={tool} className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${formData.academic_assistive_tools.includes(tool) ? 'border-purple-600 bg-purple-50' : 'border-transparent bg-slate-50'}`}>
                  <input type="checkbox" checked={formData.academic_assistive_tools.includes(tool)} onChange={() => handleMultiToggle('academic_assistive_tools', tool)} className="mt-1 size-5 accent-purple-600" />
                  <span className="text-[10px] font-bold uppercase leading-tight text-slate-600">{tool}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* SEKSI 4: HAMBATAN (MULTIPLE) */}
        <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(217,119,6,0.2)]">
          <h3 className="mb-6 flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-amber-600">
            <AlertTriangle size={24} /> Hambatan Selama Pendidikan
          </h3>
          <p className="mb-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Pilih satu atau lebih kendala yang pernah Anda hadapi:</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-left">
            {EDUCATION_BARRIERS.map((barrier) => (
              <label key={barrier} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all ${formData.education_barrier.includes(barrier) ? 'border-amber-600 bg-amber-50' : 'border-slate-50 hover:border-amber-200'}`}>
                <input type="checkbox" checked={formData.education_barrier.includes(barrier)} onChange={() => handleMultiToggle('education_barrier', barrier)} className="size-6 accent-amber-600" />
                <span className="text-[10px] font-black uppercase leading-tight text-slate-600">{barrier}</span>
              </label>
            ))}
          </div>
        </section>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-4 rounded-[2.5rem] bg-slate-900 py-7 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-emerald-600 disabled:opacity-50">
          {loading ? "MENYINKRONKAN DATA..." : <><Save size={20} /> SIMPAN PROFIL RISET AKADEMIK</>}
        </button>
      </form>
    </div>
  );
}
