import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, X, PhoneCall, Bot, Sparkles } from 'lucide-react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

export default function Floating() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: 'DIRECTORS CUT BOT ONLINE. SELECT AN OPTION BELOW OR ASK A CAMPAIGN QUESTION.',
      sender: 'bot',
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const presets = [
    { q: 'Production Pricing?', a: 'OUR PRODUCTION RATES VARY FROM ₹2,000 FOR A SINGLE CINEMATIC REEL TO ₹50,000+ FOR MAJOR COMMERCIAL CAMPAIGNS. SELECT A PACKAGE OPTION ABOVE FOR A DETAIL BRIEF ESTIMATE.' },
    { q: 'Deliverables Timeline?', a: 'RAW PROOFS ARE SUBMITTED WITHIN 24 HOURS. COMPLETED COLOR-GRADED DIRECTORS CUT CUTS FOR REELS AND EDITORIAL IMAGES ARE DELIVERED IN 5-7 BUSINESS DAYS.' },
    { q: 'Aesthetic Style Guide?', a: 'WE SCULPT VISUAL ASSETS AROUND HIGH-CONTRAST LIGHTING, CINEMATIC anamorphic grading, AND CRUNCHY NOISE SHADOWS. THINK luxury car commercials.' },
    { q: 'Book a Consultation?', a: 'SUBMIT YOUR NAME AND EMAIL VIA OUR BOOKING CALENDAR SECTION ABOVE. A CREATIVE DIRECTOR WILL ENGAGE AND DRAFT A STORYBOARD IN 2 HOURS.' },
  ]

  useEffect(() => {
    // Scroll to bottom of chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSendMessage = (text: string) => {
    // Prevent duplicate entries while typing
    if (isTyping) return

    const userMsg: Message = {
      id: Date.now(),
      text,
      sender: 'user',
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    // Lookup preset answer
    const matched = presets.find((p) => p.q === text)
    const replyText = matched ? matched.a : 'I AM CALIBRATED ONLY FOR GUIDED BRIEF OPTION SCHEDULING. FOR SPECIFIC REQUESTS, PLEASE SUBMIT OUR BOOKING BRIEF FORM.'

    setTimeout(() => {
      setIsTyping(false)
      const botMsg: Message = {
        id: Date.now() + 1,
        text: replyText,
        sender: 'bot',
      }
      setMessages((prev) => [...prev, botMsg])
    }, 850)
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none select-none">
      
      {/* Chat Box Panel */}
      {isOpen && (
        <div className="w-[340px] md:w-[380px] h-[450px] glass-neon flex flex-col pointer-events-auto shadow-[0_10px_50px_rgba(0,0,0,0.9)] animate-reveal-up border border-neon/30">
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-none border border-neon bg-neon/10 flex items-center justify-center text-neon">
                <Bot size={16} />
              </div>
              <div>
                <h4 className="font-heading text-xs font-black text-silver tracking-wider">
                  CS-AI DIRECTORS BOT
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-sans text-neutral-500 tracking-widest uppercase">
                    ACTIVE DIRECTOR
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-neon transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Screen */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 text-xs tracking-wide leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-neon text-black font-heading font-black'
                      : 'glass border border-white/5 text-silver font-sans'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="glass border border-white/5 p-3.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-neon rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-neon rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-neon rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions footer */}
          <div className="p-4 border-t border-white/5 bg-black/40">
            <span className="font-heading text-[8px] font-black tracking-widest text-neutral-500 uppercase block mb-2">
              SUGGESTED DIRECTIVES:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.q}
                  onClick={() => handleSendMessage(p.q)}
                  disabled={isTyping}
                  className="p-2 border border-white/5 bg-black/40 text-[9px] font-heading font-bold text-silver hover:border-neon hover:text-neon transition-all duration-300 text-left truncate cursor-pointer disabled:opacity-50"
                >
                  {p.q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Buttons Stack */}
      <div className="flex gap-3 pointer-events-auto">
        
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/13105550190"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 glass border border-green-500/30 text-green-500 hover:border-green-500 hover:text-green-400 hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-[0_4px_20px_rgba(34,197,94,0.15)] cursor-pointer"
          aria-label="Contact via WhatsApp"
        >
          <PhoneCall size={18} />
        </a>

        {/* AI Chat Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 glass-neon flex items-center justify-center hover:scale-105 transition-all duration-300 cursor-pointer ${
            isOpen ? 'border-neon shadow-neon' : ''
          }`}
          aria-label="Open support assistant"
        >
          {isOpen ? (
            <X size={18} className="text-neon" />
          ) : (
            <Sparkles size={18} className="text-neon animate-neon-pulse" />
          )}
        </button>

      </div>

    </div>
  )
}
