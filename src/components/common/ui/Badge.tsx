import { cn } from '../../../lib/cn';

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
      'inline-flex items-center min-h-9 rounded-full px-4 py-1.5 font-medium text-h3',
      VARIANT[variant]
    )}>
      <p className="text-center">{text}</p>
    </div>
  );
}