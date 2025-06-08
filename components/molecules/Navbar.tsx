"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, LogIn, LogOut, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { siteConfig } from "@/config/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { FaUserCircle } from "react-icons/fa"

export function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  type User = { id: string; email?: string; user_metadata?: { username?: string; avatar_url?: string } };
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username?: string; avatar_url?: string } | null>(null);
  const supabase = createClient()
  const router = useRouter()
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      if (session?.user) {
        setUser(session.user)
      }
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  useEffect(() => {
    const loadProfileAvatar = async () => {
      if (user?.id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_url, username')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          if (profileData.avatar_url) {
            setProfileAvatar(profileData.avatar_url);
          }
        }
      }
    };

    loadProfileAvatar();
  }, [user?.id, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="backdrop-blur-md bg-background/80 border-b border-border/60 shadow-sm sticky top-0 z-50 px-[10%]">
      <div className="w-full h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src={siteConfig.logo.src}
              alt={`${siteConfig.name} Logo`}
              width={siteConfig.logo.width}
              height={siteConfig.logo.height}
              className="mr-2 rounded-lg shadow-md"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-base font-medium flex items-center gap-1 px-2 py-1 rounded transition-colors duration-200 hover:text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </div>

        {/* Auth Section */}
        <div className="hidden md:block">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0.5 ring-1 ring-primary ring-offset-1 ring-offset-background">
                  <Avatar className="h-9 w-9">
                    {profileAvatar ? (
                      <AvatarImage src={profileAvatar} alt={user?.email} />
                    ) : user?.user_metadata?.avatar_url ? (
                      <AvatarImage src={user.user_metadata.avatar_url} alt={user.email} />
                    ) : (
                      <AvatarFallback>
                        <FaUserCircle className="w-6 h-6" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{ profile?.username || user?.user_metadata?.username || user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={user ? `/profile/${user.id}` : '/profile'} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" asChild className="font-semibold flex items-center gap-1 px-4 py-2 shadow-md">
              <Link href={siteConfig.auth.login.href}>
                <LogIn className="w-4 h-4 mr-1" />
                {siteConfig.auth.login.title}
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-background/95 rounded-t-2xl shadow-2xl border-t border-border/60">
            <SheetHeader>
              <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-6 mt-8">
              {siteConfig.mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium flex items-center gap-2 px-3 py-2 rounded hover:bg-primary/10 transition-colors"
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="relative h-10 w-10 rounded-full p-0.5 ring-1 ring-primary ring-offset-1 ring-offset-background">
                      <Avatar className="h-9 w-9">
                        {profileAvatar ? (
                          <AvatarImage src={profileAvatar} alt={user?.email} />
                        ) : user?.user_metadata?.avatar_url ? (
                          <AvatarImage src={user.user_metadata.avatar_url} alt={user.email} />
                        ) : (
                          <AvatarFallback>
                            <FaUserCircle className="w-6 h-6" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.user_metadata?.username || user?.email}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                  <Link
                    href={user ? `/profile/${user.id}` : '/profile'}
                    className="text-lg font-medium flex items-center gap-2 px-3 py-2 rounded hover:bg-primary/10 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Profil
                  </Link>
                  <Link
                    href="/settings"
                    className="text-lg font-medium flex items-center gap-2 px-3 py-2 rounded hover:bg-primary/10 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Paramètres
                  </Link>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="w-full font-semibold flex items-center gap-2 mt-4"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Button variant="default" size="lg" className="w-full font-semibold flex items-center gap-2 mt-4" asChild>
                  <Link href={siteConfig.auth.login.href}>
                    <LogIn className="w-5 h-5 mr-1" />
                    {siteConfig.auth.login.title}
                  </Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
} 