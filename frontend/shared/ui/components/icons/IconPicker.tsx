"use client";

import { useState } from "react";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { getIconComponent } from "./icon-data";
import { ColorPicker } from "./ColorPicker";
import { IconGrid } from "./IconGrid";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IconPickerProps {
  icon?: string;
  color?: string;
  backgroundColor?: string;
  onIconChange?: (icon: string) => void;
  onColorChange?: (color: string) => void;
  onBackgroundChange?: (color: string) => void;
  showColor?: boolean;
  showBackground?: boolean;
  trigger?: React.ReactNode;
  className?: string;
}

export function IconPicker({
  icon = "Smile",
  color = "default",
  backgroundColor = "transparent",
  onIconChange,
  onColorChange,
  onBackgroundChange,
  showColor = true,
  showBackground = false,
  trigger,
  className,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);

  const IconComponent = getIconComponent(icon);

  const handleIconSelect = (iconName: string) => {
    onIconChange?.(iconName);
  };

  const handleColorChange = (newColor: string) => {
    onColorChange?.(newColor);
  };

  const handleBackgroundChange = (newColor: string) => {
    onBackgroundChange?.(newColor);
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      className={cn("gap-2", className)}
      type="button"
    >
      <div
        className="flex size-6 items-center justify-center rounded"
        style={{
          backgroundColor: backgroundColor === "transparent" ? undefined : backgroundColor,
        }}
      >
        <IconComponent
          className="size-4"
          style={{ color: color === "default" ? "currentColor" : color }}
        />
      </div>
      <span>Change Icon</span>
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent className="w-[480px]" align="start">
        <Tabs defaultValue="icon" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="icon">Icon</TabsTrigger>
            {showColor && <TabsTrigger value="color">Color</TabsTrigger>}
            {showBackground && <TabsTrigger value="background">Background</TabsTrigger>}
          </TabsList>

          <TabsContent value="icon" className="space-y-4 pt-4">
            <IconGrid
              selectedIcon={icon}
              onSelectIcon={handleIconSelect}
              iconColor={color}
            />
          </TabsContent>

          {showColor && (
            <TabsContent value="color" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Icon Color</Label>
                <ColorPicker
                  value={color}
                  onChange={handleColorChange}
                  type="icon"
                  showCustom={true}
                />
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="flex items-center justify-center rounded-md border p-8">
                  <div
                    className="flex size-16 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: backgroundColor === "transparent" ? undefined : backgroundColor,
                    }}
                  >
                    <IconComponent
                      className="size-8"
                      style={{ color: color === "default" ? "currentColor" : color }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {showBackground && (
            <TabsContent value="background" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Background Color</Label>
                <ColorPicker
                  value={backgroundColor}
                  onChange={handleBackgroundChange}
                  type="background"
                  showCustom={true}
                />
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="flex items-center justify-center rounded-md border p-8">
                  <div
                    className="flex size-16 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: backgroundColor === "transparent" ? undefined : backgroundColor,
                    }}
                  >
                    <IconComponent
                      className="size-8"
                      style={{ color: color === "default" ? "currentColor" : color }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
