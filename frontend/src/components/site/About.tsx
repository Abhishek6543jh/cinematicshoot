import manifestoImg from '../../assets/portfolio-street.jpg'

export default function About() {
  return (
    <section id="about" className="relative z-10 py-20 md:py-32 bg-black border-b border-white/5 reveal-on-scroll scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Manifesto Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2 className="font-heading text-xs font-black tracking-[0.3em] text-neon uppercase mb-3">
              STUDIO STORY
            </h2>
            <h3 className="font-heading text-3xl md:text-5xl font-black text-silver mb-8 leading-tight">
              WE DON'T CAPTURE DETAILS.<br />
              WE SCULPT <span className="text-neon">EMOTIONS</span>.
            </h3>
            
            <div className="font-sans text-neutral-400 text-base md:text-lg space-y-6 leading-relaxed">
              <p>
                Founded at the intersection of cinematic filmmaking and digital culture,
                <strong className="text-silver"> MR. CINEMATIC SHOOT</strong> is not a traditional photography agency. We are visual directors. We treat every shutter click like a single frame of a high-budget film production.
              </p>
              <p>
                From luxury car campaigns to high-end influencer branding, our goal is to build premium, stop-the-scroll assets that carry gravity. We design immersive lighting profiles, graded with cinematic color tables, to command presence.
              </p>
              <blockquote className="border-l-2 border-neon pl-6 py-1 my-8 font-heading text-sm md:text-base font-bold italic text-silver tracking-wide">
                "We don't shoot subjects. We shoot stories. Every angle has a screenplay, every light has a purpose."
              </blockquote>
              <p>
                Our team blends commercial scale with viral content speed. We deliver assets calibrated for high-growth Instagram Reels, prestige print campaigns, and editorial catalogs.
              </p>
            </div>
          </div>

          {/* Cinematic Side Image Framed Panel */}
          <div className="lg:col-span-5 relative">
            {/* Background neon ambient shadow glow */}
            <div className="absolute -inset-4 bg-neon/10 rounded-none blur-2xl z-0" />
            
            {/* Framed Image */}
            <div className="relative z-10 neon-border p-1 bg-black">
              <img
                src={manifestoImg}
                alt="Cinematic street alleyway illustration"
                className="w-full aspect-[3/4] object-cover filter brightness-90 saturate-[110%]"
              />
              {/* Scanline layer overlay */}
              <div className="absolute inset-0 pointer-events-none scanlines" />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
