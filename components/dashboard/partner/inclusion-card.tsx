"use client";

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { Share2, Download, GraduationCap, ShieldCheck } from "lucide-react";

interface InclusionCardProps {
  partner: any;
  stats: {
    total: number;
    rate: number;
  };
}

export default function InclusionCard({ partner, stats }: InclusionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const publicUrl = `https://disabilitas.com/partner/${partner?.id}`;

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      // 1. Convert HTML ke Gambar PNG
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      
      // 2. Buat File dari DataURL
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "Inclusion-Card.png", { type: "image/png" });

      const shareText = `Bangga menjadi bagian dari ekosistem inklusif! 🚀\n\n${partner?.name} telah melatih ${stats.total} talenta disabilitas dengan success rate ${stats.rate}% melalui disabilitas.com.\n\nMari bersama ciptakan dunia kerja yang setara! #InklusiBisa #DisabilitasWork`;

      // 3. Gunakan Native Share
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Impact Report Partner",
          text: shareText,
        });
      } else {
        // Fallback jika browser tidak support share file (Download saja)
        const link = document.createElement("a");
        link.download = "Inclusion-Card.png";
        link.href = dataUrl;
        link.click();
        alert("Gambar berhasil diunduh! Silakan bagikan secara manual ke media sosial.");
      }
    } catch (err) {
      console.error("Gagal membagikan kartu:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* DESAIN KARTU (Hidden dari layar, hanya untuk di-generate jadi gambar) */}
      <div className="absolute -left-[9999px] top-0">
        <div 
          ref={cardRef}
          className="relative size-[600px] overflow-hidden bg-slate-900 p-12 text-white"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {/* Efek Background */}
          <div className="absolute -right-20 -top-20 size-80 rounded-full bg-blue-600/20 blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-emerald-600/20 blur-[80px]" />

          {/* Header Kartu */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-600 p-2 text-white">
                <GraduationCap size={32} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase leading-none tracking-[0.3em] text-blue-400">Official Partner</p>
                <p className="mt-1 text-xs font-bold tracking-widest">disabilitas.com</p>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-white/20 px-4 py-2 text-right">
              <p className="text-[10px] font-black uppercase tracking-tighter">Impact Report</p>
              <p className="text-[10px] font-bold uppercase leading-none text-emerald-400">Periode 2026</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="mt-16 space-y-4 text-center">
            <h2 className="text-4xl font-black uppercase italic leading-tight tracking-tighter">
              {partner?.name}
            </h2>
            <div className="mx-auto h-1 w-20 rounded-full bg-blue-500" />
            <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-80">Mencetak Talenta Inklusif & Mandiri</p>
          </div>

          {/* Statistik Besar */}
          <div className="mt-12 grid grid-cols-2 gap-8 border-y-2 border-white/10 py-10">
            <div className="text-center">
              <p className="text-5xl font-black tracking-tighter text-blue-400">{stats.total}</p>
              <p className="mt-2 text-left text-[10px] font-black uppercase italic tracking-widest opacity-60">Talenta Dilatih</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black tracking-tighter text-emerald-400">{stats.rate}%</p>
              <p className="mt-2 text-left text-[10px] font-black uppercase italic tracking-widest text-blue-400 opacity-60">Success Rate</p>
            </div>
          </div>

          {/* QR Code & Footer */}
          <div className="mt-12 flex items-end justify-between">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Inclusion Verified</span>
              </div>
              <p className="max-w-[300px] text-[10px] font-medium italic leading-relaxed opacity-60">
                Ayo bergabung membangun ekosistem kerja yang setara bagi semua di <strong>disabilitas.com</strong>
              </p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-2xl">
              <QRCodeSVG value={publicUrl} size={80} />
            </div>
          </div>
        </div>
      </div>

      {/* Tombol yang muncul di Dashboard */}
      <button 
        onClick={handleShare}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-5 text-xs font-black uppercase italic tracking-widest text-white shadow-xl transition-all hover:bg-slate-900 active:scale-95"
        aria-label="Bagikan Inclusion Impact Card ke Media Sosial"
      >
        <Share2 size={20} /> Bagikan Impact Card
      </button>
    </div>
  );
}
