import { useState } from 'react'
import { Briefcase, MapPin, Clock, ArrowUpRight, X, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation } from '@tanstack/react-query'
import { settingsGetCareerHiring, applicationSubmit } from '../../server/auth.functions'

interface Job {
  id: number
  title: string
  location: string
  type: string
  description: string
  requirements: string[]
}

export default function Career() {
  const { data: hiringActive = true } = useQuery({
    queryKey: ['settings', 'career_hiring'],
    queryFn: () => settingsGetCareerHiring()
  })

  const [activeJob, setActiveJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    portfolioUrl: '',
    resumeUrl: '',
    message: '',
  })

  const submitMutation = useMutation({
    mutationFn: (args: {
      name: string
      email: string
      jobTitle: string
      portfolioUrl: string
      resumeUrl: string
      coverLetter?: string
    }) => applicationSubmit({ data: args }),
    onSuccess: (res) => {
      toast.success(`APPLICATION RECEIVED: SECURED APPLICATION ${res.id}. WE WILL REVIEW WITHIN 24 HOURS.`)
      setFormData({
        name: '',
        email: '',
        portfolioUrl: '',
        resumeUrl: '',
        message: '',
      })
      setActiveJob(null)
    },
    onError: (err: any) => {
      toast.error(`SUBMISSION FAILED: ${err.message || 'Error occurred.'}`)
    }
  })

  const isSubmitting = submitMutation.isPending

  const jobs: Job[] = [
    {
      id: 0,
      title: 'LEAD CINEMATOGRAPHER & DP',
      location: 'LOS ANGELES STUDIO',
      type: 'FULL TIME / ON SITE',
      description: 'Lead visual director for automotive and high-end model reels. Responsible for multi-camera logistics, lighting design profiles, and crew tracking.',
      requirements: [
        '5+ years experience on high-budget commercial/automotive shoots.',
        'Expert handling of RED V-Raptor and ARRI Alexa cameras.',
        'Extensive portfolio demonstrating active spatial lighting controls.',
      ],
    },
    {
      id: 1,
      title: 'SENIOR COLORIST & EDITOR',
      location: 'BEVERLY HILLS / REMOTE',
      type: 'CONTRACT / FLEXIBLE',
      description: 'Expert editor and DaVinci Resolve colorist. Deliver high-contrast, anamorphic look tables matching brand palettes (deep shadows, vibrant highlights).',
      requirements: [
        'Advanced workflow experience in DaVinci Resolve color spaces.',
        'Expert editing in Adobe Premiere Pro or Final Cut.',
        'Strong sense of pacing, sound design overlays, and hook timings.',
      ],
    },
    {
      id: 2,
      title: 'INFLUENCER CAMPAIGN COORDINATOR',
      location: 'BEVERLY HILLS HQ',
      type: 'FULL TIME / ON SITE',
      description: 'Manage creator campaigns, timeline deliverables, aesthetic guidelines, and storyboard client interfaces for lifestyle and fashion shoots.',
      requirements: [
        'Proven history managing high-growth influencer campaign logistics.',
        'Deep understanding of TikTok and Instagram Reels formatting and hook variables.',
        'Exceptional communication, scheduling, and contract details management.',
      ],
    },
  ]

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.portfolioUrl.trim() || !formData.resumeUrl.trim()) {
      toast.error('VALIDATION ERROR: PLEASE INPUT ALL COMPULSORY FIELDS.')
      return
    }

    if (!activeJob) return

    submitMutation.mutate({
      name: formData.name,
      email: formData.email,
      jobTitle: activeJob.title,
      portfolioUrl: formData.portfolioUrl,
      resumeUrl: formData.resumeUrl,
      coverLetter: formData.message
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <section id="career" className="relative z-10 py-20 md:py-32 bg-black border-b border-white/5 reveal-on-scroll scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-xs font-black tracking-[0.3em] text-neon uppercase mb-3">
            JOIN THE CREW
          </h2>
          <h3 className="font-heading text-3xl md:text-5xl font-black text-silver">
            ACTIVE PRODUCTION OPENINGS
          </h3>
        </div>

        {/* Job Listings Grid */}
        {!hiringActive ? (
          <div className="w-full text-center py-16 bg-neutral-950/40 border border-dashed border-white/10 p-8 glass flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-none bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 mb-2">
              <Briefcase size={20} className="animate-pulse" />
            </div>
            <h4 className="font-heading text-lg font-black text-neutral-400 tracking-wider">NO CURRENT HIRINGS AVAILABLE</h4>
            <p className="font-sans text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
              We are not currently recruiting for active production roles. Please check back later or submit your portfolio deck to our main contact mail.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="glass p-8 flex flex-col justify-between border border-white/5 hover:border-neon/30 transition-all duration-300 group"
              >
                <div>
                  {/* Header tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="glass px-2.5 py-1 border border-white/5 text-[9px] font-heading font-bold text-silver flex items-center gap-1 uppercase tracking-wider">
                      <MapPin size={10} className="text-neon" />
                      {job.location}
                    </span>
                    <span className="glass px-2.5 py-1 border border-white/5 text-[9px] font-heading font-bold text-neon flex items-center gap-1 uppercase tracking-wider">
                      <Clock size={10} />
                      {job.type}
                    </span>
                  </div>

                  {/* Job Title */}
                  <h4 className="font-heading text-base font-black text-silver group-hover:text-neon transition-colors duration-300 mb-4 tracking-[0.05em] uppercase">
                    {job.title}
                  </h4>

                  {/* Description */}
                  <p className="font-sans text-neutral-400 text-sm leading-relaxed mb-6">
                    {job.description}
                  </p>
                </div>

                {/* Action Apply button */}
                <div className="border-t border-white/5 pt-6 mt-6">
                  <button
                    onClick={() => setActiveJob(job)}
                    className="w-full py-3 glass border border-white/10 hover:border-neon hover:text-neon text-silver font-heading text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
                  >
                    APPLY FOR POSITION
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Career Application Modal */}
      {activeJob !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 select-none">
          <div className="absolute inset-0 cursor-default" onClick={() => setActiveJob(null)} />
          
          <div className="relative glass-neon w-full max-w-xl bg-black/80 p-8 border border-neon/30 z-10 animate-reveal-up">
            {/* Close */}
            <button
              onClick={() => setActiveJob(null)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neon transition-colors cursor-pointer bg-transparent border-0"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <span className="font-heading text-[9px] font-black tracking-widest text-neon uppercase block mb-1">
                APPLICATION PROTOCOL // {activeJob.type}
              </span>
              <h3 className="font-heading text-lg font-black text-silver tracking-wide uppercase">
                {activeJob.title}
              </h3>
            </div>

            {/* Requirements Bullet List */}
            <div className="mb-6 p-4 bg-neutral-950/40 border border-white/5">
              <span className="font-heading text-[9px] font-black tracking-widest text-neutral-500 uppercase block mb-2">
                MINIMUM CREDENTIALS:
              </span>
              <ul className="space-y-1.5 list-disc pl-4 text-xs text-neutral-400 font-sans leading-relaxed">
                {activeJob.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="font-heading text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. AIDEN MAVERICK"
                    className="bg-black border border-white/10 p-3.5 text-xs font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 w-full"
                    required
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="font-heading text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. ADMIN@AIDENMAVERICK.COM"
                    className="bg-black border border-white/10 p-3.5 text-xs font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Portfolio link */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="font-heading text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                    PORTFOLIO LINK / SHOWREEL *
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="e.g. HTTPS://BEHANCE.NET/AIDEN"
                    className="bg-black border border-white/10 p-3.5 text-xs font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 w-full"
                    required
                  />
                </div>

                {/* Resume URL */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="font-heading text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                    RESUME / CV LINK *
                  </label>
                  <input
                    type="url"
                    name="resumeUrl"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    placeholder="e.g. HTTPS://DRIVE.GOOGLE.COM/RESUME"
                    className="bg-black border border-white/10 p-3.5 text-xs font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 w-full"
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-heading text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                  MESSAGE / NOTES
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="INTRODUCE YOUR PRODUCTION PROFILE AND SYSTEM EXPERIENCE..."
                  rows={3}
                  className="bg-black border border-white/10 p-3.5 text-xs font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 w-full resize-none"
                />
              </div>

              {/* Apply Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-neon text-black font-heading text-xs font-black tracking-widest uppercase hover:neon-glow transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border-0"
                >
                  {isSubmitting ? (
                    'TRANSMITTING APPLICATION DATA...'
                  ) : (
                    <>
                      SUBMIT APPLICATION BRIEF
                      <Send size={10} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
