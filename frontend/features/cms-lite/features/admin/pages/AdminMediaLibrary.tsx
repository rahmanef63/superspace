import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Upload, Trash2, Search, Grid, List, Download, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '../components/SearchBar';
import { BulkImageUpload, UploadedImage } from '../../../shared/components/BulkImageUpload';
import { Modal } from '../../../shared/components/Modal';
import { useToast } from '@/hooks/use-toast';
import ErrorBoundary from '../../../shared/components/ErrorBoundary';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size?: number;
  uploadedAt: Date;
  type: 'image' | 'video' | 'document';
}

export default function AdminMediaLibrary() {
  const { toast } = useToast();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = () => {
    const storedMedia = localStorage.getItem('media-library');
    if (storedMedia) {
      const items = JSON.parse(storedMedia) as MediaItem[];
      setMediaItems(items);
      setFilteredItems(items);
    }
  };

  const saveMedia = (items: MediaItem[]) => {
    localStorage.setItem('media-library', JSON.stringify(items));
    setMediaItems(items);
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = mediaItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(mediaItems);
    }
  }, [searchQuery, mediaItems]);

  const handleImagesUploaded = (uploadedImages: UploadedImage[]) => {
    const newItems: MediaItem[] = uploadedImages.map(img => ({
      id: `${Date.now()}-${Math.random()}`,
      url: img.url,
      name: img.altText || 'Untitled',
      uploadedAt: new Date(),
      type: 'image' as const,
    }));

    const updatedItems = [...mediaItems, ...newItems];
    saveMedia(updatedItems);
    setIsUploadModalOpen(false);
    
    toast({
      title: 'Upload successful',
      description: `Uploaded ${newItems.length} image(s)`,
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const updatedItems = mediaItems.filter(item => item.id !== id);
    saveMedia(updatedItems);
    
    toast({
      title: 'Item deleted successfully',
    });
  };

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.size} item(s)?`)) return;

    const updatedItems = mediaItems.filter(item => !selectedItems.has(item.id));
    saveMedia(updatedItems);
    setSelectedItems(new Set());
    
    toast({
      title: `Deleted ${selectedItems.size} item(s)`,
    });
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

  const selectAll = () => {
    setSelectedItems(new Set(filteredItems.map(item => item.id)));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <ErrorBoundary>
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Media Library</h1>
            {selectedItems.size > 0 && (
              <p className="text-sm text-foreground/60 mt-1">
                {selectedItems.size} item(s) selected
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            {selectedItems.size > 0 ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                  Delete Selected
                </Button>
                <Button variant="secondary" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsUploadModalOpen(true)}>
                <Upload className="w-4 h-4" />
                Upload Media
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search media..."
            />
          </div>
          
          <div className="flex gap-2 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {filteredItems.length > 0 && (
            <Button variant="ghost" size="sm" onClick={selectedItems.size > 0 ? clearSelection : selectAll}>
              {selectedItems.size > 0 ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-foreground/20" />
            <h3 className="text-lg font-medium mb-2">No media files</h3>
            <p className="text-foreground/60 mb-4">Upload your first image to get started</p>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="w-4 h-4" />
              Upload Media
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`relative aspect-square border rounded-lg overflow-hidden group cursor-pointer transition-all ${
                  selectedItems.has(item.id) ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedItem(item);
                  setIsDetailModalOpen(true);
                }}
              >
                <Image
                  src={item.url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelection(item.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.url);
                    }}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                  >
                    <Copy className="w-4 h-4 text-white" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="w-12 p-4"></th>
                  <th className="text-left p-4">Preview</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Uploaded</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} className="border-t hover:bg-muted/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <Image
                        src={item.url}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded"
                        sizes="48px"
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{item.name}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-foreground/60">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(item.url)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload Media"
          size="lg"
        >
          <BulkImageUpload
            onImagesUploaded={handleImagesUploaded}
            maxImages={100}
          />
        </Modal>

        {selectedItem && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedItem(null);
            }}
            title="Media Details"
            size="lg"
          >
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <Image
                  src={selectedItem.url}
                  alt={selectedItem.name}
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-foreground/60">Name</label>
                  <p className="font-medium">{selectedItem.name}</p>
                </div>

                <div>
                  <label className="text-sm text-foreground/60">URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedItem.url}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-lg bg-muted text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(selectedItem.url)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-foreground/60">Type</label>
                  <p className="font-medium capitalize">{selectedItem.type}</p>
                </div>

                <div>
                  <label className="text-sm text-foreground/60">Uploaded</label>
                  <p className="font-medium">
                    {new Date(selectedItem.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedItem.url;
                    link.download = selectedItem.name;
                    link.click();
                  }}
                  className="flex-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedItem.id);
                    setIsDetailModalOpen(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </ErrorBoundary>
  );
}
