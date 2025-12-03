import * as React from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { FeatureCard } from "../components";
import type { AvailableFeatureMenu } from "../types";
import { MENU_STORE_CONFIG } from "../constants";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PreviewPanel, getFeaturePreview, hasFeaturePreview } from "@/frontend/shared/preview";

interface AvailableSectionProps {
  features?: AvailableFeatureMenu[];
  installingFeatures: Set<string>;
  onInstall: (slug: string) => void;
}

export function AvailableSection({
  features,
  installingFeatures,
  onInstall,
}: AvailableSectionProps) {
  const [previewFeatureId, setPreviewFeatureId] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);

  const handleTogglePreview = (featureSlug: string) => {
    if (previewFeatureId === featureSlug && showPreview) {
      setShowPreview(false);
    } else {
      setPreviewFeatureId(featureSlug);
      setShowPreview(true);
    }
  };

  const content = (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">Available Features</h2>
          <p className="text-muted-foreground">
            Install additional features to extend your workspace functionality.
            {showPreview && " Click the eye icon to preview features."}
          </p>
        </div>

        {features && features.length > 0 ? (
          <div className={`grid gap-4 ${MENU_STORE_CONFIG.gridColumns.sm} ${MENU_STORE_CONFIG.gridColumns.md} ${showPreview ? 'md:grid-cols-2 lg:grid-cols-2' : MENU_STORE_CONFIG.gridColumns.lg}`}>
            {features.map((feature) => (
              <div key={feature.slug} className="relative group">
                <FeatureCard
                  feature={feature}
                  isInstalling={installingFeatures.has(feature.slug)}
                  onInstall={onInstall}
                />
                {hasFeaturePreview(feature.slug) && (
                  <Button
                    variant={previewFeatureId === feature.slug && showPreview ? "default" : "secondary"}
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleTogglePreview(feature.slug)}
                  >
                    {previewFeatureId === feature.slug && showPreview ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Check className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h3 className="mb-2 text-lg font-semibold">All Features Installed</h3>
            <p className="text-muted-foreground">
              You have installed all available features for this workspace.
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );

  if (!showPreview) {
    return <div className="h-full overflow-hidden">{content}</div>;
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={60} minSize={40}>
        {content}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={40} minSize={30}>
        <PreviewPanel
          featureId={previewFeatureId}
          visible={showPreview}
          onClose={() => setShowPreview(false)}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
