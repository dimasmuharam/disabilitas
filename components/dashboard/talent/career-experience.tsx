"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile, upsertWorkExperience } from "@/lib/actions/talent";
import { 
  Briefcase, DollarSign, Linkedin, FileText, 
  Plus, Trash2, Save, CheckCircle2, AlertCircle,
  Building2, Calendar, Layout, Globe
} from "lucide-react";
import { CAREER_STATUSES, WORK_MODES } from "@/lib/data-static";

interface CareerExperienceProps {
  user: any;
  profile: any;
  onSuccess?: () => void;
}

export default function CareerExperience({ user, profile, onSuccess }: CareerExperienceProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // State untuk Data Profil Utama (Tabel: profiles)
  const [profileData, setProfileData] = useState({
    bio: profile?.bio || "",
    career_status: profile?.career_status || "",
    work_preference: profile?.work_preference || "",
    linkedin_url: profile?.linkedin_url || "",
    expected_salary: profile?.expected_salary || "",
  });

  // State untuk Riwayat Kerja (Tabel: work_experiences)
  const [experiences, setExperiences] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newExp, setNewExp] = useState({
    position: "",
    company_name: "",
    duration: "",
    description: ""
  });

  useEffect(() => {
    if (user?.id) {
      fetchExperiences();
    }
  }, [user?.id]);

  async function fetchExperiences() {
    const { data, error } = await supabase
      .from("work_experiences")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching experiences:", error.message);
    } else if (data) {
      setExperiences(data);
    }
  }

  const handleAddExperience = async () => {
    if (!newExp.position || !newExp.company_name) {
      setMessage({ type: "error", text: "Posisi dan Nama Perusahaan wajib diisi" });
      return;
    }
    
    setLoading(true);
    const result = await upsertWorkExperience({
      ...newExp,
      profile_id: user.id
    });
    setLoading(false);

    if (result.success) {
      setNewExp({ position: "", company_name: "", duration: "", description: "" });
      setShowForm(false);
      fetchExperiences();
      setMessage({ type: "success", text: "Pengalaman kerja berhasil ditambahkan ke riwayat!" });
    } else {
      setMessage({ type: "error", text: `Gagal menambah: ${result.error}` });
    }
  };

  const handleDeleteExperience = async (id: string) => {
    const confirmDelete = confirm("Hapus riwayat kerja ini?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("work_experiences").delete().eq("id", id);
    if (!error) {
      fetchExperiences();
      setMessage({ type: "success", text: "Pengalaman kerja berhasil dihapus dari database." });
    } else {
      setMessage({ type: "error", text: "Gagal menghapus data." });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateTalentProfile(user.id, profileData);
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "Profil Karir & Gaji berhasil diperbarui secara real-time!" });
      if (onSuccess) onSuccess();
    } else {
      setMessage({ type: "error", text: `Error: ${result.error}` });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4">
          <Briefcase className="text-blue-600" size={36} />
          {"Karir & Pengalaman Kerja"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
          {"Informasi ini akan muncul pada CV PDF dan hasil pencarian HRD Perusahaan."}
        </p>
      </header>

      {/* NOTIFIKASI ARIA-LIVE (AKSESIBEL) */}
      {message.text && (
        <div 
          role="status" aria-live="polite" 
          className={`mb-8 mx-4 p-6 rounded-[2rem] flex items-center gap-4 border-2 ${
            message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
        </div>
      )}

      {/* SEKSI 1: PROFIL KARIR UTAMA */}
      <form onSubmit={handleSaveProfile} className="space-y-8 mb-16">
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-10">
          <h3 className="text-xs font-black uppercase text-blue-600 tracking-[0.2em] border-b border-slate-50 pb-4">{"Preferensi Profesional"}</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="career_status" className="text-[10px] font-black uppercase text-slate-400 px-2">{"Status Karir Saat Ini (Wajib)"}</label>
              <select 
                id="career_status" required
                value={profileData.career_status}
                onChange={(e) => setProfileData({...profileData, career_status: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all appearance-none"
              >
                <option value="">{"Pilih Status"}</option>
                {CAREER_STATUSES.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="expected_salary" className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-2"><DollarSign size={12}/> {"Ekspektasi Gaji (Wajib)"}</label>
              <input 
                id="expected_salary" required type="text" placeholder="Contoh: 5.000.000"
                value={profileData.expected_salary}
                onChange={(e) => setProfileData({...profileData, expected_salary: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="work_pref" className="text-[10px] font-black uppercase text-slate-400 px-2">{"Model Kerja Pilihan (Wajib)"}</label>
              <select 
                id="work_pref" required
                value={profileData.work_preference}
                onChange={(e) => setProfileData({...profileData, work_preference: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all appearance-none"
              >
                <option value="">{"Pilih Model Kerja"}</option>
                {WORK_MODES.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="linkedin" className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-2"><Linkedin size={12}/> {"Link Profil LinkedIn (Opsional)"}</label>
              <input 
                id="linkedin" type="url" placeholder="https://linkedin.com/in/username"
                value={profileData.linkedin_url}
                onChange={(e) => setProfileData({...profileData, linkedin_url: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-2"><FileText size={12}/> {"Ringkasan Profesional (Bio)"}</label>
            <textarea 
              id="bio" rows={5}
              placeholder="Ceritakan keahlian utama dan apa yang Anda tawarkan kepada pemberi kerja..."
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] font-medium text-sm outline-none focus:border-blue-600 transition-all italic leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" disabled={loading}
              className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100"
            >
              {loading ? "Sinkronisasi..." : <><Save size={20} /> {"Simpan Profil Karir"}</>}
            </button>
          </div>
        </section>
      </form>

      {/* SEKSI 2: DAFTAR PENGALAMAN (TABEL WORK_EXPERIENCES) */}
      <section className="space-y-8 px-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900">{"Riwayat Pekerjaan"}</h2>
          <button 
            type="button"
            onClick={() => setShowForm(!showForm)}
            className={`p-4 rounded-2xl transition-all flex items-center gap-3 font-black uppercase text-[10px] ${
              showForm ? "bg-red-50 text-red-600 border-2 border-red-100" : "bg-blue-50 text-blue-600 border-2 border-blue-100 hover:bg-blue-600 hover:text-white"
            }`}
          >
            {showForm ? "Batalkan" : <><Plus size={18} /> {"Tambah Pekerjaan"}</>}
          </button>
        </div>

        {/* FORM INPUT PEKERJAAN BARU */}
        {showForm && (
          <div className="bg-slate-50 border-4 border-dashed border-slate-200 p-10 rounded-[3rem] space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 px-2">{"Posisi / Jabatan"}</label>
                <input 
                  type="text" placeholder="Misal: Admin Staff"
                  value={newExp.position}
                  onChange={(e) => setNewExp({...newExp, position: e.target.value})}
                  className="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 px-2">{"Nama Perusahaan / Institusi"}</label>
                <input 
                  type="text" placeholder="Misal: PT Inklusi Digital"
                  value={newExp.company_name}
                  onChange={(e) => setNewExp({...newExp, company_name: e.target.value})}
                  className="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 px-2">{"Durasi Kerja"}</label>
                <input 
                  type="text" placeholder="Contoh: 2021 - Sekarang"
                  value={newExp.duration}
                  onChange={(e) => setNewExp({...newExp, duration: e.target.value})}
                  className="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2">{"Deskripsi Tanggung Jawab"}</label>
              <textarea 
                rows={3} placeholder="Apa saja yang Anda kerjakan di sana?"
                value={newExp.description}
                onChange={(e) => setNewExp({...newExp, description: e.target.value})}
                className="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600"
              />
            </div>
            <button 
              type="button"
              onClick={handleAddExperience} disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-2xl hover:bg-blue-600 transition-all"
            >
              {loading ? "Sedang Menambahkan..." : "Tambahkan ke Riwayat Profesional"}
            </button>
          </div>
        )}

        {/* LIST TAMPILAN PEKERJAAN */}
        <div className="space-y-6">
          {experiences.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[3rem] border-2 border-slate-50 italic">
              <Briefcase className="mx-auto text-slate-100 mb-4" size={48} />
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{"Belum ada riwayat kerja yang tercatat."}</p>
            </div>
          ) : (
            experiences.map((exp) => (
              <div key={exp.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6 group hover:border-blue-600 transition-all">
                <div className="flex gap-6 items-center">
                  <div className="bg-slate-900 p-5 rounded-2xl text-blue-400 shadow-lg group-hover:scale-110 transition-transform">
                    <Building2 size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black uppercase text-slate-900 leading-tight tracking-tight">{exp.position}</h4>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide italic">{exp.company_name}</p>
                    <div className="flex items-center gap-2 pt-2 text-[9px] font-black text-slate-400 uppercase">
                      <Calendar size={12} className="text-slate-900" /> {exp.duration}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 self-end md:self-center">
                  <button 
                    type="button"
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="bg-red-50 text-red-400 p-3 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    aria-label={`Hapus ${exp.position}`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
