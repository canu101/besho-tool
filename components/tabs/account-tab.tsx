'use client'

import { useState } from 'react'
import { Eye, EyeOff, Check, Copy, ExternalLink } from 'lucide-react'

export default function AccountTab() {
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    accessToken: '',
    accountId: '',
    pageId: '',
  })
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = async () => {
    if (!formData.accessToken || !formData.accountId) return
    
    setIsVerifying(true)
    setVerificationStatus('idle')
    
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setVerificationStatus('success')
      } else {
        setVerificationStatus('error')
      }
    } catch {
      setVerificationStatus('error')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Access Token */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Access Token
        </label>
        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={formData.accessToken}
            onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
            placeholder="أدخل Access Token الخاص بك"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={() => setShowToken(!showToken)}
              className="p-2 hover:bg-[#333] rounded-lg transition-colors"
            >
              {showToken ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
            </button>
            <button
              onClick={() => handleCopy(formData.accessToken)}
              className="p-2 hover:bg-[#333] rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
        <a
          href="https://developers.facebook.com/tools/explorer/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          احصل على Token من Graph API Explorer
        </a>
      </div>

      {/* Account ID */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Account ID
        </label>
        <input
          type="text"
          value={formData.accountId}
          onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
          placeholder="act_XXXXXXXXXX"
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
        />
      </div>

      {/* Page ID */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Page ID
        </label>
        <input
          type="text"
          value={formData.pageId}
          onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
          placeholder="XXXXXXXXXX"
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
        />
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={isVerifying || !formData.accessToken || !formData.accountId}
        className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
          isVerifying || !formData.accessToken || !formData.accountId
            ? 'bg-[#333] text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20'
        }`}
      >
        {isVerifying ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            جاري التحقق...
          </span>
        ) : (
          'التحقق من الحساب'
        )}
      </button>

      {/* Status Message */}
      {verificationStatus !== 'idle' && (
        <div
          className={`p-4 rounded-xl border ${
            verificationStatus === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <p className="text-sm text-center">
            {verificationStatus === 'success'
              ? 'تم التحقق من الحساب بنجاح'
              : 'فشل التحقق من الحساب - تأكد من البيانات'}
          </p>
        </div>
      )}
    </div>
  )
}
