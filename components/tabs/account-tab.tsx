"use client"

import { useState } from 'react'

export default function AccountTab() {
  const [accessToken, setAccessToken] = useState('')
  const [postUrl, setPostUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    postId?: string
    pageId?: string
    pageName?: string
    error?: string
  } | null>(null)

  const handleExtract = async () => {
    if (!accessToken || !postUrl) return
    
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/extract-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, postUrl }),
      })
      const data = await response.json()
      setResult(data)
    } catch {
      setResult({ error: 'فشل في الاتصال' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Access Token Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Access Token
        </label>
        <textarea
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="أدخل Access Token هنا..."
          className="w-full h-24 px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all text-sm font-mono"
          dir="ltr"
        />
      </div>

      {/* Post URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          رابط البوست
        </label>
        <input
          type="text"
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
          placeholder="https://www.facebook.com/..."
          className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
          dir="ltr"
        />
      </div>

      {/* Extract Button */}
      <button
        onClick={handleExtract}
        disabled={isLoading || !accessToken || !postUrl}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:shadow-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            جاري الاستخراج...
          </span>
        ) : (
          'استخراج البيانات'
        )}
      </button>

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-xl border ${result.error ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
          {result.error ? (
            <p className="text-red-400 text-sm">{result.error}</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-[#2a2a2a]">
                <span className="text-gray-400">Post ID</span>
                <span className="text-gray-200 font-mono">{result.postId}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#2a2a2a]">
                <span className="text-gray-400">Page ID</span>
                <span className="text-gray-200 font-mono">{result.pageId}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-gray-400">اسم الصفحة</span>
                <span className="text-gray-200">{result.pageName}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
