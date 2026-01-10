"use client";

import React, { useState, useCallback } from "react";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  GraduationCap, School, Save, CheckCircle2, 
  AlertCircle, Cpu, Handshake, Workflow, AlertTriangle,
  Loader2
} from "lucide-react";

// SINKRONISASI TOTAL DENGAN DATA-STATIC
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
    graduation_date: profile?.graduation_date || "",
    scholarship_type: profile?.scholarship_type || "",
    education_barrier: profile?.education_barrier || [], 
    academic_support_received: profile?.academic_support_received || [],
    academic_assistive_tools: profile?.academic_assistive_tools || [],
    study_relevance: profile?.study_relevance || "",
  });

  const handleMultiToggle = (field: string, value: string) => {
    const current = formData[field as keyof typeof formData] as string[];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await updateTalentProfile(user.id, formData);
      
      if (result.success) {
        setMessage({ type: "success", text: "Data Berhasil Disimpan. Mengalihkan ke Overview..." });
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        setMessage({ type: "error", text: `Gagal menyimpan: ${result.error || "Terjadi kesalahan sistem"}` });
        setLoading(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi database." });
      setLoading(false);
    }
  };

  const isCollege = ["Diploma (D1/D2/D3)", "Sarjana (S1 / D4)", "Magister (S2)", "Doktor (S3)"].includes(formData.education_level);

  return (
    <div className="mx-auto max-w-4xl pb-20 text-slate-900">
      {/* DATALIST - Membantu Autocomplete yang Aksesibel */}
      <datalist id="uni-list">
        {UNIVERSITIES.map((u, i) => <option key={i} value={u} />)}
      </datalist>
      <datalist id="major-list">
        {UNIVERSITY_MAJORS.map((m, i) => <option key={i} value={m} />)}
      </datalist>

      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter text-slate-900">
          <GraduationCap className="text-emerald-600" size={40} aria-hidden="true" />
          Riwayat Akademik
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">
          Data pendidikan dan identifikasi dukungan untuk riset pengembangan talenta inklusif.
        </p>
      </header>

      {/* FEEDBACK AREA - Live Region untuk Screen Reader */}
      <div role="status" aria-live="polite" className="px-4">
        {message.text && (
          <div className={`mb-8 flex items-center gap-4 rounded-[2rem] border-2 p-6 transition-all ${
            message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        
        {/* SEKSI 1: IDENTITAS INSTITUSI */}
        <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm md:p-12 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
            <School className="text-emerald-600" size={20} aria-hidden="true" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Informasi Institusi</h2>
          </div>
          
          <div className="grid gap-8 text-sm font-bold md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="edu_level" className="block ml-2 text-[10px] font-black uppercase text-slate-400">Jenjang Pendidikan</label>
              <select 
                id="edu_level" 
                required 
                value={formData.education_level} 
                onChange={(e) => setFormData({...formData, education_level: e.target.value})} 
                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none transition-all focus:border-emerald-600 focus:bg-white"
              >
                <option value="">Pilih Jenjang</option>
                {EDUCATION_LEVELS.map((l, i) => <option key={i} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="uni" className="block ml-2 text-[10px] font-black uppercase text-slate-400">
                {isCollege ? "Nama Perguruan Tinggi" : "Nama Sekolah"}
              </label>
              <input 
                id="uni" 
                list="uni-list" 
                required 
                placeholder="Ketik nama institusi..." 
                value={formData.university} 
                onChange={(e) => setFormData({...formData, university: e.target.value})} 
                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none transition-all focus:border-emerald-600 focus:bg-white" 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="major" className="block ml-2 text-[10px] font-black uppercase text-slate-400">Jurusan / Program Studi</label>
              <input 
                id="major" 
                list="major-list" 
                required 
                type="text" 
                placeholder="Contoh: Teknik Informatika" 
                value={formData.major} 
                onChange={(e) => setFormData({...formData, major: e.target.value})} 
                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none transition-all focus:border-emerald-600 focus:bg-white" 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="grad_year" className="block ml-2 text-[10px] font-black uppercase text-slate-400">Tahun Lulus / Estimasi</label>
              <input 
                id="grad_year" 
                required 
                type="number" 
                min="1960" 
                max="2035" 
                value={formData.graduation_date} 
                onChange={(e) => setFormData({...formData, graduation_date: e.target.value})} 
                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none transition-all focus:border-emerald-600 focus:bg-white" 
              />
            </div>
          </div>
        </section>

        {/* SEKSI 2: RELEVANSI BIDANG STUDI (RISK ANALYSIS) */}
        <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm md:p-12">
          <fieldset className="space-y-6">
            <legend className="mb-4 flex items-center gap-4 text-blue-600">
              <Workflow size={24} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Linearitas Studi & Karir</span>
            </legend>
            <p id="relevance-desc" className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-slate-400">
              Sejauh mana bidang studi Anda relevan dengan pekerjaan saat ini? (Data riset penempatan kerja)
            </p>
            <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-describedby="relevance-desc">
              {STUDY_RELEVANCE_LEVELS.map((level, i) => (
                <label key={i} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all ${
                  formData.study_relevance === level ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 hover:border-slate-100'
                }`}>
                  <input 
                    type="radio" 
                    name="relevance" 
                    value={level} 
                    checked={formData.study_relevance === level} 
                    onChange={(e) => setFormData({...formData, study_relevance: e.target.value})} 
                    className="size-6 accent-blue-600" 
                  />
                  <span className="text-sm font-bold uppercase italic tracking-tight text-slate-800">{level}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* SEKSI 3: AKOMODASI & TOOLS */}
        <div className="grid gap-8 md:grid-cols-2">
          <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm md:p-10">
            <fieldset className="space-y-6">
              <legend className="mb-4 flex items-center gap-4 text-emerald-700">
                <Handshake size={24} aria-hidden="true" />
                <span className="text-xs font-black uppercase tracking-tight">Dukungan Institusi</span>
              </legend>
              <div className="space-y-4">
                {ACADEMIC_SUPPORT_RECEIVED.map((item, i) => (
                  <label key={i} className="group flex cursor-pointer items-start gap-4 rounded-xl p-2 transition-all hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={formData.academic_support_received.includes(item)} 
                      onChange={() => handleMultiToggle('academic_support_received', item)} 
                      className="mt-1 size-6 accent-emerald-600" 
                    />
                    <span className="text-[10px] font-bold uppercase leading-relaxed text-slate-600 group-hover:text-slate-900">{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm md:p-10">
            <fieldset className="space-y-6">
              <legend className="mb-4 flex items-center gap-4 text-purple-700">
                <Cpu size={24} aria-hidden="true" />
                <span className="text-xs font-black uppercase tracking-tight">Teknologi Bantu Mandiri</span>
              </legend>
              <div className="space-y-4">
                {ACADEMIC_ASSISTIVE_TOOLS.map((tool, i) => (
                  <label key={i} className="group flex cursor-pointer items-start gap-4 rounded-xl p-2 transition-all hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={formData.academic_assistive_tools.includes(tool)} 
                      onChange={() => handleMultiToggle('academic_assistive_tools', tool)} 
                      className="mt-1 size-6 accent-purple-600" 
                    />
                    <span className="text-[10px] font-bold uppercase leading-relaxed text-slate-600 group-hover:text-slate-900">{tool}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
        </div>

        {/* SEKSI 4: HAMBATAN (DATA RISET BRIN) */}
        <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm md:p-12">
          <fieldset className="space-y-6">
            <legend className="mb-4 flex items-center gap-4 text-amber-600">
              <AlertTriangle size={24} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Hambatan Pendidikan</span>
            </legend>
            <p id="barrier-desc" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Identifikasi kendala akademik untuk pemetaan inklusivitas pendidikan nasional.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2" role="group" aria-describedby="barrier-desc">
              {EDUCATION_BARRIERS.map((barrier, i) => (
                <label key={i} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all ${
                  formData.education_barrier.includes(barrier) ? 'border-amber-600 bg-amber-50' : 'border-slate-50 hover:border-amber-200'
                }`}>
                  <input 
                    type="checkbox" 
                    checked={formData.education_barrier.includes(barrier)} 
                    onChange={() => handleMultiToggle('education_barrier', barrier)} 
                    className="size-6 accent-amber-600" 
                  />
                  <span className="text-[10px] font-black uppercase leading-tight text-slate-600">{barrier}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* SUBMIT BUTTON - Menghindari Stuck */}
        <div className="flex justify-end pt-6">
          <button 
            type="submit" 
            disabled={loading}
            className="flex min-w-[280px] items-center justify-center gap-4 rounded-[2.5rem] bg-slate-900 px-12 py-6 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-emerald-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {"Memproses..."}
              </>
            ) : (
              <>
                <Save size={20} aria-hidden="true" /> 
                {"Simpan Profil Akademik"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
