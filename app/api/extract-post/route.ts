import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    // Extract post ID from Facebook URL
    const postIdMatch = url.match(/\/posts\/(\d+)|pfbid(\w+)|\/(\d+)\/?$/)
    const postId = postIdMatch ? postIdMatch[1] || postIdMatch[2] || postIdMatch[3] : null

    if (!postId) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // In production, you would fetch the actual post data from Facebook Graph API
    // For now, return mock data
    return NextResponse.json({
      postId: postId,
      imageUrl: '',
      caption: 'تم استخراج البوست بنجاح',
    })
  } catch (error) {
    console.error('Extract error:', error)
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
  }
}
