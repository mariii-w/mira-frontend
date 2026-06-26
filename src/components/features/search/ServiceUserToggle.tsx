import * as Switch from "@radix-ui/react-switch";
import { type ReactNode, useEffect, useState } from "react";

interface ServiceUserToggleProps {
  id: string;
  labelLeft: string;
  labelRight: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ServiceUserToggle({
  id,
  labelLeft,
  labelRight,
  iconLeft,
  iconRight,
  checked,
  onCheckedChange,
}: ServiceUserToggleProps) {
  // On the initial route load, play an entry slide from the opposite side. Once
  // mounted in the persistent search layout, later route switches update `checked`
  // on this same DOM node and use the regular CSS transition. The double rAF
  // guarantees the initial start frame is painted before the change. Under
  // reduced motion the global duration rule makes this an instant snap.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setSettled(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  // Before settling, sit on the opposite side so the pill slides into place.
  const showRight = settled ? checked : !checked;

  return (
    <Switch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="relative inline-grid grid-cols-2 h-10 rounded-full bg-linen p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
    >
      {/* Sliding pill */}
      <span
        aria-hidden
        data-testid="toggle-pill"
        className={`toggle-pill-transition pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full ${
          showRight ? "translate-x-full bg-accent" : "translate-x-0 bg-primary"
        }`}
      />

      {/* Services label */}
      <span
        className={`relative z-10 inline-flex items-center justify-center gap-1.5 px-3 py-1 text-small font-medium select-none whitespace-nowrap transition-colors duration-300 ${
          showRight ? "text-charcoal" : "text-surface"
        }`}
      >
        {iconLeft && (
          <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{iconLeft}</span>
        )}
        {labelLeft}
      </span>

      {/* Users label */}
      <span
        className={`relative z-10 inline-flex items-center justify-center gap-1.5 px-3 py-1 text-small font-medium select-none whitespace-nowrap transition-colors duration-300 ${
          showRight ? "text-accent-foreground" : "text-charcoal"
        }`}
      >
        {iconRight && (
          <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{iconRight}</span>
        )}
        {labelRight}
      </span>
    </Switch.Root>
  );
}
