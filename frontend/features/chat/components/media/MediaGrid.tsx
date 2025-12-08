import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Download, Share, MoreVertical } from "lucide-react";
import type { MediaItem } from "../../shared/types/core";

interface MediaGridProps {
  mediaItems?: MediaItem[];
  onMediaClick?: (media: MediaItem) => void;
  onDownload?: (media: MediaItem) => void;
  onShare?: (media: MediaItem) => void;
  columns?: number;
}

export function MediaGrid({ 
  mediaItems = [], 
  onMediaClick, 
  onDownload, 
  onShare,
  columns = 3 
}: MediaGridProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  if (mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="text-4xl mb-4">📷</div>
        <p>No media files yet</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {selectedItems.size > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-accent rounded-lg">
          <span className="text-sm font-medium">
            {selectedItems.size} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button size="sm" variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      )}
      
      <div 
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {mediaItems.map((media) => (
          <div
            key={media.id}
            className={`relative group cursor-pointer rounded-lg overflow-hidden aspect-square ${
              selectedItems.has(media.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onMediaClick?.(media)}
          >
            {media.type === 'video' ? (
              <div className="relative w-full h-full bg-muted">
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  poster={media.url}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-8 w-8 text-white" />
                </div>
                <Badge className="absolute top-2 left-2" variant="secondary">
                  Video
                </Badge>
              </div>
            ) : (
              <img
                src={media.url}
                alt={media.alt || 'Media'}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(media.id);
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              
              {media.timestamp && (
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="secondary" className="text-xs">
                    {media.timestamp}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
