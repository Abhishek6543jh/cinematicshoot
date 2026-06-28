import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authGetCurrentUser, authLogout } from '../../server/auth.functions'
import AuthModal from './AuthModal'

interface UserState {
  name: string
  email: string
  avatar: string
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  
  // Auth states
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const queryClient = useQueryClient()
  const { data: user } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authGetCurrentUser()
  })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const isProfilePage = typeof window !== 'undefined' && window.location.pathname === '/profile'

  const navLinks = [
    { label: 'HOME', href: '#' },
    { label: 'PORTFOLIO', href: '#portfolio' },
    { label: 'SERVICES', href: '#services' },
    { label: 'CAREER', href: '#career' },
    { label: 'ABOUT', href: '#about' },
    { label: 'CONTACT', href: '#contact' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      if (window.scrollY < 150) {
        setActiveSection('')
        return
      }

      // Determine active section for scroll highlights
      const sections = navLinks.slice(1).map(link => document.querySelector(link.href) as HTMLElement | null)
      const scrollPosition = window.scrollY + 120

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section) {
          const absoluteTop = section.getBoundingClientRect().top + window.scrollY
          if (absoluteTop <= scrollPosition) {
            const id = navLinks[i + 1].href.slice(1)
            setActiveSection(id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsMobileMenuOpen(false)
    
    if (isProfilePage) {
      // Let the browser handle standard redirect to landing section
      return
    }

    e.preventDefault()
    if (href === '#') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      return
    }
    const targetElement = document.querySelector(href) as HTMLElement | null
    if (targetElement) {
      const absoluteTop = targetElement.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: absoluteTop - 80,
        behavior: 'smooth',
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await authLogout()
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      setIsDropdownOpen(false)
      toast.success('SIGNED OUT: SECURE USER SESSION TERMINATED.')
    } catch (e) {
      toast.error('LOGOUT ERROR: UNABLE TO TERMINATE SESSION.')
    }
  }

  const handleLoginSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'glass py-4 border-b border-white/5'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center select-none">
          {/* Logo brand text matching exact user instructions */}
          <a
            href={isProfilePage ? '/' : '#'}
            className="font-heading text-base md:text-lg font-black tracking-[0.15em] text-silver select-none hover:text-neon transition-colors duration-300"
            onClick={(e) => {
              if (!isProfilePage) {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            MR. <span className="text-neon">CINEMATICSHOOT</span>
          </a>

          {/* Menu & Actions Wrapper */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Inline Navigation Links */}
            <div className="flex gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={isProfilePage ? (link.href === '#' ? '/' : `/${link.href}`) : link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`relative font-heading text-[11px] font-bold tracking-[0.12em] transition-colors duration-300 hover:text-neon ${
                    activeSection === link.href.slice(1) ? 'text-neon' : 'text-neutral-400'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute left-0 bottom-[-6px] w-full h-[1.5px] bg-neon transition-transform duration-300 origin-left ${
                      activeSection === link.href.slice(1) ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              ))}
            </div>

            {/* Book Shoot CTA Action */}
            <a
              href={isProfilePage ? '/#booking' : '#booking'}
              onClick={(e) => handleLinkClick(e, '#booking')}
              className="px-4 py-2 bg-neon/15 border border-neon/30 hover:border-neon text-neon hover:text-black hover:bg-neon font-heading text-[10px] font-black tracking-widest uppercase transition-all duration-300 no-underline"
            >
              BOOK THE SHOOT
            </a>

            {/* Google / Phone Authentication Triggers */}
            {user ? (
              <div className="relative">
                {/* User logged in Avatar */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-8 h-8 rounded-full border border-neon text-neon bg-neon/10 font-heading text-[10px] font-black tracking-wider flex items-center justify-center cursor-pointer hover:bg-neon hover:text-black transition-all duration-300 overflow-hidden"
                >
                  {user.avatar && (user.avatar.startsWith('data:') || user.avatar.startsWith('http')) ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.avatar
                  )}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass bg-black/95 border border-white/5 py-1 z-50 animate-reveal-up">
                    <div className="px-4 py-2 border-b border-white/5 text-[10px] font-sans text-neutral-400 uppercase truncate">
                      {user.name}
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full px-4 py-2.5 text-left font-heading text-[10px] font-bold tracking-widest text-silver hover:text-neon hover:bg-white/5 transition-all duration-300 flex items-center gap-2 cursor-pointer no-underline"
                    >
                      <User size={12} />
                      PROFILE
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2.5 text-left font-heading text-[10px] font-bold tracking-widest text-silver hover:text-neon hover:bg-white/5 transition-all duration-300 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={12} />
                      SIGN OUT
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="font-heading text-[10px] font-black tracking-widest text-neutral-400 hover:text-neon transition-all duration-300 cursor-pointer"
              >
                SIGN IN / SIGN UP
              </button>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-silver hover:text-neon transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Slide-Out Panel */}
        <div
          className={`lg:hidden fixed top-[69px] left-0 right-0 bottom-0 bg-black/95 backdrop-blur-xl transition-all duration-300 border-t border-white/5 flex flex-col justify-center px-8 pb-24 ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-10px] pointer-events-none'
          }`}
        >
          <div className="flex flex-col gap-6 items-center select-none">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={isProfilePage ? (link.href === '#' ? '/' : `/${link.href}`) : link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`font-heading text-lg font-bold tracking-[0.15em] transition-colors duration-300 hover:text-neon ${
                  activeSection === link.href.slice(1) ? 'text-neon' : 'text-silver'
                }`}
              >
                {link.label}
              </a>
            ))}
            
            <a
              href="#booking"
              onClick={(e) => handleLinkClick(e, '#booking')}
              className="mt-4 px-6 py-3 bg-neon text-black font-heading text-xs font-black tracking-widest uppercase text-center w-full no-underline"
            >
              BOOK THE SHOOT
            </a>

            {user ? (
              <div className="flex flex-col gap-4 items-center w-full">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-heading text-base font-bold tracking-[0.15em] text-silver hover:text-neon transition-colors no-underline"
                >
                  MY PROFILE
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="font-heading text-xs font-black tracking-widest text-neon hover:text-silver transition-colors cursor-pointer"
                >
                  SIGN OUT ({user.name.split(' ')[0]})
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsAuthOpen(true)
                }}
                className="mt-2 font-heading text-xs font-black tracking-widest text-silver hover:text-neon transition-colors cursor-pointer"
              >
                SIGN IN / SIGN UP
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal Portal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      {/* Profile Modal Portal removed */}
    </>
  )
}
