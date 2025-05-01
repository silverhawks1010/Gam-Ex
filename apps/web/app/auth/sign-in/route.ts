import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const redirectTo = requestUrl.searchParams.get('redirectTo')
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          const response = NextResponse.next({
            request,
          })
          
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
          
          return response
        }
      }
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback${redirectTo ? `?redirectTo=${redirectTo}` : ''}`,
    },
  })

  if (error) {
    return NextResponse.redirect('/login?error=Impossible de se connecter avec GitHub')
  }

  return NextResponse.redirect(data.url)
} 