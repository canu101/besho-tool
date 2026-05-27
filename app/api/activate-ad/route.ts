import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { adId } = await request.json()

    if (!adId) {
      return NextResponse.json({ error: 'Ad ID required' }, { status: 400 })
    }

    // In production, you would activate the ad via Facebook Marketing API
    return NextResponse.json({ 
      success: true,
      message: 'Ad activated successfully'
    })
  } catch (error) {
    console.error('Activate ad error:', error)
    return NextResponse.json({ error: 'Failed to activate ad' }, { status: 500 })
  }
}
