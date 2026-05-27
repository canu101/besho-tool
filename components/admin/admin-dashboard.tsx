'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Pause, Play, RefreshCw, Calendar, Key, Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  id: string
  user_email: string
  user_name: string | null
  license_key: string | null
  starts_at: string
  expires_at: string
  is_active: boolean
  created_at: string
}

function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments = []
  for (let i = 0; i < 4; i++) {
    let segment = ''
    for (let j = 0; j < 4; j++) {
      segment += chars[Math.floor(Math.random() * chars.length)]
    }
    segments.push(segment)
  }
  return segments.join('-')
}

export default function AdminDashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [newSub, setNewSub] = useState({
    user_email: '',
    user_name: '',
    license_key: generateLicenseKey(),
    duration_days: '30',
  })

  const supabase = createClient()

  const fetchSubscriptions = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setSubscriptions(data)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const handleAddSubscription = async () => {
    if (!newSub.user_email || !newSub.license_key) return

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + parseInt(newSub.duration_days))

    try {
      const { error } = await supabase.from('subscriptions').insert({
        user_email: newSub.user_email,
        user_name: newSub.user_name || null,
        license_key: newSub.license_key,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })

      if (!error) {
        setShowAddForm(false)
        setNewSub({ 
          user_email: '', 
          user_name: '', 
          license_key: generateLicenseKey(), 
          duration_days: '30' 
        })
        fetchSubscriptions()
      }
    } catch (error) {
      console.error('Error adding subscription:', error)
    }
  }

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      await supabase
        .from('subscriptions')
        .update({ is_active: !currentState })
        .eq('id', id)
      fetchSubscriptions()
    } catch (error) {
      console.error('Error toggling subscription:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاشتراك؟')) return
    
    try {
      await supabase.from('subscriptions').delete().eq('id', id)
      fetchSubscriptions()
    } catch (error) {
      console.error('Error deleting subscription:', error)
    }
  }

  const copyToClipboard = async (key: string) => {
    await navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
          <p className="text-sm text-gray-500">إدارة الاشتراكات والمستخدمين</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSubscriptions}
            className="p-2 bg-[#1a1a1a] border border-[#333] rounded-lg hover:bg-[#222] transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة اشتراك
          </button>
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#333] p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">إضافة اشتراك جديد</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={newSub.user_email}
                  onChange={(e) => setNewSub({ ...newSub, user_email: e.target.value })}
                  className="w-full px-4 py-2 bg-[#141414] border border-[#333] rounded-lg text-white"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">الاسم</label>
                <input
                  type="text"
                  value={newSub.user_name}
                  onChange={(e) => setNewSub({ ...newSub, user_name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#141414] border border-[#333] rounded-lg text-white"
                  placeholder="اسم المستخدم"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">مفتاح الترخيص *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSub.license_key}
                    onChange={(e) => setNewSub({ ...newSub, license_key: e.target.value.toUpperCase() })}
                    className="flex-1 px-4 py-2 bg-[#141414] border border-[#333] rounded-lg text-white font-mono text-center tracking-wider"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    dir="ltr"
                  />
                  <button
                    onClick={() => setNewSub({ ...newSub, license_key: generateLicenseKey() })}
                    className="px-3 py-2 bg-[#333] hover:bg-[#444] rounded-lg transition-colors"
                    title="توليد مفتاح جديد"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">مدة الاشتراك (أيام)</label>
                <input
                  type="number"
                  value={newSub.duration_days}
                  onChange={(e) => setNewSub({ ...newSub, duration_days: e.target.value })}
                  className="w-full px-4 py-2 bg-[#141414] border border-[#333] rounded-lg text-white"
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddSubscription}
                disabled={!newSub.user_email || !newSub.license_key}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-[#333] disabled:text-gray-500 transition-colors"
              >
                إضافة
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-[#333] text-gray-300 rounded-lg hover:bg-[#444] transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{subscriptions.length}</p>
              <p className="text-xs text-gray-500">إجمالي الاشتراكات</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Play className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {subscriptions.filter(s => s.is_active && !isExpired(s.expires_at)).length}
              </p>
              <p className="text-xs text-gray-500">اشتراكات نشطة</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {subscriptions.filter(s => isExpired(s.expires_at)).length}
              </p>
              <p className="text-xs text-gray-500">اشتراكات منتهية</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden">
        <div className="p-4 border-b border-[#333]">
          <h2 className="font-medium text-white">قائمة الاشتراكات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#141414]">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">المستخدم</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">مفتاح الترخيص</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">ينتهي في</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الحالة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-white">{sub.user_name || '-'}</p>
                      <p className="text-xs text-gray-500">{sub.user_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded">
                        {sub.license_key || '-'}
                      </span>
                      {sub.license_key && (
                        <button
                          onClick={() => copyToClipboard(sub.license_key!)}
                          className="p-1 hover:bg-[#333] rounded transition-colors"
                          title="نسخ"
                        >
                          {copiedKey === sub.license_key ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${isExpired(sub.expires_at) ? 'text-red-400' : 'text-gray-400'}`}>
                      {new Date(sub.expires_at).toLocaleDateString('ar-EG')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isExpired(sub.expires_at) ? (
                      <span className="px-2 py-1 text-xs bg-red-500/10 text-red-400 rounded-full">منتهي</span>
                    ) : sub.is_active ? (
                      <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 rounded-full">نشط</span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-400 rounded-full">موقوف</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(sub.id, sub.is_active)}
                        className="p-1.5 hover:bg-[#333] rounded-lg transition-colors"
                        title={sub.is_active ? 'إيقاف' : 'تفعيل'}
                      >
                        {sub.is_active ? (
                          <Pause className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <Play className="w-4 h-4 text-green-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    لا توجد اشتراكات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
