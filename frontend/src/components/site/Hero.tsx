import { ArrowRight } from 'lucide-react'
import heroImage from '../../assets/hero-1.jpg'

export default function Hero() {
  const tickerItems = [
    'HIGH-END INFLUENCER BRANDING',
    'COMMERCIAL CAMPAIGNS',
    'LUXURY AUTOMOTIVE SHOOTS',
    'CINEMATIC INSTAGRAM REELS',
    'EDITORIAL FASHION & STYLING',
    'EXECUTIVE PORTRAITS',
    'CREATIVE DIRECTION',
  ]

  // Duplicate the ticker items list to allow seamless infinite loops
  const duplicatedTicker = [...tickerItems, ...tickerItems, ...tickerItems]

  const scrollToSection = (id: string) => {
    const element = document.querySelector(id) as HTMLElement | null
    if (element) {
      const absoluteTop = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: absoluteTop - 80,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="relative h-screen w-full flex flex-col justify-between overflow-hidden bg-black select-none">
      {/* Background Image Container with Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Cinematic Supercar Background"
          className="w-full h-full object-cover animate-blur-in filter brightness-90 saturate-[110%]"
        />
        {/* Radical Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.85)_85%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40" />
      </div>

      {/* Spacer to push content down */}
      <div />

      {/* Main Copy & CTAs */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-24">
        {/* Tagline */}
        <p className="font-heading text-xs md:text-sm font-black tracking-[0.25em] text-neon uppercase mb-4 animate-reveal-up opacity-0" style={{ animationDelay: '200ms' }}>
          WE DON'T TAKE PHOTOS — WE CREATE CINEMATIC STORIES.
        </p>

        {/* Main Headline */}
        <h1 className="font-heading text-4xl sm:text-6xl md:text-8xl font-black tracking-[0.02em] leading-none mb-8 animate-reveal-up opacity-0" style={{ animationDelay: '450ms' }}>
          <span className="text-gradient-silver">MR. </span>
          <span className="text-gradient-neon">CINEMATIC </span>
          <br className="hidden sm:inline" />
          <span className="text-gradient-silver">SHOOT</span>
        </h1>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-reveal-up opacity-0" style={{ animationDelay: '700ms' }}>
          <button
            onClick={() => scrollToSection('#booking')}
            className="w-full sm:w-auto px-8 py-4 bg-neon text-black font-heading text-xs font-black tracking-widest rounded-none shadow-[0_0_15px_rgba(255,122,0,0.3)] hover:neon-glow-lg transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
          >
            BOOK SHOOT
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Bottom Ticker Marquee */}
      <div className="relative z-10 w-full bg-black/80 backdrop-blur-md border-y border-white/5 py-4 overflow-hidden select-none">
        <div className="flex w-max animate-ticker whitespace-nowrap">
          {duplicatedTicker.map((item, idx) => (
            <span
              key={idx}
              className="font-heading text-[10px] md:text-xs font-black tracking-[0.2em] text-silver/40 hover:text-neon transition-colors duration-300 mx-8 flex items-center gap-3 cursor-default"
            >
              <span>{item}</span>
              <span className="w-1.5 h-1.5 bg-neon rounded-full" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
