import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/cn';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'icon'| 'userBadge';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary:   'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover',
  accent:    'bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-hover',
  secondary: 'bg-transparent text-foreground border border-charcoal hover:bg-charcoal/5 active:bg-charcoal/10',
  ghost:     'bg-transparent text-foreground hover:bg-foreground/5 active:bg-foreground/10',
  icon:      'bg-transparent text-foreground border border-border hover:bg-foreground/5 active:bg-foreground/10',
  userBadge: 'bg-cream text-charcoal border-charcoal hover:bg-charcoal/20 active:bg-charcoal/20',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-small [&_svg]:size-4',
  md: 'h-11 px-5 text-body [&_svg]:size-[18px]',
  lg: 'h-14 px-8 text-body [&_svg]:size-5',
};

const GAP: Record<ButtonSize, string> = {
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-3',
};

const ICON_SIZE: Record<ButtonSize, string> = {
  sm: 'size-9 [&_svg]:size-4',
  md: 'size-11 [&_svg]:size-5',
  lg: 'size-14 [&_svg]:size-6',
};

const SPINNER: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    disabled,
    type = 'button',
    className,
    children,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const isIcon = variant === 'icon';
  const isDisabled = disabled || loading;

  if (import.meta.env.DEV && isIcon && !ariaLabel) {
    console.warn('[Button] icon variant is missing `aria-label`.');
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      data-variant={variant}
      data-size={size}
      className={cn(
        'relative inline-flex items-center justify-center font-medium rounded-full cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        isIcon ? ICON_SIZE[size] : SIZE[size],
        VARIANT[variant],
        fullWidth && !isIcon && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && (
        <>
          <span aria-hidden="true" className="absolute inset-0 inline-flex items-center justify-center">
            <Loader2 size={SPINNER[size]} className="animate-spin motion-reduce:animate-none" />
          </span>
          <span className="sr-only">Loading…</span>
        </>
      )}
      <span className={cn('inline-flex items-center justify-center', !isIcon && GAP[size], loading && 'invisible')}>
        {!isIcon && leadingIcon && <span aria-hidden="true" className="inline-flex shrink-0">{leadingIcon}</span>}
        {isIcon ? <span aria-hidden="true" className="inline-flex shrink-0">{children}</span> : children}
        {!isIcon && trailingIcon && <span aria-hidden="true" className="inline-flex shrink-0">{trailingIcon}</span>}
      </span>
    </button>
  );
});