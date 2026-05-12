import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | null
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, id, ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hasError = !!error
  const errorId = `${inputId}-error`

  return (
    <div className="flex w-full flex-col gap-1.5">
      <input
        ref={ref}
        id={inputId}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={cn(
          'w-full h-11 px-4 text-body text-foreground',
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