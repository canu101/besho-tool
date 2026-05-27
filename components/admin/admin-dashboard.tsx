"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  id: string
  user_email: string
  user_name: string | null
  allowed_ip: string | null
  starts_at: string
  expires_at: string
  is_active: boolean
  created_at: string
}

export default function AdminDashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSub, setNewSub] = useState({
    user_email: '',
    user_name: '',
    allowed_ip: '',
    expires_at: '',
  })

  const supabase = createClient()

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSubscriptions(data)
    }
    setIsLoading(false)
  }

  const handleAddSubscription = async () => {
    if (!newSub.user_email || !newSub.expires_at) return

    const { error } = await supabase.from('subscriptions').insert([
      {
        user_email: newSub.user_email,
        user_name: newSub.user_name || null,
        allowed_ip: newSub.allowed_ip || null,
        expires_at: newSub.expires_at,
        is_active: true,
      },
    ])

    if (!error) {
      setNewSub({ user_email: '', user_name: '', allowed_ip: '', expires_at: '' })
      setShowAddForm(false)
      fetchSubscriptions()
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('subscriptions').update({ is_active: !currentStatus }).eq('id', id)
    fetchSubscriptions()
  }

  const deleteSubscription = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاشتراك؟')) return
    await supabase.from('subscriptions').delete().eq('id', id)
    fetchSubscriptions()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">لوحة تحكم الاشتراكات</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
          >
            إضافة اشتراك
          </button>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] p-6 rounded-xl w-[400px] border border-[#2a2a2a]">
              <h2 className="text-lg font-bold text-white mb-4">إضافة اشتراك جديد</h2>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني *"
                  value={newSub.user_email}
                  onChange={(e) => setNewSub({ ...newSub, user_email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-200 text-sm"
                />
                <input
                  type="text"
                  placeholder="اسم المستخدم"
                  value={newSub.user_name}
                  onChange={(e) => setNewSub({ ...newSub, user_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-200 text-sm"
                />
                <input
                  type="text"
                  placeholder="عنوان IP المسموح"
                  value={newSub.allowed_ip}
                  onChange={(e) => setNewSub({ ...newSub, allowed_ip: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-200 text-sm"
                  dir="ltr"
                />
                <input
                  type="datetime-local"
                  value={newSub.expires_at}
                  onChange={(e) => setNewSub({ ...newSub, expires_at: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-200 text-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAddSubscription}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                  >
                    إضافة
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2.5 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-lg"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions Table */}
        <div className="bg-[#141414] rounded-xl border border-[#2a2a2a] overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : subscriptions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">لا توجد اشتراكات</div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#0f0f0f]">
                <tr className="text-gray-400 text-sm">
                  <th className="px-4 py-3 text-right">المستخدم</th>
                  <th className="px-4 py-3 text-right">IP</th>
                  <th className="px-4 py-3 text-right">ينتهي في</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-t border-[#2a2a2a]">
                    <td className="px-4 py-3">
                      <div className="text-gray-200 text-sm">{sub.user_name || '-'}</div>
                      <div className="text-gray-500 text-xs">{sub.user_email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm font-mono">{sub.allowed_ip || '-'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">
                      {new Date(sub.expires_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${sub.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {sub.is_active ? 'نشط' : 'معلق'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleStatus(sub.id, sub.is_active)}
                          className={`px-3 py-1 rounded text-xs ${sub.is_active ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                        >
                          {sub.is_active ? 'تعليق' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => deleteSubscription(sub.id)}
                          className="px-3 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
