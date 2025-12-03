import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, Package } from "lucide-react";
import { getIconComponent } from "@/frontend/shared/ui";
import type { AvailableFeatureMenu } from "../types";
import { STATUS_BADGE_VARIANTS } from "../constants";

interface FeatureCardProps {
  feature: AvailableFeatureMenu;
  isInstalling: boolean;
  onInstall: (slug: string) => void;
  onPreview?: (slug: string) => void;
  isPreviewActive?: boolean;
}

export function FeatureCard({ feature, isInstalling, onInstall, onPreview, isPreviewActive }: FeatureCardProps) {
  const IconComponent = getIconComponent(feature.icon);
  const isNotReady = feature.isReady === false;
  const statusVariant = feature.status
    ? STATUS_BADGE_VARIANTS[feature.status]
    : "default";

  return (
    <Card className={`transition-shadow hover:shadow-md ${isPreviewActive ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {IconComponent ? (
              <IconComponent className="h-5 w-5 text-primary" />
            ) : (
              <Package className="h-5 w-5 text-primary" />
            )}
            <CardTitle className="text-base">{feature.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {onPreview && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onPreview(feature.slug)}
              >
                <Eye className={`h-4 w-4 ${isPreviewActive ? 'text-primary' : ''}`} />
              </Button>
            )}
            {feature.status && (
              <Badge variant={statusVariant} className="text-[10px] uppercase">
                {feature.status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {feature.description}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {feature.version && (
              <Badge variant="outline" className="text-xs">
                v{feature.version}
              </Badge>
            )}
            {feature.category && (
              <Badge variant="secondary" className="text-xs capitalize">
                {feature.category}
              </Badge>
            )}
          </div>
          {feature.tags && feature.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {feature.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {isNotReady && feature.expectedRelease && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Expected: {feature.expectedRelease}
            </p>
          )}
          <Button
            onClick={() => onInstall(feature.slug)}
            disabled={isInstalling || isNotReady}
            className="w-full"
            size="sm"
            variant={isNotReady ? "outline" : "default"}
          >
            {isInstalling ? (
              <>
                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Installing...
              </>
            ) : isNotReady ? (
              <>In Development</>
            ) : (
              <>
                <Download className="mr-2 h-3 w-3" />
                Install
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
