"use client"

import { useState } from 'react'

export default function CreateAdTab() {
  const [formData, setFormData] = useState({
    campaignName: '',
    objective: 'OUTCOME_TRAFFIC',
    budget: '',
    startDate: '',
    endDate: '',
    targetUrl: '',
    headline: '',
    description: '',
  })
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; campaignId?: string } | null>(null)

  const objectives = [
    { value: 'OUTCOME_TRAFFIC', label: 'زيارات' },
    { value: 'OUTCOME_ENGAGEMENT', label: 'تفاعل' },
    { value: 'OUTCOME_LEADS', label: 'عملاء محتملين' },
    { value: 'OUTCOME_SALES', label: 'مبيعات' },
  ]

  const handleSubmit = async () => {
    setIsCreating(true)
    setResult(null)

    try {
      const response = await fetch('/api/create-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      setResult(data)
    } catch {
      setResult({ success: false, message: 'فشل في الاتصال بالخادم' })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* Campaign Name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">اسم الحملة</label>
        <input
          type="text"
          value={formData.campaignName}
          onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
          placeholder="أدخل اسم الحملة"
          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
        />
      </div>

      {/* Objective */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">الهدف</label>
        <select
          value={formData.objective}
          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
        >
          {objectives.map((obj) => (
            <option key={obj.value} value={obj.value}>{obj.label}</option>
          ))}
        </select>
      </div>

      {/* Budget & Dates Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">الميزانية</label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="$"
            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">تاريخ البدء</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">تاريخ الانتهاء</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
          />
        </div>
      </div>

      {/* Target URL */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">رابط الهدف</label>
        <input
          type="url"
          value={formData.targetUrl}
          onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
          placeholder="https://..."
          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
          dir="ltr"
        />
      </div>

      {/* Headline */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">العنوان</label>
        <input
          type="text"
          value={formData.headline}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          placeholder="عنوان الإعلان"
          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">الوصف</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="وصف الإعلان..."
          rows={3}
          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-sm"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isCreating || !formData.campaignName || !formData.budget}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:shadow-none"
      >
        {isCreating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            جاري الإنشاء...
          </span>
        ) : (
          'إنشاء الحملة'
        )}
      </button>

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-xl border ${result.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <p className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
            {result.message}
          </p>
          {result.campaignId && (
            <p className="text-xs text-gray-500 mt-1 font-mono">ID: {result.campaignId}</p>
          )}
        </div>
      )}
    </div>
  )
}
