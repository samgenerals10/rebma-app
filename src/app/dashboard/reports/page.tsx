'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart3, TrendingUp, DollarSign, Download, Filter, FileText, ChevronDown, Calendar, Users, Package, AlertCircle } from 'lucide-react'

const REPORTS = [
  { id: 'REP-2024-10A', name: 'Q3 Departmental Expenses', type: 'Financial', date: 'Oct 24, 2024', status: 'Ready' },
  { id: 'REP-2024-10B', name: 'Fleet Utilization & Fuel Costs', type: 'Operations', date: 'Oct 22, 2024', status: 'Ready' },
  { id: 'REP-2024-10C', name: 'Monthly Attendance Summary', type: 'HR', date: 'Oct 15, 2024', status: 'Processing' },
  { id: 'REP-2024-09A', name: 'Raw Material Import Tariff', type: 'Management', date: 'Sep 30, 2024', status: 'Ready' },
  { id: 'REP-2024-09B', name: 'Marketing ROI (Summer Campaign)', type: 'Marketing', date: 'Sep 28, 2024', status: 'Ready' },
]

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('Last 30 Days')

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Cross-departmental insights and data exports.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition shadow-sm">
            <Calendar className="w-4 h-4 text-gray-500" /> {timeRange} <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/30">
            <Download className="w-4 h-4" /> Export All
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition duration-500">
            <DollarSign className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +14.2%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium relative z-10">Total Revenue</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-1 relative z-10">$124,500</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition duration-500">
            <Package className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +5.4%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium relative z-10">Orders Fulfilled</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-1 relative z-10">8,240</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition duration-500">
            <Users className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium relative z-10">Active Employees</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-1 relative z-10">142</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition duration-500">
            <AlertCircle className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
              -2.1%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium relative z-10">Operational Efficiency</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-1 relative z-10">92%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-bold text-gray-900">Revenue vs Target</h2>
            <button className="text-gray-400 hover:text-gray-900"><Filter className="w-4 h-4" /></button>
          </div>
          
          <div className="h-64 flex items-end gap-2 sm:gap-4 justify-between pt-4">
            {/* Simple CSS Bar Chart Simulation */}
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="w-full flex flex-col justify-end items-center gap-2 h-full group">
                <div className="w-full relative h-full flex items-end justify-center">
                  <div className="absolute bottom-0 w-4 sm:w-8 bg-blue-100 rounded-t-md h-full transition group-hover:bg-blue-200"></div>
                  <div className="absolute bottom-0 w-4 sm:w-8 bg-blue-600 rounded-t-md transition-all duration-1000 group-hover:bg-blue-500 shadow-sm" style={{ height: `${h}%` }}></div>
                </div>
                <span className="text-xs font-medium text-gray-400">Oct {i+10}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900">Generated Reports</h2>
            <Link href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {REPORTS.map(report => (
              <div key={report.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 cursor-pointer">
                <div className={`p-2.5 rounded-lg ${report.status === 'Ready' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{report.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="font-medium">{report.type}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                  </div>
                </div>
                {report.status === 'Ready' ? (
                  <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition">
                    <Download className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-amber-600 px-2 py-1 bg-amber-50 rounded-full animate-pulse">
                    Processing
                  </span>
                )}
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl transition">
            Generate New Report
          </button>
        </div>
      </div>
    </div>
  )
}
