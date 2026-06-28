import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Heart, Eye } from 'lucide-react'

interface ReelItem {
  id: number
  title: string
  videoUrl: string
  views: string
  likes: string
}

const DEFAULT_REELS: ReelItem[] = [
  {
    id: 0,
    title: 'Midnight Stealth Car Commercial',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-black-car-driving-along-a-street-at-night-42277-large.mp4',
    views: '1.2M',
    likes: '142K',
  },
  {
    id: 1,
    title: 'Vaporwave Cyberpunk Portrait',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-neon-makeup-looking-at-camera-39906-large.mp4',
    views: '840K',
    likes: '95K',
  },
  {
    id: 2,
    title: 'Tokyo Nocturnal Neon Drive',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-neon-lights-of-tokyo-streets-40763-large.mp4',
    views: '2.4M',
    likes: '310K',
  },
  {
    id: 3,
    title: 'Influencer Vlogging Behind Scenes',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-recording-herself-with-a-smartphone-43034-large.mp4',
    views: '620K',
    likes: '78K',
  },
]

export default function Reels() {
  const [reels, setReels] = useState<ReelItem[]>(DEFAULT_REELS)

  useEffect(() => {
    const syncReels = () => {
      const stored = localStorage.getItem('mcs_global_reels')
      if (stored) {
        try {
          setReels(JSON.parse(stored))
        } catch (e) {}
      } else {
        localStorage.setItem('mcs_global_reels', JSON.stringify(DEFAULT_REELS))
      }
    }
    syncReels()
    window.addEventListener('storage', syncReels)
    return () => window.removeEventListener('storage', syncReels)
  }, [])

  return (
    <section id="reels" className="relative z-10 py-20 md:py-32 bg-black border-b border-white/5 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-xs font-black tracking-[0.3em] text-neon uppercase mb-3">
            VERTICAL REELS
          </h2>
          <h3 className="font-heading text-3xl md:text-5xl font-black text-silver">
            VIRAL 9:16 CINEMATICS
          </h3>
        </div>

        {/* Reels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ReelCard({ reel }: { reel: ReelItem }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlay}
      className="relative overflow-hidden group cursor-pointer border border-white/5 bg-neutral-900 aspect-[9/16] neon-border p-[1px] select-none"
    >
      {/* Video Loop */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        loop
        muted
        playsInline
        className="w-full h-full object-cover filter brightness-[0.85] saturate-[105%] transition-all duration-500 group-hover:brightness-95 group-hover:scale-[1.02]"
      />

      {/* Play/Pause Overlay Indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="w-12 h-12 bg-black/50 border border-white/10 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
          {isPlaying ? <Pause size={16} className="text-neon" /> : <Play size={16} className="text-neon fill-current" />}
        </div>
      </div>

      {/* Ambient Gradient Masks */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 z-10 pointer-events-none" />

      {/* Reel Statistics (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="glass px-2.5 py-1 flex items-center gap-1 border border-white/5 text-[10px] text-silver font-bold uppercase tracking-wider">
          <Eye size={10} className="text-neon" />
          {reel.views}
        </div>
        <div className="glass px-2.5 py-1 flex items-center gap-1 border border-white/5 text-[10px] text-silver font-bold uppercase tracking-wider">
          <Heart size={10} className="text-neon fill-current" />
          {reel.likes}
        </div>
      </div>

      {/* Description Title (Bottom) */}
      <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none">
        <span className="font-heading text-[8px] font-black tracking-widest text-neon uppercase block mb-1">
          REEL PREVIEW
        </span>
        <h4 className="font-heading text-xs font-bold text-silver uppercase tracking-wider leading-relaxed">
          {reel.title}
        </h4>
      </div>

      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 pointer-events-none scanlines z-10" />
    </div>
  )
}
