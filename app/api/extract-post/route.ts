import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { accessToken, postUrl } = await request.json()

    // Extract post ID from URL
    const postIdMatch = postUrl.match(/\/posts\/(\d+)/) || postUrl.match(/\/(\d+)\/?$/) || postUrl.match(/story_fbid=(\d+)/)
    const postId = postIdMatch ? postIdMatch[1] : null

    if (!postId) {
      return NextResponse.json({ error: 'لم يتم العثور على Post ID' }, { status: 400 })
    }

    // Call Facebook Graph API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postId}?fields=id,from{id,name}&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.error?.message || 'فشل في الحصول على البيانات' }, { status: 400 })
    }

    const data = await response.json()

    return NextResponse.json({
      postId: data.id,
      pageId: data.from?.id,
      pageName: data.from?.name,
    })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
