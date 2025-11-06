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

export const MultiSelectEditor: React.FC<PropertyEditorProps> = ({ value, onChange, property, onPropertyUpdate }) => {
  const [open, setOpen] = useState(false);
  const selectOptions = property.options as SelectOptions | undefined;
  
  // ✅ Use Convex data directly - no local state for choices
  const choices = selectOptions?.choices && selectOptions.choices.length > 0 
    ? selectOptions.choices 
    : [];
  
  // Convert value to array of strings
  const selectedValues = Array.isArray(value) ? value.map(String) : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempNewChoice, setTempNewChoice] = useState<SelectChoice | null>(null);

  const handleToggle = (choiceName: string) => {
    let newValues: string[];
    
    if (selectedValues.includes(choiceName)) {
      // Remove if already selected
      newValues = selectedValues.filter(v => v !== choiceName);
    } else {
      // Add if not selected
      newValues = [...selectedValues, choiceName];
    }
    
    onChange(newValues.length > 0 ? newValues : null);
    setSearchQuery('');
  };

  const handleRemove = (choiceName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newValues = selectedValues.filter(v => v !== choiceName);
    onChange(newValues.length > 0 ? newValues : null);
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
            selectOptions: updatedChoices,
          });
          // ✅ No setChoices() - Convex reactive query will update automatically!
        } catch (error) {
          console.error('Failed to save new choice:', error);
          return; // Exit early on error
        }
      }
      
      handleToggle(newChoice.name);
      setShowColorPicker(false);
      setTempNewChoice(null);
    }
  };

  const handleOpenColorPicker = () => {
    if (searchQuery.trim()) {
      console.log('🎨 [MultiSelectEditor] Opening color picker for:', searchQuery.trim());
      setTempNewChoice({
        id: searchQuery.toLowerCase().replace(/\s+/g, '-'),
        name: searchQuery.trim(),
        color: getRandomColor(),
      });
      setShowColorPicker(true);
    }
  };

  const selectedChoices = choices.filter(choice => selectedValues.includes(choice.name));
  const filteredChoices = choices.filter(choice =>
    choice.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const canCreateNew = searchQuery.trim() && 
    !filteredChoices.some(choice => choice.name.toLowerCase() === searchQuery.toLowerCase()) &&
    (selectOptions?.allowCreate !== false);

  const handlePopoverChange = (isOpen: boolean) => {
    console.log(`🔽 [MultiSelectEditor] Dropdown ${isOpen ? 'OPENED' : 'CLOSED'}`);
    setOpen(isOpen);
  };

  return (
    <Popover open={open} onOpenChange={handlePopoverChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-9 h-auto"
        >
          <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">
            {selectedChoices.length > 0 ? (
              selectedChoices.map((choice) => (
                <Badge
                  key={choice.id || choice.name}
                  variant="secondary"
                  className="gap-1 shrink-0"
                  style={choice.color ? {
                    backgroundColor: choice.color + '20',
                    borderColor: choice.color,
                    color: choice.color
                  } : undefined}
                >
                  {choice.icon && <span>{choice.icon}</span>}
                  <span className="truncate max-w-[100px]">{choice.name}</span>
                  <X
                    className="h-3 w-3 opacity-50 hover:opacity-100"
                    onClick={(e) => handleRemove(choice.name, e)}
                  />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">Pilih opsi...</span>
            )}
          </div>
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
                  {filteredChoices.map((choice) => {
                    const isSelected = selectedValues.includes(choice.name);
                    return (
                      <CommandItem
                        key={choice.id || choice.name}
                        value={choice.name}
                        onSelect={() => handleToggle(choice.name)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0'
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
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
};
