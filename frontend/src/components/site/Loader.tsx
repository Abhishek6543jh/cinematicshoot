import { useEffect, useState } from 'react'

interface LoaderProps {
  onComplete: () => void
}

export default function Loader({ onComplete }: LoaderProps) {
  const [fadeOut, setFadeOut] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    const handleLoad = () => {
      // Tiny delay for visual transition comfort
      const timeout = setTimeout(() => {
        setFadeOut(true)
        const completeTimeout = setTimeout(() => {
          setShouldRender(false)
          onComplete()
        }, 500) // matches fade-out duration
        return () => clearTimeout(completeTimeout)
      }, 300)
      return () => clearTimeout(timeout)
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
      // Fallback timeout of 3 seconds in case some third-party resource takes too long to load
      const fallback = setTimeout(handleLoad, 3000)
      return () => {
        window.removeEventListener('load', handleLoad)
        clearTimeout(fallback)
      }
    }
  }, [onComplete])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-500 ease-in-out scanlines ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center select-none">
        {/* Sleek Minimalist Spinner */}
        <div className="relative w-12 h-12 mb-4 flex items-center justify-center">
          {/* Inner track ring */}
          <div className="absolute inset-0 rounded-full border-2 border-white/5" />
          {/* Spinning segment */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neon border-r-neon animate-spin shadow-[0_0_15px_rgba(255,122,0,0.3)]" />
        </div>
        
        {/* Subtle, premium status text */}
        <span className="font-heading text-[10px] tracking-[0.3em] text-silver/60 uppercase select-none animate-pulse">
          Loading Experience
        </span>
      </div>
    </div>
  )
}
