'use client'

import { useState } from 'react'
import { Link2, Image, FileText, Play, Pause, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type AdObjective = 'OUTCOME_TRAFFIC' | 'OUTCOME_ENGAGEMENT' | 'OUTCOME_LEADS' | 'OUTCOME_SALES'

interface AdData {
  postUrl: string
  budget: string
  duration: string
  objective: AdObjective
  targetAudience: string
  ageMin: string
  ageMax: string
  countries: string[]
}

interface ExtractedPost {
  imageUrl: string
  caption: string
  postId: string
}

export default function CreateAdTab() {
  const [step, setStep] = useState<'extract' | 'configure' | 'preview' | 'created'>('extract')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [extractedPost, setExtractedPost] = useState<ExtractedPost | null>(null)
  const [createdAdId, setCreatedAdId] = useState<string | null>(null)
  const [adData, setAdData] = useState<AdData>({
    postUrl: '',
    budget: '10',
    duration: '7',
    objective: 'OUTCOME_TRAFFIC',
    targetAudience: '',
    ageMin: '18',
    ageMax: '65',
    countries: ['EG'],
  })

  const objectives: { value: AdObjective; label: string; description: string }[] = [
    { value: 'OUTCOME_TRAFFIC', label: 'الزيارات', description: 'جلب زيارات للموقع أو التطبيق' },
    { value: 'OUTCOME_ENGAGEMENT', label: 'التفاعل', description: 'زيادة التفاعل على المنشور' },
    { value: 'OUTCOME_LEADS', label: 'العملاء المحتملين', description: 'جمع بيانات العملاء' },
    { value: 'OUTCOME_SALES', label: 'المبيعات', description: 'زيادة المبيعات والتحويلات' },
  ]

  const countries = [
    { code: 'EG', name: 'مصر' },
    { code: 'SA', name: 'السعودية' },
    { code: 'AE', name: 'الإمارات' },
    { code: 'KW', name: 'الكويت' },
    { code: 'QA', name: 'قطر' },
    { code: 'BH', name: 'البحرين' },
    { code: 'OM', name: 'عمان' },
    { code: 'JO', name: 'الأردن' },
    { code: 'LB', name: 'لبنان' },
    { code: 'IQ', name: 'العراق' },
  ]

  const handleExtractPost = async () => {
    if (!adData.postUrl) return
    
    setIsExtracting(true)
    try {
      const response = await fetch('/api/extract-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: adData.postUrl }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setExtractedPost(data)
        setStep('configure')
      }
    } catch (error) {
      console.error('Failed to extract post:', error)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleCreateAd = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/create-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adData,
          postId: extractedPost?.postId,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setCreatedAdId(data.adId)
        setStep('created')
      }
    } catch (error) {
      console.error('Failed to create ad:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleActivateAd = async () => {
    if (!createdAdId) return
    
    setIsActivating(true)
    try {
      await fetch('/api/activate-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: createdAdId }),
      })
    } catch (error) {
      console.error('Failed to activate ad:', error)
    } finally {
      setIsActivating(false)
    }
  }

  const toggleCountry = (code: string) => {
    if (adData.countries.includes(code)) {
      setAdData({ ...adData, countries: adData.countries.filter(c => c !== code) })
    } else {
      setAdData({ ...adData, countries: [...adData.countries, code] })
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {['extract', 'configure', 'created'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                step === s
                  ? 'bg-blue-500 text-white'
                  : ['extract', 'configure', 'preview', 'created'].indexOf(step) > i
                  ? 'bg-green-500 text-white'
                  : 'bg-[#333] text-gray-500'
              }`}
            >
              {['extract', 'configure', 'preview', 'created'].indexOf(step) > i ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < 2 && (
              <div
                className={`w-16 h-0.5 mx-1 transition-colors ${
                  ['extract', 'configure', 'preview', 'created'].indexOf(step) > i
                    ? 'bg-green-500'
                    : 'bg-[#333]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Extract Post */}
      {step === 'extract' && (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              استخراج البوست
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={adData.postUrl}
                onChange={(e) => setAdData({ ...adData, postUrl: e.target.value })}
                placeholder="https://www.facebook.com/..."
                className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <button
                onClick={handleExtractPost}
                disabled={isExtracting || !adData.postUrl}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  isExtracting || !adData.postUrl
                    ? 'bg-[#333] text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400'
                }`}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الاستخراج...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    استخراج البوست
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Configure Ad */}
      {step === 'configure' && extractedPost && (
        <div className="space-y-4">
          {/* Extracted Post Preview */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-[#333] flex items-center justify-center overflow-hidden">
                {extractedPost.imageUrl ? (
                  <img src={extractedPost.imageUrl} alt="Post" className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300 line-clamp-3">{extractedPost.caption || 'بدون نص'}</p>
                <p className="text-xs text-gray-500 mt-2">ID: {extractedPost.postId}</p>
              </div>
            </div>
          </div>

          {/* Ad Configuration */}
          <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#2a2a2a] space-y-4">
            {/* Objective */}
            <div className="space-y-2">
              <label className="block text-xs text-gray-500">هدف الإعلان</label>
              <div className="grid grid-cols-2 gap-2">
                {objectives.map((obj) => (
                  <button
                    key={obj.value}
                    onClick={() => setAdData({ ...adData, objective: obj.value })}
                    className={`p-3 rounded-xl border text-right transition-all ${
                      adData.objective === obj.value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-[#333] bg-[#141414] text-gray-400 hover:border-[#444]'
                    }`}
                  >
                    <p className="text-sm font-medium">{obj.label}</p>
                    <p className="text-xs opacity-60 mt-0.5">{obj.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs text-gray-500">الميزانية اليومية ($)</label>
                <input
                  type="number"
                  value={adData.budget}
                  onChange={(e) => setAdData({ ...adData, budget: e.target.value })}
                  min="1"
                  className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-xl text-gray-200 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-gray-500">المدة (أيام)</label>
                <input
                  type="number"
                  value={adData.duration}
                  onChange={(e) => setAdData({ ...adData, duration: e.target.value })}
                  min="1"
                  className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-xl text-gray-200 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Age Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs text-gray-500">العمر من</label>
                <input
                  type="number"
                  value={adData.ageMin}
                  onChange={(e) => setAdData({ ...adData, ageMin: e.target.value })}
                  min="13"
                  max="65"
                  className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-xl text-gray-200 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-gray-500">العمر إلى</label>
                <input
                  type="number"
                  value={adData.ageMax}
                  onChange={(e) => setAdData({ ...adData, ageMax: e.target.value })}
                  min="13"
                  max="65"
                  className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-xl text-gray-200 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Countries */}
            <div className="space-y-2">
              <label className="block text-xs text-gray-500">الدول المستهدفة</label>
              <div className="flex flex-wrap gap-2">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => toggleCountry(country.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      adData.countries.includes(country.code)
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-[#141414] text-gray-500 border border-[#333] hover:border-[#444]'
                    }`}
                  >
                    {country.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateAd}
              disabled={isCreating || adData.countries.length === 0}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                isCreating || adData.countries.length === 0
                  ? 'bg-[#333] text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري إنشاء الإعلان...
                </>
              ) : (
                'إنشاء الإعلان'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Created */}
      {step === 'created' && (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center border border-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">تم إنشاء الإعلان بنجاح</h2>
            <p className="text-sm text-gray-400">
              الإعلان جاهز ويمكنك تفعيله الآن
            </p>
            {createdAdId && (
              <p className="text-xs text-gray-500 font-mono">
                Ad ID: {createdAdId}
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleActivateAd}
              disabled={isActivating}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-medium hover:from-green-500 hover:to-green-400 transition-all flex items-center gap-2"
            >
              {isActivating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التفعيل...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  تفعيل الإعلان
                </>
              )}
            </button>
            <button
              onClick={() => {
                setStep('extract')
                setExtractedPost(null)
                setCreatedAdId(null)
                setAdData({
                  postUrl: '',
                  budget: '10',
                  duration: '7',
                  objective: 'OUTCOME_TRAFFIC',
                  targetAudience: '',
                  ageMin: '18',
                  ageMax: '65',
                  countries: ['EG'],
                })
              }}
              className="px-6 py-3 rounded-xl bg-[#333] text-gray-300 font-medium hover:bg-[#444] transition-all flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              إعلان جديد
            </button>
          </div>

          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200/80 text-right">
                ملاحظة: تأكد من مراجعة الإعلان في مدير الإعلانات قبل التفعيل النهائي
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
