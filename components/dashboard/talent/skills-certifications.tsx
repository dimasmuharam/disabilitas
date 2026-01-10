"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  Award, Cpu, CheckCircle2, AlertCircle, Save, 
  Plus, X, Zap, Trash2, Microscope, Link as LinkIcon
} from "lucide-react";

// SINKRONISASI DATA-STATIC TERBARU
import { 
  SKILLS_LIST, 
  GOVERNMENT_AGENCIES_LIST, 
  TRAINING_PARTNERS, 
  NONPROFIT_ORG_LIST,
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
      const supabase = createClient();
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
    const supabase = createClient();
    const { error } = await supabase.from("certifications").delete().eq("id", id);
    if (!error) setCerts(certs.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
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
        // Ensure year is stored as integer
        const payload = { 
          ...certData, 
          profile_id: user.id,
          year: certData.year ? parseInt(certData.year.toString(), 10) : new Date().getFullYear()
        };

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
    <div className="mx-auto max-w-4xl pb-20 font-sans text-slate-900">
      {/* DATALIST UNTUK COMBOBOX SKILLS */}
      <datalist id="skills-list">
        {SKILLS_LIST.map((skill) => (
          <option key={skill} value={skill} />
        ))}
      </datalist>

      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter text-slate-900">
          <Zap className="text-purple-600" size={36} aria-hidden="true" />
          {"Keahlian & Pelatihan"}
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {"Lengkapi informasi mengenai pelatihan dan keterampilan Anda untuk rekomendasi lowongan yang sesuai. Biar pekerjaan yang mencari Anda!"}
        </p>
      </header>

      <div aria-live="polite" className="px-4">
        {message.text && (
          <div className={`mb-8 flex items-center gap-4 rounded-[2rem] border-2 p-6 ${
            message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        
        {/* SEKSI 1: SKILLS UTAMA */}
        <section className="space-y-6 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <div className="flex items-center gap-3 text-purple-600">
            <Cpu size={20} aria-hidden="true" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">{"Daftar Keahlian Utama"}</h2>
          </div>
          <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-slate-400">
            {"Cantumkan keahlian yang Anda kuasai, baik dari pendidikan formal maupun belajar MANDIRI/AUTODIDAK."}
          </p>
          
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="skill_input" className="ml-2 text-[10px] font-black uppercase text-slate-400">{"Ketik atau Pilih Keahlian"}</label>
              <input 
                id="skill_input"
                type="text"
                list="skills-list"
                placeholder="Misal: Pengetikan 10 Jari, Desain, dll..."
                value={newGlobalSkill}
                onChange={(e) => setNewGlobalSkill(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold outline-none focus:border-purple-600"
              />
            </div>
            <button 
              type="button"
              onClick={() => { if(newGlobalSkill) { setGlobalSkills([...globalSkills, newGlobalSkill]); setNewGlobalSkill(""); } }}
              className="mt-7 flex items-center rounded-2xl bg-purple-600 px-8 text-white transition-all hover:bg-slate-900"
              aria-label="Tambahkan keahlian ini ke daftar"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2" role="list">
            {globalSkills.map(s => (
              <span key={s} role="listitem" className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase text-white">
                {s} 
                <button type="button" onClick={() => setGlobalSkills(globalSkills.filter(x => x !== s))} aria-label={`{"Hapus ${s}"}`}>
                  <X size={12}/>
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* SEKSI 2: VARIABEL RISET */}
        <section className="space-y-8 rounded-[3rem] border-2 border-emerald-100 bg-emerald-50/50 p-10">
          <div className="flex items-center gap-3 text-emerald-700">
            <Microscope size={20} aria-hidden="true" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">{"Jawab tiga pertanyaan singkat ini untuk kami dapat lebih memahami keterampilan Anda"}</h2>
          </div>

          <fieldset className="space-y-4">
            <legend className="mb-2 ml-2 text-[10px] font-black uppercase text-slate-500">{"1. Bagaimana Anda paling dominan menguasai keahlian di atas?"}</legend>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {SKILL_ACQUISITION_METHODS?.map(method => (
                <label key={method} className={`flex cursor-pointer items-center rounded-2xl border-2 p-4 transition-all ${researchData.skill_acquisition_method === method ? "border-emerald-600 bg-emerald-600 text-white" : "border-white bg-white text-slate-600 hover:border-emerald-200"}`}>
                  <input type="radio" name="acquisition" value={method} checked={researchData.skill_acquisition_method === method} onChange={(e) => setResearchData({...researchData, skill_acquisition_method: e.target.value})} className="mr-3 size-5 accent-white" />
                  <span className="text-[10px] font-bold uppercase">{method}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-2 ml-2 text-[10px] font-black uppercase text-slate-500">{"2. Secara umum, bagaimana tingkat aksesibilitas dari seluruh pelatihan yang Anda ikuti?"}</legend>
            <div className="grid grid-cols-1 gap-2">
              {TRAINING_ACCESSIBILITY_SCORES?.map(score => (
                <label key={score.value} className={`flex cursor-pointer items-center rounded-2xl border-2 p-4 transition-all ${Number(researchData.training_accessibility_rating) === score.value ? "border-emerald-600 bg-emerald-600 text-white" : "border-white bg-white text-slate-600 hover:border-emerald-200"}`}>
                  <input type="radio" name="accessibility" value={score.value} checked={Number(researchData.training_accessibility_rating) === score.value} onChange={(e) => setResearchData({...researchData, training_accessibility_rating: e.target.value})} className="mr-3 size-5 accent-white" />
                  <span className="text-[10px] font-bold uppercase">{score.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-2 ml-2 text-[10px] font-black uppercase text-slate-500">{"3. Sejauh mana keahlian/pelatihan yang pernah diikuti berdampak pada pekerjaan Anda?"}</legend>
            <div className="space-y-2">
              {SKILL_IMPACT_LEVELS?.map(level => (
                <label key={level} className={`flex cursor-pointer items-center rounded-2xl border-2 p-4 transition-all ${researchData.skill_impact_rating === level ? "border-emerald-600 bg-emerald-600 text-white" : "border-white bg-white text-slate-600 hover:border-emerald-200"}`}>
                  <input type="radio" name="impact" value={level} checked={researchData.skill_impact_rating === level} onChange={(e) => setResearchData({...researchData, skill_impact_rating: e.target.value})} className="mr-3 size-5 accent-white" />
                  <span className="text-[10px] font-bold uppercase">{level}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* SEKSI 3: RIWAYAT PELATIHAN */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
              <Award className="text-amber-500" size={20} aria-hidden="true" /> {"Riwayat Pelatihan & Sertifikasi"}
            </h2>
            <button type="button" onClick={addCertsItem} className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase text-white shadow-xl shadow-blue-100 transition-all hover:bg-slate-900">
              <Plus size={16} aria-hidden="true" /> {"Tambah Pelatihan"}
            </button>
          </div>

          <div className="space-y-8">
            {certs.map((cert, index) => (
              <section key={cert.id} aria-label={`{"Item Pelatihan ke-${index + 1}"}`} className="relative space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm animate-in slide-in-from-top-4">
                <div className="flex items-start justify-between border-b border-slate-50 pb-6">
                  <h3 className="text-sm font-black uppercase italic tracking-tight text-slate-400">
                    {"Pelatihan #"} {certs.length - index}
                  </h3>
                  <button type="button" onClick={() => removeCert(cert.id)} className="text-slate-300 transition-colors hover:text-red-600" aria-label="Hapus item ini">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid gap-8 text-sm font-bold md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor={`name-${cert.id}`} className="ml-2 text-[10px] font-black uppercase text-slate-400">{"Nama / Judul Pelatihan"}</label>
                    <input id={`name-${cert.id}`} value={cert.name} onChange={(e) => updateCertField(cert.id, "name", e.target.value)} placeholder="Misal: Sertifikasi Web Accessibility..." className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`year-${cert.id}`} className="ml-2 text-[10px] font-black uppercase text-slate-400">{"Tahun Pelaksanaan"}</label>
                    <input id={`year-${cert.id}`} type="number" value={cert.year} onChange={(e) => updateCertField(cert.id, "year", e.target.value)} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`cat-${cert.id}`} className="ml-2 text-[10px] font-black uppercase text-slate-400">{"Kategori Penyelenggara"}</label>
                    <select 
                      id={`cat-${cert.id}`} 
                      value={cert.organizer_category} 
                      onChange={(e) => updateCertField(cert.id, "organizer_category", e.target.value)} 
                      className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-blue-600"
                    >
                      <option value="">{"Pilih Kategori"}</option>
                      {TRAINING_ORGANIZER_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`org-${cert.id}`} className="ml-2 text-[10px] font-black uppercase text-slate-400">{"Nama Institusi Penyelenggara"}</label>
                    <input 
                      id={`org-${cert.id}`} 
                      list={`list-${cert.id}`} 
                      value={cert.organizer_name} 
                      onChange={(e) => updateCertField(cert.id, "organizer_name", e.target.value)} 
                      placeholder="Pilih atau ketik institusi..." 
                      className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-blue-600" 
                    />
                    <datalist id={`list-${cert.id}`}>
                      {cert.organizer_category === "Pemerintah" && GOVERNMENT_AGENCIES_LIST?.map(g => <option key={g} value={g}/>)}
                      {cert.organizer_category === "Mitra Pelatihan (LKP/LPK)" && TRAINING_PARTNERS?.map(t => <option key={t} value={t}/>)}
                      {cert.organizer_category === "Organisasi / Komunitas Disabilitas" && NONPROFIT_ORG_LIST?.map(c => <option key={c} value={c}/>)}
                    </datalist>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor={`url-${cert.id}`} className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                      <LinkIcon size={12} /> {"Tautan Sertifikat / Portofolio (Opsional)"}
                    </label>
                    <input id={`url-${cert.id}`} type="url" value={cert.certificate_url} onChange={(e) => updateCertField(cert.id, "certificate_url", e.target.value)} placeholder="https://..." className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 outline-none focus:border-blue-600" />
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-10">
          <button type="submit" disabled={loading} className="flex items-center gap-4 rounded-[2.5rem] bg-slate-900 px-16 py-6 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-purple-600 disabled:opacity-50">
            {loading ? "Menyimpan..." : <><Save size={20} aria-hidden="true" /> {"Simpan & Selesai"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
