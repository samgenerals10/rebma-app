import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: user } = await supabase
    .from('users')
    .select('role, department')
    .eq('id', session.user.id)
    .single()

  if (user?.department !== 'hr' && user?.role !== 'ceo' && user?.role !== 'manager' && user?.role !== 'supervisor') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const employee_id = formData.get('employee_id') as string
  const action = formData.get('action') as string
  const today = new Date().toISOString().split('T')[0]

  if (!employee_id || !action) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (action === 'clock_in') {
    const { error } = await supabase
      .from('attendance')
      .insert({
        employee_id,
        date: today,
        clock_in: new Date().toISOString()
      })

    if (error) {
      console.error('Clock in error:', error.message)
    }
  } else if (action === 'clock_out') {
    const { data: existing } = await supabase
      .from('attendance')
      .select('id, clock_out')
      .eq('employee_id', employee_id)
      .eq('date', today)
      .is('clock_out', null)
      .single()

    if (existing) {
      await supabase
        .from('attendance')
        .update({ clock_out: new Date().toISOString() })
        .eq('id', existing.id)
    }
  }

  redirect('/dashboard/hr/attendance')
}