import { createClient } from '@supabase/supabase-js'

// -------------------------------------------------------------
// Supabase Database Connection & Client Configuration
// -------------------------------------------------------------

const supabaseUrl = process.env.SUPABASE_URL || 'https://ahvhbuincvxhewxdkekr.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || ''

class DummyWebSocket {
  constructor() {}
  addEventListener() {}
  removeEventListener() {}
  close() {}
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  realtime: {
    transport: DummyWebSocket as any
  }
})

// Helper to generate UUIDs
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// -------------------------------------------------------------
// Interfaces
// -------------------------------------------------------------

export interface UserProfile {
  name: string
  email: string
  phone: string
  bio: string
  avatar: string
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
  role?: string
  availability?: 'AVAILABLE' | 'ON SHOOT' | 'LEAVE'
  hourlyRate?: number
  rating?: number
}

export interface Booking {
  bookingId: string
  userId: string
  customerName: string
  email: string
  phone: string
  photographyCategory: string
  selectedPackage: string
  eventDate: string
  eventTime: string
  location: string
  specialRequirements: string
  bookingStatus: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled'
  paymentStatus: 'Pending' | 'Success' | 'Failed' | 'Refunded'
  price: number
  createdAt: string
  updatedAt: string
}

export interface Package {
  packageId: string
  packageName: string
  category: string
  description: string
  price: number
  duration: string
  includedServices: string[]
  activeStatus: boolean
}

export interface Payment {
  paymentId: string
  bookingId: string
  userId: string
  amount: number
  paymentMethod: string
  transactionId: string
  paymentStatus: 'Pending' | 'Success' | 'Failed' | 'Refunded'
  paidAt: string
}

export interface Review {
  reviewId: string
  bookingId: string
  userId: string
  rating: number
  reviewText: string
  createdAt: string
}

export interface Notification {
  notificationId: string
  userId: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

// Helper to parse location strings from frontend
function parseLocation(locationStr: string) {
  const result = {
    venue: locationStr || '',
    area: '',
    district: '',
    state: '',
    pincode: ''
  }
  if (!locationStr) return result
  const parts = locationStr.split(',')
  if (parts.length >= 4) {
    result.venue = parts[0].trim()
    result.area = parts[1].trim()
    result.district = parts[2].trim()
    const lastPart = parts[3].trim()
    const lastParts = lastPart.split('-')
    if (lastParts.length >= 2) {
      result.state = lastParts[0].trim()
      result.pincode = lastParts[1].trim()
    } else {
      result.state = lastPart
    }
  }
  return result
}

// Helper to map Supabase database rows to UserProfile interface
function mapSupabaseUserToProfile(data: any): UserProfile {
  const profile = data.profiles || {}
  return {
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    bio: profile.bio || '',
    avatar: profile.avatar || 'US',
    dob: profile.dob || '',
    gender: profile.gender || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    country: profile.country || '',
    memberSince: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'June 2026',
    emailNotifications: profile.email_notifications ?? true,
    smsNotifications: profile.sms_notifications ?? false,
    password: data.password || '',
    indexPortfolio: profile.index_portfolio ?? true,
    shareAnalytics: profile.share_analytics ?? false,
    role: data.role || 'CUSTOMER',
    availability: profile.availability || 'AVAILABLE',
    hourlyRate: Number(profile.hourly_rate || 0),
    rating: Number(profile.rating || 5.0)
  }
}

// Helper to map Supabase bookings to Booking interface
function mapSupabaseBookingToBooking(data: any): Booking {
  const fullLocation = `${data.location_venue || ''}, ${data.location_area || ''}, ${data.location_district || ''}, ${data.location_state || ''} - ${data.pincode || ''}`
  return {
    bookingId: data.id,
    userId: data.client_email,
    customerName: data.client_name,
    email: data.client_email,
    phone: data.client_phone,
    photographyCategory: data.service,
    selectedPackage: data.service,
    eventDate: data.date,
    eventTime: data.preferred_time,
    location: fullLocation,
    specialRequirements: data.special_requirements || '',
    bookingStatus: data.status as any,
    paymentStatus: data.payment_status as any,
    price: Number(data.price || 6000),
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

// Helper to map Supabase packages to Package interface
function mapSupabasePackageToPackage(data: any): Package {
  return {
    packageId: data.id,
    packageName: data.name,
    category: data.category,
    description: data.description || '',
    price: Number(data.price),
    duration: data.duration,
    includedServices: Array.isArray(data.included_services) ? data.included_services : [],
    activeStatus: data.active_status
  }
}

// Helper to map Supabase payments to Payment interface
function mapSupabasePaymentToPayment(data: any): Payment {
  return {
    paymentId: data.id,
    bookingId: data.booking_id,
    userId: data.user_id,
    amount: Number(data.amount),
    paymentMethod: data.payment_method,
    transactionId: data.transaction_id,
    paymentStatus: data.payment_status,
    paidAt: data.paid_at
  }
}

// -------------------------------------------------------------
// Database Service Interface
// -------------------------------------------------------------

export const dbService = {
  // Users
  async getUserByEmail(email: string): Promise<UserProfile | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*, profiles(*)')
      .eq('email', email.toLowerCase())
      .maybeSingle()
    if (error || !data) return undefined
    return mapSupabaseUserToProfile(data)
  },

  async getUserByPhone(phone: string): Promise<UserProfile | undefined> {
    const cleanPhone = phone.replace(/\s+/g, '')
    const { data, error } = await supabase
      .from('users')
      .select('*, profiles(*)')
      .ilike('phone', `%${cleanPhone}%`)
      .maybeSingle()
    if (error || !data) return undefined
    return mapSupabaseUserToProfile(data)
  },  async saveUser(email: string, profile: UserProfile, preferredUserId?: string): Promise<void> {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()
    
    const userId = existingUser?.id || preferredUserId || uuidv4()
    const role = email.toLowerCase() === 'admin@mrcinematic.com' ? 'ADMIN' : (profile.role || 'CUSTOMER')
    
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: email.toLowerCase(),
        name: profile.name,
        phone: profile.phone || null,
        role
      })
    
    if (userError) throw userError

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        specialty: profile.bio || 'Visual Creator',
        bio: profile.bio || '',
        address: profile.address || '',
        availability: profile.availability || 'AVAILABLE',
        hourly_rate: profile.hourlyRate || 0,
        rating: profile.rating || 5.0
      })
    
    if (profileError) throw profileError
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*, profiles(*)')
    if (error || !data) return []
    return data.map(mapSupabaseUserToProfile)
  },

  // Sessions mapping to public.sessions
  async createSession(token: string, email: string): Promise<void> {
    await supabase
      .from('sessions')
      .upsert({
        token,
        email: email.toLowerCase(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
  },

  async getUserBySessionToken(token: string): Promise<UserProfile | undefined> {
    const { data, error } = await supabase
      .from('sessions')
      .select('email')
      .eq('token', token)
      .maybeSingle()
    if (error || !data) return undefined
    return this.getUserByEmail(data.email)
  },

  async deleteSession(token: string): Promise<void> {
    await supabase
      .from('sessions')
      .delete()
      .eq('token', token)
  },

  // OTPs (Legacy stub to prevent build errors)
  async storeOtp(phone: string, code: string): Promise<void> {
    console.log(`[AUTH] SMS OTP Stub for ${phone}: ${code}`)
  },

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    console.log(`[AUTH] Verify OTP Stub for ${phone}: ${code}`)
    return code === '777777' // fallback default code
  },

  // Bookings
  async getBooking(bookingId: string): Promise<Booking | undefined> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle()
    if (error || !data) return undefined
    return mapSupabaseBookingToBooking(data)
  },

  async saveBooking(booking: Booking): Promise<void> {
    const parsedLoc = parseLocation(booking.location)
    
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', booking.email.toLowerCase())
      .maybeSingle()
    
    // Resolve price from package
    const { data: pkg } = await supabase
      .from('packages')
      .select('price')
      .eq('name', booking.selectedPackage)
      .maybeSingle()
    
    const price = pkg ? Number(pkg.price) : 6000

    const { error } = await supabase
      .from('bookings')
      .upsert({
        id: booking.bookingId,
        user_id: user?.id || null,
        client_name: booking.customerName,
        client_email: booking.email.toLowerCase(),
        client_phone: booking.phone,
        service: booking.selectedPackage,
        date: booking.eventDate,
        preferred_time: booking.eventTime,
        duration: 4,
        location_state: parsedLoc.state,
        location_district: parsedLoc.district,
        location_area: parsedLoc.area,
        location_venue: parsedLoc.venue,
        pincode: parsedLoc.pincode,
        special_requirements: booking.specialRequirements,
        price,
        status: booking.bookingStatus,
        payment_status: booking.paymentStatus,
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
  },

  async getBookingsForUser(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('client_email', userId.toLowerCase())
    if (error || !data) return []
    return data.map(mapSupabaseBookingToBooking)
  },

  async getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
    if (error || !data) return []
    return data.map(mapSupabaseBookingToBooking)
  },

  // Packages
  async getPackage(packageId: string): Promise<Package | undefined> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .maybeSingle()
    if (error || !data) return undefined
    return mapSupabasePackageToPackage(data)
  },

  async savePackage(pkg: Package): Promise<void> {
    const { error } = await supabase
      .from('packages')
      .upsert({
        id: pkg.packageId,
        name: pkg.packageName,
        category: pkg.category,
        description: pkg.description,
        price: pkg.price,
        duration: pkg.duration,
        included_services: pkg.includedServices,
        active_status: pkg.activeStatus,
        updated_at: new Date().toISOString()
      })
    if (error) throw error
  },

  async deletePackage(packageId: string): Promise<void> {
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', packageId)
    if (error) throw error
  },

  async getAllPackages(): Promise<Package[]> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
    if (error || !data) return []
    return data.map(mapSupabasePackageToPackage)
  },

  // Payments
  async getPayment(paymentId: string): Promise<Payment | undefined> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .maybeSingle()
    if (error || !data) return undefined
    return mapSupabasePaymentToPayment(data)
  },
  async savePayment(payment: Payment): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .upsert({
        id: payment.paymentId,
        booking_id: payment.bookingId,
        user_id: payment.userId,
        amount: payment.amount,
        payment_method: payment.paymentMethod,
        transaction_id: payment.transactionId || null,
        payment_status: payment.paymentStatus,
        paid_at: payment.paidAt || null
      })
    if (error) throw error
  },

  async getPaymentsForUser(userId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
    if (error || !data) return []
    return data.map(mapSupabasePaymentToPayment)
  },

  async getAllPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
    if (error || !data) return []
    return data.map(mapSupabasePaymentToPayment)
  },

  // Reviews
  async saveReview(review: Review): Promise<void> {
    let userUuid: string | null = null
    if (review.userId.includes('@')) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', review.userId.toLowerCase())
        .maybeSingle()
      userUuid = user?.id || null
    } else {
      userUuid = review.userId
    }

    const { error } = await supabase
      .from('reviews')
      .upsert({
        id: review.reviewId,
        booking_id: review.bookingId,
        user_id: userUuid,
        rating: review.rating,
        review_text: review.reviewText
      })
    if (error) throw error
  },

  async getReviewsForBooking(bookingId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(email)')
      .eq('booking_id', bookingId)
    if (error || !data) return []
    return data.map((r: any) => ({
      reviewId: r.id,
      bookingId: r.booking_id,
      userId: r.users?.email || r.user_id || '',
      rating: r.rating,
      reviewText: r.review_text || '',
      createdAt: r.created_at
    }))
  },

  async getAllReviews(): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(email)')
    if (error || !data) return []
    return data.map((r: any) => ({
      reviewId: r.id,
      bookingId: r.booking_id,
      userId: r.users?.email || r.user_id || '',
      rating: r.rating,
      reviewText: r.review_text || '',
      createdAt: r.created_at
    }))
  },

  // Notifications
  async addNotification(userId: string, title: string, message: string): Promise<void> {
    let userUuid: string | null = null
    if (userId.includes('@')) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', userId.toLowerCase())
        .maybeSingle()
      userUuid = user?.id || null
    } else {
      userUuid = userId
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        id: `NOTIF-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        user_id: userUuid,
        title,
        message,
        read: false
      })
    if (error) throw error
  },

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    let userUuid: string | null = null
    if (userId.includes('@')) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', userId.toLowerCase())
        .maybeSingle()
      userUuid = user?.id || null
    } else {
      userUuid = userId
    }

    if (!userUuid) return []

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userUuid)
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return data.map((n) => ({
      notificationId: n.id,
      userId: userId,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.created_at
    }))
  },

  async markNotificationsAsRead(userId: string): Promise<void> {
    let userUuid: string | null = null
    if (userId.includes('@')) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', userId.toLowerCase())
        .maybeSingle()
      userUuid = user?.id || null
    } else {
      userUuid = userId
    }

    if (!userUuid) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userUuid)
  }
}

export function createDefaultProfile(email: string, name: string, avatar: string, phone: string = ''): UserProfile {
  return {
    name,
    email: email.toLowerCase(),
    phone,
    bio: '',
    avatar,
    dob: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    country: '',
    memberSince: new Date().toLocaleDateString(),
    emailNotifications: true,
    smsNotifications: false,
    indexPortfolio: true,
    shareAnalytics: false
  }
}
