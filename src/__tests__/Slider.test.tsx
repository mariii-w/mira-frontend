import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Slider } from '../common/ui/Slider'

function getSlider() {
  return screen.getByRole('slider')
}

describe('<Slider />', () => {
  it('renders a range input', () => {
    render(<Slider label="Volume" min={0} max={100} />)
    expect(getSlider()).toBeInTheDocument()
  })

  it('uses label as accessible name', () => {
    render(<Slider label="Service radius" min={10} max={200} />)
    expect(screen.getByRole('slider', { name: 'Service radius' })).toBeInTheDocument()
  })

  it('sets aria-valuemin and aria-valuemax', () => {
    render(<Slider label="Price" min={5} max={50} />)
    const slider = getSlider()
    expect(slider).toHaveAttribute('aria-valuemin', '5')
    expect(slider).toHaveAttribute('aria-valuemax', '50')
  })

  it('sets aria-valuenow to defaultValue when provided', () => {
    render(<Slider label="Radius" min={0} max={100} defaultValue={40} />)
    expect(getSlider()).toHaveAttribute('aria-valuenow', '40')
  })

  it('falls back to min when no defaultValue is provided', () => {
    render(<Slider label="Radius" min={10} max={100} />)
    expect(getSlider()).toHaveAttribute('aria-valuenow', '10')
  })

  it('sets aria-valuetext with unit when provided', () => {
    render(<Slider label="Radius" min={0} max={200} defaultValue={20} unit="km" />)
    expect(getSlider()).toHaveAttribute('aria-valuetext', '20 km')
  })

  it('sets aria-valuetext without unit when none provided', () => {
    render(<Slider label="Price" min={0} max={100} defaultValue={30} />)
    expect(getSlider()).toHaveAttribute('aria-valuetext', '30')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Slider label="Radius" min={0} max={100} disabled />)
    expect(getSlider()).toBeDisabled()
  })

  it('calls onChange when value changes (uncontrolled)', () => {
    const onChange = vi.fn()
    render(<Slider label="Price" min={0} max={100} onChange={onChange} />)
    fireEvent.change(getSlider(), { target: { value: '42' } })
    expect(onChange).toHaveBeenCalledWith(42)
  })

  it('updates internal value on change when uncontrolled', () => {
    render(<Slider label="Price" min={0} max={100} defaultValue={10} />)
    fireEvent.change(getSlider(), { target: { value: '55' } })
    expect(getSlider()).toHaveAttribute('aria-valuenow', '55')
  })

  it('uses controlled value and does not update internally', () => {
    const onChange = vi.fn()
    render(<Slider label="Price" min={0} max={100} value={30} onChange={onChange} />)
    fireEvent.change(getSlider(), { target: { value: '70' } })
    // controlled — value stays at what the parent provides
    expect(getSlider()).toHaveAttribute('aria-valuenow', '30')
    expect(onChange).toHaveBeenCalledWith(70)
  })

  it('calls onChangeCommitted on mouseup', () => {
    const onChangeCommitted = vi.fn()
    render(<Slider label="Price" min={0} max={100} defaultValue={20} onChangeCommitted={onChangeCommitted} />)
    fireEvent.mouseUp(getSlider(), { target: { value: '20' } })
    expect(onChangeCommitted).toHaveBeenCalledWith(20)
  })

  it('calls onChangeCommitted on arrow key release', () => {
    const onChangeCommitted = vi.fn()
    render(<Slider label="Price" min={0} max={100} defaultValue={20} onChangeCommitted={onChangeCommitted} />)
    fireEvent.keyUp(getSlider(), { key: 'ArrowRight', target: { value: '21' } })
    expect(onChangeCommitted).toHaveBeenCalledWith(21)
  })

  it('does not call onChangeCommitted on non-arrow keys', () => {
    const onChangeCommitted = vi.fn()
    render(<Slider label="Price" min={0} max={100} onChangeCommitted={onChangeCommitted} />)
    fireEvent.keyUp(getSlider(), { key: 'Tab' })
    expect(onChangeCommitted).not.toHaveBeenCalled()
  })

  it('links aria-describedby to hint element when hint is provided', () => {
    render(<Slider label="Radius" min={0} max={100} hint="Distance you can travel" />)
    const describedBy = getSlider().getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
  })

  it('does not set aria-describedby when no hint is provided', () => {
    render(<Slider label="Radius" min={0} max={100} />)
    expect(getSlider()).not.toHaveAttribute('aria-describedby')
  })
})
