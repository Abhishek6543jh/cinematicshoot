import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

// Import components
import Loader from '../components/site/Loader'
import Navbar from '../components/site/Navbar'
import Hero from '../components/site/Hero'
import Stats from '../components/site/Stats'
import Portfolio from '../components/site/Portfolio'
import About from '../components/site/About'
import Career from '../components/site/Career'
import Services from '../components/site/Services'
import Booking from '../components/site/Booking'
import Contact from '../components/site/Contact'
import Floating from '../components/site/Floating'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [loading, setLoading] = useState(true)

  // Configure Scroll Reveal observer after loading completes
  useEffect(() => {
    if (loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    const elements = document.querySelectorAll('.reveal-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [loading])

  return (
    <>
      {/* Cinematic Loader screen */}
      <Loader onComplete={() => setLoading(false)} />

      <div className={`relative min-h-screen bg-black overflow-hidden select-none transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {/* Fixed Glass Navbar */}
        <Navbar />

        <main className="w-full">
          {/* Fullscreen Hero */}
          <Hero />

          {/* Scroll Reveal Wrapper Sections */}
          <div className="reveal-on-scroll">
            <Stats />
          </div>

          <div className="reveal-on-scroll">
            <Portfolio />
          </div>

          <div className="reveal-on-scroll">
            <Services />
          </div>

          {/* Career Openings Listings */}
          <div className="reveal-on-scroll">
            <Career />
          </div>

          <div className="reveal-on-scroll">
            <About />
          </div>

          <div className="reveal-on-scroll">
            <Booking />
          </div>

          <div className="reveal-on-scroll">
            <Contact />
          </div>
        </main>

        {/* Floating Action Widgets */}
        <Floating />

        {/* Cinema-themed micro footer */}
        <footer className="py-8 bg-black border-t border-white/5 text-center text-[10px] font-heading font-black tracking-widest text-neutral-600 uppercase">
          © {new Date().getFullYear()} MR. CINEMATICSHOOT. ALL RIGHT PRODUCED.
        </footer>
      </div>
    </>
  )
}
