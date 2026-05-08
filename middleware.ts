import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  const publicRoutes = ['/login', '/register', '/pending', '/access-denied', '/welcome', '/']
  if (publicRoutes.some(r => path.startsWith(r))) {
    return supabaseResponse
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const role = user.app_metadata?.user_role || user.user_metadata?.user_role
  const department = user.app_metadata?.user_department || user.user_metadata?.user_department
  const status = user.app_metadata?.user_status || user.user_metadata?.user_status

  if (status === 'pending' || status === 'info_requested') {
    return NextResponse.redirect(new URL('/pending', request.url))
  }

  if (status === 'declined' || status === 'deactivated') {
    return NextResponse.redirect(new URL('/access-denied', request.url))
  }

  if (path === '/dashboard') {
    if (role === 'ceo' || role === 'manager' || role === 'supervisor') {
      return NextResponse.redirect(new URL('/dashboard/management', request.url))
    }
    if (department) {
      return NextResponse.redirect(new URL(`/dashboard/${department}`, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
