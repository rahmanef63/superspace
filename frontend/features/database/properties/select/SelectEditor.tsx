import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import type { SelectOptions, SelectChoice } from '@/frontend/shared/foundation/types/property-options';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Plus, X, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorPicker, getRandomColor } from '../../components/ColorPicker';

// Default choices when property.options is not configured - REMOVED, use empty array instead
// const DEFAULT_CHOICES: SelectChoice[] = [
//   { id: 'option-1', name: 'Option 1', color: '#6b7280' },
//   { id: 'option-2', name: 'Option 2', color: '#3b82f6' },
//   { id: 'option-3', name: 'Option 3', color: '#10b981' },
// ];

export const SelectEditor: React.FC<PropertyEditorProps> = ({ value, onChange, property, onPropertyUpdate }) => {
  const [open, setOpen] = useState(false);
  const selectOptions = property.options as SelectOptions | undefined;
  
  // Use property options if available, otherwise use default choices
  const initialChoices = selectOptions?.choices && selectOptions.choices.length > 0 
    ? selectOptions.choices 
    : [];
    
  const [selectedValue, setSelectedValue] = useState<string>(value ? String(value) : '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempNewChoice, setTempNewChoice] = useState<SelectChoice | null>(null);

  // ✅ Use Convex data directly, no local state for choices
  // This prevents reload loops when options update
  const choices = selectOptions?.choices && selectOptions.choices.length > 0 
    ? selectOptions.choices 
    : [];

  useEffect(() => {
    setSelectedValue(value ? String(value) : '');
  }, [value]);
  
  // Reset search query when dropdown closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setShowColorPicker(false);
      setTempNewChoice(null);
    }
  }, [open]);

  const handleSelect = (choiceName: string) => {
    setSelectedValue(choiceName);
    onChange(choiceName);
    setOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValue('');
    onChange(null);
  };

  const handleCreateWithColor = async (color?: string) => {
    if (searchQuery.trim() && (selectOptions?.allowCreate !== false)) {
      const finalColor = color || getRandomColor();
      
      const newChoice: SelectChoice = {
        id: searchQuery.toLowerCase().replace(/\s+/g, '-'),
        name: searchQuery.trim(),
        color: finalColor,
      };
      
      const updatedChoices = [...choices, newChoice];
      
      // ✅ PERSIST TO DATABASE - Convex will handle state update!
      if (onPropertyUpdate) {
        try {
          await onPropertyUpdate({
            selectOptions: updatedChoices, // ✅ Fix: Use 'selectOptions' not 'choices'
          });
          // ✅ No setChoices() - Convex reactive query will update automatically!
        } catch (error) {
          console.error('Failed to save new choice:', error);
          // No rollback needed - Convex state remains unchanged on error
          return; // Exit early on error
        }
      }
      
      handleSelect(newChoice.name);
      setShowColorPicker(false);
      setTempNewChoice(null);
    }
  };

  const handleOpenColorPicker = () => {
    if (searchQuery.trim()) {
      setTempNewChoice({
        id: searchQuery.toLowerCase().replace(/\s+/g, '-'),
        name: searchQuery.trim(),
        color: getRandomColor(),
      });
      setShowColorPicker(true);
    }
  };

  const selectedChoice = choices.find(choice => choice.name === selectedValue);
  const filteredChoices = choices.filter(choice =>
    choice.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const canCreateNew = searchQuery.trim() && 
    !filteredChoices.some(choice => choice.name.toLowerCase() === searchQuery.toLowerCase()) &&
    (selectOptions?.allowCreate !== false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9"
        >
          {selectedChoice ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Badge 
                variant="secondary" 
                className="gap-1 shrink-0"
                style={selectedChoice.color ? { 
                  backgroundColor: selectedChoice.color + '20',
                  borderColor: selectedChoice.color,
                  color: selectedChoice.color 
                } : undefined}
              >
                {selectedChoice.icon && <span>{selectedChoice.icon}</span>}
                <span className="truncate">{selectedChoice.name}</span>
              </Badge>
              <X
                className="h-3 w-3 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            </div>
          ) : (
            <span className="text-muted-foreground">Pilih opsi...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        {showColorPicker && tempNewChoice ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Pilih warna untuk tag baru</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowColorPicker(false);
                  setTempNewChoice(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary"
                style={{ 
                  backgroundColor: tempNewChoice.color + '20',
                  borderColor: tempNewChoice.color,
                  color: tempNewChoice.color 
                }}
              >
                {tempNewChoice.name}
              </Badge>
            </div>
            <ColorPicker
              value={tempNewChoice.color}
              onChange={(color) => {
                setTempNewChoice({ ...tempNewChoice, color });
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleCreateWithColor(tempNewChoice.color)}
              >
                Buat Tag
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCreateWithColor()}
              >
                Warna Acak
              </Button>
            </div>
          </div>
        ) : (
          <Command>
            <CommandInput 
              placeholder="Cari atau buat opsi..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {canCreateNew ? (
                  <div className="p-2 space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleCreateWithColor()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Buat &quot;{searchQuery}&quot; (warna acak)
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleOpenColorPicker}
                    >
                      <Palette className="mr-2 h-4 w-4" />
                      Buat dengan pilih warna
                    </Button>
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm">Tidak ada opsi ditemukan.</div>
                )}
              </CommandEmpty>
              {filteredChoices.length > 0 && (
                <CommandGroup>
                  {filteredChoices.map((choice) => (
                    <CommandItem
                      key={choice.id || choice.name}
                      value={choice.name}
                      onSelect={() => handleSelect(choice.name)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedValue === choice.name ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <Badge 
                        variant="secondary"
                        className="truncate"
                        style={choice.color ? { 
                          backgroundColor: choice.color + '20',
                          borderColor: choice.color,
                          color: choice.color 
                        } : undefined}
                      >
                        {choice.icon && <span className="mr-1">{choice.icon}</span>}
                        {choice.name}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
};
