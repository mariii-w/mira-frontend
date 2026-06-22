import '@testing-library/jest-dom/vitest'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ServiceUserToggle } from '../components/ServiceUserToggle'

function renderToggle(checked: boolean) {
  return render(
    <ServiceUserToggle
      id="t"
      labelLeft="Services"
      labelRight="Users"
      checked={checked}
      onCheckedChange={() => {}}
    />
  )
}

describe('<ServiceUserToggle /> entry slide', () => {
  // The two tabs are separate routes, so the toggle never sees `checked` change
  // on a live node. The animation comes from mounting the pill on the opposite
  // side, then sliding it to the active side after first paint. These tests
  // prove the pill actually moves (i.e. a transition has something to animate).

  it('mounts on the LEFT then slides RIGHT when checked (Users page)', async () => {
    renderToggle(true)
    const pill = screen.getByTestId('toggle-pill')
    // First paint: opposite side → left, green
    expect(pill).toHaveClass('translate-x-0')
    expect(pill).toHaveClass('bg-primary')
    // After settling: active side → right, violet
    await waitFor(() => expect(pill).toHaveClass('translate-x-full'))
    expect(pill).toHaveClass('bg-accent')
  })

  it('mounts on the RIGHT then slides LEFT when unchecked (Services page)', async () => {
    renderToggle(false)
    const pill = screen.getByTestId('toggle-pill')
    expect(pill).toHaveClass('translate-x-full')
    await waitFor(() => expect(pill).toHaveClass('translate-x-0'))
    expect(pill).toHaveClass('bg-primary')
  })
})

describe('<ServiceUserToggle /> focus styling', () => {
  it('has a visible focus ring on the switch root', () => {
    renderToggle(false)
    const switchRoot = screen.getByRole('switch')
    expect(switchRoot).toHaveClass('focus-visible:ring-2')
    expect(switchRoot).toHaveClass('focus-visible:ring-primary')
  })
})
