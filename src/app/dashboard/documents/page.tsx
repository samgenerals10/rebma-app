'use client'

import { useState } from 'react'
import { FileText, Folder, Search, Download, MoreVertical, File, Image as ImageIcon, FileSpreadsheet, Plus, Filter, HardDrive, Clock, Star, Users } from 'lucide-react'

const FOLDERS = [
  { id: 1, name: 'Company SOPs', items: 24, size: '45 MB', color: 'text-blue-500' },
  { id: 2, name: 'HR Policies', items: 12, size: '15 MB', color: 'text-purple-500' },
  { id: 3, name: 'Marketing Assets', items: 156, size: '1.2 GB', color: 'text-pink-500' },
  { id: 4, name: 'Financial Reports', items: 48, size: '210 MB', color: 'text-emerald-500' },
]

const FILES = [
  { id: 101, name: 'Q3_Financial_Summary_2024.pdf', type: 'pdf', size: '2.4 MB', date: 'Oct 15, 2024', author: 'Finance Dept', starred: true },
  { id: 102, name: 'Employee_Handbook_v3.pdf', type: 'pdf', size: '5.1 MB', date: 'Sep 01, 2024', author: 'HR Dept', starred: false },
  { id: 103, name: 'New_Product_Line_Catalog.xlsx', type: 'spreadsheet', size: '1.8 MB', date: 'Oct 20, 2024', author: 'Marketing', starred: true },
  { id: 104, name: 'Warehouse_Safety_Guidelines.docx', type: 'doc', size: '840 KB', date: 'Aug 11, 2024', author: 'Operations', starred: false },
  { id: 105, name: 'Q4_Marketing_Budget.xlsx', type: 'spreadsheet', size: '1.1 MB', date: 'Nov 02, 2024', author: 'Finance Dept', starred: false },
  { id: 106, name: 'Rebma_Logo_Assets.zip', type: 'archive', size: '45 MB', date: 'Jan 15, 2024', author: 'Design Team', starred: false },
]

export default function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('My Files')

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />
      case 'spreadsheet': return <FileSpreadsheet className="w-8 h-8 text-green-500" />
      case 'image': return <ImageIcon className="w-8 h-8 text-blue-500" />
      default: return <File className="w-8 h-8 text-gray-500" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Center</h1>
          <p className="text-gray-500 text-sm mt-1">Manage, share, and securely store enterprise files.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition shadow-sm">
            <Filter className="w-4 h-4 text-gray-500" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/30">
            <Plus className="w-4 h-4" /> Upload File
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar for Documents */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <nav className="space-y-1">
              {[
                { name: 'My Files', icon: HardDrive },
                { name: 'Recent', icon: Clock },
                { name: 'Starred', icon: Star },
                { name: 'Shared with me', icon: Users },
              ].map(tab => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    activeTab === tab.name ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.name ? 'text-blue-600' : 'text-gray-400'}`} />
                  {tab.name}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 px-3">Storage</h3>
              <div className="px-3">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium text-gray-700">45 GB used</span>
                  <span className="text-gray-500">100 GB</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search documents, PDFs, reports..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
            />
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-4">Quick Folders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {FOLDERS.map(folder => (
                <div key={folder.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <Folder className={`w-8 h-8 ${folder.color} fill-current opacity-20 group-hover:opacity-100 transition`} />
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 truncate">{folder.name}</h3>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{folder.items} items</span>
                    <span>{folder.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-4">{activeTab === 'Recent' ? 'Recently Opened' : 'All Files'}</h2>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Author</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date Modified</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Size</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {FILES.filter(f => activeTab === 'Starred' ? f.starred : true).map(file => (
                    <tr key={file.id} className="hover:bg-blue-50/30 transition group cursor-pointer">
                      <td className="px-6 py-4 flex items-center gap-4">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">{file.name}</p>
                          <p className="text-xs text-gray-500 sm:hidden mt-0.5">{file.date} • {file.size}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {file.author}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">{file.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">{file.size}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
