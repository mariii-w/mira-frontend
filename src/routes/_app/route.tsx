import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Navbar } from '../../common/layout/Navbar'
import { Footer } from '../../common/layout/Footer'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}
