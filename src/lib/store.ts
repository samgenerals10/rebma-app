import { create } from 'zustand'

export type DrawerTab = 'messages' | 'alerts'

interface AppState {
  user: any | null
  notifications: any[]
  messageThreads: any[]

  drawerOpen: boolean
  drawerTab: DrawerTab

  setUser: (user: any) => void
  setNotifications: (notifications: any[]) => void
  setMessageThreads: (threads: any[]) => void

  openDrawer: (tab?: DrawerTab) => void
  closeDrawer: () => void
  setDrawerTab: (tab: DrawerTab) => void

  markNotificationsRead: (ids: string[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  notifications: [],
  messageThreads: [],

  drawerOpen: false,
  drawerTab: 'alerts',

  setUser: (user) => set({ user }),
  setNotifications: (notifications) => set({ notifications }),
  setMessageThreads: (messageThreads) => set({ messageThreads }),

  openDrawer: (tab) => set((state) => ({
    drawerOpen: true,
    drawerTab: tab ?? state.drawerTab,
  })),
  closeDrawer: () => set({ drawerOpen: false }),
  setDrawerTab: (drawerTab) => set({ drawerTab }),

  markNotificationsRead: (ids) => set((state) => ({
    notifications: state.notifications.map((n) =>
      ids.includes(n.id) ? { ...n, is_read: true } : n
    ),
  })),
}))
