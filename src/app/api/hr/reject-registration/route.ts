import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: currentUser } = await supabase
    .from('users')
    .select('role, department')
    .eq('id', session.user.id)
    .single()

  if (currentUser?.department !== 'hr' && currentUser?.role !== 'ceo' && currentUser?.role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { registration_id, reason } = body

  if (!registration_id || !reason) {
    return NextResponse.json({ error: 'Registration ID and reason required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('registrations')
    .update({
      status: 'declined',
      decline_reason: reason,
      reviewed_by: session.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', registration_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: 'Registration declined' }, { status: 200 })
}
