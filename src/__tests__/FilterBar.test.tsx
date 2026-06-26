import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterBar } from '../components/FilterBar'

const baseTags = [
  { tagId: 'a', name: 'Cleaning' },
  { tagId: 'b', name: 'Cooking' },
  { tagId: 'c', name: 'Gardening' },
]

const baseProps = {
  tags: baseTags,
  selectedTagIds: [],
  onTagToggle: vi.fn(),
  distanceKm: 20,
  onDistanceChange: vi.fn(),
  maxPrice: 100,
  onMaxPriceChange: vi.fn(),
  onApply: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('<FilterBar /> semantic structure', () => {
  it('renders as a form element', () => {
    const { container } = render(<FilterBar {...baseProps} />)
    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('each section is a fieldset with a legend', () => {
    const { container } = render(<FilterBar {...baseProps} />)
    const fieldsets = container.querySelectorAll('fieldset')
    expect(fieldsets).toHaveLength(3)
    const legends = [...fieldsets].map(fs => fs.querySelector('legend')?.textContent?.trim())
    expect(legends).toContain('Tags')
    expect(legends).toContain('Distance')
    expect(legends).toContain('Price per hour')
  })

  it('section toggle buttons have aria-expanded and aria-controls', () => {
    render(<FilterBar {...baseProps} />)
    const toggles = screen.getAllByRole('button').filter(b =>
      ['Tags', 'Distance', 'Price per hour'].some(t => b.textContent?.includes(t))
    )
    expect(toggles).toHaveLength(3)
    for (const btn of toggles) {
      expect(btn).toHaveAttribute('aria-expanded', 'true')
      expect(btn).toHaveAttribute('aria-controls')
    }
  })

  it('submit calls onApply', () => {
    const onApply = vi.fn()
    const { container } = render(<FilterBar {...baseProps} onApply={onApply} />)
    fireEvent.submit(container.querySelector('form')!)
    expect(onApply).toHaveBeenCalledOnce()
  })
})

describe('<FilterBar /> tag roving tabindex', () => {
  it('only first tag checkbox is in the tab sequence', () => {
    render(<FilterBar {...baseProps} />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toHaveAttribute('tabindex', '0')
    expect(checkboxes[1]).toHaveAttribute('tabindex', '-1')
    expect(checkboxes[2]).toHaveAttribute('tabindex', '-1')
  })

  it('arrow down moves focus to the next tag', () => {
    render(<FilterBar {...baseProps} />)
    const checkboxes = screen.getAllByRole('checkbox')
    const list = checkboxes[0].closest('ul')!
    checkboxes[0].focus()
    fireEvent.keyDown(list, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(checkboxes[1])
  })

  it('arrow up wraps from first to last tag', () => {
    render(<FilterBar {...baseProps} />)
    const checkboxes = screen.getAllByRole('checkbox')
    const list = checkboxes[0].closest('ul')!
    checkboxes[0].focus()
    fireEvent.keyDown(list, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(checkboxes[2])
  })

  it('arrow down wraps from last to first tag', () => {
    render(<FilterBar {...baseProps} />)
    const checkboxes = screen.getAllByRole('checkbox')
    const list = checkboxes[0].closest('ul')!
    // navigate to last
    fireEvent.keyDown(list, { key: 'ArrowDown' })
    fireEvent.keyDown(list, { key: 'ArrowDown' })
    // one more wraps to first
    fireEvent.keyDown(list, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(checkboxes[0])
  })

  it('resetting search resets active index to first tag', () => {
    render(<FilterBar {...baseProps} />)
    fireEvent.change(screen.getByPlaceholderText('Search tags'), { target: { value: 'c' } })
    fireEvent.change(screen.getByPlaceholderText('Search tags'), { target: { value: '' } })
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toHaveAttribute('tabindex', '0')
  })
})
