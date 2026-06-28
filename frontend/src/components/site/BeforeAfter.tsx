import { useState, useRef, useEffect } from 'react'
import { EyeOff, Eye } from 'lucide-react'
import sliderImg from '../../assets/portfolio-cars.jpg'

export default function BeforeAfter() {
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(percentage)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    handleMove(e.touches[0].clientX)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging])

  return (
    <section id="beforeafter" className="relative z-10 py-20 md:py-32 bg-black border-b border-white/5 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-xs font-black tracking-[0.3em] text-neon uppercase mb-3">
            COLOR SCIENCE
          </h2>
          <h3 className="font-heading text-3xl md:text-5xl font-black text-silver">
            RAW CAMERA VS GRADED FRAME
          </h3>
        </div>

        {/* Drag Comparison Container */}
        <div className="relative max-w-4xl mx-auto neon-border select-none overflow-hidden aspect-[16/9]">
          <div
            ref={containerRef}
            className="relative w-full h-full cursor-ew-resize"
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
          >
            {/* Graded Frame (Underneath / Background) */}
            <img
              src={sliderImg}
              alt="Cinematic Color Graded Look"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[1.02] saturate-[115%]"
              draggable={false}
            />
            {/* Graded Indicator */}
            <div className="absolute right-4 top-4 z-20 glass px-3 py-1.5 flex items-center gap-1.5 border border-neon/30 text-neon font-heading text-[10px] font-black tracking-widest uppercase">
              <Eye size={12} />
              GRADED
            </div>

            {/* Flat LOG Raw (Foreground / Overlying Clip) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={sliderImg}
                alt="Camera RAW Log Look"
                className="absolute inset-0 w-full h-full object-cover filter brightness-[1.1] contrast-[0.75] saturate-[0.55] sepia-[0.12]"
                style={{ width: containerRef.current?.getBoundingClientRect().width }}
                draggable={false}
              />
              {/* RAW Indicator */}
              <div className="absolute left-4 top-4 z-20 glass px-3 py-1.5 flex items-center gap-1.5 border border-white/10 text-neutral-400 font-heading text-[10px] font-black tracking-widest uppercase">
                <EyeOff size={12} />
                RAW LOG
              </div>
            </div>

            {/* Slider Divider Bar */}
            <div
              className="absolute inset-y-0 w-[1.5px] bg-neon z-20"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Central Drag Handler Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-none border border-neon bg-black flex flex-col justify-center items-center gap-[3px] shadow-[0_0_12px_rgba(255,122,0,0.5)]">
                <div className="w-[1.5px] h-3 bg-neon" />
                <div className="flex gap-[3px]">
                  <div className="w-[1.5px] h-[3px] bg-neon" />
                  <div className="w-[1.5px] h-[3px] bg-neon" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
