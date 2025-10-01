import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MenuItemForm } from "./MenuItemForm";
import { DragDropMenuTree } from "./DragDropMenuTree";
import { MenuDisplay } from "./MenuDisplay";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import { Plus, Search, Trash2, Edit, Download, Check, Copy, Share, MoreHorizontal, FileInput } from "lucide-react";
import { iconFromName } from "@/frontend/shared/pages/icons";

interface MenuStoreProps {
  workspaceId: Id<"workspaces">;
}

interface MenuItem {
  _id: Id<"menuItems">;
  name: string;
  slug: string;
  type: string;
  path?: string;
  metadata?: {
    description?: string;
    version?: string;
    category?: string;
    lastUpdated?: number;
    previousVersion?: string;
  };
}

export function MenuStore({ workspaceId }: MenuStoreProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<Id<"menuItems"> | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<Id<"menuItems"> | undefined>();
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  const [activeTab, setActiveTab] = useState<'installed' | 'available' | 'import'>('installed');
  const [installingFeatures, setInstallingFeatures] = useState<Set<string>>(new Set());
  const [renameDialog, setRenameDialog] = useState<{ isOpen: boolean; item?: MenuItem; newName: string }>({ isOpen: false, newName: '' });
  const [shareDialog, setShareDialog] = useState<{ isOpen: boolean; shareableId?: string }>({ isOpen: false });
  const [importMenuId, setImportMenuId] = useState('');
  const [importing, setImporting] = useState(false);

  const menuItems = useQuery(api.menu.menuItems.getWorkspaceMenuItems, { workspaceId });
  const availableFeatures = useQuery(api.menu.menuItems.getAvailableFeatureMenus, { workspaceId });
  const deleteMenuItem = useMutation(api.menu.menuItems.deleteMenuItem);
  const installFeatureMenus = useMutation(api.menu.menuItems.installFeatureMenus);
  const renameMenuItem = useMutation(api.menu.menuItems.renameMenuItem);
  const duplicateMenuItem = useMutation(api.menu.menuItems.duplicateMenuItem);
  const shareMenuItem = useMutation(api.menu.menuItems.shareMenuItem);
  const importMenuFromShareableId = useMutation(api.menu.menuItems.importMenuFromShareableId);

  const filteredItems = (menuItems as MenuItem[] | undefined)?.filter((item: MenuItem) => {
    if (!searchQuery) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.slug.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDeleteItem = async (itemId: Id<"menuItems">) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItem({ menuItemId: itemId });
        if (selectedItemId === itemId) {
          setSelectedItemId(undefined);
        }
      } catch (error) {
        console.error('Failed to delete menu item:', error);
      }
    }
  };

  const handleEditItem = (itemId: Id<"menuItems">) => {
    setEditingItemId(itemId);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingItemId(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItemId(undefined);
  };

  const handleInstallFeature = async (featureSlug: string) => {
    setInstallingFeatures(prev => new Set(prev).add(featureSlug));
    try {
      await installFeatureMenus({ 
        workspaceId, 
        featureSlugs: [featureSlug] 
      });
    } catch (error) {
      console.error('Failed to install feature:', error);
    } finally {
      setInstallingFeatures(prev => {
        const newSet = new Set(prev);
        newSet.delete(featureSlug);
        return newSet;
      });
    }
  };

  const handleRenameItem = async (item: MenuItem) => {
    setRenameDialog({ isOpen: true, item, newName: item.name });
  };

  const handleRenameConfirm = async () => {
    if (!renameDialog.item || !renameDialog.newName.trim()) return;

    try {
      await renameMenuItem({
        menuItemId: renameDialog.item._id,
        name: renameDialog.newName.trim()
      });
      setRenameDialog({ isOpen: false, newName: '' });
      toast.success('Menu item renamed successfully');
    } catch (error) {
      console.error('Failed to rename menu item:', error);
      toast.error('Failed to rename menu item');
    }
  };

  const handleDuplicateItem = async (item: MenuItem) => {
    try {
      await duplicateMenuItem({ menuItemId: item._id });
      toast.success('Menu item duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate menu item:', error);
      toast.error('Failed to duplicate menu item');
    }
  };

  const handleShareItem = async (item: MenuItem) => {
    try {
      const result = await shareMenuItem({ menuItemId: item._id });
      setShareDialog({ isOpen: true, shareableId: result.shareableId });
    } catch (error) {
      console.error('Failed to share menu item:', error);
      toast.error('Failed to share menu item');
    }
  };

  const handleCopyShareableId = () => {
    if (shareDialog.shareableId) {
      navigator.clipboard.writeText(shareDialog.shareableId);
      toast.success('Shareable ID copied to clipboard');
    }
  };

  const handleImportMenu = async () => {
    if (!importMenuId.trim()) {
      toast.error('Please enter a menu ID');
      return;
    }

    setImporting(true);
    try {
      const result = await importMenuFromShareableId({
        workspaceId,
        shareableId: importMenuId.trim()
      });
      setImportMenuId('');
      toast.success(`Menu "${result.sourceName}" imported successfully`);
    } catch (error) {
      console.error('Failed to import menu:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import menu');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Menu Store</h1>
          <div className="flex items-center gap-2">
            {activeTab === 'installed' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'tree' ? 'grid' : 'tree')}
                >
                  {viewMode === 'tree' ? 'Grid View' : 'Tree View'}
                </Button>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Item
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'installed' | 'available' | 'import')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="installed">Installed Menus</TabsTrigger>
            <TabsTrigger value="available">Available Features</TabsTrigger>
            <TabsTrigger value="import">Import Menu</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search - only for installed tab */}
        {activeTab === 'installed' && (
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Breadcrumbs - only for installed tab */}
        {activeTab === 'installed' && (
          <div className="mt-4">
            <BreadcrumbNavigation
              workspaceId={workspaceId}
              currentMenuItemId={selectedItemId}
              onNavigate={setSelectedItemId}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        <Tabs value={activeTab} className="flex-1 flex flex-col">
          <TabsContent value="installed" className="flex-1 flex overflow-hidden mt-0">
            {/* Sidebar - Tree View */}
            {viewMode === 'tree' && (
              <div className="w-80 border-r border overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold mb-3">Menu Structure</h3>
                  <DragDropMenuTree
                    workspaceId={workspaceId}
                    onItemSelect={setSelectedItemId}
                    selectedItemId={selectedItemId}
                  />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              {showForm ? (
                <div className="p-6">
                  <MenuItemForm
                    workspaceId={workspaceId}
                    parentId={selectedItemId}
                    editingItemId={editingItemId}
                    onSave={handleFormSave}
                    onCancel={handleFormCancel}
                  />
                </div>
              ) : (
                <div className="p-6">
                  {viewMode === 'tree' ? (
                    <MenuDisplay
                      workspaceId={workspaceId}
                      menuItemId={selectedItemId}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredItems?.map((item) => (
                        <Card key={item._id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{item.name}</CardTitle>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditItem(item._id)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRenameItem(item)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateItem(item)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleShareItem(item)}>
                                    <Share className="w-4 h-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteItem(item._id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {item.type}
                                </Badge>
                                {item.metadata?.version && (
                                  <Badge variant="outline" className="text-xs">
                                    v{item.metadata.version}
                                  </Badge>
                                )}
                                {item.metadata?.category && (
                                  <Badge variant="default" className="text-xs">
                                    {item.metadata.category}
                                  </Badge>
                                )}
                              </div>
                              {item.metadata?.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.metadata.description}
                                </p>
                              )}
                              {item.path && (
                                <div className="text-xs text-muted-foreground">
                                  {item.path}
                                </div>
                              )}
                              {item.metadata?.lastUpdated && (
                                <div className="text-xs text-muted-foreground">
                                  Updated: {new Date(item.metadata.lastUpdated).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="available" className="flex-1 overflow-y-auto mt-0">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Available Features</h2>
                <p className="text-muted-foreground">
                  Install additional features to extend your workspace functionality.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableFeatures?.map((feature) => {
                  const IconComponent = iconFromName(feature.icon);
                  const isInstalling = installingFeatures.has(feature.slug);
                  
                  return (
                    <Card key={feature.slug} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          {IconComponent && <IconComponent className="w-5 h-5 text-primary" />}
                          <CardTitle className="text-base">{feature.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                          {feature.version && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                v{feature.version}
                              </Badge>
                              {feature.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {feature.category}
                                </Badge>
                              )}
                            </div>
                          )}
                          <Button
                            onClick={() => handleInstallFeature(feature.slug)}
                            disabled={isInstalling}
                            className="w-full"
                            size="sm"
                          >
                            {isInstalling ? (
                              <>
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Installing...
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3 mr-2" />
                                Install
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {availableFeatures?.length === 0 && (
                <div className="text-center py-12">
                  <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Features Installed</h3>
                  <p className="text-muted-foreground">
                    You have installed all available features for this workspace.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="import" className="flex-1 overflow-y-auto mt-0">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Import Menu</h2>
                <p className="text-muted-foreground">
                  Import a menu from another workspace using a shareable menu ID.
                </p>
              </div>

              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="menuId">Menu ID</Label>
                  <Input
                    id="menuId"
                    placeholder="Enter shareable menu ID..."
                    value={importMenuId}
                    onChange={(e) => setImportMenuId(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleImportMenu}
                  disabled={!importMenuId.trim() || importing}
                  className="w-full"
                >
                  {importing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <FileInput className="w-4 h-4 mr-2" />
                      Import Menu
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">How to get a Menu ID:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Go to the workspace that has the menu you want</li>
                  <li>Find the menu item in the Installed Menus tab</li>
                  <li>Click the menu button (⋯) and select "Share"</li>
                  <li>Copy the shareable ID and paste it here</li>
                </ol>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.isOpen} onOpenChange={(open) => setRenameDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Menu Item</DialogTitle>
            <DialogDescription>
              Enter a new name for "{renameDialog.item?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newName">New Name</Label>
              <Input
                id="newName"
                value={renameDialog.newName}
                onChange={(e) => setRenameDialog(prev => ({ ...prev, newName: e.target.value }))}
                placeholder="Enter new name..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog({ isOpen: false, newName: '' })}>
              Cancel
            </Button>
            <Button onClick={handleRenameConfirm} disabled={!renameDialog.newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialog.isOpen} onOpenChange={(open) => setShareDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Menu Item</DialogTitle>
            <DialogDescription>
              Share this menu item with other workspaces using the ID below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Shareable Menu ID</Label>
              <div className="flex gap-2">
                <Input
                  value={shareDialog.shareableId || ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopyShareableId} size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Anyone with this ID can import this menu item into their workspace.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShareDialog({ isOpen: false })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
