import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: currentUser } = await supabase
    .from('users')
    .select('role, department')
    .eq('id', user.id)
    .single()

  const allowed = currentUser?.department === 'hr' || currentUser?.role === 'ceo'
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { user_id, role, department, status } = body

  if (!user_id) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

  const updates: Record<string, string> = {}
  if (role) updates.role = role
  if (department) updates.department = department
  if (status) updates.status = status

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: 'User updated successfully' })
}
