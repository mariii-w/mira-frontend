import { ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';

export interface BreadcrumbLink {
  name: string;
  href: string;
}

export interface BreadcrumbProps {
  links: BreadcrumbLink[];
  className?: string;
}

const BREADCRUMB_LINKS: BreadcrumbLink[] = [
  { name: 'Home',     href: '/'              },
  { name: 'Products', href: '/products'      },
  { name: 'Category', href: '/products/category' },
  { name: 'Item',     href: '/products/category/item' },
];

export function Breadcrumb({ 
    links, 
    className 
}: BreadcrumbProps) 
{
  return (
    <nav aria-label="breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1 text-body">
        {links.map((link, index) => {
          const isLast = index === links.length - 1;

          return (
            <li key={link.href} className="flex items-center gap-1">
              {isLast ? (
                <span
                  className="font-medium text-charcoal"
                  aria-current="page"
                >
                  {link.name}
                </span>
              ) : (
                <a
                  href={link.href}
                  className="text-charcoal hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              )}

              {!isLast && (
                <ChevronRight className="text-muted-foreground" size={16} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


export { BREADCRUMB_LINKS };