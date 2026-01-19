"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Share2, Download, CheckCircle, MapPin, Globe, Loader2 } from "lucide-react";
import { handleGovShare } from "./share-logic";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
  const [isDownloading, setIsDownloading] = useState(false);
  
  const publicUrl = `https://disabilitas.com/government/${govData.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`;

  // FUNGSI DOWNLOAD: Mengubah elemen HTML menjadi PDF Profesional
  const downloadCardAsPDF = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Sertifikat_Inklusi_${govData.location.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Gagal mengunduh kartu:", err);
      alert("Gagal mengunduh kartu. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* CARD CONTAINER - Desain Neobrutalism Formal */}
      <div 
        ref={cardRef}
        className="relative overflow-hidden rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:p-12"
        role="region"
        aria-label={`Kartu Performa Inklusi Wilayah ${govData.location}`}
      >
        {/* Decorative Element */}
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-emerald-50 opacity-50" aria-hidden="true" />
        
        {/* Header: Logos */}
        <div className="relative z-10 mb-10 flex items-center justify-between border-b-2 border-slate-100 pb-8">
          <div className="flex items-center gap-4">
            {govData.official_seal_url ? (
              <Image 
                src={govData.official_seal_url} 
                alt={`Logo Otoritas ${govData.name}`} 
                width={64}
                height={64}
                className="size-16 object-contain" 
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-400">
                PEMDA
              </div>
            )}
            <div className="h-10 w-[2px] bg-slate-200" aria-hidden="true" />
            <Image 
              src="/logo.png" 
              alt="disabilitas.com" 
              width={40}
              height={40}
              className="h-10 object-contain" 
            />
          </div>
          <div className="hidden text-right md:block">
            <span className="rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
              Official Inclusivity Partner
            </span>
          </div>
        </div>

        {/* Body: Content */}
        <div className="relative z-10 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">
              <CheckCircle size={14} aria-hidden="true" /> Wilayah Ramah Disabilitas
            </h3>
            <h2 className="mb-4 text-4xl font-black uppercase italic leading-none tracking-tighter text-slate-900">
              {govData.name}
            </h2>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
              <MapPin size={16} className="text-slate-400" aria-hidden="true" />
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
              alt="Scan QR untuk verifikasi data profil" 
              width={128}
              height={128}
              className="mb-4 size-32 rounded-xl border-4 border-white shadow-sm" 
            />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Verifikasi Profil</p>
            <p className="mt-1 text-[8px] font-bold uppercase italic text-slate-400">Data Real-time Otoritas</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-10 flex items-center justify-between border-t-2 border-slate-100 pt-6 text-[9px] font-bold uppercase tracking-widest text-slate-400">
          <span>Tahun Penerbitan: {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1">
            <Globe size={10} aria-hidden="true" /> disabilitas.com/portal-gov/{govData.location.toLowerCase().replace(/\s+/g, '')}
          </span>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => handleGovShare({
            locationName: govData.location,
            totalTalents: stats.total,
            hiredTalents: stats.hired,
            hiredPercentage: stats.percentage,
            url: publicUrl,
            mode: 'viral'
          })}
          className="flex flex-1 items-center justify-center gap-3 rounded-2xl border-4 border-slate-900 bg-emerald-400 py-5 font-black uppercase italic shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          aria-label="Bagikan Performa Inklusi ke Media Sosial"
        >
          <Share2 size={20} aria-hidden="true" />
          Bagikan Wilayah
        </button>
        
        <button 
          onClick={downloadCardAsPDF}
          disabled={isDownloading}
          className="flex items-center justify-center gap-3 rounded-2xl border-4 border-slate-900 bg-white px-8 py-5 font-black uppercase italic shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50"
          aria-label="Simpan Kartu Inklusi sebagai PDF"
        >
          {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} aria-hidden="true" />}
          {isDownloading ? "Memproses..." : "Simpan Sertifikat"}
        </button>
      </div>
    </div>
  );
}