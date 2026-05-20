import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AccessibilityState {
  easyRead: boolean
  reducedMotion: boolean
  setEasyRead: (value: boolean) => void
  setReducedMotion: (value: boolean) => void
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      easyRead: false,
      reducedMotion: false,
      setEasyRead: (value) => set({ easyRead: value }),
      setReducedMotion: (value) => set({ reducedMotion: value }),
    }),
    { name: 'mira:a11y' },
  ),
)

if (typeof window !== 'undefined') {
  const sync = (s: AccessibilityState) => {
    document.documentElement.dataset.easyRead = String(s.easyRead)
    document.documentElement.dataset.reducedMotion = String(s.reducedMotion)
  }
  sync(useAccessibilityStore.getState())
  useAccessibilityStore.subscribe(sync)
}