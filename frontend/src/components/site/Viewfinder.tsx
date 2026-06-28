import { useState, useRef, useEffect } from 'react'
import { Sliders, Camera, Eye, Film, Maximize2 } from 'lucide-react'

interface Scene {
  name: string
  url: string
  tag: string
}

const scenes: Scene[] = [
  {
    name: 'Stealth Supercar',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-black-car-driving-along-a-street-at-night-42277-large.mp4',
    tag: 'CARS',
  },
  {
    name: 'Cyberpunk Neon Model',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-neon-makeup-looking-at-camera-39906-large.mp4',
    tag: 'FASHION',
  },
  {
    name: 'Nocturnal Cityscape',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-neon-lights-of-tokyo-streets-40763-large.mp4',
    tag: 'STREET',
  },
]

type LUTType = 'TEAL_ORANGE' | 'CYBERPUNK' | 'RODEO_GOLD' | 'MONOCHROME' | 'CLEAN'

export default function Viewfinder() {
  const [activeSceneIdx, setActiveSceneIdx] = useState(0)
  const [activeLUT, setActiveLUT] = useState<LUTType>('TEAL_ORANGE')
  const [enableGrain, setEnableGrain] = useState(true)
  const [enableLetterbox, setEnableLetterbox] = useState(false)
  const [enableFlare, setEnableFlare] = useState(true)
  const [aperture, setAperture] = useState(1.8) // Controls blur depth

  // 3D Tilt states
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    
    // Relative coordinates (0 to 100)
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })

    // Center offsets (-0.5 to +0.5)
    const offsetX = (e.clientX - rect.left) / rect.width - 0.5
    const offsetY = (e.clientY - rect.top) / rect.height - 0.5

    // Angle limits: -15deg to +15deg
    setTilt({
      x: -offsetY * 20,
      y: offsetX * 20,
    })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setMousePos({ x: 50, y: 50 })
  }

  // Map active LUT value to Tailwind/CSS filters
  const getFilterStyle = (): string => {
    switch (activeLUT) {
      case 'TEAL_ORANGE':
        return 'contrast-[1.2] saturate-[1.3] brightness-[0.9] sepia-[0.08] hue-rotate-[-8deg]'
      case 'CYBERPUNK':
        return 'contrast-[1.35] saturate-[1.65] hue-rotate-[45deg] brightness-[0.88]'
      case 'RODEO_GOLD':
        return 'contrast-[1.1] sepia-[0.35] saturate-[1.25] hue-rotate-[10deg] brightness-[0.95]'
      case 'MONOCHROME':
        return 'grayscale-[1] contrast-[1.4] brightness-[0.85]'
      default:
        return 'none'
    }
  }

  // Aperture blur value mapping
  const getBackgroundBlur = (): string => {
    // Lower aperture means wider opening -> more shallow depth of field (more blur)
    const baseBlur = Math.max(0, (2.8 - aperture) * 8)
    return `${baseBlur}px`
  }

  return (
    <section id="viewfinder" className="relative z-10 py-20 md:py-32 bg-black border-b border-white/5 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-xs font-black tracking-[0.3em] text-neon uppercase mb-3 animate-pulse">
            INTERACTIVE EXPERIENCE
          </h2>
          <h3 className="font-heading text-3xl md:text-5xl font-black text-silver">
            3D CINEMATIC VIEW
          </h3>
          <p className="font-sans text-sm text-neutral-400 max-w-xl mx-auto mt-4 leading-relaxed">
            Calibrate camera LUT filters, toggle anamorphic flare overlays, and adjust focal depth in real time. Pan your mouse over the screen to control the active 3D camera rig.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Interactive 3D Viewfinder Monitor (Left - 7 columns) */}
          <div className="lg:col-span-7 flex flex-col justify-center items-center">
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full max-w-xl aspect-[16/10] bg-neutral-950 border border-white/5 relative overflow-hidden group cursor-pointer"
              style={{
                perspective: '1000px',
              }}
            >
              {/* 3D Tilted Card Body */}
              <div
                className="w-full h-full relative transition-transform duration-300 ease-out select-none border border-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                style={{
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* 1. Underlying Cinematic Video with Parallax scales */}
                <div
                  className="absolute inset-0 z-0 select-none pointer-events-none"
                  style={{
                    transform: `translateZ(-15px) scale(1.08)`,
                    filter: `blur(${getBackgroundBlur()})`,
                  }}
                >
                  <video
                    src={scenes[activeSceneIdx].url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`w-full h-full object-cover transition-all duration-300 ${getFilterStyle()}`}
                  />
                </div>

                {/* 2. Film Grain overlay */}
                {enableGrain && (
                  <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.04] cinematic-grain select-none" />
                )}

                {/* 3. Rule of Thirds camera overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none border border-white/10 select-none flex flex-col justify-between p-6">
                  {/* Grid layout */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none">
                    <div className="w-[33.33%] h-full border-r border-white/5 border-dashed" />
                    <div className="w-[33.33%] h-full border-r border-white/5 border-dashed" />
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full h-[33.33%] border-b border-white/5 border-dashed" />
                    <div className="w-full h-[33.33%] border-b border-white/5 border-dashed" />
                  </div>

                  {/* Corner bracket focus guidelines */}
                  <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-neon opacity-70" />
                  <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-neon opacity-70" />
                  <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-neon opacity-70" />
                  <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-neon opacity-70" />
                  
                  {/* Center brackets */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/25 rounded-none flex items-center justify-center opacity-65">
                    <div className="w-1.5 h-1.5 bg-neon rounded-full" />
                  </div>

                  {/* HUD status elements (Top) */}
                  <div className="flex justify-between items-start z-30 font-heading text-[8px] font-black tracking-widest text-silver/80">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                      <span>REC</span>
                    </div>
                    <div>
                      <span>ISO 400</span>
                      <span className="mx-2">/</span>
                      <span>5600K</span>
                    </div>
                  </div>

                  {/* HUD status elements (Bottom) */}
                  <div className="flex justify-between items-end z-30 font-heading text-[8px] font-black tracking-widest text-silver/80">
                    <div>
                      <span>F{aperture.toFixed(1)}</span>
                      <span className="mx-2">/</span>
                      <span>1/50 SEC</span>
                    </div>
                    <div className="bg-black/60 px-2 py-0.5 border border-white/10 text-neon">
                      {scenes[activeSceneIdx].tag} MODE
                    </div>
                  </div>
                </div>

                {/* 4. Anamorphic horizontal lens flare overlay */}
                {enableFlare && (
                  <div
                    className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-85 pointer-events-none mix-blend-screen shadow-[0_0_15px_#22d3ee] transition-all duration-75 ease-out z-20"
                    style={{
                      top: `${mousePos.y}%`,
                      transform: `translateZ(10px)`,
                    }}
                  />
                )}

                {/* 5. Anamorphic crop letterbox black bars */}
                <div
                  className="absolute inset-x-0 top-0 bg-black z-30 transition-all duration-500 ease-in-out border-b border-white/5 pointer-events-none"
                  style={{
                    height: enableLetterbox ? '12.5%' : '0%',
                  }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 bg-black z-30 transition-all duration-500 ease-in-out border-t border-white/5 pointer-events-none"
                  style={{
                    height: enableLetterbox ? '12.5%' : '0%',
                  }}
                />

                {/* Viewport scanlines */}
                <div className="absolute inset-0 pointer-events-none scanlines z-30 opacity-40 select-none" />
              </div>
            </div>

            {/* Bottom active tag tracker */}
            <span className="font-heading text-[8px] font-bold text-neutral-500 tracking-[0.2em] mt-4 uppercase">
              Drag mouse on screen to control perspective yaw/pitch
            </span>
          </div>

          {/* Controller Panel (Right - 5 columns) */}
          <div className="lg:col-span-5 space-y-8 text-left bg-neutral-950 p-8 border border-white/5 relative">
            <div className="absolute top-0 left-0 w-[2px] h-8 bg-neon" />
            
            {/* Header info */}
            <div>
              <h4 className="font-heading text-xs font-black text-neon uppercase mb-1 tracking-widest flex items-center gap-1.5">
                <Camera size={12} />
                DIRECTORS CONSOLE
              </h4>
              <h5 className="font-heading text-lg font-black text-silver uppercase tracking-wider">
                CALIBRATE PERSPECTIVE
              </h5>
            </div>

            {/* 1. Scene Select */}
            <div className="space-y-3">
              <span className="font-heading text-[9px] font-black tracking-widest text-neutral-500 uppercase block">
                SCENE TARGET SELECTOR
              </span>
              <div className="grid grid-cols-3 gap-2">
                {scenes.map((scene, idx) => (
                  <button
                    key={scene.name}
                    onClick={() => setActiveSceneIdx(idx)}
                    className={`p-2 border text-[9px] font-heading font-black tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                      activeSceneIdx === idx
                        ? 'border-neon bg-neon/10 text-neon'
                        : 'border-white/5 hover:border-white/20 text-neutral-400 hover:text-silver bg-black/40'
                    }`}
                  >
                    {scene.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color LUT Selector */}
            <div className="space-y-3">
              <span className="font-heading text-[9px] font-black tracking-widest text-neutral-500 uppercase block">
                COLOR PROFILE GRADIENT (LUT)
              </span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(['TEAL_ORANGE', 'CYBERPUNK', 'RODEO_GOLD', 'MONOCHROME', 'CLEAN'] as const).map((lut) => (
                  <button
                    key={lut}
                    onClick={() => setActiveLUT(lut)}
                    className={`py-2 border text-[9px] font-heading font-black tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                      activeLUT === lut
                        ? 'border-neon bg-neon/10 text-neon shadow-[0_0_8px_rgba(255,122,0,0.15)]'
                        : 'border-white/5 hover:border-white/20 text-neutral-400 hover:text-silver bg-black/40'
                    }`}
                  >
                    {lut.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Lens & FX Toggle Swatches */}
            <div className="space-y-3">
              <span className="font-heading text-[9px] font-black tracking-widest text-neutral-500 uppercase block">
                LENS & CAMERA FILTERS
              </span>
              <div className="grid grid-cols-3 gap-2">
                {/* Film Grain */}
                <button
                  onClick={() => setEnableGrain(!enableGrain)}
                  className={`py-2 border text-[9px] font-heading font-black tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                    enableGrain ? 'border-neon bg-neon/10 text-neon' : 'border-white/5 text-neutral-500 bg-black/40'
                  }`}
                >
                  GRAIN {enableGrain ? 'ON' : 'OFF'}
                </button>
                {/* Anamorphic Flare */}
                <button
                  onClick={() => setEnableFlare(!enableFlare)}
                  className={`py-2 border text-[9px] font-heading font-black tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                    enableFlare ? 'border-neon bg-neon/10 text-neon' : 'border-white/5 text-neutral-500 bg-black/40'
                  }`}
                >
                  FLARE {enableFlare ? 'ON' : 'OFF'}
                </button>
                {/* Letterbox Crop */}
                <button
                  onClick={() => setEnableLetterbox(!enableLetterbox)}
                  className={`py-2 border text-[9px] font-heading font-black tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                    enableLetterbox ? 'border-neon bg-neon/10 text-neon' : 'border-white/5 text-neutral-500 bg-black/40'
                  }`}
                >
                  2.39:1 CROP
                </button>
              </div>
            </div>

            {/* 4. Aperture (Depth of Field Blur) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-heading text-[9px] font-black tracking-widest text-neutral-500 uppercase">
                  APERTURE (FOCAL BLUR)
                </span>
                <span className="font-mono text-xs font-bold text-neon">
                  f/{aperture.toFixed(1)}
                </span>
              </div>
              <div className="relative flex items-center">
                <Sliders size={12} className="absolute left-3 text-neutral-500 pointer-events-none" />
                <input
                  type="range"
                  min="1.2"
                  max="5.6"
                  step="0.2"
                  value={aperture}
                  onChange={(e) => setAperture(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 h-10 pl-10 pr-4 text-xs focus:border-neon focus:outline-none accent-neon cursor-pointer appearance-none"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
