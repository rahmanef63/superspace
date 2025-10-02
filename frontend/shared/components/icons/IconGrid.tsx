"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ICON_CATEGORIES,
  ICONS_BY_CATEGORY,
  IconCategory,
  getIconComponent,
  searchIcons,
} from "./icon-data";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IconGridProps {
  selectedIcon?: string;
  onSelectIcon: (iconName: string) => void;
  iconColor?: string;
  className?: string;
}

export function IconGrid({
  selectedIcon,
  onSelectIcon,
  iconColor = "currentColor",
  className,
}: IconGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IconCategory>("common");

  // Filter icons based on search and category
  const filteredIcons = useMemo(() => {
    return searchIcons(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const handleIconClick = (iconName: string) => {
    onSelectIcon(iconName);
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = getIconComponent(iconName);
    return <IconComponent className="size-5" style={{ color: iconColor }} />;
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value as IconCategory)}
      >
        <TabsList className="grid w-full grid-cols-5 h-auto">
          {ICON_CATEGORIES.slice(0, 10).map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="capitalize text-xs py-1.5"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Icon Grid */}
      <ScrollArea className="h-[300px] rounded-md border">
        <div className="grid grid-cols-6 gap-1 p-2">
          {filteredIcons.length > 0 ? (
            filteredIcons.map((iconName) => {
              const isSelected = selectedIcon === iconName;

              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => handleIconClick(iconName)}
                  className={cn(
                    "flex items-center justify-center rounded-md p-3 transition-all hover:bg-accent",
                    isSelected && "bg-accent ring-2 ring-primary ring-offset-2"
                  )}
                  title={iconName}
                >
                  {renderIcon(iconName)}
                </button>
              );
            })
          ) : (
            <div className="col-span-6 flex h-40 items-center justify-center text-sm text-muted-foreground">
              No icons found
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Selected Icon Info */}
      {selectedIcon && (
        <div className="flex items-center gap-3 rounded-md border p-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-accent">
            {renderIcon(selectedIcon)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{selectedIcon}</p>
            <p className="text-xs text-muted-foreground">
              {filteredIcons.length} icons in {selectedCategory}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
