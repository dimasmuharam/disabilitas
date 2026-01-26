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
    <div className="grid grid-cols-1 gap-8 duration-500 animate-in fade-in xl:grid-cols-12">
      
      {/* KIRI: DAFTAR ANTREAN (4 Column) */}
      <section className="space-y-6 xl:col-span-4">
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase italic tracking-tighter">
              <Clock className="text-blue-600" size={18} /> Antrean Verifikasi
            </h2>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black text-white">
              {queue.length} Request
            </span>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Cari ID atau Tipe..."
              className="w-full rounded-2xl border-2 border-slate-100 py-3 pl-10 pr-4 text-[10px] font-bold outline-none focus:border-blue-600"
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Cari dalam antrean"
            />
          </div>

          <div className="no-scrollbar max-h-[600px] space-y-3 overflow-y-auto" role="listbox" aria-label="Daftar Permohonan Verifikasi">
            {filteredQueue.map((req) => (
              <button
                key={req.id}
                role="option"
                onClick={() => setSelectedRequest(req)}
                aria-selected={selectedRequest?.id === req.id}
                className={`flex w-full items-center justify-between rounded-3xl border-2 p-4 text-left transition-all ${
                  selectedRequest?.id === req.id 
                  ? "border-blue-600 bg-blue-50" 
                  : "border-slate-100 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2 ${selectedRequest?.id === req.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>
                    {getIcon(req.target_type)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-900">{req.target_type}</p>
                    <p className="text-[8px] font-bold text-slate-400">{new Date(req.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <div className="size-2 animate-pulse rounded-full bg-blue-600" />
              </button>
            ))}
            {queue.length === 0 && (
              <div className="py-10 text-center">
                <ShieldCheck size={40} className="mx-auto mb-2 text-slate-200" />
                <p className="text-[10px] font-bold uppercase text-slate-400">Semua akun sudah terverifikasi</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* KANAN: DETAIL REVIEW (8 Column) */}
      <section className="xl:col-span-8">
        {!selectedRequest ? (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-slate-200 text-slate-400">
            <Info size={48} className="mb-4 opacity-20" />
            <p className="text-xs font-black uppercase italic tracking-widest">Pilih antrean untuk memulai review</p>
          </div>
        ) : (
          <div 
            ref={detailRef}
            tabIndex={-1}
            className="overflow-hidden rounded-[3rem] border-4 border-slate-900 bg-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] outline-none"
          >
            {/* Header Detail */}
            <div className="flex flex-col justify-between gap-6 bg-slate-900 p-8 text-white md:flex-row">
              <div className="flex items-center gap-4">
                <div className="rounded-3xl bg-blue-600 p-4 shadow-lg">
                  {getIcon(selectedRequest.target_type)}
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">
                    {targetProfile?.name || "Loading..."}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                    ID: {selectedRequest.target_id} • {selectedRequest.target_type}
                  </p>
                </div>
              </div>
              <a 
                href={selectedRequest.document_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-[10px] font-black uppercase text-slate-900 transition-all hover:bg-blue-50"
                aria-label="Buka Link Google Drive di Tab Baru"
              >
                <ExternalLink size={16} /> Buka Dokumen G-Drive
              </a>
            </div>

            <div className="p-8">
              {loadingProfile ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
              ) : (
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                  {/* Info Dasar */}
                  <div className="space-y-6">
                    <h4 className="border-b-2 border-blue-50 pb-2 text-[10px] font-black uppercase text-blue-600">Profil Lengkap Lembaga</h4>
                    <div className="space-y-4">
                      <div className="group">
                        <label className="text-[8px] font-black uppercase text-slate-400">Website & Email</label>
                        <p className="text-xs font-bold text-slate-700">{targetProfile?.website || '-'} / {targetProfile?.email || '-'}</p>
                      </div>
                      <div className="group">
                        <label className="text-[8px] font-black uppercase text-slate-400">Lokasi / Alamat</label>
                        <p className="text-xs font-bold text-slate-700">{targetProfile?.location || 'Lokasi tidak diisi'}</p>
                      </div>
                      <div className="group">
                        <label className="text-[8px] font-black uppercase text-slate-400">NIB / Nomor Izin</label>
                        <p className="text-xs font-black tracking-widest text-blue-600">{targetProfile?.nib_number || 'TIDAK ADA NIB'}</p>
                      </div>
                      <div className="group">
                        <label className="text-[8px] font-black uppercase text-slate-400">Deskripsi Lembaga</label>
                        <p className="text-[10px] font-medium italic leading-relaxed text-slate-500">
&quot;{targetProfile?.description || 'Tidak ada deskripsi profil.'}&quot;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Aksi Verifikasi */}
                  <div className="space-y-6 rounded-[2rem] border-2 border-slate-100 bg-slate-50 p-6">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-900">
                      <AlertCircle size={14} /> Panel Keputusan
                    </h4>
                    
                    <div className="space-y-2">
                      <label htmlFor="admin_notes" className="ml-2 text-[8px] font-black uppercase text-slate-400">Catatan untuk Lembaga (Wajib jika menolak)</label>
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
                        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-red-500 bg-white p-4 text-[10px] font-black uppercase text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <X size={16} /> Tolak
                      </button>
                      <button 
                        disabled={actionLoading}
                        onClick={() => handleAction(true)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 p-4 text-[10px] font-black uppercase text-white shadow-lg hover:bg-slate-800 disabled:opacity-50"
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