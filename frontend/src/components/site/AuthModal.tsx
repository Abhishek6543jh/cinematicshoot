import { useState } from 'react'
import { X, Mail, Lock, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../utils/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: { name: string; email: string; avatar: string }) => void
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [flow, setFlow] = useState<'email' | 'loading'>('email')
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('VALIDATION ERROR: PLEASE ENTER BOTH EMAIL AND PASSWORD.')
      return
    }
    if (isSignup && !name.trim()) {
      toast.error('VALIDATION ERROR: PLEASE ENTER YOUR NAME.')
      return
    }
    if (password.length < 6) {
      toast.error('VALIDATION ERROR: PASSWORD MUST BE AT LEAST 6 CHARACTERS.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isSignup) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: {
            data: {
              name: name.trim(),
              role: 'CUSTOMER'
            }
          }
        })
        if (error) throw error
        
        setIsSubmitting(false)
        if (data.user) {
          toast.success('REGISTRATION COMPLETED successfully!')
          onLoginSuccess({
            name: name.trim(),
            email: email.toLowerCase(),
            avatar: name.slice(0, 2).toUpperCase()
          })
          onClose()
          resetForm()
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password
        })
        if (error) throw error
        
        setIsSubmitting(false)
        if (data.user) {
          toast.success('PORTAL ACCESS GRANTED. SESSION ESTABLISHED.')
          onLoginSuccess({
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            avatar: (data.user.user_metadata?.name || 'US').slice(0, 2).toUpperCase()
          })
          onClose()
          resetForm()
        }
      }
    } catch (e: any) {
      setIsSubmitting(false)
      toast.error(`AUTHENTICATION ERROR: ${e.message || 'Invalid credentials.'}`)
    }
  }

  const resetForm = () => {
    setFlow('email')
    setEmail('')
    setPassword('')
    setName('')
    setIsSignup(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in px-4">
      {/* Close Overlay Trigger */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Auth Panel */}
      <div className="relative glass-neon w-full max-w-md bg-black/80 p-8 border border-neon/30 text-center z-10 animate-reveal-up select-none">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neon transition-colors cursor-pointer"
          aria-label="Close auth portal"
        >
          <X size={18} />
        </button>

        {/* Dynamic Headers */}
        {flow === 'loading' ? (
          <>
            <h3 className="font-heading text-lg font-black text-silver tracking-widest uppercase mb-2">
              RESOLVING TOKENS
            </h3>
            <p className="font-sans text-xs text-neutral-400 mb-8 uppercase tracking-wider">
              AUTHORIZING DECENTRALIZED PROTOCOL...
            </p>
          </>
        ) : (
          <>
            <h3 className="font-heading text-lg font-black text-silver tracking-widest uppercase mb-2">
              {isSignup ? 'CREATE ACCOUNT' : 'MCS AUTHENTICATION'}
            </h3>
            <p className="font-sans text-xs text-neutral-400 mb-8 uppercase tracking-wider">
              {isSignup ? 'REGISTER A SECURE CLIENT PROFILE' : 'ESTABLISH A PRIVILEGED DIRECTORS PORTAL SESSION'}
            </p>
          </>
        )}

        {/* Loading Screen */}
        {flow === 'loading' && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="text-neon animate-spin" size={36} />
            <span className="font-heading text-[10px] font-black tracking-widest text-neon uppercase animate-pulse">
              CONTACTING AUTH SERVICE...
            </span>
          </div>
        )}

        {/* Email Entry Screen */}
        {flow === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4 text-left">
            {isSignup && (
              <div className="flex flex-col gap-1">
                <label className="font-heading text-[9px] font-black tracking-widest text-neutral-500 uppercase">
                  FULL NAME *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-neutral-600" size={16} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-black border border-white/10 pl-10 pr-4 py-3.5 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 w-full"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="font-heading text-[9px] font-black tracking-widest text-neutral-500 uppercase">
                EMAIL ADDRESS *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-neutral-600" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@mrcinematic.com"
                  className="bg-black border border-white/10 pl-10 pr-4 py-3.5 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 w-full"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-heading text-[9px] font-black tracking-widest text-neutral-500 uppercase">
                SECURE PASSWORD *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-neutral-600" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black border border-white/10 pl-10 pr-4 py-3.5 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 w-full"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-4 bg-neon text-black font-heading text-xs font-black tracking-widest uppercase hover:neon-glow transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  PROCESSING...
                </>
              ) : (
                isSignup ? 'CREATE ACCOUNT' : 'SECURE SIGN IN'
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="font-heading text-[9px] font-black tracking-widest text-neutral-500 hover:text-neon uppercase transition-colors duration-300 bg-transparent border-none cursor-pointer"
              >
                {isSignup ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' : 'NO ACCOUNT? CREATE SECURE CLIENT PROFILE'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
