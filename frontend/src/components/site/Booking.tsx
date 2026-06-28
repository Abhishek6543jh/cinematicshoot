import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { MapPin, Phone, Globe, Calendar, Clock, Send, Lock } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  authGetCurrentUser, 
  packageListAll, 
  bookingCreate, 
  initiatePayment, 
  verifyPayment 
} from '../../server/auth.functions'
import AuthModal from './AuthModal'

// Indian States and their Top Commercial/Industrial Districts
const statesData: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kakinada', 'Rajamahendravaram', 'Kadapa', 'Tirupati', 'Anantapur', 'Eluru', 'Vizianagaram'],
  'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Ziro', 'Pasighat', 'Tezu'],
  'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur', 'Nagaon'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
  'Chhattisgarh': ['Raipur', 'Bilaspur', 'Durg', 'Bhilai', 'Korba', 'Jagdalpur'],
  'Goa': ['North Goa', 'South Goa', 'Panaji', 'Margao', 'Vasco da Gama'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Hazaribagh'],
  'Karnataka': ['Bengaluru Urban', 'Mysuru', 'Hubli-Dharwad', 'Mangaluru', 'Belagavi', 'Davangere', 'Ballari', 'Kalaburagi', 'Udupi'],
  'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Kannur', 'Kottayam'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Navi Mumbai', 'Kolhapur'],
  'Manipur': ['Imphal West', 'Imphal East', 'Thoubal', 'Churachandpur'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai'],
  'Nagaland': ['Dimapur', 'Kohima', 'Mokokchung'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur', 'Berhampur'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Mohali', 'Bathinda'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar'],
  'Sikkim': ['Gangtok', 'Namchi', 'Geyzing'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tiruppur', 'Erode', 'Vellore', 'Thanjavur'],
  'Telangana': ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ranga Reddy', 'Medchal-Malkajgiri', 'Sangareddy'],
  'Tripura': ['Agartala', 'Dharmanagar', 'Udaipur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Bareilly', 'Aligarh'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Haldwani', 'Roorkee', 'Nainital', 'Mussoorie'],
  'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Asansol', 'Siliguri', 'Durgapur', 'Kharagpur'],
  'Delhi': ['New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Dwarka'],
  'Jammu & Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua'],
  'Ladakh': ['Leh', 'Kargil'],
  'Puducherry': ['Puducherry City', 'Karaikal', 'Mahe', 'Yanam']
}

const countryCodes = [
  { code: '+91', name: 'IN', flag: '🇮🇳' },
  { code: '+1', name: 'US', flag: '🇺🇸' },
  { code: '+44', name: 'GB', flag: '🇬🇧' },
  { code: '+971', name: 'AE', flag: '🇦🇪' },
  { code: '+61', name: 'AU', flag: '🇦🇺' },
]

const callTimes = [
  'Morning (9 AM - 12 PM)',
  'Afternoon (12 PM - 4 PM)',
  'Evening (4 PM - 7 PM)',
  'Anytime',
]

export default function Booking() {
  const queryClient = useQueryClient()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [checkoutData, setCheckoutData] = useState<{ paymentId: string; bookingId: string; amount: number } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('UPI / GPay / PhonePe')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Fetch current user auth state
  const { data: user } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authGetCurrentUser()
  })

  // Fetch active packages
  const { data: packages = [] } = useQuery({
    queryKey: ['packages', 'all'],
    queryFn: () => packageListAll()
  })
  
  const activePackages = packages.filter(p => p.activeStatus)

  const [formData, setFormData] = useState({
    name: '',
    phoneCode: '+91',
    phoneNumber: '',
    email: '',
    service: '',
    eventDetails: '',
    state: '',
    district: '',
    area: '',
    pincode: '',
    location: '',
    date: '',
    preferredTime: 'Anytime',
  })

  // Autofill form when user is authenticated
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phoneNumber: user.phone ? user.phone.replace('+91', '').trim() : prev.phoneNumber,
      }))
    }
  }, [user])

  // Select default package once activePackages are loaded
  useEffect(() => {
    if (activePackages.length > 0 && !formData.service) {
      setFormData(prev => ({
        ...prev,
        service: activePackages[0].packageName
      }))
    }
  }, [activePackages])

  const [turnstileChecking, setTurnstileChecking] = useState(false)
  const [turnstileVerified, setTurnstileVerified] = useState(false)

  const handleVerifyTurnstile = () => {
    if (turnstileVerified || turnstileChecking) return
    setTurnstileChecking(true)
    setTimeout(() => {
      setTurnstileChecking(false)
      setTurnstileVerified(true)
      toast.success('SECURITY VERIFICATION COMPLETE.')
    }, 850)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === 'state') {
        updated.district = ''
      }
      return updated
    })
  }

  const createBookingMutation = useMutation({
    mutationFn: (args: {
      customerName: string
      email: string
      phone: string
      photographyCategory: string
      selectedPackage: string
      eventDate: string
      eventTime: string
      location: string
      specialRequirements: string
    }) => bookingCreate({ data: args }),
    onSuccess: (newBooking) => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      
      const selectedPkg = activePackages.find(p => p.packageName === formData.service)
      const amount = selectedPkg ? selectedPkg.price : 2000
      
      // Initiate Payment flow
      initiatePaymentMutation.mutate({
        bookingId: newBooking.bookingId,
        amount,
        paymentMethod: 'UPI / Cards'
      })
    },
    onError: (err: any) => {
      toast.error(`BOOKING FAILED: ${err.message || 'Error occurred while saving enquiry.'}`)
    }
  })

  const initiatePaymentMutation = useMutation({
    mutationFn: (args: { bookingId: string; amount: number; paymentMethod: string }) => initiatePayment({ data: args }),
    onSuccess: (payment) => {
      setCheckoutData({
        paymentId: payment.paymentId,
        bookingId: payment.bookingId,
        amount: payment.amount
      })
    },
    onError: (err: any) => {
      toast.error(`PAYMENT INITIATION FAILED: ${err.message || 'Unable to start checkout.'}`)
    }
  })

  const verifyPaymentMutation = useMutation({
    mutationFn: (args: { paymentId: string; status: 'Success' | 'Failed' }) => verifyPayment({ data: args }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      setCheckoutData(null)
      if (data.paymentStatus === 'Success') {
        toast.success('ENQUIRY CONFIRMED: Payment simulated successfully!', {
          description: `Shoot status is active. Your Booking ID: ${data.bookingId}`,
        })
        
        // Reset form
        setFormData({
          name: user?.name || '',
          phoneCode: '+91',
          phoneNumber: user?.phone ? user.phone.replace('+91', '').trim() : '',
          email: user?.email || '',
          service: activePackages[0]?.packageName || '',
          eventDetails: '',
          state: '',
          district: '',
          area: '',
          pincode: '',
          location: '',
          date: '',
          preferredTime: 'Anytime',
        })
        setTurnstileVerified(false)
      } else {
        toast.error('Payment Simulation Failed: Complete this payment in your Profile dashboard.')
      }
    },
    onError: (err: any) => {
      toast.error(`VERIFICATION ERROR: ${err.message || 'Failed to process payment status.'}`)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Detailed validation mapping Indian locale rules
    if (!formData.name.trim()) return toast.error('VALIDATION ERROR: PLEASE ENTER YOUR FULL NAME.')
    if (!formData.phoneNumber.trim()) return toast.error('VALIDATION ERROR: PLEASE ENTER YOUR CONTACT NUMBER.')
    
    // Indian Phone Validation: 10 digits starting with 6-9
    if (formData.phoneCode === '+91' && !/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      return toast.error('VALIDATION ERROR: PLEASE ENTER A VALID 10-DIGIT INDIAN PHONE NUMBER.')
    }
    
    if (!formData.email.trim()) return toast.error('VALIDATION ERROR: PLEASE ENTER YOUR EMAIL ADDRESS.')
    if (!formData.state) return toast.error('VALIDATION ERROR: PLEASE SELECT YOUR STATE.')
    if (!formData.district) return toast.error('VALIDATION ERROR: PLEASE SELECT YOUR DISTRICT.')
    if (!formData.area.trim()) return toast.error('VALIDATION ERROR: PLEASE ENTER THE AREA NAME.')
    
    // Indian Pincode Validation: exactly 6 digits
    if (!/^[1-9]\d{5}$/.test(formData.pincode)) {
      return toast.error('VALIDATION ERROR: PLEASE ENTER A VALID 6-DIGIT INDIAN PINCODE.')
    }
    
    if (!formData.location.trim()) return toast.error('VALIDATION ERROR: PLEASE ENTER THE LOCATION / VENUE DETAILS.')
    if (!formData.date) return toast.error('VALIDATION ERROR: PLEASE SELECT THE DATE OF EVENT.')
    if (!formData.eventDetails.trim()) return toast.error('VALIDATION ERROR: PLEASE DESCRIBE YOUR EVENT DETAILS.')
    if (!turnstileVerified) return toast.error('SECURITY ERROR: PLEASE COMPLETE THE CLOUDFLARE TURNSTILE VERIFICATION.')

    const selectedPkg = activePackages.find(p => p.packageName === formData.service)
    if (!selectedPkg) {
      return toast.error('ERROR: SELECTED PACKAGE NOT FOUND.')
    }

    const fullLocation = `${formData.location}, ${formData.area}, ${formData.district}, ${formData.state} - ${formData.pincode}`
    const fullPhone = `${formData.phoneCode} ${formData.phoneNumber}`

    createBookingMutation.mutate({
      customerName: formData.name,
      email: formData.email,
      phone: fullPhone,
      photographyCategory: selectedPkg.category,
      selectedPackage: selectedPkg.packageName,
      eventDate: formData.date,
      eventTime: formData.preferredTime,
      location: fullLocation,
      specialRequirements: formData.eventDetails
    })
  }

  const availableDistricts = formData.state ? (statesData[formData.state] || []) : []
  const selectedPkg = activePackages.find(p => p.packageName === formData.service)

  if (!user) {
    return (
      <section id="booking" className="relative z-10 py-20 md:py-32 bg-black border-b border-white/5 reveal-on-scroll scroll-mt-24 text-silver">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-xs font-black tracking-[0.3em] text-neon uppercase mb-3 animate-pulse">
              SECURE BOOKING SYSTEM
            </h2>
            <h3 className="font-heading text-xl md:text-2xl font-black text-silver max-w-xl mx-auto uppercase leading-relaxed tracking-wider">
              Authentication Required
            </h3>
          </div>

          <div className="glass-neon p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-neon/10 border border-neon/25 flex items-center justify-center mx-auto text-neon animate-pulse">
              <Lock size={28} />
            </div>
            <p className="font-sans text-neutral-400 text-sm max-w-md mx-auto leading-relaxed">
              To request a custom production shoot or buy package bookings, please sign in or register a creator profile.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-8 py-3.5 bg-neon text-black font-heading text-xs font-black tracking-[0.2em] uppercase hover:neon-glow transition-all duration-300 cursor-pointer border-none"
            >
              Sign In / Sign Up
            </button>
          </div>
        </div>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onLoginSuccess={(u) => {
            setIsAuthModalOpen(false)
            toast.success(`AUTHENTICATED AS ${u.name.toUpperCase()}`)
          }}
        />
      </section>
    )
  }

  const isSubmitting = createBookingMutation.isPending || initiatePaymentMutation.isPending

  return (
    <section id="booking" className="relative z-10 py-20 md:py-32 bg-black border-b border-white/5 reveal-on-scroll scroll-mt-24 text-silver">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-xs font-black tracking-[0.3em] text-neon uppercase mb-3 animate-pulse">
            TELL US ABOUT YOUR EVENT
          </h2>
          <h3 className="font-heading text-xl md:text-2xl font-black text-silver max-w-xl mx-auto uppercase leading-relaxed tracking-wider">
            Pick a package and share a few details — our team will reach out shortly.
          </h3>
        </div>

        {/* Luxury Glass Form Container */}
        <div className="glass-neon p-8 md:p-12 relative overflow-hidden">
          {/* Scanning laser animation on submit */}
          {isSubmitting && (
            <div className="absolute top-0 left-0 w-full h-[2px] bg-neon animate-scan z-30" />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="font-heading text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Shaik Davood Umar"
                className="bg-black border border-white/10 p-3.5 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300"
                required
              />
            </div>

            {/* Contact Number with flag/country selection */}
            <div className="flex flex-col gap-2">
              <label className="font-heading text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                Contact Number *
              </label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                <div className="col-span-1 md:col-span-2">
                  <select
                    name="phoneCode"
                    value={formData.phoneCode}
                    onChange={handleChange}
                    className="w-full bg-black border border-white/10 p-3.5 text-sm font-heading tracking-widest text-silver focus:border-neon focus:outline-none transition-colors duration-300"
                  >
                    {countryCodes.map((cc) => (
                      <option key={`${cc.name}-${cc.code}`} value={cc.code} className="bg-neutral-900 text-silver font-heading text-xs">
                        {cc.flag} {cc.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3 md:col-span-4 relative flex items-center">
                  <Phone size={14} className="absolute left-3.5 text-neutral-500" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-black border border-white/10 p-3.5 pl-10 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-2">
              <label className="font-heading text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. shoot@mrcinematic.com"
                className="bg-black border border-white/10 p-3.5 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300"
                required
              />
            </div>

            {/* Package Type Selection */}
            <div className="flex flex-col gap-2">
              <label className="font-heading text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                Package Type *
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="bg-black border border-white/10 p-3.5 text-sm font-heading tracking-widest text-neon focus:border-neon focus:outline-none transition-colors duration-300"
              >
                {activePackages.map((svc) => (
                  <option key={svc.packageId} value={svc.packageName} className="bg-neutral-900 text-silver font-heading text-xs">
                    {svc.packageName} — ₹{svc.price.toLocaleString()}
                  </option>
                ))}
              </select>
              {selectedPkg && (
                <div className="mt-2 text-xs text-neutral-400 bg-neutral-950 p-3 border border-white/5 rounded">
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block mb-1">INCLUDED SERVICES:</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {selectedPkg.includedServices.map((inc, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-neutral-300">
                        <span className="w-1 h-1 bg-neon rounded-full" /> {inc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Event Details Textarea */}
            <div className="flex flex-col gap-2">
              <label className="font-heading text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                Event Details *
              </label>
              <textarea
                name="eventDetails"
                value={formData.eventDetails}
                onChange={handleChange}
                placeholder="Describe your event details, schedule expectation, custom demands..."
                rows={4}
                className="bg-black border border-white/10 p-3.5 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 resize-none"
                required
              />
            </div>

            {/* State & District cascade row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* State */}
              <div className="flex flex-col gap-2">
                <label className="font-heading text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  State *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="bg-black border border-white/10 p-3.5 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300"
                  required
                >
                  <option value="">Select state</option>
                  {Object.keys(statesData).map((st) => (
                    <option key={st} value={st} className="bg-neutral-900 text-silver font-sans text-xs">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="flex flex-col gap-2">
                <label className="font-heading text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  District *
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!formData.state}
                  className="bg-black border border-white/10 p-3.5 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">
                    {formData.state ? 'Select district' : 'Select a state first'}
                  </option>
                  {availableDistricts.map((ds) => (
                    <option key={ds} value={ds} className="bg-neutral-900 text-silver font-sans text-xs">
                      {ds}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Area, Pincode & Location details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Area */}
              <div className="flex flex-col gap-2">
                <label className="font-heading text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  Area / Neighborhood *
                </label>
                <div className="relative flex items-center">
                  <Globe size={14} className="absolute left-3.5 text-neutral-500" />
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. Madhapur / Bandra West"
                    className="w-full bg-black border border-white/10 p-3.5 pl-10 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300"
                    required
                  />
                </div>
              </div>

              {/* Pincode with verification details */}
              <div className="flex flex-col gap-2">
                <label className="font-heading text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 500081"
                  maxLength={6}
                  className="bg-black border border-white/10 p-3.5 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 font-mono"
                  required
                />
              </div>

            </div>

            {/* Location details & Preferred Time to Call */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Location Venue Details */}
              <div className="flex flex-col gap-2">
                <label className="font-heading text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  Venue Details / Landmark *
                </label>
                <div className="relative flex items-center">
                  <MapPin size={14} className="absolute left-3.5 text-neutral-500" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Novotel Studio Hall / Near Metro"
                    className="w-full bg-black border border-white/10 p-3.5 pl-10 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300"
                    required
                  />
                </div>
              </div>

              {/* Call timing details */}
              <div className="flex flex-col gap-2">
                <label className="font-heading text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  Preferred Time to Call
                </label>
                <div className="relative flex items-center">
                  <Clock size={14} className="absolute left-3.5 text-neutral-500" />
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="w-full bg-black border border-white/10 p-3.5 pl-10 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300"
                  >
                    {callTimes.map((time) => (
                      <option key={time} value={time} className="bg-neutral-900 text-silver font-sans text-xs">
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Date of Event */}
            <div className="flex flex-col gap-2">
              <label className="font-heading text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                Date of Event *
              </label>
              <div className="relative flex items-center">
                <Calendar size={14} className="absolute left-3.5 text-neutral-500" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 p-3.5 pl-10 text-sm font-sans tracking-wide text-silver focus:border-neon focus:outline-none transition-colors duration-300 [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            {/* Interactive Cloudflare Turnstile Mockup */}
            <div className="flex justify-center py-4">
              <div className="w-[300px] h-[65px] bg-[#121212] border border-[#222] rounded flex items-center justify-between px-4 select-none">
                <div className="flex items-center gap-3">
                  {turnstileChecking ? (
                    <div className="w-5 h-5 border-2 border-[#ff7a00] border-t-transparent rounded-full animate-spin" />
                  ) : turnstileVerified ? (
                    <div className="w-5 h-5 rounded-full bg-[#15b045] flex items-center justify-center text-white shadow-[0_0_10px_rgba(21,176,69,0.3)]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyTurnstile}
                      className="w-5 h-5 border border-white/20 hover:border-neon/60 bg-[#1e1e1e] rounded cursor-pointer transition-colors shadow-inner"
                      aria-label="Click to verify you are a human"
                    />
                  )}
                  <span className="text-[11px] font-sans font-medium text-silver/80">
                    {turnstileChecking ? 'Verifying...' : turnstileVerified ? 'Success!' : 'Verify you are human'}
                  </span>
                </div>
                
                <div className="flex flex-col items-end justify-center">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#f38020]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
                    </svg>
                    <span className="text-[9px] font-heading font-black tracking-widest text-[#f38020]">CLOUDFLARE</span>
                  </div>
                  <div className="text-[7px] font-sans text-neutral-500 flex gap-1 mt-0.5">
                    <a href="#" className="hover:underline">Privacy</a>
                    <span>•</span>
                    <a href="#" className="hover:underline">Help</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-neon text-black font-heading text-xs font-black tracking-[0.2em] uppercase hover:neon-glow-lg transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  'SUBMITTING ENQUIRY...'
                ) : (
                  <>
                    Submit Enquiry
                    <Send size={12} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Checkout Modal Dialog */}
      {checkoutData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 animate-fade-in text-silver">
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

      {/* Auth Modal for Unauthenticated Booking attempts */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={(u) => {
          setIsAuthModalOpen(false)
          toast.success(`Welcome back, ${u.name.toUpperCase()}!`)
        }}
      />
    </section>
  )
}
