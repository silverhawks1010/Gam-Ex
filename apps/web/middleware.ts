import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Ne vérifier l'authentification que pour les routes /dashboard/
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Ne pas exécuter de code entre createServerClient et
  // supabase.auth.getUser(). Une simple erreur pourrait rendre très difficile
  // le débogage des problèmes de déconnexion aléatoire des utilisateurs.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Ajouter l'URL de redirection après la connexion
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Ne protéger que les routes /dashboard/
    '/dashboard/:path*',
  ],
} 