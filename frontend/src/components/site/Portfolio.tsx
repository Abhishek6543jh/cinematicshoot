import { useState, useRef } from 'react'

interface PortfolioItem {
  id: number
  title: string
  category: string
  image: string
  video?: string
  aspect: string // aspect ratio helper
  instagramUrl: string // direct Instagram URL
}

export default function Portfolio() {
  const portfolioItems: PortfolioItem[] = [
    {
      id: 0,
      title: 'Neon Cyber Punk Cybernetics',
      category: 'FASHION',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693bd?auto=format&fit=crop&w=600&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-neon-makeup-looking-at-camera-39906-large.mp4',
      aspect: 'aspect-[3/4]',
      instagramUrl: 'https://www.instagram.com/reel/C8o7B9qS111/',
    },
    {
      id: 1,
      title: 'Midnight Stealth Car Commercial',
      category: 'CARS',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-black-car-driving-along-a-street-at-night-42277-large.mp4',
      aspect: 'aspect-square',
      instagramUrl: 'https://www.instagram.com/reel/C8o7B9qS222/',
    },
    {
      id: 2,
      title: 'Luxury Sunset Penthouse Romance',
      category: 'COUPLE',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-woman-in-a-wedding-dress-34289-large.mp4',
      aspect: 'aspect-[4/3]',
      instagramUrl: 'https://www.instagram.com/reel/C8o7B9qS333/',
    },
    {
      id: 3,
      title: 'Premium Brand Campaign Runway',
      category: 'BRAND',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-photographer-taking-photos-of-a-model-41981-large.mp4',
      aspect: 'aspect-square',
      instagramUrl: 'https://www.instagram.com/reel/C8o7B9qS444/',
    },
    {
      id: 4,
      title: 'Street-Style Vlogging Behind Scenes',
      category: 'INFLUENCER',
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-woman-recording-herself-with-a-smartphone-43034-large.mp4',
      aspect: 'aspect-[3/4]',
      instagramUrl: 'https://www.instagram.com/reel/C8o7B9qS555/',
    },
    {
      id: 5,
      title: 'Tokyo Nocturnal Neon Drive',
      category: 'STREET',
      image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-neon-lights-of-tokyo-streets-40763-large.mp4',
      aspect: 'aspect-[4/5]',
      instagramUrl: 'https://www.instagram.com/reel/C8o7B9qS666/',
    },
    {
      id: 6,
      title: 'Epic Mountain Peak Sunset Union',
      category: 'WEDDING',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-woman-in-a-wedding-dress-34289-large.mp4',
      aspect: 'aspect-[3/4]',
      instagramUrl: 'https://www.instagram.com/reel/C8o7B9qS777/',
    },
  ]

  return (
    <section id="portfolio" className="relative z-10 py-20 md:py-32 bg-black border-b border-white/5 reveal-on-scroll scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-xs font-black tracking-[0.3em] text-neon uppercase mb-3 animate-pulse">
            VISUAL PORTFOLIO
          </h2>
          <h3 className="font-heading text-3xl md:text-5xl font-black text-silver">
            OUR CINEMATIC RELEASES
          </h3>
        </div>

        {/* Masonry-like Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {portfolioItems.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleClick = () => {
    window.open(item.instagramUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="break-inside-avoid relative overflow-hidden group cursor-pointer border border-white/5 bg-neutral-950 rounded-2xl select-none"
    >
      <div className="relative w-full overflow-hidden">
        {/* Underlay Poster Image (Always visible first!) */}
        <img
          src={item.image}
          alt={item.title}
          className={`w-full ${item.aspect} object-cover transition-transform duration-750 ease-out group-hover:scale-105 filter brightness-75 group-hover:brightness-90 saturate-[105%]`}
        />
        
        {/* Overlay Hover-play Video */}
        {item.video && (
          <video
            ref={videoRef}
            src={item.video}
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-750 ease-out group-hover:scale-105 filter brightness-75 group-hover:brightness-90 saturate-[105%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10`}
          />
        )}

        <div className="absolute top-3 right-3 bg-black/60 px-2 py-0.5 rounded text-[8px] font-heading font-black tracking-widest text-neon border border-neon/20 z-20">
          REEL PREVIEW
        </div>
      </div>

      {/* Hover overlay panel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-35">
        <div className="flex justify-between items-end">
          <div>
            <span className="font-heading text-[9px] font-black tracking-widest text-neon uppercase mb-1 block">
              {item.category}
            </span>
            <h4 className="font-heading text-sm font-bold text-silver uppercase">
              {item.title}
            </h4>
          </div>
          
          {/* Instagram Action Logo Link */}
          <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-silver group-hover:border-neon group-hover:text-neon transition-colors duration-300 bg-black/50 hover:scale-105 active:scale-95 shadow-md">
            <svg
              className="w-4.5 h-4.5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
