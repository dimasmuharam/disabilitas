"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, BarChart3, BadgeCheck, 
  ExternalLink, User, GraduationCap, 
  Briefcase, Filter, ArrowLeft,
  FileSearch, CheckCircle2, Clock
} from "lucide-react";

interface TalentTracerProps {
  partnerName: string;
  partnerId: string;
  onBack: () => void;
}

export default function TalentTracer({ partnerName, partnerId, onBack }: TalentTracerProps) {
  const [talents, setTalents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ alumni: 0, hired: 0 });

  useEffect(() => {
    fetchAffiliatedTalents();
  }, [partnerName]);

  async function fetchAffiliatedTalents() {
    setLoading(true);
    try {
      // 1. Cari ID Talenta yang punya sertifikat dari institusi ini
      const { data: certs } = await supabase
        .from("certifications")
        .select("profile_id")
        .eq("organizer_name", partnerName);
      
      const certIds = certs?.map(c => c.profile_id) || [];

      // 2. Tarik Profil lengkap yang:
      // - Menyebut nama institusi di kolom 'university'
      // - ATAU ID-nya ada di daftar sertifikat di atas
      // - ATAU dikunci secara manual oleh partner ini (admin_partner_lock)
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id, full_name, career_status, university, graduation_date,
          disability_type, location, skills,
          certifications (id, title, issue_date, credential_id)
        `)
        .or(`university.ilike.%${partnerName}%,id.in.(${certIds.length > 0 ? certIds.join(',') : '"00000000-0000-0000-0000-000000000000"'}),admin_partner_lock.eq.${partnerId}`)
        .order("full_name", { ascending: true });

      if (data) {
        setTalents(data);
        const hired = data.filter(t => !["Job Seeker", "Belum Bekerja"].includes(t.career_status)).length;
        setStats({ alumni: data.length, hired: hired });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredTalents = talents.filter(t => 
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER & TRACING STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Tracer Study & Verifikasi</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Melacak {stats.alumni} talenta terintegrasi dengan {partnerName}
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Cari Nama Alumni..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-slate-900 transition-all font-bold text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* QUICK ANALYTICS CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2.5rem] flex items-center gap-4">
           <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-100">
             <Briefcase size={20} />
           </div>
           <div>
             <p className="text-[9px] font-black uppercase text-emerald-700 opacity-70">Terserap Kerja</p>
             <p className="text-2xl font-black text-emerald-800">{stats.hired} <span className="text-sm font-bold opacity-60 italic">Talenta</span></p>
           </div>
        </div>
        <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-[2.5rem] flex items-center gap-4">
           <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-100">
             <Clock size={20} />
           </div>
           <div>
             <p className="text-[9px] font-black uppercase text-blue-700 opacity-70">Tracing Accuracy</p>
             <p className="text-2xl font-black text-blue-800">High <span className="text-sm font-bold opacity-60 italic">(Real-time)</span></p>
           </div>
        </div>
      </div>

      {/* TALENT LIST TABLE-LIKE CARDS */}
      {loading ? (
        <div className="p-20 text-center font-black animate-pulse text-slate-300 uppercase italic">Sinkronisasi Data Alumni...</div>
      ) : (
        <div className="space-y-4">
          {filteredTalents.length > 0 ? filteredTalents.map((talenta) => (
            <div key={talenta.id} className="bg-white p-6 md:p-8 rounded-[3rem] border-2 border-slate-50 hover:border-slate-200 transition-all group overflow-hidden relative">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                
                {/* Profile Brief */}
                <div className="flex gap-5 items-start">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <User size={28} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black uppercase italic text-lg tracking-tighter text-slate-900 leading-none">
                      {talenta.full_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[9px] font-black text-blue-600 uppercase italic flex items-center gap-1">
                        <GraduationCap size={12}/> {talenta.university || "Afiliasi Sertifikat"}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-3">
                        {talenta.disability_type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Employment Status */}
                <div className="px-6 py-2 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5 tracking-widest">Status Karir</p>
                   <p className={`text-[10px] font-black uppercase italic ${
                     talenta.career_status === 'Job Seeker' ? 'text-orange-500' : 'text-emerald-600'
                   }`}>
                     {talenta.career_status}
                   </p>
                </div>

                {/* Certificates Verification Badge */}
                <div className="flex items-center gap-2">
                  {talenta.certifications?.length > 0 ? (
                    <div className="flex -space-x-2">
                      {talenta.certifications.slice(0, 3).map((c: any) => (
                        <div key={c.id} title={c.title} className="w-8 h-8 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center text-emerald-500">
                          <BadgeCheck size={14} />
                        </div>
                      ))}
                      {talenta.certifications.length > 3 && (
                         <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                           +{talenta.certifications.length - 3}
                         </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-300 italic uppercase">Belum ada sertifikat terverifikasi</span>
                  )}
                </div>

                {/* Detail Action */}
                <button className="flex items-center gap-3 bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
                   Cek Profil Lengkap <ExternalLink size={14} />
                </button>
              </div>

              {/* Decorative Background Icon */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <FileSearch size={120} />
              </div>
            </div>
          )) : (
            <div className="p-20 text-center border-4 border-dashed border-slate-100 rounded-[4rem]">
              <p className="text-slate-300 font-black uppercase italic tracking-tighter">Tidak ada data alumni yang cocok.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
