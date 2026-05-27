'use client'

import { useState } from 'react'
import { Key, AlertTriangle, Clock, Loader2 } from 'lucide-react'

interface LoginFormProps {
  reason: string
}

export default function LoginForm({ reason }: LoginFormProps) {
  const [licenseKey, setLicenseKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getMessage = () => {
    switch (reason) {
      case 'no_license':
        return { title: 'مرحباً بك', description: 'أدخل مفتاح الترخيص للدخول' }
      case 'invalid_license':
        return { title: 'مفتاح غير صالح', description: 'مفتاح الترخيص غير صحيح أو تم تعليقه' }
      case 'expired':
        return { title: 'انتهى الاشتراك', description: 'يرجى تجديد الاشتراك للمتابعة' }
      default:
        return { title: 'تسجيل الدخول', description: 'أدخل مفتاح الترخيص' }
    }
  }

  const { title, description } = getMessage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: licenseKey.trim().toUpperCase() })
      })

      const data = await res.json()

      if (data.success) {
        window.location.reload()
      } else {
        setError(data.message || 'مفتاح الترخيص غير صحيح')
      }
    } catch {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/70" />
      
      {/* Login modal */}
      <div className="relative w-[360px] bg-gradient-to-b from-[#1a1a1a] to-[#141414] rounded-2xl border border-[#333] shadow-2xl p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/30">
            {reason === 'expired' ? (
              <Clock className="w-8 h-8 text-yellow-400" />
            ) : reason === 'invalid_license' ? (
              <AlertTriangle className="w-8 h-8 text-red-400" />
            ) : (
              <Key className="w-8 h-8 text-blue-400" />
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
          <p className="text-sm text-gray-400">{description}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">مفتاح الترخيص</label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="XXXX-XXXX-XXXX"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-white text-center font-mono tracking-wider placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !licenseKey.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              'دخول'
            )}
          </button>
        </form>

        {/* Contact info */}
        <div className="mt-6 pt-4 border-t border-[#333]">
          <p className="text-xs text-center text-gray-500">
            للحصول على مفتاح ترخيص
          </p>
          <p className="text-sm text-center text-blue-400 mt-1">
            تواصل مع الإدارة
          </p>
        </div>
      </div>
    </div>
  )
}
