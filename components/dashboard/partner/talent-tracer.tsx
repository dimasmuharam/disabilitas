"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import { 
  Award, CheckCircle2, Search, Download, ArrowLeft, 
  ShieldCheck, Briefcase, Timer, User, ExternalLink
} from "lucide-react";

interface TalentTracerProps {
  partnerId: string;
  partnerName: string;
  onBack: () => void;
}

export default function TalentTracer({ partnerId, partnerName, onBack }: TalentTracerProps) {
  const [trainees, setTrainees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk Modal Input Skill
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<any>(null);
  const [tempSkills, setTempSkills] = useState<string[]>(["", "", ""]);
  
  const headingRef = useRef<HTMLHeadingElement>(null);

  const fetchTrainees = useCallback(async () => {
    setLoading(true);
    // Mengambil pendaftar yang sudah diterima (accepted) ATAU sudah lulus (passed)
    const { data, error } = await supabase
      .from("trainees")
      .select(`
        *,
        trainings (id, title, start_date, end_date),
        profiles (id, full_name, city, skills, career_status, disability_type)
      `)
      .eq("partner_id", partnerId)
      .in("status", ["accepted", "passed"])
      .order("updated_at", { ascending: false });

    if (data) setTrainees(data);
    setLoading(false);
  }, [partnerId]);

  useEffect(() => {
    fetchTrainees();
    if (headingRef.current) headingRef.current.focus();
  }, [fetchTrainees]);

  // LOGIKA GENERATE SERTIFIKAT (Sama dengan v0.2.3 yang bonafit)
  const generatePDF = (item: any) => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(1.5); doc.rect(10, 10, 277, 190);
    doc.setLineWidth(0.5); doc.rect(12, 12, 273, 186);
    doc.setFont("helvetica", "bold"); doc.setFontSize(24); doc.setTextColor(37, 99, 235);
    doc.text("disabilitas.com", 148.5, 30, { align: "center" });
    doc.setTextColor(15, 23, 42); doc.setFontSize(28); doc.text("SERTIFIKAT KELULUSAN", 148.5, 60, { align: "center" });
    doc.setFontSize(36); doc.text(item.profiles?.full_name?.toUpperCase(), 148.5, 95, { align: "center" });
    doc.setFontSize(18); doc.text(item.trainings?.title, 148.5, 125, { align: "center" });
    if (item.top_skills?.length > 0) {
      doc.setFontSize(11); doc.setFont("helvetica", "bold");
      doc.text("KOMPETENSI TERVERIFIKASI:", 148.5, 156, { align: "center" });
      doc.setFont("helvetica", "italic"); doc.text(item.top_skills.join("  •  "), 148.5, 161, { align: "center" });
    }
    doc.save(`Sertifikat_${item.profiles?.full_name}.pdf`);
  };

  const processGraduation = async () => {
    const validSkills = tempSkills.filter(s => s.trim() !== "");
    const { error: traineeError } = await supabase
      .from("trainees")
      .update({ status: "passed", top_skills: validSkills, updated_at: new Date() })
      .eq("id", selectedTrainee.id);

    if (!traineeError) {
      await supabase.from("certifications").insert({
        profile_id: selectedTrainee.profile_id,
        training_id: selectedTrainee.training_id,
        name: selectedTrainee.trainings?.title,
        organizer_name: partnerName,
        year: new Date().getFullYear().toString(),
        is_verified: true,
        verified_at: new Date(),
        verified_by: partnerName
      });

      const currentSkills = selectedTrainee.profiles?.skills || [];
      const mergedSkills = Array.from(new Set([...currentSkills, ...validSkills]));
      await supabase.from("profiles").update({ skills: mergedSkills }).eq("id", selectedTrainee.profile_id);

      setShowSkillModal(false);
      fetchTrainees();
    }
  };

  const filteredTrainees = trainees.filter(t => 
    t.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-6 border-b-4 border-slate-900 pb-8 md:flex-row md:items-center">
        <div>
          <button onClick={onBack} className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-all">
            <ArrowLeft size={16} /> Kembali
          </button>
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 outline-none">
            Tracer Impact & Kelulusan
          </h1>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Cari Nama Alumni..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border-4 border-slate-100 bg-white p-4 pl-12 text-[11px] font-black uppercase outline-none focus:border-slate-900 transition-all"
          />
        </div>
      </div>

      {/* STATS FROM FILE LAMA (Monitoring Karir) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex items-center gap-5 rounded-[2.5rem] bg-emerald-500 p-8 text-white shadow-xl">
          <Briefcase size={32} />
          <div>
            <p className="text-[10px] font-black uppercase opacity-80 leading-none">Alumni Terserap Kerja</p>
            <p className="mt-1 text-3xl font-black tracking-tighter">
              {trainees.filter(t => t.status === "passed" && t.profiles?.career_status !== "Job Seeker").length} <span className="text-sm italic opacity-70">Talenta</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-xl">
          <Award size={32} className="text-blue-400" />
          <div>
            <p className="text-[10px] font-black uppercase opacity-80 leading-none">Total Kelulusan Diterbitkan</p>
            <p className="mt-1 text-3xl font-black tracking-tighter">
              {trainees.filter(t => t.status === "passed").length} <span className="text-sm italic opacity-70">Sertifikat</span>
            </p>
          </div>
        </div>
      </div>

      {/* LIST SECTION */}
      <div className="space-y-4">
        {filteredTrainees.length > 0 ? filteredTrainees.map((item) => (
          <div key={item.id} className="group flex flex-col items-center justify-between gap-6 rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] md:flex-row transition-all hover:border-blue-600">
            <div className="flex items-center gap-6 flex-1 text-left">
              <div className={`rounded-3xl p-5 shadow-inner ${item.status === 'passed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                {item.status === 'passed' ? <CheckCircle2 size={32} /> : <Timer size={32} className="animate-pulse" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase italic text-slate-900 leading-none tracking-tighter">{item.profiles?.full_name}</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[9px] font-black uppercase text-blue-600 italic">{item.trainings?.title}</span>
                  <span className="text-[9px] font-bold uppercase text-slate-400 border-l-2 border-slate-200 pl-3">{item.profiles?.disability_type}</span>
                </div>
                {/* MONITORING STATUS KARIR (Logic File Lama) */}
                <div className="mt-2 inline-block rounded-lg bg-slate-100 px-3 py-1 text-[8px] font-black uppercase text-slate-500 italic">
                  Status Saat Ini: <strong className={item.profiles?.career_status === "Job Seeker" ? "text-orange-600" : "text-emerald-600"}>{item.profiles?.career_status}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {item.status === "accepted" ? (
                <button 
                  onClick={() => { setSelectedTrainee(item); setShowSkillModal(true); }}
                  className="rounded-2xl bg-slate-900 px-8 py-4 text-[10px] font-black uppercase text-white hover:bg-emerald-600 shadow-lg"
                >
                  Proses Kelulusan
                </button>
              ) : (
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => generatePDF(item)}
                    className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-white px-6 py-4 text-[10px] font-black uppercase text-slate-900 hover:bg-slate-50 shadow-md"
                  >
                    <Download size={16} /> Sertifikat
                  </button>
                  <a href={`/talent/${item.profiles?.id}`} target="_blank" className="rounded-2xl bg-slate-100 p-4 text-slate-400 hover:text-slate-900">
                    <ExternalLink size={20} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-xl font-black uppercase italic text-slate-200 tracking-tighter">Data alumni tidak ditemukan</p>
          </div>
        )}
      </div>

      {/* MODAL INPUT SKILL (Bawahan v0.2.3) */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2.5rem] border-8 border-slate-900 bg-white p-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 text-left">Update Kompetensi</h2>
            <p className="mt-2 text-[11px] font-bold uppercase text-slate-400 text-left italic">Berikan validasi 3 skill utama untuk lulusan pelatihan Anda</p>
            <div className="mt-8 space-y-4">
              {tempSkills.map((skill, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Kompetensi Ke-${idx + 1}`}
                  value={skill}
                  onChange={(e) => {
                    const newSkills = [...tempSkills];
                    newSkills[idx] = e.target.value;
                    setTempSkills(newSkills);
                  }}
                  className="w-full rounded-2xl border-4 border-slate-100 bg-slate-50 p-4 font-black uppercase text-[12px] outline-none focus:border-slate-900 transition-all"
                />
              ))}
            </div>
            <div className="mt-10 flex gap-3">
              <button onClick={processGraduation} className="flex-1 rounded-2xl bg-slate-900 py-5 text-[11px] font-black uppercase italic text-white shadow-xl hover:bg-emerald-600 transition-all">
                Simpan & Terbitkan
              </button>
              <button onClick={() => setShowSkillModal(false)} className="rounded-2xl border-4 border-slate-900 bg-white px-8 py-5 text-[11px] font-black uppercase text-slate-900">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-blue-600 p-6 text-white flex items-start gap-4 shadow-2xl">
        <ShieldCheck className="shrink-0 text-blue-200" />
        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-left opacity-90">
          <strong>Tracer Note:</strong> Data <strong>Status Karir</strong> diambil langsung dari profil publik talenta secara real-time. Ini membantu Anda memantau efektivitas pelatihan terhadap keterserapan kerja lulusan Anda.
        </p>
      </div>
    </div>
  );
}
