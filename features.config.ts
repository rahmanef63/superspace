export type FeatureMenuType =
  | "route"
  | "folder"
  | "divider"
  | "action"
  | "chat"
  | "document";

export type FeatureType = "default" | "optional" | "experimental";

export interface FeatureMetadata {
  slug: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  component: string;
  order: number;
  type: FeatureMenuType;
  version: string;
  category: string;
  featureType: FeatureType;
  tags?: string[];
  requiresPermission?: string;
}

const features: FeatureMetadata[] = [
  {
    slug: "reports",
    name: "Reports",
    description: "Analytics and reporting workspace",
    icon: "BarChart3",
    path: "/reports",
    component: "ReportsPage",
    order: 100,
    type: "route",
    version: "1.0.0",
    category: "analytics",
    featureType: "optional",
    tags: ["analytics", "reporting"],
  },
];

export function getFeatureBySlug(slug: string): FeatureMetadata | undefined {
  return features.find((feature) => feature.slug === slug);
}

export function getAllFeatures(): FeatureMetadata[] {
  return [...features];
}
