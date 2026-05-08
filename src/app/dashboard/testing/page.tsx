'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'

export default function UATPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { session: sess } } = await supabase.auth.getSession()
      
      if (!sess) {
        window.location.href = '/login'
        return
      }

      const { data } = await supabase.from('users').select('*').eq('id', sess.user.id).single()
      
      setUser(data)
      setSession(sess)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const role = user?.role || 'staff'
  const department = user?.department || 'hr'

  const testSuites = [
    { 
      department: 'HR', 
      link: '/dashboard/hr',
      tests: [
        { name: 'Registration approval flow', link: '/dashboard/hr/registration' },
        { name: 'Employee roster CRUD', link: '/dashboard/hr/roster' },
        { name: 'Attendance clock in/out', link: '/dashboard/hr/attendance' },
        { name: 'Leave request flow', link: '/dashboard/hr/leave' },
        { name: 'User account management', link: '/dashboard/hr/users' },
      ]
    },
    { 
      department: 'Finance', 
      link: '/dashboard/finance',
      tests: [
        { name: 'Invoice generation', link: '/dashboard/finance/invoice' },
        { name: 'Payment recording', link: '/dashboard/finance/payments' },
        { name: 'Daily reconciliation', link: '/dashboard/finance/reconciliation' },
        { name: 'Expense logging', link: '/dashboard/finance/expenses' },
        { name: 'GRA report access', link: '/dashboard/management/reports' },
      ]
    },
    { 
      department: 'Marketing', 
      link: '/dashboard/marketing',
      tests: [
        { name: 'Customer directory', link: '/dashboard/marketing/customers' },
        { name: 'Order entry', link: '/dashboard/marketing/orders' },
        { name: 'Order status tracking', link: '/dashboard/marketing/track' },
        { name: 'Demand signal submission', link: '/dashboard/operations/demand' },
      ]
    },
    { 
      department: 'Operations', 
      link: '/dashboard/operations',
      tests: [
        { name: 'Goods receipt', link: '/dashboard/operations/receive' },
        { name: 'Live inventory view', link: '/dashboard/operations' },
        { name: 'Stock discrepancy report', link: '/dashboard/operations/discrepancy' },
        { name: 'Supplier management', link: '/dashboard/operations/suppliers' },
        { name: 'Import workflow', link: '/dashboard/operations/imports' },
      ]
    },
    { 
      department: 'Production', 
      link: '/dashboard/production',
      tests: [
        { name: 'Repack job creation', link: '/dashboard/production/repack' },
        { name: 'Quality check logging', link: '/dashboard/production/quality' },
        { name: 'Packaging inventory', link: '/dashboard/production/packaging' },
      ]
    },
    { 
      department: 'Dispatch', 
      link: '/dashboard/dispatch',
      tests: [
        { name: 'Delivery job board', link: '/dashboard/dispatch' },
        { name: 'Trip management', link: '/dashboard/dispatch/trips' },
        { name: 'GPS tracking view', link: '/dashboard/dispatch/gps' },
        { name: 'Proof of delivery', link: '/dashboard/dispatch/pod' },
        { name: 'Vehicle management', link: '/dashboard/dispatch/vehicles' },
      ]
    },
    { 
      department: 'Management', 
      link: '/dashboard/management',
      tests: [
        { name: 'Approval queue actions', link: '/dashboard/management/approvals' },
        { name: 'Executive dashboard', link: '/dashboard/management' },
        { name: 'Audit log viewer', link: '/dashboard/management/audit' },
        { name: 'FX rate logging', link: '/dashboard/management/fx' },
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <main className="max-w-7xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-yellow-800 dark:text-yellow-200">⚠️ 2-Week Parallel Run in Progress</h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">Test the system alongside manual process. Report any issues to the development team.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {testSuites.map((suite) => (
            <div key={suite.department} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 ${suite.department.toLowerCase() === department || role === 'ceo' ? 'block' : 'opacity-60'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{suite.department}</h3>
                {(suite.department.toLowerCase() === department || role === 'ceo') ? (
                  <span className="text-xs text-green-600">Active</span>
                ) : (
                  <span className="text-xs text-gray-400">View Only</span>
                )}
              </div>
              <div className="space-y-2">
                {suite.tests.map((test, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{test.name}</span>
                    <Link href={test.link} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Test <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
              {(suite.department.toLowerCase() === department || role === 'ceo') && (
                <Link href={suite.link} className="mt-4 block w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm text-center">
                  Run All Tests
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 dark:text-green-200">📋 Go-Live Checklist</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-green-700 dark:text-green-300">RLS enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-green-700 dark:text-green-300">Audit log active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-green-700 dark:text-green-300">All tables created</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-sm text-yellow-700 dark:text-yellow-300">Supabase Pro pending</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}