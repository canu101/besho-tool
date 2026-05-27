import ToolContainer from '@/components/tool-container'
import LoginForm from '@/components/login-form'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

async function checkSession(): Promise<{
  isValid: boolean
  userName: string | null
  expiresAt: string | null
  reason: string
}> {
  const cookieStore = await cookies()
  const licenseKey = cookieStore.get('license_key')?.value

  if (!licenseKey) {
    return { isValid: false, userName: null, expiresAt: null, reason: 'no_license' }
  }

  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { isValid: true, userName: 'مستخدم', expiresAt: null, reason: 'no_db' }
  }

  try {
    const supabase = await createClient()
    
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('license_key', licenseKey)
      .eq('is_active', true)
      .single()
    
    if (error || !subscription) {
      return { isValid: false, userName: null, expiresAt: null, reason: 'invalid_license' }
    }

    // Check if subscription is expired
    const now = new Date()
    const expiresAt = new Date(subscription.expires_at)
    
    if (now > expiresAt) {
      return { isValid: false, userName: subscription.user_name, expiresAt: subscription.expires_at, reason: 'expired' }
    }

    return { 
      isValid: true, 
      userName: subscription.user_name, 
      expiresAt: subscription.expires_at,
      reason: 'valid' 
    }
  } catch (error) {
    console.error('Session check error:', error)
    return { isValid: false, userName: null, expiresAt: null, reason: 'error' }
  }
}

export default async function Home() {
  const { isValid, userName, expiresAt, reason } = await checkSession()

  if (!isValid) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="relative">
          <ToolContainer disabled />
          <LoginForm reason={reason} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <ToolContainer userName={userName} expiresAt={expiresAt} />
    </main>
  )
}
