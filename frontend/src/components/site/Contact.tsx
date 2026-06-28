import { Mail, Phone, MapPin, Instagram, Youtube, Clapperboard, Linkedin } from 'lucide-react'

export default function Contact() {
  return (
    <section id="contact" className="relative z-10 py-20 md:py-32 bg-black border-b border-white/5 reveal-on-scroll scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Contact Details & Info (Left) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h2 className="font-heading text-xs font-black tracking-[0.3em] text-[#FF8A00] uppercase mb-3">
                CONTACT DIRECTORY
              </h2>
              <h3 className="font-heading text-3xl md:text-5xl font-black text-silver mb-8">
                HEADQUARTERS
              </h3>
              
              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-white/10 bg-neutral-900 flex items-center justify-center text-[#FF8A00] flex-shrink-0 rounded-xl">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="font-heading text-[9px] font-black tracking-widest text-neutral-400 uppercase block mb-1">
                      PRODUCTION DIRECT
                    </span>
                    <a href="tel:+13105550190" className="font-sans text-sm text-neutral-300 hover:text-[#FF8A00] transition-colors duration-300 no-underline font-medium">
                      +1 (310) 555-0190
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-white/10 bg-neutral-900 flex items-center justify-center text-[#FF8A00] flex-shrink-0 rounded-xl">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="font-heading text-[9px] font-black tracking-widest text-neutral-400 uppercase block mb-1">
                      PROJECT SUBMISSIONS
                    </span>
                    <a href="mailto:shoot@mrcinematic.com" className="font-sans text-sm text-neutral-300 hover:text-[#FF8A00] transition-colors duration-300 no-underline font-medium">
                      SHOOT@MRCINEMATIC.COM
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-white/10 bg-neutral-900 flex items-center justify-center text-[#FF8A00] flex-shrink-0 rounded-xl">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="font-heading text-[9px] font-black tracking-widest text-neutral-400 uppercase block mb-1">
                      STUDIO SUITE
                    </span>
                    <p className="font-sans text-sm text-neutral-400 leading-relaxed m-0 font-medium">
                      450 N RODEO DRIVE, BEVERLY HILLS, CA 90210
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Grid (Bottom Left) */}
            <div className="border-t border-white/5 pt-8 mt-12 lg:mt-0">
              <span className="font-heading text-[9px] font-black tracking-widest text-neutral-400 uppercase block mb-4">
                CHANNELS
              </span>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/10 bg-neutral-900 hover:bg-neutral-850 hover:border-[#FF8A00] text-neutral-400 hover:text-[#FF8A00] flex items-center justify-center transition-all duration-300 rounded-xl"
                  aria-label="Instagram profile"
                >
                  <Instagram size={18} />
                </a>
                
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/10 bg-neutral-900 hover:bg-neutral-850 hover:border-[#FF8A00] text-neutral-400 hover:text-[#FF8A00] flex items-center justify-center transition-all duration-300 rounded-xl"
                  aria-label="YouTube channel"
                >
                  <Youtube size={18} />
                </a>

                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/10 bg-neutral-900 hover:bg-neutral-850 hover:border-[#FF8A00] text-neutral-400 hover:text-[#FF8A00] flex items-center justify-center transition-all duration-300 rounded-xl"
                  aria-label="TikTok reels profile"
                >
                  <Clapperboard size={18} />
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/10 bg-neutral-900 hover:bg-neutral-850 hover:border-[#FF8A00] text-neutral-400 hover:text-[#FF8A00] flex items-center justify-center transition-all duration-300 rounded-xl"
                  aria-label="LinkedIn profile"
                >
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Clean Google Maps iframe (Right) */}
          <div className="lg:col-span-7 h-[350px] lg:h-auto relative overflow-hidden border border-white/10 p-1.5 bg-neutral-900 shadow-lg rounded-2xl">
            <iframe
              title="MR. CINEMATIC SHOOT HQ Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3304.453982420958!2d-118.40263658478418!3d34.06734028060144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc0a9d94943f%3A0xc07c92b2361665a!2sRodeo%20Dr%2C%20Beverly%20Hills%2C%20CA!5e0!3m2!1sen!2sus!4v1655387431227!5m2!1sen!2sus"
              className="w-full h-full border-0 rounded-xl filter invert-[92%] hue-rotate-180 brightness-[88%] contrast-[115%] saturate-[70%]"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
