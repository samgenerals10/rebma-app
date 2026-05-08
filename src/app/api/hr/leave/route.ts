import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const employee_id = formData.get('employee_id') as string
  const leave_type = formData.get('leave_type') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const notes = formData.get('notes') as string

  if (!employee_id || !leave_type || !start_date || !end_date) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const start = new Date(start_date)
  const end = new Date(end_date)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const notesFormatted = `${start_date}|${end_date}|${leave_type}|${notes || ''}`

  const { error } = await supabase
    .from('approval_queue')
    .insert({
      type: 'leave',
      reference_id: employee_id,
      requester_id: session.user.id,
      status: 'pending',
      amount: days,
      notes: notesFormatted
    })

  if (error) {
    console.error('Leave request error:', error.message)
  }

  redirect('/dashboard/hr/leave')
}