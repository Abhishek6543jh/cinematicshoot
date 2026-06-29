import { test, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ahvhbuincvxhewxdkekr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodmhidWluY3Z4aGV3eGRrZWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzA3NTksImV4cCI6MjA5NjMwNjc1OX0.FivI4jEYzjg0XRgIfAJ1udeEsoxWsTNSev7cUJ8fgLM'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

test('Verify admin portal join queries', async () => {
  const { data: bookingsData, error: bookingsError } = await supabase
    .from('bookings')
    .select('*, creator:users!bookings_assigned_creator_id_fkey(name)')
    .order('created_at', { ascending: false })
  
  console.log('Bookings Count:', bookingsData?.length)
  if (bookingsError) {
    console.error('Bookings Error:', bookingsError)
  }
  expect(bookingsError).toBeNull()
})
