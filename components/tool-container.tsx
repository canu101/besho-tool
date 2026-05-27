'use client'

import { useState } from 'react'
import { User, CreditCard, Megaphone } from 'lucide-react'
import AccountTab from './tabs/account-tab'
import CardsTab from './tabs/cards-tab'
import CreateAdTab from './tabs/create-ad-tab'

const tabs = [
  { id: 'account', label: 'الحساب', icon: User },
  { id: 'cards', label: 'الكروت', icon: CreditCard },
  { id: 'create-ad', label: 'إنشاء إعلان', icon: Megaphone },
]

export default function ToolContainer() {
  const [activeTab, setActiveTab] = useState('account')

  return (
    <div className="w-[900px] h-[650px] bg-gradient-to-b from-[#181818] to-[#121212] rounded-2xl border border-[#2a2a2a] shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2a2a2a] bg-[#1a1a1a]/50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Meta Ads Tool
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500">متصل</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#2a2a2a] bg-[#151515]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-all duration-200 relative ${
                isActive 
                  ? 'text-blue-400 bg-[#1a1a1a]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'cards' && <CardsTab />}
        {activeTab === 'create-ad' && <CreateAdTab />}
      </div>
    </div>
  )
}
