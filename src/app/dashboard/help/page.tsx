'use client'

import { useState } from 'react'
import { Search, Book, HelpCircle, Truck, Package, DollarSign, ShoppingCart, Users, Briefcase, ChevronRight, Activity } from 'lucide-react'
import Link from 'next/link'

const HELP_CATEGORIES = [
  { id: 'all', label: 'All Guides', icon: Book },
  { id: 'management', label: 'Management & CEO', icon: Briefcase },
  { id: 'reception', label: 'Reception & Front Desk', icon: Users },
  { id: 'dispatch', label: 'Dispatch & Fleet', icon: Truck },
  { id: 'operations', label: 'Operations & Inventory', icon: Package },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'marketing', label: 'Marketing', icon: ShoppingCart },
]

const FAQS = [
  // CEO & Management
  { category: 'management', q: 'How do I access the CEO Executive Cockpit?', a: 'Go to Management -> Quick Actions -> Executive Dashboard. This provides a live telemetry overview of revenue, headcount, live inventory health, and the order fulfillment pipeline.' },
  { category: 'management', q: 'How do I approve Poland/Turkey imports?', a: 'Imports require CEO authorization. Open the CEO Cockpit or the Management Queue and click the "Import Approvals" action to authorize international shipments.' },
  
  // Receptionist
  { category: 'reception', q: 'How do I log a new visitor or guest?', a: 'Go to the Receptionist Dashboard and click the blue "New Visitor" button at the top right. Fill out their details, host name, and purpose, then click Check In.' },
  { category: 'reception', q: 'How do I mark staff attendance?', a: 'On the Receptionist Dashboard, click the "Daily Attendance" tab. Click the "Update" button next to any staff member to instantly mark them Present, Late, or Absent.' },
  { category: 'reception', q: 'How do I print the daily visitor log?', a: 'Navigate to the Visitor Log or Attendance tab and click the "Export Log" button. This will automatically format the log for printing or saving as a PDF.' },

  // Dispatch
  { category: 'dispatch', q: 'How do I view live GPS tracking for delivery vans?', a: 'Go to Dispatch -> GPS Tracking. The system uses a live satellite map to track the coordinates, speed, and battery life of all active fleet vehicles in real-time.' },
  { category: 'dispatch', q: 'What happens if a vehicle leaves the delivery zone?', a: 'The GPS tracking page features an automated Geofence Alert system. If a vehicle makes an unplanned stop or deviates from the route, a yellow alert will appear in the sidebar.' },

  // Operations
  { category: 'operations', q: 'How do I review incoming Goods Receipts?', a: 'Operations receives goods, but Management must approve them. Go to the Operations Dashboard, click the Goods Receipts tab, and open any pending receipt. If there are missing items, you can file a Discrepancy Report before submitting.' },
  { category: 'operations', q: 'How do I check live inventory levels?', a: 'The Operations Dashboard features a "Live Inventory" tab. Additionally, the CEO Cockpit will automatically flag any items that drop below their minimum reorder threshold in the "Inventory Health" panel.' },

  // Finance & Marketing
  { category: 'finance', q: 'How do I record a payment against a credit order?', a: 'Go to Finance -> Payments -> Record Payment. Search for the specific Order ID and input the payment mode (Cash/Transfer/Cheque). The system will update the outstanding balance automatically.' },
  { category: 'marketing', q: 'How do I create an order offline?', a: 'The Marketing Module supports offline Progressive Web App (PWA) capabilities. Field marketers can create orders without internet access; the system will queue the data and automatically sync when connectivity is restored.' },
]

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Area */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-blue-100 text-lg mb-8">Search our knowledge base for guides, system workflows, and troubleshooting tips.</p>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for 'GPS tracking', 'Approve imports', 'Mark attendance'..." 
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 px-2">Categories</h2>
          {HELP_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition font-medium text-sm"
              style={{
                background: activeCategory === cat.id ? 'var(--accent)' : 'transparent',
                color: activeCategory === cat.id ? 'white' : 'var(--text-secondary)',
              }}
            >
              <div className="flex items-center gap-3">
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </div>
              {activeCategory === cat.id && <ChevronRight className="w-4 h-4 opacity-50" />}
            </button>
          ))}

          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2 mb-2"><Activity className="w-4 h-4"/> System Status</h3>
            <p className="text-xs text-blue-700">All systems are fully operational. GPS tracking and Offline PWA sync are functioning normally.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{faq.q}</h3>
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{faq.a}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full capitalize">
                        {faq.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No results found</h3>
              <p className="text-gray-500 mt-2">We couldn't find any articles matching "{searchQuery}". Try using different keywords.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
