"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, BookOpen, Calendar, MapPin, 
  ChevronRight, Trash2, Edit3, Globe,
  CheckCircle2, AlertTriangle, X
} from "lucide-react";
import { DISABILITY_TYPES, SKILLS_LIST } from "@/lib/data-static";

interface ProgramManagerProps {
  partnerId: string;
  onBack: () => void;
}

export default function ProgramManager({ partnerId, onBack }: ProgramManagerProps) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    syllabus: "",
    category: "Pelatihan Keahlian",
    target_disability: [] as string[],
    provided_skills: [] as string[],
    start_date: "",
    end_date: "",
    location: "Online / Remote",
    is_published: true
  });

  useEffect(() => {
    fetchPrograms();
  }, [partnerId]);

  async function fetchPrograms() {
    setLoading(true);
    const { data } = await supabase
      .from("trainings")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });
    
    if (data) setPrograms(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from("trainings")
      .insert([{ ...formData, partner_id: partnerId }]);

    if (!error) {
      setIsAdding(false);
      fetchPrograms();
      // Reset Form
      setFormData({
        title: "", description: "", syllabus: "", category: "Pelatihan Keahlian",
        target_disability: [], provided_skills: [], start_date: "", end_date: "",
        location: "Online / Remote", is_published: true
      });
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER MODUL */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Kelola Program Pelatihan</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Publikasikan program pengembangan SDM inklusif Anda</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] hover:bg-blue-600 transition-all shadow-lg"
          >
            <Plus size={16} /> Buat Program Baru
          </button>
        )}
      </div>

      {isAdding ? (
        /* FORM TAMBAH PROGRAM */
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 space-y-8 shadow-2xl shadow-slate-100">
          <div className="flex justify-between items-center border-b pb-6">
            <h3 className="font-black uppercase italic text-lg text-blue-600 italic">Formulir Program Baru</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kolom Kiri: Informasi Dasar */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Judul Program</label>
                <input 
                  required
                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-bold"
                  placeholder="Contoh: Pelatihan Digital Marketing Inklusif"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal Mulai</label>
                  <input 
                    type="date" required
                    className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal Selesai</label>
                  <input 
                    type="date" required
                    className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lokasi / Link Pertemuan</label>
                <input 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold"
                  placeholder="Contoh: Zoom / Alamat Kantor"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            {/* Kolom Kanan: Target & Skills */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Ragam Disabilitas</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-slate-50 rounded-2xl no-scrollbar border-2 border-slate-50">
                  {DISABILITY_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase cursor-pointer hover:text-slate-900">
                      <input 
                        type="checkbox"
                        checked={formData.target_disability.includes(type)}
                        onChange={(e) => {
                          const val = e.target.checked 
                            ? [...formData.target_disability, type]
                            : formData.target_disability.filter(t => t !== type);
                          setFormData({...formData, target_disability: val});
                        }}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Skill yang Akan Didapat</label>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border-2 border-slate-50">
                  {SKILLS_LIST.slice(0, 10).map(skill => (
                    <button
                      key={skill} type="button"
                      onClick={() => {
                        const val = formData.provided_skills.includes(skill)
                          ? formData.provided_skills.filter(s => s !== skill)
                          : [...formData.provided_skills, skill];
                        setFormData({...formData, provided_skills: val});
                      }}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${
                        formData.provided_skills.includes(skill) ? "bg-slate-900 text-white" : "bg-white text-slate-400 border border-slate-200"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deskripsi & Silabus Singkat</label>
            <textarea 
              rows={4}
              className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none font-medium text-slate-700"
              placeholder="Jelaskan apa yang akan dipelajari dan manfaat program ini..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-blue-100">
            Publikasikan Program Sekarang
          </button>
        </form>
      ) : (
        /* DAFTAR PROGRAM YANG ADA */
        <div className="grid grid-cols-1 gap-4">
          {programs.length > 0 ? programs.map((prog) => (
            <div key={prog.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-slate-200 transition-all">
              <div className="flex gap-6 items-center">
                <div className="bg-slate-100 p-4 rounded-[1.5rem] text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 className="font-black uppercase italic tracking-tighter text-slate-900 text-lg leading-tight">{prog.title}</h4>
                  <div className="flex flex-wrap gap-4 mt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={12}/> {prog.start_date} - {prog.end_date}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><MapPin size={12}/> {prog.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-all">
                  <Edit3 size={18} />
                </button>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                  <Trash2 size={18} />
                </button>
                <button className="ml-4 flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg">
                  Detail Pendaftar <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center border-4 border-dashed border-slate-100 rounded-[4rem]">
              <p className="text-slate-300 font-black uppercase italic tracking-tighter">Belum ada program pelatihan yang dibuat.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
