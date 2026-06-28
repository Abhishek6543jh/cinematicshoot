import React, { useState, useEffect } from 'react'
import { 
  Lock, LogOut, Calendar, DollarSign, Users, 
  Clock, ExternalLink, Search, 
  Check, Activity, FileText, Trash2,
  Database, Upload, Download, X, Plus, Globe, Play, Edit
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// Type Definitions
interface Booking {
  id: string
  name: string
  email: string
  service: string
  date: string
  message: string
  status: string
  assignedTo: string
  price: number
  paymentStatus: string
  createdAt: string
  locationState?: string
  locationDistrict?: string
  locationArea?: string
  locationVenue?: string
  phoneCode?: string
  phoneNumber?: string
  preferredTime?: string
  pincode?: string
}

interface Application {
  id: string
  name: string
  email: string
  portfolioUrl: string
  resumeUrl: string
  message: string
  jobTitle: string
  status: string
  createdAt: string
}

interface TeamMember {
  name: string
  role: string
  specialty: string
  activeShoots: number
  availability: 'AVAILABLE' | 'ON SHOOT' | 'LEAVE'
}

interface ReelItem {
  id: number
  title: string
  videoUrl: string
  views: string
  likes: string
}

export default function App() {
  // Session Auth states
  const [authRole, setAuthRole] = useState<'NONE' | 'ADMIN' | 'CREW'>('NONE')
  const [activeCrewName, setActiveCrewName] = useState('')
  const [loginTab, setLoginTab] = useState<'ADMIN' | 'CREW'>('ADMIN')
  
  // Credentials input
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPasscode, setAdminPasscode] = useState('')
  const [crewSelect, setCrewSelect] = useState('')
  const [crewPasscode, setCrewPasscode] = useState('')
  
  // Dashboard state tabs
  const [adminTab, setAdminTab] = useState<'OVERVIEW' | 'BOOKINGS' | 'FINANCES' | 'TEAM' | 'APPLICATIONS' | 'WEBSITE' | 'SYSTEM'>('OVERVIEW')
  
  // Local Database States
  const [bookings, setBookings] = useState<Booking[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  
  // Website configuration states
  const [careerHiring, setCareerHiring] = useState(true)
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({})
  const [reels, setReels] = useState<ReelItem[]>([])
  
  // Service pricing edits
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({})

  // Reel Form Modal states
  const [showReelModal, setShowReelModal] = useState(false)
  const [reelEditId, setReelEditId] = useState<number | null>(null)
  const [reelFormTitle, setReelFormTitle] = useState('')
  const [reelFormVideoUrl, setReelFormVideoUrl] = useState('')
  const [reelFormViews, setReelFormViews] = useState('')
  const [reelFormLikes, setReelFormLikes] = useState('')

  // Modals & UI controls
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showAddCrewModal, setShowAddCrewModal] = useState(false)
  const [newCrewName, setNewCrewName] = useState('')
  const [newCrewRole, setNewCrewRole] = useState('')
  const [newCrewSpecialty, setNewCrewSpecialty] = useState('')
  
  // Search & Filters (Admin Bookings)
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingFilterStatus, setBookingFilterStatus] = useState('ALL')
  const [bookingFilterService, setBookingFilterService] = useState('ALL')

  // JSON Data Sync inputs
  const [importText, setImportText] = useState('')
  const [showSyncModal, setShowSyncModal] = useState(false)

  // Seed databases on mount
  useEffect(() => {
    // 1. Restore auth state if page refreshes
    const savedRole = sessionStorage.getItem('mcs_ops_role')
    const savedCrew = sessionStorage.getItem('mcs_ops_crew_name')
    if (savedRole === 'ADMIN') {
      setAuthRole('ADMIN')
    } else if (savedRole === 'CREW' && savedCrew) {
      setAuthRole('CREW')
      setActiveCrewName(savedCrew)
    }

    const loadLocalDatabase = () => {
      // 2. Seed Team Members
      const defaultTeam: TeamMember[] = [
        { name: 'Aiden Maverick', role: 'Lead DP / Visual Director', specialty: 'Luxury Cars & Reels', activeShoots: 1, availability: 'AVAILABLE' },
        { name: 'Sarah Vance', role: 'Senior Editorial Photographer', specialty: 'Fashion & Weddings', activeShoots: 1, availability: 'AVAILABLE' },
        { name: 'Dave Miller', role: 'Director of Photography', specialty: 'Commercial Scale Campaigns', activeShoots: 1, availability: 'ON SHOOT' },
        { name: 'Nate Cross', role: 'Gaffer & Lighting Lead', specialty: 'Lighting Design & Rigging', activeShoots: 0, availability: 'AVAILABLE' },
      ]
      const storedTeam = localStorage.getItem('mcs_global_team')
      if (!storedTeam) {
        localStorage.setItem('mcs_global_team', JSON.stringify(defaultTeam))
        setTeamMembers(defaultTeam)
      } else {
        try { setTeamMembers(JSON.parse(storedTeam)) } catch(e) { setTeamMembers(defaultTeam) }
      }

      // 3. Seed Bookings
      const mockBookings: Booking[] = [
        {
          id: 'MCS-B-4821',
          name: 'ARIA STERLING BRAND',
          email: 'collab@ariasterling.com',
          service: 'INFLUENCER BRANDING',
          date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
          message: 'Sunset penthouse photoshoot with luxury styling and neon color grading. 5-post content batch.',
          status: 'CONFIRMED',
          assignedTo: 'Aiden Maverick',
          price: 6000,
          paymentStatus: 'PAID',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          locationState: 'Maharashtra',
          locationDistrict: 'Mumbai',
          locationArea: 'Bandra West',
          locationVenue: 'Bandra Penthouse, Carter Road',
          phoneCode: '+91',
          phoneNumber: '9876543210',
          preferredTime: 'Evening (4 PM - 7 PM)',
          pincode: '400050'
        },
        {
          id: 'MCS-B-9238',
          name: 'APEX AUTOMOTIVE',
          email: 'media@apexauto.io',
          service: 'LUXURY AUTOMOTIVE',
          date: new Date().toISOString().split('T')[0], // today
          message: 'Midnight tracking shots of carbon matte-black supercar in downtown warehouse district.',
          status: 'CONFIRMED',
          assignedTo: 'Dave Miller',
          price: 10000,
          paymentStatus: 'PENDING',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          locationState: 'Karnataka',
          locationDistrict: 'Bengaluru Urban',
          locationArea: 'Whitefield',
          locationVenue: 'Warehouse 4B, Hoodi Industrial Area',
          phoneCode: '+91',
          phoneNumber: '9123456789',
          preferredTime: 'Anytime',
          pincode: '560048'
        },
        {
          id: 'MCS-B-3109',
          name: 'ZARA COUTURE LTD',
          email: 'campaigns@zara.co.uk',
          service: 'EDITORIAL FASHION',
          date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days from now
          message: 'High-contrast neon alleyway fashion shoot showcasing Fall leather jacket collection.',
          status: 'PENDING DIRECTORS REVIEW',
          assignedTo: 'UNASSIGNED',
          price: 14000,
          paymentStatus: 'PENDING',
          createdAt: new Date().toISOString(),
          locationState: 'Delhi',
          locationDistrict: 'New Delhi',
          locationArea: 'Connaught Place',
          locationVenue: 'Inner Circle Alleyway',
          phoneCode: '+91',
          phoneNumber: '8888888888',
          preferredTime: 'Afternoon (12 PM - 4 PM)',
          pincode: '110001'
        },
        {
          id: 'MCS-B-5561',
          name: 'LUXE VILLA RESORTS',
          email: 'press@luxevillas.com',
          service: 'COMMERCIAL CAMPAIGNS',
          date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], // 10 days from now
          message: 'Premium property video reel and 4K marketing spreads. Drone coverage needed.',
          status: 'CONFIRMED',
          assignedTo: 'Sarah Vance',
          price: 50000,
          paymentStatus: 'PENDING',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          locationState: 'Goa',
          locationDistrict: 'North Goa',
          locationArea: 'Anjuna',
          locationVenue: 'Luxe Cliffside Villa',
          phoneCode: '+91',
          phoneNumber: '7777777777',
          preferredTime: 'Morning (9 AM - 12 PM)',
          pincode: '403509'
        }
      ]
      const storedBookings = localStorage.getItem('mcs_global_bookings')
      let parsedBookings: Booking[] = []
      if (!storedBookings) {
        localStorage.setItem('mcs_global_bookings', JSON.stringify(mockBookings))
        parsedBookings = mockBookings
      } else {
        try {
          const parsed = JSON.parse(storedBookings)
          parsedBookings = parsed.map((pb: Booking) => {
            const match = mockBookings.find(mb => mb.id === pb.id)
            if (match && !pb.locationState) {
              return { ...pb, ...match }
            }
            return pb
          })
          localStorage.setItem('mcs_global_bookings', JSON.stringify(parsedBookings))
        } catch (e) {
          parsedBookings = mockBookings
        }
      }
      setBookings(parsedBookings)

      // 4. Seed Applications
      const mockApps: Application[] = [
        {
          id: 'MCS-CAR-102',
          name: 'MARCUS BELLINGHAM',
          email: 'marcus.dp@gmail.com',
          portfolioUrl: 'https://behance.net/marcusdp',
          resumeUrl: 'https://drive.google.com/marcus-cv.pdf',
          message: 'I handle RED Ranger and Alexa Mini LF packages. Specialized in luxury automotive commercial sequences.',
          jobTitle: 'DIRECTOR OF PHOTOGRAPHY',
          status: 'PENDING REVIEW',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        }
      ]
      const storedApps = localStorage.getItem('mcs_global_applications')
      if (!storedApps) {
        localStorage.setItem('mcs_global_applications', JSON.stringify(mockApps))
        setApplications(mockApps)
      } else {
        try { setApplications(JSON.parse(storedApps)) } catch(e) { setApplications(mockApps) }
      }

      // 5. Seed Career Hiring
      const storedHiring = localStorage.getItem('mcs_global_career_hiring')
      if (storedHiring === null) {
        localStorage.setItem('mcs_global_career_hiring', 'true')
        setCareerHiring(true)
      } else {
        setCareerHiring(storedHiring !== 'false')
      }

      // 6. Seed Service Prices
      const defaultPrices: Record<string, number> = {
        'CINEMATIC REELS (9:16)': 2000,
        'INFLUENCER BRANDING': 6000,
        'LUXURY AUTOMOTIVE': 10000,
        'EDITORIAL FASHION': 14000,
        'CINEMATIC WEDDINGS': 30000,
        'COMMERCIAL CAMPAIGNS': 50000,
      }
      const storedPrices = localStorage.getItem('mcs_global_service_prices')
      if (!storedPrices) {
        localStorage.setItem('mcs_global_service_prices', JSON.stringify(defaultPrices))
        setServicePrices(defaultPrices)
        setEditingPrices(defaultPrices)
      } else {
        try {
          const parsed = JSON.parse(storedPrices)
          setServicePrices(parsed)
          setEditingPrices(parsed)
        } catch (e) {
          setServicePrices(defaultPrices)
          setEditingPrices(defaultPrices)
        }
      }

      // 7. Seed Reels
      const defaultReels: ReelItem[] = [
        {
          id: 0,
          title: 'Midnight Stealth Car Commercial',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-black-car-driving-along-a-street-at-night-42277-large.mp4',
          views: '1.2M',
          likes: '142K',
        },
        {
          id: 1,
          title: 'Vaporwave Cyberpunk Portrait',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-neon-makeup-looking-at-camera-39906-large.mp4',
          views: '840K',
          likes: '95K',
        },
        {
          id: 2,
          title: 'Tokyo Nocturnal Neon Drive',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-neon-lights-of-tokyo-streets-40763-large.mp4',
          views: '2.4M',
          likes: '310K',
        },
        {
          id: 3,
          title: 'Influencer Vlogging Behind Scenes',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-recording-herself-with-a-smartphone-43034-large.mp4',
          views: '620K',
          likes: '78K',
        },
      ]
      const storedReels = localStorage.getItem('mcs_global_reels')
      if (!storedReels) {
        localStorage.setItem('mcs_global_reels', JSON.stringify(defaultReels))
        setReels(defaultReels)
      } else {
        try { setReels(JSON.parse(storedReels)) } catch (e) { setReels(defaultReels) }
      }
    }

    loadLocalDatabase()

    // Listen to changes in other tabs
    window.addEventListener('storage', loadLocalDatabase)
    return () => window.removeEventListener('storage', loadLocalDatabase)
  }, [])

  // Handle Authentication Logins
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminEmail.trim().toLowerCase() !== 'admin@mrcinematic.com') {
      toast.error('Sign In Failed: Invalid administrator email.')
      return
    }
    if (adminPasscode !== 'cinema2026') {
      toast.error('Sign In Failed: Incorrect administrator passcode.')
      return
    }

    setAuthRole('ADMIN')
    sessionStorage.setItem('mcs_ops_role', 'ADMIN')
    toast.success('Administrator session established successfully.')
  }

  const handleCrewLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!crewSelect) {
      toast.error('Access Denied: Please select your partner identity.')
      return
    }
    if (crewPasscode !== 'crew2026') {
      toast.error('Access Denied: Invalid security passcode.')
      return
    }

    setAuthRole('CREW')
    setActiveCrewName(crewSelect)
    sessionStorage.setItem('mcs_ops_role', 'CREW')
    sessionStorage.setItem('mcs_ops_crew_name', crewSelect)
    toast.success(`Welcome back, ${crewSelect}. Portal dispatch loaded.`)
  }

  const handleLogout = () => {
    setAuthRole('NONE')
    setActiveCrewName('')
    sessionStorage.removeItem('mcs_ops_role')
    sessionStorage.removeItem('mcs_ops_crew_name')
    toast.success('Session terminated. Secure vault locked.')
  }

  // Admin roster operations
  const handleAddCrew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCrewName || !newCrewRole) {
      toast.error('Please enter name and role.')
      return
    }

    const newMember: TeamMember = {
      name: newCrewName,
      role: newCrewRole,
      specialty: newCrewSpecialty || 'General Photography & Reels',
      activeShoots: 0,
      availability: 'AVAILABLE'
    }

    const updated = [...teamMembers, newMember]
    localStorage.setItem('mcs_global_team', JSON.stringify(updated))
    setTeamMembers(updated)
    toast.success(`${newCrewName} added to the operational team.`)
    
    // Reset modal
    setNewCrewName('')
    setNewCrewRole('')
    setNewCrewSpecialty('')
    setShowAddCrewModal(false)
  }

  const handleDeleteCrew = (name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the active roster?`)) return
    const updated = teamMembers.filter(t => t.name !== name)
    localStorage.setItem('mcs_global_team', JSON.stringify(updated))
    setTeamMembers(updated)
    toast.success(`Removed ${name} from roster database.`)
  }

  const handleToggleCrewAvailabilityAdmin = (name: string) => {
    const updated = teamMembers.map(t => {
      if (t.name === name) {
        const next: Record<string, 'AVAILABLE' | 'ON SHOOT' | 'LEAVE'> = {
          'AVAILABLE': 'ON SHOOT',
          'ON SHOOT': 'LEAVE',
          'LEAVE': 'AVAILABLE'
        }
        return { ...t, availability: next[t.availability] || 'AVAILABLE' }
      }
      return t
    })
    localStorage.setItem('mcs_global_team', JSON.stringify(updated))
    setTeamMembers(updated)
    toast.success(`Availability status modified.`)
  }

  // Partner portal status toggle
  const handleToggleMyAvailability = () => {
    const updated = teamMembers.map(t => {
      if (t.name.toLowerCase() === activeCrewName.toLowerCase()) {
        const next: Record<string, 'AVAILABLE' | 'ON SHOOT' | 'LEAVE'> = {
          'AVAILABLE': 'ON SHOOT',
          'ON SHOOT': 'LEAVE',
          'LEAVE': 'AVAILABLE'
        }
        const nextStatus = next[t.availability] || 'AVAILABLE'
        toast.info(`Duty status set to: ${nextStatus}`)
        return { ...t, availability: nextStatus }
      }
      return t
    })
    localStorage.setItem('mcs_global_team', JSON.stringify(updated))
    setTeamMembers(updated)
  }

  // Booking operations
  const handleUpdateBookingStatus = (id: string, status: string) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status } : b)
    localStorage.setItem('mcs_global_bookings', JSON.stringify(updated))
    setBookings(updated)
    toast.success(`Booking ${id} status updated to ${status}.`)
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status })
    }
  }

  const handleUpdatePaymentStatus = (id: string, paymentStatus: string) => {
    const updated = bookings.map(b => b.id === id ? { ...b, paymentStatus } : b)
    localStorage.setItem('mcs_global_bookings', JSON.stringify(updated))
    setBookings(updated)
    toast.success(`Booking ${id} payment set to ${paymentStatus}.`)
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, paymentStatus })
    }
  }

  const handleAssignCrew = (id: string, crewName: string) => {
    const updated = bookings.map(b => b.id === id ? { ...b, assignedTo: crewName } : b)
    localStorage.setItem('mcs_global_bookings', JSON.stringify(updated))
    setBookings(updated)
    toast.success(`Assigned ${crewName === 'UNASSIGNED' ? 'none' : crewName} to booking ${id}.`)
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, assignedTo: crewName })
    }
  }

  const getCrewStatusForDate = (crewName: string, date: string, currentBookingId: string) => {
    const member = teamMembers.find(t => t.name.toLowerCase() === crewName.toLowerCase())
    if (member && member.availability === 'LEAVE') {
      return 'ON LEAVE'
    }
    const isBusy = bookings.some(b => 
      b.id !== currentBookingId && 
      b.assignedTo.toLowerCase() === crewName.toLowerCase() && 
      b.date === date && 
      b.status === 'CONFIRMED'
    )
    return isBusy ? 'BUSY ON THIS DAY' : 'AVAILABLE'
  }

  // Candidates / Application management
  const handleUpdateAppStatus = (id: string, status: string) => {
    const updated = applications.map(a => a.id === id ? { ...a, status } : a)
    localStorage.setItem('mcs_global_applications', JSON.stringify(updated))
    setApplications(updated)
    toast.success(`Application status updated to ${status}.`)
  }

  const handleDeleteApp = (id: string) => {
    if (!window.confirm('Delete this job application candidate?')) return
    const updated = applications.filter(a => a.id !== id)
    localStorage.setItem('mcs_global_applications', JSON.stringify(updated))
    setApplications(updated)
    toast.success('Application removed.')
  }

  // Website Config Toggles
  const handleToggleHiring = (active: boolean) => {
    localStorage.setItem('mcs_global_career_hiring', String(active))
    setCareerHiring(active)
    toast.success(`Career open positions status set to: ${active ? 'ACTIVE' : 'SUSPENDED (Displaying "No Current Hirings")'}`)
    window.dispatchEvent(new Event('storage'))
  }

  const handleSavePrices = () => {
    localStorage.setItem('mcs_global_service_prices', JSON.stringify(editingPrices))
    setServicePrices(editingPrices)
    toast.success('Services base pricing updated and published.')
    window.dispatchEvent(new Event('storage'))
  }

  const handleSaveReel = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reelFormTitle.trim() || !reelFormVideoUrl.trim()) {
      toast.error('Please enter a Title and a Video URL.')
      return
    }

    let updated: ReelItem[] = []
    if (reelEditId !== null) {
      // Editing
      updated = reels.map(r => r.id === reelEditId ? {
        ...r,
        title: reelFormTitle,
        videoUrl: reelFormVideoUrl,
        views: reelFormViews || r.views || '120K',
        likes: reelFormLikes || r.likes || '10K'
      } : r)
      toast.success('Homepage video reel updated.')
    } else {
      // Adding new
      const nextId = reels.length > 0 ? Math.max(...reels.map(r => r.id)) + 1 : 0
      const newReel: ReelItem = {
        id: nextId,
        title: reelFormTitle,
        videoUrl: reelFormVideoUrl,
        views: reelFormViews || '100K',
        likes: reelFormLikes || '8K'
      }
      updated = [...reels, newReel]
      toast.success('New video reel published.')
    }

    localStorage.setItem('mcs_global_reels', JSON.stringify(updated))
    setReels(updated)
    
    // Reset Form
    setReelFormTitle('')
    setReelFormVideoUrl('')
    setReelFormViews('')
    setReelFormLikes('')
    setReelEditId(null)
    setShowReelModal(false)

    window.dispatchEvent(new Event('storage'))
  }

  const handleDeleteReel = (id: number) => {
    if (!window.confirm('Delete this video reel from homepage preview?')) return
    const updated = reels.filter(r => r.id !== id)
    localStorage.setItem('mcs_global_reels', JSON.stringify(updated))
    setReels(updated)
    toast.success('Reel deleted from database.')
    window.dispatchEvent(new Event('storage'))
  }

  const handleOpenEditReel = (reel: ReelItem) => {
    setReelEditId(reel.id)
    setReelFormTitle(reel.title)
    setReelFormVideoUrl(reel.videoUrl)
    setReelFormViews(reel.views)
    setReelFormLikes(reel.likes)
    setShowReelModal(true)
  }

  const handleOpenAddReel = () => {
    setReelEditId(null)
    setReelFormTitle('')
    setReelFormVideoUrl('')
    setReelFormViews('')
    setReelFormLikes('')
    setShowReelModal(true)
  }

  // DB Sync Tools
  const handleExportData = () => {
    const data = {
      bookings,
      teamMembers,
      applications,
      careerHiring,
      servicePrices,
      reels
    }
    const jsonStr = JSON.stringify(data, null, 2)
    navigator.clipboard.writeText(jsonStr)
    toast.success('Database payload copied to clipboard!')
  }

  const handleImportData = () => {
    if (!importText) {
      toast.error('Paste JSON payload first.')
      return
    }
    try {
      const parsed = JSON.parse(importText)
      if (parsed.bookings) {
        localStorage.setItem('mcs_global_bookings', JSON.stringify(parsed.bookings))
        setBookings(parsed.bookings)
      }
      if (parsed.teamMembers) {
        localStorage.setItem('mcs_global_team', JSON.stringify(parsed.teamMembers))
        setTeamMembers(parsed.teamMembers)
      }
      if (parsed.applications) {
        localStorage.setItem('mcs_global_applications', JSON.stringify(parsed.applications))
        setApplications(parsed.applications)
      }
      if (parsed.careerHiring !== undefined) {
        localStorage.setItem('mcs_global_career_hiring', String(parsed.careerHiring))
        setCareerHiring(parsed.careerHiring)
      }
      if (parsed.servicePrices) {
        localStorage.setItem('mcs_global_service_prices', JSON.stringify(parsed.servicePrices))
        setServicePrices(parsed.servicePrices)
        setEditingPrices(parsed.servicePrices)
      }
      if (parsed.reels) {
        localStorage.setItem('mcs_global_reels', JSON.stringify(parsed.reels))
        setReels(parsed.reels)
      }
      toast.success('Database synchronized successfully!')
      setImportText('')
      setShowSyncModal(false)
      window.dispatchEvent(new Event('storage'))
    } catch (e) {
      toast.error('Invalid database JSON structure.')
    }
  }

  const handleResetDefaults = () => {
    if (!window.confirm('Reset local storage to original seed data? All custom bookings and crew will be lost.')) return
    localStorage.removeItem('mcs_global_bookings')
    localStorage.removeItem('mcs_global_team')
    localStorage.removeItem('mcs_global_applications')
    localStorage.removeItem('mcs_global_career_hiring')
    localStorage.removeItem('mcs_global_service_prices')
    localStorage.removeItem('mcs_global_reels')
    window.location.reload()
  }

  // Metric Calculation & Chart Formatter
  const grossPaid = bookings.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.price, 0)
  const pendingReceivables = bookings.filter(b => b.paymentStatus === 'PENDING').reduce((sum, b) => sum + b.price, 0)
  const totalValuation = grossPaid + pendingReceivables

  // Group monthly finance
  const getMonths = () => {
    const monthlyData: Record<string, { name: string; paid: number; pending: number; count: number }> = {}
    bookings.forEach(b => {
      // parse date (yyyy-mm-dd)
      const dateParts = b.date.split('-')
      if (dateParts.length >= 2) {
        const year = dateParts[0]
        const monthNum = parseInt(dateParts[1])
        const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const key = `${year}-${monthsNames[monthNum - 1]}`
        if (!monthlyData[key]) {
          monthlyData[key] = { name: `${monthsNames[monthNum - 1]} ${year}`, paid: 0, pending: 0, count: 0 }
        }
        if (b.paymentStatus === 'PAID') {
          monthlyData[key].paid += b.price
        } else {
          monthlyData[key].pending += b.price
        }
        monthlyData[key].count++
      }
    })
    return Object.values(monthlyData)
  }

  const chartData = getMonths()

  // Filters calculation
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(bookingSearch.toLowerCase()) || 
                          b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.service.toLowerCase().includes(bookingSearch.toLowerCase())
    const matchesStatus = bookingFilterStatus === 'ALL' || b.status === bookingFilterStatus
    const matchesService = bookingFilterService === 'ALL' || b.service === bookingFilterService
    return matchesSearch && matchesStatus && matchesService
  })

  // Partner calculations
  const myBookings = bookings.filter(b => b.assignedTo.toLowerCase() === activeCrewName.toLowerCase())
  const todayStr = new Date().toISOString().split('T')[0]
  const todayShoots = myBookings.filter(b => b.date === todayStr && b.status === 'CONFIRMED')
  const upcomingShoots = myBookings.filter(b => b.date > todayStr && b.status === 'CONFIRMED')
  const pastShoots = myBookings.filter(b => b.status === 'COMPLETED' || b.date < todayStr)
  
  const myCompletedCount = myBookings.filter(b => b.status === 'COMPLETED').length
  const myUpcomingCount = upcomingShoots.length
  
  const myProfile = teamMembers.find(t => t.name.toLowerCase() === activeCrewName.toLowerCase())

  const myEarnedPaid = myBookings.filter(b => b.status === 'COMPLETED' && b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.price, 0)
  const myEarnedPending = myBookings.filter(b => b.status === 'COMPLETED' && b.paymentStatus === 'PENDING').reduce((sum, b) => sum + b.price, 0)

  // RENDER GATE 1: SIGN IN SCREEN
  if (authRole === 'NONE') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300">
          
          {/* Header */}
          <div className="bg-slate-900 text-white py-8 px-8 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-transparent to-transparent pointer-events-none" />
            <h1 className="font-heading text-lg font-black tracking-[0.2em] text-indigo-400 uppercase">
              MR. CINEMATICSHOOT
            </h1>
            <p className="text-[10px] tracking-widest text-slate-400 font-bold uppercase mt-1">
              OPERATIONS & PARTNERS PORTAL
            </p>
          </div>

          {/* Selector Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button
              onClick={() => setLoginTab('ADMIN')}
              className={`flex-1 py-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all ${
                loginTab === 'ADMIN' 
                  ? 'border-indigo-600 text-indigo-600 bg-white' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              Administrator Access
            </button>
            <button
              onClick={() => setLoginTab('CREW')}
              className={`flex-1 py-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all ${
                loginTab === 'CREW' 
                  ? 'border-indigo-600 text-indigo-600 bg-white' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              Partner / Crew Gateway
            </button>
          </div>

          <div className="p-8">
            {loginTab === 'ADMIN' ? (
              // ADMIN FORM
              <form onSubmit={handleAdminLogin} className="space-y-5 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@mrcinematic.com"
                    className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Security Passcode
                  </label>
                  <input
                    type="password"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 text-white rounded-lg font-heading text-xs font-black tracking-widest uppercase hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Lock size={12} />
                  Authorize Admin Session
                </button>
              </form>
            ) : (
              // PARTNER FORM
              <form onSubmit={handleCrewLogin} className="space-y-5 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Select Member Name
                  </label>
                  <select
                    value={crewSelect}
                    onChange={(e) => setCrewSelect(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all cursor-pointer text-slate-700 font-medium"
                    required
                  >
                    <option value="">-- Choose Identity --</option>
                    {teamMembers.map(t => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Partner Access Key
                  </label>
                  <input
                    type="password"
                    value={crewPasscode}
                    onChange={(e) => setCrewPasscode(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 text-white rounded-lg font-heading text-xs font-black tracking-widest uppercase hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Lock size={12} />
                  Access Worker Console
                </button>
              </form>
            )}

            <div className="mt-8 border-t border-slate-100 pt-5 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Authorization protocol v2.6.2026
              </span>
            </div>
          </div>
        </div>
        <Toaster position="top-right" richColors />
      </div>
    )
  }

  // RENDER GATE 2: PARTNER DASHBOARD (CREW)
  if (authRole === 'CREW') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-700 flex flex-col font-sans">
        
        {/* Navigation Header */}
        <header className="border-b border-slate-200 bg-white px-6 md:px-12 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              C
            </div>
            <div className="text-sm font-black tracking-widest text-slate-900 font-heading">
              MR. CINEMATICSHOOT <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 ml-2 font-bold tracking-widest rounded border border-indigo-100">PARTNER</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:border-red-500 hover:text-red-600 text-xs font-black tracking-widest uppercase flex items-center gap-1.5 transition-all cursor-pointer rounded-lg bg-white shadow-sm"
          >
            <LogOut size={12} />
            Lock Portal
          </button>
        </header>

        {/* Dashboard Area */}
        <main className="w-full max-w-7xl mx-auto px-6 md:px-12 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Identity Card */}
            {myProfile && (
              <div className="clean-card p-6 rounded-2xl space-y-5">
                <div>
                  <span className="font-heading text-[10px] font-bold tracking-widest text-indigo-600 uppercase block mb-1">
                    Authenticated Crew Member
                  </span>
                  <h2 className="font-heading text-2xl font-black text-slate-900 tracking-wide uppercase">
                    {myProfile.name}
                  </h2>
                  <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                    {myProfile.role}
                  </span>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs text-slate-600 mt-4">
                    <span className="font-bold block text-slate-700 text-[10px] uppercase tracking-wider mb-0.5">Specialty focus</span>
                    {myProfile.specialty}
                  </div>
                </div>

                {/* Duty Toggle */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <span className="font-heading text-[10px] font-bold tracking-widest text-slate-400 block mb-1">
                    Duty Availability Status
                  </span>
                  
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <span className={`inline-block px-3 py-1 border text-[10px] font-bold tracking-widest rounded-full ${
                      myProfile.availability === 'AVAILABLE' 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                        : myProfile.availability === 'ON SHOOT'
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 animate-pulse'
                          : 'border-slate-200 bg-slate-100 text-slate-500'
                    }`}>
                      {myProfile.availability}
                    </span>
                    
                    <button
                      onClick={handleToggleMyAvailability}
                      className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 text-[10px] font-bold tracking-widest cursor-pointer transition-all rounded-lg shadow-sm uppercase font-heading"
                    >
                      Cycle Status
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Earnings / Telemetry Card */}
            <div className="clean-card p-6 rounded-2xl space-y-5">
              <h3 className="font-heading text-xs font-black tracking-widest text-slate-800 uppercase border-b border-slate-100 pb-3">
                Financial Telemetry
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-emerald-50/50 p-4 border border-emerald-100 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-emerald-800 font-bold tracking-wider uppercase block">Paid Earnings</span>
                    <span className="text-xs text-slate-400">Completed & Disbursed</span>
                  </div>
                  <span className="text-xl font-black text-emerald-700 font-heading">₹{myEarnedPaid.toLocaleString()}</span>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase block">Pending Invoices</span>
                    <span className="text-xs text-slate-400">Awaiting Client Clearance</span>
                  </div>
                  <span className="text-xl font-black text-slate-800 font-heading">₹{myEarnedPending.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50/80 p-3 border border-slate-100 rounded-xl text-center">
                  <span className="text-2xl font-black text-slate-800 font-heading">{myCompletedCount}</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider block mt-0.5">COMPLETED</span>
                </div>
                
                <div className="bg-slate-50/80 p-3 border border-slate-100 rounded-xl text-center">
                  <span className="text-2xl font-black text-slate-800 font-heading">{myUpcomingCount}</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider block mt-0.5">UPCOMING</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right panel - Shoots list */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* A. TODAY'S ASSIGNED WORK */}
            <div className="clean-card p-6 rounded-2xl space-y-4">
              <span className="font-heading text-xs font-black tracking-widest text-indigo-600 block border-b border-slate-100 pb-3 flex items-center gap-2 uppercase">
                <Clock size={14} className="text-indigo-500" /> Today's Production Dispatches
              </span>

              {todayShoots.length > 0 ? (
                <div className="space-y-4">
                  {todayShoots.map((b) => (
                    <div key={b.id} className="p-5 border border-indigo-100 bg-indigo-50/20 rounded-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
                      <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-white font-heading text-[8px] font-bold tracking-widest rounded-bl uppercase">
                        ACTIVE TODAY
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-slate-400 font-semibold">{b.id}</span>
                          <span className="font-heading text-[9px] font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                            {b.service}
                          </span>
                        </div>
                        <h4 className="font-heading text-lg font-black text-slate-900 tracking-wide uppercase">{b.name}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-xl italic">
                          "{b.message}"
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 items-start md:items-end w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-heading text-[10px] font-black tracking-widest uppercase transition-all w-full md:w-auto cursor-pointer rounded-lg shadow-sm"
                        >
                          View Brief
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 tracking-widest font-heading border border-dashed border-slate-200 rounded-xl uppercase">
                  No dispatches scheduled for today.
                </div>
              )}
            </div>

            {/* B. UPCOMING PRODUCTION DISPATCHES */}
            <div className="clean-card p-6 rounded-2xl space-y-4">
              <span className="font-heading text-xs font-black tracking-widest text-slate-800 block border-b border-slate-100 pb-3 uppercase">
                Upcoming Shoot Schedule
              </span>

              {upcomingShoots.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {upcomingShoots.map((b) => (
                    <div key={b.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-slate-400 font-semibold">{b.id}</span>
                          <span className="font-heading text-[9px] font-bold tracking-widest text-indigo-600 uppercase">
                            {b.service}
                          </span>
                        </div>
                        <h4 className="font-heading text-sm font-black text-slate-800 tracking-wide uppercase">{b.name}</h4>
                        <span className="text-[10px] font-bold text-slate-500 tracking-wider block bg-slate-100 px-2 py-0.5 rounded w-max">
                          Target Date: {b.date}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1.5 border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-[10px] font-heading font-black tracking-widest uppercase transition-colors w-full md:w-auto cursor-pointer rounded-lg bg-white"
                      >
                        View Brief
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 tracking-widest font-heading border border-dashed border-slate-200 rounded-xl uppercase">
                  No upcoming shoots assigned.
                </div>
              )}
            </div>

            {/* C. COMPLETED HISTORY */}
            <div className="clean-card p-6 rounded-2xl space-y-4">
              <span className="font-heading text-xs font-black tracking-widest text-slate-800 block border-b border-slate-100 pb-3 uppercase">
                Completed Logs
              </span>

              {pastShoots.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {pastShoots.map((b) => (
                    <div key={b.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-80">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-slate-400">{b.id}</span>
                          <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                            {b.service}
                          </span>
                        </div>
                        <h4 className="font-heading text-sm font-bold text-slate-700 tracking-wide uppercase">{b.name}</h4>
                        <span className="text-[9px] text-slate-400 block">
                          Date: {b.date} • Invoice: {b.paymentStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 border border-emerald-200 bg-emerald-50 text-emerald-700 text-[8px] font-black tracking-widest uppercase rounded">
                          {b.status}
                        </span>
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1.5 border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-[8px] font-heading font-black tracking-widest uppercase transition-colors cursor-pointer rounded bg-white"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 tracking-widest font-heading border border-dashed border-slate-200 rounded-xl uppercase">
                  No completed operations recorded.
                </div>
              )}
            </div>

          </div>

        </main>

        {/* Modal display for booking briefs */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <div className="absolute inset-0 cursor-default" onClick={() => setSelectedBooking(null)} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 border border-slate-100 z-10 animate-fade-in text-left">
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full"
                aria-label="Close details"
              >
                <X size={16} />
              </button>

              <div className="mb-6 border-b border-slate-100 pb-4">
                <span className="font-heading text-[10px] font-black tracking-widest text-indigo-600 uppercase block mb-1">
                  Production Dispatch Brief
                </span>
                <h3 className="font-heading text-lg font-black text-slate-900 tracking-wide uppercase">
                  {selectedBooking.id} / {selectedBooking.name}
                </h3>
              </div>

              <div className="space-y-5 font-sans text-xs text-slate-600">
                
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">SERVICE TYPE</span>
                    <span className="font-heading text-xs font-black text-slate-800 uppercase">{selectedBooking.service}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">TARGET DATE</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{selectedBooking.date}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">CLIENT CONTACT</span>
                    <div className="space-y-1">
                      <span className="text-slate-800 font-medium select-text block">{selectedBooking.email}</span>
                      {selectedBooking.phoneNumber && (
                        <span className="text-slate-800 font-mono font-bold select-text block">
                          {selectedBooking.phoneCode || '+91'} {selectedBooking.phoneNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">PREFERRED CALL TIME</span>
                    <span className="text-slate-800 font-medium block">{selectedBooking.preferredTime || 'Anytime'}</span>
                  </div>
                </div>

                {selectedBooking.locationState && (
                  <div className="border-b border-slate-100 pb-4">
                    <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-2">SHOOT LOCATION DETAILED</span>
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 border border-slate-100 rounded-xl">
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Venue / Landmark</span>
                        <span className="text-slate-800 font-semibold text-[11px] block">{selectedBooking.locationVenue}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Area / Pincode</span>
                        <span className="text-slate-800 font-semibold text-[11px] block">{selectedBooking.locationArea} {selectedBooking.pincode && `- ${selectedBooking.pincode}`}</span>
                      </div>
                      <div className="col-span-2 border-t border-slate-200/60 pt-2 mt-1">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">District & State</span>
                        <span className="text-slate-800 font-semibold text-[11px] block">{selectedBooking.locationDistrict}, {selectedBooking.locationState}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">PAYMENT RATE</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">₹{selectedBooking.price.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">PAYMENT STATUS</span>
                    <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full inline-block border ${
                      selectedBooking.paymentStatus === 'PAID' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {selectedBooking.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-2">TELEMETRY & INSTRUCTIONS</span>
                  <p className="bg-slate-50 p-4 border border-slate-100 rounded-xl font-mono text-[11px] leading-relaxed select-text whitespace-pre-line text-slate-600">
                    {selectedBooking.message}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  {selectedBooking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => {
                        const updated = bookings.map(b => b.id === selectedBooking.id ? { ...b, status: 'COMPLETED' } : b)
                        localStorage.setItem('mcs_global_bookings', JSON.stringify(updated))
                        setBookings(updated)
                        setSelectedBooking({ ...selectedBooking, status: 'COMPLETED' })
                        toast.success(`Shoot marked as completed. Invoice status synced.`)
                      }}
                      className="w-full py-3 bg-indigo-600 text-white font-heading text-[10px] font-black tracking-widest uppercase hover:bg-indigo-700 transition-all rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border-0"
                    >
                      <Check size={12} />
                      Complete Dispatch Assignment
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-heading text-[10px] font-black tracking-widest uppercase transition-colors cursor-pointer bg-white rounded-lg"
                  >
                    Dismiss Details
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        <footer className="py-8 bg-white border-t border-slate-200 text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          © {new Date().getFullYear()} MR. CINEMATICSHOOT. OPERATIONS CENTER.
        </footer>
        <Toaster position="top-right" richColors />
      </div>
    )
  }

  // RENDER GATE 3: ADMINISTRATOR PORTAL
  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 flex flex-col font-sans">
      
      {/* Top operational bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-6 md:px-12 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            M
          </div>
          <div className="text-left">
            <h1 className="font-heading text-sm font-black tracking-[0.15em] text-white uppercase leading-none">
              MR. <span className="text-indigo-400">CINEMATICSHOOT</span>
            </h1>
            <span className="text-[9px] text-slate-400 tracking-wider font-bold uppercase mt-1 block">
              Administrative Control Deck
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSyncModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 hover:border-slate-600 text-[10px] font-bold tracking-wider rounded uppercase flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Database size={11} />
            Data Sync
          </button>
          
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 border border-slate-700 hover:border-red-500 hover:text-red-400 text-xs font-black tracking-widest uppercase flex items-center gap-1.5 transition-all cursor-pointer rounded-lg bg-slate-800 text-slate-300"
          >
            <LogOut size={12} />
            Lock Console
          </button>
        </div>
      </header>

      {/* Main navigation menu for admin */}
      <div className="bg-white border-b border-slate-200 shadow-sm px-6 md:px-12 overflow-x-auto flex">
        <div className="max-w-7xl mx-auto w-full flex gap-1">
          {[
            { id: 'OVERVIEW', label: 'Overview Metrics', icon: <Activity size={14} /> },
            { id: 'BOOKINGS', label: 'Manage Bookings', icon: <Calendar size={14} /> },
            { id: 'FINANCES', label: 'Monthly Ledgers', icon: <DollarSign size={14} /> },
            { id: 'TEAM', label: 'Active Roster', icon: <Users size={14} /> },
            { id: 'APPLICATIONS', label: 'Crew Job Candidates', icon: <FileText size={14} /> },
            { id: 'WEBSITE', label: 'Website Controls', icon: <Globe size={14} /> },
            { id: 'SYSTEM', label: 'Database Tools', icon: <Database size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`py-4 px-4 text-xs font-bold tracking-wider uppercase border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                adminTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600 font-extrabold bg-indigo-50/10' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Panels */}
      <main className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8 flex-1 animate-fade-in">
        
        {/* A. OVERVIEW METRICS TAB */}
        {adminTab === 'OVERVIEW' && (
          <div className="space-y-8">
            
            {/* Analytics numerical blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="clean-card p-6 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Bookings</span>
                  <h3 className="text-2xl font-black text-slate-800 font-heading">{bookings.length}</h3>
                  <span className="text-[10px] text-indigo-500 font-semibold uppercase">Active Clients</span>
                </div>
                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Calendar size={18} />
                </div>
              </div>

              <div className="clean-card p-6 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Revenue Paid</span>
                  <h3 className="text-2xl font-black text-emerald-600 font-heading">₹{grossPaid.toLocaleString()}</h3>
                  <span className="text-[10px] text-slate-400">Total Cleared Invoices</span>
                </div>
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <DollarSign size={18} />
                </div>
              </div>

              <div className="clean-card p-6 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Receivables</span>
                  <h3 className="text-2xl font-black text-amber-600 font-heading">₹{pendingReceivables.toLocaleString()}</h3>
                  <span className="text-[10px] text-slate-400">Awaiting Invoice Clears</span>
                </div>
                <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
                  <Clock size={18} />
                </div>
              </div>

              <div className="clean-card p-6 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roster Size</span>
                  <h3 className="text-2xl font-black text-slate-800 font-heading">{teamMembers.length}</h3>
                  <span className="text-[10px] text-slate-400">Active Crew Dispatch</span>
                </div>
                <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200">
                  <Users size={18} />
                </div>
              </div>

            </div>

            {/* Graphs / Visual telemetry charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-8 clean-card p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h4 className="font-heading text-sm font-black text-slate-800 uppercase tracking-wide">
                    Gross Monthly Revenue Ledger
                  </h4>
                  <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                    Total: ₹{totalValuation.toLocaleString()}
                  </span>
                </div>
                
                {chartData.length > 0 ? (
                  <div className="h-72 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#ffffff', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '8px',
                            color: '#1e293b'
                          }} 
                        />
                        <Bar dataKey="paid" name="Paid (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="pending" name="Pending (₹)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-slate-400 text-xs tracking-wider">
                    NO SUFFICIENT FINANCE LEDGER DATA TO RENDER GRAPH.
                  </div>
                )}
              </div>

              {/* Today's dispatched operations */}
              <div className="lg:col-span-4 clean-card p-6 rounded-2xl space-y-4">
                <h4 className="font-heading text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-4">
                  Today's Dispatches ({bookings.filter(b => b.date === todayStr && b.status === 'CONFIRMED').length})
                </h4>

                <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
                  {bookings.filter(b => b.date === todayStr && b.status === 'CONFIRMED').length > 0 ? (
                    bookings.filter(b => b.date === todayStr && b.status === 'CONFIRMED').map(b => (
                      <div key={b.id} className="p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl text-left space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[9px] text-slate-400 font-bold">{b.id}</span>
                          <span className="text-[8px] font-bold text-indigo-700 bg-indigo-100/50 px-1.5 py-0.25 rounded uppercase">
                            {b.assignedTo}
                          </span>
                        </div>
                        <h5 className="font-heading text-xs font-bold text-slate-800 truncate uppercase">{b.name}</h5>
                        <p className="text-[10px] text-slate-500 font-medium truncate">{b.service}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold tracking-wider">
                      NO ACTIVE DISPATCHES SCHEDULED FOR TODAY.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* B. MANAGE BOOKINGS TAB */}
        {adminTab === 'BOOKINGS' && (
          <div className="space-y-6">
            
            {/* Filter & search headers */}
            <div className="clean-card p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search client name, ID, service..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-600 cursor-pointer"
                >
                  <option value="ALL">Status: All Bookings</option>
                  <option value="PENDING DIRECTORS REVIEW">Pending Director Review</option>
                  <option value="CONFIRMED">Confirmed Shoots</option>
                  <option value="COMPLETED">Completed Productions</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <select
                  value={bookingFilterService}
                  onChange={(e) => setBookingFilterService(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-600 cursor-pointer"
                >
                  <option value="ALL">Service: All Services</option>
                  <option value="INFLUENCER BRANDING">Influencer Branding</option>
                  <option value="LUXURY AUTOMOTIVE">Luxury Automotive</option>
                  <option value="EDITORIAL FASHION">Editorial Fashion</option>
                  <option value="COMMERCIAL CAMPAIGNS">Commercial Campaigns</option>
                </select>
              </div>

              <div className="text-right text-xs font-bold text-slate-500 pr-2">
                Matching: {filteredBookings.length} bookings
              </div>
            </div>

            {/* List of bookings */}
            <div className="clean-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-heading text-[10px] tracking-wider uppercase border-b border-slate-800">
                      <th className="p-4">ID</th>
                      <th className="p-4">Client / Brand</th>
                      <th className="p-4">Service</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Assigned Partner</th>
                      <th className="p-4">Rate (₹)</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Operational Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-400">{b.id}</td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block uppercase">{b.name}</span>
                            <span className="text-[10px] text-slate-400 select-text">{b.email}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase font-bold text-slate-600">
                              {b.service}
                            </span>
                          </td>
                          <td className="p-4 font-mono">{b.date}</td>
                          <td className="p-4">
                            <select
                              value={b.assignedTo}
                              onChange={(e) => handleAssignCrew(b.id, e.target.value)}
                              className="border border-slate-200 rounded px-2 py-1 text-[11px] bg-white cursor-pointer focus:outline-none focus:border-indigo-600 font-medium"
                            >
                              <option value="UNASSIGNED">UNASSIGNED</option>
                              {teamMembers.map(t => {
                                const status = getCrewStatusForDate(t.name, b.date, b.id)
                                const badge = status === 'AVAILABLE' ? '🟢' : status === 'BUSY ON THIS DAY' ? '🟡' : '🔴'
                                return (
                                  <option key={t.name} value={t.name}>
                                    {badge} {t.name.toUpperCase()} ({status})
                                  </option>
                                )
                              })}
                            </select>
                          </td>
                          <td className="p-4 font-bold text-slate-800">₹{b.price.toLocaleString()}</td>
                          <td className="p-4">
                            <select
                              value={b.paymentStatus}
                              onChange={(e) => handleUpdatePaymentStatus(b.id, e.target.value)}
                              className={`border rounded px-2 py-1 text-[10px] font-bold cursor-pointer focus:outline-none ${
                                b.paymentStatus === 'PAID' 
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                                  : 'border-amber-200 bg-amber-50 text-amber-700'
                              }`}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PAID">PAID</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                              className={`border rounded px-2 py-1 text-[10px] font-bold cursor-pointer focus:outline-none ${
                                b.status === 'COMPLETED' 
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : b.status === 'CONFIRMED'
                                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                    : b.status === 'CANCELLED'
                                      ? 'border-red-200 bg-red-50 text-red-700'
                                      : 'border-slate-200 bg-slate-50 text-slate-600'
                              }`}
                            >
                              <option value="PENDING DIRECTORS REVIEW">PENDING DIRECTORS REVIEW</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded transition-all cursor-pointer hover:border-slate-400 font-bold"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400 font-bold tracking-wider">
                          NO ACTIVE BOOKINGS MATCH YOUR SEARCH CRITERIA.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* C. MONTHLY FINANCES TAB */}
        {adminTab === 'FINANCES' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Overview numerical headers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="clean-card p-6 rounded-2xl bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Operational Gross Earnings</span>
                <h3 className="text-3xl font-black text-emerald-600 font-heading">₹{grossPaid.toLocaleString()}</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total cleared invoicing records</p>
              </div>

              <div className="clean-card p-6 rounded-2xl bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pending Dispatch Receivables</span>
                <h3 className="text-3xl font-black text-amber-600 font-heading">₹{pendingReceivables.toLocaleString()}</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Outstanding invoices on shoots</p>
              </div>

              <div className="clean-card p-6 rounded-2xl bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Combined Operational Valuation</span>
                <h3 className="text-3xl font-black text-slate-900 font-heading">₹{totalValuation.toLocaleString()}</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Sum gross valuation of bookings</p>
              </div>
            </div>

            {/* Monthly breakdown groups */}
            <div className="space-y-6">
              <h3 className="font-heading text-sm font-black text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-3">
                Monthly Accounting Ledgers
              </h3>

              {chartData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {chartData.map((m: any) => {
                    const totalMonthVal = m.paid + m.pending
                    const ratioPaid = totalMonthVal > 0 ? Math.round((m.paid / totalMonthVal) * 100) : 0
                    
                    return (
                      <div key={m.name} className="clean-card p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h4 className="font-heading text-base font-black text-slate-900 uppercase">
                            {m.name}
                          </h4>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-heading">
                            {m.count} Shoots
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-heading">
                          <div className="bg-emerald-50/30 p-3 border border-emerald-100/50 rounded-xl">
                            <span className="text-[9px] text-emerald-700 block font-bold uppercase tracking-wider">Cleared PAID</span>
                            <span className="text-lg font-black text-emerald-600 font-heading">₹{m.paid.toLocaleString()}</span>
                          </div>
                          
                          <div className="bg-amber-50/30 p-3 border border-amber-100/50 rounded-xl">
                            <span className="text-[9px] text-amber-700 block font-bold uppercase tracking-wider">Awaiting PENDING</span>
                            <span className="text-lg font-black text-amber-600 font-heading">₹{m.pending.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <span>Cleared Ratio</span>
                            <span>{ratioPaid}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                            <div 
                              style={{ width: `${ratioPaid}%` }} 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                            />
                          </div>
                        </div>

                        <div className="pt-2 text-right">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                            Ledger Total: ₹{totalMonthVal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 rounded-2xl uppercase">
                  NO ACTIVE FINANCIAL LEDGER STATS SAVED.
                </div>
              )}
            </div>

          </div>
        )}

        {/* D. ACTIVE ROSTER TAB */}
        {adminTab === 'TEAM' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header controls */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h3 className="font-heading text-sm font-black text-slate-800 uppercase tracking-wider">
                Photographers & Cinematographers Roster ({teamMembers.length})
              </h3>
              <button
                onClick={() => setShowAddCrewModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black tracking-widest uppercase font-heading flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 cursor-pointer border-0"
              >
                <Plus size={14} />
                Enroll Partner
              </button>
            </div>

            {/* Roster database grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map(t => (
                <div key={t.name} className="clean-card p-6 rounded-2xl flex flex-col justify-between space-y-5 relative overflow-hidden">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`inline-block px-2.5 py-0.5 border text-[9px] font-bold tracking-widest uppercase rounded-full ${
                        t.availability === 'AVAILABLE' 
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                          : t.availability === 'ON SHOOT'
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 animate-pulse'
                            : 'border-slate-200 bg-slate-100 text-slate-400'
                      }`}>
                        {t.availability}
                      </span>
                      
                      <button
                        onClick={() => handleDeleteCrew(t.name)}
                        className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-0 p-1"
                        title="Remove member"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-heading text-base font-black text-slate-900 tracking-wide uppercase">
                        {t.name}
                      </h4>
                      <span className="text-[10px] text-indigo-600 tracking-widest uppercase font-bold block mt-0.5">
                        {t.role}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium border-t border-slate-100 pt-3 lowercase">
                      <span className="font-bold text-[9px] uppercase tracking-wider block text-slate-400 mb-0.5">Specialization</span>
                      {t.specialty}
                    </p>

                    <div className="border-t border-slate-100 pt-3">
                      <span className="font-bold text-[9px] uppercase tracking-wider block text-slate-400 mb-1">Booked Shoot Dates</span>
                      {bookings.filter(b => b.assignedTo.toLowerCase() === t.name.toLowerCase() && b.status === 'CONFIRMED').length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                          {bookings
                            .filter(b => b.assignedTo.toLowerCase() === t.name.toLowerCase() && b.status === 'CONFIRMED')
                            .map(b => (
                              <span 
                                key={b.id} 
                                className="inline-block text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-bold px-1.5 py-0.5 rounded cursor-help"
                                title={`${b.service} - ${b.name}`}
                              >
                                📅 {b.date}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic block">No shoots scheduled.</span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex gap-2">
                    <button
                      onClick={() => handleToggleCrewAvailabilityAdmin(t.name)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-heading font-black tracking-widest rounded-lg uppercase transition-all cursor-pointer border-0"
                    >
                      Cycle Status
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ENROLL MODAL */}
            {showAddCrewModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                <div className="absolute inset-0 cursor-default" onClick={() => setShowAddCrewModal(false)} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-100 z-10 animate-fade-in text-left">
                  
                  <button
                    onClick={() => setShowAddCrewModal(false)}
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full"
                  >
                    <X size={16} />
                  </button>

                  <h3 className="font-heading text-lg font-black text-slate-900 tracking-wide uppercase mb-6 border-b border-slate-100 pb-3">
                    Enroll Operational Partner
                  </h3>

                  <form onSubmit={handleAddCrew} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={newCrewName}
                        onChange={(e) => setNewCrewName(e.target.value)}
                        placeholder="e.g. MARCUS BELLINGHAM"
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all uppercase"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Organizational Role
                      </label>
                      <input
                        type="text"
                        value={newCrewRole}
                        onChange={(e) => setNewCrewRole(e.target.value)}
                        placeholder="e.g. Lead Cine Photographer"
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Specialty Tag Focus
                      </label>
                      <input
                        type="text"
                        value={newCrewSpecialty}
                        onChange={(e) => setNewCrewSpecialty(e.target.value)}
                        placeholder="e.g. High-speed tracking reels"
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-heading text-xs font-black tracking-widest uppercase hover:shadow-lg transition-all cursor-pointer mt-4 border-0"
                    >
                      Authorize Roster Enrollment
                    </button>
                  </form>

                </div>
              </div>
            )}

          </div>
        )}

        {/* E. APPLICATIONS TAB */}
        {adminTab === 'APPLICATIONS' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-heading text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-4">
              Pending Candidates & Applications ({applications.length})
            </h3>

            {applications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {applications.map(a => (
                  <div key={a.id} className="clean-card p-6 rounded-2xl space-y-4 text-left relative">
                    <button
                      onClick={() => handleDeleteApp(a.id)}
                      className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-0"
                      title="Delete Candidate"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-slate-400 font-bold">{a.id}</span>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 border border-indigo-100 rounded uppercase">
                          {a.jobTitle}
                        </span>
                      </div>
                      <h4 className="font-heading text-base font-black text-slate-900 uppercase">
                        {a.name}
                      </h4>
                      <span className="text-xs text-slate-400 select-text block">
                        Email: {a.email}
                      </span>
                    </div>

                    <p className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-xs text-slate-600 select-text font-medium italic">
                      "{a.message}"
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {a.portfolioUrl && (
                        <a
                          href={a.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 border border-slate-200 hover:border-slate-400 text-center font-heading text-[10px] font-black tracking-widest text-slate-700 uppercase transition-all rounded-lg flex items-center justify-center gap-1 bg-white no-underline"
                        >
                          <ExternalLink size={11} />
                          Portfolio
                        </a>
                      )}
                      
                      {a.resumeUrl && (
                        <a
                          href={a.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 border border-slate-200 hover:border-slate-400 text-center font-heading text-[10px] font-black tracking-widest text-slate-700 uppercase transition-all rounded-lg flex items-center justify-center gap-1 bg-white no-underline"
                        >
                          <FileText size={11} />
                          Resume / CV
                        </a>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                      <span className={`px-2.5 py-0.5 border text-[9px] font-bold tracking-widest uppercase rounded ${
                        a.status === 'PENDING REVIEW' 
                          ? 'border-amber-200 bg-amber-50 text-amber-700' 
                          : a.status === 'APPROVED' 
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                            : 'border-red-200 bg-red-50 text-red-700'
                      }`}>
                        {a.status}
                      </span>

                      <div className="flex gap-2">
                        {a.status === 'PENDING REVIEW' && (
                          <>
                            <button
                              onClick={() => handleUpdateAppStatus(a.id, 'APPROVED')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-heading text-[8px] font-bold tracking-widest rounded uppercase cursor-pointer transition-all border-0 shadow-sm shadow-emerald-600/10"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateAppStatus(a.id, 'REJECTED')}
                              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-heading text-[8px] font-bold tracking-widest rounded uppercase cursor-pointer transition-all border-0 shadow-sm shadow-red-600/10"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 rounded-2xl uppercase">
                NO JOB APPLICATIONS FILED YET.
              </div>
            )}
          </div>
        )}

        {/* WEBSITE CONTROLS TAB */}
        {adminTab === 'WEBSITE' && (
          <div className="space-y-8 text-left animate-fade-in">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Hiring Toggle & Pricing */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Hiring Opening Toggle */}
                <div className="clean-card p-6 rounded-2xl space-y-4">
                  <h3 className="font-heading text-xs font-black tracking-widest text-slate-800 uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Users size={14} className="text-indigo-600" />
                    Hiring Opening status
                  </h3>
                  
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Toggle active recruitment on the homepage. If toggled off, the career section will display a "No Current Hirings Available" alert page.
                  </p>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">HIRING STATE</span>
                      <span className={`block text-xs font-bold font-heading uppercase ${
                        careerHiring ? 'text-indigo-600' : 'text-slate-400'
                      }`}>
                        {careerHiring ? 'Recruitment Active' : 'Hiring Suspended'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleHiring(!careerHiring)}
                      className={`px-4 py-2 font-heading text-[10px] font-black tracking-widest rounded-lg uppercase cursor-pointer transition-all border-0 shadow-sm ${
                        careerHiring 
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/10' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10'
                      }`}
                    >
                      {careerHiring ? 'Disable Hiring' : 'Enable Hiring'}
                    </button>
                  </div>
                </div>

                {/* 2. Service Booking Pricing */}
                <div className="clean-card p-6 rounded-2xl space-y-4">
                  <h3 className="font-heading text-xs font-black tracking-widest text-slate-800 uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
                    <DollarSign size={14} className="text-indigo-600" />
                    Package pricing config
                  </h3>
                  
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Adjust the booking price rates displayed in the booking form drop-down and invoice details.
                  </p>

                  <div className="space-y-3 pt-2 font-medium">
                    {Object.keys(editingPrices).map((srv) => (
                      <div key={srv} className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 text-xs">
                        <span className="sm:col-span-8 font-bold text-slate-600 truncate uppercase">{srv}</span>
                        <div className="sm:col-span-4 flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <span className="pl-3 pr-1.5 text-slate-400 font-bold font-mono">₹</span>
                          <input
                            type="number"
                            value={editingPrices[srv] || 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0
                              setEditingPrices({ ...editingPrices, [srv]: val })
                            }}
                            className="w-full pr-3 py-1.5 border-0 focus:outline-none font-bold text-slate-800 font-mono text-xs"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={handleSavePrices}
                      className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white font-heading text-[10px] font-black tracking-widest rounded-lg uppercase cursor-pointer transition-all border-0 shadow-sm mt-3"
                    >
                      Save Prices Configuration
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Video Reels Management */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="clean-card p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-heading text-xs font-black tracking-widest text-slate-800 uppercase flex items-center gap-2">
                      <Play size={14} className="text-indigo-500" />
                      Homepage vertical reels ({reels.length})
                    </h3>
                    <button
                      onClick={handleOpenAddReel}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-heading text-[9px] font-black tracking-widest rounded-lg uppercase cursor-pointer transition-all border-0 flex items-center gap-1 shadow-sm"
                    >
                      <Plus size={12} />
                      Add Reel Link
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Manage the 9:16 vertical video reels displayed in the homepage grid. Video URLs must point directly to direct MP4 streams.
                  </p>

                  <div className="space-y-3 pt-2">
                    {reels.length > 0 ? (
                      reels.map(r => (
                        <div key={r.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="text-xs text-left space-y-1 font-medium max-w-md">
                            <span className="font-heading text-[9px] font-bold text-indigo-600 tracking-widest uppercase bg-indigo-50 border border-indigo-100 px-1.5 py-0.25 rounded">
                              REEL ID: {r.id}
                            </span>
                            <h4 className="font-bold text-slate-800 uppercase truncate">{r.title}</h4>
                            <p className="text-[10px] text-slate-400 font-mono truncate select-text">{r.videoUrl}</p>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                              Views: {r.views} • Likes: {r.likes}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEditReel(r)}
                              className="px-2.5 py-1.5 border border-slate-200 hover:border-slate-400 text-[9px] font-black uppercase text-slate-700 bg-white rounded cursor-pointer transition-all flex items-center gap-1 font-heading"
                            >
                              <Edit size={10} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReel(r.id)}
                              className="px-2.5 py-1.5 border border-red-200 hover:border-red-500 text-[9px] font-black uppercase text-red-600 bg-white rounded cursor-pointer transition-all flex items-center gap-1 font-heading hover:bg-red-50"
                            >
                              <Trash2 size={10} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-xl uppercase">
                        NO VERTICAL REELS DATABASE RECORDS SAVED.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* REEL FORM DIALOG MODAL */}
            {showReelModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                <div className="absolute inset-0 cursor-default" onClick={() => setShowReelModal(false)} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-100 z-10 animate-fade-in text-left">
                  
                  <button
                    onClick={() => setShowReelModal(false)}
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full"
                  >
                    <X size={16} />
                  </button>

                  <h3 className="font-heading text-lg font-black text-slate-900 tracking-wide uppercase mb-6 border-b border-slate-100 pb-3">
                    {reelEditId !== null ? 'Modify Video Reel Link' : 'Register Homepage Video Reel'}
                  </h3>

                  <form onSubmit={handleSaveReel} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Reel Title / Label
                      </label>
                      <input
                        type="text"
                        value={reelFormTitle}
                        onChange={(e) => setReelFormTitle(e.target.value)}
                        placeholder="e.g. Anamorphic Cinematic Drive"
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all uppercase"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Direct MP4 Video Stream URL
                      </label>
                      <input
                        type="url"
                        value={reelFormVideoUrl}
                        onChange={(e) => setReelFormVideoUrl(e.target.value)}
                        placeholder="https://assets.mixkit.co/.../stream.mp4"
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Views Stats
                        </label>
                        <input
                          type="text"
                          value={reelFormViews}
                          onChange={(e) => setReelFormViews(e.target.value)}
                          placeholder="e.g. 1.2M"
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Likes Stats
                        </label>
                        <input
                          type="text"
                          value={reelFormLikes}
                          onChange={(e) => setReelFormLikes(e.target.value)}
                          placeholder="e.g. 150K"
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-heading text-xs font-black tracking-widest uppercase hover:shadow-lg transition-all cursor-pointer mt-4 border-0"
                    >
                      {reelEditId !== null ? 'Update Live Reel Settings' : 'Publish Live Homepage Reel'}
                    </button>
                  </form>

                </div>
              </div>
            )}

          </div>
        )}

        {/* F. DATABASE TOOLS TAB */}
        {adminTab === 'SYSTEM' && (
          <div className="space-y-6 max-w-xl mx-auto text-left animate-fade-in">
            <div className="clean-card p-6 rounded-2xl space-y-6">
              <h3 className="font-heading text-base font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wide">
                Database Core Operations
              </h3>

              <div className="space-y-4 text-xs font-medium">
                
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wide">Clipboard Export / Migration</h4>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Copies the entire active database payload (bookings, team members, applications) as a JSON string to your clipboard.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-heading text-[10px] font-black tracking-widest rounded-lg uppercase cursor-pointer transition-all flex items-center gap-1.5 shadow-sm border-0"
                  >
                    <Download size={13} />
                    Copy Database Payload
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wide">Data Import Payload</h4>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Allows you to overwrite the current workspace database state. Paste a copied operational payload into the sync module.
                  </p>
                  <button
                    onClick={() => {
                      setImportText('')
                      setShowSyncModal(true)
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-heading text-[10px] font-black tracking-widest rounded-lg uppercase cursor-pointer transition-all flex items-center gap-1.5 shadow-sm border-0"
                  >
                    <Upload size={13} />
                    Open Sync Module
                  </button>
                </div>

                <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl space-y-2">
                  <h4 className="font-bold text-red-800 uppercase tracking-wide">Danger Zone: Database Reset</h4>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Clears all active database entries in local storage and seeds the initial default crew member list and booking logs.
                  </p>
                  <button
                    onClick={handleResetDefaults}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-heading text-[10px] font-black tracking-widest rounded-lg uppercase cursor-pointer transition-all flex items-center gap-1.5 shadow-sm border-0"
                  >
                    <Trash2 size={13} />
                    Reset to Default Seed Data
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* Detail Overlay modal for single booking details (Admin View) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="absolute inset-0 cursor-default" onClick={() => setSelectedBooking(null)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 border border-slate-100 z-10 animate-fade-in text-left">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full"
            >
              <X size={16} />
            </button>

            <div className="mb-6 border-b border-slate-100 pb-4">
              <span className="font-heading text-[10px] font-black tracking-widest text-indigo-600 uppercase block mb-1">
                Booking Dispatch Metadata
              </span>
              <h3 className="font-heading text-lg font-black text-slate-900 tracking-wide uppercase">
                {selectedBooking.id} / {selectedBooking.name}
              </h3>
            </div>

            <div className="space-y-4 font-sans text-xs text-slate-600">
              
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">SERVICE TYPE</span>
                  <span className="font-heading text-xs font-black text-slate-800 uppercase">{selectedBooking.service}</span>
                </div>
                <div>
                  <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">TARGET DATE</span>
                  <span className="font-mono text-xs font-bold text-slate-800">{selectedBooking.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">CLIENT CONTACT</span>
                  <div className="space-y-1">
                    <span className="text-slate-800 font-medium select-text block">{selectedBooking.email}</span>
                    {selectedBooking.phoneNumber && (
                      <span className="text-slate-800 font-mono font-bold select-text block">
                        {selectedBooking.phoneCode || '+91'} {selectedBooking.phoneNumber}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">PREFERRED CALL TIME</span>
                  <span className="text-slate-800 font-medium block">{selectedBooking.preferredTime || 'Anytime'}</span>
                </div>
              </div>

              {selectedBooking.locationState && (
                <div className="border-b border-slate-100 pb-4">
                  <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-2">SHOOT LOCATION DETAILED</span>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 border border-slate-100 rounded-xl">
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Venue / Landmark</span>
                      <span className="text-slate-800 font-semibold text-[11px] block">{selectedBooking.locationVenue}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Area / Pincode</span>
                      <span className="text-slate-800 font-semibold text-[11px] block">{selectedBooking.locationArea} {selectedBooking.pincode && `- ${selectedBooking.pincode}`}</span>
                    </div>
                    <div className="col-span-2 border-t border-slate-200/60 pt-2 mt-1">
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">District & State</span>
                      <span className="text-slate-800 font-semibold text-[11px] block">{selectedBooking.locationDistrict}, {selectedBooking.locationState}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">ASSIGNED DISPATCH</span>
                  <span className="text-xs text-slate-800 font-heading font-black uppercase block mt-1">{selectedBooking.assignedTo}</span>
                </div>
                <div>
                  <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">COMBINED BUDGET</span>
                  <span className="text-xs font-bold text-slate-800 font-mono block mt-1">₹{selectedBooking.price.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-1">PAYMENT STATUS</span>
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full inline-block border mt-0.5 ${
                    selectedBooking.paymentStatus === 'PAID' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-[9px] text-slate-400 tracking-widest block mb-2">TELEMETRY & INSTRUCTIONS</span>
                <p className="bg-slate-50 p-4 border border-slate-100 rounded-xl font-mono text-[11px] leading-relaxed select-text whitespace-pre-line text-slate-600">
                  {selectedBooking.message}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-heading text-[10px] font-black tracking-widest uppercase transition-colors cursor-pointer bg-white rounded-lg"
                >
                  Dismiss Overlay
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SYNCHRONIZER DATA MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="absolute inset-0 cursor-default" onClick={() => setShowSyncModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-slate-100 z-10 animate-fade-in text-left">
            <button
              onClick={() => setShowSyncModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full"
            >
              <X size={16} />
            </button>

            <h3 className="font-heading text-lg font-black text-slate-900 tracking-wide uppercase mb-2 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Database size={18} className="text-indigo-600" />
              Over-the-Air Database Sync
            </h3>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
              Paste the JSON payload exported from the main client website (or another portal port instance) below to sync the databases.
            </p>

            <div className="space-y-4">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='Paste database payload JSON here... e.g. { "bookings": [...], "teamMembers": [...] }'
                className="w-full h-48 border border-slate-200 rounded-xl p-4 font-mono text-[10px] bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleImportData}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-heading text-[10px] font-black tracking-widest uppercase transition-all rounded-lg shadow-sm cursor-pointer border-0"
                >
                  Synchronize Storage Database
                </button>
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-heading text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer bg-white rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Micro-footer */}
      <footer className="py-8 bg-slate-900 border-t border-slate-800 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-auto">
        © {new Date().getFullYear()} MR. CINEMATICSHOOT. ADMINISTRATIVE ENGINE.
      </footer>
      <Toaster position="top-right" richColors />
    </div>
  )
}
