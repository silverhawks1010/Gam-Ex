import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet"
import { Menu } from "lucide-react"
import { Separator } from "@workspace/ui/components/separator"
import { createClient } from "@/lib/supabase/server"
import { AuthButton } from "@/components/auth/auth-button"
import { ModeToggle } from "@/components/mode-toggle"

const publicNavigation = [
  { name: "Accueil", href: "/" },
  { name: "Jeux", href: "/games" },
]

const privateNavigation = [
  { name: "Tableau de bord", href: "/dashboard" },
]

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const navigation = [...publicNavigation, ...(user ? privateNavigation : [])]

  return (
    <div className="relative">
      <header>
        <nav className="container pl-20 pr-20 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl">
            Gam'Ex
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <AuthButton />
            ) : (
              <Button asChild variant="default">
                <Link href="/login">Connexion</Link>
              </Button>
            )}

            <ModeToggle />

            {/* Navigation Mobile */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>
      <Separator orientation="horizontal" />
    </div>
  )
}
