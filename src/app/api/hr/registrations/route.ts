import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: currentUser } = await supabase
    .from('users')
    .select('role, department')
    .eq('id', user.id)
    .single()

  if (!currentUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let query = supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })

  // HR and CEO see all registrations
  // Manager sees only HR department registrations
  if (currentUser.role === 'manager') {
    query = query.eq('department_requested', 'hr')
  } else if (currentUser.department !== 'hr' && currentUser.role !== 'ceo') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: registrations, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ registrations })
}
