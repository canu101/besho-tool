import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { accessToken, accountId, pageId } = await request.json()

    // Verify the access token with Meta Graph API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify account access
    const accountResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}?access_token=${accessToken}`
    )

    if (!accountResponse.ok) {
      return NextResponse.json({ error: 'Invalid account' }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account verified successfully' 
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
