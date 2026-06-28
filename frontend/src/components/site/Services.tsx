import { Sparkles, Car, Shirt, Eye, Film, Briefcase } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { packageListAll } from '../../server/auth.functions'

function getIconForCategory(category: string) {
  const cat = category.toLowerCase()
  if (cat.includes('branding') || cat.includes('influencer')) {
    return <Sparkles className="text-neon" size={24} />
  }
  if (cat.includes('automotive') || cat.includes('car')) {
    return <Car className="text-neon" size={24} />
  }
  if (cat.includes('fashion') || cat.includes('apparel')) {
    return <Shirt className="text-neon" size={24} />
  }
  if (cat.includes('wedding')) {
    return <Eye className="text-neon" size={24} />
  }
  if (cat.includes('reel') || cat.includes('video')) {
    return <Film className="text-neon" size={24} />
  }
  return <Briefcase className="text-neon" size={24} />
}

export default function Services() {
  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages', 'all'],
    queryFn: () => packageListAll()
  })

  return (
    <section id="services" className="relative z-10 py-20 md:py-32 bg-black border-b border-white/5 reveal-on-scroll scroll-mt-24">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-neon/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="font-heading text-xs font-black tracking-[0.3em] text-neon uppercase mb-3">
            SERVICES
          </h2>
          <h3 className="font-heading text-3xl md:text-5xl font-black text-silver">
            PRODUCTION SERVICES
          </h3>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="glass-neon p-8 flex flex-col justify-between h-96 animate-pulse">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-white/5 rounded-none" />
                  <div className="h-6 bg-white/5 w-2/3" />
                  <div className="h-20 bg-white/5 w-full" />
                </div>
                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="h-4 bg-white/5 w-1/3" />
                  <div className="h-3 bg-white/5 w-1/2" />
                  <div className="h-3 bg-white/5 w-2/3" />
                </div>
              </div>
            ))
          ) : (
            (packages || [])
              .filter(pkg => pkg.activeStatus)
              .map((svc, idx) => {
                const icon = getIconForCategory(svc.category || svc.packageName)
                return (
                  <div
                    key={svc.packageId || idx}
                    className="glass-neon p-8 flex flex-col justify-between hover:-translate-y-2 hover:neon-glow transition-all duration-300 group cursor-default"
                  >
                    <div>
                      {/* Header Icon + Lift Anim */}
                      <div className="w-12 h-12 rounded-none bg-neon/10 border border-neon/25 flex items-center justify-center mb-6 group-hover:bg-neon group-hover:text-black transition-all duration-300">
                        <span className="group-hover:scale-110 transition-transform duration-300 text-neon group-hover:text-black">
                          {icon}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-heading text-lg font-black text-silver group-hover:text-neon transition-colors duration-300 mb-2 tracking-[0.05em] uppercase">
                        {svc.packageName}
                      </h4>

                      {/* Price */}
                      <div className="text-[#FF8A00] font-mono text-sm font-bold mb-4">
                        ₹{svc.price.toLocaleString()} • {svc.duration || 'Flexible'}
                      </div>

                      {/* Description */}
                      <p className="font-sans text-neutral-400 text-sm leading-relaxed mb-6">
                        {svc.description}
                      </p>
                    </div>

                    {/* Deliverables Sublist */}
                    <div className="border-t border-white/5 pt-4">
                      <span className="font-heading text-[9px] font-black tracking-widest text-neutral-500 uppercase mb-2 block">
                        INCLUDED SERVICES:
                      </span>
                      <ul className="space-y-1.5">
                        {(svc.includedServices || []).map((item, idy) => (
                          <li key={idy} className="font-sans text-xs text-neutral-300 flex items-center gap-2">
                            <span className="w-1 h-1 bg-neon" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </div>
    </section>
  )
}
