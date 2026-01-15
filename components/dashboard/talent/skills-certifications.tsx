"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase"; 
// JANGAN ADA IMPORT DARI @/lib/actions/talent DI SINI
import { 
  Award, Cpu, CheckCircle2, AlertCircle, Save, 
  Plus, X, Zap, Trash2, Link as LinkIcon, ChevronDown, BadgeCheck,
  Download, Loader2, Lock
} from "lucide-react";
import { generateGraduationCertificate } from "../partner/certificate-helper";

import { 
  SKILLS_LIST, 
  GOVERNMENT_AGENCIES_LIST, 
  TRAINING_PARTNERS, 
  NONPROFIT_ORG_LIST,
  UNIVERSITIES
} from "@/lib/data-static";

interface SkillsCertificationsProps {
  user: any;
  profile: any;
  onSuccess?: () => void;
}

export default function SkillsCertifications({ user, profile, onSuccess }: SkillsCertificationsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [globalSkills, setGlobalSkills] = useState<string[]>(profile?.skills || []);
  const [certs, setCerts] = useState<any[]>([]);
  const [selectedSkillFromList, setSelectedSkillFromList] = useState("");
  
  const feedbackRef = useRef<HTMLDivElement>(null);
  const certNameRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const ALL_INSTITUTIONS = [
    ...TRAINING_PARTNERS,
    ...UNIVERSITIES,
    ...GOVERNMENT_AGENCIES_LIST,
    ...NONPROFIT_ORG_LIST
  ].sort();

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const { data } = await supabase
          .from("certifications")
          .select(`
            *,
            trainings (
              id, title, syllabus, provided_skills, total_hours, start_date, end_date
            )
          `)
          .eq("profile_id", user.id)
          .order("year", { ascending: false });
        if (data) setCerts(data);
      } catch (err) {
        console.error("Error load data:", err);
      }
    };
    if (user?.id) fetchCerts();
  }, [user.id]);

  const addSkill = (skillName: string) => {
    if (skillName && !globalSkills.includes(skillName)) {
      setGlobalSkills([...globalSkills, skillName]);
      setSelectedSkillFromList("");
    }
  };

  const addCertsItem = () => {
    const newId = `temp-${Date.now()}`;
    const newItem = {
      id: newId,
      name: "",
      organizer_name: "",
      manual_organizer: "",
      year: new Date().getFullYear().toString(),
      certificate_url: "",
      is_verified: false,
      training_id: null
    };
    setCerts([newItem, ...certs]);
    setTimeout(() => certNameRefs.current[newId]?.focus(), 100);
  };

  const updateCertField = (id: string, field: string, value: any) => {
    setCerts(certs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCert = async (id: string, isVerified: boolean) => {
    if (isVerified) return;
    if (id.toString().startsWith("temp-")) {
      setCerts(certs.filter(c => c.id !== id));
      return;
    }
    if (!confirm("Hapus riwayat sertifikasi ini secara permanen?")) return;
    const { error } = await supabase.from("certifications").delete().eq("id", id);
    if (!error) setCerts(certs.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. UPDATE PROFILE (SKILLS) - DIRECT CALL
      const { error: pError } = await supabase
        .from("profiles")
        .update({ 
          skills: globalSkills,
          updated_at: new Date().toISOString() 
        })
        .eq("id", user.id);

      if (pError) throw pError;

      // 2. UPDATE/INSERT CERTIFICATIONS
      for (const cert of certs) {
        if (cert.is_verified) continue; 

        const isTemp = cert.id.toString().startsWith("temp-");
        const finalOrganizer = cert.organizer_name === "LAINNYA" ? cert.manual_organizer : cert.organizer_name;
        
        // Log manual input via RPC (Cara modul Career)
        if (cert.organizer_name === "LAINNYA" && cert.manual_organizer) {
          await supabase.rpc('log_manual_input', { 
            f_name: 'organizer_manual', 
            i_value: cert.manual_organizer 
          });
        }

        const payload = { 
          name: cert.name,
          organizer_name: finalOrganizer,
          year: cert.year,
          certificate_url: cert.certificate_url,
          profile_id: user.id 
        };

        if (isTemp) {
          await supabase.from("certifications").insert([payload]);
        } else {
          await supabase.from("certifications").update(payload).eq("id", cert.id);
        }
      }

      setMessage({ type: "success", text: "Keahlian & Sertifikasi Berhasil Disinkronkan!" });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => feedbackRef.current?.focus(), 100);
      if (onSuccess) setTimeout(onSuccess, 1500);

    } catch (error: any) {
      setMessage({ type: "error", text: `GAGAL DISIMPAN. DETAIL: ${error.message.toUpperCase()}` });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => feedbackRef.current?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-20 text-slate-900">
      <header className="mb-10 px-4 text-left">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter leading-none">
          <Zap className="text-purple-600" size={36} /> Keahlian & Pelatihan
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">
          Data kompetensi untuk memperkuat relevansi karir dalam ekosistem riset
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
        <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-6">
          <div className="flex items-center gap-3 text-purple-600">
            <Cpu size={24} aria-hidden="true" />
            <h2 id="skills-heading" className="text-xs font-black uppercase tracking-[0.2em]">Keahlian Utama</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="skill-selector" className="ml-2 text-[10px] font-black uppercase text-slate-400">Tambah Keahlian</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <select 
                    id="skill-selector"
                    aria-describedby="skills-heading"
                    className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-purple-600"
                    value={selectedSkillFromList}
                    onChange={(e) => setSelectedSkillFromList(e.target.value)}
                  >
                    <option value="">-- Pilih dari Daftar Keahlian --</option>
                    {SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
                <button 
                  type="button"
                  aria-label="Klik untuk menambahkan keahlian yang dipilih"
                  onClick={() => addSkill(selectedSkillFromList)}
                  className="rounded-2xl bg-purple-600 px-8 text-white shadow-lg transition-all hover:bg-slate-900 focus:ring-4 focus:ring-purple-100"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2" role="list" aria-label="Daftar keahlian anda">
              {globalSkills.length > 0 ? globalSkills.map(s => (
                <span key={s} role="listitem" className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase text-white animate-in zoom-in">
                  {s}
                  <button 
                    type="button" 
                    aria-label={`Hapus keahlian ${s}`}
                    onClick={() => setGlobalSkills(globalSkills.filter(x => x !== s))} 
                    className="transition-colors hover:text-red-400"
                  >
                    <X size={14}/>
                  </button>
                </span>
              )) : (
                <p className="text-[10px] font-bold uppercase italic text-slate-300">Belum ada keahlian yang ditambahkan</p>
              )}
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 id="certs-heading" className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
              <Award className="text-amber-500" size={20} /> Sertifikasi & Pelatihan
            </h2>
            <button 
              type="button" 
              onClick={addCertsItem} 
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase text-white shadow-xl hover:bg-slate-900 transition-all focus:ring-4 focus:ring-blue-100"
            >
              <Plus size={16} /> Tambah Manual
            </button>
          </div>

          <div className="space-y-10">
            {certs.length > 0 ? certs.map((cert, index) => (
              <fieldset 
                key={cert.id} 
                className={`relative rounded-[3rem] border-4 p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-8 animate-in slide-in-from-top-4 ${
                  cert.is_verified ? 'border-emerald-500 bg-white' : 'border-slate-900 bg-white'
                }`}
              >
                <legend className="sr-only">Data Sertifikat #{certs.length - index}</legend>
                <div className="flex items-center justify-between border-b-2 border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase italic text-slate-300">Item #{certs.length - index}</span>
                    {cert.is_verified && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[8px] font-black uppercase text-emerald-600 border border-emerald-100">
                        <BadgeCheck size={12} /> Terverifikasi
                      </span>
                    )}
                  </div>
                  {!cert.is_verified && (
                    <button 
                      type="button" 
                      aria-label={`Hapus sertifikat ${index + 1}`}
                      onClick={() => removeCert(cert.id, cert.is_verified)} 
                      className="text-slate-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor={`cert-name-${cert.id}`} className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                      Judul Pelatihan {cert.is_verified && <Lock size={10} />}
                    </label>
                    <input 
                      id={`cert-name-${cert.id}`}
                      disabled={cert.is_verified}
                      aria-describedby="certs-heading"
                      ref={(el) => { certNameRefs.current[cert.id] = el; }}
                      value={cert.name}
                      onChange={(e) => updateCertField(cert.id, "name", e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 disabled:opacity-70"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`cert-org-${cert.id}`} className="ml-2 text-[10px] font-black uppercase text-slate-400 italic">Penyelenggara</label>
                    <div className="relative">
                      <select 
                        id={`cert-org-${cert.id}`}
                        disabled={cert.is_verified}
                        value={cert.organizer_name}
                        onChange={(e) => updateCertField(cert.id, "organizer_name", e.target.value)}
                        className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 disabled:opacity-70"
                      >
                        <option value="">-- Pilih Penyelenggara --</option>
                        {ALL_INSTITUTIONS.map(inst => (
                          <option key={inst} value={inst}>{inst}</option>
                        ))}
                        <option value="LAINNYA" className="text-blue-600 font-black italic">+ LAINNYA (INPUT MANUAL)</option>
                      </select>
                      {!cert.is_verified && <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`cert-year-${cert.id}`} className="ml-2 text-[10px] font-black uppercase text-slate-400 italic">Tahun</label>
                    <input 
                      id={`cert-year-${cert.id}`}
                      disabled={cert.is_verified}
                      type="number"
                      value={cert.year}
                      onChange={(e) => updateCertField(cert.id, "year", e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 disabled:opacity-70"
                    />
                  </div>

                  {cert.organizer_name === "LAINNYA" && !cert.is_verified && (
                    <div className="space-y-2 md:col-span-2 animate-in zoom-in-95">
                      <label htmlFor={`cert-manual-${cert.id}`} className="ml-2 text-[10px] font-black uppercase italic text-blue-600">Nama Lembaga Baru</label>
                      <input 
                        id={`cert-manual-${cert.id}`}
                        value={cert.manual_organizer}
                        onChange={(e) => updateCertField(cert.id, "manual_organizer", e.target.value)}
                        className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 font-bold outline-none focus:border-blue-600 shadow-inner"
                        placeholder="Ketik nama lengkap..."
                      />
                    </div>
                  )}
                </div>
              </fieldset>
            )) : (
              <div className="rounded-[3rem] border-4 border-dashed border-slate-100 py-20 text-center">
                <p className="text-[10px] font-black uppercase italic text-slate-300">Belum ada riwayat sertifikasi</p>
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="flex w-full items-center justify-center gap-4 rounded-[2.5rem] bg-slate-900 py-8 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={24} /> MENYINKRONKAN DATA...</>
          ) : (
            <><Save size={24} /> SIMPAN SEMUA PERUBAHAN</>
          )}
        </button>
      </form>
    </div>
  );
}