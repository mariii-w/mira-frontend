import { cn } from '../lib/cn';

export type BadgeVariant = 'primary' | 'accent';

const VARIANT: Record<BadgeVariant, string> = {
  primary: 'bg-primary text-primary-foreground',
  accent:  'bg-accent text-primary-foreground',
};

export interface BadgeProps {
  variant?: BadgeVariant;
  text: string;
}

export function Badge({ variant = 'primary', text }: BadgeProps) {
  return (
    <div className={cn(
      'inline-flex items-center h-11 rounded-full px-3 py-0.5 font-medium text-xl',
      VARIANT[variant]
    )}>
      <p>{text}</p>
    </div>
  );
}