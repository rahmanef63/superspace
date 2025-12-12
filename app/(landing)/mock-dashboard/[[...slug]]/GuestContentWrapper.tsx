"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BarChart3 } from "lucide-react";
import { getFeaturePreview, loadAllFeaturePreviews } from "@/frontend/shared/preview";
import type { FeaturePreviewConfig } from "@/frontend/shared/preview/types";

interface GuestContentWrapperProps {
  workspaceId?: string;
  activeView?: string;
  workspaceName?: string;
}

/**
 * Wrapper component for feature previews in demo mode
 */
function FeaturePreviewWrapper({
  children,
  title,
  description
}: {
  children: React.ReactNode;
  title: string;
  description: string
}) {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Demo Mode
        </Badge>
      </div>

      <div className="flex-1 w-full min-h-0 px-4 pb-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Renders a feature preview from the registry
 */
function DynamicFeaturePreview({ preview }: { preview: FeaturePreviewConfig }) {
  const PreviewComponent = preview.component;
  const mockData = preview.mockDataSets.find(m => m.id === preview.defaultMockDataId) || preview.mockDataSets[0];

  if (!mockData) {
    return (
      <FeaturePreviewWrapper title={preview.name} description={preview.description}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Preview Unavailable</p>
            <p className="text-sm text-muted-foreground">No mock data available for this feature</p>
          </CardContent>
        </Card>
      </FeaturePreviewWrapper>
    );
  }

  return (
    <FeaturePreviewWrapper title={preview.name} description={preview.description}>
      <PreviewComponent
        mockData={mockData}
        compact={false}
        interactive={true}
      />
    </FeaturePreviewWrapper>
  );
}

/**
 * Fallback for features without previews
 */
function DefaultPreview({ featureName }: { featureName: string }) {
  const formattedName = featureName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <FeaturePreviewWrapper title={formattedName} description="Explore this feature">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Feature Preview</p>
          <p className="text-sm text-muted-foreground">
            This feature is available in the full version
          </p>
        </CardContent>
      </Card>
    </FeaturePreviewWrapper>
  );
}

function LoadingPreview({ featureName }: { featureName: string }) {
  const formattedName = featureName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <FeaturePreviewWrapper title={formattedName} description="Loading demo preview…">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="mt-4 text-lg font-medium">Loading preview</p>
          <p className="text-sm text-muted-foreground">Preparing demo content…</p>
        </CardContent>
      </Card>
    </FeaturePreviewWrapper>
  );
}

/**
 * Map of feature aliases to their canonical feature IDs
 * This handles cases where URL slugs differ from feature registry IDs
 */
const FEATURE_ALIASES: Record<string, string> = {
  // Overview aliases
  "overview": "overview",
  "dashboard": "overview",
  "home": "overview",

  // Document aliases
  "documents": "documents",
  "docs": "documents",
  "wiki": "documents",

  // Communication aliases
  "communications": "communications",
  "messages": "communications",
  "chat": "communications",
  "conversations": "communications",

  // Calendar aliases
  "calendar": "calendar",
  "schedule": "calendar",
  "events": "calendar",

  // Task aliases
  "tasks": "tasks",
  "todos": "tasks",

  // CRM aliases
  "crm": "crm",
  "sales": "sales",
  "contacts": "contact",

  // Analytics aliases
  "analytics": "analytics",
  "insights": "analytics",

  // Reports aliases
  "reports": "reports",

  // AI aliases
  "ai": "ai",
  "assistant": "ai",
  "copilot": "ai",

  // User management aliases
  "user-management": "user-management",
  "members": "members",
  "users": "user-management",
  "team": "user-management",

  // Other features
  "database": "database",
  "knowledge": "knowledge",
  "projects": "projects",
  "inventory": "inventory",
  "forms": "forms",
  "automation": "automation",
  "cms-lite": "cms-lite",
  "support": "support",
  "status": "status",
  "contact": "contact",
};

/**
 * Main component that renders feature previews for guest users
 */
export function GuestContentWrapper({ activeView }: GuestContentWrapperProps) {
  const featureSlug = (activeView ?? "overview").toLowerCase();
  const [previewsReady, setPreviewsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadAllFeaturePreviews()
      .catch((error) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("[GuestContentWrapper] Failed to load previews:", error);
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!previewsReady) {
    return <LoadingPreview featureName={featureSlug} />;
  }

  // Resolve the feature ID from alias or use directly
  const featureId = FEATURE_ALIASES[featureSlug] || featureSlug;

  // Try to get the preview from the registry
  const preview = getFeaturePreview(featureId);

  // Also try the original slug as a fallback
  const fallbackPreview = preview ? null : getFeaturePreview(featureSlug);

  const finalPreview = preview || fallbackPreview;

  if (finalPreview) {
    return <DynamicFeaturePreview preview={finalPreview} />;
  }

  // Fallback for features without previews
  return <DefaultPreview featureName={featureSlug} />;
}
