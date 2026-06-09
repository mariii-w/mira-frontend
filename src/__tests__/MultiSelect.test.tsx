import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MultiSelect } from '../components/MultiSelect'
import type { SelectOption } from '../components/MultiSelect'

const OPTIONS: SelectOption[] = [
  { id: '1', label: 'Web Design', variant: 'default' },
  { id: '2', label: 'Barrierefrei Support', variant: 'accent', badge: 'barrierefrei' },
  { id: '3', label: 'IT Help', variant: 'default' },
]

describe('<MultiSelect />', () => {
  it('renders placeholder text', () => {
    render(<MultiSelect options={OPTIONS} value={[]} onChange={vi.fn()} placeholder="Select tags…" />)
    expect(screen.getByText('Select tags…')).toBeInTheDocument()
  })

  it('shows "Loading…" and disables the button when loading', () => {
    render(<MultiSelect options={OPTIONS} value={[]} onChange={vi.fn()} loading aria-label="Service tags" />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /service tags/i })).toBeDisabled()
  })

  it('does not render the chips list when nothing is selected', () => {
    render(<MultiSelect options={OPTIONS} value={[]} onChange={vi.fn()} />)
    expect(screen.queryByRole('list', { name: 'Selected tags' })).not.toBeInTheDocument()
  })

  it('renders selected chips as an accessible list', () => {
    render(<MultiSelect options={OPTIONS} value={['1', '3']} onChange={vi.fn()} />)
    const list = screen.getByRole('list', { name: 'Selected tags' })
    expect(list).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Web Design')
    expect(items[1]).toHaveTextContent('IT Help')
  })

  it('chip remove buttons have accessible labels', () => {
    render(<MultiSelect options={OPTIONS} value={['1', '2']} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Remove Web Design' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Barrierefrei Support' })).toBeInTheDocument()
  })

  it('clicking a remove button calls onChange with that item removed', () => {
    const onChange = vi.fn()
    render(<MultiSelect options={OPTIONS} value={['1', '3']} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Web Design' }))
    expect(onChange).toHaveBeenCalledWith(['3'])
  })

  it('button aria-label is the plain label when nothing is selected', () => {
    render(<MultiSelect options={OPTIONS} value={[]} onChange={vi.fn()} aria-label="Service tags" />)
    expect(screen.getByRole('button', { name: 'Service tags' })).toBeInTheDocument()
  })

  it('button aria-label includes the selection count when items are selected', () => {
    render(<MultiSelect options={OPTIONS} value={['1', '2']} onChange={vi.fn()} aria-label="Service tags" />)
    expect(screen.getByRole('button', { name: 'Service tags, 2 selected' })).toBeInTheDocument()
  })

  it('passes aria-required to the button', () => {
    render(<MultiSelect options={OPTIONS} value={[]} onChange={vi.fn()} aria-label="Service tags" aria-required />)
    expect(screen.getByRole('button', { name: 'Service tags' })).toHaveAttribute('aria-required', 'true')
  })

  it('passes aria-describedby to the button', () => {
    render(
      <MultiSelect
        options={OPTIONS}
        value={[]}
        onChange={vi.fn()}
        aria-label="Service tags"
        aria-describedby="tags-error"
      />,
    )
    expect(screen.getByRole('button', { name: 'Service tags' })).toHaveAttribute('aria-describedby', 'tags-error')
  })

  it('sets the id on the button', () => {
    render(
      <MultiSelect options={OPTIONS} value={[]} onChange={vi.fn()} id="listing-tags" aria-label="Service tags" />,
    )
    expect(screen.getByRole('button', { name: 'Service tags' })).toHaveAttribute('id', 'listing-tags')
  })
})
