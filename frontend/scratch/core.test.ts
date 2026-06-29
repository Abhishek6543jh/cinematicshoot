import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { dbService, createDefaultProfile, supabase } from '../src/server/db.server'

// Helper to generate UUIDs inside the test environment
function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

describe('MR. CINEMATICSHOOT Core Functionalities', () => {
  const suffix = Math.floor(Math.random() * 100000)
  const customerEmail = `test_cust_${suffix}@mrcinematic.com`
  const creatorEmail = `test_crew_${suffix}@mrcinematic.com`
  const appEmail = `test_app_${suffix}@mrcinematic.com`
  const customerName = `Test Customer ${suffix}`
  const creatorName = `Test Crew ${suffix}`
  
  const bookingIdA = `TEST-B-A-${suffix}`
  const bookingIdB = `TEST-B-B-${suffix}`
  const bookingIdC = `TEST-B-C-${suffix}`
  const bookingIdD = `TEST-B-D-${suffix}`

  const sessionToken = `test_token_${suffix}`
  const appId = `TEST-APP-${suffix}`
  const newCreatorId = generateUuid()

  // Track created records for cleanup
  const usersToClean: string[] = []
  const bookingsToClean: string[] = []
  const applicationsToClean: string[] = []
  const sessionsToClean: string[] = []

  beforeAll(() => {
    console.log(`[TEST RUN] Starting tests with suffix ${suffix} and creator ID ${newCreatorId}`)
  })

  afterAll(async () => {
    console.log('[TEST RUN] Cleaning up test database entries...')

    // 1. Delete bookings
    if (bookingsToClean.length > 0) {
      const { error } = await supabase.from('bookings').delete().in('id', bookingsToClean)
      if (error) console.error('Cleanup bookings error:', error)
    }

    // 2. Delete applications
    if (applicationsToClean.length > 0) {
      const { error } = await supabase.from('applications').delete().in('id', applicationsToClean)
      if (error) console.error('Cleanup applications error:', error)
    }

    // 3. Delete sessions
    if (sessionsToClean.length > 0) {
      const { error } = await supabase.from('sessions').delete().in('token', sessionsToClean)
      if (error) console.error('Cleanup sessions error:', error)
    }

    // 4. Delete profiles and users
    if (usersToClean.length > 0) {
      const { error: profileError } = await supabase.from('profiles').delete().in('user_id', usersToClean)
      if (profileError) console.error('Cleanup profiles error:', profileError)
      
      const { error: userError } = await supabase.from('users').delete().in('id', usersToClean)
      if (userError) console.error('Cleanup users error:', userError)
    }
    
    console.log('[TEST RUN] Cleanup completed successfully.')
  }, 30000)

  describe('1. Client Site Authentication', () => {
    test('Should create and persist customer profile and session', async () => {
      // Create user
      const customerProfile = createDefaultProfile(customerEmail, customerName, 'TC')
      customerProfile.role = 'CUSTOMER'
      
      await dbService.saveUser(customerEmail, customerProfile)
      
      // Fetch user from DB
      const userFromDb = await dbService.getUserByEmail(customerEmail)
      expect(userFromDb).toBeDefined()
      expect(userFromDb?.name).toBe(customerName)
      expect(userFromDb?.email).toBe(customerEmail)
      expect(userFromDb?.role).toBe('CUSTOMER')

      // Record userID for cleanup
      const { data: rawUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle()
      if (rawUser) {
        usersToClean.push(rawUser.id)
      }

      // Establish session
      await dbService.createSession(sessionToken, customerEmail)
      sessionsToClean.push(sessionToken)

      // Verify session persistence
      const activeSessionUser = await dbService.getUserBySessionToken(sessionToken)
      expect(activeSessionUser).toBeDefined()
      expect(activeSessionUser?.email).toBe(customerEmail)

      // Test session deletion (sign out)
      await dbService.deleteSession(sessionToken)
      const clearedSessionUser = await dbService.getUserBySessionToken(sessionToken)
      expect(clearedSessionUser).toBeUndefined()
    }, 30000)
  })

  describe('2. Booking Flow & Price Resolution', () => {
    test('Should record booking and resolve correct package prices', async () => {
      // Ensure customer exists
      const customerProfile = createDefaultProfile(customerEmail, customerName, 'TC')
      await dbService.saveUser(customerEmail, customerProfile)

      // Record customer ID for cleanup if it's not already added
      const { data: rawUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle()
      if (rawUser && !usersToClean.includes(rawUser.id)) {
        usersToClean.push(rawUser.id)
      }

      // Setup bookings
      const bookingA = {
        bookingId: bookingIdA,
        userId: customerEmail,
        customerName,
        email: customerEmail,
        phone: '1234567890',
        photographyCategory: 'CINEMATIC REELS (9:16)',
        selectedPackage: 'CINEMATIC REELS (9:16)',
        eventDate: '2026-07-15',
        eventTime: '10:00 AM - 12:00 PM',
        location: 'Studio A, Bangalore, Karnataka - 560001',
        specialRequirements: 'None',
        bookingStatus: 'Pending' as const,
        paymentStatus: 'Pending' as const,
        price: 0, // Should be resolved
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const bookingB = {
        ...bookingA,
        bookingId: bookingIdB,
        photographyCategory: 'INFLUENCER BRANDING',
        selectedPackage: 'INFLUENCER BRANDING',
      }

      const bookingC = {
        ...bookingA,
        bookingId: bookingIdC,
        photographyCategory: 'LUXURY AUTOMOTIVE',
        selectedPackage: 'LUXURY AUTOMOTIVE',
      }

      const bookingD = {
        ...bookingA,
        bookingId: bookingIdD,
        photographyCategory: 'NON EXISTENT PACKAGE',
        selectedPackage: 'NON EXISTENT PACKAGE',
      }

      // Save bookings
      await dbService.saveBooking(bookingA)
      bookingsToClean.push(bookingIdA)

      await dbService.saveBooking(bookingB)
      bookingsToClean.push(bookingIdB)

      await dbService.saveBooking(bookingC)
      bookingsToClean.push(bookingIdC)

      await dbService.saveBooking(bookingD)
      bookingsToClean.push(bookingIdD)

      // Verify price resolution
      const savedA = await dbService.getBooking(bookingIdA)
      expect(savedA).toBeDefined()
      expect(savedA?.price).toBe(2000) // CINEMATIC REELS (9:16) price

      const savedB = await dbService.getBooking(bookingIdB)
      expect(savedB).toBeDefined()
      expect(savedB?.price).toBe(6000) // INFLUENCER BRANDING price

      const savedC = await dbService.getBooking(bookingIdC)
      expect(savedC).toBeDefined()
      expect(savedC?.price).toBe(10000) // LUXURY AUTOMOTIVE price

      const savedD = await dbService.getBooking(bookingIdD)
      expect(savedD).toBeDefined()
      expect(savedD?.price).toBe(6000) // Default fallback price
    }, 30000)
  })

  describe('3. Admin Portal Actions', () => {
    test('Should verify admin details, dashboard stats, application approval, and creator assignment', async () => {
      // 1. Admin login verification
      const admin = await dbService.getUserByEmail('admin@mrcinematic.com')
      expect(admin).toBeDefined()
      expect(admin?.role).toBe('ADMIN')

      // Verify admin passcode matches cinema2026
      const { data: rawAdmin } = await supabase
        .from('users')
        .select('password')
        .eq('email', 'admin@mrcinematic.com')
        .maybeSingle()
      expect(rawAdmin?.password).toBe('cinema2026')

      // 2. Verify Stats query resolves without crashing
      const allUsers = await dbService.getAllUsers()
      const allBookings = await dbService.getAllBookings()
      const allPayments = await dbService.getAllPayments()
      
      expect(Array.isArray(allUsers)).toBe(true)
      expect(Array.isArray(allBookings)).toBe(true)
      expect(Array.isArray(allPayments)).toBe(true)

      // 3. Submit application
      const { error: appError } = await supabase.from('applications').insert({
        id: appId,
        name: creatorName,
        email: creatorEmail,
        job_title: 'Cinematic Editor',
        portfolio_url: 'https://portfolio.com/test',
        resume_url: 'https://resume.com/test',
        cover_letter: 'I make beautiful reels.',
        status: 'APPLIED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      expect(appError).toBeNull()
      applicationsToClean.push(appId)

      // Update application status
      const { error: updateAppError } = await supabase
        .from('applications')
        .update({ status: 'UNDER_REVIEW' })
        .eq('id', appId)
      expect(updateAppError).toBeNull()

      // 4. Hire creator (creates creator user/profile with valid UUID)
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: newCreatorId,
          email: creatorEmail.toLowerCase(),
          name: creatorName,
          role: 'CREATOR',
          password: 'crew2026password'
        })
      expect(userError).toBeNull()
      usersToClean.push(newCreatorId)

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: newCreatorId,
          specialty: 'Cinematic Editor',
          availability: 'AVAILABLE',
          hourly_rate: 2500
        })
      expect(profileError).toBeNull()

      // Approve application
      const { error: approveAppError } = await supabase
        .from('applications')
        .update({ status: 'APPROVED' })
        .eq('id', appId)
      expect(approveAppError).toBeNull()

      // 5. Assign Crew to Booking A
      const { error: assignError } = await supabase
        .from('bookings')
        .update({ 
          assigned_creator_id: newCreatorId,
          status: 'Confirmed'
        })
        .eq('id', bookingIdA)
      expect(assignError).toBeNull()

      // Verify assignment
      const assignedBooking = await dbService.getBooking(bookingIdA)
      expect(assignedBooking?.bookingStatus).toBe('Confirmed')
    }, 30000)
  })

  describe('4. Crew Portal Actions', () => {
    test('Should query crew portal logins, dispatches, and update duty status', async () => {
      // 1. Crew login check
      const crewFromDb = await dbService.getUserByEmail(creatorEmail)
      expect(crewFromDb).toBeDefined()
      expect(crewFromDb?.role).toBe('CREATOR')

      // 2. Dispatches check
      // Find the booking assigned to this crew member
      const { data: myBookings, error: dispatchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('assigned_creator_id', newCreatorId)
      expect(dispatchError).toBeNull()
      expect(myBookings).toBeDefined()
      expect(myBookings?.length).toBeGreaterThan(0)
      expect(myBookings?.[0].id).toBe(bookingIdA)

      // 3. Update duty/availability status to ON SHOOT
      const { error: statusError } = await supabase
        .from('profiles')
        .update({ availability: 'ON SHOOT' })
        .eq('user_id', newCreatorId)
      expect(statusError).toBeNull()

      // Verify update
      const { data: updatedProfile, error: getProfileError } = await supabase
        .from('profiles')
        .select('availability')
        .eq('user_id', newCreatorId)
        .maybeSingle()
      expect(getProfileError).toBeNull()
      expect(updatedProfile?.availability).toBe('ON SHOOT')
    }, 30000)
  })
})
