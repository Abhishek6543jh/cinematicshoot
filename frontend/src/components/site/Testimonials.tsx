import { useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  role: string
  quote: string
  reach: string
}

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials: Testimonial[] = [
    {
      id: 0,
      name: 'Aria Sterling',
      role: 'Luxury Lifestyle Influencer',
      quote: "MR. CINEMATIC SHOOT completely revolutionized my visual branding. The colors are incredibly deep and flat-out luxurious. Every reel we released went viral on release day.",
      reach: '2.4M Followers',
    },
    {
      id: 1,
      name: 'Marcus Hayes',
      role: 'Marketing Director, Apex Automotive',
      quote: "We hired them for our flagship electric supercar launch. The rig-shots and custom grading met international guidelines perfectly. They don't just take photos, they craft films.",
      reach: 'Global Brand Partner',
    },
    {
      id: 2,
      name: 'Katarina Volk',
      role: 'High-Fashion Designer & Model',
      quote: "The techwear lookbook shoot was a total masterpiece. They built a high-contrast cyberpunk atmosphere that made my designs pop like a high-budget sci-fi cinema block.",
      reach: '850K Followers',
    },
  ]

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  return (
    <section id="testimonials" className="relative z-10 py-20 md:py-32 bg-black border-b border-white/5 reveal-on-scroll">
      <div className="max-w-4xl mx-auto px-6 text-center relative">
        
        {/* Large Neon Quote Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-neon/5 border border-neon/20 flex items-center justify-center text-neon animate-neon-pulse shadow-[0_0_15px_rgba(255,122,0,0.15)]">
            <Quote size={28} className="fill-current rotate-180" />
          </div>
        </div>

        {/* Carousel Content */}
        <div className="min-h-[180px] flex flex-col justify-center mb-8 relative">
          {testimonials.map((item, idx) => (
            <div
              key={item.id}
              className={`transition-all duration-500 absolute inset-0 flex flex-col justify-center ${
                idx === activeIndex 
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                  : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
              }`}
            >
              <p className="font-heading text-lg md:text-2xl text-silver italic leading-relaxed tracking-wide mb-6">
                "{item.quote}"
              </p>
              <div>
                <h4 className="font-heading text-sm font-black text-neon tracking-wider uppercase mb-1">
                  {item.name}
                </h4>
                <p className="font-sans text-xs text-neutral-500 uppercase tracking-widest">
                  {item.role} • <span className="text-neutral-400">{item.reach}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Controls */}
        <div className="flex items-center justify-center gap-4 mt-8 pt-12 border-t border-white/5">
          <button
            onClick={handlePrev}
            className="w-10 h-10 border border-white/10 text-silver hover:border-neon hover:text-neon transition-all duration-300 flex items-center justify-center cursor-pointer"
            aria-label="Previous quote"
          >
            <ChevronLeft size={18} />
          </button>
          
          {/* Dot Indicators */}
          <div className="flex gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-1.5 h-1.5 transition-all duration-300 cursor-pointer ${
                  idx === activeIndex ? 'bg-neon w-6' : 'bg-neutral-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-10 h-10 border border-white/10 text-silver hover:border-neon hover:text-neon transition-all duration-300 flex items-center justify-center cursor-pointer"
            aria-label="Next quote"
          >
            <ChevronRight size={18} />
          </button>
        </div>

      </div>
    </section>
  )
}
