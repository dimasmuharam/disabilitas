"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  Award, Cpu, CheckCircle2, AlertCircle, Save, 
  Plus, X, Zap, Trash2, Link as LinkIcon, ChevronDown, BadgeCheck,
  Download, ExternalLink, Lock
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
    setTimeout(() => {
      certNameRefs.current[newId]?.focus();
    }, 100);
  };

  const updateCertField = (id: string, field: string, value: any) => {
    setCerts(certs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCert = async (id: string, isVerified: boolean) => {
    if (isVerified) {
      alert("Sertifikat yang telah diverifikasi platform tidak dapat dihapus manual.");
      return;
    }
    if (id.toString().startsWith("temp-")) {
      setCerts(certs.filter(c => c.id !== id));
      return;
    }
    if (!confirm("Hapus riwayat pelatihan ini?")) return;
    const { error } = await supabase.from("certifications").delete().eq("id", id);
    if (!error) setCerts(certs.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Update Profile (Skills)
      await updateTalentProfile(user.id, { 
        skills: globalSkills 
      });

      // 2. Update/Insert Certifications (Hanya yang tidak verified)
      for (const cert of certs) {
        if (cert.is_verified) continue; 

        const isTemp = cert.id.toString().startsWith("temp-");
        const finalOrganizer = cert.organizer_name === "LAINNYA" ? cert.manual_organizer : cert.organizer_name;
        
        // Log manual input
        if (cert.organizer_name === "LAINNYA" && cert.manual_organizer) {
          await supabase.from("manual_input_logs").insert([{
            field_name: "organizer_name",
            input_value: cert.manual_organizer
          }]);
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

      setMessage({ type: "success", text: "Data Berhasil Disimpan!" });
      if (onSuccess) setTimeout(onSuccess, 1500);
    } catch (error: any) {
      setMessage({ type: "error", text: `Gagal: ${error.message}` });
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
        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
          Validasi kompetensi untuk memperkuat profil riset Anda
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        {/* SKILLS SECTION */}
        <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-6">
          <div className="flex items-center gap-3 text-purple-600">
            <Cpu size={24} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Keahlian Utama</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <select 
                  className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-purple-600"
                  value={selectedSkillFromList}
                  onChange={(e) => setSelectedSkillFromList(e.target.value)}
                >
                  <option value="">-- Pilih Keahlian --</option>
                  {SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
              <button 
                type="button"
                onClick={() => addSkill(selectedSkillFromList)}
                className="rounded-2xl bg-purple-600 px-8 text-white shadow-lg transition-all hover:bg-slate-900"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {globalSkills.map(s => (
                <span key={s} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase text-white animate-in zoom-in">
                  {s}
                  <button type="button" onClick={() => setGlobalSkills(globalSkills.filter(x => x !== s))} className="hover:text-red-400">
                    <X size={14}/>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CERTIFICATIONS SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
              <Award className="text-amber-500" size={20} /> Sertifikasi & Pelatihan
            </h2>
            <button 
              type="button" 
              onClick={addCertsItem} 
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase text-white shadow-xl hover:bg-slate-900 transition-all"
            >
              <Plus size={16} /> Tambah Manual
            </button>
          </div>

          <div className="space-y-10">
            {certs.map((cert, index) => (
              <section 
                key={cert.id} 
                className={`relative rounded-[3rem] border-4 p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-8 animate-in slide-in-from-top-4 ${
                  cert.is_verified ? 'border-emerald-500 bg-white' : 'border-slate-900 bg-white'
                }`}
              >
                {/* Header Card */}
                <div className="flex items-center justify-between border-b-2 border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase italic text-slate-300">Item #{certs.length - index}</span>
                    {cert.is_verified ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[8px] font-black uppercase text-emerald-600 border border-emerald-100">
                        <BadgeCheck size={12} /> Terverifikasi Platform
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[8px] font-black uppercase text-slate-400">
                        Input Manual
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {cert.is_verified && cert.training_id && (
                      <button 
                        type="button"
                        onClick={() => generateGraduationCertificate({ ...cert, profiles: profile }, cert.organizer_name)}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[9px] font-black uppercase text-white hover:bg-blue-600 transition-all"
                      >
                        <Download size={14} /> Cetak Sertifikat (JP)
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => removeCert(cert.id, cert.is_verified)} 
                      className={`${cert.is_verified ? 'text-slate-100 cursor-not-allowed' : 'text-slate-300 hover:text-red-600'} transition-colors`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                      Judul Pelatihan {cert.is_verified && <Lock size={10} />}
                    </label>
                    <input 
                      disabled={cert.is_verified}
                      ref={(el) => { certNameRefs.current[cert.id] = el; }}
                      value={cert.name}
                      onChange={(e) => updateCertField(cert.id, "name", e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Penyelenggara</label>
                    <div className="relative">
                      <select 
                        disabled={cert.is_verified}
                        value={cert.organizer_name}
                        onChange={(e) => updateCertField(cert.id, "organizer_name", e.target.value)}
                        className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 disabled:bg-slate-50"
                      >
                        <option value="">-- Pilih Penyelenggara --</option>
                        {ALL_INSTITUTIONS.map(inst => (
                          <option key={inst} value={inst}>{inst}</option>
                        ))}
                        <option value="LAINNYA" className="text-blue-600 font-black italic">+ LEMBAGA LAINNYA</option>
                      </select>
                      {!cert.is_verified && <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Tahun</label>
                    <input 
                      disabled={cert.is_verified}
                      type="number"
                      value={cert.year}
                      onChange={(e) => updateCertField(cert.id, "year", e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 disabled:bg-slate-50"
                    />
                  </div>

                  {cert.organizer_name === "LAINNYA" && !cert.is_verified && (
                    <div className="space-y-2 md:col-span-2 animate-in zoom-in-95">
                      <label className="ml-2 text-[10px] font-black uppercase italic text-blue-600">Input Lembaga Baru</label>
                      <input 
                        value={cert.manual_organizer}
                        onChange={(e) => updateCertField(cert.id, "manual_organizer", e.target.value)}
                        className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 font-bold outline-none focus:border-blue-600"
                        placeholder="Ketik nama lengkap lembaga..."
                      />
                    </div>
                  )}

                  {!cert.is_verified && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                        <LinkIcon size={12} /> Tautan Sertifikat (Cloud / Google Drive)
                      </label>
                      <input 
                        type="url"
                        value={cert.certificate_url}
                        onChange={(e) => updateCertField(cert.id, "certificate_url", e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                      />
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>

        {message.text && (
          <div className={`rounded-2xl border-2 p-4 text-center text-[10px] font-black uppercase animate-in zoom-in-95 ${message.type === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-red-100 bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="flex w-full items-center justify-center gap-4 rounded-[2.5rem] bg-slate-900 py-6 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Menghubungkan Database..." : <><Save size={20} /> Simpan Seluruh Perubahan</>}
        </button>
      </form>
    </div>
  );
}