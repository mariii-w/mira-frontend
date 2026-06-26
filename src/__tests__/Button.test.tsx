import '@testing-library/jest-dom/vitest';
import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../common/ui/Button';

describe('<Button />', () => {
  it('renders with type=button by default', () => {
    render(<Button>Hello</Button>);
    expect(screen.getByRole('button', { name: 'Hello' })).toHaveAttribute('type', 'button');
  });

  it('applies correct data-variant and data-size attributes', () => {
    render(<Button variant="accent" size="lg">Action</Button>);
    const btn = screen.getByRole('button', { name: 'Action' });
    expect(btn).toHaveAttribute('data-variant', 'accent');
    expect(btn).toHaveAttribute('data-size', 'lg');
  });

  it('disables and sets aria-disabled when disabled', () => {
    render(<Button disabled>Action</Button>);
    const btn = screen.getByRole('button', { name: 'Action' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not fire onClick when disabled or loading', () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button disabled onClick={onClick}>Action</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Action' }));
    rerender(<Button loading onClick={onClick}>Action</Button>);
    fireEvent.click(screen.getByRole('button', { name: /Action/ }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('sets aria-busy and renders sr-only text when loading', () => {
    render(<Button loading>Saving</Button>);
    const btn = screen.getByRole('button', { name: /Saving/ });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Action</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Action' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('warns when icon variant is missing aria-label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Button variant="icon"><span>x</span></Button>);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('marks leading and trailing icons as aria-hidden', () => {
    render(
      <Button leadingIcon={<span data-testid="lead">L</span>} trailingIcon={<span data-testid="trail">T</span>}>
        Search
      </Button>
    );
    expect(screen.getByTestId('lead').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('trail').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies w-full on text variants but not icon', () => {
    const { rerender } = render(<Button fullWidth>Wide</Button>);
    expect(screen.getByRole('button', { name: 'Wide' }).className).toContain('w-full');
    rerender(<Button fullWidth variant="icon" aria-label="Close"><span>x</span></Button>);
    expect(screen.getByRole('button', { name: 'Close' }).className).not.toContain('w-full');
  });

  it('forwards ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Action</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});