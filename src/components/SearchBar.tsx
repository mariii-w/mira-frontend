import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";
import { Button } from "./Button";
import * as Popover from "@radix-ui/react-popover";
import { Label } from "./Label";
import { Input } from "./Input";
import { MapPin } from 'lucide-react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>
{
  place?: string
  radius?: number
}

export const SearchBar = forwardRef<HTMLInputElement, InputProps>(function SearchBar(
  { className,
    place,
    radius = 20,
     ...rest 
    },
  ref, 
) {
  let placeButtonContent = (!place ? "Ort": place) + " - " + radius +"km"
  return (
    <div className="relative w-full">
      <input
        ref={ref}
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
        <div className="my-1 w-0.5 bg-border/30" />
        <div className="p-2">
            <Popover.Root>
                <Popover.Trigger asChild>
                    <Button variant="ghost" leadingIcon={<MapPin/>}>{placeButtonContent}</Button>
                </Popover.Trigger>
                <Popover.Portal>                    
                    <Popover.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-80 rounded-xl border border-border bg-surface p-2 shadow-lg"
                    >
                        <div className="flex flex-col gap-1.5">
                            <Label>Ort</Label>
                            <Input placeholder="Ortssuche" />
                        </div>
                        <div className="my-1 h-px bg-border/30" />
                        <div className="flex flex-col gap-1.5">
                            <Label>Radius</Label>
                            {/* Insert Slider Component */}
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
        <Button variant="accent">Suchen</Button>
      </div>
    </div>
  );
});