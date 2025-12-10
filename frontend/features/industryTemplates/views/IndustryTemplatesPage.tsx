"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Star,
  Download,
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  Trophy,
  TrendingUp,
  Sparkles,
  Check,
  ArrowLeft,
  ExternalLink,
  Users,
  Clock,
  Layers,
} from "lucide-react";
import {
  useTemplates,
  useTemplateById,
  useFeaturedTemplates,
  usePopularTemplates,
  useCategories,
  useInstallTemplate,
  useTemplateReviews,
  categoryMetadata,
  featureModules,
  type IndustryCategory,
  type FeatureModule,
  type InstallOptions,
} from "../hooks/useIndustryTemplates";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Industry Templates Page
 * Browse and install pre-configured workspace templates
 */
export function IndustryTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTemplate, setSelectedTemplate] = useState<Id<"industryTemplates"> | null>(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);

  const templates = useTemplates({
    category: selectedCategory ?? undefined,
    search: searchQuery || undefined,
  });
  const featuredTemplates = useFeaturedTemplates(6);
  const popularTemplates = usePopularTemplates(8);
  const categories = useCategories();

  const handleSelectTemplate = (templateId: Id<"industryTemplates">) => {
    setSelectedTemplate(templateId);
  };

  const handleBackToList = () => {
    setSelectedTemplate(null);
  };

  const handleInstall = () => {
    setIsInstallDialogOpen(true);
  };

  if (selectedTemplate) {
    return (
      <TemplateDetailView
        templateId={selectedTemplate}
        onBack={handleBackToList}
        onInstall={handleInstall}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold">Industry Templates</h1>
          <p className="text-muted-foreground">
            Pre-configured workspace bundles for your industry
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Categories */}
        <div className="w-64 border-r bg-muted/30">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Categories
              </h3>
              <div className="space-y-1">
                <Button
                  variant={selectedCategory === null ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Templates
                </Button>
                {categories?.map((cat: { category: string; count: number; name: string; icon: string; description: string }) => (
                  <Button
                    key={cat.category}
                    variant={selectedCategory === cat.category ? "secondary" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => setSelectedCategory(cat.category)}
                  >
                    <span>{cat.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {cat.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-6">
              <Tabs defaultValue="all">
                <TabsList className="mb-6">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="featured" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Featured
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popular
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  {templates === undefined ? (
                    <TemplateGridSkeleton />
                  ) : templates.length === 0 ? (
                    <EmptyState searchQuery={searchQuery} category={selectedCategory} />
                  ) : (
                    <TemplateGrid
                      templates={templates}
                      viewMode={viewMode}
                      onSelect={handleSelectTemplate}
                    />
                  )}
                </TabsContent>

                <TabsContent value="featured">
                  {featuredTemplates === undefined ? (
                    <TemplateGridSkeleton />
                  ) : (
                    <TemplateGrid
                      templates={featuredTemplates}
                      viewMode={viewMode}
                      onSelect={handleSelectTemplate}
                    />
                  )}
                </TabsContent>

                <TabsContent value="popular">
                  {popularTemplates === undefined ? (
                    <TemplateGridSkeleton />
                  ) : (
                    <TemplateGrid
                      templates={popularTemplates}
                      viewMode={viewMode}
                      onSelect={handleSelectTemplate}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Install Dialog */}
      {selectedTemplate && (
        <InstallTemplateDialog
          templateId={selectedTemplate}
          isOpen={isInstallDialogOpen}
          onClose={() => setIsInstallDialogOpen(false)}
        />
      )}
    </div>
  );
}

// Template Grid Component
interface TemplateGridProps {
  templates: any[];
  viewMode: "grid" | "list";
  onSelect: (id: Id<"industryTemplates">) => void;
}

function TemplateGrid({ templates, viewMode, onSelect }: TemplateGridProps) {
  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {templates.map((template) => (
          <TemplateListItem
            key={template._id}
            template={template}
            onSelect={() => onSelect(template._id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template._id}
          template={template}
          onSelect={() => onSelect(template._id)}
        />
      ))}
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: any;
  onSelect: () => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const categoryInfo = categoryMetadata[template.category as IndustryCategory];

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription className="mt-1">{categoryInfo?.name}</CardDescription>
          </div>
          {template.isOfficial && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Official
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {template.features.slice(0, 4).map((feature: FeatureModule) => (
            <Badge key={feature} variant="outline" className="text-xs">
              {featureModules[feature]?.name}
            </Badge>
          ))}
          {template.features.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{template.features.length - 4} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {template.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {template.rating}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            {template.usageCount}
          </span>
        </div>
        <Button size="sm" variant="ghost">
          View <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// Template List Item Component
function TemplateListItem({ template, onSelect }: TemplateCardProps) {
  const categoryInfo = categoryMetadata[template.category as IndustryCategory];

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="flex items-center p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{template.name}</h3>
            {template.isOfficial && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Official
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{categoryInfo?.name}</p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
            {template.description}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {template.rating && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {template.rating}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              {template.usageCount}
            </span>
          </div>
          <Button size="sm" variant="ghost">
            View <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Template Detail View
interface TemplateDetailViewProps {
  templateId: Id<"industryTemplates">;
  onBack: () => void;
  onInstall: () => void;
}

function TemplateDetailView({ templateId, onBack, onInstall }: TemplateDetailViewProps) {
  const template = useTemplateById(templateId);
  const reviews = useTemplateReviews(templateId, { limit: 5 });

  if (template === undefined) {
    return <TemplateDetailSkeleton />;
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Template not found</p>
      </div>
    );
  }

  const categoryInfo = categoryMetadata[template.category as IndustryCategory];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{template.name}</h1>
            {template.isOfficial && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Official
              </Badge>
            )}
            {template.isPremium && (
              <Badge variant="default" className="flex items-center gap-1">
                Premium
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{categoryInfo?.name}</p>
        </div>
        <Button onClick={onInstall}>
          <Download className="h-4 w-4 mr-2" />
          Install Template
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 max-w-4xl">
          {/* Stats */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{template.reviewStats?.averageRating || "N/A"}</span>
              <span className="text-muted-foreground">
                ({template.reviewStats?.totalReviews || 0} reviews)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-muted-foreground" />
              <span>{template.usageCount} installs</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>v{template.version}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{template.description}</p>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Included Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {template.features.map((feature: FeatureModule) => {
                const featureInfo = featureModules[feature];
                return (
                  <div
                    key={feature}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <Check className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{featureInfo?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {featureInfo?.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Default Roles */}
          {template.defaultRoles && template.defaultRoles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Pre-configured Roles</h2>
              <div className="space-y-2">
                {template.defaultRoles.map((role: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{role.name}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    {role.isDefault && <Badge variant="outline">Default</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Guides */}
          {template.guides && template.guides.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Setup Guides</h2>
              <div className="space-y-2">
                {template.guides.map((guide: any) => (
                  <Card key={guide._id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{guide.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {guide.type.replace("_", " ")}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-8" />

          {/* Reviews */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Reviews</h2>
            {reviews?.reviews && reviews.reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.reviews.map((review: any) => (
                  <Card key={review._id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.user?.name || "Anonymous"}</span>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.title && (
                          <p className="font-medium mt-2">{review.title}</p>
                        )}
                        {review.review && (
                          <p className="text-muted-foreground mt-1">{review.review}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// Install Template Dialog
interface InstallTemplateDialogProps {
  templateId: Id<"industryTemplates">;
  isOpen: boolean;
  onClose: () => void;
}

function InstallTemplateDialog({ templateId, isOpen, onClose }: InstallTemplateDialogProps) {
  const template = useTemplateById(templateId);
  const installTemplate = useInstallTemplate();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [includeSampleData, setIncludeSampleData] = useState(true);
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureModule[]>([]);

  // Initialize selected features from template
  useState(() => {
    if (template?.features) {
      setSelectedFeatures(template.features as FeatureModule[]);
    }
  });

  const handleInstall = async () => {
    if (!template) return;

    setIsInstalling(true);
    setInstallProgress(0);

    // Simulate installation progress
    const progressInterval = setInterval(() => {
      setInstallProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      // TODO: Replace with actual workspaceId and userId from context
      await installTemplate({
        templateId,
        workspaceId: "placeholder" as Id<"workspaces">,
        userId: "placeholder" as Id<"users">,
        options: {
          includeSampleData,
          selectedFeatures,
        },
      });

      setInstallProgress(100);
      setTimeout(() => {
        onClose();
        setIsInstalling(false);
        setInstallProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Installation failed:", error);
      setIsInstalling(false);
      setInstallProgress(0);
    }
  };

  const toggleFeature = (feature: FeatureModule) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Install {template.name}</DialogTitle>
          <DialogDescription>
            Configure your installation options before applying this template
          </DialogDescription>
        </DialogHeader>

        {isInstalling ? (
          <div className="py-8">
            <div className="text-center mb-4">
              <p className="font-medium">Installing template...</p>
              <p className="text-sm text-muted-foreground">
                {installProgress < 100 ? "Setting up your workspace" : "Complete!"}
              </p>
            </div>
            <Progress value={installProgress} className="h-2" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Sample Data Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sampleData"
                  checked={includeSampleData}
                  onCheckedChange={(checked) => setIncludeSampleData(checked as boolean)}
                />
                <label htmlFor="sampleData" className="text-sm font-medium">
                  Include sample data
                </label>
              </div>

              {/* Feature Selection */}
              <div>
                <h4 className="text-sm font-medium mb-2">Select features to install:</h4>
                <ScrollArea className="h-48 border rounded-lg p-2">
                  <div className="space-y-2">
                    {template.features.map((feature: FeatureModule) => {
                      const featureInfo = featureModules[feature];
                      return (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox
                            id={feature}
                            checked={selectedFeatures.includes(feature)}
                            onCheckedChange={() => toggleFeature(feature)}
                          />
                          <label htmlFor={feature} className="text-sm">
                            {featureInfo?.name} - {featureInfo?.description}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleInstall} disabled={selectedFeatures.length === 0}>
                Install Template
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Loading Skeletons
function TemplateGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-1 mt-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function TemplateDetailSkeleton() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-10 rounded" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24 mt-1" />
        </div>
      </div>
      <Skeleton className="h-24 w-full mb-6" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ searchQuery, category }: { searchQuery: string; category: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Layers className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-1">No templates found</h3>
      <p className="text-muted-foreground text-center max-w-md">
        {searchQuery
          ? `No templates match "${searchQuery}"`
          : category
          ? `No templates available for ${categoryMetadata[category as IndustryCategory]?.name}`
          : "No templates available"}
      </p>
    </div>
  );
}

export default IndustryTemplatesPage;
