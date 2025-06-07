'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FcGoogle } from 'react-icons/fc'
import { SiSteam } from 'react-icons/si'
import { ArrowLeft, CheckCircle2, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Provider } from '@supabase/supabase-js';


export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptCGU, setAcceptCGU] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
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

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasMinLength = password.length >= 8

    return hasUpperCase && hasLowerCase && hasNumbers && hasMinLength
  }

  const validateUsername = (username: string) => {
    // Entre 3 et 20 caractères, lettres, chiffres et underscore uniquement
    return /^[a-zA-Z0-9_]{3,20}$/.test(username)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!validateUsername(username)) {
      setError('Le pseudo doit contenir entre 3 et 20 caractères (lettres, chiffres et underscore uniquement)')
      setLoading(false)
      return
    }

    if (!validatePassword(password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (!acceptCGU) {
      setError('Vous devez accepter les CGU')
      setLoading(false)
      return
    }

    try {
      // Vérifier si le pseudo est déjà utilisé
      const { data: existingUsername, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (usernameError && usernameError.code !== 'PGRST116') {
        throw usernameError
      }

      if (existingUsername) {
        setError('Ce pseudo est déjà utilisé')
        setLoading(false)
        return
      }

      // Vérifier si l'email est déjà utilisé
      const { data: existingEmail, error: emailError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single()

      if (emailError && emailError.code !== 'PGRST116') {
        throw emailError
      }

      if (existingEmail) {
        setError('Cet email est déjà utilisé')
        setLoading(false)
        return
      }

      // Créer le compte
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            accepted_cgu: true,
            accepted_cgu_date: new Date().toISOString()
          }
        }
      })

      if (signUpError) throw signUpError

      // Afficher le message de succès
      setIsSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
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
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
          <h1 className="text-3xl font-bold text-center mt-4">Bienvenue sur Gam-Ex !</h1>
          <p className="text-muted-foreground text-center mt-2">
            Rejoignez notre communauté de gamers et commencez votre aventure
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
              <h2 className="text-2xl font-bold">Créer un compte</h2>
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
                  Vous ne pouvez pas créer un nouveau compte car vous êtes déjà connecté.
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
                <h3 className="text-xl font-semibold">Inscription réussie !</h3>
                <p className="text-muted-foreground">
                  Un email de vérification a été envoyé à {email}.<br />
                  Veuillez vérifier votre boîte de réception et suivre les instructions pour activer votre compte.
                </p>
                <div className="pt-4">
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">
                      Retour à la connexion
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Pseudo</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Votre pseudo"
                      minLength={3}
                      maxLength={20}
                      pattern="[a-zA-Z0-9_]+"
                    />
                    <p className="text-xs text-muted-foreground">
                      Entre 3 et 20 caractères (lettres, chiffres et underscore uniquement)
                    </p>
                  </div>

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
                    <p className="text-xs text-muted-foreground">
                      Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cgu"
                      checked={acceptCGU}
                      onCheckedChange={(checked) => setAcceptCGU(checked as boolean)}
                    />
                    <Label htmlFor="cgu" className="text-sm">
                      J&apos;accepte les <a href="/cgu" className="text-primary hover:underline">Conditions Générales d&apos;Utilisation</a>
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Création du compte...' : 'Créer un compte'}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 