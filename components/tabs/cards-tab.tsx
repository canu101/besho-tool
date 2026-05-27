'use client'

import { useState } from 'react'
import { Plus, Trash2, CreditCard, CheckCircle2 } from 'lucide-react'

interface Card {
  id: string
  number: string
  name: string
  expiry: string
  cvv: string
}

export default function CardsTab() {
  const [cards, setCards] = useState<Card[]>([])
  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  })
  const [isAdding, setIsAdding] = useState(false)
  const [addStatus, setAddStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(' ') : cleaned
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handleAddCard = async () => {
    if (!newCard.number || !newCard.name || !newCard.expiry || !newCard.cvv) return
    
    setIsAdding(true)
    setAddStatus('idle')
    
    try {
      const response = await fetch('/api/add-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: [newCard] }),
      })
      
      if (response.ok) {
        const card: Card = {
          id: Date.now().toString(),
          ...newCard,
        }
        setCards([...cards, card])
        setNewCard({ number: '', name: '', expiry: '', cvv: '' })
        setAddStatus('success')
        setTimeout(() => setAddStatus('idle'), 3000)
      } else {
        setAddStatus('error')
      }
    } catch {
      setAddStatus('error')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Add Card Form */}
      <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#2a2a2a]">
        <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          إضافة كارت جديد
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Card Number */}
          <div className="col-span-2 space-y-2">
            <label className="block text-xs text-gray-500">رقم الكارت</label>
            <input
              type="text"
              value={formatCardNumber(newCard.number)}
              onChange={(e) => setNewCard({ ...newCard, number: e.target.value.replace(/\s/g, '') })}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono tracking-wider"
            />
          </div>
          
          {/* Card Name */}
          <div className="col-span-2 space-y-2">
            <label className="block text-xs text-gray-500">اسم صاحب الكارت</label>
            <input
              type="text"
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value.toUpperCase() })}
              placeholder="JOHN DOE"
              className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all uppercase tracking-wide"
            />
          </div>
          
          {/* Expiry */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-500">تاريخ الانتهاء</label>
            <input
              type="text"
              value={formatExpiry(newCard.expiry)}
              onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value.replace(/\D/g, '') })}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-center"
            />
          </div>
          
          {/* CVV */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-500">CVV</label>
            <input
              type="password"
              value={newCard.cvv}
              onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              placeholder="***"
              maxLength={4}
              className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-center"
            />
          </div>
        </div>

        <button
          onClick={handleAddCard}
          disabled={isAdding || !newCard.number || !newCard.name || !newCard.expiry || !newCard.cvv}
          className={`w-full mt-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            isAdding || !newCard.number || !newCard.name || !newCard.expiry || !newCard.cvv
              ? 'bg-[#333] text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20'
          }`}
        >
          {isAdding ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              جاري الإضافة...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              إضافة الكارت
            </>
          )}
        </button>

        {addStatus === 'success' && (
          <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center gap-2 text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            تمت إضافة الكارت بنجاح
          </div>
        )}
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          الكروت المضافة ({cards.length})
        </h3>
        
        {cards.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm">
            لم يتم إضافة أي كروت بعد
          </div>
        ) : (
          <div className="space-y-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] group hover:border-[#333] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 font-mono">
                      •••• •••• •••• {card.number.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500">{card.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCard(card.id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
