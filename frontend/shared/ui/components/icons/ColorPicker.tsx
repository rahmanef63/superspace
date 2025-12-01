"use client";

import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import Color from "color";
import { cn } from "@/lib/utils";
import { COLOR_PRESETS, BACKGROUND_PRESETS, ColorOption, getColorValue } from "./icon-data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ColorPicker as ShadcnColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerOutput,
} from "@/components/ui/shadcn-io/color-picker";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  type?: "icon" | "background";
  showCustom?: boolean;
  className?: string;
  trigger?: React.ReactNode;
}

export function ColorPicker({
  value,
  onChange,
  type = "icon",
  showCustom = true,
  className,
  trigger,
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value.startsWith("#") ? value : "#3b82f6");
  const presets = type === "background" ? BACKGROUND_PRESETS : COLOR_PRESETS;

  // Group colors by their group property
  const groupedColors = presets.reduce((acc, color) => {
    const group = color.group || "Other";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(color);
    return acc;
  }, {} as Record<string, ColorOption[]>);

  const handleColorSelect = (color: string) => {
    onChange(color);
  };

  const handleCustomColorChange = (hexColor: string) => {
    setCustomColor(hexColor);
    onChange(hexColor);
  };

  // Handle color picker change from shadcn color picker
  const handleColorPickerChange = useCallback(
    (colorValue: Parameters<typeof Color.rgb>[0]) => {
      try {
        if (Array.isArray(colorValue)) {
          const [r, g, b] = colorValue as number[];
          const color = Color.rgb(r, g, b);
          const hex = color.hex();
          setCustomColor(hex);
          onChange(hex);
        }
      } catch {
        // Ignore invalid colors
      }
    },
    [onChange]
  );

  const getDisplayColor = (colorValue: string): string => {
    if (colorValue === "default" || colorValue === "primary" || colorValue === "secondary" || colorValue === "accent") {
      return getColorValue(colorValue);
    }
    if (colorValue === "transparent") {
      return "transparent";
    }
    return colorValue;
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      className={cn("justify-start gap-2", className)}
      type="button"
    >
      <div
        className={cn(
          "size-5 rounded border",
          value === "transparent" && "bg-gradient-to-br from-transparent via-gray-200 to-transparent"
        )}
        style={{
          backgroundColor: value === "transparent" ? undefined : getDisplayColor(value),
        }}
      />
      <span className="flex-1 text-left">
        {presets.find((c) => c.value === value)?.label || "Custom"}
      </span>
    </Button>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            {showCustom && <TabsTrigger value="custom">Custom</TabsTrigger>}
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            {Object.entries(groupedColors).map(([groupName, colors]) => (
              <div key={groupName} className="space-y-2">
                <Label className="text-xs text-muted-foreground">{groupName}</Label>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((color) => {
                    const isSelected = value === color.value;
                    const displayColor = getDisplayColor(color.value);

                    return (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorSelect(color.value)}
                        className={cn(
                          "relative size-9 rounded-md border-2 transition-all hover:scale-110",
                          isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent",
                          color.value === "transparent" && "bg-gradient-to-br from-white via-gray-100 to-white"
                        )}
                        style={{
                          backgroundColor: color.value === "transparent" ? undefined : displayColor,
                        }}
                        title={color.label}
                      >
                        {isSelected && (
                          <Check className="absolute inset-0 m-auto size-4 text-white drop-shadow-lg" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {showCustom && (
            <TabsContent value="custom" className="space-y-4 pt-2">
              <ShadcnColorPicker
                value={customColor}
                onChange={handleColorPickerChange}
                className="gap-3"
              >
                <ColorPickerSelection className="h-32 rounded-md" />
                <ColorPickerHue />
                <div className="flex items-center gap-2">
                  <ColorPickerOutput />
                  <ColorPickerEyeDropper />
                </div>
                <ColorPickerFormat />
              </ShadcnColorPicker>

              {/* Hex input for manual entry */}
              <div className="flex gap-2 pt-2 border-t">
                <Input
                  type="text"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 font-mono h-9"
                />
                <div
                  className="size-9 rounded-md border shrink-0"
                  style={{ backgroundColor: customColor }}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
