import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Download, 
  Share, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Pause 
} from "lucide-react";
import type { MediaItem } from "../../shared/types/core";

interface MediaViewerProps {
  mediaItems: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (index: number) => void;
  onDownload?: (media: MediaItem) => void;
  onShare?: (media: MediaItem) => void;
}

export function MediaViewer({
  mediaItems,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  onDownload,
  onShare
}: MediaViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentMedia = mediaItems[currentIndex];

  if (!currentMedia) return null;

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : mediaItems.length - 1;
    onNavigate?.(newIndex);
    resetTransforms();
  };

  const handleNext = () => {
    const newIndex = currentIndex < mediaItems.length - 1 ? currentIndex + 1 : 0;
    onNavigate?.(newIndex);
    resetTransforms();
  };

  const resetTransforms = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 bg-black/95">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
              <div>
                <p className="font-medium">
                  {currentIndex + 1} of {mediaItems.length}
                </p>
                {currentMedia.timestamp && (
                  <p className="text-sm text-white/70">
                    {currentMedia.timestamp}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload?.(currentMedia)}
                className="text-white hover:bg-white/20"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onShare?.(currentMedia)}
                className="text-white hover:bg-white/20"
              >
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Media Content */}
        <div className="flex items-center justify-center w-full h-full relative">
          {/* Navigation */}
          {mediaItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-4 z-10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 z-10 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Media Display */}
          <div className="max-w-full max-h-full flex items-center justify-center">
            {currentMedia.type === 'video' ? (
              <div className="relative">
                <video
                  src={currentMedia.url}
                  controls
                  autoPlay={isPlaying}
                  className="max-w-full max-h-full"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  }}
                />
              </div>
            ) : (
              <img
                src={currentMedia.url}
                alt={currentMedia.alt || 'Media'}
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-2 text-white">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRotate}
              className="text-white hover:bg-white/20"
            >
              <RotateCw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetTransforms}
              className="text-white hover:bg-white/20"
            >
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
