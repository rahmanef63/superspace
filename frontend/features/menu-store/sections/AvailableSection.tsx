import { Check } from "lucide-react";
import { FeatureCard } from "../components";
import type { AvailableFeatureMenu } from "../types";
import { MENU_STORE_CONFIG } from "../constants";

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
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Available Features</h2>
        <p className="text-muted-foreground">
          Install additional features to extend your workspace functionality.
        </p>
      </div>

      {features && features.length > 0 ? (
        <div className={`grid gap-4 ${MENU_STORE_CONFIG.gridColumns.sm} ${MENU_STORE_CONFIG.gridColumns.md} ${MENU_STORE_CONFIG.gridColumns.lg}`}>
          {features.map((feature) => (
            <FeatureCard
              key={feature.slug}
              feature={feature}
              isInstalling={installingFeatures.has(feature.slug)}
              onInstall={onInstall}
            />
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
  );
}
