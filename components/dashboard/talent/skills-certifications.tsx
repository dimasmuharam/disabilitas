"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  Award, Cpu, CheckCircle2, AlertCircle, Save, 
  Plus, X, Zap, Trash2, BookOpen
} from "lucide-react";

// SINKRONISASI DATA-STATIC
import { 
  SKILLS_LIST, 
  GOVERNMENT_AGENCIES, 
  TRAINING_PARTNERS, 
  COMMUNITY_PARTNERS 
} from "@/lib/data-static";

interface SkillsCertificationsProps {
  user: any;
  profile: any;
  onSuccess?: () => void;
}

export default function SkillsCertifications({ user, profile, onSuccess }: SkillsCertificationsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. STATE KEAHLIAN UTAMA (Profiles Table)
  const [globalSkills, setGlobalSkills] = useState<string[]>(profile?.skills || []);
  const [newGlobalSkill, setNewGlobalSkill] = useState("");

  // 2. STATE RIWAYAT PELATIHAN (Certifications Table)
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchCerts = async () => {
      const { data } = await supabase
        .from("certifications")
        .select("*")
        .eq("profile_id", user.id)
        .order("year", { ascending: false });

      if (data) setCerts(data);
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
      certificate_url: "",
      skills_acquired: [], // Array kosong dipastikan ada agar tidak crash
      is_verified: false
    };
    setCerts([newItem, ...certs]);
  };

  const updateCertField = (id: string, field: string, value: any) => {
    setCerts(certs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleToggleCertSkill = (certId: string, skill: string) => {
    setCerts(certs.map(c => {
      if (c.id === certId) {
        const currentSkills = c.skills_acquired || [];
        const updatedSkills = currentSkills.includes(skill)
          ? currentSkills.filter((s: string) => s !== skill)
          : [...currentSkills, skill];
        return { ...c, skills_acquired: updatedSkills };
      }
      return c;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // A. Update Skills Global
      await updateTalentProfile(user.id, { skills: globalSkills });

      // B. Sync Tabel Certifications
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

      setMessage({ type: "success", text: "Keahlian Berhasil Diperbarui. Menuju Overview..." });
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2500);

    } catch (error: any) {
      setMessage({ type: "error", text: `{"Gagal menyimpan data: ${error.message}"}` });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 font-sans text-slate-900">
      {/* DATALIST UNTUK COMBOBOX SKILLS UTAMA */}
      <datalist id="global-skills-list">
        {SKILLS_LIST.map((cat: any) => cat.skills.map((s: string) => (
          <option key={s} value={s} />
        )))}
      </datalist>

      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
          <Zap className="text-purple-600" size={36} aria-hidden="true" />
          {"Keahlian & Pelatihan"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">
          {"Kelola daftar keahlian profesional dan riwayat pelatihan Anda untuk keperluan riset BRIN."}
        </p>
      </header>

      {/* NOTIFIKASI ARIA-LIVE */}
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
        
        {/* SEKSI 1: KEAHLIAN UTAMA (TERMASUK AUTODIDAK) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Cpu className="text-purple-600" size={20} aria-hidden="true" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">{"Daftar Keahlian Utama"}</h2>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            {"Cantumkan semua keahlian yang Anda kuasai, baik melalui pendidikan formal maupun yang didapat secara AUTODIDAK."}
          </p>
          
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="skill_combobox" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Cari atau Tambah Keahlian"}</label>
              <input 
                id="skill_combobox"
                type="text"
                list="global-skills-list"
                placeholder="Misal: Pengetikan Cepat, Python, Memasak..."
                value={newGlobalSkill}
                onChange={(e) => setNewGlobalSkill(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold focus:border-purple-600 outline-none"
              />
            </div>
            <button 
              type="button"
              onClick={() => { if(newGlobalSkill) { setGlobalSkills([...globalSkills, newGlobalSkill]); setNewGlobalSkill(""); } }}
              className="mt-6 bg-purple-600 text-white px-8 rounded-2xl hover:bg-slate-900 transition-all flex items-center shadow-lg shadow-purple-100"
              aria-label="Tambah keahlian ke daftar"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2" role="list">
            {globalSkills.map(s => (
              <span key={s} role="listitem" className="bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl flex items-center gap-2 animate-in zoom-in-95">
                {s} 
                <button type="button" onClick={() => setGlobalSkills(globalSkills.filter(x => x !== s))} aria-label={`{"Hapus keahlian ${s}"}`}>
                  <X size={12}/>
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* SEKSI 2: RIWAYAT PELATIHAN */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 text-slate-500">
              <Award className="text-amber-500" size={20} /> {"Riwayat Pelatihan & Sertifikasi"}
            </h2>
            <button 
              type="button"
              onClick={addCertsItem}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100"
            >
              <Plus size={16} /> {"Tambah Riwayat"}
            </button>
          </div>

          <div className="space-y-8">
            {certs.map((cert, index) => (
              <section 
                key={cert.id} 
                aria-labelledby={`cert-title-${cert.id}`}
                className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8 relative animate-in slide-in-from-top-4"
              >
                <div className="flex justify-between items-start">
                  <h3 id={`cert-title-${cert.id}`} className="text-sm font-black uppercase italic tracking-tight text-slate-400">
                    {"Pelatihan #"} {certs.length - index}
                  </h3>
                  <button type="button" onClick={() => removeCert(cert.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 font-bold text-sm">
                  <div className="space-y-2">
                    <label htmlFor={`name-${cert.id}`} className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Nama Program Pelatihan"}</label>
                    <input id={`name-${cert.id}`} value={cert.name} onChange={(e) => updateCertField(cert.id, "name", e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`year-${cert.id}`} className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Tahun Lulus"}</label>
                    <input id={`year-${cert.id}`} type="number" value={cert.year} onChange={(e) => updateCertField(cert.id, "year", e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`cat-${cert.id}`} className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Kategori Penyelenggara"}</label>
                    <select id={`cat-${cert.id}`} value={cert.organizer_category} onChange={(e) => updateCertField(cert.id, "organizer_category", e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none">
                      <option value="">{"Pilih Kategori"}</option>
                      <option value="Pemerintah">{"Instansi Pemerintah"}</option>
                      <option value="Mitra Pelatihan">{"Mitra Pelatihan (LKP/LPK)"}</option>
                      <option value="Komunitas">{"Mitra Komunitas / NGO"}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`org-${cert.id}`} className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Pilih Institusi"}</label>
                    <input id={`org-${cert.id}`} list={`list-${cert.id}`} value={cert.organizer_name} onChange={(e) => updateCertField(cert.id, "organizer_name", e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none" />
                    <datalist id={`list-${cert.id}`}>
                      {cert.organizer_category === "Pemerintah" && GOVERNMENT_AGENCIES.map(g => <option key={g} value={g}/>)}
                      {cert.organizer_category === "Mitra Pelatihan" && TRAINING_PARTNERS.map(t => <option key={t} value={t}/>)}
                      {cert.organizer_category === "Komunitas" && COMMUNITY_PARTNERS.map(c => <option key={c} value={c}/>)}
                    </datalist>
                  </div>
                </div>

                {/* SKILLS ACQUIRED PER TRAINING */}
                <fieldset className="pt-6 border-t-2 border-slate-50 space-y-4">
                  <legend className="flex items-center gap-3 text-blue-600 mb-4 font-black uppercase tracking-widest text-[10px]">
                    <BookOpen size={18} aria-hidden="true" />
                    {"Keahlian yang didapat dari pelatihan ini"}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS_LIST.map((cat: any) => cat.skills.map((skill: string) => (
                      <label key={`${cert.id}-${skill}`} className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase cursor-pointer transition-all ${
                        cert.skills_acquired?.includes(skill) 
                        ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                        : "bg-white border-slate-50 text-slate-400 hover:border-blue-200"
                      }`}>
                        <input type="checkbox" className="sr-only" checked={cert.skills_acquired?.includes(skill)} onChange={() => handleToggleCertSkill(cert.id, skill)} />
                        {skill}
                      </label>
                    )))}
                  </div>
                </fieldset>
              </section>
            ))}
          </div>
        </div>

        {/* SIMPAN & SELESAI */}
        <div className="flex justify-end pt-10 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-slate-900 text-white px-16 py-6 rounded-[2.5rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-purple-600 transition-all shadow-2xl disabled:opacity-50"
          >
            {loading ? "Sinkronisasi..." : <><Save size={20} /> {"Simpan & Selesai"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
