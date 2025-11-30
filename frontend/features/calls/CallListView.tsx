"use client";

import { useMemo, useState, useEffect } from "react";
import { Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchBar } from "../chat/components/ui/SearchBar";
import { SecondaryList, itemVariant, registerBuiltInVariants } from "@/frontend/shared/ui/layout/sidebar/secondary";
import type { CallSummary } from "./types";

type CallListViewVariant = "standalone" | "layout";

interface CallListViewProps {
  calls: CallSummary[];
  selectedCallId?: string;
  onCallSelect?: (callId: string) => void;
  variant?: CallListViewVariant;
  loading?: boolean;
  error?: string;
}

export function CallListView({
  calls,
  selectedCallId,
  onCallSelect,
  variant = "standalone",
  loading = false,
  error,
}: CallListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Register built-in variants once
  useEffect(() => {
    registerBuiltInVariants();
  }, []);

  // Transform calls to SecondaryList items
  const items = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    const filtered = normalized
      ? calls.filter((call) => call.name.toLowerCase().includes(normalized))
      : calls;

    return filtered.map((call) => {
      // Map call direction to variant schema
      let direction: "in" | "out" | "missed";
      if (call.status === "missed") {
        direction = "missed";
      } else if (call.direction === "incoming") {
        direction = "in";
      } else {
        direction = "out";
      }

      return {
        id: call.id,
        label: call.name,
        variantId: itemVariant.call,
        href: undefined, // Handled by onAction
        params: {
          direction,
          medium: call.medium as "voice" | "video",
          duration: call.duration,
          timestamp: call.lastActivity,
          avatarUrl: call.avatar,
          group: false,
          ongoing: false,
        },
      };
    });
  }, [calls, searchQuery]);

  const containerClasses = cn(
    "flex h-full flex-col",
    variant === "standalone"
      ? "w-full border-r border-border bg-card lg:w-[320px]"
      : "bg-background/60",
  );

  return (
    <div className={containerClasses}>
      <div className="border-b border-border p-3 md:p-4">
        <div className="mb-3 md:mb-4 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-semibold text-foreground">Calls</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground transition hover:text-foreground"
            type="button"
            aria-label="Add new call"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
        <SearchBar
          placeholder="Search or start a new call"
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <div className="border-b border-border p-3 md:p-4">
        <h3 className="mb-2 text-xs md:text-sm font-medium text-muted-foreground">Favorites</h3>
        <div className="text-xs md:text-sm text-muted-foreground">No favorite contacts</div>
      </div>

      <div className="flex-1 overflow-hidden">
        <SecondaryList
          items={items}
          loading={loading}
          error={error}
          onAction={(id) => onCallSelect?.(id)}
          emptyState={
            <div className="flex flex-col items-center justify-center py-8 md:py-12 px-4 text-center">
              <Phone className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4 opacity-50" />
              <h3 className="text-base md:text-lg font-medium text-foreground">No calls yet</h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-[250px]">
                {searchQuery ? "No calls found matching your search" : "Your call history will appear here"}
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
}
