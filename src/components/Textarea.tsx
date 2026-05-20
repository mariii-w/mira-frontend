import { forwardRef, useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | null
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, rows = 4, error, id, ...rest }, ref) {
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const hasError = !!error
    const errorId = `${textareaId}-error`

    return (
      <div className="flex w-full flex-col gap-1.5">
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(
            'w-full px-4 py-3 text-body text-foreground',
            'bg-linen border rounded-lg',
            'placeholder:text-muted resize-y',
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
  }
)