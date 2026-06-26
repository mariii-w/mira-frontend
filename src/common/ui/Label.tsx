import type { LabelHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required, className, children, ...rest }: LabelProps) {
  return (
    <label
      className={cn('text-small font-medium text-foreground', className)}
      {...rest}
    >
      {children}
      {required && <span aria-hidden="true" className="ml-0.5 text-accent">*</span>}
    </label>
  );
}