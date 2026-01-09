"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, Search, FileDown, 
  ExternalLink, CheckCircle, XCircle, 
  Briefcase, GraduationCap, MapPin, 
  Wrench, ShieldCheck, Clock, Activity
} from "lucide-react";
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

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", appId);
      
    if (!error) {
      setAnnouncement(`Status berhasil diubah menjadi ${newStatus}`);
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

  // VARIABEL KRUSIAL YANG TADI HILANG:
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

  // --- FUNGSI CETAK CV AUDIT ---
  const generateProfessionalCV = async (app: any) => {
    const doc = new jsPDF();
    const p = app.profiles;
    const work = p.work_experiences || [];
    const certs = p.certifications || [];

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("CURRICULUM VITAE - DISABILITAS.COM", 20, 20);
    doc.setFontSize(10);
    doc.text(`Posisi: ${app.jobs?.title} | Perusahaan: ${company.name}`, 20, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text((p.full_name || "NAMA TALENTA").toUpperCase(), 20, 55);
    doc.setFontSize(10);
    doc.text(`${p.disability_type || 'Talenta'} | ${p.city || '-'} | ${p.email || '-'}`, 20, 62);

    doc.setFontSize(12);
    doc.text("RINGKASAN PROFIL", 20, 75);
    doc.setFontSize(9);
    const summary = p.bio || "Talenta profesional yang berkomitmen dan siap berkontribusi secara inklusif.";
    const splitSummary = doc.splitTextToSize(summary, 170);
    doc.text(splitSummary, 20, 82);

    autoTable(doc, {
      startY: 110,
      head: [["Posisi", "Instansi", "Periode"]],
      body: work.map((w: any) => [w.position, w.company_name, `${w.start_date} - ${w.is_current_work ? 'Sekarang' : w.end_date}`]),
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`CV_Audit_${p.full_name}.pdf`);
  };

  if (loading) return <div className="p-20 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">Menyinkronkan Data Riset...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in text-left pb-20">
      <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

      {/* --- SECTION STATISTIK --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center italic">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1 flex items-center gap-2 italic">
            <Activity size={12} className="text-blue-400" /> Total Pelamar Masuk
          </p>
          <p className="text-4xl font-black italic tracking-tighter leading-none">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 flex flex-col justify-center shadow-sm italic">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2 italic">
            <Clock size={12} className="text-orange-400" /> Menunggu Review
          </p>
          <p className="text-4xl font-black italic tracking-tighter leading-none text-orange-500">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 flex flex-col justify-center shadow-sm italic">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2 italic">
            <CheckCircle size={12} className="text-emerald-400" /> Talenta Diterima
          </p>
          <p className="text-4xl font-black italic tracking-tighter leading-none text-emerald-500">{stats.accepted}</p>
        </div>
      </div>

      {/* --- SECTION HEADER & FILTER --- */}
      <div className="flex flex-col md:flex-row justify-between gap-6 items-center pt-4">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-slate-900">
          <Users className="text-blue-600" size={24} /> Applicant Tracker
        </h2>
        <div className="flex gap-4">
          <input 
            placeholder="Cari nama talenta..." 
            className="pl-6 pr-6 py-3 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-600 w-64 shadow-sm bg-white"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="px-6 py-3 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-600 shadow-sm bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="applied">Baru Masuk</option>
            <option value="accepted">Diterima</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {/* --- LIST PELAMAR --- */}
      <div className="grid gap-6">
        {filteredApplicants.length > 0 ? filteredApplicants.map((app) => {
          const p = app.profiles;
          const tools = parseToArray(p?.used_assistive_tools);
          const skills = parseToArray(p?.skills);

          return (
            <div key={app.id} className="bg-white p-8 md:p-10 rounded-[3.5rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-slate-900 transition-all shadow-sm">
              <div className="flex flex-col md:flex-row items-start gap-8 flex-1">
                <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center font-black text-4xl uppercase italic shadow-lg shrink-0">
                  {p?.full_name?.charAt(0) || "?"}
                </div>
                
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-xl italic leading-none">{p?.full_name}</h4>
                    <p className="text-[10px] font-black text-blue-600 uppercase italic tracking-[0.2em] mt-2">Melamar Posisi: {app.jobs?.title}</p>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 italic text-slate-700 leading-relaxed text-sm font-medium">
                    Pelamar ini berdomisili di <strong>{p?.city || "Kota/Kabupaten tidak tertera"}</strong>. 
                    Memiliki latar belakang pendidikan terakhir <strong>{p?.last_education_level || "Jenjang Pendidikan"}</strong> jurusan <strong>{p?.last_education_major || "Bidang Jurusan"}</strong> dari <strong>{p?.last_university_name || "Institusi Pendidikan"}</strong> tahun lulus <strong>{p?.graduation_year || "Tahun Lulus"}</strong>.
                    
                    {skills.length > 0 && (
                      <span> Pelamar memiliki keahlian utama dalam bidang <strong>{skills.join(", ")}</strong>.</span>
                    )}

                    {tools.length > 0 && (
                      <span className="block mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 text-xs">
                        <ShieldCheck size={14} className="inline mr-2" />
                        Dalam bekerja, pelamar didukung dengan penggunaan alat bantu: <strong>{tools.join(", ")}</strong>.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center gap-3 mt-8 md:mt-0 w-full md:w-auto">
                <button onClick={() => handleUpdateStatus(app.id, 'accepted')} className="flex-1 md:w-full p-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all border border-emerald-100 font-black uppercase text-[10px] italic">Terima</button>
                <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex-1 md:w-full p-4 bg-red-50 text-red-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all border border-red-100 font-black uppercase text-[10px] italic">Tolak</button>
                <div className="flex gap-2 w-full justify-center">
                  <button onClick={() => generateProfessionalCV(app)} className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl border border-slate-100"><FileDown size={20} /></button>
                  <a href={`/talent/${p?.id}`} target="_blank" className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl border border-slate-100"><ExternalLink size={20} /></a>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="p-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem] bg-slate-50/20">
            <Users className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-[11px] font-black uppercase text-slate-300 italic tracking-[0.3em]">Belum Ada Pelamar Yang Perlu Dimonitor</p>
          </div>
        )}
      </div>
    </div>
  );
}
