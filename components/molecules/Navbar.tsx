"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, LogIn, Home, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { siteConfig } from "@/config/navigation"

const navIcons: Record<string, React.ReactNode> = {
  Accueil: <Home className="w-4 h-4 mr-1.5" />,
  "Bibliothèque": <BookOpen className="w-4 h-4 mr-1.5" />,
}

export function Navbar() {
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
              {navIcons[item.title]}
              {item.title}
            </Link>
          ))}
        </div>

        {/* Login Button */}
        <div className="hidden md:block">
          <Button variant="default" size="sm" asChild className="font-semibold flex items-center gap-1 px-4 py-2 shadow-md">
            <Link href={siteConfig.auth.login.href}>
              <LogIn className="w-4 h-4 mr-1" />
              {siteConfig.auth.login.title}
            </Link>
          </Button>
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
                  {navIcons[item.title]}
                  {item.title}
                </Link>
              ))}
              <Button variant="default" size="lg" className="w-full font-semibold flex items-center gap-2 mt-4" asChild>
                <Link href={siteConfig.auth.login.href}>
                  <LogIn className="w-5 h-5 mr-1" />
                  {siteConfig.auth.login.title}
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
} 