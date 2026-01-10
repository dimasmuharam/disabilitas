"use client";

import React, { useState, useEffect, useCallback } from "react";
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

  const fetchAffiliatedTalents = useCallback(async () => {
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
  }, [partnerName, partnerId]);

  useEffect(() => {
    fetchAffiliatedTalents();
  }, [fetchAffiliatedTalents]);

  const filteredTalents = talents.filter(t => 
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 duration-500 animate-in fade-in">
      {/* HEADER & TRACING STATS */}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Tracer Study & Verifikasi</h2>
          <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-slate-400">
            Melacak {stats.alumni} talenta terintegrasi dengan {partnerName}
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Cari Nama Alumni..."
            className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 text-xs font-bold outline-none transition-all focus:border-slate-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* QUICK ANALYTICS CARD */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 rounded-[2.5rem] border-2 border-emerald-100 bg-emerald-50 p-6">
           <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-100">
             <Briefcase size={20} />
           </div>
           <div>
             <p className="text-[9px] font-black uppercase text-emerald-700 opacity-70">Terserap Kerja</p>
             <p className="text-2xl font-black text-emerald-800">{stats.hired} <span className="text-sm font-bold italic opacity-60">Talenta</span></p>
           </div>
        </div>
        <div className="flex items-center gap-4 rounded-[2.5rem] border-2 border-blue-100 bg-blue-50 p-6">
           <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-100">
             <Clock size={20} />
           </div>
           <div>
             <p className="text-[9px] font-black uppercase text-blue-700 opacity-70">Tracing Accuracy</p>
             <p className="text-2xl font-black text-blue-800">High <span className="text-sm font-bold italic opacity-60">(Real-time)</span></p>
           </div>
        </div>
      </div>

      {/* TALENT LIST TABLE-LIKE CARDS */}
      {loading ? (
        <div className="animate-pulse p-20 text-center font-black uppercase italic text-slate-300">Sinkronisasi Data Alumni...</div>
      ) : (
        <div className="space-y-4">
          {filteredTalents.length > 0 ? filteredTalents.map((talenta) => (
            <div key={talenta.id} className="group relative overflow-hidden rounded-[3rem] border-2 border-slate-50 bg-white p-6 transition-all hover:border-slate-200 md:p-8">
              <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                
                {/* Profile Brief */}
                <div className="flex items-start gap-5">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-all group-hover:bg-slate-900 group-hover:text-white">
                    <User size={28} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black uppercase italic leading-none tracking-tighter text-slate-900">
                      {talenta.full_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase italic text-blue-600">
                        <GraduationCap size={12}/> {talenta.university || "Afiliasi Sertifikat"}
                      </span>
                      <span className="border-l border-slate-200 pl-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        {talenta.disability_type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Employment Status */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-6 py-2">
                   <p className="mb-0.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Status Karir</p>
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
                        <div key={c.id} title={c.title} className="flex size-8 items-center justify-center rounded-full border-2 border-emerald-500 bg-white text-emerald-500">
                          <BadgeCheck size={14} />
                        </div>
                      ))}
                      {talenta.certifications.length > 3 && (
                         <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[8px] font-black text-white">
                           +{talenta.certifications.length - 3}
                         </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[9px] font-bold uppercase italic text-slate-300">Belum ada sertifikat terverifikasi</span>
                  )}
                </div>

                {/* Detail Action */}
                <button className="flex items-center gap-3 rounded-2xl bg-slate-50 px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-slate-900 hover:text-white">
                   Cek Profil Lengkap <ExternalLink size={14} />
                </button>
              </div>

              {/* Decorative Background Icon */}
              <div className="absolute -bottom-4 -right-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
                <FileSearch size={120} />
              </div>
            </div>
          )) : (
            <div className="rounded-[4rem] border-4 border-dashed border-slate-100 p-20 text-center">
              <p className="font-black uppercase italic tracking-tighter text-slate-300">Tidak ada data alumni yang cocok.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
