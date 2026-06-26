import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { Wrench, Users } from 'lucide-react'
import { ServiceUserToggle } from '../ServiceUserToggle.tsx'

export function SearchRootPage() {
  const navigate = useNavigate()
  const location = useRouterState({ select: (state) => state.location })
  const isUsersPage = location.pathname === '/browse-users'
  const currentQuery = ((location.search as { q?: string }).q) ?? ''

  function handleToggleChange(nextChecked: boolean) {
    if (nextChecked) {
      navigate({
        to: '/browse-users',
        search: { q: currentQuery, role: 'everyone', from: undefined },
      })
    } else {
      navigate({
        to: '/browse-services',
        search: { q: currentQuery, city: '', tagIds: [], from: undefined },
      })
    }
  }

  return (
    <main
      id="main-content"
      data-search-variant={isUsersPage ? 'users' : undefined}
      className="min-h-[calc(100vh-4rem)] bg-background"
    >
        <div className="bg-background px-6 py-3">
          <div className="mx-auto max-w-6xl flex justify-center lg:justify-start">
            <div className="lg:w-64">
              <ServiceUserToggle
                id="search-toggle"
                labelLeft="Services"
                labelRight="Users"
                iconLeft={<Wrench />}
                iconRight={<Users />}
                checked={isUsersPage}
                onCheckedChange={handleToggleChange}
              />
            </div>
          </div>
        </div>
        <Outlet />
    </main>
  )
}
