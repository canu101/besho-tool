'use client'

import { Lock, AlertTriangle, Clock, Shield } from 'lucide-react'

interface LockedOverlayProps {
  reason: string
  clientIp: string | null
  expiresAt?: string
}

export default function LockedOverlay({ reason, clientIp, expiresAt }: LockedOverlayProps) {
  const getMessage = () => {
    switch (reason) {
      case 'no_subscription':
        return {
          title: 'لا يوجد اشتراك',
          description: 'لم يتم العثور على اشتراك نشط لهذا الجهاز',
          icon: Lock
        }
      case 'ip_not_allowed':
        return {
          title: 'IP غير مصرح',
          description: `عنوان IP الخاص بك (${clientIp}) غير مسموح به`,
          icon: Shield
        }
      case 'expired':
        return {
          title: 'انتهى الاشتراك',
          description: expiresAt 
            ? `انتهى اشتراكك في ${new Date(expiresAt).toLocaleDateString('ar-EG')}`
            : 'انتهت صلاحية اشتراكك',
          icon: Clock
        }
      case 'error':
        return {
          title: 'خطأ في النظام',
          description: 'حدث خطأ أثناء التحقق من الاشتراك',
          icon: AlertTriangle
        }
      default:
        return {
          title: 'الوصول مرفوض',
          description: 'ليس لديك صلاحية الوصول لهذه الأداة',
          icon: Lock
        }
    }
  }

  const { title, description, icon: Icon } = getMessage()

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/60" />
      
      {/* Centered small modal */}
      <div className="relative w-[320px] bg-gradient-to-b from-[#1a1a1a] to-[#141414] rounded-2xl border border-[#333] shadow-2xl p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center border border-red-500/30">
            <Icon className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </div>

        {/* Contact info */}
        <div className="mt-6 pt-4 border-t border-[#333]">
          <p className="text-xs text-center text-gray-500">
            للحصول على اشتراك أو تجديد الاشتراك
          </p>
          <p className="text-sm text-center text-blue-400 mt-1">
            تواصل مع الإدارة
          </p>
        </div>

        {/* IP display */}
        {clientIp && (
          <div className="mt-4 px-3 py-2 bg-[#0a0a0a] rounded-lg border border-[#262626]">
            <p className="text-xs text-gray-500 text-center">
              IP: <span className="text-gray-400 font-mono">{clientIp}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
