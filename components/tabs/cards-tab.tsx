"use client"

import { useState } from 'react'

interface Card {
  id: string
  name: string
  lastDigits: string
  status: 'active' | 'inactive'
}

export default function CardsTab() {
  const [cards, setCards] = useState<Card[]>([])
  const [newCardNumber, setNewCardNumber] = useState('')
  const [newCardName, setNewCardName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddCard = async () => {
    if (!newCardNumber || !newCardName) return
    
    setIsAdding(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newCard: Card = {
      id: Date.now().toString(),
      name: newCardName,
      lastDigits: newCardNumber.slice(-4),
      status: 'active',
    }
    
    setCards([...cards, newCard])
    setNewCardNumber('')
    setNewCardName('')
    setIsAdding(false)
  }

  const handleRemoveCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Add Card Form */}
      <div className="p-4 bg-[#0f0f0f] rounded-xl border border-[#2a2a2a] space-y-4">
        <h3 className="text-sm font-medium text-gray-300">إضافة كارت جديد</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={newCardName}
            onChange={(e) => setNewCardName(e.target.value)}
            placeholder="اسم الكارت"
            className="px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
          />
          <input
            type="text"
            value={newCardNumber}
            onChange={(e) => setNewCardNumber(e.target.value)}
            placeholder="رقم الكارت"
            className="px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-mono"
            dir="ltr"
          />
        </div>

        <button
          onClick={handleAddCard}
          disabled={isAdding || !newCardNumber || !newCardName}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all"
        >
          {isAdding ? 'جاري الإضافة...' : 'إضافة الكارت'}
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-300">الكروت المضافة</h3>
        
        {cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            لا توجد كروت مضافة
          </div>
        ) : (
          <div className="space-y-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-[#2a2a2a] group hover:border-[#3a3a3a] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium text-sm">{card.name}</p>
                    <p className="text-gray-500 text-xs font-mono">**** {card.lastDigits}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCard(card.id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
