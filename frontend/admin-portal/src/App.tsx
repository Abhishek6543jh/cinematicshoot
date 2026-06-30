import React, { useState, useEffect } from 'react'
import { 
  Lock, LogOut, Calendar, DollarSign, Users, 
  Clock, ExternalLink, Search, 
  Check, Activity, FileText, Trash2,
  Database, Upload, Download, X, Plus, Globe, Edit,
  MessageCircle, Phone, RefreshCw, ChevronDown, Eye, TrendingUp
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { createClient } from '@supabase/supabase-js'

// Initialize client-side Supabase client using anon key
const supabaseUrl = 'https://ahvhbuincvxhewxdkekr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodmhidWluY3Z4aGV3eGRrZWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzA3NTksImV4cCI6MjA5NjMwNjc1OX0.FivI4jEYzjg0XRgIfAJ1udeEsoxWsTNSev7cUJ8fgLM'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to generate UUIDs
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
  id?: string
  email?: string
  name: string
  role: string
  specialty: string
  activeShoots: number
  availability: 'AVAILABLE' | 'ON SHOOT' | 'LEAVE'
  share?: number
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
  const [crewSelect, setCrewSelect] = useState('') // stores crew email
  const [crewPasscode, setCrewPasscode] = useState('')
  
  // Dashboard state tabs
  const [adminTab, setAdminTab] = useState<'OVERVIEW' | 'BOOKINGS' | 'FINANCES' | 'TEAM' | 'APPLICATIONS' | 'WEBSITE' | 'SYSTEM'>('OVERVIEW')
  
  // Local Database States
  const [bookings, setBookings] = useState<Booking[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [careerHiring, setCareerHiring] = useState(true)
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({})
  const [reels, setReels] = useState<ReelItem[]>([])
  const [payments, setPayments] = useState<{ id: string; bookingId: string; amount: number; method: string; status: string; transactionId: string; paidAt: string; createdAt: string }[]>([])
  
  // website config forms
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({})
  
  // Reels modal state
  const [showReelModal, setShowReelModal] = useState(false)
  const [reelEditId, setReelEditId] = useState<number | null>(null)
  const [newReelTitle, setNewReelTitle] = useState('')
  const [newReelUrl, setNewReelUrl] = useState('')
  
  // Add Crew modal state
  const [showAddCrewModal, setShowAddCrewModal] = useState(false)
  const [newCrewName, setNewCrewName] = useState('')
  const [newCrewEmail, setNewCrewEmail] = useState('')
  const [newCrewPassword, setNewCrewPassword] = useState('')
  const [newCrewRole, setNewCrewRole] = useState('')
  const [newCrewSpecialty, setNewCrewSpecialty] = useState('')
  const [newCrewRate, setNewCrewRate] = useState('70')

  // Hire Creator modal state
  const [showHireModal, setShowHireModal] = useState(false)
  const [hireAppId, setHireAppId] = useState('')
  const [hireName, setHireName] = useState('')
  const [hireEmail, setHireEmail] = useState('')
  const [hirePassword, setHirePassword] = useState('')
  const [hireSpecialty, setHireSpecialty] = useState('')
  const [hireHourlyRate, setHireHourlyRate] = useState('70')
  
  // Selected Booking modal state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  
  // Filters state
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingFilterStatus, setBookingFilterStatus] = useState('ALL')
  const [bookingFilterService, setBookingFilterService] = useState('ALL')
  const [bookingFilterCrew, setBookingFilterCrew] = useState('ALL')

  // Edit Crew modal state
  const [showEditCrewModal, setShowEditCrewModal] = useState(false)
  const [editCrewId, setEditCrewId] = useState('')
  const [editCrewName, setEditCrewName] = useState('')
  const [editCrewEmail, setEditCrewEmail] = useState('')
  const [editCrewPassword, setEditCrewPassword] = useState('')
  const [editCrewRole, setEditCrewRole] = useState('')
  const [editCrewSpecialty, setEditCrewSpecialty] = useState('')
  const [editCrewRate, setEditCrewRate] = useState('70')
  const [editCrewAvailability, setEditCrewAvailability] = useState<'AVAILABLE' | 'ON SHOOT' | 'LEAVE'>('AVAILABLE')
  
  // Database sync modal
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [importText, setImportText] = useState('')

  // Load database from Supabase
  const loadDatabase = async () => {
    try {
      // 1. Fetch bookings (join with creator)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, creator:users!bookings_assigned_creator_id_fkey(name)')
        .order('created_at', { ascending: false })
      if (bookingsError) throw bookingsError
      
      if (bookingsData) {
        const mappedBookings = bookingsData.map((b: any) => {
          return {
            id: b.id,
            name: b.client_name,
            email: b.client_email,
            service: b.service,
            date: b.date,
            message: b.special_requirements || '',
            status: b.status,
            assignedTo: b.creator?.name || 'UNASSIGNED',
            price: Number(b.price || 6000),
            paymentStatus: b.payment_status,
            createdAt: b.created_at,
            locationState: b.location_state || '',
            locationDistrict: b.location_district || '',
            locationArea: b.location_area || '',
            locationVenue: b.location_venue || '',
            phoneCode: b.phone_code || '+91',
            phoneNumber: b.client_phone || '',
            preferredTime: b.preferred_time || '',
            pincode: b.pincode || ''
          }
        })
        setBookings(mappedBookings)
      }

      // 2. Fetch team members (creators)
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('users')
        .select('*, profiles(*)')
        .eq('role', 'CREATOR')
      
      if (creatorsError) throw creatorsError
      
      if (creatorsData) {
        const mappedCreators = await Promise.all(creatorsData.map(async (c: any) => {
          const profile = c.profiles || {}
          // Count active shoots
          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_creator_id', c.id)
            .in('status', ['Confirmed', 'In Progress'])
          
          return {
            id: c.id,
            email: c.email,
            name: c.name,
            role: profile.specialty || 'Visual Creator',
            specialty: profile.specialty || 'Visual Creator',
            activeShoots: count || 0,
            availability: profile.availability || 'AVAILABLE',
            share: Number(profile.hourly_rate || 40)
          }
        }))
        setTeamMembers(mappedCreators)
      }

      // 3. Fetch applications
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (appsError) throw appsError
      
      if (appsData) {
        setApplications(appsData.map((a: any) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          portfolioUrl: a.portfolio_url || '',
          resumeUrl: a.resume_url || '',
          message: a.cover_letter || '',
          jobTitle: a.job_title,
          status: a.status,
          createdAt: a.created_at
        })))
      }

      // 4. Fetch website settings
      const { data: hiringSetting } = await supabase
        .from('website_settings')
        .select('value')
        .eq('key', 'career_hiring')
        .maybeSingle()
      if (hiringSetting) {
        setCareerHiring(hiringSetting.value === true)
      }

      const { data: pricesData } = await supabase
        .from('packages')
        .select('name, price')
      if (pricesData) {
        const prices: Record<string, number> = {}
        pricesData.forEach((p: any) => {
          prices[p.name] = Number(p.price)
        })
        setServicePrices(prices)
        setEditingPrices(prices)
      }

      // 5. Fetch reels
      const { data: reelsData } = await supabase
        .from('reels')
        .select('*')
        .order('id', { ascending: true })
      if (reelsData) {
        setReels(reelsData)
      }

      // 6. Fetch payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
      if (paymentsData) {
        setPayments(paymentsData.map((p: any) => ({
          id: p.id,
          bookingId: p.booking_id,
          amount: Number(p.amount),
          method: p.payment_method || 'N/A',
          status: p.payment_status || 'Pending',
          transactionId: p.transaction_id || '',
          paidAt: p.paid_at || '',
          createdAt: p.created_at
        })))
      }
    } catch (err: any) {
      console.error('Database load error:', err)
      toast.error('FAILED TO CONNECT TO SUPABASE DATABASE.')
    }
  }

  // Load Session and DB records on Mount
  useEffect(() => {
    const savedRole = sessionStorage.getItem('mcs_ops_role')
    const savedCrew = sessionStorage.getItem('mcs_ops_crew_name')
    if (savedRole === 'ADMIN') {
      setAuthRole('ADMIN')
    } else if (savedRole === 'CREW' && savedCrew) {
      setAuthRole('CREW')
      setActiveCrewName(savedCrew)
    }

    loadDatabase()
  }, [])

  // Handle Authentication Logins
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', adminEmail.trim().toLowerCase())
        .eq('password', adminPasscode)
        .eq('role', 'ADMIN')
        .maybeSingle()
      
      if (error || !data) {
        toast.error('Sign In Failed: Invalid administrator credentials.')
        return
      }

      setAuthRole('ADMIN')
      sessionStorage.setItem('mcs_ops_role', 'ADMIN')
      await loadDatabase()
      toast.success('Administrator session established successfully.')
    } catch (err) {
      toast.error('Authentication process encountered an error.')
    }
  }

  const handleCrewLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!crewSelect) {
      toast.error('Access Denied: Please enter your partner email.')
      return
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', crewSelect.trim().toLowerCase())
        .eq('password', crewPasscode)
        .eq('role', 'CREATOR')
        .maybeSingle()
      
      if (error || !data) {
        toast.error('Access Denied: Invalid security credentials.')
        return
      }

      setAuthRole('CREW')
      setActiveCrewName(data.name)
      sessionStorage.setItem('mcs_ops_role', 'CREW')
      sessionStorage.setItem('mcs_ops_crew_name', data.name)
      await loadDatabase()
      toast.success(`Welcome back, ${data.name}. Portal dispatch loaded.`)
    } catch (err) {
      toast.error('Error connecting to authentication servers.')
    }
  }

  const handleLogout = () => {
    setAuthRole('NONE')
    setActiveCrewName('')
    sessionStorage.removeItem('mcs_ops_role')
    sessionStorage.removeItem('mcs_ops_crew_name')
    toast.success('Session terminated. Secure vault locked.')
  }

  // Admin roster operations
  const handleAddCrew = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCrewName || !newCrewRole || !newCrewEmail || !newCrewPassword) {
      toast.error('Please enter name, email, password, and role.')
      return
    }

    try {
      const creatorId = uuidv4()
      // Insert user
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: creatorId,
          email: newCrewEmail.toLowerCase(),
          name: newCrewName,
          role: 'CREATOR',
          password: newCrewPassword
        })
      if (userError) throw userError

      // Insert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: creatorId,
          specialty: newCrewSpecialty || newCrewRole,
          availability: 'AVAILABLE',
          hourly_rate: Number(newCrewRate)
        })
      if (profileError) throw profileError

      toast.success(`${newCrewName} added to the operational team.`)
      
      // Reset modal
      setNewCrewName('')
      setNewCrewEmail('')
      setNewCrewPassword('')
      setNewCrewRole('')
      setNewCrewSpecialty('')
      setNewCrewRate('70')
      setShowAddCrewModal(false)
      loadDatabase()
    } catch (err: any) {
      toast.error(`Crew enrollment failed: ${err.message}`)
    }
  }

  const handleDeleteCrew = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the active roster?`)) return
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success(`${name} removed from roster.`)
      loadDatabase()
    } catch (err: any) {
      toast.error(`Roster removal failed: ${err.message}`)
    }
  }

  const handleEditCrew = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCrewId || !editCrewName || !editCrewRole || !editCrewEmail) {
      toast.error('Please enter name, email, and role.')
      return
    }
    try {
      const userUpdate: any = {
        name: editCrewName,
        email: editCrewEmail.toLowerCase()
      }
      if (editCrewPassword.trim()) {
        userUpdate.password = editCrewPassword.trim()
      }

      const { error: userError } = await supabase
        .from('users')
        .update(userUpdate)
        .eq('id', editCrewId)
      if (userError) throw userError

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          specialty: editCrewSpecialty || editCrewRole,
          availability: editCrewAvailability,
          hourly_rate: Number(editCrewRate)
        })
        .eq('user_id', editCrewId)
      if (profileError) throw profileError

      toast.success(`${editCrewName} updated successfully.`)
      setShowEditCrewModal(false)
      loadDatabase()
    } catch (err: any) {
      toast.error(`Update failed: ${err.message}`)
    }
  }

  const handleToggleCrewAvailabilityAdmin = async (creatorId: string, currentAvailability: string) => {
    const nextAvail: Record<string, 'AVAILABLE' | 'ON SHOOT' | 'LEAVE'> = {
      'AVAILABLE': 'ON SHOOT',
      'ON SHOOT': 'LEAVE',
      'LEAVE': 'AVAILABLE'
    }
    const next = nextAvail[currentAvailability] || 'AVAILABLE'
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ availability: next })
        .eq('user_id', creatorId)
      if (error) throw error
      loadDatabase()
    } catch (err: any) {
      toast.error(`Availability update failed: ${err.message}`)
    }
  }

  const handleToggleMyAvailability = async () => {
    // Find creator ID from active crew name
    const member = teamMembers.find(t => t.name === activeCrewName)
    if (!member || !member.id) return
    const nextAvail: Record<string, 'AVAILABLE' | 'ON SHOOT' | 'LEAVE'> = {
      'AVAILABLE': 'ON SHOOT',
      'ON SHOOT': 'LEAVE',
      'LEAVE': 'AVAILABLE'
    }
    const next = nextAvail[member.availability] || 'AVAILABLE'
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ availability: next })
        .eq('user_id', member.id)
      if (error) throw error
      toast.success(`Availability status updated to ${next}.`)
      loadDatabase()
    } catch (err: any) {
      toast.error('Failed to update availability status.')
    }
  }

  // Booking operations
  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
      if (error) throw error
      toast.success(`Booking ${id} status updated to ${status}.`)
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status })
      }
      loadDatabase()
    } catch (err: any) {
      toast.error('Failed to update booking status.')
    }
  }

  const handleUpdatePaymentStatus = async (id: string, paymentStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: paymentStatus })
        .eq('id', id)
      if (error) throw error
      toast.success(`Booking ${id} payment set to ${paymentStatus}.`)
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, paymentStatus })
      }
      loadDatabase()
    } catch (err: any) {
      toast.error('Failed to update payment status.')
    }
  }

  const handleAssignCrew = async (id: string, crewName: string) => {
    try {
      let assigned_creator_id: string | null = null
      if (crewName !== 'UNASSIGNED') {
        const { data: creator } = await supabase
          .from('users')
          .select('id')
          .eq('name', crewName)
          .eq('role', 'CREATOR')
          .maybeSingle()
        assigned_creator_id = creator?.id || null
      }

      const { error } = await supabase
        .from('bookings')
        .update({ 
          assigned_creator_id,
          status: crewName === 'UNASSIGNED' ? 'Pending' : 'Confirmed'
        })
        .eq('id', id)
      
      if (error) throw error
      toast.success(`Assigned ${crewName === 'UNASSIGNED' ? 'none' : crewName} to booking ${id}.`)
      loadDatabase()
    } catch (err: any) {
      toast.error('Failed to assign creator to booking.')
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
      b.status === 'Confirmed'
    )
    return isBusy ? 'BUSY ON THIS DAY' : 'AVAILABLE'
  }

  // Candidates / Application management
  const handleUpdateAppStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id)
      if (error) throw error
      toast.success(`Application status updated to ${status}.`)
      loadDatabase()
    } catch (err: any) {
      toast.error('Failed to update application status.')
    }
  }

  const handleTriggerHireModal = (appId: string) => {
    const app = applications.find(a => a.id === appId)
    if (!app) return
    setHireAppId(appId)
    setHireName(app.name)
    setHireEmail(app.email)
    setHireSpecialty(app.jobTitle)
    setHirePassword('crew2026') // default passcode
    setHireHourlyRate('70')
    setShowHireModal(true)
  }

  const handleConfirmHire = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hirePassword || hirePassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    try {
      const creatorId = uuidv4()
      // 1. Insert user
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: creatorId,
          email: hireEmail.toLowerCase(),
          name: hireName,
          role: 'CREATOR',
          password: hirePassword
        })
      if (userError) throw userError

      // 2. Insert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: creatorId,
          specialty: hireSpecialty,
          availability: 'AVAILABLE',
          hourly_rate: Number(hireHourlyRate)
        })
      if (profileError) throw profileError

      // 3. Update application status
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: 'APPROVED' })
        .eq('id', hireAppId)
      if (appError) throw appError

      toast.success(`Hired ${hireName} successfully! Creator credentials setup.`)
      setShowHireModal(false)
      loadDatabase()
    } catch (err: any) {
      toast.error(`Hiring confirmation failed: ${err.message}`)
    }
  }

  const handleDeleteApp = async (id: string) => {
    if (!window.confirm('Delete this application permanently?')) return
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Application deleted.')
      loadDatabase()
    } catch (err: any) {
      toast.error('Failed to delete application.')
    }
  }

  const handleToggleHiring = async () => {
    const nextVal = !careerHiring
    try {
      const { error } = await supabase
        .from('website_settings')
        .upsert({ key: 'career_hiring', value: nextVal })
      if (error) throw error
      setCareerHiring(nextVal)
      toast.success(`Hiring portal set to ${nextVal ? 'ACTIVE' : 'INACTIVE'}.`)
    } catch (err: any) {
      toast.error('Failed to toggle hiring status.')
    }
  }

  const handleSavePrices = async () => {
    try {
      const updatePromises = Object.entries(editingPrices).map(([name, price]) => {
        return supabase
          .from('packages')
          .update({ price: Number(price) })
          .eq('name', name)
      })
      await Promise.all(updatePromises)
      toast.success('Service package pricing synchronized.')
      loadDatabase()
    } catch (err: any) {
      toast.error('Failed to save service prices.')
    }
  }

  const handleSaveReel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReelTitle || !newReelUrl) {
      toast.error('Title and Video URL are required.')
      return
    }

    try {
      if (reelEditId !== null) {
        // Edit
        const { error } = await supabase
          .from('reels')
          .update({ title: newReelTitle, video_url: newReelUrl })
          .eq('id', reelEditId)
        if (error) throw error
        toast.success('Reel updated successfully.')
      } else {
        // New
        const { error } = await supabase
          .from('reels')
          .insert({ title: newReelTitle, video_url: newReelUrl })
        if (error) throw error
        toast.success('Reel added to website controls.')
      }

      setNewReelTitle('')
      setNewReelUrl('')
      setReelEditId(null)
      setShowReelModal(false)
      loadDatabase()
    } catch (err: any) {
      toast.error('Failed to save reel.')
    }
  }

  const handleDeleteReel = async (id: number) => {
    if (!window.confirm('Delete this showcase reel?')) return
    try {
      const { error } = await supabase
        .from('reels')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Reel deleted.')
      loadDatabase()
    } catch (err: any) {
      toast.error('Failed to delete reel.')
    }
  }

  // System Backup / Export JSON
  const handleExportData = () => {
    const dataObj = {
      bookings,
      teamMembers,
      applications,
      careerHiring,
      servicePrices,
      reels
    }
    navigator.clipboard.writeText(JSON.stringify(dataObj, null, 2))
    toast.success('Database export copied to clipboard.')
  }

  const handleImportData = async () => {
    try {
      const parsed = JSON.parse(importText)
      // Import packages prices
      if (parsed.servicePrices) {
        const updatePromises = Object.entries(parsed.servicePrices).map(([name, price]) => {
          return supabase
            .from('packages')
            .update({ price: Number(price) })
            .eq('name', name)
        })
        await Promise.all(updatePromises)
      }
      
      toast.success('Database synchronized successfully from sync text.')
      setShowSyncModal(false)
      setImportText('')
      loadDatabase()
    } catch (e) {
      toast.error('Sync failed: Invalid JSON structure.')
    }
  }

  const handleResetDefaults = async () => {
    if (!window.confirm('Factory reset central database? This deletes all current bookings.')) return
    try {
      // Clear bookings
      const { error: clearBookings } = await supabase.from('bookings').delete().neq('id', 'MOCK')
      if (clearBookings) throw clearBookings
      toast.success('Operational database re-initialized successfully.')
      loadDatabase()
    } catch (err: any) {
      toast.error('Failed to reset defaults.')
    }
  }

  // Computed metrics
  const grossPaid = bookings.filter(b => b.paymentStatus === 'PAID' || b.paymentStatus === 'Success').reduce((sum, b) => sum + b.price, 0)
  const pendingReceivables = bookings.filter(b => b.paymentStatus === 'PENDING' || b.paymentStatus === 'Pending').reduce((sum, b) => sum + b.price, 0)
  const totalValuation = grossPaid + pendingReceivables

  // Calculate Studio (30% default) vs Crew (70% default) Share details
  let totalCrewPaid = 0
  let totalStudioPaid = 0
  let totalCrewPending = 0
  let totalStudioPending = 0

  bookings.forEach(b => {
    const isPaid = b.paymentStatus === 'PAID' || b.paymentStatus === 'Success'
    const assignedCrew = teamMembers.find(t => t.name === b.assignedTo)
    const rawShare = assignedCrew?.share ?? 70
    const crewSharePct = rawShare > 100 ? 70 : rawShare
    
    if (b.assignedTo === 'UNASSIGNED') {
      if (isPaid) {
        totalStudioPaid += b.price
      } else {
        totalStudioPending += b.price
      }
    } else {
      const crewPart = b.price * (crewSharePct / 100)
      const studioPart = b.price * ((100 - crewSharePct) / 100)
      if (isPaid) {
        totalCrewPaid += crewPart
        totalStudioPaid += studioPart
      } else {
        totalCrewPending += crewPart
        totalStudioPending += studioPart
      }
    }
  })

  const chartData = (() => {
    const monthly: Record<string, { paid: number; pending: number; count: number }> = {}
    bookings.forEach(b => {
      const date = new Date(b.date)
      if (isNaN(date.getTime())) return
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' })
      if (!monthly[monthKey]) {
        monthly[monthKey] = { paid: 0, pending: 0, count: 0 }
      }
      if (b.paymentStatus === 'PAID' || b.paymentStatus === 'Success') {
        monthly[monthKey].paid += b.price
      } else {
        monthly[monthKey].pending += b.price
      }
      monthly[monthKey].count++
    })
    return Object.entries(monthly).map(([month, data]) => ({
      month,
      Paid: data.paid,
      Pending: data.pending,
      bookings: data.count
    })).reverse()
  })()

  // Filters mapping
  const filteredBookings = bookings.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(bookingSearch.toLowerCase()) || b.id.toLowerCase().includes(bookingSearch.toLowerCase())
    const matchStatus = bookingFilterStatus === 'ALL' || b.status === bookingFilterStatus
    const matchService = bookingFilterService === 'ALL' || b.service === bookingFilterService
    const matchCrew = bookingFilterCrew === 'ALL'
      ? true
      : bookingFilterCrew === 'UNASSIGNED'
        ? b.assignedTo === 'UNASSIGNED'
        : b.assignedTo.toLowerCase() === bookingFilterCrew.toLowerCase()
    return matchSearch && matchStatus && matchService && matchCrew
  })

  // Partner specific dispatches
  const myBookings = bookings.filter(b => b.assignedTo.toLowerCase() === activeCrewName.toLowerCase())
  const todayStr = new Date().toISOString().split('T')[0]
  const activeCrewMember = teamMembers.find(t => t.name.toLowerCase() === activeCrewName.toLowerCase())
  const activeSharePct = (activeCrewMember?.share ?? 40) / 100
  const myEarnings = myBookings.filter(b => b.paymentStatus === 'PAID' || b.paymentStatus === 'Success').reduce((sum, b) => sum + (b.price * activeSharePct), 0)

  return (
    <div className="min-h-screen flex flex-col font-sans select-none antialiased">
      <Toaster theme="dark" position="bottom-center" />

      {/* LOGIN VIEW */}
      {authRole === 'NONE' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden select-none">
          {/* Animated Background Gradients */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-950/20 rounded-full blur-[128px] animate-pulse duration-10000" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-950/20 rounded-full blur-[128px] animate-pulse duration-7000" />

          <div className="w-full max-w-[400px] space-y-8 relative z-10 animate-reveal-up">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-xl font-black tracking-[0.25em] text-white uppercase flex items-center justify-center gap-2">
                <span>MR. CINEMATICSHOOT</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                Operations Hub & Partner Portal
              </p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex border-b border-slate-800 p-0.5 bg-slate-950/40 rounded-lg">
                <button
                  onClick={() => setLoginTab('ADMIN')}
                  className={`flex-1 py-2 rounded-md font-heading text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                    loginTab === 'ADMIN' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Administrator Access
                </button>
                <button
                  onClick={() => setLoginTab('CREW')}
                  className={`flex-1 py-2 rounded-md font-heading text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                    loginTab === 'CREW' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Partner / Crew Gateway
                </button>
              </div>

              {loginTab === 'ADMIN' ? (
                // ADMIN FORM
                <form onSubmit={handleAdminLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@mrcinematic.com"
                      className="w-full text-sm border border-slate-800 rounded-lg px-4 py-3 bg-slate-950/30 text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Secret Passcode
                    </label>
                    <input
                      type="password"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-sm border border-slate-800 rounded-lg px-4 py-3 bg-slate-950/30 text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-lg font-heading text-xs font-black tracking-widest uppercase hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-2 border-0"
                  >
                    <Lock size={12} />
                    Authorize Admin Session
                  </button>
                </form>
              ) : (
                // PARTNER FORM (Updated to email + password)
                <form onSubmit={handleCrewLogin} className="space-y-5 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Partner Email
                    </label>
                    <input
                      type="email"
                      value={crewSelect}
                      onChange={(e) => setCrewSelect(e.target.value)}
                      placeholder="partner@mrcinematic.com"
                      className="w-full text-sm border border-slate-800 rounded-lg px-4 py-3 bg-slate-950/30 text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                      required
                    />
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
                      className="w-full text-sm border border-slate-800 rounded-lg px-4 py-3 bg-slate-950/30 text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-slate-800 text-white hover:bg-slate-700 rounded-lg font-heading text-xs font-black tracking-widest uppercase hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-2 border-0"
                  >
                    <Lock size={12} />
                    Decrypt Partner Portal
                  </button>
                </form>
              )}
            </div>

            <div className="text-center text-[9px] font-mono text-slate-600 uppercase tracking-wider">
              Authorization Protocol v3.0.0 — Unified Supabase persistence
            </div>
          </div>
        </div>
      )}

      {/* PARTNER / CREW PORTAL VIEW */}
      {authRole === 'CREW' && (
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
          <header className="border-b border-slate-900 bg-slate-900/20 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <h2 className="font-heading text-sm font-black tracking-[0.2em] text-white uppercase">
                PARTNER PORTAL
              </h2>
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-bold rounded-full tracking-wider uppercase">
                Verified Crew
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {activeCrewName}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors bg-transparent border-0 cursor-pointer"
                title="Lock Portal"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: IDENTITY CARD */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-900">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-heading text-lg font-black text-white">
                    {activeCrewName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-white uppercase">{activeCrewName}</h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {teamMembers.find(t => t.name === activeCrewName)?.role || 'Cinematography Team'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Duty Status</span>
                    <button
                      onClick={handleToggleMyAvailability}
                      className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase cursor-pointer border-0 ${
                        teamMembers.find(t => t.name === activeCrewName)?.availability === 'AVAILABLE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : teamMembers.find(t => t.name === activeCrewName)?.availability === 'ON SHOOT'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {teamMembers.find(t => t.name === activeCrewName)?.availability || 'AVAILABLE'}
                    </button>
                  </div>

                  <div className="border-t border-slate-900 pt-4 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Financial Telemetry ({activeSharePct * 100}% Share)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950/40 p-3 border border-slate-900 rounded-xl text-center">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Paid Earnings</span>
                        <span className="font-heading text-sm font-black text-white">₹{myEarnings.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-950/40 p-3 border border-slate-900 rounded-xl text-center">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Invoices</span>
                        <span className="font-heading text-sm font-black text-slate-400">₹{(myBookings.filter(b => b.paymentStatus !== 'PAID' && b.paymentStatus !== 'Success').reduce((sum, b) => sum + b.price, 0) * activeSharePct).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: DISPATCH SCHEDULE */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6">
                <h3 className="font-heading text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                  <Activity size={14} className="text-indigo-400" />
                  Active Dispatch Orders
                </h3>

                <div className="space-y-4">
                  {myBookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 font-bold border border-dashed border-slate-900 rounded-xl uppercase">
                      No active production dispatches assigned to you.
                    </div>
                  ) : (
                    myBookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').map(b => (
                      <div key={b.id} className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-800 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-indigo-400 font-bold">{b.id}</span>
                            <span className="px-2 py-0.5 bg-slate-900 text-[8px] font-bold tracking-widest uppercase rounded text-slate-400 border border-slate-800">
                              {b.service}
                            </span>
                          </div>
                          <h4 className="font-heading text-sm font-bold text-white uppercase">{b.name}</h4>
                          <p className="text-xs text-slate-400 font-medium">Date: {b.date} | Preferred Time: {b.preferredTime || 'Anytime'}</p>
                          <p className="text-[11px] text-slate-500">{b.locationVenue}, {b.locationDistrict}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-heading text-[9px] font-black tracking-widest rounded uppercase cursor-pointer transition-all border-0"
                          >
                            Dispatch Details
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'Completed')}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-heading text-[9px] font-black tracking-widest rounded uppercase cursor-pointer transition-all border-0 shadow-md shadow-indigo-600/10"
                          >
                            Mark Completed
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* PAST COMPLETED LOGS */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6">
                <h3 className="font-heading text-sm font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                  <Check size={14} className="text-slate-500" />
                  Past Completed Logs
                </h3>

                <div className="space-y-4">
                  {myBookings.filter(b => b.status === 'Completed').length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-600 font-bold uppercase">
                      No completed shoots logged.
                    </div>
                  ) : (
                    myBookings.filter(b => b.status === 'Completed').map(b => (
                      <div key={b.id} className="flex justify-between items-center text-xs py-3 border-b border-slate-900/50 hover:bg-slate-900/10 px-2 rounded transition-colors">
                        <div>
                          <span className="font-mono text-[10px] text-slate-500 mr-2 font-bold">{b.id.slice(0, 8)}</span>
                          <span className="font-bold text-white uppercase">{b.name}</span>
                          <span className="text-slate-500 text-[10px] ml-2">({b.service})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-heading font-black text-emerald-400 block">+₹{(b.price * activeSharePct).toLocaleString()}</span>
                          <span className="text-[9px] text-slate-500 font-medium">{b.date} · {b.paymentStatus === 'PAID' || b.paymentStatus === 'Success' ? 'PAID' : 'PENDING'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* ADMINISTRATOR VIEW */}
      {authRole === 'ADMIN' && (
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
          {/* HEADER CONTROL DECK */}
          <header className="border-b border-slate-900 bg-slate-900/20 backdrop-blur-xl px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-sm font-black tracking-[0.2em] text-white uppercase">
                ADMIN CONTROL DECK
              </h2>
              <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-bold rounded-full tracking-wider uppercase badge-pulse">
                Supabase Connected
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSyncModal(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-heading text-[9px] font-black tracking-widest rounded uppercase cursor-pointer border-0 transition-all flex items-center gap-1.5"
              >
                <Database size={11} />
                Data Sync
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 bg-slate-900 hover:bg-red-950/20 hover:text-red-400 text-slate-400 font-heading text-[9px] font-black tracking-widest rounded uppercase cursor-pointer border-0 transition-all flex items-center gap-1.5"
              >
                <LogOut size={11} />
                Lock Console
              </button>
            </div>
          </header>

          {/* MAIN LAYOUT */}
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* SIDE NAVIGATION */}
            <aside className="w-full lg:w-[240px] border-r border-slate-900 bg-slate-950 p-4 space-y-1">
              {[
                { tab: 'OVERVIEW', label: 'Dashboard Overview', icon: Activity },
                { tab: 'BOOKINGS', label: 'Shoot Bookings', icon: Calendar },
                { tab: 'FINANCES', label: 'Financial Ledgers', icon: DollarSign },
                { tab: 'TEAM', label: 'Operational Roster', icon: Users },
                { tab: 'APPLICATIONS', label: 'Job Applications', icon: FileText },
                { tab: 'WEBSITE', label: 'Website Controls', icon: Globe },
                { tab: 'SYSTEM', label: 'System Settings', icon: Database },
              ].map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.tab}
                    onClick={() => setAdminTab(item.tab as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-heading text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer border-0 text-left ${
                      adminTab === item.tab 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                        : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 bg-transparent'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                )
              })}
            </aside>

            {/* TAB PANEL CONTAINER */}
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-6xl w-full mx-auto">
              
              {/* TAB 1: OVERVIEW */}
              {adminTab === 'OVERVIEW' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-heading text-lg font-black text-white uppercase tracking-wider">
                        {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, Admin
                      </h2>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full dot-pulse inline-block" />
                        Live — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => loadDatabase()} className="px-3 py-2 glass-card rounded-lg text-[9px] font-bold uppercase tracking-wider text-slate-300 hover:text-white cursor-pointer border-0 flex items-center gap-1.5 transition-all">
                        <RefreshCw size={11} /> Refresh
                      </button>
                      <button onClick={() => setShowAddCrewModal(true)} className="px-3 py-2 glass-card rounded-lg text-[9px] font-bold uppercase tracking-wider text-indigo-400 hover:text-white cursor-pointer border-0 flex items-center gap-1.5 transition-all">
                        <Plus size={11} /> Add Crew
                      </button>
                      <button onClick={() => setAdminTab('BOOKINGS')} className="px-3 py-2 glass-card rounded-lg text-[9px] font-bold uppercase tracking-wider text-emerald-400 hover:text-white cursor-pointer border-0 flex items-center gap-1.5 transition-all">
                        <Eye size={11} /> View Bookings
                      </button>
                    </div>
                  </div>

                  {/* STATS CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Bookings', value: bookings.length, sub: `${bookings.filter(b => b.status === 'Pending').length} pending`, icon: Calendar, color: 'text-indigo-400' },
                      { label: 'Gross Revenue', value: `₹${grossPaid.toLocaleString()}`, sub: `Receivables: ₹${pendingReceivables.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
                      { label: 'Studio Share (30%)', value: `₹${totalStudioPaid.toLocaleString()}`, sub: `Pending: ₹${totalStudioPending.toLocaleString()}`, icon: TrendingUp, color: 'text-amber-400' },
                      { label: 'Crew Share (70%)', value: `₹${totalCrewPaid.toLocaleString()}`, sub: `Pending: ₹${totalCrewPending.toLocaleString()}`, icon: Users, color: 'text-violet-400' },
                    ].map((card, i) => {
                      const Icon = card.icon
                      return (
                        <div key={i} className="glass-card stat-glow rounded-2xl p-5 space-y-4 transition-all">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</span>
                            <div className={`p-2 rounded-xl bg-slate-900/60 border border-slate-800 ${card.color}`}>
                              <Icon size={14} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-heading text-2xl font-black text-white">{card.value}</h3>
                            <p className="text-[10px] text-slate-500 font-medium">{card.sub}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* STATUS BREAKDOWN */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: 'Pending', count: bookings.filter(b => b.status === 'Pending').length, color: 'bg-amber-500' },
                      { label: 'Confirmed', count: bookings.filter(b => b.status === 'Confirmed').length, color: 'bg-indigo-500' },
                      { label: 'In Progress', count: bookings.filter(b => b.status === 'In Progress').length, color: 'bg-cyan-500' },
                      { label: 'Completed', count: bookings.filter(b => b.status === 'Completed').length, color: 'bg-emerald-500' },
                      { label: 'Cancelled', count: bookings.filter(b => b.status === 'Cancelled').length, color: 'bg-red-500' },
                    ].map(s => (
                      <div key={s.label} className="glass-card rounded-xl p-3 flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${s.color}`} />
                        <div>
                          <span className="font-heading text-lg font-black text-white block leading-none">{s.count}</span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FINANCIAL CHARTS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-6">
                      <h3 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Financial Inflow</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }} />
                            <Bar dataKey="Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 space-y-4">
                      <h3 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Bookings</h3>
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map(b => (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBooking(b)}
                            className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1 cursor-pointer hover:border-indigo-500/30 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-[9px] text-indigo-400 font-bold">{b.id.slice(0, 8)}</span>
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                                b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                b.status === 'Confirmed' ? 'bg-indigo-500/10 text-indigo-400' :
                                b.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                                'bg-amber-500/10 text-amber-400'
                              }`}>{b.status}</span>
                            </div>
                            <h4 className="font-bold text-white text-xs truncate">{b.name}</h4>
                            <p className="text-[10px] text-slate-500">{b.service} · {b.date}</p>
                          </div>
                        ))}
                        {bookings.length === 0 && (
                          <div className="p-6 text-center text-xs text-slate-500 font-bold border border-dashed border-slate-800 rounded-xl uppercase">
                            No bookings yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BOOKINGS */}
              {adminTab === 'BOOKINGS' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="font-heading text-lg font-black text-white uppercase tracking-wider">Shoot Bookings Ledger</h2>
                    <p className="text-xs text-slate-500 font-medium">Manage and assign creators to incoming shoot requests.</p>
                  </div>

                  {/* FILTERS */}
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/20 border border-slate-900 p-4 rounded-2xl">
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-3 top-3 text-slate-500" size={14} />
                      <input
                        type="text"
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        placeholder="Search Client or ID..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                      <select
                        value={bookingFilterStatus}
                        onChange={(e) => setBookingFilterStatus(e.target.value)}
                        className="flex-1 md:flex-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <select
                        value={bookingFilterService}
                        onChange={(e) => setBookingFilterService(e.target.value)}
                        className="flex-1 md:flex-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="ALL">All Categories</option>
                        {Array.from(new Set(bookings.map(b => b.service))).map(svc => (
                          <option key={svc} value={svc}>{svc}</option>
                        ))}
                      </select>

                      <select
                        value={bookingFilterCrew}
                        onChange={(e) => setBookingFilterCrew(e.target.value)}
                        className="flex-1 md:flex-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="ALL">All Crew Members</option>
                        <option value="UNASSIGNED">Unassigned Only</option>
                        {teamMembers.map(t => (
                          <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* TABLE */}
                  <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-900 bg-slate-900/10 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                            <th className="p-4">Shoot ID</th>
                            <th className="p-4">Client / Service</th>
                            <th className="p-4">Date / Preferred Time</th>
                            <th className="p-4">Assigned Creator</th>
                            <th className="p-4">Payment</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/60">
                          {filteredBookings.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-500 font-bold uppercase">
                                No booking records matching search criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredBookings.map(b => (
                              <tr key={b.id} className="hover:bg-slate-900/10 transition-colors">
                                <td className="p-4 font-mono font-bold text-indigo-400">{b.id}</td>
                                <td className="p-4">
                                  <div className="font-bold text-white uppercase">{b.name}</div>
                                  <div className="text-[10px] text-slate-400">{b.service}</div>
                                </td>
                                <td className="p-4">
                                  <div>{b.date}</div>
                                  <div className="text-[10px] text-slate-500">{b.preferredTime || 'Anytime'}</div>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-1.5 min-w-[150px]">
                                    <select
                                      value={b.assignedTo}
                                      onChange={(e) => handleAssignCrew(b.id, e.target.value)}
                                      className={`w-full bg-slate-950 border rounded px-2.5 py-1.5 text-[10px] font-bold focus:outline-none cursor-pointer transition-colors ${
                                        b.assignedTo === 'UNASSIGNED'
                                          ? 'text-slate-400 border-slate-800 hover:border-slate-700'
                                          : 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5'
                                      }`}
                                    >
                                      <option value="UNASSIGNED">-- Unassigned --</option>
                                      {teamMembers.map(t => (
                                        <option key={t.name} value={t.name}>
                                          {t.name} ({getCrewStatusForDate(t.name, b.date, b.id)})
                                        </option>
                                      ))}
                                    </select>
                                    {b.assignedTo !== 'UNASSIGNED' && (
                                      <div className="flex items-center gap-1.5 px-1">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full dot-pulse" />
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                                          {teamMembers.find(t => t.name === b.assignedTo)?.role || 'Creative Partner'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <select
                                    value={b.paymentStatus}
                                    onChange={(e) => handleUpdatePaymentStatus(b.id, e.target.value)}
                                    className={`bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[10px] font-bold focus:outline-none cursor-pointer ${
                                      b.paymentStatus === 'PAID' || b.paymentStatus === 'Success'
                                        ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                                        : 'text-amber-400 border-amber-500/20 bg-amber-500/5'
                                    }`}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Success">Success</option>
                                    <option value="Failed">Failed</option>
                                    <option value="Refunded">Refunded</option>
                                  </select>
                                </td>
                                <td className="p-4">
                                  <select
                                    value={b.status}
                                    onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-300 focus:outline-none cursor-pointer"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => setSelectedBooking(b)}
                                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-heading text-[8px] font-bold tracking-widest uppercase rounded cursor-pointer transition-all border-0"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FINANCES */}
              {adminTab === 'FINANCES' && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="font-heading text-lg font-black text-white uppercase tracking-wider">Financial Ledger</h2>
                    <p className="text-xs text-slate-500 font-medium">Revenue, receivables, and payment records from Supabase.</p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="glass-card stat-glow rounded-2xl p-5 space-y-2 transition-all">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Gross Revenue</span>
                      <h3 className="font-heading text-2xl font-black text-emerald-400">₹{grossPaid.toLocaleString()}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Cleared payments</p>
                    </div>
                    <div className="glass-card stat-glow rounded-2xl p-5 space-y-2 transition-all">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Receivables</span>
                      <h3 className="font-heading text-2xl font-black text-amber-400">₹{pendingReceivables.toLocaleString()}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Awaiting payment</p>
                    </div>
                    <div className="glass-card stat-glow rounded-2xl p-5 space-y-2 transition-all">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Total Valuation</span>
                      <h3 className="font-heading text-2xl font-black text-white">₹{totalValuation.toLocaleString()}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Gross portfolio</p>
                    </div>
                    <div className="glass-card stat-glow rounded-2xl p-5 space-y-2 transition-all">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Payment Records</span>
                      <h3 className="font-heading text-2xl font-black text-indigo-400">{payments.length}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Total transactions</p>
                    </div>
                  </div>

                  {/* Paid Bookings */}
                  <div className="glass-card rounded-2xl p-6 space-y-4">
                    <h3 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest">Paid Bookings</h3>
                    <div className="space-y-3">
                      {bookings.filter(b => b.paymentStatus === 'PAID' || b.paymentStatus === 'Success').map(b => (
                        <div key={b.id} className="flex justify-between items-center text-xs py-3 border-b border-slate-800/50 hover:bg-slate-900/20 px-2 rounded transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                            <div>
                              <span className="font-bold text-white uppercase">{b.name}</span>
                              <span className="text-slate-500 text-[10px] ml-2">{b.service} · {b.date}</span>
                            </div>
                          </div>
                          <span className="font-heading font-black text-emerald-400">+₹{b.price.toLocaleString()}</span>
                        </div>
                      ))}
                      {bookings.filter(b => b.paymentStatus === 'PAID' || b.paymentStatus === 'Success').length === 0 && (
                        <p className="text-center text-xs text-slate-500 py-6 border border-dashed border-slate-800 rounded-xl">No paid bookings yet</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Records Table */}
                  <div className="glass-card rounded-2xl p-6 space-y-4">
                    <h3 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Transaction Records</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-800">
                            <th className="text-left p-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest">Transaction ID</th>
                            <th className="text-left p-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                            <th className="text-left p-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest">Method</th>
                            <th className="text-left p-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="text-left p-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-xs text-slate-500">No payment records</td></tr>
                          ) : payments.map(p => (
                            <tr key={p.id} className="border-b border-slate-800/30 hover:bg-slate-900/20 transition-colors">
                              <td className="p-3 font-mono text-[10px] text-indigo-400 font-bold">{p.transactionId || p.id.slice(0, 12)}</td>
                              <td className="p-3 font-heading font-black text-white text-xs">₹{p.amount.toLocaleString()}</td>
                              <td className="p-3 text-xs text-slate-300">{p.method}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                                  p.status === 'Success' || p.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' :
                                  p.status === 'Failed' ? 'bg-red-500/10 text-red-400' :
                                  p.status === 'Refunded' ? 'bg-violet-500/10 text-violet-400' :
                                  'bg-amber-500/10 text-amber-400'
                                }`}>{p.status}</span>
                              </td>
                              <td className="p-3 text-[10px] text-slate-500">{p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TEAM */}
              {adminTab === 'TEAM' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-heading text-lg font-black text-white uppercase tracking-wider">Active Creative Roster</h2>
                      <p className="text-xs text-slate-500 font-medium">Manage photographers, editor dispatches, and availability logs.</p>
                    </div>
                    <button
                      onClick={() => setShowAddCrewModal(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-heading text-[10px] font-black tracking-widest uppercase rounded-xl transition-all cursor-pointer border-0 flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Enroll Partner
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers.map(t => {
                      const crewShoots = bookings.filter(b => b.assignedTo === t.name && b.status !== 'Completed' && b.status !== 'Cancelled')
                      const shareRatePct = (t.share || 40) / 100
                      const totalEarnings = bookings.filter(b => b.assignedTo === t.name && (b.paymentStatus === 'PAID' || b.paymentStatus === 'Success')).reduce((sum, b) => sum + (b.price * shareRatePct), 0)
                      const pendingEarnings = bookings.filter(b => b.assignedTo === t.name && (b.paymentStatus === 'Pending' || b.paymentStatus === 'PENDING')).reduce((sum, b) => sum + (b.price * shareRatePct), 0)
                      
                      return (
                        <div key={t.name} className="glass-card stat-glow rounded-2xl p-5 space-y-4 relative group transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-heading text-lg font-black text-white">
                              {t.name.slice(0,2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-heading text-sm font-bold text-white uppercase">{t.name}</h4>
                              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t.role}</p>
                            </div>
                          </div>

                          <div className="space-y-2 border-t border-slate-900/60 pt-4 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Specialty</span>
                              <span className="text-slate-300 font-medium text-[11px]">{t.specialty}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Availability</span>
                              <button
                                onClick={() => handleToggleCrewAvailabilityAdmin(t.id!, t.availability)}
                                className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase cursor-pointer border-0 transition-colors ${
                                  t.availability === 'AVAILABLE'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                    : t.availability === 'ON SHOOT'
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                                      : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                }`}
                              >
                                {t.availability}
                              </button>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Email</span>
                              <span className="text-slate-400 font-mono text-[10px]">{t.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Earnings ({t.share || 40}% Share)</span>
                              <span className="text-white font-mono font-bold">
                                ₹{totalEarnings.toLocaleString()} <span className="text-slate-500 font-normal">/</span> <span className="text-amber-400">₹{pendingEarnings.toLocaleString()}</span>
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Shoot Share / Active Shoots</span>
                              <span className="text-slate-300 font-mono font-semibold">{t.share || 40}% · <span className="text-white font-bold">{t.activeShoots}</span></span>
                            </div>
                          </div>

                          {/* Crew upcoming schedule list */}
                          <div className="space-y-1.5 pt-3 border-t border-slate-900/60">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[8px] block">Upcoming Shoots ({crewShoots.length})</span>
                            {crewShoots.length === 0 ? (
                              <span className="text-[10px] text-slate-600 italic block">No upcoming shoots</span>
                            ) : (
                              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                {crewShoots.map(s => (
                                  <div key={s.id} className="flex justify-between items-center bg-slate-950/40 p-1.5 rounded border border-slate-900/40 text-[9px]">
                                    <span className="text-slate-300 font-bold truncate max-w-[100px]" title={s.name}>{s.name}</span>
                                    <span className="text-indigo-400 font-mono font-bold">{s.date}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setBookingFilterCrew(t.name)
                              setAdminTab('BOOKINGS')
                            }}
                            className="w-full mt-1 py-2 bg-slate-900/60 hover:bg-slate-800 text-[9px] text-slate-300 font-bold uppercase tracking-wider rounded-lg border border-slate-800 transition-colors cursor-pointer"
                          >
                            View Crew Schedule
                          </button>

                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditCrewId(t.id!)
                                setEditCrewName(t.name)
                                setEditCrewEmail(t.email || '')
                                setEditCrewRole(t.role)
                                setEditCrewSpecialty(t.specialty)
                                setEditCrewRate(String(t.share || 40))
                                setEditCrewAvailability(t.availability)
                                setEditCrewPassword('')
                                setShowEditCrewModal(true)
                              }}
                              className="text-slate-500 hover:text-indigo-400 bg-transparent border-0 cursor-pointer p-1.5 transition-colors"
                              title="Edit Partner"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteCrew(t.id!, t.name)}
                              className="text-slate-500 hover:text-red-400 bg-transparent border-0 cursor-pointer p-1.5 transition-colors"
                              title="Remove Partner"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: APPLICATIONS */}
              {adminTab === 'APPLICATIONS' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-heading text-lg font-black text-white uppercase tracking-wider">Hiring & Career Applications</h2>
                      <p className="text-xs text-slate-500 font-medium">Process candidates and configure hiring gateway status.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {applications.map(a => (
                      <div key={a.id} className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 space-y-4 relative group">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono text-indigo-400 font-bold block mb-1">{a.id}</span>
                            <h4 className="font-heading text-sm font-bold text-white uppercase">{a.name}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{a.jobTitle}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteApp(a.id)}
                            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer p-2"
                            title="Delete Application"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="space-y-2 border-t border-slate-900/60 pt-4 text-xs">
                          <div className="text-slate-400 text-[11px] leading-relaxed italic bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                            "{a.message}"
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Email Address</span>
                            <span className="text-slate-300 font-mono text-[10px]">{a.email}</span>
                          </div>
                          {a.portfolioUrl && (
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Portfolio URL</span>
                              <a href={a.portfolioUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                                View Portfolio <ExternalLink size={10} />
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-slate-900/60 pt-4 flex justify-between items-center">
                          <span className={`px-2.5 py-0.5 border text-[9px] font-bold tracking-widest uppercase rounded ${
                            a.status === 'PENDING REVIEW' 
                              ? 'border-amber-500/20 bg-amber-500/5 text-amber-400' 
                              : a.status === 'APPROVED' 
                                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                                : 'border-red-500/20 bg-red-500/5 text-red-400'
                          }`}>
                            {a.status}
                          </span>

                          <div className="flex gap-2">
                            {a.status === 'PENDING REVIEW' && (
                              <>
                                <button
                                  onClick={() => handleTriggerHireModal(a.id)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-heading text-[8px] font-bold tracking-widest rounded uppercase cursor-pointer transition-all border-0 shadow-sm shadow-emerald-600/10"
                                >
                                  Hire
                                </button>
                                <button
                                  onClick={() => handleUpdateAppStatus(a.id, 'REJECTED')}
                                  className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-heading text-[8px] font-bold tracking-widest rounded uppercase cursor-pointer transition-all border-0 shadow-sm shadow-red-600/10"
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
                </div>
              )}

              {/* TAB 6: WEBSITE */}
              {adminTab === 'WEBSITE' && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="font-heading text-lg font-black text-white uppercase tracking-wider">Website Controls & Telemetry</h2>
                    <p className="text-xs text-slate-500 font-medium">Configure package prices, homepage reels, and hiring switches.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* PRICING & HIRING */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest">Hiring Gateway Control</h3>
                          <button
                            onClick={handleToggleHiring}
                            className={`px-4 py-2 font-heading text-[9px] font-black tracking-widest uppercase rounded-lg border transition-all cursor-pointer ${
                              careerHiring
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-md shadow-emerald-500/5'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >
                            {careerHiring ? 'Career Submissions Open' : 'Hiring Portal Closed'}
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-6">
                        <h3 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest">Shoot Package Pricing Ledger</h3>
                        
                        <div className="space-y-4">
                          {Object.entries(editingPrices).map(([name, price]) => (
                            <div key={name} className="flex justify-between items-center gap-4">
                              <span className="text-xs text-slate-300 font-bold uppercase">{name}</span>
                              <div className="relative w-32">
                                <span className="absolute left-3 top-2.5 text-slate-600 text-xs">₹</span>
                                <input
                                  type="number"
                                  value={price}
                                  onChange={(e) => setEditingPrices({ ...editingPrices, [name]: Number(e.target.value) })}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-6 pr-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={handleSavePrices}
                          className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-heading text-xs font-black tracking-widest uppercase cursor-pointer border-0 shadow-md shadow-indigo-600/10 transition-all"
                        >
                          Synchronize Service Pricing
                        </button>
                      </div>
                    </div>

                    {/* HOMEPAGE REELS */}
                    <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest">Homepage Reels</h3>
                        <button
                          onClick={() => {
                            setReelEditId(null)
                            setNewReelTitle('')
                            setNewReelUrl('')
                            setShowReelModal(true)
                          }}
                          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 rounded-lg cursor-pointer transition-colors"
                          title="Add Reel"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {reels.map(r => (
                          <div key={r.id} className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 flex justify-between items-center gap-3">
                            <div className="space-y-1">
                              <h4 className="font-bold text-white uppercase text-[11px] leading-tight line-clamp-1">{r.title}</h4>
                              <span className="text-[9px] text-slate-500 font-medium">Views: {r.views} | Likes: {r.likes}</span>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setReelEditId(r.id)
                                  setNewReelTitle(r.title)
                                  setNewReelUrl(r.videoUrl)
                                  setShowReelModal(true)
                                }}
                                className="p-1.5 text-slate-500 hover:text-white bg-transparent border-0 cursor-pointer"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteReel(r.id)}
                                className="p-1.5 text-slate-500 hover:text-red-400 bg-transparent border-0 cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: SYSTEM */}
              {adminTab === 'SYSTEM' && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="font-heading text-lg font-black text-white uppercase tracking-wider">System Settings & Database</h2>
                    <p className="text-xs text-slate-500 font-medium">Manage database exports, import telemetry records, and reset tables.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* BACKUP OPTIONS */}
                    <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-6">
                      <h3 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest">Database Backup Switches</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={handleExportData}
                          className="py-4 bg-slate-900 hover:bg-slate-800 text-white font-heading text-[10px] font-black tracking-widest uppercase rounded-xl border-0 cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                        >
                          <Download size={16} />
                          Clipboard Backup
                        </button>
                        <button
                          onClick={() => {
                            setImportText('')
                            setShowSyncModal(true)
                          }}
                          className="py-4 bg-slate-900 hover:bg-slate-800 text-white font-heading text-[10px] font-black tracking-widest uppercase rounded-xl border-0 cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                        >
                          <Upload size={16} />
                          Synchronize DB
                        </button>
                      </div>
                    </div>

                    {/* FACTORY RESET */}
                    <div className="bg-slate-900/20 border border-slate-950 rounded-2xl p-6 space-y-6">
                      <h3 className="font-heading text-xs font-bold text-red-500 uppercase tracking-widest">Danger Zone Controls</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed uppercase font-semibold">
                        This command wipes active booking entries and re-indexes all operational tables. Access details and team members remain.
                      </p>
                      <button
                        onClick={handleResetDefaults}
                        className="w-full py-3 bg-red-950/20 hover:bg-red-900 text-red-400 rounded-lg font-heading text-xs font-black tracking-widest uppercase cursor-pointer border-0 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Database size={12} />
                        Factory Reset Database
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-4 bg-slate-950 border-t border-slate-900/40 text-center text-[10px] text-slate-600 font-medium uppercase tracking-widest mt-auto z-10 select-none">
        MR. CINEMATICSHOOT Operations Control Vault — Supabase Real-Time Backend
      </footer>

      {/* DISPATCH DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 select-none animate-fade-in">
          <div className="absolute inset-0 cursor-default" onClick={() => setSelectedBooking(null)} />
          <div className="relative glass-card w-full max-w-2xl bg-slate-950/95 p-6 z-10 space-y-5 text-left rounded-2xl animate-reveal-up max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-[10px] text-indigo-400 font-bold block mb-1">{selectedBooking.id}</span>
                <h3 className="font-heading text-md font-black text-white uppercase">{selectedBooking.name}</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-500 hover:text-white bg-transparent border-0 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-2">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${(selectedBooking.phoneCode || '+91').replace('+', '')}${selectedBooking.phoneNumber?.replace(/\s/g, '')}?text=${encodeURIComponent(`Hi ${selectedBooking.name}, this is MR. CINEMATICSHOOT regarding your booking ${selectedBooking.id} for ${selectedBooking.service} on ${selectedBooking.date}. Let's discuss the details!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="wa-btn px-3.5 py-2 rounded-lg text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 no-underline"
              >
                <MessageCircle size={12} /> WhatsApp
              </a>
              {/* Phone Call */}
              <a
                href={`tel:${selectedBooking.phoneCode || '+91'}${selectedBooking.phoneNumber}`}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 no-underline border border-slate-800 transition-colors"
              >
                <Phone size={12} /> Call
              </a>
              {/* Status Actions */}
              {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map(s => (
                <button
                  key={s}
                  onClick={async () => {
                    await supabase.from('bookings').update({ status: s }).eq('id', selectedBooking.id)
                    toast.success(`Status → ${s}`)
                    setSelectedBooking({ ...selectedBooking, status: s })
                    loadDatabase()
                  }}
                  disabled={selectedBooking.status === s}
                  className={`px-2.5 py-2 rounded-lg text-[8px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                    selectedBooking.status === s
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div className="space-y-1">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Service Package</span>
                <span className="font-semibold text-white uppercase">{selectedBooking.service}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Shoot Date</span>
                <span className="font-semibold text-white">{selectedBooking.date}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Contact</span>
                <span className="font-medium text-slate-300">{selectedBooking.email}</span>
                <span className="block text-slate-400 font-mono text-[10px] mt-0.5">{selectedBooking.phoneNumber}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Preferred Time</span>
                <span className="font-semibold text-white">{selectedBooking.preferredTime || 'Anytime'}</span>
              </div>

              <div className="col-span-2 space-y-1 border-t border-slate-800 pt-3">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Shoot Location</span>
                <p className="font-medium text-slate-300 leading-relaxed">
                  {selectedBooking.locationVenue && `${selectedBooking.locationVenue}, `}
                  {selectedBooking.locationArea && `${selectedBooking.locationArea}, `}
                  {selectedBooking.locationDistrict && `${selectedBooking.locationDistrict}, `}
                  {selectedBooking.locationState && `${selectedBooking.locationState}`}
                  {selectedBooking.pincode && ` - ${selectedBooking.pincode}`}
                </p>
              </div>

              {selectedBooking.message && (
                <div className="col-span-2 space-y-1 border-t border-slate-800 pt-3">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Special Requirements</span>
                  <p className="text-slate-400 italic font-medium leading-relaxed bg-slate-900/30 p-3 rounded-lg border border-slate-800">
                    "{selectedBooking.message}"
                  </p>
                </div>
              )}

              {/* Payment & Assignment Row */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Payment</span>
                <span className="font-heading font-black text-emerald-400 block">₹{selectedBooking.price.toLocaleString()}</span>
                <div className="flex gap-1.5">
                  {['Pending', 'Success'].map(ps => (
                    <button
                      key={ps}
                      onClick={async () => {
                        await supabase.from('bookings').update({ payment_status: ps }).eq('id', selectedBooking.id)
                        toast.success(`Payment → ${ps}`)
                        setSelectedBooking({ ...selectedBooking, paymentStatus: ps })
                        loadDatabase()
                      }}
                      className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                        selectedBooking.paymentStatus === ps
                          ? ps === 'Success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-amber-600 text-white border-amber-500'
                          : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-white'
                      }`}
                    >
                      {ps}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Assign Creator</span>
                <select
                  value={selectedBooking.assignedTo}
                  onChange={async (e) => {
                    const crewName = e.target.value
                    const member = teamMembers.find(t => t.name === crewName)
                    await supabase.from('bookings').update({ assigned_creator_id: member?.id || null }).eq('id', selectedBooking.id)
                    toast.success(`Assigned → ${crewName}`)
                    setSelectedBooking({ ...selectedBooking, assignedTo: crewName })
                    loadDatabase()
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="UNASSIGNED">Unassigned</option>
                  {teamMembers.map(t => (
                    <option key={t.id} value={t.name}>{t.name} — {t.role}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-heading text-[9px] font-black tracking-widest rounded-lg uppercase cursor-pointer border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REELS ADD / EDIT MODAL */}
      {showReelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 select-none">
          <div className="absolute inset-0 cursor-default" onClick={() => setShowReelModal(false)} />
          <form onSubmit={handleSaveReel} className="relative glass-neon w-full max-w-md bg-slate-950 p-6 border border-slate-900 z-10 space-y-6 text-left rounded-2xl">
            <div className="flex justify-between items-start pb-3 border-b border-slate-900">
              <h3 className="font-heading text-sm font-black text-white uppercase">
                {reelEditId !== null ? 'Edit Showcase Reel' : 'Add Showcase Reel'}
              </h3>
              <button onClick={() => setShowReelModal(false)} className="text-slate-500 hover:text-white bg-transparent border-0 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reel Title</label>
                <input
                  type="text"
                  value={newReelTitle}
                  onChange={(e) => setNewReelTitle(e.target.value)}
                  placeholder="e.g. Vaporwave Neon Street Fashion"
                  className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Video URL (.mp4)</label>
                <input
                  type="url"
                  value={newReelUrl}
                  onChange={(e) => setNewReelUrl(e.target.value)}
                  placeholder="https://assets.mixkit.co/..."
                  className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReelModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-heading text-[9px] font-black tracking-widest rounded-lg uppercase cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-heading text-[9px] font-black tracking-widest rounded-lg uppercase cursor-pointer border-0"
              >
                Save Showcase Reel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ENROLL PARTNER MODAL */}
      {showAddCrewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 select-none">
          <div className="absolute inset-0 cursor-default" onClick={() => setShowAddCrewModal(false)} />
          <form onSubmit={handleAddCrew} className="relative glass-neon w-full max-w-md bg-slate-950 p-6 border border-slate-900 z-10 space-y-6 text-left rounded-2xl">
            <div className="flex justify-between items-start pb-3 border-b border-slate-900">
              <h3 className="font-heading text-sm font-black text-white uppercase">Enroll Creative Partner</h3>
              <button onClick={() => setShowAddCrewModal(false)} className="text-slate-500 hover:text-white bg-transparent border-0 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={newCrewName}
                    onChange={(e) => setNewCrewName(e.target.value)}
                    placeholder="e.g. Marcus Bellingham"
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specialty Role</label>
                  <input
                    type="text"
                    value={newCrewRole}
                    onChange={(e) => setNewCrewRole(e.target.value)}
                    placeholder="e.g. Video Editor / Drone Op"
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={newCrewEmail}
                    onChange={(e) => setNewCrewEmail(e.target.value)}
                    placeholder="marcus@mrcinematic.com"
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Key (Password)</label>
                  <input
                    type="password"
                    value={newCrewPassword}
                    onChange={(e) => setNewCrewPassword(e.target.value)}
                    placeholder="crew2026"
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specific Specialty</label>
                  <input
                    type="text"
                    value={newCrewSpecialty}
                    onChange={(e) => setNewCrewSpecialty(e.target.value)}
                    placeholder="e.g. RED Ranger & Cine Lenses"
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shoot Share (%)</label>
                  <input
                    type="number"
                    value={newCrewRate}
                    onChange={(e) => setNewCrewRate(e.target.value)}
                    placeholder="40"
                    min="1"
                    max="100"
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddCrewModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-heading text-[9px] font-black tracking-widest rounded-lg uppercase cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-heading text-[9px] font-black tracking-widest rounded-lg uppercase cursor-pointer border-0"
              >
                Enroll Creative Partner
              </button>
            </div>
          </form>
        </div>
      )}
      {/* EDIT PARTNER MODAL */}
      {showEditCrewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 select-none animate-fade-in">
          <div className="absolute inset-0 cursor-default" onClick={() => setShowEditCrewModal(false)} />
          <form onSubmit={handleEditCrew} className="relative glass-card w-full max-w-md bg-slate-950 p-6 border border-slate-900 z-10 space-y-6 text-left rounded-2xl animate-reveal-up">
            <div className="flex justify-between items-start pb-3 border-b border-slate-900">
              <h3 className="font-heading text-sm font-black text-white uppercase">Edit Creative Partner</h3>
              <button type="button" onClick={() => setShowEditCrewModal(false)} className="text-slate-500 hover:text-white bg-transparent border-0 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={editCrewName}
                    onChange={(e) => setEditCrewName(e.target.value)}
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specialty Role</label>
                  <input
                    type="text"
                    value={editCrewRole}
                    onChange={(e) => setEditCrewRole(e.target.value)}
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={editCrewEmail}
                    onChange={(e) => setEditCrewEmail(e.target.value)}
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Key (New Password)</label>
                  <input
                    type="password"
                    value={editCrewPassword}
                    placeholder="Leave blank to keep same"
                    onChange={(e) => setEditCrewPassword(e.target.value)}
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specific Specialty</label>
                  <input
                    type="text"
                    value={editCrewSpecialty}
                    onChange={(e) => setEditCrewSpecialty(e.target.value)}
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shoot Share (%)</label>
                  <input
                    type="number"
                    value={editCrewRate}
                    onChange={(e) => setEditCrewRate(e.target.value)}
                    min="1"
                    max="100"
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Availability</label>
                <select
                  value={editCrewAvailability}
                  onChange={(e) => setEditCrewAvailability(e.target.value as any)}
                  className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="ON SHOOT">ON SHOOT</option>
                  <option value="LEAVE">LEAVE</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditCrewModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-heading text-[9px] font-black tracking-widest rounded-lg uppercase cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-heading text-[9px] font-black tracking-widest rounded-lg uppercase cursor-pointer border-0 shadow-md shadow-indigo-600/10"
              >
                Update Creative Partner
              </button>
            </div>
          </form>
        </div>
      )}

      {/* HIRE CREATOR MODAL */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 select-none animate-fade-in">
          <div className="absolute inset-0 cursor-default" onClick={() => setShowHireModal(false)} />
          <form onSubmit={handleConfirmHire} className="relative glass-neon w-full max-w-md bg-slate-950 p-6 border border-slate-900 z-10 space-y-6 text-left rounded-2xl animate-reveal-up">
            <div className="flex justify-between items-start pb-3 border-b border-slate-900">
              <h3 className="font-heading text-sm font-black text-white uppercase">Confirm Hire & Generate Account</h3>
              <button onClick={() => setShowHireModal(false)} className="text-slate-500 hover:text-white bg-transparent border-0 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed uppercase font-bold text-[9px] border-b border-slate-900 pb-2">
                You are hiring {hireName}. Create their individual password to grant access to the Partner Portal.
              </p>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  value={hireEmail}
                  onChange={(e) => setHireEmail(e.target.value)}
                  className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Key (Password) *</label>
                <input
                  type="password"
                  value={hirePassword}
                  onChange={(e) => setHirePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specialty Role</label>
                  <input
                    type="text"
                    value={hireSpecialty}
                    onChange={(e) => setHireSpecialty(e.target.value)}
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shoot Share (%)</label>
                  <input
                    type="number"
                    value={hireHourlyRate}
                    onChange={(e) => setHireHourlyRate(e.target.value)}
                    min="1"
                    max="100"
                    className="w-full text-xs border border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowHireModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-heading text-[9px] font-black tracking-widest rounded-lg uppercase cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-heading text-[9px] font-black tracking-widest rounded-lg uppercase cursor-pointer border-0 shadow-md shadow-emerald-600/10"
              >
                Confirm Hire & Setup Portal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SYNC DATABASE MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 select-none animate-fade-in">
          <div className="absolute inset-0 cursor-default" onClick={() => setShowSyncModal(false)} />
          <div className="relative glass-neon w-full max-w-lg bg-slate-950 p-6 border border-slate-900 z-10 space-y-6 text-left rounded-2xl animate-reveal-up">
            <div className="flex justify-between items-start pb-3 border-b border-slate-900">
              <h3 className="font-heading text-sm font-black text-white uppercase">Data Synchronization</h3>
              <button onClick={() => setShowSyncModal(false)} className="text-slate-500 hover:text-white bg-transparent border-0 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Paste JSON data package from clipboard to synchronize database state.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste backup JSON..."
                className="w-full h-40 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-heading text-[9px] font-black tracking-widest rounded-lg uppercase cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                onClick={handleImportData}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-heading text-[9px] font-black tracking-widest rounded-lg uppercase cursor-pointer border-0"
              >
                Synchronize Database
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
