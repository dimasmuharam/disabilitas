import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { 
  User, GraduationCap, Briefcase, Award, MapPin, 
  Linkedin, Globe, CheckCircle, 
  Building2, Calendar, ShieldCheck, MessageSquare,
  ExternalLink, Laptop, Heart, Users
} from "lucide-react"

export const runtime = 'edge';
export const revalidate = 60 

/**
 * GENERATE METADATA
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, disability_type')
    .eq('id', params.id)
    .single()

  if (!profile) return {}

  return {
    title: `${profile.full_name} | Profil Profesional`,
    description: `Lihat profil profesional ${profile.full_name}, talenta inklusif di disabilitas.com.`,
    alternates: {
      canonical: `https://www.disabilitas.com/talent/${params.id}`,
    },
  }
}

// Fungsi pembantu kalkulasi usia
function calculateAge(birthDate: string) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

async function getTalentProfile(id: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*, certifications(*), work_experiences(*)')
    .eq('id', id)
    .single()
  return data
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const profile = await getTalentProfile(params.id)

  if (!profile) return notFound()

  const videoId = profile.video_intro_url ? (url => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  })(profile.video_intro_url) : null;

  const age = calculateAge(profile.date_of_birth);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* BANNER */}
      <div className="bg-slate-900 text-white pt-24 pb-40 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="w-28 h-28 bg-blue-600 rounded-[2rem] flex items-center justify-center text-5xl font-black mb-8 shadow-2xl border-4 border-white/10 uppercase italic">
            {profile.full_name?.substring(0, 2)}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 leading-none flex items-center justify-center gap-3">
            {profile.full_name}
            {profile.is_verified && <ShieldCheck size={36} className="text-blue-400" />}
          </h1>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
              {profile.disability_type}
            </span>
            <span className="px-5 py-2 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-300 flex items-center gap-2">
              {profile.career_status || "Professional"}
            </span>
          </div>

          {/* INFORMASI DEMOGRAFI */}
          <div className="flex flex-wrap justify-center gap-6 text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">
            <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> {profile.city || "Indonesia"}</span>
            <span className="flex items-center gap-2"><Users size={16} className="text-blue-500"/> {profile.gender || "-"}</span>
            {age && <span className="flex items-center gap-2"><Calendar size={16} className="text-blue-500"/> {age} Tahun</span>}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-28 relative z-20 space-y-8">
        {/* VIDEO */}
        {videoId && (
          <div className="bg-white rounded-[3rem] p-4 shadow-2xl border border-slate-200">
            <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-black">
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`} title="Video Perkenalan" frameBorder="0" allowFullScreen></iframe>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* RIWAYAT KERJA */}
            <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
              <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600 mb-10 flex items-center gap-3">
                <Briefcase size={20}/> {"Pengalaman Karir"}
              </h2>
              <div className="space-y-12">
                {profile.work_experiences?.length > 0 ? profile.work_experiences.map((work: any) => (
                  <div key={work.id} className="relative pl-10 border-l-2 border-slate-100">
                    <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-blue-600 border-4 border-white"></div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-4">
                      <div>
                        <h3 className="text-xl font-black uppercase text-slate-900 leading-none">{work.position}</h3>
                        <p className="text-blue-600 font-bold uppercase text-xs mt-2 flex items-center gap-1">
                          <Building2 size={14}/> {work.company_name} {work.company_location && `, ${work.company_location}`}
                        </p>
                      </div>
                      <span className="text-[10px] font-black uppercase px-3 py-1 bg-slate-100 text-slate-500 rounded-lg">
                        {work.start_date} - {work.end_date || 'Sekarang'}
                      </span>
                    </div>
                    {work.description && <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">{work.description}</p>}
                    <div className="mt-3">
                      <span className="text-[9px] font-black uppercase text-slate-400 border border-slate-200 px-2 py-1 rounded">
                        {work.employment_type}
                      </span>
                    </div>
                  </div>
                )) : <p className="text-sm italic text-slate-400 text-center py-10">{"Data pengalaman kerja belum tersedia."}</p>}
              </div>
            </section>

            {/* SERTIFIKASI */}
            <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
              <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-8 flex items-center gap-3">
                <Award size={22}/> {"Sertifikasi & Pelatihan"}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {profile.certifications?.length > 0 ? profile.certifications.map((cert: any) => (
                  <div key={cert.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-emerald-500 transition-all">
                    <h3 className="font-black text-slate-900 uppercase text-xs mb-2 group-hover:text-emerald-600">{cert.name}</h3>
                    <div className="space-y-1 text-[10px] font-bold text-slate-500 uppercase">
                      <p className="flex items-center gap-2"><Building2 size={12}/> {cert.organizer_name}</p>
                      <p className="flex items-center gap-2"><Calendar size={12}/> {cert.year}</p>
                    </div>
                    {cert.certificate_url && (
                      <a href={cert.certificate_url} target="_blank" className="mt-4 inline-flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase">
                        {"Lihat Dokumen"} <ExternalLink size={12}/>
                      </a>
                    )}
                  </div>
                )) : <p className="md:col-span-2 text-center text-sm italic text-slate-400 py-6">{"Data sertifikasi belum tersedia."}</p>}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* AKOMODASI & AKSES */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-6 flex items-center gap-2">
                <Laptop size={18}/> {"Kebutuhan & Akses"}
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2">{"Alat Bantu Asistif"}</p>
                  <div className="flex flex-wrap gap-2" aria-label="Alat bantu yang digunakan">
                    {Array.isArray(profile.used_assistive_tools) && profile.used_assistive_tools.length > 0 ? (
                      profile.used_assistive_tools.map((tool: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-lg border border-blue-100">
                          {tool}{idx < profile.used_assistive_tools.length - 1 ? "," : ""}
                        </span>
                      ))
                    ) : <span className="text-xs italic text-slate-400">{"-"}</span>}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2">{"Preferensi Akomodasi"}</p>
                  <p className="text-xs font-bold leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {profile.preferred_accommodations || "Informasi belum tersedia."}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2">{"Preferensi Kerja"}</p>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Heart size={14} className="text-red-500"/> {profile.work_preference || "Fleksibel"}
                  </p>
                </div>
              </div>
            </section>

            {/* KEAHLIAN */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                <Award size={18}/> {"Keahlian"}
              </h2>
              <div className="flex flex-wrap gap-2" aria-label="Daftar keahlian">
                {profile.skills?.map((skill: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase">
                    {skill}{idx < profile.skills.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </section>
            
            {/* ... CONTACT & PENDIDIKAN (sama seperti sebelumnya) ... */}
          </div>
        </div>
      </div>
    </div>
  )
}
