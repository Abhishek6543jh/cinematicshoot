import { useState, useEffect, useRef } from 'react'
import { X, Smartphone, Mail, Lock, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { authLoginWithGoogle, authSendPhoneOtp, authVerifyPhoneOtp } from '../../server/auth.functions'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: { name: string; email: string; avatar: string }) => void
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [flow, setFlow] = useState<'main' | 'google' | 'phone' | 'otp'>('main')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(30)
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Manage SMS countdown resend timer
  useEffect(() => {
    if (flow !== 'otp' || countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [flow, countdown])

  // Focus helper for OTP inputs
  useEffect(() => {
    if (flow === 'otp') {
      otpRefs.current[0]?.focus()
    }
  }, [flow])

  if (!isOpen) return null

  const handleGoogleLogin = async () => {
    setIsSubmitting(true)
    setFlow('google')
    
    try {
      const user = await authLoginWithGoogle({
        data: {
          email: 'alex.maverick@gmail.com',
          name: 'ALEX MAVERICK',
          avatar: 'AM'
        }
      })
      setIsSubmitting(false)
      onLoginSuccess(user)
      toast.success('GOOGLE AUTHENTICATION SUCCESSFUL. WELCOME BACK, ALEX.')
      onClose()
      setFlow('main')
    } catch (e) {
      setIsSubmitting(false)
      toast.error('GOOGLE AUTHENTICATION FAILED. PLEASE TRY AGAIN.')
      setFlow('main')
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim()) {
      toast.error('VALIDATION ERROR: PLEASE INPUT A VALID MOBILE NUMBER.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await authSendPhoneOtp({ data: { phone: phoneNumber } })
      setIsSubmitting(false)
      setFlow('otp')
      setCountdown(30)
      toast.success(`SMS DISPATCHED: SECURE OTP TRANSMITTED. (Dev OTP: ${res.code})`)
    } catch (e) {
      setIsSubmitting(false)
      toast.error('ERROR DISPATCHING OTP. PLEASE TRY AGAIN.')
    }
  }

  const handleOtpChange = (value: string, idx: number) => {
    if (isNaN(Number(value))) return
    const newOtp = [...otp]
    newOtp[idx] = value.slice(-1)
    setOtp(newOtp)

    // Move focus to next input
    if (value && idx < 5) {
      otpRefs.current[idx + 1]?.focus()
    }

    // Auto submit OTP when fully filled
    if (newOtp.every(val => val !== '')) {
      verifyOtp(newOtp.join(''))
    }
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const newOtp = [...otp]
      newOtp[idx - 1] = ''
      setOtp(newOtp)
      otpRefs.current[idx - 1]?.focus()
    }
  }

  const verifyOtp = async (code: string) => {
    setIsSubmitting(true)

    try {
      const user = await authVerifyPhoneOtp({ data: { phone: phoneNumber, code } })
      setIsSubmitting(false)
      onLoginSuccess(user)
      toast.success('MOBILE AUTHENTICATION SUCCESSFUL. SECURE SESSION ESTABLISHED.')
      onClose()
      // reset states
      setFlow('main')
      setPhoneNumber('')
      setOtp(Array(6).fill(''))
    } catch (e) {
      setIsSubmitting(false)
      toast.error('VERIFICATION ERROR: INVALID OR EXPIRED OTP.')
    }
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

        {/* Back link for sub-flows */}
        {flow !== 'main' && !isSubmitting && (
          <button
            onClick={() => {
              setFlow('main')
              setOtp(Array(6).fill(''))
            }}
            className="absolute top-4 left-4 text-neutral-500 hover:text-neon transition-colors flex items-center gap-1 cursor-pointer font-heading text-[9px] font-black tracking-widest uppercase"
          >
            <ArrowLeft size={10} /> BACK
          </button>
        )}

        {/* Dynamic Headers */}
        {flow === 'main' && (
          <>
            <h3 className="font-heading text-lg font-black text-silver tracking-widest uppercase mb-2">
              MCS AUTHENTICATION
            </h3>
            <p className="font-sans text-xs text-neutral-400 mb-8 uppercase tracking-wider">
              ESTABLISH A PRIVILEGED DIRECTORS PORTAL SESSION
            </p>
          </>
        )}

        {flow === 'google' && (
          <>
            <h3 className="font-heading text-lg font-black text-silver tracking-widest uppercase mb-2">
              RESOLVING GOOGLE AUTH
            </h3>
            <p className="font-sans text-xs text-neutral-400 mb-8 uppercase tracking-wider">
              AUTHORIZING DECENTRALIZED PROTOCOL...
            </p>
          </>
        )}

        {flow === 'phone' && (
          <>
            <h3 className="font-heading text-lg font-black text-silver tracking-widest uppercase mb-2">
              MOBILE SIGN IN
            </h3>
            <p className="font-sans text-xs text-neutral-400 mb-8 uppercase tracking-wider">
              ENTER MOBILE LINE NUMBER FOR SMS TRANSMISSION
            </p>
          </>
        )}

        {flow === 'otp' && (
          <>
            <h3 className="font-heading text-lg font-black text-silver tracking-widest uppercase mb-2">
              VERIFY DIGITAL OTP
            </h3>
            <p className="font-sans text-xs text-neutral-400 mb-8 uppercase tracking-wider">
              TRANSMIT 6-DIGIT CODE DISPATCHED TO {phoneNumber}
            </p>
          </>
        )}

        {/* Content Screens */}
        {flow === 'main' && (
          <div className="space-y-4">
            {/* Google Authentication */}
            <button
              onClick={handleGoogleLogin}
              className="w-full py-4 glass border border-white/10 font-heading text-xs font-black tracking-widest text-silver hover:border-neon hover:text-neon transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-silver group-hover:text-neon transition-colors duration-300">
                <span className="font-bold text-xs">G</span>
              </div>
              CONTINUE WITH GOOGLE
            </button>

            {/* Mobile OTP Authentication */}
            <button
              onClick={() => setFlow('phone')}
              className="w-full py-4 glass border border-white/10 font-heading text-xs font-black tracking-widest text-silver hover:border-neon hover:text-neon transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Smartphone size={14} className="text-silver hover:text-neon transition-colors duration-300" />
              CONTINUE WITH MOBILE NUMBER
            </button>
          </div>
        )}

        {/* Google Loader Screen */}
        {flow === 'google' && isSubmitting && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="text-neon animate-spin" size={36} />
            <span className="font-heading text-[10px] font-black tracking-widest text-neon uppercase animate-pulse">
              RESOLVING SECURE TOKENS...
            </span>
          </div>
        )}

        {/* Mobile Number Entry Screen */}
        {flow === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div className="flex flex-col gap-2 text-left">
              <label className="font-heading text-[9px] font-black tracking-widest text-neutral-500 uppercase">
                MOBILE PHONE NUMBER *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="bg-black border border-white/10 p-3.5 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 text-center w-full"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-neon text-black font-heading text-xs font-black tracking-widest uppercase hover:neon-glow transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  DISPATCHING OTP...
                </>
              ) : (
                'SEND VERIFICATION CODE'
              )}
            </button>
          </form>
        )}

        {/* OTP Input Screen */}
        {flow === 'otp' && (
          <div className="space-y-6">
            {/* 6 Grid Inputs */}
            <div className="flex justify-center gap-2 md:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  disabled={isSubmitting}
                  className="w-12 h-14 bg-black border border-white/10 text-center font-heading text-xl font-black text-neon focus:border-neon focus:outline-none transition-all duration-300"
                />
              ))}
            </div>

            {/* Submitting Loading Status */}
            {isSubmitting && (
              <div className="flex items-center justify-center gap-2 font-heading text-[10px] font-black tracking-widest text-neon uppercase animate-pulse">
                <Loader2 className="animate-spin" size={12} />
                VERIFYING CODES...
              </div>
            )}

            {/* Resend details */}
            {!isSubmitting && (
              <div className="pt-2 text-xs font-sans text-neutral-500 uppercase tracking-widest">
                {countdown > 0 ? (
                  `RESEND CODE IN ${countdown}S`
                ) : (
                  <button
                    onClick={() => {
                      setCountdown(30)
                      toast.success('SMS RESENT: DISPATCHED OTP RETRANSMISSION.')
                    }}
                    className="text-neon hover:underline cursor-pointer bg-transparent border-0 font-bold"
                  >
                    RESEND SMS CODE
                  </button>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
