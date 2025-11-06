import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Notion-like color palette
export const COLOR_PALETTE = [
  { name: 'Gray', value: '#6b7280', light: '#f3f4f6' },
  { name: 'Brown', value: '#92400e', light: '#fef3c7' },
  { name: 'Orange', value: '#ea580c', light: '#fed7aa' },
  { name: 'Yellow', value: '#ca8a04', light: '#fef08a' },
  { name: 'Green', value: '#16a34a', light: '#bbf7d0' },
  { name: 'Blue', value: '#2563eb', light: '#bfdbfe' },
  { name: 'Purple', value: '#9333ea', light: '#e9d5ff' },
  { name: 'Pink', value: '#db2777', light: '#fbcfe8' },
  { name: 'Red', value: '#dc2626', light: '#fecaca' },
];

export function getRandomColor(): string {
  const randomIndex = Math.floor(Math.random() * COLOR_PALETTE.length);
  return COLOR_PALETTE[randomIndex].value;
}

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  trigger?: React.ReactNode;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  value, 
  onChange,
  trigger 
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <div 
              className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: value || COLOR_PALETTE[0].value }}
            />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-3" align="start">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Select a color</p>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  onChange(color.value);
                  setOpen(false);
                }}
                className={cn(
                  "group relative flex flex-col items-center gap-1 rounded-md p-2 transition-colors hover:bg-accent",
                  value === color.value && "bg-accent"
                )}
              >
                <div 
                  className="h-6 w-6 rounded-full border-2 border-white shadow-sm ring-1 ring-black/5"
                  style={{ backgroundColor: color.value }}
                />
                {value === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white drop-shadow-md" />
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
