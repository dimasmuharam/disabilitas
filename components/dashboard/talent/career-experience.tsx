"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Briefcase, Save, Plus, Trash2, Linkedin, 
  MapPin, DollarSign, CheckCircle2, AlertCircle, Info
} from "lucide-react";

// SINKRONISASI DENGAN DATA-STATIC ASLI (CAREER_STATUSES)
import { CAREER_STATUSES } from "@/lib/data-static";

interface CareerExperienceProps {
  user: any;
  profile: any;
  onSuccess: () => void;
}

export default function CareerExperience({ user, profile, onSuccess }: CareerExperienceProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [experiences, setExperiences] = useState<any[]>([]);

  // Daftar tipe pekerjaan internal (EMPLOYMENT_LIST) untuk keamanan build
  const EMPLOYMENT_LIST = [
    "Full-time", "Part-time", "Freelance", "Contract", "Internship", "Self-employed"
  ];

  const [profileData, setProfileData] = useState({
    career_status: profile?.career_status || "Job Seeker",
    expected_salary: profile?.expected_salary || 0,
    linkedin_url: profile?.linkedin_url || "",
    work_preference: profile?.work_preference || "hybrid", 
    bio: profile?.bio || ""
  });

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  useEffect(() => {
    fetchExperiences();
  }, [user.id]);

  async function fetchExperiences() {
    const { data } = await supabase
      .from("work_experiences")
      .select("*")
      .eq("profile_id", user.id)
      .order("start_year", { ascending: false });
    
    if (data) setExperiences(data);
  }

  const handleAddExperience = async () => {
    const newExp = {
      profile_id: user.id,
      company_name: "",
      position: "",
      start_month: "Januari",
      start_year: new Date().getFullYear().toString(),
      end_month: "Januari",
      end_year: "",
      is_current_work: false,
      description: "",
      company_location: "",
      employment_type: "Full-time",
      is_verified: false
    };

    const { data, error } = await supabase
      .from("work_experiences")
      .insert([newExp])
      .select();

    if (data) setExperiences([...data, ...experiences]);
    if (error) setMessage({ type: "error", text: error.message });
  };

  const updateExpField = (id: string, field: string, value: any) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const handleDeleteExp = async (id: string) => {
    const { error } = await supabase.from("work_experiences").delete().eq("id", id);
    if (!error) setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { error: profError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);

      if (profError) throw profError;

      for (const exp of experiences) {
        const { error: expError } = await supabase
          .from("work_experiences")
          .update({
            company_name: exp.company_name,
            position: exp.position,
            start_month: exp.start_month,
            start_year: exp.start_year,
            end_month: exp.is_current_work ? null : exp.end_month,
            end_year: exp.is_current_work ? null : exp.end_year,
            is_current_work: exp.is_current_work,
            description: exp.description,
            company_location: exp.company_location,
            employment_type: exp.employment_type
          })
          .eq("id", exp.id);
        if (expError) throw expError;
      }

      setMessage({ type: "success", text: "Data Karir Berhasil Disimpan. Mengalihkan ke Overview..." });
      
      setTimeout(() => {
        onSuccess();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 2000);

    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500 font-sans text-slate-900 text-sm text-sm">
      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-slate-900">
          <Briefcase className="text-blue-600" size={36} aria-hidden="true" />
          {"Karir & Pengalaman"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
          {"Sinkronisasi data profesional untuk pengembangan profil inklusif."}
        </p>
      </header>

      <div aria-live="polite" className="px-4">
        {message.text && (
          <div className={`mb-8 p-6 rounded-[2rem] border-2 flex items-center gap-4 ${
            message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 px-4">
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <h2 className="text-xs font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-2">
            <Info size={16} aria-hidden="true" /> {"Status & Preferensi"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <label htmlFor="career_status" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Status Karir"}</label>
              <select id="career_status" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" value={profileData.career_status} onChange={(e) => setProfileData({...profileData, career_status: e.target.value})}>
                {CAREER_STATUSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="work_pref" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Model Kerja Favorit"}</label>
              <select id="work_pref" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" value={profileData.work_preference} onChange={(e) => setProfileData({...profileData, work_preference: e.target.value})}>
                <option value="remote">{"Remote (Full WFH)"}</option>
                <option value="onsite">{"On-site (Di Kantor)"}</option>
                <option value="hybrid">{"Hybrid (Kombinasi)"}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="expected_salary" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Ekspektasi Gaji (Rp)"}</label>
              <div className="relative"><DollarSign className="absolute left-4 top-4 text-slate-400" size={18} />
                <input id="expected_salary" type="number" className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl font-bold focus:border-blue-600 outline-none" value={profileData.expected_salary} onChange={(e) => setProfileData({...profileData, expected_salary: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="linkedin" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"LinkedIn Profile URL"}</label>
              <div className="relative"><Linkedin className="absolute left-4 top-4 text-slate-400" size={18} />
                <input id="linkedin" type="url" placeholder="https://..." className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl font-bold focus:border-blue-600 outline-none" value={profileData.linkedin_url} onChange={(e) => setProfileData({...profileData, linkedin_url: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Bio Profesional"}</label>
            <textarea id="bio" rows={4} className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] font-bold focus:border-blue-600 outline-none italic" value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">{"Pengalaman Kerja"}</h2>
            <button type="button" onClick={handleAddExperience} className="bg-blue-600 text-white px-6 py-4 rounded-2xl hover:bg-slate-900 transition-all flex items-center gap-3 text-[10px] font-black uppercase shadow-xl">
              <Plus size={20} aria-hidden="true" /> {"Tambah Riwayat"}
            </button>
          </div>

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="bg-white border-2 border-slate-100 p-10 rounded-[3rem] shadow-sm space-y-8 relative group animate-in slide-in-from-bottom-4 duration-500">
                <button type="button" onClick={() => handleDeleteExp(exp.id)} className="absolute top-8 right-8 text-slate-300 hover:text-red-600 transition-colors" aria-label={`Hapus pengalaman ${index + 1}`}>
                  <Trash2 size={24} aria-hidden="true" />
                </button>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">{"Nama Instansi / Perusahaan"}</label>
                    <input type="text" className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl font-bold focus:border-blue-600 outline-none" value={exp.company_name} onChange={(e) => updateExpField(exp.id, "company_name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">{"Jabatan / Posisi"}</label>
                    <input type="text" className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl font-bold focus:border-blue-600 outline-none" value={exp.position} onChange={(e) => updateExpField(exp.id, "position", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">{"Lokasi Perusahaan"}</label>
                    <div className="relative"><MapPin className="absolute left-4 top-4 text-slate-400" size={16} aria-hidden="true" />
                      <input type="text" placeholder="Kota" className="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-xl font-bold focus:border-blue-600 outline-none" value={exp.company_location} onChange={(e) => updateExpField(exp.id, "company_location", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">{"Tipe Pekerjaan"}</label>
                    <select className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl font-bold focus:border-blue-600 outline-none" value={exp.employment_type} onChange={(e) => updateExpField(exp.id, "employment_type", e.target.value)}>
                      {EMPLOYMENT_LIST.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">{"Bulan Mulai"}</label>
                      <select className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl font-bold" value={exp.start_month} onChange={(e) => updateExpField(exp.id, "start_month", e.target.value)}>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">{"Tahun Mulai"}</label>
                      <input type="number" placeholder="YYYY" className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl font-bold" value={exp.start_year} onChange={(e) => updateExpField(exp.id, "start_year", e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">{"Bulan Selesai"}</label>
                      <select disabled={exp.is_current_work} className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl font-bold disabled:opacity-30" value={exp.end_month || ""} onChange={(e) => updateExpField(exp.id, "end_month", e.target.value)}>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">{"Tahun Selesai"}</label>
                      <input type="number" placeholder="YYYY" disabled={exp.is_current_work} className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl font-bold disabled:opacity-30" value={exp.end_year || ""} onChange={(e) => updateExpField(exp.id, "end_year", e.target.value)} />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <input type="checkbox" checked={exp.is_current_work} onChange={(e) => updateExpField(exp.id, "is_current_work", e.target.checked)} className="w-5 h-5 accent-blue-600" />
                  <span className="text-[11px] font-black uppercase text-blue-600 italic">{"Masih aktif bekerja di sini"}</span>
                </label>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">{"Deskripsi Tanggung Jawab"}</label>
                  <textarea rows={3} className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl font-bold focus:border-blue-600 outline-none" value={exp.description} onChange={(e) => updateExpField(exp.id, "description", e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-blue-600 transition-all shadow-2xl disabled:opacity-50">
            {loading ? "Sinkronisasi..." : <><Save size={20} aria-hidden="true" /> {"Simpan Riwayat Karir"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
