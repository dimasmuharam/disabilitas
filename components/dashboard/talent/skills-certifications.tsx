"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  Award, Cpu, CheckCircle2, AlertCircle, Save, 
  Plus, X, Zap, Trash2, Microscope
} from "lucide-react";

// SINKRONISASI DATA-STATIC TERMASUK VARIABEL RISET
import { 
  SKILLS_LIST, 
  GOVERNMENT_AGENCIES, 
  TRAINING_PARTNERS, 
  COMMUNITY_PARTNERS,
  SKILL_ACQUISITION_METHODS,
  TRAINING_ACCESSIBILITY_SCORES,
  SKILL_IMPACT_LEVELS
} from "@/lib/data-static";

interface SkillsCertificationsProps {
  user: any;
  profile: any;
  onSuccess?: () => void;
}

export default function SkillsCertifications({ user, profile, onSuccess }: SkillsCertificationsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. STATE KEAHLIAN & VARIABEL RISET (DARI TABEL PROFILES)
  const [globalSkills, setGlobalSkills] = useState<string[]>(profile?.skills || []);
  const [newGlobalSkill, setNewGlobalSkill] = useState("");
  const [researchData, setResearchData] = useState({
    skill_acquisition_method: profile?.skill_acquisition_method || "",
    training_accessibility_rating: profile?.training_accessibility_rating || 0,
    skill_impact_rating: profile?.skill_impact_rating || ""
  });

  // 2. STATE RIWAYAT PELATIHAN (TABEL CERTIFICATIONS)
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
        console.error("Error loading certs:", err);
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
      year: new Date().getFullYear().toString(),
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
    const confirmDelete = confirm("Hapus riwayat pelatihan ini?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("certifications").delete().eq("id", id);
    if (!error) setCerts(certs.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Update Profiles (Skills + Variabel Riset)
      await updateTalentProfile(user.id, { 
        skills: globalSkills,
        ...researchData 
      });

      // Sync Tabel Certifications
      for (const cert of certs) {
        const isTemp = cert.id.toString().startsWith("temp-");
        const { id, ...certData } = cert;
        const payload = { ...certData, profile_id: user.id };

        if (isTemp) {
          await supabase.from("certifications").insert([payload]);
        } else {
          await supabase.from("certifications").update(payload).eq("id", id);
        }
      }

      setMessage({ type: "success", text: "Seluruh Data & Riset Berhasil Disimpan!" });
      setTimeout(() => { if (onSuccess) onSuccess(); }, 2000);
    } catch (error: any) {
      setMessage({ type: "error", text: `{"Gagal menyimpan: ${error.message}"}` });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 font-sans text-slate-900">
      <datalist id="global-skills-list">
        {SKILLS_LIST?.map((cat: any) => cat.skills?.map((s: string) => (
          <option key={s} value={s} />
        )))}
      </datalist>

      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
          <Zap className="text-purple-600" size={36} />
          {"Keahlian & Pelatihan"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
          {"Integrasi data kompetensi dan pengembangan riset inklusivitas."}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        
        {/* SEKSI 1: INPUT KEAHLIAN */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-purple-600">
            <Cpu size={20} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">{"Daftar Keahlian Utama"}</h2>
          </div>
          
          <div className="flex gap-4">
            <input 
              type="text"
              list="global-skills-list"
              placeholder="Contoh: Administrasi, Menjahit, Python..."
              value={newGlobalSkill}
              onChange={(e) => setNewGlobalSkill(e.target.value)}
              className="flex-1 bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold focus:border-purple-600 outline-none"
            />
            <button 
              type="button"
              onClick={() => { if(newGlobalSkill) { setGlobalSkills([...globalSkills, newGlobalSkill]); setNewGlobalSkill(""); } }}
              className="bg-purple-600 text-white px-8 rounded-2xl hover:bg-slate-900 transition-all flex items-center"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {globalSkills.map(s => (
              <span key={s} className="bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl flex items-center gap-2">
                {s} 
                <button type="button" onClick={() => setGlobalSkills(globalSkills.filter(x => x !== s))} aria-label={`{"Hapus ${s}"}`}>
                  <X size={12}/>
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* SEKSI 2: VARIABEL RISET (YANG BARU DITAMBAHKAN) */}
        <section className="bg-emerald-50/50 p-10 rounded-[3rem] border-2 border-emerald-100 space-y-8">
          <div className="flex items-center gap-3 text-emerald-700">
            <Microscope size={20} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">{"Variabel Riset Inklusivitas"}</h2>
          </div>

          <div className="space-y-6">
            {/* Cara Perolehan */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{"Bagaimana Anda dominan menguasai keahlian di atas?"}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SKILL_ACQUISITION_METHODS?.map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setResearchData({...researchData, skill_acquisition_method: method})}
                    className={`text-left p-4 rounded-2xl text-[10px] font-bold transition-all border-2 ${
                      researchData.skill_acquisition_method === method 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-md" 
                      : "bg-white border-transparent text-slate-600 hover:border-emerald-200"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Aksesibilitas */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{"Tingkat aksesibilitas materi pelatihan yang pernah diikuti?"}</label>
              <div className="flex flex-wrap gap-3">
                {TRAINING_ACCESSIBILITY_SCORES?.map(score => (
                  <button
                    key={score.value}
                    type="button"
                    onClick={() => setResearchData({...researchData, training_accessibility_rating: score.value})}
                    className={`px-4 py-3 rounded-xl text-[10px] font-bold transition-all border-2 ${
                      researchData.training_accessibility_rating === score.value 
                      ? "bg-emerald-600 border-emerald-600 text-white" 
                      : "bg-white border-transparent text-slate-600 hover:border-emerald-200"
                    }`}
                  >
                    {score.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dampak */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{"Sejauh mana keahlian ini berdampak pada kemandirian ekonomi?"}</label>
              <div className="space-y-2">
                {SKILL_IMPACT_LEVELS?.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setResearchData({...researchData, skill_impact_rating: level})}
                    className={`w-full text-left p-4 rounded-2xl text-[10px] font-bold transition-all border-2 ${
                      researchData.skill_impact_rating === level 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-md" 
                      : "bg-white border-transparent text-slate-600 hover:border-emerald-200"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SEKSI 3: RIWAYAT PELATIHAN */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
              <Award className="text-amber-500" size={20} /> {"Riwayat Pelatihan"}
            </h2>
            <button type="button" onClick={addCertsItem} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2">
              <Plus size={16} /> {"Tambah Pelatihan"}
            </button>
          </div>

          <div className="space-y-6">
            {certs.map((cert, index) => (
              <section key={cert.id} className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8 relative">
                <div className="flex justify-between items-start">
                  <h3 className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">{"Sertifikasi/Pelatihan #"} {certs.length - index}</h3>
                  <button type="button" onClick={() => removeCert(cert.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 font-bold text-sm">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Nama Pelatihan"}</label>
                    <input value={cert.name} onChange={(e) => updateCertField(cert.id, "name", e.target.value)} placeholder="Nama..." className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Tahun Lulus"}</label>
                    <input type="number" value={cert.year} onChange={(e) => updateCertField(cert.id, "year", e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Kategori Penyelenggara"}</label>
                    <select value={cert.organizer_category} onChange={(e) => updateCertField(cert.id, "organizer_category", e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none">
                      <option value="">{"Pilih Kategori"}</option>
                      <option value="Pemerintah">{"Pemerintah"}</option>
                      <option value="Mitra Pelatihan">{"Mitra Pelatihan"}</option>
                      <option value="Komunitas">{"Mitra Komunitas"}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Institusi"}</label>
                    <input 
                      list={`list-${cert.id}`} 
                      value={cert.organizer_name} 
                      onChange={(e) => updateCertField(cert.id, "organizer_name", e.target.value)} 
                      placeholder="Pilih atau ketik..."
                      className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none" 
                    />
                    <datalist id={`list-${cert.id}`}>
                      {cert.organizer_category === "Pemerintah" && GOVERNMENT_AGENCIES?.map(g => <option key={g} value={g}/>)}
                      {cert.organizer_category === "Mitra Pelatihan" && TRAINING_PARTNERS?.map(t => <option key={t} value={t}/>)}
                      {cert.organizer_category === "Komunitas" && COMMUNITY_PARTNERS?.map(c => <option key={c} value={c}/>)}
                    </datalist>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* NOTIFIKASI & TOMBOL SIMPAN */}
        <div aria-live="polite">
          {message.text && (
            <div className={`mb-8 p-6 rounded-3xl flex items-center gap-4 border-2 ${
              message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              <p className="text-sm font-black uppercase tracking-tight">{message.text}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-10 border-t border-slate-100">
          <button type="submit" disabled={loading} className="bg-slate-900 text-white px-16 py-6 rounded-[2.5rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-emerald-600 transition-all shadow-2xl disabled:opacity-50">
            {loading ? "Menyimpan..." : <><Save size={20} /> {"Simpan & Selesai"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
