'use client'

import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function AuthButton() {
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut}>
      <LogOut className="h-4 w-4 mr-2" />
      Déconnexion
    </Button>
  )
} 