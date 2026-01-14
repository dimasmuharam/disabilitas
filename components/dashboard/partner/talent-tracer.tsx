"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Award, CheckCircle2, Search, Download, ArrowLeft, 
  ShieldCheck, Briefcase, Timer, ExternalLink, Loader2
} from "lucide-react";
import Link from "next/link";
import { generateGraduationCertificate } from "./certificate-helper";

interface TalentTracerProps {
  partnerId: string;
  partnerName: string;
  onBack: () => void;
}

export default function TalentTracer({ partnerId, partnerName, onBack }: TalentTracerProps) {
  const [trainees, setTrainees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  
  const headingRef = useRef<HTMLHeadingElement>(null);

  // FETCH DATA: Mengambil data pendaftar yang diterima (accepted) atau sudah lulus (completed)
  const fetchTrainees = useCallback(async () => {
    setLoading(true);
    // Pastikan kolom total_hours, syllabus, dan provided_skills ikut diambil
    const { data, error } = await supabase
      .from("trainees")
      .select(`
        *,
        trainings (
          id, 
          title, 
          syllabus, 
          provided_skills, 
          total_hours, 
          start_date, 
          end_date
        ),
        profiles (
          id, 
          full_name, 
          career_status, 
          disability_type, 
          skills
        )
      `)
      .eq("partner_id", partnerId)
      .in("status", ["accepted", "completed"])
      .order("updated_at", { ascending: false });

    if (data) setTrainees(data);
    setLoading(false);
  }, [partnerId]);

  useEffect(() => {
    fetchTrainees();
    if (headingRef.current) headingRef.current.focus();
  }, [fetchTrainees]);

  // FUNGSI TOGGLE CHECKBOX (Aksesibel & Besar)
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // AKSI MASAL: Meluluskan semua talenta yang dipilih
  const handleBulkGraduation = async () => {
    if (selectedIds.length === 0) return;
    setProcessing(true);

    try {
      for (const id of selectedIds) {
        const item = trainees.find(t => t.id === id);
        if (!item || item.status === 'completed') continue;

        // Skill diambil otomatis dari output program (provided_skills)
        const skillOutput = item.trainings?.provided_skills || [];

        // 1. Update status di tabel trainees menjadi 'completed'
        const { error: traineeError } = await supabase
          .from("trainees")
          .update({ 
            status: "completed", 
            top_skills: skillOutput, 
            updated_at: new Date().toISOString() 
          })
          .eq("id", id);

        if (traineeError) throw traineeError;

        // 2. Insert ke tabel certifications (untuk riwayat sertifikat talenta)
        await supabase.from("certifications").insert({
          profile_id: item.profile_id,
          training_id: item.training_id,
          name: item.trainings?.title,
          organizer_name: partnerName,
          year: new Date().getFullYear().toString(),
          is_verified: true,
          verified_at: new Date().toISOString(),
          verified_by: partnerName
        });

        // 3. Sinkronisasi ke profil utama talenta (Update Skill Array)
        const currentSkills = item.profiles?.skills || [];
        const mergedSkills = Array.from(new Set([...currentSkills, ...skillOutput]));
        await supabase.from("profiles").update({ 
          skills: mergedSkills,
          updated_at: new Date().toISOString()
        }).eq("id", item.profile_id);
      }

      setSelectedIds([]);
      fetchTrainees();
      alert("Proses kelulusan dan penerbitan sertifikat berhasil.");
    } catch (err) {
      console.error("Gagal memproses kelulusan:", err);
      alert("Terjadi kesalahan sistem saat memproses kelulusan.");
    } finally {
      setProcessing(false);
    }
  };

  const filteredTrainees = trainees.filter(t => 
    t.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-6 border-b-4 border-slate-900 pb-8 md:flex-row md:items-center">
        <div>
          <button onClick={onBack} className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 transition-all hover:text-slate-900">
            <ArrowLeft size={16} /> Kembali
          </button>
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 outline-none leading-none">
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
            className="w-full rounded-2xl border-4 border-slate-100 bg-white p-4 pl-12 text-[11px] font-black uppercase outline-none transition-all focus:border-slate-900"
          />
        </div>
      </div>

      {/* AKSI MASAL (BULK CONTROL) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer select-none items-center gap-3 text-[10px] font-black italic uppercase">
            <input 
              type="checkbox" 
              className="size-8 rounded-lg border-2 border-white bg-transparent accent-blue-500 cursor-pointer"
              checked={selectedIds.length === filteredTrainees.filter(t => t.status === 'accepted').length && filteredTrainees.length > 0}
              onChange={() => {
                const candidates = filteredTrainees.filter(t => t.status === 'accepted').map(t => t.id);
                setSelectedIds(selectedIds.length === candidates.length ? [] : candidates);
              }}
            />
            Pilih Calon Lulusan ({selectedIds.length})
          </label>
        </div>
        <button 
          disabled={selectedIds.length === 0 || processing}
          onClick={handleBulkGraduation}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-[10px] font-black uppercase shadow-lg transition-all hover:bg-emerald-400 disabled:opacity-20"
        >
          {processing ? <Loader2 className="animate-spin" size={14}/> : <Award size={14}/>}
          Tandai Lulus & Terbitkan Sertifikat
        </button>
      </div>

      {/* KARTU STATISTIK */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex items-center gap-5 rounded-[2.5rem] bg-emerald-500 p-8 text-white shadow-xl">
          <Briefcase size={32} />
          <div>
            <p className="text-[10px] font-black leading-none uppercase opacity-80">Alumni Terserap Kerja</p>
            <p className="mt-1 text-3xl font-black tracking-tighter">
              {trainees.filter(t => t.status === "completed" && t.profiles?.career_status !== "Job Seeker").length} <span className="text-sm italic opacity-70">Talenta</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-xl">
          <Award size={32} className="text-blue-400" />
          <div>
            <p className="text-[10px] font-black leading-none uppercase opacity-80">Sertifikat Diterbitkan</p>
            <p className="mt-1 text-3xl font-black tracking-tighter">
              {trainees.filter(t => t.status === "completed").length} <span className="text-sm italic opacity-70">Dokumen</span>
            </p>
          </div>
        </div>
      </div>

      {/* LIST DATA TALENTA */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center font-black uppercase italic text-slate-300 animate-pulse">Sinkronisasi Database...</div>
        ) : filteredTrainees.length > 0 ? filteredTrainees.map((item) => (
          <div key={item.id} className={`group flex flex-col items-center justify-between gap-6 rounded-[2.5rem] border-4 p-8 transition-all md:flex-row ${
            selectedIds.includes(item.id) ? "border-blue-600 bg-blue-50" : "border-slate-900 bg-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
          }`}>
            <div className="flex flex-1 items-center gap-6 text-left">
              {item.status === 'accepted' ? (
                <input 
                  type="checkbox" 
                  className="size-10 cursor-pointer rounded-xl border-4 border-slate-900 accent-blue-600 focus:ring-4 focus:ring-blue-100"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
              ) : (
                <div className="rounded-3xl bg-emerald-50 p-5 text-emerald-600 shadow-inner">
                  <CheckCircle2 size={32} />
                </div>
              )}
              
              <div className="space-y-1">
                <h3 className="text-2xl font-black italic leading-none uppercase tracking-tighter text-slate-900">{item.profiles?.full_name}</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[9px] font-black italic uppercase text-blue-600">{item.trainings?.title}</span>
                  <span className="border-l-2 border-slate-200 pl-3 text-[9px] font-bold uppercase text-slate-400">{item.profiles?.disability_type}</span>
                </div>
                <div className="mt-2 inline-block rounded-lg bg-slate-100 px-3 py-1 text-[8px] font-black italic uppercase text-slate-500">
                  Status Karir: <strong className={item.profiles?.career_status === "Job Seeker" ? "text-orange-600" : "text-emerald-600"}>{item.profiles?.career_status}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {item.status === "completed" && (
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => generateGraduationCertificate(item, partnerName)}
                    className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-white px-6 py-4 text-[10px] font-black uppercase text-slate-900 shadow-md transition-all hover:bg-slate-50"
                  >
                    <Download size={16} /> Sertifikat
                  </button>
                  <Link href={`/talent/${item.profiles?.id}`} target="_blank" className="rounded-2xl bg-slate-100 p-4 text-slate-400 transition-all hover:text-slate-900">
                    <ExternalLink size={20} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="rounded-[3rem] border-4 border-dashed border-slate-100 py-32 text-center text-slate-200">
            <p className="text-xl font-black italic uppercase tracking-tighter">Data alumni tidak ditemukan</p>
          </div>
        )}
      </div>

      {/* FOOTER NOTE RISET */}
      <div className="flex items-start gap-4 rounded-3xl bg-blue-600 p-6 text-white shadow-2xl">
        <ShieldCheck className="shrink-0 text-blue-200" />
        <p className="text-left text-[10px] font-bold uppercase leading-relaxed tracking-widest opacity-90">
          <strong>Riset Impact:</strong> Meluluskan talenta akan otomatis mensinkronisasi <strong>Provided Skills</strong> dari program ke profil talenta. Ini membantu validasi data keahlian talenta secara real-time bagi industri.
        </p>
      </div>
    </div>
  );
}