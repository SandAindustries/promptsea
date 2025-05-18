'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function Header() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="w-full border-b bg-white px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-bold">PromptSea</h1>
      {userEmail && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">{userEmail}</span>
          <Button onClick={handleLogout} variant="outline" size="sm">
            로그아웃
          </Button>
        </div>
      )}
    </header>
  )
}