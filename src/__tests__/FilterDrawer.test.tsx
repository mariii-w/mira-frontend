import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterDrawer } from '../components/features/search/FilterDrawer'

const baseProps = {
  tags: [],
  selectedTagIds: [],
  onTagToggle: vi.fn(),
  distanceKm: 20,
  onDistanceChange: vi.fn(),
  maxPrice: 100,
  onMaxPriceChange: vi.fn(),
  onApply: vi.fn(),
  activeCount: 0,
}

describe('<FilterDrawer />', () => {
  it('renders a "Filters" trigger button', () => {
    render(<FilterDrawer {...baseProps} />)
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument()
  })

  it('does not show the filter dialog before trigger is clicked', () => {
    render(<FilterDrawer {...baseProps} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the filter dialog when trigger is clicked', () => {
    render(<FilterDrawer {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /filters/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows active count badge when activeCount > 0', () => {
    render(<FilterDrawer {...baseProps} activeCount={2} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('calls onApply and closes the dialog when Apply is clicked', () => {
    const onApply = vi.fn()
    render(<FilterDrawer {...baseProps} onApply={onApply} />)
    fireEvent.click(screen.getByRole('button', { name: /filters/i }))
    fireEvent.click(screen.getByRole('button', { name: /show results/i }))
    expect(onApply).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the dialog when the close button is clicked', () => {
    render(<FilterDrawer {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /filters/i }))
    fireEvent.click(screen.getByRole('button', { name: /close filters/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
