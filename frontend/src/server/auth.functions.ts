import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'
import { dbService, createDefaultProfile, supabase } from './db.server'
import type { Booking, Package, Payment, Review, UserProfile } from './db.server'

// Authorization helpers
async function requireAuth(): Promise<UserProfile> {
  const token = getCookie('mcs_session')
  if (!token) throw new Error('UNAUTHORIZED')
  const user = await dbService.getUserBySessionToken(token)
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

async function requireAdmin(): Promise<UserProfile> {
  const user = await requireAuth()
  if (user.email.toLowerCase() !== 'admin@mrcinematic.com') {
    throw new Error('FORBIDDEN')
  }
  return user
}

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

export const authGetCurrentUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const user = await requireAuth()
      const { password, ...safeUser } = user
      return safeUser
    } catch {
      return null
    }
  })

export const authSyncSession = createServerFn({ method: 'POST' })
  .validator((d: { sessionToken: string; email: string; name?: string; userId?: string }) => d)
  .handler(async ({ data }) => {
    // Check if user profile already exists in our database
    let user = await dbService.getUserByEmail(data.email)
    if (!user) {
      // Create user profile (linked via trigger or manual fallback)
      user = createDefaultProfile(data.email, data.name || data.email.split('@')[0], 'US')
      await dbService.saveUser(data.email, user, data.userId)
    }

    await dbService.createSession(data.sessionToken, data.email)
    
    setCookie('mcs_session', data.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })
    
    return user
  })

// Client calls this on sign out to clear session
export const authClearSession = createServerFn({ method: 'POST' })
  .handler(async () => {
    const token = getCookie('mcs_session')
    if (token) {
      await dbService.deleteSession(token)
      deleteCookie('mcs_session', { path: '/' })
    }
    return { success: true }
  })

// Legacy Google Login stub (fallback compatibility)
export const authLoginWithGoogle = createServerFn({ method: 'POST' })
  .validator((d: { email: string; name: string; avatar: string }) => d)
  .handler(async ({ data }) => {
    let user = await dbService.getUserByEmail(data.email)
    if (!user) {
      user = createDefaultProfile(data.email, data.name, data.avatar)
      await dbService.saveUser(data.email, user)
    }
    const token = `session_google_mock_${Date.now()}`
    await dbService.createSession(token, user.email)
    setCookie('mcs_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })
    return user
  })

// Legacy OTP stubs to avoid compilation errors
export const authSendPhoneOtp = createServerFn({ method: 'POST' })
  .validator((d: { phone: string }) => d)
  .handler(async () => {
    return { success: true, code: '777777' }
  })

export const authVerifyPhoneOtp = createServerFn({ method: 'POST' })
  .validator((d: { phone: string; code: string }) => d)
  .handler(async ({ data }) => {
    const email = `phone.auth_${data.phone.replace(/[^0-9]/g, '')}@mrcinematic.com`
    let user = await dbService.getUserByEmail(email)
    if (!user) {
      user = createDefaultProfile(email, `User ${data.phone}`, 'PH', data.phone)
      await dbService.saveUser(email, user)
    }
    const token = `session_phone_mock_${Date.now()}`
    await dbService.createSession(token, user.email)
    setCookie('mcs_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })
    return user
  })

export const authLogout = createServerFn({ method: 'POST' })
  .handler(async () => {
    const token = getCookie('mcs_session')
    if (token) {
      await dbService.deleteSession(token)
      deleteCookie('mcs_session', { path: '/' })
    }
    return { success: true }
  })

export const updateProfile = createServerFn({ method: 'POST' })
  .validator((d: Partial<UserProfile>) => d)
  .handler(async ({ data }) => {
    const user = await requireAuth()
    const updatedUser = {
      ...user,
      ...data,
      email: user.email // Protect email from changing
    }
    await dbService.saveUser(user.email, updatedUser)
    return updatedUser
  })

export const changePassword = createServerFn({ method: 'POST' })
  .validator((d: { current: string; next: string }) => d)
  .handler(async ({ data }) => {
    const user = await requireAuth()
    // Simply update password in profiles for custom login users
    user.password = data.next
    await dbService.saveUser(user.email, user)
    return { success: true }
  })

// -------------------------------------------------------------
// Booking Endpoints
// -------------------------------------------------------------

export const bookingCreate = createServerFn({ method: 'POST' })
  .validator((d: {
    customerName: string
    email: string
    phone: string
    photographyCategory: string
    selectedPackage: string
    eventDate: string
    eventTime: string
    location: string
    specialRequirements: string
  }) => d)
  .handler(async ({ data }) => {
    const user = await requireAuth()
    
    const bookingId = `MCS-B-${Math.floor(1000 + Math.random() * 9000)}`

    // Fetch price for package
    const { data: pkgData } = await supabase
      .from('packages')
      .select('price')
      .eq('name', data.selectedPackage)
      .maybeSingle()
    const price = pkgData ? Number(pkgData.price) : 6000

    const newBooking: Booking = {
      bookingId,
      userId: user.email,
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      photographyCategory: data.photographyCategory,
      selectedPackage: data.selectedPackage,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      location: data.location,
      specialRequirements: data.specialRequirements,
      bookingStatus: 'Pending',
      paymentStatus: 'Pending',
      price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await dbService.saveBooking(newBooking)
    await dbService.addNotification(
      user.email,
      'Booking Created Successfully',
      `Your booking inquiry (${bookingId}) for ${data.photographyCategory} has been created and is pending review.`
    )
    
    return newBooking
  })

export const bookingListForUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    const user = await requireAuth()
    return await dbService.getBookingsForUser(user.email)
  })

export const bookingCancel = createServerFn({ method: 'POST' })
  .validator((d: { bookingId: string }) => d)
  .handler(async ({ data }) => {
    const user = await requireAuth()
    const booking = await dbService.getBooking(data.bookingId)
    
    if (!booking) throw new Error('BOOKING_NOT_FOUND')
    
    // Check ownership unless admin
    const isAdmin = user.email.toLowerCase() === 'admin@mrcinematic.com'
    if (booking.userId.toLowerCase() !== user.email.toLowerCase() && !isAdmin) {
      throw new Error('FORBIDDEN')
    }
    
    booking.bookingStatus = 'Cancelled'
    booking.updatedAt = new Date().toISOString()
    await dbService.saveBooking(booking)
    
    await dbService.addNotification(
      booking.userId,
      'Booking Cancelled',
      `Your shoot booking (${booking.bookingId}) has been cancelled.`
    )
    
    return booking
  })

export const bookingReschedule = createServerFn({ method: 'POST' })
  .validator((d: { bookingId: string; eventDate: string; eventTime: string }) => d)
  .handler(async ({ data }) => {
    const user = await requireAuth()
    const booking = await dbService.getBooking(data.bookingId)
    
    if (!booking) throw new Error('BOOKING_NOT_FOUND')
    
    const isAdmin = user.email.toLowerCase() === 'admin@mrcinematic.com'
    if (booking.userId.toLowerCase() !== user.email.toLowerCase() && !isAdmin) {
      throw new Error('FORBIDDEN')
    }
    
    booking.eventDate = data.eventDate
    booking.eventTime = data.eventTime
    booking.updatedAt = new Date().toISOString()
    await dbService.saveBooking(booking)
    
    await dbService.addNotification(
      booking.userId,
      'Shoot Rescheduled',
      `Your shoot booking (${booking.bookingId}) has been rescheduled to ${data.eventDate} during ${data.eventTime}.`
    )
    
    return booking
  })

export const adminGetBookings = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    return await dbService.getAllBookings()
  })

export const adminUpdateBookingStatus = createServerFn({ method: 'POST' })
  .validator((d: { bookingId: string; status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' }) => d)
  .handler(async ({ data }) => {
    await requireAdmin()
    const booking = await dbService.getBooking(data.bookingId)
    if (!booking) throw new Error('BOOKING_NOT_FOUND')
    
    booking.bookingStatus = data.status
    booking.updatedAt = new Date().toISOString()
    await dbService.saveBooking(booking)
    
    let title = 'Booking Status Updated'
    let msg = `Your booking (${booking.bookingId}) status has been updated to ${data.status}.`
    
    if (data.status === 'Confirmed') {
      title = 'Booking Confirmed'
      msg = `Great news! Your booking (${booking.bookingId}) has been officially confirmed by the director.`
    } else if (data.status === 'Completed') {
      title = 'Shoot Completed'
      msg = `Your cinematic shoot (${booking.bookingId}) is complete! Visual edits have been finalized. You can now leave a review.`
    }
    
    await dbService.addNotification(booking.userId, title, msg)
    return booking
  })

// -------------------------------------------------------------
// Package Endpoints
// -------------------------------------------------------------

export const packageListAll = createServerFn({ method: 'GET' })
  .handler(async () => {
    return await dbService.getAllPackages()
  })

export const packageCreate = createServerFn({ method: 'POST' })
  .validator((d: Omit<Package, 'packageId'>) => d)
  .handler(async ({ data }) => {
    await requireAdmin()
    const packageId = `PKG-${Math.floor(100 + Math.random() * 900)}`
    
    const newPackage: Package = {
      packageId,
      ...data
    }
    await dbService.savePackage(newPackage)
    return newPackage
  })

export const packageUpdate = createServerFn({ method: 'POST' })
  .validator((d: Package) => d)
  .handler(async ({ data }) => {
    await requireAdmin()
    const pkg = await dbService.getPackage(data.packageId)
    if (!pkg) throw new Error('PACKAGE_NOT_FOUND')
    
    await dbService.savePackage(data)
    return data
  })

export const packageDelete = createServerFn({ method: 'POST' })
  .validator((d: { packageId: string }) => d)
  .handler(async ({ data }) => {
    await requireAdmin()
    await dbService.deletePackage(data.packageId)
    return { success: true }
  })

export const packageToggleActive = createServerFn({ method: 'POST' })
  .validator((d: { packageId: string; activeStatus: boolean }) => d)
  .handler(async ({ data }) => {
    await requireAdmin()
    const pkg = await dbService.getPackage(data.packageId)
    if (!pkg) throw new Error('PACKAGE_NOT_FOUND')
    
    pkg.activeStatus = data.activeStatus
    await dbService.savePackage(pkg)
    return pkg
  })

// -------------------------------------------------------------
// Payment Endpoints
// -------------------------------------------------------------

export const initiatePayment = createServerFn({ method: 'POST' })
  .validator((d: { bookingId: string; amount: number; paymentMethod: string }) => d)
  .handler(async ({ data }) => {
    const user = await requireAuth()
    const booking = await dbService.getBooking(data.bookingId)
    if (!booking) throw new Error('BOOKING_NOT_FOUND')
    
    if (booking.userId.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error('FORBIDDEN')
    }
    
    const paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`
    
    const newPayment: Payment = {
      paymentId,
      bookingId: data.bookingId,
      userId: user.email,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      transactionId: `TXN_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      paymentStatus: 'Pending',
      paidAt: ''
    }
    
    await dbService.savePayment(newPayment)
    return newPayment
  })

export const verifyPayment = createServerFn({ method: 'POST' })
  .validator((d: { paymentId: string; status: 'Success' | 'Failed' }) => d)
  .handler(async ({ data }) => {
    const user = await requireAuth()
    const payment = await dbService.getPayment(data.paymentId)
    if (!payment) throw new Error('PAYMENT_NOT_FOUND')
    
    if (payment.userId.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error('FORBIDDEN')
    }
    
    payment.paymentStatus = data.status
    payment.paidAt = data.status === 'Success' ? new Date().toISOString() : ''
    await dbService.savePayment(payment)
    
    const booking = await dbService.getBooking(payment.bookingId)
    if (booking) {
      booking.paymentStatus = data.status
      if (data.status === 'Success') {
        booking.bookingStatus = 'Confirmed'
        
        await dbService.addNotification(
          payment.userId,
          'Payment Successful',
          `We have successfully processed your payment of ₹${payment.amount.toLocaleString()} for booking ${booking.bookingId}. Your slot is confirmed!`
        )
      }
      await dbService.saveBooking(booking)
    }
    
    return payment
  })

export const getPaymentHistory = createServerFn({ method: 'GET' })
  .handler(async () => {
    const user = await requireAuth()
    return await dbService.getPaymentsForUser(user.email)
  })

export const adminGetPaymentHistory = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    return await dbService.getAllPayments()
  })

// -------------------------------------------------------------
// Reviews & Ratings Endpoints
// -------------------------------------------------------------

export const reviewCreate = createServerFn({ method: 'POST' })
  .validator((d: { bookingId: string; rating: number; reviewText: string }) => d)
  .handler(async ({ data }) => {
    const user = await requireAuth()
    const booking = await dbService.getBooking(data.bookingId)
    if (!booking) throw new Error('BOOKING_NOT_FOUND')
    
    if (booking.userId.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error('FORBIDDEN')
    }
    
    if (booking.bookingStatus !== 'Completed') {
      throw new Error('SHOOT_NOT_COMPLETED')
    }
    
    const reviewId = `REV-${Math.floor(1000 + Math.random() * 9000)}`
    
    const newReview: Review = {
      reviewId,
      bookingId: data.bookingId,
      userId: user.email,
      rating: data.rating,
      reviewText: data.reviewText,
      createdAt: new Date().toISOString()
    }
    
    await dbService.saveReview(newReview)
    await dbService.addNotification(
      'admin@mrcinematic.com',
      'New Customer Review',
      `Customer ${user.name} submitted a ${data.rating}-star review for booking ${data.bookingId}.`
    )
    
    return newReview
  })

export const reviewListAll = createServerFn({ method: 'GET' })
  .handler(async () => {
    return await dbService.getAllReviews()
  })

// -------------------------------------------------------------
// Notifications Endpoints
// -------------------------------------------------------------

export const notificationListForUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    const user = await requireAuth()
    return await dbService.getNotificationsForUser(user.email)
  })

export const notificationMarkRead = createServerFn({ method: 'POST' })
  .handler(async () => {
    const user = await requireAuth()
    await dbService.markNotificationsAsRead(user.email)
    return { success: true }
  })

// -------------------------------------------------------------
// Admin Stats Endpoint
// -------------------------------------------------------------

export const adminGetDashboardStats = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    
    const allUsers = await dbService.getAllUsers()
    const allBookings = await dbService.getAllBookings()
    const allPayments = await dbService.getAllPayments()
    
    const totalUsers = allUsers.length
    const totalBookings = allBookings.length
    
    // Revenue is the sum of successful payments
    const totalRevenue = allPayments
      .filter((p) => p.paymentStatus === 'Success')
      .reduce((sum, p) => sum + p.amount, 0)
    
    // Upcoming shoots: status Confirmed or In Progress
    const upcomingShoots = allBookings.filter(
      (b) => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'In Progress'
    ).length
    
    // Recent bookings (last 5 sorted by createdAt)
    const recentBookings = [...allBookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      
    return {
      totalUsers,
      totalBookings,
      totalRevenue,
      upcomingShoots,
      recentBookings
    }
  })

// -------------------------------------------------------------
// Reels & Website Settings
// -------------------------------------------------------------

export const reelsListAll = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('reels')
      .select('*')
      .order('id', { ascending: true })
    if (error) throw error
    return (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      videoUrl: r.video_url,
      views: r.views,
      likes: r.likes
    }))
  })

export const settingsGetCareerHiring = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('website_settings')
      .select('value')
      .eq('key', 'career_hiring')
      .maybeSingle()
    if (error || !data) return true
    const val = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
    return val === true
  })

export const applicationSubmit = createServerFn({ method: 'POST' })
  .validator((d: {
    name: string
    email: string
    phone?: string
    jobTitle: string
    portfolioUrl: string
    resumeUrl: string
    coverLetter?: string
  }) => d)
  .handler(async ({ data }) => {
    const id = `APP-${Math.floor(1000 + Math.random() * 9000)}`
    const { error } = await supabase
      .from('applications')
      .insert({
        id,
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || '',
        job_title: data.jobTitle,
        portfolio_url: data.portfolioUrl,
        resume_url: data.resumeUrl,
        cover_letter: data.coverLetter || '',
        status: 'APPLIED'
      })
    if (error) throw error
    return { success: true, id }
  })
