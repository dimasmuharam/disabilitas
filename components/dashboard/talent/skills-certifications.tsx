"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  Award, Cpu, CheckCircle2, AlertCircle, Save, 
  Plus, X, Zap, Trash2, Microscope, Link as LinkIcon
} from "lucide-react";

// SINKRONISASI DATA-STATIC
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

  // 1. STATE KEAHLIAN & RISET (Profiles)
  const [globalSkills, setGlobalSkills] = useState<string[]>(profile?.skills || []);
  const [newGlobalSkill, setNewGlobalSkill] = useState("");
  const [researchData, setResearchData] = useState({
    skill_acquisition_method: profile?.skill_acquisition_method || "",
    training_accessibility_rating: profile?.training_accessibility_rating || "",
    skill_impact_rating: profile?.skill_impact_rating || ""
  });

  // 2. STATE PELATIHAN (Certifications Table)
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
      // Simpan data profil (skills + variabel riset)
      await updateTalentProfile(user.id, { 
        skills: globalSkills,
        ...researchData 
      });

      // Simpan/Update riwayat pelatihan
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

      setMessage({ type: "success", text: "Data Keahlian & Riset Berhasil Disimpan!" });
      setTimeout(() => { if (onSuccess) onSuccess(); }, 2000);
    } catch (error: any) {
      setMessage({ type: "error", text: `{"Gagal: ${error.message}"}` });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 font-sans text-slate-900">
      {/* DATALIST UNTUK COMBOBOX SKILLS */}
      <datalist id="skills-list">
        {SKILLS_LIST?.map((cat: any) => cat.skills?.map((s: string) => (
          <option key={s} value={s} />
        )))}
      </datalist>

      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-slate-900">
          <Zap className="text-purple-600" size={36} aria-hidden="true" />
          {"Keahlian & Pelatihan"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
          {"Penyelarasan kompetensi teknis dan data riset pelatihan inklusif."}
        </p>
      </header>

      {/* ARIA-LIVE NOTIFIKASI */}
      <div aria-live="polite" className="px-4">
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
        
        {/* SEKSI 1: SKILLS UTAMA */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-purple-600">
            <Cpu size={20} aria-hidden="true" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">{"Daftar Keahlian Utama"}</h2>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            {"Cantumkan keahlian yang Anda kuasai, baik dari pendidikan formal maupun belajar MANDIRI/AUTODIDAK."}
          </p>
          
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="skill_input" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Ketik atau Pilih Keahlian"}</label>
              <input 
                id="skill_input"
                type="text"
                list="skills-list"
                placeholder="Misal: Pengetikan 10 Jari, Desain, dll..."
                value={newGlobalSkill}
                onChange={(e) => setNewGlobalSkill(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold focus:border-purple-600 outline-none"
              />
            </div>
            <button 
              type="button"
              onClick={() => { if(newGlobalSkill) { setGlobalSkills([...globalSkills, newGlobalSkill]); setNewGlobalSkill(""); } }}
              className="mt-7 bg-purple-600 text-white px-8 rounded-2xl hover:bg-slate-900 transition-all flex items-center"
              aria-label="Tambahkan keahlian ini ke daftar"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2" role="list">
            {globalSkills.map(s => (
              <span key={s} role="listitem" className="bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl flex items-center gap-2">
                {s} 
                <button type="button" onClick={() => setGlobalSkills(globalSkills.filter(x => x !== s))} aria-label={`{"Hapus ${s}"}`}>
                  <X size={12}/>
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* SEKSI 2: VARIABEL RISET (RADIO BUTTONS) */}
        <section className="bg-emerald-50/50 p-10 rounded-[3rem] border-2 border-emerald-100 space-y-8">
          <div className="flex items-center gap-3 text-emerald-700">
            <Microscope size={20} aria-hidden="true" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">{"Variabel Riset Keahlian"}</h2>
          </div>

          {/* PEROLEHAN SKILL */}
          <fieldset className="space-y-4">
            <legend className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2">{"1. Bagaimana Anda paling dominan menguasai keahlian di atas?"}</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SKILL_ACQUISITION_METHODS?.map(method => (
                <label key={method} className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${researchData.skill_acquisition_method === method ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-white text-slate-600 hover:border-emerald-200"}`}>
                  <input type="radio" name="acquisition" value={method} checked={researchData.skill_acquisition_method === method} onChange={(e) => setResearchData({...researchData, skill_acquisition_method: e.target.value})} className="w-5 h-5 mr-3 accent-white" />
                  <span className="text-[10px] font-bold uppercase">{method}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* RATING AKSESIBILITAS */}
          <fieldset className="space-y-4">
            <legend className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2">{"2. Secara umum, bagaimana tingkat aksesibilitas pelatihan yang Anda ikuti?"}</legend>
            <div className="grid grid-cols-1 gap-2">
              {TRAINING_ACCESSIBILITY_SCORES?.map(score => (
                <label key={score.value} className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${Number(researchData.training_accessibility_rating) === score.value ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-white text-slate-600 hover:border-emerald-200"}`}>
                  <input type="radio" name="accessibility" value={score.value} checked={Number(researchData.training_accessibility_rating) === score.value} onChange={(e) => setResearchData({...researchData, training_accessibility_rating: e.target.value})} className="w-5 h-5 mr-3 accent-white" />
                  <span className="text-[10px] font-bold uppercase">{score.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* DAMPAK SKILL */}
          <fieldset className="space-y-4">
            <legend className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2">{"3. Sejauh mana keahlian/pelatihan ini berdampak pada pekerjaan Anda?"}</legend>
            <div className="space-y-2">
              {SKILL_IMPACT_LEVELS?.map(level => (
                <label key={level} className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${researchData.skill_impact_rating === level ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-white text-slate-600 hover:border-emerald-200"}`}>
                  <input type="radio" name="impact" value={level} checked={researchData.skill_impact_rating === level} onChange={(e) => setResearchData({...researchData, skill_impact_rating: e.target.value})} className="w-5 h-5 mr-3 accent-white" />
                  <span className="text-[10px] font-bold uppercase">{level}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* SEKSI 3: RIWAYAT PELATIHAN */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
              <Award className="text-amber-500" size={20} aria-hidden="true" /> {"Riwayat Pelatihan & Sertifikasi"}
            </h2>
            <button type="button" onClick={addCertsItem} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100">
              <Plus size={16} aria-hidden="true" /> {"Tambah Pelatihan"}
            </button>
          </div>

          <div className="space-y-8">
            {certs.map((cert, index) => (
              <section key={cert.id} aria-label={`{"Item Pelatihan ke-${index + 1}"}`} className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8 relative animate-in slide-in-from-top-4">
                <div className="flex justify-between items-start border-b border-slate-50 pb-6">
                  <h3 className="text-sm font-black uppercase italic tracking-tight text-slate-400">
                    {"Pelatihan #"} {certs.length - index}
                  </h3>
                  <button type="button" onClick={() => removeCert(cert.id)} className="text-slate-300 hover:text-red-600 transition-colors" aria-label="Hapus item ini">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 font-bold text-sm">
                  <div className="space-y-2">
                    <label htmlFor={`name-${cert.id}`} className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Nama / Judul Pelatihan"}</label>
                    <input id={`name-${cert.id}`} value={cert.name} onChange={(e) => updateCertField(cert.id, "name", e.target.value)} placeholder="Misal: Sertifikasi Web Accessibility..." className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`year-${cert.id}`} className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Tahun Pelaksanaan"}</label>
                    <input id={`year-${cert.id}`} type="number" value={cert.year} onChange={(e) => updateCertField(cert.id, "year", e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`cat-${cert.id}`} className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Kategori Penyelenggara"}</label>
                    <select id={`cat-${cert.id}`} value={cert.organizer_category} onChange={(e) => updateCertField(cert.id, "organizer_category", e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none">
                      <option value="">{"Pilih Kategori"}</option>
                      <option value="Pemerintah">{"Instansi Pemerintah"}</option>
                      <option value="Mitra Pelatihan">{"Mitra Pelatihan (LKP/LPK)"}</option>
                      <option value="Komunitas">{"Mitra Komunitas / NGO"}</option>
                      <option value="Lainnya">{"Lainnya"}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`org-${cert.id}`} className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Nama Institusi Penyelenggara"}</label>
                    <input 
                      id={`org-${cert.id}`} 
                      list={`list-${cert.id}`} 
                      value={cert.organizer_name} 
                      onChange={(e) => updateCertField(cert.id, "organizer_name", e.target.value)} 
                      placeholder="Pilih atau ketik institusi..." 
                      className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none" 
                    />
                    <datalist id={`list-${cert.id}`}>
                      {cert.organizer_category === "Pemerintah" && GOVERNMENT_AGENCIES?.map(g => <option key={g} value={g}/>)}
                      {cert.organizer_category === "Mitra Pelatihan" && TRAINING_PARTNERS?.map(t => <option key={t} value={t}/>)}
                      {cert.organizer_category === "Komunitas" && COMMUNITY_PARTNERS?.map(c => <option key={c} value={c}/>)}
                    </datalist>
                  </div>
                  {/* KOLOM BARU: URL SERTIFIKAT */}
                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor={`url-${cert.id}`} className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2">
                      <LinkIcon size={12} /> {"Tautan Sertifikat / Portofolio (Opsional)"}
                    </label>
                    <input id={`url-${cert.id}`} type="url" value={cert.certificate_url} onChange={(e) => updateCertField(cert.id, "certificate_url", e.target.value)} placeholder="https://..." className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-600 outline-none" />
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-10 border-t border-slate-100">
          <button type="submit" disabled={loading} className="bg-slate-900 text-white px-16 py-6 rounded-[2.5rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-purple-600 transition-all shadow-2xl disabled:opacity-50">
            {loading ? "Menyimpan..." : <><Save size={20} aria-hidden="true" /> {"Simpan & Selesai"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
