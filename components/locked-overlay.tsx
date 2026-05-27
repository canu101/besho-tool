"use client"

interface LockedOverlayProps {
  reason: string
  clientIp: string | null
  expiresAt?: string
}

export default function LockedOverlay({ reason, clientIp, expiresAt }: LockedOverlayProps) {
  const getMessage = () => {
    switch (reason) {
      case 'no_subscription':
        return 'لا يوجد اشتراك نشط'
      case 'ip_not_allowed':
        return 'عنوان IP غير مصرح به'
      case 'expired':
        return 'انتهى الاشتراك'
      case 'error':
        return 'حدث خطأ في التحقق'
      default:
        return 'الوصول مرفوض'
    }
  }

  const getIcon = () => {
    switch (reason) {
      case 'expired':
        return (
          <svg className="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'ip_not_allowed':
        return (
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      default:
        return (
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      
      {/* Small centered card */}
      <div className="relative w-[320px] bg-gradient-to-br from-[#1a1a1a] via-[#1f1f1f] to-[#141414] rounded-xl border border-[#333] shadow-2xl p-6">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div className="p-3 rounded-full bg-[#252525] border border-[#333]">
            {getIcon()}
          </div>

          {/* Message */}
          <div>
            <h2 className="text-lg font-bold text-white mb-1">
              {getMessage()}
            </h2>
            <p className="text-sm text-gray-400">
              تواصل مع الدعم للمساعدة
            </p>
          </div>

          {/* Details */}
          <div className="w-full space-y-2 text-xs">
            {clientIp && (
              <div className="flex justify-between items-center py-2 px-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                <span className="text-gray-500">IP</span>
                <span className="text-gray-300 font-mono">{clientIp}</span>
              </div>
            )}
            {expiresAt && (
              <div className="flex justify-between items-center py-2 px-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                <span className="text-gray-500">انتهى في</span>
                <span className="text-gray-300 font-mono text-xs">
                  {new Date(expiresAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
            )}
          </div>

          {/* Contact Button */}
          <a
            href="https://t.me/support"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20"
          >
            تواصل معنا
          </a>
        </div>
      </div>
    </div>
  )
}
