"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Share2, Download, CheckCircle, MapPin, Globe } from "lucide-react";
import { handleGovShare } from "./share-logic";

interface GovInclusionCardProps {
  govData: {
    id: string;
    name: string;
    location: string;
    official_seal_url?: string;
  };
  stats: {
    total: number;
    hired: number;
    percentage: string;
  };
}

export default function GovInclusionCard({ govData, stats }: GovInclusionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const publicUrl = `https://disabilitas.com/government/${govData.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="flex flex-col gap-6">
      {/* CARD CONTAINER - Desain Neobrutalism Formal */}
      <div 
        ref={cardRef}
        className="relative overflow-hidden rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:p-12"
      >
        {/* Background Decorative Element */}
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-emerald-50 opacity-50" />
        
        {/* Header: Logos */}
        <div className="relative z-10 mb-10 flex items-center justify-between border-b-2 border-slate-100 pb-8">
          <div className="flex items-center gap-4">
            {govData.official_seal_url ? (
              <Image 
                src={govData.official_seal_url} 
                alt="Logo Pemda" 
                width={64}
                height={64}
                unoptimized={true}
                className="size-16 object-contain" 
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-400">
                PEMDA
              </div>
            )}
            <div className="h-10 w-[2px] bg-slate-200" />
            <Image 
              src="/logo.png" 
              alt="disabilitas.com" 
              width={40}
              height={40}
              unoptimized={true}
              className="h-10 object-contain" 
            />
          </div>
          <div className="hidden text-right md:block">
            <span className="rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
              Official Partner
            </span>
          </div>
        </div>

        {/* Body: Content */}
        <div className="relative z-10 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">
              <CheckCircle size={14} /> Wilayah Ramah Disabilitas
            </h3>
            <h2 className="mb-4 text-4xl font-black uppercase italic leading-none tracking-tighter text-slate-900">
              {govData.name}
            </h2>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
              <MapPin size={16} className="text-slate-400" />
              {govData.location}
            </div>
            
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border-2 border-slate-900 bg-slate-50 p-4">
                <p className="text-[9px] font-black uppercase text-slate-400">Talenta Terdaftar</p>
                <p className="text-2xl font-black text-slate-900">{stats.total}</p>
              </div>
              <div className="rounded-2xl border-2 border-slate-900 bg-emerald-400 p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <p className="text-[9px] font-black uppercase text-slate-900 opacity-70">Penempatan Kerja</p>
                <p className="text-2xl font-black text-slate-900">{stats.percentage}</p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <Image 
              src={qrCodeUrl} 
              alt="QR Verifikasi" 
              width={128}
              height={128}
              unoptimized={true}
              className="mb-4 size-32 rounded-xl border-4 border-white shadow-sm" 
            />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Scan untuk Verifikasi</p>
            <p className="mt-1 text-[8px] font-bold uppercase italic text-slate-400">Data Real-time disabilitas.com</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-10 flex items-center justify-between border-t-2 border-slate-100 pt-6 text-[9px] font-bold uppercase tracking-widest text-slate-400">
          <span>Diterbitkan: {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1">
            <Globe size={10} /> disabilitas.com/government/{govData.id.substring(0, 8)}
          </span>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => handleGovShare({
            locationName: govData.name,
            totalTalents: stats.total,
            hiredTalents: stats.hired,
            hiredPercentage: stats.percentage,
            url: publicUrl
          })}
          className="flex flex-1 items-center justify-center gap-3 rounded-2xl border-4 border-slate-900 bg-emerald-400 py-5 font-black uppercase italic shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          <Share2 size={20} />
          Bagikan ke WhatsApp
        </button>
        
        <button 
          onClick={() => window.print()} // Fallback sementara untuk simpan gambar
          className="flex items-center justify-center gap-3 rounded-2xl border-4 border-slate-900 bg-white px-8 py-5 font-black uppercase italic shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          <Download size={20} />
          Simpan PDF
        </button>
      </div>
    </div>
  );
}