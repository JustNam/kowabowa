import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES } from './constants/routes'

export async function middleware(request: NextRequest) {
  // Route handlers manage their own auth via createClient() — don't
  // duplicate that logic here.
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
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

  // Refreshes the session if expired — required for Server Components.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicRoutes: string[] = [ROUTES.LOGIN, ROUTES.FORGOT_PASSWORD]
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = user ? ROUTES.POST_LOGIN_REDIRECT : ROUTES.LOGIN
    return NextResponse.redirect(url)
  }

  if (!isPublicRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.LOGIN
    return NextResponse.redirect(url)
  }

  if (isPublicRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.POST_LOGIN_REDIRECT
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
