import { create } from 'zustand'
import { supabase, type User } from './supabase'

interface AuthStore {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user: User | null) => set({ user }),
  setLoading: (loading: boolean) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
  checkAuth: async () => {
    set({ loading: true })
    const { data: { user } } = await supabase.auth.getUser()
    set({ user: user as User | null, loading: false })
  },
}))
