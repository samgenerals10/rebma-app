import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      full_name,
      email,
      phone,
      ghana_card_id,
      date_of_birth,
      home_address,
      emergency_contact_name,
      emergency_contact_phone,
      department_requested,
      role_requested,
      employment_type,
      start_date,
      referred_by,
    } = body

    // Validate required fields
    if (!full_name || !email || !phone || !ghana_card_id || !department_requested) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if email already exists in registrations
    const { data: existing } = await supabase
      .from('registrations')
      .select('id, status')
      .eq('email', email)
      .single()

    if (existing) {
      if (existing.status === 'pending') {
        return NextResponse.json(
          { error: 'A registration with this email is already pending review' },
          { status: 400 }
        )
      }
      if (existing.status === 'declined') {
        return NextResponse.json(
          { error: 'This email was previously declined. Please contact HR directly.' },
          { status: 400 }
        )
      }
    }

    // Insert registration
    const { error } = await supabase
      .from('registrations')
      .insert({
        full_name,
        email,
        phone,
        ghana_card_id,
        date_of_birth: date_of_birth || null,
        home_address,
        emergency_contact_name,
        emergency_contact_phone,
        department_requested,
        role_requested,
        employment_type,
        start_date: start_date || null,
        referred_by,
        status: 'pending',
      })

    if (error) {
      console.error('Registration error:', error)
      return NextResponse.json(
        { error: 'Failed to submit registration. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Registration submitted successfully' },
      { status: 200 }
    )

  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}