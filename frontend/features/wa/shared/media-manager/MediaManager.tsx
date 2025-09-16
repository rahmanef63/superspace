import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MediaGrid } from "../../components/media/MediaGrid";
import { MediaViewer } from "../../components/media/MediaViewer";
import { Search, Filter, Download, Trash2, Share } from "lucide-react";
import type { MediaItem } from "../types";

interface MediaManagerProps {
  mediaItems?: MediaItem[];
  onUpload?: (files: FileList) => void;
  onDelete?: (mediaIds: string[]) => void;
  onDownload?: (media: MediaItem) => void;
  onShare?: (media: MediaItem) => void;
}

export function MediaManager({
  mediaItems = [],
  onUpload,
  onDelete,
  onDownload,
  onShare
}: MediaManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');

  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = !searchQuery || 
      (item.alt?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleMediaClick = (media: MediaItem) => {
    const index = filteredMedia.findIndex(item => item.id === media.id);
    setViewerIndex(index);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && onUpload) {
      onUpload(files);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const handleBulkDelete = () => {
    if (selectedItems.size > 0 && onDelete) {
      onDelete(Array.from(selectedItems));
      setSelectedItems(new Set());
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Media</h1>
          <div className="flex items-center gap-2">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="media-upload"
            />
            <label htmlFor="media-upload">
              <Button variant="outline" size="sm" asChild>
                <span>Upload</span>
              </Button>
            </label>
            
            {selectedItems.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedItems.size})
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-1">
            {[
              { type: 'all', label: 'All' },
              { type: 'image', label: 'Photos' },
              { type: 'video', label: 'Videos' }
            ].map(({ type, label }) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type as any)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-2 bg-muted/30">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{filteredMedia.length} items</span>
          <Badge variant="secondary">
            {mediaItems.filter(m => m.type === 'image').length} photos
          </Badge>
          <Badge variant="secondary">
            {mediaItems.filter(m => m.type === 'video').length} videos
          </Badge>
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto">
        <MediaGrid
          mediaItems={filteredMedia}
          onMediaClick={handleMediaClick}
          onDownload={onDownload}
          onShare={onShare}
        />
      </div>

      {/* Media Viewer */}
      <MediaViewer
        mediaItems={filteredMedia}
        currentIndex={viewerIndex}
        isOpen={viewerIndex >= 0}
        onClose={() => setViewerIndex(-1)}
        onNavigate={setViewerIndex}
        onDownload={onDownload}
        onShare={onShare}
      />
    </div>
  );
}
