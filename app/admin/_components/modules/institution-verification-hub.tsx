"use client"

import React, { useState, useEffect, useRef } from 'react'
import { 
  ShieldCheck, ExternalLink, Check, X, 
  Building2, School, Landmark, Handshake,
  Clock, Info, Search, AlertCircle, Loader2
} from 'lucide-react'
import { processVerification } from '@/lib/actions/admin'
import { createAdminClient } from '@/lib/supabase'

interface VerificationHubProps {
  queue: any[]
  onRefresh: () => void
}

export default function InstitutionVerificationHub({ queue, onRefresh }: VerificationHubProps) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [targetProfile, setTargetProfile] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  
  const detailRef = useRef<HTMLDivElement>(null)

  // Fetch profil lengkap lembaga saat sebuah request dipilih
  useEffect(() => {
    async function fetchFullProfile() {
      if (!selectedRequest) return
      
      setLoadingProfile(true)
      const admin = createAdminClient()
      const tableMap: any = {
        company: 'companies',
        partner: 'partners',
        campus: 'campuses',
        government: 'government'
      }

      const { data, error } = await admin
        .from(tableMap[selectedRequest.target_type])
        .select('*')
        .eq('id', selectedRequest.target_id)
        .single()

      if (!error) {
        setTargetProfile(data)
        // Pindahkan fokus ke area detail untuk Screen Reader
        detailRef.current?.focus()
      }
      setLoadingProfile(false)
    }

    fetchFullProfile()
  }, [selectedRequest])

  const handleAction = async (isApprove: boolean) => {
    if (!selectedRequest) return
    if (!isApprove && !adminNotes) {
      alert("Harap masukkan alasan penolakan di catatan admin.")
      return
    }

    setActionLoading(true)
    const result = await processVerification(
      selectedRequest.id,
      selectedRequest.target_id,
      selectedRequest.target_type,
      isApprove,
      adminNotes
    )

    if (result.success) {
      setSelectedRequest(null)
      setTargetProfile(null)
      setAdminNotes("")
      onRefresh()
    } else {
      alert("Gagal memproses: " + result.error)
    }
    setActionLoading(false)
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'company': return <Building2 size={20} />
      case 'campus': return <School size={20} />
      case 'government': return <Landmark size={20} />
      default: return <Handshake size={20} />
    }
  }

  const filteredQueue = queue.filter(item => 
    item.target_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.target_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
      
      {/* KIRI: DAFTAR ANTREAN (4 Column) */}
      <section className="xl:col-span-4 space-y-6">
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2">
              <Clock className="text-blue-600" size={18} /> Antrean Verifikasi
            </h2>
            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full">
              {queue.length} Request
            </span>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Cari ID atau Tipe..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-100 text-[10px] font-bold outline-none focus:border-blue-600"
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Cari dalam antrean"
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar" role="list" aria-label="Daftar Permohonan Verifikasi">
            {filteredQueue.map((req) => (
              <button
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                aria-selected={selectedRequest?.id === req.id}
                className={`w-full text-left p-4 rounded-3xl border-2 transition-all flex items-center justify-between ${
                  selectedRequest?.id === req.id 
                  ? "border-blue-600 bg-blue-50" 
                  : "border-slate-100 hover:border-slate-300 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${selectedRequest?.id === req.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>
                    {getIcon(req.target_type)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-900">{req.target_type}</p>
                    <p className="text-[8px] font-bold text-slate-400">{new Date(req.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <div className="size-2 rounded-full bg-blue-600 animate-pulse" />
              </button>
            ))}
            {queue.length === 0 && (
              <div className="text-center py-10">
                <ShieldCheck size={40} className="mx-auto text-slate-200 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">Semua akun sudah terverifikasi</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* KANAN: DETAIL REVIEW (8 Column) */}
      <section className="xl:col-span-8">
        {!selectedRequest ? (
          <div className="h-full min-h-[400px] rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <Info size={48} className="mb-4 opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest italic">Pilih antrean untuk memulai review</p>
          </div>
        ) : (
          <div 
            ref={detailRef}
            tabIndex={-1}
            className="rounded-[3rem] border-4 border-slate-900 bg-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] overflow-hidden outline-none"
          >
            {/* Header Detail */}
            <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-4 rounded-3xl shadow-lg">
                  {getIcon(selectedRequest.target_type)}
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">
                    {targetProfile?.name || "Loading..."}
                  </h3>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    ID: {selectedRequest.target_id} • {selectedRequest.target_type}
                  </p>
                </div>
              </div>
              <a 
                href={selectedRequest.document_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-50 transition-all"
                aria-label="Buka Link Google Drive di Tab Baru"
              >
                <ExternalLink size={16} /> Buka Dokumen G-Drive
              </a>
            </div>

            <div className="p-8">
              {loadingProfile ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Info Dasar */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-blue-600 border-b-2 border-blue-50 pb-2">Profil Lengkap Lembaga</h4>
                    <div className="space-y-4">
                      <div className="group">
                        <label className="text-[8px] font-black text-slate-400 uppercase">Website & Email</label>
                        <p className="text-xs font-bold text-slate-700">{targetProfile?.website || '-'} / {targetProfile?.email || '-'}</p>
                      </div>
                      <div className="group">
                        <label className="text-[8px] font-black text-slate-400 uppercase">Lokasi / Alamat</label>
                        <p className="text-xs font-bold text-slate-700">{targetProfile?.location || 'Lokasi tidak diisi'}</p>
                      </div>
                      <div className="group">
                        <label className="text-[8px] font-black text-slate-400 uppercase">NIB / Nomor Izin</label>
                        <p className="text-xs font-black text-blue-600 tracking-widest">{targetProfile?.nib_number || 'TIDAK ADA NIB'}</p>
                      </div>
                      <div className="group">
                        <label className="text-[8px] font-black text-slate-400 uppercase">Deskripsi Lembaga</label>
                        <p className="text-[10px] leading-relaxed font-medium text-slate-500 italic">
                          "{targetProfile?.description || 'Tidak ada deskripsi profil.'}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Aksi Verifikasi */}
                  <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                    <h4 className="text-[10px] font-black uppercase text-slate-900 flex items-center gap-2">
                      <AlertCircle size={14} /> Panel Keputusan
                    </h4>
                    
                    <div className="space-y-2">
                      <label htmlFor="admin_notes" className="text-[8px] font-black text-slate-400 uppercase ml-2">Catatan untuk Lembaga (Wajib jika menolak)</label>
                      <textarea 
                        id="admin_notes"
                        rows={4}
                        placeholder="Contoh: Link G-Drive tidak bisa dibuka, atau NIB tidak sesuai dengan nama lembaga..."
                        className="w-full rounded-2xl border-2 border-slate-200 p-4 text-[10px] font-bold outline-none focus:border-blue-600"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        disabled={actionLoading}
                        onClick={() => handleAction(false)}
                        className="flex items-center justify-center gap-2 bg-white border-2 border-red-500 text-red-600 px-4 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-red-50 disabled:opacity-50"
                      >
                        <X size={16} /> Tolak
                      </button>
                      <button 
                        disabled={actionLoading}
                        onClick={() => handleAction(true)}
                        className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-800 shadow-lg disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <><Check size={16} /> Approve</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}