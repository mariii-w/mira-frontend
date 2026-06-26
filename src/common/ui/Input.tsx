import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string | null
  size?: InputSize
}

const SIZE: Record<InputSize, string> = {
  sm: 'h-9 px-3 text-small',
  md: 'h-11 px-4 text-body',
  lg: 'h-12 px-5 text-body',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, id, size = 'md', 'aria-describedby': ariaDescribedby, ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hasError = !!error
  const errorId = `${inputId}-error`
  const describedBy = [ariaDescribedby, hasError ? errorId : undefined].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex w-full flex-col gap-1.5">
      <input
        ref={ref}
        id={inputId}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full text-foreground',
          SIZE[size],
          'bg-linen border rounded-lg',
          'placeholder:text-muted',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          hasError
            ? 'border-red-500 focus-visible:ring-red-500'
            : 'border-border focus-visible:ring-primary',
          className,
        )}
        {...rest}
      />
      {hasError && (
        <p id={errorId} role="alert" className="text-small text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})
