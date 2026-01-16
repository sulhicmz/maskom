"use client"

import { useState, useEffect } from 'react'
import { authService } from '@/services/auth'
import type { User } from '@/services/auth/types'

export function useAuthService() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getCurrentUser()
  }, [])

  return {
    user,
    loading
  }
}
