import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { 
  Users, Calendar, DollarSign, Activity, Settings, 
  ArrowLeft, Search, Plus, Edit, Trash2, Check, X, ShieldAlert,
  Clock, MapPin, RefreshCw, Layers, CreditCard, ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  authGetCurrentUser, adminGetBookings, adminUpdateBookingStatus, 
  bookingReschedule, bookingCancel, packageListAll, packageCreate, 
  packageUpdate, packageDelete, packageToggleActive, adminGetPaymentHistory,
  adminGetDashboardStats
} from '../server/auth.functions'
import Navbar from '../components/site/Navbar'
import Floating from '../components/site/Floating'
import type { Package } from '../server/db.server'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BOOKINGS' | 'PACKAGES' | 'PAYMENTS'>('OVERVIEW')

  // Auth checking
  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authGetCurrentUser()
  })

  useEffect(() => {
    if (!authLoading && (!user || user.email.toLowerCase() !== 'admin@mrcinematic.com')) {
      toast.error('Access Denied: Administrator authentication required.')
      navigate({ to: '/' })
    }
  }, [user, authLoading, navigate])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-neutral-400 font-sans uppercase tracking-widest text-xs">
        Authenticating Secure Channel...
      </div>
    )
  }

  if (!user || user.email.toLowerCase() !== 'admin@mrcinematic.com') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-neutral-400 font-sans uppercase tracking-widest text-xs">
        Redirecting...
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black pb-16 font-sans text-silver select-none">
      <Navbar />
      
      {/* Cover Banner */}
      <div className="w-full h-48 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-b border-neutral-900 relative">
        <div className="absolute inset-0 bg-[#FF8A00]/5 opacity-30 pointer-events-none" />
      </div>

      <main className="w-full max-w-7xl mx-auto px-6 relative z-10 -mt-24 pb-10">
        {/* Portal Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-800/40 pb-4 gap-4">
          <div>
            <Link
              to="/"
              className="text-[#C0C0C0] hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold uppercase tracking-wider no-underline cursor-pointer mb-2"
            >
              <ArrowLeft size={14} className="text-[#FF8A00]" /> BACK TO HOME
            </Link>
            <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={20} className="text-[#FF8A00] animate-pulse" /> ADMIN COMMAND STATION
            </h1>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex bg-[#111] border border-white/5 p-1 rounded-xl">
            {(['OVERVIEW', 'BOOKINGS', 'PACKAGES', 'PAYMENTS'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer border-0 ${
                  activeTab === tab 
                    ? 'bg-[#FF8A00] text-black shadow-md shadow-[#FF8A00]/25' 
                    : 'text-neutral-400 hover:text-white bg-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Panels */}
        {activeTab === 'OVERVIEW' && <AdminOverviewPanel />}
        {activeTab === 'BOOKINGS' && <AdminBookingsPanel />}
        {activeTab === 'PACKAGES' && <AdminPackagesPanel />}
        {activeTab === 'PAYMENTS' && <AdminPaymentsPanel />}
      </main>

      <Floating />
      <footer className="py-8 bg-black border-t border-white/5 text-center text-[10px] font-heading font-black tracking-widest text-neutral-600 uppercase relative z-10">
        © {new Date().getFullYear()} MR. CINEMATICSHOOT. ADMINISTRATIVE SYSTEM SECURITY SECURED.
      </footer>
    </div>
  )
}

// -------------------------------------------------------------
// OVERVIEW PANEL
// -------------------------------------------------------------
function AdminOverviewPanel() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminGetDashboardStats()
  })

  if (isLoading || !stats) {
    return <div className="text-xs text-neutral-500 py-10 text-center uppercase tracking-widest">Compiling Analytics Data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-neon p-6 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">TOTAL USERS</span>
            <span className="text-3xl font-bold text-white">{stats.totalUsers}</span>
          </div>
          <div className="w-12 h-12 bg-neutral-900 border border-white/5 flex items-center justify-center text-[#FF8A00]">
            <Users size={20} />
          </div>
        </div>

        <div className="glass-neon p-6 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">TOTAL BOOKINGS</span>
            <span className="text-3xl font-bold text-white">{stats.totalBookings}</span>
          </div>
          <div className="w-12 h-12 bg-neutral-900 border border-white/5 flex items-center justify-center text-[#FF8A00]">
            <Calendar size={20} />
          </div>
        </div>

        <div className="glass-neon p-6 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">TOTAL REVENUE</span>
            <span className="text-3xl font-bold text-[#FF8A00]">₹{stats.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 bg-neutral-900 border border-white/5 flex items-center justify-center text-[#FF8A00]">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="glass-neon p-6 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">UPCOMING SHOOTS</span>
            <span className="text-3xl font-bold text-white">{stats.upcomingShoots}</span>
          </div>
          <div className="w-12 h-12 bg-neutral-900 border border-white/5 flex items-center justify-center text-[#FF8A00]">
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* Recent Bookings Feed */}
      <div className="glass p-6 md:p-8">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3 mb-5 flex items-center gap-2">
          <Clock size={14} className="text-[#FF8A00]" /> Recent Bookings Dispatch
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-neutral-500">
                <th className="py-3 px-4 font-bold tracking-widest uppercase">ID</th>
                <th className="py-3 px-4 font-bold tracking-widest uppercase">Customer</th>
                <th className="py-3 px-4 font-bold tracking-widest uppercase">Category</th>
                <th className="py-3 px-4 font-bold tracking-widest uppercase">Shoot Date</th>
                <th className="py-3 px-4 font-bold tracking-widest uppercase">Status</th>
                <th className="py-3 px-4 font-bold tracking-widest uppercase">Payment</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map((b) => (
                <tr key={b.bookingId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-silver">{b.bookingId}</td>
                  <td className="py-3.5 px-4 font-medium text-white">{b.customerName}</td>
                  <td className="py-3.5 px-4 text-neutral-400">{b.photographyCategory}</td>
                  <td className="py-3.5 px-4 text-neutral-400 font-mono">{b.eventDate}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      b.bookingStatus === 'Confirmed' ? 'bg-green-950/40 text-green-400 border border-green-500/25' :
                      b.bookingStatus === 'Pending' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-500/25' :
                      b.bookingStatus === 'In Progress' ? 'bg-blue-950/40 text-blue-400 border border-blue-500/25' :
                      b.bookingStatus === 'Completed' ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/25' :
                      'bg-red-950/40 text-red-400 border border-red-500/25'
                    }`}>
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      b.paymentStatus === 'Success' ? 'bg-green-950/40 text-green-400' :
                      b.paymentStatus === 'Pending' ? 'bg-yellow-950/40 text-yellow-400' :
                      'bg-red-950/40 text-red-400'
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.recentBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-neutral-500 uppercase tracking-widest">No recent bookings logged.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// BOOKINGS MANAGEMENT PANEL
// -------------------------------------------------------------
function AdminBookingsPanel() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [rescheduleData, setRescheduleData] = useState<{ id: string; date: string; time: string } | null>(null)

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: () => adminGetBookings()
  })

  const updateStatusMutation = useMutation({
    mutationFn: (args: { bookingId: string; status: any }) => adminUpdateBookingStatus({ data: args }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success(`Booking ${data.bookingId} set to: ${data.bookingStatus}`)
    }
  })

  const rescheduleMutation = useMutation({
    mutationFn: (args: { bookingId: string; eventDate: string; eventTime: string }) => bookingReschedule({ data: args }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      setRescheduleData(null)
      toast.success(`Booking ${data.bookingId} rescheduled successfully.`)
    }
  })

  const cancelMutation = useMutation({
    mutationFn: (args: { bookingId: string }) => bookingCancel({ data: args }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success(`Booking ${data.bookingId} cancelled.`)
    }
  })

  if (isLoading || !bookings) {
    return <div className="text-xs text-neutral-500 py-10 text-center uppercase tracking-widest">Compiling Bookings...</div>
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'ALL' || b.photographyCategory === filterCategory
    const matchesStatus = filterStatus === 'ALL' || b.bookingStatus === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Unique categories list
  const categories = Array.from(new Set(bookings.map((b) => b.photographyCategory)))

  return (
    <div className="space-y-6">
      {/* Filtering Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative flex items-center col-span-2">
          <Search size={14} className="absolute left-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID or customer name..."
            className="w-full bg-black border border-white/10 p-3 pl-10 text-xs font-sans text-silver focus:border-[#FF8A00] focus:outline-none transition-colors"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[#111] border border-white/10 p-3 text-xs text-silver focus:border-[#FF8A00] focus:outline-none"
        >
          <option value="ALL">ALL CATEGORIES</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#111] border border-white/10 p-3 text-xs text-silver focus:border-[#FF8A00] focus:outline-none"
        >
          <option value="ALL">ALL STATUSES</option>
          {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map((s) => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Bookings List Card */}
      <div className="glass p-6 md:p-8">
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div key={b.bookingId} className="border border-white/5 bg-neutral-900/30 p-5 rounded-xl flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              
              {/* Left detail info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#FF8A00] font-bold text-xs">{b.bookingId}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    b.bookingStatus === 'Confirmed' ? 'bg-green-950 text-green-400' :
                    b.bookingStatus === 'Pending' ? 'bg-yellow-950 text-yellow-400' :
                    b.bookingStatus === 'In Progress' ? 'bg-blue-950 text-blue-400' :
                    b.bookingStatus === 'Completed' ? 'bg-indigo-950 text-indigo-400' :
                    'bg-red-950 text-red-400'
                  }`}>
                    {b.bookingStatus}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white uppercase">{b.customerName}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {b.eventDate} ({b.eventTime})</span>
                  <span className="flex items-center gap-1.5"><MapPin size={12} className="truncate block" /> {b.location}</span>
                  <span>Email: {b.email}</span>
                  <span>Phone: {b.phone}</span>
                  <span className="sm:col-span-2 text-neutral-500 font-medium">Requirements: {b.specialRequirements || 'None'}</span>
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-end lg:self-center">
                {/* Reschedule Button */}
                <button
                  onClick={() => setRescheduleData({ id: b.bookingId, date: b.eventDate, time: b.eventTime })}
                  className="px-3 py-2 border border-white/10 hover:border-[#FF8A00] hover:text-[#FF8A00] text-silver text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-transparent rounded-lg"
                >
                  Reschedule
                </button>

                {/* Status selector */}
                <select
                  value={b.bookingStatus}
                  onChange={(e) => updateStatusMutation.mutate({ bookingId: b.bookingId, status: e.target.value as any })}
                  className="bg-[#111] border border-white/10 px-3 py-2 text-[10px] font-bold text-silver focus:border-[#FF8A00] focus:outline-none rounded-lg"
                >
                  {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
                    <option key={st} value={st}>{st.toUpperCase()}</option>
                  ))}
                </select>

                {/* Cancel Booking */}
                {b.bookingStatus !== 'Cancelled' && (
                  <button
                    onClick={() => { if(confirm('Cancel this shoot booking?')) cancelMutation.mutate({ bookingId: b.bookingId }) }}
                    className="px-3 py-2 bg-red-950/20 border border-red-500/20 hover:border-red-500 text-red-400 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>

            </div>
          ))}
          {filteredBookings.length === 0 && (
            <div className="text-center py-10 text-neutral-500 uppercase tracking-widest">No matching bookings found.</div>
          )}
        </div>
      </div>

      {/* Reschedule dialog modal */}
      {rescheduleData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="glass w-full max-w-sm p-6 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              Reschedule Shoot
            </h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-neutral-400 font-bold uppercase">New Event Date</label>
              <input
                type="date"
                value={rescheduleData.date}
                onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                className="bg-black border border-white/10 p-2.5 text-xs text-silver focus:outline-none focus:border-[#FF8A00]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-neutral-400 font-bold uppercase">Preferred Time Slot</label>
              <select
                value={rescheduleData.time}
                onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                className="bg-black border border-white/10 p-2.5 text-xs text-silver focus:outline-none"
              >
                {['Morning (9 AM - 12 PM)', 'Afternoon (12 PM - 4 PM)', 'Evening (4 PM - 7 PM)', 'Anytime'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRescheduleData(null)}
                className="px-4 py-2 border border-white/10 text-neutral-400 text-[10px] font-bold uppercase tracking-wider rounded bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => rescheduleMutation.mutate({ bookingId: rescheduleData.id, eventDate: rescheduleData.date, eventTime: rescheduleData.time })}
                className="px-4 py-2 bg-[#FF8A00] text-black text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer border-0"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// PACKAGES MANAGEMENT PANEL
// -------------------------------------------------------------
function AdminPackagesPanel() {
  const queryClient = useQueryClient()
  const [editingPkg, setEditingPkg] = useState<Partial<Package> | null>(null)
  
  const { data: packages, isLoading } = useQuery({
    queryKey: ['admin', 'packages'],
    queryFn: () => packageListAll()
  })

  const saveMutation = useMutation({
    mutationFn: (pkg: any) => pkg.packageId ? packageUpdate({ data: pkg }) : packageCreate({ data: pkg }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      setEditingPkg(null)
      toast.success('Package configurations published.')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (packageId: string) => packageDelete({ data: { packageId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast.success('Package deleted.')
    }
  })

  const toggleMutation = useMutation({
    mutationFn: (args: { packageId: string; activeStatus: boolean }) => packageToggleActive({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast.success('Status toggled.')
    }
  })

  if (isLoading || !packages) {
    return <div className="text-xs text-neutral-500 py-10 text-center uppercase tracking-widest">Compiling Roster Packages...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setEditingPkg({ packageName: '', category: 'CINEMATIC REELS (9:16)', description: '', price: 2000, duration: '2 Hours', includedServices: [], activeStatus: true })}
          className="px-4 py-2.5 bg-[#FF8A00] text-black text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer border-0 shadow-md shadow-[#FF8A00]/15 flex items-center gap-1.5"
        >
          <Plus size={14} /> Add Roster Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.packageId} className="glass-neon p-6 flex flex-col justify-between relative">
            <span className={`absolute top-4 right-4 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
              pkg.activeStatus ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'
            }`}>
              {pkg.activeStatus ? 'Active' : 'Disabled'}
            </span>

            <div>
              <span className="font-mono text-[#FF8A00] font-bold text-[10px]">{pkg.packageId}</span>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide mt-1">{pkg.packageName}</h4>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mt-0.5">{pkg.category}</p>
              <p className="text-xs text-neutral-400 leading-relaxed mt-3">{pkg.description}</p>
              
              <div className="mt-4 border-t border-white/5 pt-3">
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Deliverables Included:</span>
                <ul className="space-y-1 mt-1.5 pl-0">
                  {pkg.includedServices.map((srv, idx) => (
                    <li key={idx} className="text-xs text-neutral-300 flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#FF8A00]" /> {srv}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-neutral-500 block uppercase font-bold tracking-wider">DURATION / PRICE</span>
                <span className="text-xs text-[#FF8A00] font-bold">{pkg.duration} — ₹{pkg.price.toLocaleString()}</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPkg(pkg)}
                  className="p-2 border border-white/10 hover:border-white/20 hover:text-white rounded bg-transparent cursor-pointer"
                  title="Edit Package"
                >
                  <Edit size={12} />
                </button>
                <button
                  onClick={() => toggleMutation.mutate({ packageId: pkg.packageId, activeStatus: !pkg.activeStatus })}
                  className={`p-2 border rounded bg-transparent cursor-pointer ${
                    pkg.activeStatus 
                      ? 'border-green-500/20 text-green-400 hover:bg-green-500/10' 
                      : 'border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10'
                  }`}
                  title={pkg.activeStatus ? 'Disable' : 'Enable'}
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => { if(confirm('Delete package?')) deleteMutation.mutate(pkg.packageId) }}
                  className="p-2 border border-red-500/20 text-red-400 hover:border-red-500 hover:bg-red-500/10 rounded bg-transparent cursor-pointer"
                  title="Delete Package"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Package Form Dialog Modal */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate(editingPkg)
            }}
            className="glass w-full max-w-md p-6 border border-white/5 space-y-4 text-left"
          >
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              {editingPkg.packageId ? `Modify Package ${editingPkg.packageId}` : 'Create Package'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 font-bold uppercase">Package Name *</label>
                <input
                  type="text"
                  value={editingPkg.packageName}
                  onChange={(e) => setEditingPkg({ ...editingPkg, packageName: e.target.value })}
                  className="bg-black border border-white/10 p-2.5 text-xs text-silver focus:outline-none focus:border-[#FF8A00]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 font-bold uppercase">Category *</label>
                <select
                  value={editingPkg.category}
                  onChange={(e) => setEditingPkg({ ...editingPkg, category: e.target.value })}
                  className="bg-black border border-white/10 p-2.5 text-xs text-silver focus:outline-none"
                >
                  {['CINEMATIC REELS (9:16)', 'INFLUENCER BRANDING', 'LUXURY AUTOMOTIVE', 'EDITORIAL FASHION', 'CINEMATIC WEDDINGS', 'COMMERCIAL CAMPAIGNS'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[10px] text-neutral-400 font-bold uppercase">Description *</label>
                <textarea
                  value={editingPkg.description}
                  onChange={(e) => setEditingPkg({ ...editingPkg, description: e.target.value })}
                  rows={3}
                  className="bg-black border border-white/10 p-2.5 text-xs text-silver focus:outline-none focus:border-[#FF8A00] resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 font-bold uppercase">Price (₹) *</label>
                <input
                  type="number"
                  value={editingPkg.price}
                  onChange={(e) => setEditingPkg({ ...editingPkg, price: parseInt(e.target.value) })}
                  className="bg-black border border-white/10 p-2.5 text-xs text-silver focus:outline-none focus:border-[#FF8A00]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 font-bold uppercase">Duration *</label>
                <input
                  type="text"
                  value={editingPkg.duration}
                  onChange={(e) => setEditingPkg({ ...editingPkg, duration: e.target.value })}
                  placeholder="e.g. 4 Hours"
                  className="bg-black border border-white/10 p-2.5 text-xs text-silver focus:outline-none focus:border-[#FF8A00]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[10px] text-neutral-400 font-bold uppercase">Included Services (comma separated) *</label>
                <input
                  type="text"
                  value={editingPkg.includedServices?.join(', ')}
                  onChange={(e) => setEditingPkg({ ...editingPkg, includedServices: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="Service 1, Service 2, Service 3..."
                  className="bg-black border border-white/10 p-2.5 text-xs text-silver focus:outline-none focus:border-[#FF8A00]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPkg(null)}
                className="px-4 py-2 border border-white/10 text-neutral-400 text-[10px] font-bold uppercase tracking-wider rounded bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF8A00] text-black text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer border-0"
              >
                Publish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// PAYMENTS PANEL
// -------------------------------------------------------------
function AdminPaymentsPanel() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: () => adminGetPaymentHistory()
  })

  if (isLoading || !payments) {
    return <div className="text-xs text-neutral-500 py-10 text-center uppercase tracking-widest">Compiling Transactions...</div>
  }

  return (
    <div className="glass p-6 md:p-8">
      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3 mb-5 flex items-center gap-2">
        <CreditCard size={14} className="text-[#FF8A00]" /> Billing Audit Ledger
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/5 text-neutral-500">
              <th className="py-3 px-4 font-bold tracking-widest uppercase">ID</th>
              <th className="py-3 px-4 font-bold tracking-widest uppercase">Booking ID</th>
              <th className="py-3 px-4 font-bold tracking-widest uppercase">User</th>
              <th className="py-3 px-4 font-bold tracking-widest uppercase">Amount</th>
              <th className="py-3 px-4 font-bold tracking-widest uppercase">Method</th>
              <th className="py-3 px-4 font-bold tracking-widest uppercase">Status</th>
              <th className="py-3 px-4 font-bold tracking-widest uppercase">Paid At</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.paymentId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-silver">{p.paymentId}</td>
                <td className="py-3.5 px-4 font-mono text-neutral-400">{p.bookingId}</td>
                <td className="py-3.5 px-4 text-white font-medium">{p.userId}</td>
                <td className="py-3.5 px-4 text-[#FF8A00] font-bold">₹{p.amount.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-neutral-400">{p.paymentMethod}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    p.paymentStatus === 'Success' ? 'bg-green-950/40 text-green-400 border border-green-500/20' :
                    p.paymentStatus === 'Pending' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-500/20' :
                    'bg-red-950/40 text-red-400 border border-red-500/20'
                  }`}>
                    {p.paymentStatus}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-neutral-500 font-mono">{p.paidAt ? new Date(p.paidAt).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-neutral-500 uppercase tracking-widest">No payment records logged.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
