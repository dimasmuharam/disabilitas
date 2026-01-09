"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, Search, FileDown, 
  ExternalLink, CheckCircle, XCircle, 
  Briefcase, GraduationCap, MapPin, 
  Wrench, ShieldCheck, Clock, Activity
} from "lucide-center";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ApplicantTracker({ company }: { company: any }) {
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (company?.id) {
      fetchApplicants();
    }
  }, [company?.id]);

  async function fetchApplicants() {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        jobs ( title ),
        profiles ( 
          *,
          work_experiences (*),
          certifications (*)
        )
      `)
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Applicants Error:", error);
    } else {
      setApplicants(data || []);
    }
    setLoading(false);
  }

  const handleUpdateStatus = async (appId: string, newStatus: string, talentName: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", appId);
      
    if (!error) {
      const statusText = newStatus === "accepted" ? "Diterima" : "Ditolak";
      setAnnouncement(`Konfirmasi sistem. Lamaran dari ${talentName} telah diperbarui menjadi ${statusText}.`);
      fetchApplicants();
    }
  };

  const parseToArray = (fieldData: any) => {
    if (!fieldData) return [];
    if (Array.isArray(fieldData)) return fieldData;
    if (typeof fieldData === 'string') {
      try {
        const parsed = JSON.parse(fieldData);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return fieldData.split(',').map(s => s.trim()).filter(s => s !== "");
      }
    }
    return [];
  };

  const filteredApplicants = applicants.filter(app => {
    const matchSearch = app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === 'applied').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
  };

  const generateProfessionalCV = async (app: any) => {
    const doc = new jsPDF();
    const p = app.profiles;
    doc.setFontSize(18);
    doc.text("BERKAS AUDIT TALENTA", 20, 20);
    doc.setFontSize(12);
    doc.text(`Nama Lengkap: ${p.full_name}`, 20, 35);
    doc.text(`Pendidikan: ${p.education_level} ${p.major}`, 20, 45);
    doc.text(`Institusi: ${p.university}`, 20, 55);
    doc.save(`CV_Audit_${p.full_name}.pdf`);
  };

  if (loading) return <div role="status" className="p-20 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest italic">Sinkronisasi Data Riset...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left pb-20">
      {/* Pengumuman untuk Screen Reader */}
      <div className="sr-only" aria-live="assertive" role="log">{announcement}</div>

      {/* --- STATISTIK --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label="Statistik Pelamar Kerja">
        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl italic border-2 border-slate-800">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
            <Activity size={12} className="text-blue-400" /> Total Lamaran
          </p>
          <p className="text-4xl font-black italic tracking-tighter leading-none">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 italic">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Clock size={12} className="text-orange-400" /> Sedang Direview
          </p>
          <p className="text-4xl font-black italic tracking-tighter leading-none text-orange-500">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 italic">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <CheckCircle size={12} className="text-emerald-400" /> Lolos Seleksi
          </p>
          <p className="text-4xl font-black italic tracking-tighter leading-none text-emerald-500">{stats.accepted}</p>
        </div>
      </div>

      {/* --- HEADER & FILTER --- */}
      <div className="flex flex-col md:flex-row justify-between gap-6 items-center pt-4">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-slate-900">
          <Users className="text-blue-600" size={24} aria-hidden="true" /> Applicant Tracker
        </h2>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <label htmlFor="search-input" className="sr-only">Cari pelamar berdasarkan nama</label>
            <input 
              id="search-input"
              placeholder="CARI NAMA TALENTA..." 
              className="w-full pl-6 pr-6 py-3 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-600 shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <label htmlFor="status-select" className="sr-only">Filter berdasarkan status lamaran</label>
            <select 
              id="status-select"
              onChange={(e) => setFilterStatus(e.target.value)} 
              className="px-6 py-3 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-600 shadow-sm bg-white cursor-pointer"
            >
              <option value="all">SEMUA STATUS</option>
              <option value="applied">BARU MASUK</option>
              <option value="accepted">DITERIMA</option>
              <option value="rejected">DITOLAK</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- DAFTAR PELAMAR --- */}
      <div className="grid gap-6" role="list" aria-label="Daftar talenta yang melamar">
        {filteredApplicants.length > 0 ? filteredApplicants.map((app) => {
          const p = app.profiles;
          const tools = parseToArray(p?.used_assistive_tools);
          const skills = parseToArray(p?.skills);

          return (
            <article key={app.id} role="listitem" className="bg-white p-8 md:p-10 rounded-[3.5rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-slate-900 transition-all shadow-sm">
              <div className="flex flex-col md:flex-row items-start gap-8 flex-1 w-full">
                <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center font-black text-4xl uppercase italic shadow-lg shrink-0" aria-hidden="true">
                  {p?.full_name?.charAt(0) || "?"}
                </div>
                
                <div className="space-y-4 max-w-2xl flex-1">
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-xl italic leading-none">{p?.full_name}</h4>
                    <p className="text-[10px] font-black text-blue-600 uppercase italic tracking-[0.2em] mt-2">Lamaran Untuk Posisi: {app.jobs?.title}</p>
                  </div>

                  {/* NARASI PROFESIONAL (SINKRON SKEMA DB & JEDA SCREEN READER) */}
                  <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 italic text-slate-700 leading-relaxed text-sm font-medium">
                    <span className="block mb-2">Pelamar ini berdomisili di <strong>{p?.city || "Lokasi tidak tersedia"}</strong>.</span>
                    
                    <span className="block mb-2">
                      Latar belakang pendidikan terakhir adalah <strong>{p?.education_level || "Jenjang Pendidikan"}</strong> jurusan <strong>{p?.major || "Bidang Jurusan"}</strong>.
                    </span>
                    
                    <span className="block mb-2">
                      Menyelesaikan studi dari <strong>{p?.university || "Institusi Pendidikan"}</strong> pada tahun kelulusan <strong>{p?.graduation_date || "Tahun"}</strong>.
                    </span>
                    
                    {skills.length > 0 && (
                      <span className="block mb-2">
                        Memiliki kompetensi profesional pada bidang: <strong>{skills.join(", ")}</strong>.
                      </span>
                    )}

                    {tools.length > 0 && (
                      <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-xs shadow-inner" aria-label="Informasi Dukungan Kerja">
                        <ShieldCheck size={14} className="inline mr-2" aria-hidden="true" />
                        Dalam bekerja, pelamar didukung dengan penggunaan alat bantu: <strong>{tools.join(", ")}</strong>.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION PANEL */}
              <div className="flex md:flex-col items-center gap-3 mt-8 md:mt-0 w-full md:w-auto">
                <button 
                  onClick={() => handleUpdateStatus(app.id, 'accepted', p?.full_name)} 
                  aria-label={`Terima lamaran dari ${p?.full_name}`}
                  className="flex-1 md:w-full p-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all border border-emerald-100 font-black uppercase text-[10px] italic shadow-sm"
                >
                  TERIMA
                </button>
                <button 
                  onClick={() => handleUpdateStatus(app.id, 'rejected', p?.full_name)} 
                  aria-label={`Tolak lamaran dari ${p?.full_name}`}
                  className="flex-1 md:w-full p-4 bg-red-50 text-red-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all border border-red-100 font-black uppercase text-[10px] italic shadow-sm"
                >
                  TOLAK
                </button>
                <div className="flex gap-2 w-full justify-center">
                  <button 
                    onClick={() => generateProfessionalCV(app)} 
                    className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl border border-slate-100 transition-colors" 
                    title="Cetak Berkas Audit"
                    aria-label={`Cetak berkas CV Audit untuk ${p?.full_name}`}
                  >
                    <FileDown size={20} aria-hidden="true" />
                  </button>
                  <a 
                    href={`/talent/${p?.id}`} 
                    target="_blank" 
                    className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl border border-slate-100 transition-colors" 
                    title="Buka Profil Lengkap"
                    aria-label={`Lihat profil publik milik ${p?.full_name}`}
                  >
                    <ExternalLink size={20} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          );
        }) : (
          <div className="p-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem] bg-slate-50/20">
            <Users className="mx-auto text-slate-200 mb-4" size={48} aria-hidden="true" />
            <p className="text-[11px] font-black uppercase text-slate-300 italic tracking-[0.3em]">Belum ada pelamar yang masuk untuk kriteria ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
