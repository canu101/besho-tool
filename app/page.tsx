import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import ToolContainer from '@/components/tool-container'
import LockedOverlay from '@/components/locked-overlay'

interface Subscription {
  id: string
  user_email: string
  user_name: string | null
  allowed_ip: string | null
  starts_at: string
  expires_at: string
  is_active: boolean
}

async function getClientIP() {
  const headersList = await headers()
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  if (realIp) {
    return realIp.trim()
  }
  return null
}

async function checkSubscription(clientIp: string | null): Promise<{
  isValid: boolean
  subscription: Subscription | null
  reason: string
}> {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // In development without Supabase, allow access
    return { isValid: true, subscription: null, reason: 'no_db' }
  }

  try {
    const supabase = await createClient()
    
    // Get subscription by IP
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('is_active', true)
    
    if (error || !subscriptions || subscriptions.length === 0) {
      return { isValid: false, subscription: null, reason: 'no_subscription' }
    }

    // Find subscription matching current IP
    const subscription = subscriptions.find((sub: Subscription) => {
      if (!sub.allowed_ip) return false
      return sub.allowed_ip === clientIp
    })

    if (!subscription) {
      return { isValid: false, subscription: null, reason: 'ip_not_allowed' }
    }

    // Check if subscription is expired
    const now = new Date()
    const expiresAt = new Date(subscription.expires_at)
    
    if (now > expiresAt) {
      return { isValid: false, subscription, reason: 'expired' }
    }

    return { isValid: true, subscription, reason: 'valid' }
  } catch (error) {
    console.error('Subscription check error:', error)
    // On error, deny access for security
    return { isValid: false, subscription: null, reason: 'error' }
  }
}

export default async function Home() {
  const clientIp = await getClientIP()
  const { isValid, subscription, reason } = await checkSubscription(clientIp)

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="relative">
        <ToolContainer />
        {!isValid && (
          <LockedOverlay 
            reason={reason} 
            clientIp={clientIp}
            expiresAt={subscription?.expires_at}
          />
        )}
      </div>
    </main>
  )
}
