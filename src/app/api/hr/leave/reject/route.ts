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
  const id = formData.get('id') as string

  if (!id) {
    return Response.json({ error: 'ID required' }, { status: 400 })
  }

  await supabase
    .from('approval_queue')
    .update({ 
      status: 'rejected',
      approved_by: session.user.id,
      resolved_at: new Date().toISOString()
    })
    .eq('id', id)

  redirect('/dashboard/hr/leave')
}