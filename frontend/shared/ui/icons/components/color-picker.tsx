"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { ColorOption } from "../types";
import { COLOR_PRESETS, BACKGROUND_PRESETS } from "../constants";
import { getColorsByGroup, isValidHexColor, ensureHexPrefix } from "../colors";

export interface ColorPickerProps {
  /** Currently selected color value */
  value?: string;
  /** Callback when color is selected */
  onChange?: (color: string) => void;
  /** Type of color picker - determines presets shown */
  type?: "icon" | "background";
  /** Whether to show custom color input */
  showCustom?: boolean;
  /** Custom presets to use instead of defaults */
  presets?: ColorOption[];
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Trigger class name */
  triggerClassName?: string;
  /** Content class name */
  contentClassName?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * ColorPicker Component
 *
 * A popover-based color picker with preset colors and optional custom input.
 *
 * @example
 * // Basic usage
 * <ColorPicker value={color} onChange={setColor} />
 *
 * // Icon color picker
 * <ColorPicker type="icon" value={iconColor} onChange={setIconColor} />
 *
 * // Background color picker
 * <ColorPicker type="background" value={bgColor} onChange={setBgColor} />
 *
 * // Custom presets
 * <ColorPicker
 *   presets={[{ value: "#ff0000", label: "Red" }]}
 *   value={color}
 *   onChange={setColor}
 * />
 */
export function ColorPicker({
  value,
  onChange,
  type = "icon",
  showCustom = true,
  presets,
  trigger,
  triggerClassName,
  contentClassName,
  disabled,
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [customColor, setCustomColor] = React.useState("");

  // Get presets based on type or use custom presets
  const colorPresets = presets || (type === "background" ? BACKGROUND_PRESETS : COLOR_PRESETS);
  const groupedColors = getColorsByGroup(colorPresets);

  const handleSelect = (color: string) => {
    onChange?.(color);
    setOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = ensureHexPrefix(customColor);
    if (isValidHexColor(normalized)) {
      handleSelect(normalized);
      setCustomColor("");
    }
  };

  const getColorStyle = (color: string) => {
    if (color === "transparent") {
      return {
        background: `repeating-linear-gradient(
          45deg,
          #ccc,
          #ccc 2px,
          transparent 2px,
          transparent 4px
        )`,
      };
    }
    if (color === "inherit") {
      return { background: "currentColor" };
    }
    if (
      color === "default" ||
      color === "primary" ||
      color === "secondary" ||
      color === "accent" ||
      color === "muted" ||
      color === "destructive"
    ) {
      return { background: `hsl(var(--${color}))` };
    }
    return { backgroundColor: color };
  };

  const currentColorStyle = value ? getColorStyle(value) : {};

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {trigger || (
          <Button
            variant="outline"
            size="icon"
            className={cn("h-8 w-8", triggerClassName)}
          >
            <div
              className="h-5 w-5 rounded border"
              style={currentColorStyle}
            />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-64 p-2", contentClassName)}
        align="start"
      >
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {Object.entries(groupedColors).map(([group, colors]) => (
              <div key={group}>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  {group}
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={cn(
                        "h-6 w-6 rounded border transition-all hover:scale-110 relative",
                        value === color.value && "ring-2 ring-primary ring-offset-2"
                      )}
                      style={getColorStyle(color.value)}
                      onClick={() => handleSelect(color.value)}
                      title={color.label}
                    >
                      {value === color.value && (
                        <Check className="h-3 w-3 absolute inset-0 m-auto text-white mix-blend-difference" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {showCustom && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Custom
                </p>
                <form onSubmit={handleCustomSubmit} className="flex gap-1">
                  <Input
                    type="text"
                    placeholder="#000000"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="h-7 text-xs"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2"
                    disabled={!customColor}
                  >
                    Add
                  </Button>
                </form>
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export default ColorPicker;
