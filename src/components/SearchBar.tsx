import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";
import { Button } from "./Button";
import * as Popover from "@radix-ui/react-popover";
import { Label } from "./Label";
import { Input } from "./Input";
import { MapPin, Search } from 'lucide-react'
import { Slider } from "./Slider";

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  city?: string
  radius?: number
  onCityChange?: (city: string) => void
  onRadiusChange?: (radius: number) => void
  onSearch?: () => void
  /** Show the location/radius popover. Defaults to true (Services search). */
  showLocation?: boolean
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    className,
    city = '',
    radius = 20,
    onCityChange,
    onRadiusChange,
    onSearch,
    showLocation = true,
    ...rest
  },
  ref,
) {
  const locationLabel = (city || 'Location') + ' · ' + radius + 'km'

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        aria-label="Search"
        className={cn(
          'w-full h-15 px-4 text-body text-foreground',
          'bg-white border border-border rounded-4xl',
          'placeholder:text-muted',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...rest}
      />
      <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
        {showLocation && (
        <>
        <div className="my-1 w-0.5 bg-border/30" />
        <div className="p-2">
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button variant="ghost" leadingIcon={<MapPin />}>
                <span className="hidden lg:inline">{locationLabel}</span>
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={8}
                className="z-50 w-70 rounded-xl border border-border bg-surface p-2 shadow-lg"
              >
                <div className="mx-5">
                  <div className="flex flex-col gap-1.5">
                    <Label>Location</Label>
                    <Input
                      placeholder="Search location"
                      value={city}
                      onChange={(e) => onCityChange?.(e.target.value)}
                    />
                  </div>
                  <div className="my-2 h-px bg-border/30" />
                  <div className="flex flex-col gap-1.5">
                    <Label>Radius</Label>
                    <Slider
                      label="Radius"
                      min={1}
                      max={50}
                      unit="km"
                      value={radius}
                      onChange={onRadiusChange}
                    />
                  </div>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
        </>
        )}
        <Button variant="primary" onClick={onSearch} aria-label="Search">
          <Search size={18} className="lg:hidden" aria-hidden="true" />
          <span className="hidden lg:inline">Search</span>
        </Button>
      </div>
    </div>
  );
});
