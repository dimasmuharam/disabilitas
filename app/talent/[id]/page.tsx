import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { 
  User, GraduationCap, Briefcase, Award, MapPin, 
  Linkedin, Globe, CheckCircle, 
  Building2, Calendar, ShieldCheck, MessageSquare,
  ExternalLink, Laptop, Heart, Users, Mail, Phone
} from "lucide-react"

export const runtime = 'edge';
export const revalidate = 60 

/**
 * GENERATE METADATA & CANONICAL
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, disability_type')
    .eq('id', params.id)
    .single()

  if (!profile) return {}

  return {
    title: `${profile.full_name} | Profil Profesional Talenta Inklusif`,
    description: `Hubungi ${profile.full_name}, talenta ${profile.disability_type} di disabilitas.com. Lihat rekam jejak dan keahlian profesionalnya.`,
    alternates: {
      canonical: `https://www.disabilitas.com/talent/${params.id}`,
    },
  }
}

// Helper Kalkulasi Usia
function calculateAge(birthDate: string) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

async function getTalentProfile(id: string) {
  // Pastikan memanggil relasi dengan benar
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

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }
  const videoId = profile.video_intro_url ? getYoutubeId(profile.video_intro_url) : null
  const age = calculateAge(profile.date_of_birth);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* HEADER / BANNER AREA */}
      <div className="bg-slate-900 text-white pt-24 pb-40 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="w-28 h-28 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-5xl font-black mb-8 shadow-2xl border-4 border-white/10 uppercase italic">
            {profile.full_name?.substring(0, 2)}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 leading-none flex items-center justify-center gap-3">
            {profile.full_name}
            {profile.is_verified && <ShieldCheck size={36} className="text-blue-400 fill-blue-400/10" />}
          </h1>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
              {profile.disability_type}
            </span>
            <span className="px-5 py-2 bg-white/10 border border-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-blue-300 flex items-center gap-2">
              <Briefcase size={14}/> {profile.career_status || "Professional"}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">
            <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> {profile.city || "Indonesia"}</span>
            <span className="flex items-center gap-2"><Users size={16} className="text-blue-500"/> {profile.gender || "Tidak Disebutkan"}</span>
            {age && <span className="flex items-center gap-2"><Calendar size={16} className="text-blue-500"/> {age} Tahun</span>}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-5xl mx-auto px-4 -mt-28 relative z-20 space-y-8">
        
        {/* VIDEO SECTION */}
        {videoId && (
          <div className="bg-white rounded-[3rem] p-4 shadow-2xl border border-slate-200">
            <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-black shadow-inner">
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`} title="Video Perkenalan" frameBorder="0" allowFullScreen></iframe>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* RINGKASAN */}
            <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
              <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600 mb-6">{"Ringkasan Profesional"}</h2>
              <p className="text-lg text-slate-700 leading-relaxed font-medium italic text-justify">
                {"\""}{profile.bio || `Saya adalah ${profile.full_name}, profesional yang siap berkontribusi.`}{"\""}
              </p>
            </section>

            {/* PENGALAMAN KERJA (Sinkron dengan Database) */}
            <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
              <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600 mb-10 flex items-center gap-3">
                <Briefcase size={20}/> {"Pengalaman Karir"}
              </h2>
              <div className="space-y-12">
                {profile.work_experiences && profile.work_experiences.length > 0 ? (
                  profile.work_experiences.map((work: any) => (
                    <div key={work.id} className="relative pl-10 border-l-2 border-slate-100">
                      <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-none">{work.position}</h3>
                          <p className="text-blue-600 font-bold uppercase text-xs mt-2 flex items-center gap-1">
                            <Building2 size={14}/> {work.company_name} {work.company_location && `, ${work.company_location}`}
                          </p>
                        </div>
                        <span className="text-[10px] font-black uppercase px-3 py-1 bg-slate-100 text-slate-500 rounded-lg whitespace-nowrap">
                          {work.start_date} - {work.end_date || 'Sekarang'}
                        </span>
                      </div>
                      {work.description && (
                        <p className="text-sm text-slate-600 leading-relaxed text-justify bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                          {work.description}
                        </p>
                      )}
                      <div className="mt-4">
                        <span className="text-[9px] font-black uppercase text-slate-400 border border-slate-200 px-3 py-1 rounded-full">
                          {work.employment_type}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm italic text-slate-400 uppercase font-bold tracking-widest">{"Data riwayat pekerjaan belum tersedia."}</p>
                  </div>
                )}
              </div>
            </section>

            {/* SERTIFIKASI & PELATIHAN */}
            <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
              <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-8 flex items-center gap-3">
                <Award size={22}/> {"Sertifikasi & Pelatihan"}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {profile.certifications && profile.certifications.length > 0 ? (
                  profile.certifications.map((cert: any) => (
                    <div key={cert.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-emerald-500 transition-all">
                      <h3 className="font-black text-slate-900 uppercase text-xs mb-2 group-hover:text-emerald-600">{cert.name}</h3>
                      <div className="space-y-1 text-[10px] font-bold text-slate-500 uppercase">
                        <p className="flex items-center gap-2"><Building2 size={12}/> {cert.organizer_name}</p>
                        <p className="flex items-center gap-2"><Calendar size={12}/> {cert.year}</p>
                      </div>
                      {cert.certificate_url && (
                        <a href={cert.certificate_url} target="_blank" className="mt-4 inline-flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase hover:underline">
                          {"Lihat Dokumen"} <ExternalLink size={12}/>
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 text-center py-6 text-sm italic text-slate-400 uppercase font-bold tracking-widest">
                    {"Belum ada sertifikasi yang dicantumkan."}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* AKOMODASI & AKSES (Penting untuk Aksesibilitas) */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-6 flex items-center gap-2">
                <Laptop size={18}/> {"Kebutuhan & Akses"}
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest">{"Alat Bantu Asistif"}</p>
                  <div className="flex flex-wrap gap-2">
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
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest">{"Preferensi Akomodasi"}</p>
                  <p className="text-xs font-bold leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                    {profile.preferred_accommodations || "Informasi belum tersedia."}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest">{"Preferensi Kerja"}</p>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Heart size={14} className="text-red-500"/> {profile.work_preference || "Fleksibel"}
                  </p>
                </div>
              </div>
            </section>

            {/* PENDIDIKAN */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                <GraduationCap size={18}/> {"Pendidikan"}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-blue-600 uppercase mb-1 tracking-widest">{profile.education_level}</p>
                  <h3 className="text-sm font-black uppercase tracking-tight">{profile.university}</h3>
                  <p className="text-xs font-bold text-slate-500 mt-1 uppercase italic">{profile.major}</p>
                  {profile.graduation_date && <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{"Lulus Tahun: "}{profile.graduation_date}</p>}
                </div>
              </div>
            </section>

            {/* KEAHLIAN (Dengan Jeda Aksesibel) */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                <Award size={18}/> {"Keahlian"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase">
                    {skill}{idx < profile.skills.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </section>

            {/* KONTAK */}
            <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
              <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-6">{"Hubungi Talenta"}</h2>
              <div className="space-y-3">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group">
                    <Linkedin size={18} className="text-blue-400 group-hover:scale-110 transition-all"/>
                    <span className="text-[10px] font-black uppercase tracking-widest">{"LinkedIn"}</span>
                  </a>
                )}
                {profile.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group">
                    <Globe size={18} className="text-emerald-400 group-hover:scale-110 transition-all"/>
                    <span className="text-[10px] font-black uppercase tracking-widest">{"Portfolio"}</span>
                  </a>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-2 tracking-widest">{"Metode Komunikasi"}</p>
                <p className="text-xs font-bold italic text-blue-400 flex items-center gap-2">
                  <MessageSquare size={14}/> {profile.communication_preference || "Dashboard / Email"}
                </p>
              </div>
            </section>

            {/* FOOTER */}
            <div className="text-center px-6">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{"DISABILITAS.COM PROFESSIONAL ID"}</p>
              <p className="text-[6px] text-slate-400 italic leading-tight">
                {"Data ditampilkan berdasarkan Informed Consent talenta untuk tujuan pengembangan karir inklusif."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
