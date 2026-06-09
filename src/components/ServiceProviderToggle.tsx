import * as Switch from "@radix-ui/react-switch";
import { useRef, useEffect, useState, type ReactNode } from "react";

interface ServiceProviderToggleProps {
  id: string;
  labelLeft: string;
  labelRight: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ServiceProviderToggle({
  id,
  labelLeft,
  labelRight,
  iconLeft,
  iconRight,
  checked,
  onCheckedChange,
}: ServiceProviderToggleProps) {
  const leftRef = useRef<HTMLSpanElement>(null);
  const rightRef = useRef<HTMLSpanElement>(null);
  const [thumbStyle, setThumbStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const el = checked ? rightRef.current : leftRef.current;
    if (!el) return;
    setThumbStyle({ left: el.offsetLeft, width: el.offsetWidth });
  }, [checked, labelLeft, labelRight]);

  return (
    <Switch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="relative inline-flex h-15 w-fit items-center rounded-full bg-linen px-1 cursor-pointer"
    >
      {/* Sliding thumb */}
      <Switch.Thumb
        style={thumbStyle}
        className="absolute top-1.5 h-12 rounded-full bg-primary transition-all duration-150"
      />

      {/* Left label */}
      <span
        ref={leftRef}
        className={`relative z-10 inline-flex items-center gap-1.5 px-4 py-1 text-h2 font-medium select-none transition-colors duration-150 whitespace-nowrap ${
          !checked ? "text-surface" : "text-charcoal"
        }`}
      >
        {iconLeft && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{iconLeft}</span>}
        {labelLeft}
      </span>

      {/* Right label */}
      <span
        ref={rightRef}
        className={`relative z-10 inline-flex items-center gap-1.5 px-4 py-1 text-h2 font-medium select-none transition-colors duration-150 whitespace-nowrap ${
          checked ? "text-surface" : "text-charcoal"
        }`}
      >
        {iconRight && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{iconRight}</span>}
        {labelRight}
      </span>
    </Switch.Root>
  );
}
