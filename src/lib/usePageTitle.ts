import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | Mira` : 'Mira'
    return () => {
      document.title = 'Mira'
    }
  }, [title])
}
