"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  Award, Cpu, CheckCircle2, AlertCircle, Save, 
  Plus, X, Zap, Trash2, Microscope, Link as LinkIcon, Search
} from "lucide-react";

import { 
  SKILLS_LIST, 
  GOVERNMENT_AGENCIES_LIST, 
  TRAINING_PARTNERS, 
  NONPROFIT_ORG_LIST,
  UNIVERSITIES,
  SKILL_ACQUISITION_METHODS,
  TRAINING_ACCESSIBILITY_SCORES,
  SKILL_IMPACT_LEVELS,
  TRAINING_ORGANIZER_CATEGORIES
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
  const [newGlobalSkill, setNewGlobalSkill] = useState("");
  const [researchData, setResearchData] = useState({
    skill_acquisition_method: profile?.skill_acquisition_method || "",
    training_accessibility_rating: profile?.training_accessibility_rating || "",
    skill_impact_rating: profile?.skill_impact_rating || ""
  });

  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const { data } = await supabase
          .from("certifications")
          .select("*")
          .eq("profile_id", user.id)
          .order("year", { ascending: false });
        if (data) setCerts(data);
      } catch (err) {
        console.error("Error load data pelatihan:", err);
      }
    };
    if (user?.id) fetchCerts();
  }, [user.id]);

  const addCertsItem = () => {
    const newItem = {
      id: `temp-${Date.now()}`,
      name: "",
      organizer_category: "",
      organizer_name: "",
      manual_organizer: "", // Untuk menampung input manual jika "Lainnya"
      year: new Date().getFullYear().toString(),
      certificate_url: "",
      is_verified: false
    };
    setCerts([newItem, ...certs]);
  };

  const updateCertField = (id: string, field: string, value: any) => {
    setCerts(certs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCert = async (id: string) => {
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
      await updateTalentProfile(user.id, { 
        skills: globalSkills,
        ...researchData 
      });

      for (const cert of certs) {
        const isTemp = cert.id.toString().startsWith("temp-");
        // Jika pilih lainnya, gunakan manual_organizer sebagai nama
        const finalOrganizer = cert.organizer_name === "LAINNYA" ? cert.manual_organizer : cert.organizer_name;
        
        const { id, manual_organizer, ...certData } = cert;
        const payload = { ...certData, organizer_name: finalOrganizer, profile_id: user.id };

        // Logika mencatat input manual untuk riset Super Admin
        if (cert.organizer_name === "LAINNYA" && cert.manual_organizer) {
          await supabase.from("manual_input_logs").insert([{
            field_name: "organizer_name",
            input_value: cert.manual_organizer
          }]);
        }

        if (isTemp) {
          await supabase.from("certifications").insert([payload]);
        } else {
          await supabase.from("certifications").update(payload).eq("id", id);
        }
      }

      setMessage({ type: "success", text: "Data Berhasil Disinkronisasi!" });
      setTimeout(() => { if (onSuccess) onSuccess(); }, 2000);
    } catch (error: any) {
      setMessage({ type: "error", text: `Gagal: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk mendapatkan list institusi berdasarkan kategori
  const getInstitutionList = (category: string) => {
    let list: string[] = [];
    if (category === "Pemerintah") list = GOVERNMENT_AGENCIES_LIST;
    else if (category === "Perguruan Tinggi") list = UNIVERSITIES;
    else if (category === "Mitra Pelatihan (LKP/LPK)") list = TRAINING_PARTNERS;
    else if (category === "Organisasi / Komunitas Disabilitas") list = NONPROFIT_ORG_LIST;
    
    return [...list, "LAINNYA"];
  };

  return (
    <div className="mx-auto max-w-4xl pb-20 font-sans text-slate-900">
      <div className="sr-only" aria-live="polite">{message.text}</div>

      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter text-slate-900">
          <Zap className="text-purple-600" size={36} aria-hidden="true" />
          Keahlian & Pelatihan
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">
          Gunakan daftar resmi untuk validasi riset nasional
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        
        {/* SKILLS SECTION */}
        <section className="space-y-6 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <div className="flex items-center gap-3 text-purple-600">
            <Cpu size={20} aria-hidden="true" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Keahlian Utama</h2>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="skill_input" className="sr-only">Tambah Keahlian</label>
              <select 
                id="skill_input"
                value={newGlobalSkill}
                onChange={(e) => {
                   if(e.target.value) {
                     setGlobalSkills([...globalSkills, e.target.value]);
                     setNewGlobalSkill("");
                   }
                }}
                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold outline-none focus:border-purple-600"
              >
                <option value="">+ Pilih Keahlian dari Daftar Resmi</option>
                {SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="list">
            {globalSkills.map(s => (
              <span key={s} role="listitem" className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase text-white shadow-lg">
                {s} 
                <button type="button" onClick={() => setGlobalSkills(globalSkills.filter(x => x !== s))} aria-label={`Hapus ${s}`}>
                  <X size={14}/>
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* RIWAYAT PELATIHAN */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
              <Award className="text-amber-500" size={20} /> Riwayat Sertifikasi
            </h2>
            <button 
              type="button" 
              onClick={addCertsItem}
              className="group flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase text-white shadow-xl transition-all hover:bg-slate-900"
            >
              <Plus size={16} /> Tambah Data
            </button>
          </div>

          <div className="space-y-8">
            {certs.map((cert, index) => (
              <section key={cert.id} className="relative space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm animate-in slide-in-from-top-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                   <span className="text-[10px] font-black uppercase text-slate-300">Data Pelatihan #{certs.length - index}</span>
                   <button type="button" onClick={() => removeCert(cert.id)} className="text-slate-300 hover:text-red-600">
                    <Trash2 size={20} />
                   </button>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Judul Pelatihan</label>
                    <input 
                      value={cert.name}
                      onChange={(e) => updateCertField(cert.id, "name", e.target.value)}
                      placeholder="Nama Program..."
                      className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none border-2 border-transparent focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Kategori Penyelenggara</label>
                    <select 
                      value={cert.organizer_category}
                      onChange={(e) => {
                        updateCertField(cert.id, "organizer_category", e.target.value);
                        updateCertField(cert.id, "organizer_name", ""); // Reset nama jika kategori berubah
                      }}
                      className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none"
                    >
                      <option value="">Pilih Kategori</option>
                      {TRAINING_ORGANIZER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Institusi Penyelenggara</label>
                    <select 
                      value={cert.organizer_name}
                      onChange={(e) => updateCertField(cert.id, "organizer_name", e.target.value)}
                      disabled={!cert.organizer_category}
                      className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none border-2 border-transparent focus:border-blue-600 disabled:opacity-50"
                    >
                      <option value="">-- Pilih Institusi Resmi --</option>
                      {getInstitutionList(cert.organizer_category).map(inst => (
                        <option key={inst} value={inst}>{inst === "LAINNYA" ? "+ Institusi Tidak Terdaftar (Input Manual)" : inst}</option>
                      ))}
                    </select>
                  </div>

                  {cert.organizer_name === "LAINNYA" && (
                    <div className="space-y-2 animate-in zoom-in-95">
                      <label className="text-[10px] font-black uppercase text-pink-600 ml-2 italic">Tulis Nama Institusi Baru</label>
                      <input 
                        value={cert.manual_organizer}
                        onChange={(e) => updateCertField(cert.id, "manual_organizer", e.target.value)}
                        placeholder="Ketik Nama Lengkap Institusi..."
                        className="w-full rounded-2xl bg-pink-50 p-4 font-bold outline-none border-2 border-pink-200"
                      />
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button 
          type="submit" 
          disabled={loading}
          className="flex w-full items-center justify-center gap-4 rounded-[2.5rem] bg-slate-900 py-6 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? "Menyimpan Riset..." : <><Save size={20} /> Simpan Seluruh Data Pelatihan</>}
        </button>
      </form>
    </div>
  );
}
