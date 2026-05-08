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

  if (user?.department !== 'hr' && user?.role !== 'ceo') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const userId = formData.get('user_id') as string

  if (!userId) {
    return Response.json({ error: 'User ID required' }, { status: 400 })
  }

  await supabase.from('users').update({ status: 'active' }).eq('id', userId)

  redirect('/dashboard/hr/accounts')
}