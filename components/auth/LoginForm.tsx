'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FcGoogle } from 'react-icons/fc'
import { SiSteam } from 'react-icons/si'
import { ArrowLeft, CheckCircle2, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Provider } from '@supabase/supabase-js'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [supabase.auth])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isSuccess && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (isSuccess && countdown === 0) {
      router.push('/')
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isSuccess, countdown, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      // Connexion réussie
      setIsSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleSteamSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'steam' as Provider,
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center">
        {/* Mascotte Section */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64">
            <Image
              src="/images/mascotte.png"
              alt="Mascotte Gam-Ex"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-center mt-4">Bienvenue de retour !</h1>
          <p className="text-muted-foreground text-center mt-2">
            Connectez-vous pour continuer votre aventure
          </p>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2">
          <div className="w-full space-y-8 p-6 bg-card rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l&apos;accueil
              </Link>
              <h2 className="text-2xl font-bold">Connexion</h2>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isAuthenticated ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">Vous êtes déjà connecté !</h3>
                <p className="text-muted-foreground">
                  Vous ne pouvez pas accéder à cette page car vous êtes déjà connecté.
                </p>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </Button>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">Connexion réussie !</h3>
                <p className="text-muted-foreground">
                  Redirection vers l&apos;accueil dans {countdown} seconde{countdown > 1 ? 's' : ''}...
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Ou continuer avec</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="w-full"
                    disabled={loading}
                  >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSteamSignIn}
                    className="w-full"
                    disabled={loading}
                  >
                    <SiSteam className="mr-2 h-5 w-5" />
                    Steam
                  </Button>
                </div>

                <div className="text-center text-sm">
                  <p className="text-muted-foreground">
                    Pas encore de compte ?{' '}
                    <Link href="/auth/register" className="text-primary hover:underline">
                      Créer un compte
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 