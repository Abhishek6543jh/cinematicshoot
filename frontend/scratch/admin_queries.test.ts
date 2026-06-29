import { test, expect } from 'vitest'
import { supabase } from '../src/server/db.server'

test('Verify all admin portal queries', async () => {
  // 1. Bookings
  const { data: bookingsData, error: bookingsError } = await supabase
    .from('bookings')
    .select('*, creator:users!bookings_assigned_creator_id_fkey(name)')
    .order('created_at', { ascending: false })
  console.log('Bookings Count:', bookingsData?.length, 'Error:', bookingsError)
  expect(bookingsError).toBeNull()

  // 2. Creators
  const { data: creatorsData, error: creatorsError } = await supabase
    .from('users')
    .select('*, profiles(*)')
    .eq('role', 'CREATOR')
  console.log('Creators Count:', creatorsData?.length, 'Error:', creatorsError)
  expect(creatorsError).toBeNull()

  // 3. Applications
  const { data: appsData, error: appsError } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })
  console.log('Applications Count:', appsData?.length, 'Error:', appsError)
  expect(appsError).toBeNull()

  // 4. Settings
  const { data: hiringSetting, error: hiringError } = await supabase
    .from('website_settings')
    .select('value')
    .eq('key', 'career_hiring')
    .maybeSingle()
  console.log('Settings:', hiringSetting, 'Error:', hiringError)
  expect(hiringError).toBeNull()

  // 5. Packages
  const { data: pricesData, error: pricesError } = await supabase
    .from('packages')
    .select('name, price')
  console.log('Packages Count:', pricesData?.length, 'Error:', pricesError)
  expect(pricesError).toBeNull()

  // 6. Reels
  const { data: reelsData, error: reelsError } = await supabase
    .from('reels')
    .select('*')
    .order('id', { ascending: true })
  console.log('Reels Count:', reelsData?.length, 'Error:', reelsError)
  expect(reelsError).toBeNull()
})
