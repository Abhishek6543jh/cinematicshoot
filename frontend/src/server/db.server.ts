import * as fs from 'fs'
import * as path from 'path'
import { PrismaClient, Role as PrismaRole, BookingStatus as PrismaBookingStatus, PaymentStatus as PrismaPaymentStatus, PackageType as PrismaPackageType } from '@prisma/client'
import Redis from 'ioredis'

// -------------------------------------------------------------
// Database Connection & Failover Configuration
// -------------------------------------------------------------

const prisma = new PrismaClient()
let prismaChecked = false
let prismaAvailable = false

async function isPrismaAvailable(): Promise<boolean> {
  if (prismaChecked) return prismaAvailable
  
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl || dbUrl.startsWith('file:')) {
    prismaChecked = true
    prismaAvailable = false
    console.warn('[PRISMA] Database URL is unset or SQLite. Falling back to local JSON store.');
    return false
  }

  try {
    // Try to run a quick query to test connection
    await prisma.$queryRaw`SELECT 1`
    prismaAvailable = true
    console.log('[PRISMA] Connected successfully to PostgreSQL database');
  } catch (err: any) {
    console.warn(`[PRISMA] Connection failed: ${err.message}. Falling back to local JSON store.`);
    prismaAvailable = false
  }
  
  prismaChecked = true
  return prismaAvailable
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 0,
  connectTimeout: 500
})
// Prevent unhandled error crashes
redis.on('error', () => {})

let redisChecked = false
let redisAvailable = false

async function isRedisAvailable(): Promise<boolean> {
  if (redisChecked) return redisAvailable
  
  if (!process.env.REDIS_URL) {
    redisChecked = true
    redisAvailable = false
    console.warn('[REDIS] REDIS_URL environment variable is not defined. Falling back to memory cache.');
    return false
  }

  try {
    await redis.connect()
    redisAvailable = true
    console.log('[REDIS] Connected successfully to Redis Cache');
  } catch (err: any) {
    console.warn(`[REDIS] Connection failed: ${err.message}. Falling back to memory cache.`);
    redisAvailable = false
  }
  
  redisChecked = true
  return redisAvailable
}

// -------------------------------------------------------------
// Local JSON Store Definitions & Fallback Logic
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

interface DatabaseSchema {
  users: Record<string, UserProfile>
  sessions: Record<string, string>
  otps: Record<string, { code: string; expiresAt: number }>
  bookings: Record<string, Booking>
  packages: Record<string, Package>
  payments: Record<string, Payment>
  reviews: Record<string, Review>
  notifications: Record<string, Notification[]>
}

const isFsAvailable = (() => {
  try {
    return typeof fs !== 'undefined' && fs.existsSync !== undefined && typeof fs.existsSync === 'function';
  } catch {
    return false;
  }
})();

const DB_FILE_PATH = (() => {
  try {
    return path.resolve(process.cwd(), 'src/server/db.json')
  } catch {
    return 'src/server/db.json'
  }
})()

let localDb: DatabaseSchema = {
  users: {},
  sessions: {},
  otps: {},
  bookings: {},
  packages: {},
  payments: {},
  reviews: {},
  notifications: {}
}

function loadLocalDb() {
  if (!isFsAvailable) {
    // Seed memory DB if it's empty
    if (Object.keys(localDb.users).length === 0) {
      seedDefaultDb()
    }
    return
  }
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileData = fs.readFileSync(DB_FILE_PATH, 'utf-8')
      localDb = JSON.parse(fileData)
      
      if (!localDb.bookings) localDb.bookings = {}
      if (!localDb.packages) localDb.packages = {}
      if (!localDb.payments) localDb.payments = {}
      if (!localDb.reviews) localDb.reviews = {}
      if (!localDb.notifications) localDb.notifications = {}
    } else {
      seedDefaultDb()
    }
  } catch (e) {
    console.error('Error loading local JSON DB:', e)
  }
}

function saveLocalDb() {
  if (!isFsAvailable) {
    return
  }
  try {
    const dir = path.dirname(DB_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(localDb, null, 2), 'utf-8')
  } catch (e) {
    console.error('Error saving local JSON DB:', e)
  }
}


function seedDefaultDb() {
  const defaultAdmin = 'admin@mrcinematic.com'
  localDb.users[defaultAdmin] = {
    name: 'ADMINISTRATOR',
    email: defaultAdmin,
    phone: '+91 99999 99999',
    bio: 'Systems Director.',
    avatar: 'AD',
    dob: '1990-01-01',
    gender: 'MALE',
    address: 'HQ Server Room, Film City',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    memberSince: 'June 2026',
    emailNotifications: true,
    smsNotifications: true,
    password: 'cinema2026',
    indexPortfolio: false,
    shareAnalytics: true
  }

  const defaultUser = 'alex.maverick@gmail.com'
  localDb.users[defaultUser] = {
    name: 'ALEX MAVERICK',
    email: defaultUser,
    phone: '+91 98765 43210',
    bio: 'Premium creative DP.',
    avatar: 'AM',
    dob: '1998-05-12',
    gender: 'MALE',
    address: '123 Film City Road, Goregaon East',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    memberSince: 'June 2026',
    emailNotifications: true,
    smsNotifications: false,
    password: 'password123',
    indexPortfolio: true,
    shareAnalytics: false
  }

  const defaultPackages: Package[] = [
    {
      packageId: 'PKG-001',
      packageName: 'INFLUENCER BRANDING',
      category: 'INFLUENCER BRANDING',
      description: 'Prestige aesthetic assets tailored for digital figures.',
      price: 6000,
      duration: '4 Hours',
      includedServices: ['Custom Grid Curation', 'Creative Styling Profiles'],
      activeStatus: true
    },
    {
      packageId: 'PKG-002',
      packageName: 'LUXURY AUTOMOTIVE',
      category: 'LUXURY AUTOMOTIVE',
      description: 'High-octane commercial capture of luxury vehicles.',
      price: 10000,
      duration: '6 Hours',
      includedServices: ['Rig-Shot Motion Tracking', 'Location Scouting'],
      activeStatus: true
    }
  ]

  for (const pkg of defaultPackages) {
    localDb.packages[pkg.packageId] = pkg
  }

  const mockBookings: Booking[] = [
    {
      bookingId: 'MCS-B-4821',
      userId: defaultUser,
      customerName: 'ALEX MAVERICK',
      email: defaultUser,
      phone: '9876543210',
      photographyCategory: 'INFLUENCER BRANDING',
      selectedPackage: 'INFLUENCER BRANDING',
      eventDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      eventTime: 'Evening (4 PM - 7 PM)',
      location: 'Bandra Penthouse, Carter Road, Mumbai',
      specialRequirements: 'Sunset penthouse photoshoot with luxury styling.',
      bookingStatus: 'Confirmed',
      paymentStatus: 'Success',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]

  for (const b of mockBookings) {
    localDb.bookings[b.bookingId] = b
  }

  saveLocalDb()
}

loadLocalDb()

// -------------------------------------------------------------
// Database Mappers
// -------------------------------------------------------------

function mapUserToProfile(user: any): UserProfile {
  return {
    name: user.name,
    email: user.email,
    phone: user.phoneNumber || '',
    bio: user.profile?.bio || '',
    avatar: user.profile?.avatarUrl || '',
    dob: user.profile?.dob || '',
    gender: user.profile?.gender || '',
    address: user.profile?.address || '',
    city: user.profile?.city || '',
    state: user.profile?.state || '',
    country: user.profile?.country || '',
    memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'June 2026',
    emailNotifications: user.profile?.emailNotifications ?? true,
    smsNotifications: user.profile?.smsNotifications ?? false,
    password: user.passwordHash || undefined,
    indexPortfolio: user.profile?.indexPortfolio ?? true,
    shareAnalytics: user.profile?.shareAnalytics ?? false,
  }
}

function mapDbBookingToBooking(b: any): Booking {
  let status: Booking['bookingStatus'] = 'Pending'
  if (b.status === 'CONFIRMED') status = 'Confirmed'
  else if (b.status === 'COMPLETED') status = 'Completed'
  else if (b.status === 'CANCELLED') status = 'Cancelled'

  let payStatus: Booking['paymentStatus'] = 'Pending'
  if (b.paymentStatus === 'SUCCESS') payStatus = 'Success'
  else if (b.paymentStatus === 'FAILED') payStatus = 'Failed'
  else if (b.paymentStatus === 'REFUNDED') payStatus = 'Refunded'

  return {
    bookingId: b.id,
    userId: b.customerEmail || b.customer?.email || '',
    customerName: b.customerName || '',
    email: b.customerEmail || '',
    phone: b.customerPhone || '',
    photographyCategory: b.photographyCategory || '',
    selectedPackage: b.selectedPackage || '',
    eventDate: b.eventDate || '',
    eventTime: b.eventTime || '',
    location: b.location || '',
    specialRequirements: b.specialRequirements || '',
    bookingStatus: status,
    paymentStatus: payStatus,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }
}

function mapDbPackageToPackage(p: any): Package {
  let services: string[] = []
  try {
    if (p.includedServices) {
      services = JSON.parse(p.includedServices)
    }
  } catch (e) {
    console.error('Error parsing includedServices:', e)
  }

  return {
    packageId: p.id,
    packageName: p.name,
    category: p.category || '',
    description: p.description,
    price: p.price,
    duration: `${p.durationMinutes / 60} Hours`,
    includedServices: services,
    activeStatus: p.isActive,
  }
}

function mapDbPaymentToPayment(p: any): Payment {
  let payStatus: Payment['paymentStatus'] = 'Pending'
  if (p.status === 'SUCCESS') payStatus = 'Success'
  else if (p.status === 'FAILED') payStatus = 'Failed'
  else if (p.status === 'REFUNDED') payStatus = 'Refunded'

  return {
    paymentId: p.id,
    bookingId: p.bookingId,
    userId: p.booking?.customerEmail || '',
    amount: p.amount,
    paymentMethod: p.provider,
    transactionId: p.transactionId,
    paymentStatus: payStatus,
    paidAt: p.updatedAt.toISOString(),
  }
}

export function createDefaultProfile(email: string, name?: string, avatar?: string, phone?: string): UserProfile {
  const isPhone = !email || email === 'phone.auth@mrcinematic.com'
  const defaultName = name || (isPhone ? `User ${phone}` : email.split('@')[0].toUpperCase())
  const defaultAvatar = avatar || defaultName.slice(0, 2).toUpperCase()

  return {
    name: defaultName,
    email: isPhone ? 'phone.auth@mrcinematic.com' : email,
    phone: phone || (isPhone ? phone || '' : '+91 98765 43210'),
    bio: 'Premium creative creator.',
    avatar: defaultAvatar,
    dob: '1998-05-12',
    gender: 'MALE',
    address: '123 Film City Road, Goregaon East',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    memberSince: 'June 2026',
    emailNotifications: true,
    smsNotifications: false,
    password: 'password123',
    indexPortfolio: true,
    shareAnalytics: false
  }
}

// -------------------------------------------------------------
// Database Service Interface with Failover
// -------------------------------------------------------------

export const dbService = {
  // Users
  async getUserByEmail(email: string): Promise<UserProfile | undefined> {
    if (await isPrismaAvailable()) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { profile: true }
      })
      if (!user) return undefined
      return mapUserToProfile(user)
    } else {
      loadLocalDb()
      return localDb.users[email.toLowerCase()]
    }
  },

  async getUserByPhone(phone: string): Promise<UserProfile | undefined> {
    if (await isPrismaAvailable()) {
      const cleanPhone = phone.replace(/\s+/g, '')
      const user = await prisma.user.findFirst({
        where: {
          phoneNumber: {
            contains: cleanPhone
          }
        },
        include: { profile: true }
      })
      if (!user) return undefined
      return mapUserToProfile(user)
    } else {
      loadLocalDb()
      return Object.values(localDb.users).find(
        (u) => u.phone && u.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, '')
      )
    }
  },

  async saveUser(email: string, profile: UserProfile): Promise<void> {
    if (await isPrismaAvailable()) {
      const role = email.toLowerCase() === 'admin@mrcinematic.com' ? PrismaRole.ADMIN : PrismaRole.CUSTOMER
      await prisma.user.upsert({
        where: { email: email.toLowerCase() },
        update: {
          name: profile.name,
          phoneNumber: profile.phone || null,
          passwordHash: profile.password || null,
          role,
          profile: {
            upsert: {
              create: {
                bio: profile.bio,
                avatarUrl: profile.avatar,
                dob: profile.dob,
                gender: profile.gender,
                address: profile.address,
                city: profile.city,
                state: profile.state,
                country: profile.country,
                indexPortfolio: profile.indexPortfolio ?? true,
                shareAnalytics: profile.shareAnalytics ?? false,
                emailNotifications: profile.emailNotifications ?? true,
                smsNotifications: profile.smsNotifications ?? false,
              },
              update: {
                bio: profile.bio,
                avatarUrl: profile.avatar,
                dob: profile.dob,
                gender: profile.gender,
                address: profile.address,
                city: profile.city,
                state: profile.state,
                country: profile.country,
                indexPortfolio: profile.indexPortfolio ?? true,
                shareAnalytics: profile.shareAnalytics ?? false,
                emailNotifications: profile.emailNotifications ?? true,
                smsNotifications: profile.smsNotifications ?? false,
              }
            }
          }
        },
        create: {
          email: email.toLowerCase(),
          name: profile.name,
          phoneNumber: profile.phone || null,
          passwordHash: profile.password || null,
          role,
          profile: {
            create: {
              bio: profile.bio,
              avatarUrl: profile.avatar,
              dob: profile.dob,
              gender: profile.gender,
              address: profile.address,
              city: profile.city,
              state: profile.state,
              country: profile.country,
              indexPortfolio: profile.indexPortfolio ?? true,
              shareAnalytics: profile.shareAnalytics ?? false,
              emailNotifications: profile.emailNotifications ?? true,
              smsNotifications: profile.smsNotifications ?? false,
            }
          }
        }
      })
    } else {
      localDb.users[email.toLowerCase()] = profile
      saveLocalDb()
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    if (await isPrismaAvailable()) {
      const users = await prisma.user.findMany({
        include: { profile: true }
      })
      return users.map(mapUserToProfile)
    } else {
      loadLocalDb()
      return Object.values(localDb.users)
    }
  },

  // Sessions in Redis / Local Fallback
  async createSession(token: string, email: string): Promise<void> {
    if (await isRedisAvailable()) {
      await redis.set(`session:${token}`, email.toLowerCase(), 'EX', 60 * 60 * 24 * 7)
    } else {
      localDb.sessions[token] = email.toLowerCase()
      saveLocalDb()
    }
  },

  async getUserBySessionToken(token: string): Promise<UserProfile | undefined> {
    if (await isRedisAvailable()) {
      const email = await redis.get(`session:${token}`)
      if (!email) return undefined
      return this.getUserByEmail(email)
    } else {
      loadLocalDb()
      const email = localDb.sessions[token]
      if (!email) return undefined
      return this.getUserByEmail(email)
    }
  },

  async deleteSession(token: string): Promise<void> {
    if (await isRedisAvailable()) {
      await redis.del(`session:${token}`)
    } else {
      delete localDb.sessions[token]
      saveLocalDb()
    }
  },

  // OTPs in Redis / Local Fallback
  async storeOtp(phone: string, code: string): Promise<void> {
    if (await isRedisAvailable()) {
      await redis.set(`otp:${phone}`, code, 'EX', 300)
    } else {
      localDb.otps[phone] = {
        code,
        expiresAt: Date.now() + 5 * 60 * 1000
      }
      saveLocalDb()
    }
  },

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    if (await isRedisAvailable()) {
      const otp = await redis.get(`otp:${phone}`)
      if (!otp || otp !== code) return false
      await redis.del(`otp:${phone}`)
      return true
    } else {
      loadLocalDb()
      const otp = localDb.otps[phone]
      if (!otp) return false
      if (Date.now() > otp.expiresAt) {
        delete localDb.otps[phone]
        saveLocalDb()
        return false
      }
      const isValid = otp.code === code
      if (isValid) {
        delete localDb.otps[phone]
        saveLocalDb()
      }
      return isValid
    }
  },

  // Bookings
  async getBooking(bookingId: string): Promise<Booking | undefined> {
    if (await isPrismaAvailable()) {
      const b = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { customer: true }
      })
      if (!b) return undefined
      return mapDbBookingToBooking(b)
    } else {
      loadLocalDb()
      return localDb.bookings[bookingId]
    }
  },

  async saveBooking(booking: Booking): Promise<void> {
    if (await isPrismaAvailable()) {
      let customer = await prisma.user.findUnique({
        where: { email: booking.userId.toLowerCase() }
      })
      if (!customer) {
        customer = await prisma.user.create({
          data: {
            email: booking.userId.toLowerCase(),
            name: booking.customerName,
            phoneNumber: booking.phone
          }
        })
      }

      let status = PrismaBookingStatus.PENDING
      if (booking.bookingStatus === 'Confirmed') status = PrismaBookingStatus.CONFIRMED
      else if (booking.bookingStatus === 'Completed') status = PrismaBookingStatus.COMPLETED
      else if (booking.bookingStatus === 'Cancelled') status = PrismaBookingStatus.CANCELLED

      let payStatus = PrismaPaymentStatus.PENDING
      if (booking.paymentStatus === 'Success') payStatus = PrismaPaymentStatus.SUCCESS
      else if (booking.paymentStatus === 'Failed') payStatus = PrismaPaymentStatus.FAILED
      else if (booking.paymentStatus === 'Refunded') payStatus = PrismaPaymentStatus.REFUNDED

      const pkg = await prisma.package.findFirst({
        where: { name: booking.selectedPackage }
      })
      const price = pkg ? pkg.price : 6000

      await prisma.booking.upsert({
        where: { id: booking.bookingId },
        update: {
          status,
          paymentStatus: payStatus,
          customerName: booking.customerName,
          customerEmail: booking.email,
          customerPhone: booking.phone,
          photographyCategory: booking.photographyCategory,
          selectedPackage: booking.selectedPackage,
          eventDate: booking.eventDate,
          eventTime: booking.eventTime,
          location: booking.location,
          specialRequirements: booking.specialRequirements,
        },
        create: {
          id: booking.bookingId,
          customerId: customer.id,
          status,
          paymentStatus: payStatus,
          totalPrice: price,
          customerName: booking.customerName,
          customerEmail: booking.email,
          customerPhone: booking.phone,
          photographyCategory: booking.photographyCategory,
          selectedPackage: booking.selectedPackage,
          eventDate: booking.eventDate,
          eventTime: booking.eventTime,
          location: booking.location,
          specialRequirements: booking.specialRequirements,
        }
      })
    } else {
      localDb.bookings[booking.bookingId] = booking
      saveLocalDb()
    }
  },

  async getBookingsForUser(userId: string): Promise<Booking[]> {
    if (await isPrismaAvailable()) {
      const bookings = await prisma.booking.findMany({
        where: {
          OR: [
            { customerEmail: userId.toLowerCase() },
            { customer: { email: userId.toLowerCase() } }
          ]
        },
        include: { customer: true }
      })
      return bookings.map(mapDbBookingToBooking)
    } else {
      loadLocalDb()
      return Object.values(localDb.bookings).filter(
        (b) => b.userId.toLowerCase() === userId.toLowerCase()
      )
    }
  },

  async getAllBookings(): Promise<Booking[]> {
    if (await isPrismaAvailable()) {
      const bookings = await prisma.booking.findMany({
        include: { customer: true }
      })
      return bookings.map(mapDbBookingToBooking)
    } else {
      loadLocalDb()
      return Object.values(localDb.bookings)
    }
  },

  // Packages
  async getPackage(packageId: string): Promise<Package | undefined> {
    if (await isPrismaAvailable()) {
      const p = await prisma.package.findUnique({
        where: { id: packageId }
      })
      if (!p) return undefined
      return mapDbPackageToPackage(p)
    } else {
      loadLocalDb()
      return localDb.packages[packageId]
    }
  },

  async savePackage(pkg: Package): Promise<void> {
    if (await isPrismaAvailable()) {
      const durationMin = parseInt(pkg.duration) * 60 || 240
      await prisma.package.upsert({
        where: { id: pkg.packageId },
        update: {
          name: pkg.packageName,
          category: pkg.category,
          description: pkg.description,
          price: pkg.price,
          durationMinutes: durationMin,
          includedServices: JSON.stringify(pkg.includedServices),
          isActive: pkg.activeStatus
        },
        create: {
          id: pkg.packageId,
          photographerId: 'admin-system-id',
          name: pkg.packageName,
          category: pkg.category,
          description: pkg.description,
          price: pkg.price,
          durationMinutes: durationMin,
          includedServices: JSON.stringify(pkg.includedServices),
          isActive: pkg.activeStatus
        }
      })
    } else {
      localDb.packages[pkg.packageId] = pkg
      saveLocalDb()
    }
  },

  async deletePackage(packageId: string): Promise<void> {
    if (await isPrismaAvailable()) {
      await prisma.package.delete({
        where: { id: packageId }
      })
    } else {
      delete localDb.packages[packageId]
      saveLocalDb()
    }
  },

  async getAllPackages(): Promise<Package[]> {
    if (await isPrismaAvailable()) {
      const packages = await prisma.package.findMany()
      return packages.map(mapDbPackageToPackage)
    } else {
      loadLocalDb()
      return Object.values(localDb.packages)
    }
  },

  // Payments
  async getPayment(paymentId: string): Promise<Payment | undefined> {
    if (await isPrismaAvailable()) {
      const p = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { booking: { include: { customer: true } } }
      })
      if (!p) return undefined
      return mapDbPaymentToPayment(p)
    } else {
      loadLocalDb()
      return localDb.payments[paymentId]
    }
  },

  async savePayment(payment: Payment): Promise<void> {
    if (await isPrismaAvailable()) {
      let status = PrismaPaymentStatus.PENDING
      if (payment.paymentStatus === 'Success') status = PrismaPaymentStatus.SUCCESS
      else if (payment.paymentStatus === 'Failed') status = PrismaPaymentStatus.FAILED
      else if (payment.paymentStatus === 'Refunded') status = PrismaPaymentStatus.REFUNDED

      await prisma.payment.upsert({
        where: { id: payment.paymentId },
        update: {
          status,
          amount: payment.amount,
          provider: payment.paymentMethod,
          transactionId: payment.transactionId
        },
        create: {
          id: payment.paymentId,
          bookingId: payment.bookingId,
          status,
          amount: payment.amount,
          provider: payment.paymentMethod,
          transactionId: payment.transactionId
        }
      })
    } else {
      localDb.payments[payment.paymentId] = payment
      saveLocalDb()
    }
  },

  async getPaymentsForUser(userId: string): Promise<Payment[]> {
    if (await isPrismaAvailable()) {
      const payments = await prisma.payment.findMany({
        where: {
          booking: {
            customerEmail: userId.toLowerCase()
          }
        },
        include: { booking: { include: { customer: true } } }
      })
      return payments.map(mapDbPaymentToPayment)
    } else {
      loadLocalDb()
      return Object.values(localDb.payments).filter(
        (p) => p.userId.toLowerCase() === userId.toLowerCase()
      )
    }
  },

  async getAllPayments(): Promise<Payment[]> {
    if (await isPrismaAvailable()) {
      const payments = await prisma.payment.findMany({
        include: { booking: { include: { customer: true } } }
      })
      return payments.map(mapDbPaymentToPayment)
    } else {
      loadLocalDb()
      return Object.values(localDb.payments)
    }
  },

  // Reviews
  async saveReview(review: Review): Promise<void> {
    if (await isPrismaAvailable()) {
      await prisma.review.upsert({
        where: { bookingId: review.bookingId },
        update: {
          rating: review.rating,
          comment: review.reviewText
        },
        create: {
          id: review.reviewId,
          bookingId: review.bookingId,
          rating: review.rating,
          comment: review.reviewText
        }
      })
    } else {
      localDb.reviews[review.reviewId] = review
      saveLocalDb()
    }
  },

  async getReviewsForBooking(bookingId: string): Promise<Review[]> {
    if (await isPrismaAvailable()) {
      const r = await prisma.review.findUnique({
        where: { bookingId },
        include: { booking: { include: { customer: true } } }
      })
      if (!r) return []
      return [{
        reviewId: r.id,
        bookingId: r.bookingId,
        userId: r.booking.customerEmail || '',
        rating: r.rating,
        reviewText: r.comment || '',
        createdAt: r.createdAt.toISOString()
      }]
    } else {
      loadLocalDb()
      return Object.values(localDb.reviews).filter((r) => r.bookingId === bookingId)
    }
  },

  async getAllReviews(): Promise<Review[]> {
    if (await isPrismaAvailable()) {
      const reviews = await prisma.review.findMany({
        include: { booking: { include: { customer: true } } }
      })
      return reviews.map((r) => ({
        reviewId: r.id,
        bookingId: r.bookingId,
        userId: r.booking?.customerEmail || '',
        rating: r.rating,
        reviewText: r.comment || '',
        createdAt: r.createdAt.toISOString()
      }))
    } else {
      loadLocalDb()
      return Object.values(localDb.reviews)
    }
  },

  // Notifications in Redis / Local Fallback
  async addNotification(userId: string, title: string, message: string): Promise<void> {
    const emailKey = userId.toLowerCase()
    
    const notification: Notification = {
      notificationId: `NOTIF-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      userId: emailKey,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    }
    
    if (await isRedisAvailable()) {
      const notifKey = `notif:${emailKey}`
      const listStr = await redis.get(notifKey)
      let list: Notification[] = []
      if (listStr) {
        list = JSON.parse(listStr)
      }
      list.unshift(notification)
      await redis.set(notifKey, JSON.stringify(list))
    } else {
      loadLocalDb()
      if (!localDb.notifications[emailKey]) {
        localDb.notifications[emailKey] = []
      }
      localDb.notifications[emailKey].unshift(notification)
      saveLocalDb()
    }
  },

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    if (await isRedisAvailable()) {
      const notifKey = `notif:${userId.toLowerCase()}`
      const listStr = await redis.get(notifKey)
      if (!listStr) return []
      return JSON.parse(listStr)
    } else {
      loadLocalDb()
      return localDb.notifications[userId.toLowerCase()] || []
    }
  },

  async markNotificationsAsRead(userId: string): Promise<void> {
    const emailKey = userId.toLowerCase()
    if (await isRedisAvailable()) {
      const notifKey = `notif:${emailKey}`
      const listStr = await redis.get(notifKey)
      if (listStr) {
        const list: Notification[] = JSON.parse(listStr)
        const updatedList = list.map((n) => ({ ...n, read: true }))
        await redis.set(notifKey, JSON.stringify(updatedList))
      }
    } else {
      loadLocalDb()
      const list = localDb.notifications[emailKey]
      if (list) {
        localDb.notifications[emailKey] = list.map((n) => ({ ...n, read: true }))
        saveLocalDb()
      }
    }
  }
}
