import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

let cachedUser: any = null
let cachedUserData: any = null
let fetchPromise: Promise<void> | null = null

export function useAuth() {
  const [user, setUser] = useState<any>(cachedUser)
  const [userData, setUserData] = useState<any>(cachedUserData)

  useEffect(() => {
    if (cachedUser && cachedUserData) {
      setUser(cachedUser)
      setUserData(cachedUserData)
      return
    }

    if (!fetchPromise) {
      fetchPromise = (async () => {
        try {
          const supabase = createClient()
          const { data: { user: auth } } = await supabase.auth.getUser()
          if (auth) {
            const { data } = await supabase.from('users').select('*').eq('id', auth.id).single()
            cachedUser = auth
            cachedUserData = data
          }
        } finally {
          fetchPromise = null
        }
      })()
    }

    fetchPromise?.then(() => {
      setUser(cachedUser)
      setUserData(cachedUserData)
    })
  }, [])

  return { user, userData }
}

export function clearAuthCache() {
  cachedUser = null
  cachedUserData = null
}
