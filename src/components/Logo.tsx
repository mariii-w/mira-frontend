import type { ImgHTMLAttributes } from 'react';

import primaryUrl from '../assets/logos/primary.svg';
import secondaryUrl from '../assets/logos/secondary.svg';
import submarkUrl from '../assets/logos/submark.svg';
import iconUrl from '../assets/logos/icon.svg';
import blackUrl from '../assets/logos/black.svg';
import whiteUrl from '../assets/logos/white.svg';

export type LogoVariant =
  | 'primary'
  | 'stacked'
  | 'submark'
  | 'icon'
  | 'black'
  | 'white';

const variantSources: Record<LogoVariant, string> = {
  primary: primaryUrl,
  stacked: secondaryUrl,
  submark: submarkUrl,
  icon: iconUrl,
  black: blackUrl,
  white: whiteUrl,
};

interface LogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  variant?: LogoVariant;
  title?: string;
  height?: number | string;
}

export function Logo({
  variant = 'primary',
  title,
  height = 40,
  className,
  style,
  ...rest
}: LogoProps) {
  const decorative = !title;

  return (
    <img
      src={variantSources[variant]}
      alt={decorative ? '' : title}
      aria-hidden={decorative || undefined}
      data-variant={variant}
      className={className}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: 'auto',
        ...style,
      }}
      {...rest}
    />
  );
}