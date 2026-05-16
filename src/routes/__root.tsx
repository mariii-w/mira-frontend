
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { exchangeRefreshForAccess } from '../stores/auth'


// eslint-disable-next-line react-refresh/only-export-components
function RootComponent() {
  useEffect(() => {
    exchangeRefreshForAccess()
  }, [])

  return <Outlet />
}

export const Route = createRootRoute({
  component: RootComponent,
})