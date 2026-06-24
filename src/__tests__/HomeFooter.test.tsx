import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Home } from '../components/Home'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Link: ({ children, to, className }: { children: React.ReactNode; to: string; className?: string }) => (
      <a href={to} className={className}>{children}</a>
    ),
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../api/mira', () => ({
  getGetPublicListingsQueryKey: () => ['public-listings'],
  getGetServiceTagsQueryKey: () => ['service-tags'],
  getPublicListings: vi.fn().mockResolvedValue({ status: 200, data: { items: [] } }),
  getServiceTags: vi.fn().mockResolvedValue({ status: 200, data: [] }),
}))

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>,
  )
}

describe('<Home /> footer', () => {
  it('links footer items to their static pages', () => {
    renderHome()

    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/contact-us')
    expect(screen.getByRole('link', { name: 'Accessibility' })).toHaveAttribute('href', '/accessibility')
    expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/terms-of-use')
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy-policy')
  })
})
