"use client"

import { useState } from 'react'
import AccountTab from './tabs/account-tab'
import CardsTab from './tabs/cards-tab'
import CreateAdTab from './tabs/create-ad-tab'

type TabType = 'account' | 'cards' | 'create-ad'

export default function ToolContainer() {
  const [activeTab, setActiveTab] = useState<TabType>('account')

  const tabs = [
    { id: 'account' as TabType, label: 'الحساب' },
    { id: 'cards' as TabType, label: 'الكروت' },
    { id: 'create-ad' as TabType, label: 'إنشاء إعلان' },
  ]

  return (
    <div className="tool-container w-[800px] h-[600px] bg-gradient-to-br from-[#141414] via-[#1a1a1a] to-[#0f0f0f] rounded-2xl shadow-2xl border border-[#2a2a2a] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2a2a2a] bg-gradient-to-r from-[#1a1a1a] to-[#141414]">
        <h1 className="text-xl font-bold text-center bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Meta Ads Tool
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a] bg-[#0f0f0f]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
              activeTab === tab.id
                ? 'text-blue-400 bg-[#1a1a1a]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#151515]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content - Fixed Height with Scroll */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'cards' && <CardsTab />}
        {activeTab === 'create-ad' && <CreateAdTab />}
      </div>
    </div>
  )
}
