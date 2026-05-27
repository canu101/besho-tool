import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { licenseKey } = await request.json()

    if (!licenseKey) {
      return NextResponse.json({ success: false, message: 'مفتاح الترخيص مطلوب' })
    }

    const supabase = await createClient()
    
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('license_key', licenseKey.trim().toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !subscription) {
      return NextResponse.json({ success: false, message: 'مفتاح الترخيص غير صحيح' })
    }

    // Check expiration
    const now = new Date()
    const expiresAt = new Date(subscription.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json({ success: false, message: 'انتهت صلاحية الاشتراك' })
    }

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('license_key', licenseKey.trim().toUpperCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    return NextResponse.json({ 
      success: true, 
      userName: subscription.user_name,
      expiresAt: subscription.expires_at
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ في النظام' })
  }
}
