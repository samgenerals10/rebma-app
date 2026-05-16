'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, Calendar, MessageSquare, Paperclip, Clock, CheckCircle2, Circle } from 'lucide-react'

type Task = { id: string, title: string, desc: string, priority: 'Low' | 'Medium' | 'High', comments: number, attachments: number, date: string }

const INITIAL_BOARD = {
  todo: [
    { id: 't1', title: 'Review Q3 Financials', desc: 'Verify all expense reports from the operations department before the audit.', priority: 'High', comments: 3, attachments: 2, date: 'Oct 24' },
    { id: 't2', title: 'Update HR Policies', desc: 'Draft the new remote work policy for 2025.', priority: 'Medium', comments: 0, attachments: 1, date: 'Oct 28' },
  ] as Task[],
  inProgress: [
    { id: 't3', title: 'Onboard new dispatch drivers', desc: 'Complete safety training and vehicle assignment.', priority: 'High', comments: 12, attachments: 4, date: 'Oct 20' },
    { id: 't4', title: 'Marketing Campaign Launch', desc: 'Finalize ad creatives and budget allocation.', priority: 'Medium', comments: 5, attachments: 8, date: 'Oct 22' },
  ] as Task[],
  review: [
    { id: 't5', title: 'Supplier Contract Renewal', desc: 'Negotiate terms with the primary raw material supplier.', priority: 'High', comments: 2, attachments: 1, date: 'Oct 18' },
  ] as Task[],
  done: [
    { id: 't6', title: 'Server Maintenance', desc: 'Scheduled downtime and database optimization.', priority: 'Low', comments: 0, attachments: 0, date: 'Oct 15' },
    { id: 't7', title: 'Quarterly Townhall', desc: 'Prepare slides and agenda for CEO presentation.', priority: 'Medium', comments: 8, attachments: 3, date: 'Oct 10' },
  ] as Task[]
}

export default function TasksPage() {
  const [board, setBoard] = useState(INITIAL_BOARD)

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'bg-red-100 text-red-700'
      case 'Medium': return 'bg-amber-100 text-amber-700'
      case 'Low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const Column = ({ title, tasks, id }: { title: string, tasks: Task[], id: string }) => (
    <div className="flex flex-col bg-gray-50/50 rounded-2xl border border-gray-100 p-4 h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          {title} <span className="bg-white border border-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">{tasks.length}</span>
        </h3>
        <button className="p-1 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-200 transition">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition group cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <button className="text-gray-300 hover:text-green-500 transition">
                {id === 'done' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
              </button>
            </div>
            <h4 className="font-bold text-sm text-gray-900 mb-1 group-hover:text-blue-600 transition">{task.title}</h4>
            <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{task.desc}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3 mt-auto">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 hover:text-gray-600"><MessageSquare className="w-3.5 h-3.5" /> {task.comments}</span>
                <span className="flex items-center gap-1 hover:text-gray-600"><Paperclip className="w-3.5 h-3.5" /> {task.attachments}</span>
              </div>
              <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5" /> {task.date}</span>
            </div>
          </div>
        ))}
        
        <button className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-500 text-sm mt-1">Organize team workflows and track project progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1,2,3,4].map(i => (
              <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100" />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">+3</div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/30">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Column id="todo" title="To Do" tasks={board.todo} />
        <Column id="inProgress" title="In Progress" tasks={board.inProgress} />
        <Column id="review" title="In Review" tasks={board.review} />
        <Column id="done" title="Done" tasks={board.done} />
      </div>
    </div>
  )
}
