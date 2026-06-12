import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | Mira`
    return () => {
      document.title = 'Mira'
    }
  }, [title])
}
