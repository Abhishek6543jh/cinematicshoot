import { useEffect, useState, useRef } from 'react'

interface StatCounterProps {
  target: number
  suffix?: string
  duration?: number
  active: boolean
}

function StatCounter({ target, suffix = '', duration = 1500, active }: StatCounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return

    let start = 0
    const end = target
    if (start === end) return

    const totalMiliseconds = duration
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20)
    
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime))
      if (start >= end) {
        clearInterval(timer)
        setCount(end)
      } else {
        setCount(start)
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [target, duration, active])

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function Stats() {
  const [isActive, setIsActive] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.25 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const stats = [
    { label: 'PROJECTS COMPLETED', target: 480, suffix: '+' },
    { label: 'BRANDS PARTNERED', target: 85, suffix: '+' },
    { label: 'SOCIAL REACH GENERATED', target: 12, suffix: 'M+' },
  ]

  return (
    <section
      ref={sectionRef}
      id="stats"
      className="relative z-10 py-16 md:py-24 bg-black border-b border-white/5 reveal-on-scroll scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="glass p-6 md:p-8 flex flex-col justify-center border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-neon/30 transition-all duration-500"
            >
              {/* Top ambient orange line indicator on hover */}
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-neon scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              
              {/* Counter Display */}
              <div className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-silver group-hover:text-neon transition-colors duration-500 mb-2">
                <StatCounter target={stat.target} suffix={stat.suffix} active={isActive} />
              </div>
              
              {/* Kicker Tag */}
              <div className="font-heading text-[10px] md:text-xs font-bold tracking-[0.15em] text-neutral-500 group-hover:text-neutral-400 transition-colors duration-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
