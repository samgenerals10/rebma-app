import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'ceo' && currentUser?.role !== 'manager' && currentUser?.role !== 'supervisor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const id = formData.get('id') as string
  const type = formData.get('type') as string

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  if (type === 'import' && currentUser?.role !== 'ceo') {
    return NextResponse.json({ error: 'Only CEO can reject import requests' }, { status: 403 })
  }

  const { error } = await supabase
    .from('approval_queue')
    .update({
      status: 'rejected',
      approved_by: user.id,
      resolved_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  redirect('/dashboard/management')
}
