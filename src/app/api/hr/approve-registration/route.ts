import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
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

  if (!currentUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const allowed = currentUser.department === 'hr' ||
                  currentUser.role === 'ceo' ||
                  currentUser.role === 'manager'

  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { registration_id, role, department } = body

  if (!registration_id) return NextResponse.json({ error: 'Registration ID required' }, { status: 400 })

  const { data: reg, error: regError } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', registration_id)
    .single()

  if (regError || !reg) return NextResponse.json({ error: 'Registration not found' }, { status: 404 })

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'

  const { data: existingUsers } = await adminSupabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(u => u.email === reg.email)

  let authUserId

  if (existingUser) {
    authUserId = existingUser.id
  } else {
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: reg.email,
      password: tempPassword,
      email_confirm: true,
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })
    authUserId = authUser.user.id
  }

  const { data: existingPublicUser } = await adminSupabase
    .from('users')
    .select('id')
    .eq('id', authUserId)
    .single()

  if (!existingPublicUser) {
    const { error: userError } = await adminSupabase
      .from('users')
      .insert({
        id: authUserId,
        full_name: reg.full_name,
        email: reg.email,
        phone: reg.phone,
        department: department || reg.department_requested,
        role: role || reg.role_requested || 'staff',
        status: 'active',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
    if (userError) return NextResponse.json({ error: userError.message }, { status: 500 })
  } else {
    await adminSupabase
      .from('users')
      .update({
        full_name: reg.full_name,
        department: department || reg.department_requested,
        role: role || reg.role_requested || 'staff',
        status: 'active',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', authUserId)
  }

  // Ensure employee record exists
  const { data: existingEmployee } = await adminSupabase
    .from('employees')
    .select('id')
    .eq('user_id', authUserId)
    .single()

  if (!existingEmployee) {
    await adminSupabase
      .from('employees')
      .insert({
        user_id: authUserId,
        employee_number: `REB-${Math.floor(1000 + Math.random() * 9000)}`,
        department: department || reg.department_requested,
        position: role || reg.role_requested || 'Staff',
        is_active: true
      })
  } else {
    await adminSupabase
      .from('employees')
      .update({
        department: department || reg.department_requested,
        position: role || reg.role_requested || 'Staff',
        is_active: true
      })
      .eq('user_id', authUserId)
  }

  await adminSupabase
    .from('registrations')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', registration_id)

  return NextResponse.json({ message: 'Registration approved', tempPassword }, { status: 200 })
}
