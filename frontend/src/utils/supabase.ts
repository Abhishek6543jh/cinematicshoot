import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ahvhbuincvxhewxdkekr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodmhidWluY3Z4aGV3eGRrZWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzA3NTksImV4cCI6MjA5NjMwNjc1OX0.FivI4jEYzjg0XRgIfAJ1udeEsoxWsTNSev7cUJ8fgLM'

const isServer = typeof window === 'undefined'

class DummyWebSocket {
  constructor() {}
  addEventListener() {}
  removeEventListener() {}
  close() {}
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: !isServer,
  },
  realtime: isServer
    ? {
        transport: DummyWebSocket as any,
      }
    : undefined,
})
