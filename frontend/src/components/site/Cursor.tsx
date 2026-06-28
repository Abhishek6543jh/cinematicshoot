import { useEffect, useState, useRef } from 'react'

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const requestRef = useRef<number | null>(null)
  const trailRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Check if device supports coarse pointer (touch)
    const mediaQuery = window.matchMedia('(pointer: coarse)')
    setIsMobile(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    // Detect hovers on links or buttons or specific classes
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('cursor-pointer') ||
        target.closest('.cursor-pointer')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [isMobile, isVisible])

  useEffect(() => {
    if (isMobile) return

    const updateTrail = () => {
      const dx = position.x - trailRef.current.x
      const dy = position.y - trailRef.current.y
      
      trailRef.current.x += dx * 0.15
      trailRef.current.y += dy * 0.15

      setTrailPosition({ x: trailRef.current.x, y: trailRef.current.y })
      requestRef.current = requestAnimationFrame(updateTrail)
    }

    requestRef.current = requestAnimationFrame(updateTrail)

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [position, isMobile])

  if (isMobile || !isVisible) return null

  return (
    <>
      {/* Outer trailing ring */}
      <div
        className={`fixed pointer-events-none z-50 rounded-full border border-neon transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2 ${
          isHovering 
            ? 'w-12 h-12 bg-neon/10 border-neon shadow-[0_0_15px_rgba(255,122,0,0.4)]' 
            : 'w-8 h-8 bg-transparent'
        }`}
        style={{
          left: `${trailPosition.x}px`,
          top: `${trailPosition.y}px`,
        }}
      />
      {/* Inner solid dot */}
      <div
        className="fixed pointer-events-none z-50 w-2.5 h-2.5 bg-neon rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_#ff7a00]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  )
}
