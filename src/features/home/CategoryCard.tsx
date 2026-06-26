// src/components/CategoryCard.tsx

// Image with the category name overlaid

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface CategoryCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  name: string;
  imageSrc: string;
}

export function CategoryCard({ name, imageSrc, className, ...rest }: CategoryCardProps) {
  return (
    <button
      type="button"
      className={cn(
        'group relative aspect-square w-full overflow-hidden rounded-2xl',
        'border border-border bg-linen',
        'transition-transform duration-150',
        'hover:scale-[1.02] active:scale-[0.99]',
        'motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
        className,
      )}
      {...rest}
    >
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <span
        className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'rounded-xl bg-charcoal/90 px-4 py-2',
          'text-small font-bold text-cream',
        )}
      >
        {name}
      </span>
    </button>
  );
}