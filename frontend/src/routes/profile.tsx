import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Calendar, Phone, Camera, Trash2, ArrowLeft, Save, LogOut, Key, Bell, Shield, User, Lock, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { 
  authGetCurrentUser, authLogout, updateProfile, changePassword,
  bookingListForUser, bookingCancel, bookingReschedule, getPaymentHistory,
  initiatePayment, verifyPayment, reviewCreate, notificationListForUser,
  notificationMarkRead 
} from '../server/auth.functions'
import Navbar from '../components/site/Navbar'
import Floating from '../components/site/Floating'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

interface BookingRecord {
  id?: string
  service: string
  date: string
  price: number
  status: string
  assignedTo?: string
}

interface UserProfile {
  name: string
  email: string
  phone: string
  bio: string
  avatar: string // Base64 data URL or initials
  dob: string
  gender: string
  address: string
  city: string
  state: string
  country: string
  memberSince: string
  emailNotifications: boolean
  smsNotifications: boolean
  password?: string
  indexPortfolio?: boolean
  shareAnalytics?: boolean
}

function ProfilePage() {
  const navigate = useNavigate()
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authGetCurrentUser()
  })

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('Access Denied: Please sign in to access your profile.')
      navigate({ to: '/' })
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-neutral-400 font-sans uppercase tracking-widest text-xs">
        Loading Profile...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-neutral-400 font-sans uppercase tracking-widest text-xs">
        Redirecting...
      </div>
    )
  }

  return (
    <>
      <div className="relative min-h-screen bg-black pb-16 font-sans text-silver">
        
        <Navbar />
        
        {/* Cover Banner (Sleek Dark Cover area to support clean text contrast for the transparent navbar) */}
        <div className="w-full h-64 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-b border-neutral-900 relative">
          <div className="absolute inset-0 bg-[#FF8A00]/5 opacity-30 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
        </div>
        
        {/* Main Content Container */}
        <main className="w-full max-w-3xl mx-auto px-6 relative z-10 -mt-40 pb-10">
          
          {/* Header navigation bar over the dark cover banner */}
          <div className="mb-6 flex items-center justify-between border-b border-neutral-800/40 pb-4">
            <Link
              to="/"
              className="text-[#C0C0C0] hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold uppercase tracking-wider no-underline cursor-pointer"
            >
              <ArrowLeft size={14} className="text-[#FF8A00]" /> Back to Home
            </Link>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              Profile Portal
            </h1>
          </div>

          {/* Centralized Single Column Dark Theme Settings Dashboard */}
          <SingleColumnLightProfileDashboard user={user} />
        </main>

        <Floating />
        
        <footer className="py-8 bg-black border-t border-white/5 text-center text-[10px] font-heading font-black tracking-widest text-neutral-600 uppercase relative z-10">
          © {new Date().getFullYear()} MR. CINEMATICSHOOT. ALL RIGHT PRODUCED.
        </footer>
      </div>
    </>
  )
}

function SingleColumnLightProfileDashboard({ user }: { user: UserProfile }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [activeSubTab, setActiveSubTab] = useState<'SHOOTS' | 'BILLING' | 'INBOX' | 'SETTINGS'>('SHOOTS')
  const [isEditing, setIsEditing] = useState(false)

  // Rescheduling state
  const [rescheduleData, setRescheduleData] = useState<{ id: string; date: string; time: string } | null>(null)
  
  // Review state
  const [reviewData, setReviewData] = useState<{ bookingId: string; rating: number; reviewText: string } | null>(null)

  // Mock checkout state
  const [checkoutData, setCheckoutData] = useState<{ paymentId: string; bookingId: string; amount: number } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('UPI / Cards')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Edit Form Fields State
  const [editName, setEditName] = useState(user.name)
  const [editPhone, setEditPhone] = useState(user.phone)
  const [editAddress, setEditAddress] = useState(user.address)

  // Settings Fields State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [emailAlerts, setEmailAlerts] = useState(!!user.emailNotifications)
  const [smsAlerts, setSmsAlerts] = useState(!!user.smsNotifications)
  const [indexPortfolio, setIndexPortfolio] = useState(user.indexPortfolio !== false)
  const [shareAnalytics, setShareAnalytics] = useState(!!user.shareAnalytics)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // React Queries
  const { data: bookings = [] } = useQuery({
    queryKey: ['auth', 'bookings'],
    queryFn: () => bookingListForUser()
  })

  const { data: payments = [] } = useQuery({
    queryKey: ['auth', 'payments'],
    queryFn: () => getPaymentHistory()
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['auth', 'notifications'],
    queryFn: () => notificationListForUser()
  })

  // Mutations
  const cancelMutation = useMutation({
    mutationFn: (args: { bookingId: string }) => bookingCancel({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success('Shoot booking cancelled.')
    }
  })

  const rescheduleMutation = useMutation({
    mutationFn: (args: { bookingId: string; eventDate: string; eventTime: string }) => bookingReschedule({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      setRescheduleData(null)
      toast.success('Shoot rescheduled successfully.')
    }
  })

  const checkoutMutation = useMutation({
    mutationFn: (args: { bookingId: string; amount: number; paymentMethod: string }) => initiatePayment({ data: args }),
    onSuccess: (data) => {
      setCheckoutData({ paymentId: data.paymentId, bookingId: data.bookingId, amount: data.amount })
    }
  })

  const verifyPaymentMutation = useMutation({
    mutationFn: (args: { paymentId: string; status: 'Success' | 'Failed' }) => verifyPayment({ data: args }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      setCheckoutData(null)
      if (data.paymentStatus === 'Success') {
        toast.success('Payment verified! Your shoot is confirmed.')
      } else {
        toast.error('Payment failed.')
      }
    }
  })

  const reviewMutation = useMutation({
    mutationFn: (args: { bookingId: string; rating: number; reviewText: string }) => reviewCreate({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      setReviewData(null)
      toast.success('Thank you! Review submitted successfully.')
    },
    onError: () => {
      toast.error('Unable to submit review. Verify shoot is complete.')
    }
  })

  const markNotificationsMutation = useMutation({
    mutationFn: () => notificationMarkRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'notifications'] })
    }
  })

  // Sync edits state
  useEffect(() => {
    setEditName(user.name)
    setEditPhone(user.phone)
    setEditAddress(user.address)
    setEmailAlerts(!!user.emailNotifications)
    setSmsAlerts(!!user.smsNotifications)
    setIndexPortfolio(user.indexPortfolio !== false)
    setShareAnalytics(!!user.shareAnalytics)
  }, [user])

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Size Exceeded: Maximum photo upload size is 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      try {
        await updateProfile({
          data: { avatar: base64String }
        })
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
        toast.success('Portrait photo updated successfully.')
      } catch {
        toast.error('Failed to upload image.')
      }
    }
    reader.readAsDataURL(file)
  }

  // Remove photo
  const handleRemovePhoto = async () => {
    const initials = editName.slice(0, 2).toUpperCase()
    try {
      await updateProfile({
        data: { avatar: initials }
      })
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      toast.success('Portrait photo removed.')
    } catch {
      toast.error('Failed to remove photo.')
    }
  }

  // Save info
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) {
      return toast.error('Full Name cannot be empty.')
    }

    let newAvatar = user.avatar
    const isCustomAvatar = user.avatar.startsWith('data:image/')
    if (!isCustomAvatar) {
      newAvatar = editName.slice(0, 2).toUpperCase()
    }

    try {
      await updateProfile({
        data: {
          name: editName,
          phone: editPhone,
          address: editAddress,
          avatar: newAvatar
        }
      })
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      setIsEditing(false)
      toast.success('Personal details updated.')
    } catch {
      toast.error('Failed to update details.')
    }
  }

  // Cancel edit
  const handleCancelChanges = () => {
    setEditName(user.name)
    setEditPhone(user.phone)
    setEditAddress(user.address)
    setIsEditing(false)
  }

  // Save settings / change password
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (currentPassword || newPassword) {
        if (newPassword.length < 6) {
          return toast.error('New password must be at least 6 characters.')
        }
        await changePassword({
          data: { current: currentPassword, next: newPassword }
        })
        toast.success('Password cipher updated.')
      }

      await updateProfile({
        data: {
          emailNotifications: emailAlerts,
          smsNotifications: smsAlerts,
          indexPortfolio,
          shareAnalytics
        }
      })
      
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      setCurrentPassword('')
      setNewPassword('')
      toast.success('Settings configuration applied.')
    } catch (err: any) {
      if (err.message?.includes('INCORRECT_CURRENT_PASSWORD')) {
        toast.error('Current password is incorrect.')
      } else {
        toast.error('Failed to apply settings.')
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await authLogout()
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      toast.success('Signed out successfully.')
      navigate({ to: '/' })
    } catch {
      toast.error('Logout failed.')
    }
  }

  // Quick stats calculations
  const totalSpent = payments
    .filter((p) => p.paymentStatus === 'Success')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const upcomingShoots = bookings.filter(
    (b) => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'In Progress'
  )
  
  const completedShoots = bookings.filter((b) => b.bookingStatus === 'Completed')

  // Notification badge count
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6 text-left">
      {/* 1. PROFILE OVERVIEW HEADER */}
      <div className="glass-neon p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#FF8A00]/5 opacity-10 pointer-events-none" />
        
        {/* Profile Picture */}
        <div className="relative w-24 h-24 rounded-full border-2 border-white/10 text-[#FF8A00] bg-neutral-900 flex items-center justify-center hover:border-[#FF8A00] transition-colors duration-300 overflow-hidden shadow-sm flex-shrink-0 group">
          {user.avatar && (user.avatar.startsWith('data:') || user.avatar.startsWith('http')) ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-silver">{user.avatar}</span>
          )}

          <label className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 rounded-full">
            <Camera size={18} className="text-[#FF8A00]" />
            <span className="text-[9px] font-bold text-white uppercase tracking-wider mt-1">Change</span>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Name and Basic Info */}
        <div className="flex-grow text-center md:text-left space-y-1.5">
          <h2 className="text-2xl font-bold text-white tracking-wide uppercase">
            {user.name}
          </h2>
          <p className="text-sm text-neutral-400 font-medium">{user.email}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-xs text-neutral-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-[#FF8A00]" /> Member since {user.memberSince}
            </span>
            {user.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={12} className="text-[#FF8A00]" /> {user.phone}
              </span>
            )}
          </div>
          
          {user.avatar && (user.avatar.startsWith('data:') || user.avatar.startsWith('http')) && (
            <button
              onClick={handleRemovePhoto}
              className="mt-3 text-[10px] font-bold text-neutral-500 hover:text-red-400 transition-colors uppercase flex items-center justify-center md:justify-start gap-1 cursor-pointer bg-transparent border-0"
            >
              <Trash2 size={11} /> Remove photo
            </button>
          )}
        </div>

        {/* Link to Admin portal if this is the admin */}
        {user.email.toLowerCase() === 'admin@mrcinematic.com' && (
          <Link
            to="/admin"
            className="md:self-start px-4 py-2 border border-[#FF8A00] bg-[#FF8A00]/10 hover:bg-[#FF8A00] hover:text-black text-[#FF8A00] rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer no-underline text-center"
          >
            Admin Panel
          </Link>
        )}
      </div>

      {/* 2. TAB SELECTOR ROW */}
      <div className="flex bg-[#111] border border-white/5 p-1 rounded-xl">
        {([
          { id: 'SHOOTS', label: 'My Shoots' },
          { id: 'BILLING', label: 'Billing & Payments' },
          { id: 'INBOX', label: `Notifications (${unreadNotificationsCount})` },
          { id: 'SETTINGS', label: 'Profile Settings' }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id)
              if (tab.id === 'INBOX') {
                markNotificationsMutation.mutate()
              }
            }}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer border-0 ${
              activeSubTab === tab.id 
                ? 'bg-[#FF8A00] text-black shadow-md shadow-[#FF8A00]/25' 
                : 'text-neutral-400 hover:text-white bg-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      
      {/* MY SHOOTS PANEL */}
      {activeSubTab === 'SHOOTS' && (
        <div className="space-y-6">
          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-900/30 border border-white/5 rounded-xl text-center">
              <div className="text-xl font-bold text-white">{bookings.length}</div>
              <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mt-1 block">Total Bookings</span>
            </div>
            <div className="p-4 bg-neutral-900/30 border border-white/5 rounded-xl text-center">
              <div className="text-xl font-bold text-white">{upcomingShoots.length}</div>
              <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mt-1 block">Upcoming</span>
            </div>
            <div className="p-4 bg-neutral-900/30 border border-white/5 rounded-xl text-center flex flex-col justify-center items-center">
              <div className="text-xl font-bold text-[#FF8A00]">₹{totalSpent.toLocaleString()}</div>
              <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mt-1 block">Total Invested</span>
            </div>
          </div>

          {/* Bookings List */}
          <div className="glass p-6 md:p-8 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Roster Shoot Bookings</h3>
            
            <div className="space-y-4 pt-2">
              {bookings.map((b) => (
                <div key={b.bookingId} className="border border-white/5 bg-neutral-900/10 p-5 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
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
                    <h4 className="text-sm font-bold text-white uppercase">{b.photographyCategory}</h4>
                    <div className="grid grid-cols-1 gap-0.5 text-xs text-neutral-400 font-medium">
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {b.eventDate} ({b.eventTime})</span>
                      <span className="flex items-center gap-1.5"><MapPin size={12} /> {b.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">

                    {/* Reschedule Button */}
                    {b.bookingStatus !== 'Cancelled' && b.bookingStatus !== 'Completed' && (
                      <button
                        onClick={() => setRescheduleData({ id: b.bookingId, date: b.eventDate, time: b.eventTime })}
                        className="px-3.5 py-2 border border-white/10 hover:border-white/20 text-silver hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors bg-transparent cursor-pointer"
                      >
                        Reschedule
                      </button>
                    )}

                    {/* Cancel Button */}
                    {b.bookingStatus !== 'Cancelled' && b.bookingStatus !== 'Completed' && (
                      <button
                        onClick={() => { if (confirm('Cancel this shoot?')) cancelMutation.mutate({ bookingId: b.bookingId }) }}
                        className="px-3.5 py-2 bg-red-950/20 border border-red-500/20 hover:border-red-500 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Write Review Button */}
                    {b.bookingStatus === 'Completed' && (
                      <button
                        onClick={() => setReviewData({ bookingId: b.bookingId, rating: 5, reviewText: '' })}
                        className="px-3.5 py-2 bg-[#FF8A00]/10 border border-[#FF8A00]/30 text-[#FF8A00] hover:bg-[#FF8A00] hover:text-black text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Write Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-8 text-neutral-500 uppercase tracking-widest">No shoot bookings found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BILLING & PAYMENTS PANEL */}
      {activeSubTab === 'BILLING' && (
        <div className="glass p-6 md:p-8 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Billing ledger</h3>
          
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-neutral-500">
                  <th className="py-2.5 px-4 font-bold tracking-widest uppercase">ID</th>
                  <th className="py-2.5 px-4 font-bold tracking-widest uppercase">Booking</th>
                  <th className="py-2.5 px-4 font-bold tracking-widest uppercase">Amount</th>
                  <th className="py-2.5 px-4 font-bold tracking-widest uppercase">Method</th>
                  <th className="py-2.5 px-4 font-bold tracking-widest uppercase">Status</th>
                  <th className="py-2.5 px-4 font-bold tracking-widest uppercase">Paid At</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.paymentId} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-silver">{p.paymentId}</td>
                    <td className="py-3 px-4 font-mono text-neutral-400">{p.bookingId}</td>
                    <td className="py-3 px-4 text-[#FF8A00] font-bold">₹{p.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-neutral-400">{p.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                        p.paymentStatus === 'Success' ? 'bg-green-950/40 text-green-400 border-green-500/20' :
                        p.paymentStatus === 'Pending' ? 'bg-yellow-950/40 text-yellow-400 border-yellow-500/20' :
                        'bg-red-950/40 text-red-400 border-red-500/20'
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 font-mono">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-neutral-500 uppercase tracking-widest">No payment history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS PANEL */}
      {activeSubTab === 'INBOX' && (
        <div className="glass p-6 md:p-8 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Inbox Messages</h3>
          
          <div className="space-y-3 pt-2">
            {notifications.map((n) => (
              <div key={n.notificationId} className={`p-4 rounded-xl border transition-colors ${
                n.read ? 'bg-neutral-900/10 border-white/5' : 'bg-[#FF8A00]/5 border-[#FF8A00]/20'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">{n.title}</h4>
                  <span className="text-[9px] text-neutral-500 font-mono">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">{n.message}</p>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-8 text-neutral-500 uppercase tracking-widest">Your inbox is empty.</div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS PANEL */}
      {activeSubTab === 'SETTINGS' && (
        <div className="space-y-6">
          {/* PERSONAL INFO */}
          <div className="glass p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <User size={13} className="text-[#FF8A00]" /> Personal Information
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[11px] font-bold text-[#FF8A00] hover:underline uppercase bg-transparent border-0 cursor-pointer"
                >
                  Edit Details
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6 text-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Full Name</span>
                  <span className="text-silver font-medium">{user.name}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Email Address</span>
                  <span className="text-silver font-medium truncate block max-w-full">{user.email}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Phone Number</span>
                  <span className="text-silver font-medium">{user.phone || 'N/A'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Street Address</span>
                  <span className="text-silver font-medium truncate block">{user.address || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveInfo} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-400">Full Name *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-black border border-white/10 rounded-xl p-3 text-sm text-silver focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] focus:outline-none transition-colors w-full font-sans"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-400">Phone Number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="bg-black border border-white/10 rounded-xl p-3 text-sm text-silver focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] focus:outline-none transition-colors w-full font-sans"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-neutral-400">Street Address</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="bg-black border border-white/10 rounded-xl p-3 text-sm text-silver focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] focus:outline-none transition-colors w-full font-sans"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleCancelChanges}
                    className="px-5 py-2.5 border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#FF8A00] hover:bg-[#ff9a20] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Save size={12} /> Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SYSTEM SETTINGS & PASSWORD */}
          <form
            onSubmit={handleSaveSettings}
            className="glass p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)] space-y-6"
          >
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3 flex items-center gap-2">
              <Lock size={13} className="text-[#FF8A00]" /> Account Settings
            </h3>

            <div className="space-y-6">
              {/* Password change */}
              <div className="space-y-4 text-left">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block flex items-center gap-1">
                  <Key size={11} className="text-[#FF8A00]" /> Change Password
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-400">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="bg-black border border-white/10 rounded-xl p-3 text-xs text-silver focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] focus:outline-none transition-colors w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-400">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="bg-black border border-white/10 rounded-xl p-3 text-xs text-silver focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] focus:outline-none transition-colors w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-3 pt-2 text-left">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block flex items-center gap-1">
                  <Bell size={11} className="text-[#FF8A00]" /> Notification Preferences
                </span>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-400 select-none">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="accent-[#FF8A00] w-4 h-4 rounded border-white/10 bg-black"
                    />
                    <span>Email notifications for shoot updates and scheduling changes</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-400 select-none">
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      className="accent-[#FF8A00] w-4 h-4 rounded border-white/10 bg-black"
                    />
                    <span>SMS alerts on my contact number when shoots are updated</span>
                  </label>
                </div>
              </div>

              {/* Privacy */}
              <div className="space-y-3 pt-2 text-left">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block flex items-center gap-1">
                  <Shield size={11} className="text-[#FF8A00]" /> Privacy Settings
                </span>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-400 select-none">
                    <input
                      type="checkbox"
                      checked={indexPortfolio}
                      onChange={(e) => setIndexPortfolio(e.target.checked)}
                      className="accent-[#FF8A00] w-4 h-4 rounded border-white/10 bg-black"
                    />
                    <span>Index my custom booked gallery page in public creator feeds</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-400 select-none">
                    <input
                      type="checkbox"
                      checked={shareAnalytics}
                      onChange={(e) => setShareAnalytics(e.target.checked)}
                      className="accent-[#FF8A00] w-4 h-4 rounded border-white/10 bg-black"
                    />
                    <span>Share anonymous metadata to improve visual production render times</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5">
              <button
                onClick={handleSignOut}
                type="button"
                className="w-full sm:w-auto px-5 py-2.5 border border-red-500/20 bg-red-950/20 hover:bg-red-900/30 hover:border-red-500 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={12} /> Logout from Portal
              </button>
              
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-[#FF8A00] hover:bg-[#ff9a20] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Save size={12} /> Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reschedule modal */}
      {rescheduleData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="glass w-full max-w-sm p-6 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              Reschedule Shoot Slot
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
                Apply Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Dialog modal */}
      {reviewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              reviewMutation.mutate(reviewData)
            }}
            className="glass w-full max-w-sm p-6 border border-white/5 space-y-4 text-left"
          >
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              Submit Shoot Review
            </h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-neutral-400 font-bold uppercase">Rating Star Count (1 - 5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className={`p-1 bg-transparent border-0 cursor-pointer text-lg ${
                      reviewData.rating >= star ? 'text-[#FF8A00]' : 'text-neutral-600'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-neutral-400 font-bold uppercase">Review Feedback text</label>
              <textarea
                value={reviewData.reviewText}
                onChange={(e) => setReviewData({ ...reviewData, reviewText: e.target.value })}
                rows={3}
                placeholder="Share your experience working with MrCinematic..."
                className="bg-black border border-white/10 p-2.5 text-xs text-silver focus:outline-none focus:border-[#FF8A00] resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewData(null)}
                className="px-4 py-2 border border-white/10 text-neutral-400 text-[10px] font-bold uppercase tracking-wider rounded bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF8A00] text-black text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer border-0"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mock checkout dialog modal */}
      {checkoutData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 animate-fade-in">
          <div className="glass-neon w-full max-w-sm p-8 border border-white/10 space-y-6 text-center">
            <h3 className="font-heading text-sm font-black text-white uppercase tracking-widest">
              MrCinematic Checkout Gateway
            </h3>
            
            <div className="p-4 bg-neutral-900 border border-white/5 rounded-xl">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Transaction Amount</span>
              <span className="text-2xl font-bold text-[#FF8A00]">₹{checkoutData.amount.toLocaleString()}</span>
              <span className="text-[9px] text-neutral-400 block mt-1 font-mono">Payment ID: {checkoutData.paymentId}</span>
            </div>

            <div className="flex flex-col gap-2 text-left">
              <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Select Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="bg-black border border-white/10 p-3 text-xs text-silver focus:outline-none"
              >
                <option value="UPI / GPay / PhonePe">UPI Payment (GPay/PhonePe)</option>
                <option value="Debit or Credit Card">Debit / Credit Card</option>
                <option value="NetBanking">NetBanking</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => {
                  setIsProcessingPayment(true)
                  setTimeout(() => {
                    setIsProcessingPayment(false)
                    verifyPaymentMutation.mutate({ paymentId: checkoutData.paymentId, status: 'Success' })
                  }, 1200)
                }}
                disabled={isProcessingPayment}
                className="w-full py-3 bg-[#FF8A00] text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer border-0 shadow-lg shadow-[#FF8A00]/20 flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? 'Processing Securely...' : 'Simulate Success'}
              </button>

              <button
                onClick={() => {
                  setIsProcessingPayment(true)
                  setTimeout(() => {
                    setIsProcessingPayment(false)
                    verifyPaymentMutation.mutate({ paymentId: checkoutData.paymentId, status: 'Failed' })
                  }, 800)
                }}
                disabled={isProcessingPayment}
                className="w-full py-3 border border-red-500/20 hover:border-red-500 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer bg-transparent"
              >
                Simulate Fail
              </button>
            </div>

            <p className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold">
              This is an interactive mock transaction gateway. No actual money is processed.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}