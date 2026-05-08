'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, Star } from 'lucide-react'

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">REBMA IMPEX</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition">
              Sign In
            </Link>
            <Link href="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-5 py-2.5 rounded-lg transition">
              Get Started
            </Link>
          </div>
        </nav>

        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-6">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Operational Management System</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Streamline Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600"> Business </span>
            Operations
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl leading-relaxed">
            Complete enterprise management platform with real-time tracking, integrated messaging, video meetings, and powerful analytics for all your departments.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl transition shadow-lg shadow-emerald-200">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-xl border-2 border-gray-200 transition">
              Sign In
            </Link>
          </div>

          <div className="flex items-center gap-6 mt-12">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br ${i === 1 ? 'from-emerald-400' : i === 2 ? 'from-green-400' : i === 3 ? 'from-emerald-500' : 'from-green-500'} to-${i === 1 ? 'emerald-600' : i === 2 ? 'green-600' : i === 3 ? 'emerald-600' : 'green-600'} border-2 border-white flex items-center justify-center text-white text-sm font-bold`}>
                  {['A', 'K', 'M', 'J'][i-1]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-1 mb-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-500">Trusted by businesses worldwide</p>
            </div>
          </div>
        </div>

        <footer className="absolute bottom-8 left-0 right-0 text-center text-gray-400 text-sm">
          <p>© 2024 REBMA IMPEX. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}