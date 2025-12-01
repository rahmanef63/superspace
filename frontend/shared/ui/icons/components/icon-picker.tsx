"use client";

import * as React from "react";
import { Palette } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import type { IconName } from "../types";
import { DEFAULT_ICON } from "../constants";
import { DynamicIcon } from "../dynamic-icon";
import { IconGrid } from "./icon-grid";
import { ColorPicker } from "./color-picker";

export interface IconPickerProps {
  /** Currently selected icon name */
  icon?: IconName;
  /** Currently selected icon color */
  color?: string;
  /** Currently selected background color */
  backgroundColor?: string;
  /** Callback when icon is changed */
  onIconChange?: (iconName: IconName) => void;
  /** Callback when color is changed */
  onColorChange?: (color: string) => void;
  /** Callback when background color is changed */
  onBackgroundChange?: (color: string) => void;
  /** Whether to show color picker */
  showColor?: boolean;
  /** Whether to show background color picker */
  showBackground?: boolean;
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Trigger class name */
  triggerClassName?: string;
  /** Content class name */
  contentClassName?: string;
  /** Custom class name for wrapper */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Side of the popover */
  side?: "top" | "right" | "bottom" | "left";
  /** Alignment of the popover */
  align?: "start" | "center" | "end";
}

/**
 * IconPicker Component
 *
 * A comprehensive icon picker with optional color and background selection.
 *
 * @example
 * // Basic usage
 * <IconPicker icon={icon} onIconChange={setIcon} />
 *
 * // With color options
 * <IconPicker
 *   icon={icon}
 *   color={color}
 *   backgroundColor={bgColor}
 *   onIconChange={setIcon}
 *   onColorChange={setColor}
 *   onBackgroundChange={setBgColor}
 *   showColor
 *   showBackground
 * />
 *
 * // Custom trigger
 * <IconPicker
 *   icon={icon}
 *   onIconChange={setIcon}
 *   trigger={<Button>Select Icon</Button>}
 * />
 */
export function IconPicker({
  icon = DEFAULT_ICON,
  color,
  backgroundColor,
  onIconChange,
  onColorChange,
  onBackgroundChange,
  showColor = false,
  showBackground = false,
  trigger,
  triggerClassName,
  contentClassName,
  className,
  disabled,
  side = "bottom",
  align = "start",
}: IconPickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleIconSelect = (iconName: IconName) => {
    onIconChange?.(iconName);
  };

  const getIconStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};

    if (color) {
      if (["primary", "secondary", "accent", "destructive", "muted"].includes(color)) {
        style.color = `hsl(var(--${color}))`;
      } else {
        style.color = color;
      }
    }

    if (backgroundColor) {
      if (backgroundColor === "transparent") {
        style.background = "transparent";
      } else if (
        ["primary", "secondary", "accent", "destructive", "muted"].includes(
          backgroundColor
        )
      ) {
        style.backgroundColor = `hsl(var(--${backgroundColor}))`;
      } else {
        style.backgroundColor = backgroundColor;
      }
    }

    return style;
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          {trigger || (
            <Button
              variant="outline"
              size="icon"
              className={cn("h-10 w-10", triggerClassName)}
              style={backgroundColor ? { backgroundColor } : undefined}
            >
              <DynamicIcon
                name={icon}
                className="h-5 w-5"
                style={getIconStyle()}
              />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-80 p-3", contentClassName)}
          side={side}
          align={align}
        >
        <div className="space-y-3">
          {/* Color options row */}
          {(showColor || showBackground) && (
            <>
              <div className="flex items-center gap-2">
                {showColor && (
                  <div className="flex items-center gap-1.5">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Color</span>
                    <ColorPicker
                      value={color}
                      onChange={onColorChange}
                      type="icon"
                    />
                  </div>
                )}
                {showBackground && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Background</span>
                    <ColorPicker
                      value={backgroundColor}
                      onChange={onBackgroundChange}
                      type="background"
                    />
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Icon grid */}
          <IconGrid
            selectedIcon={icon}
            onSelectIcon={handleIconSelect}
            showSearch
            showCategories
            height={250}
            columns={6}
          />
        </div>
      </PopoverContent>
    </Popover>
    </div>
  );
}

export default IconPicker;
