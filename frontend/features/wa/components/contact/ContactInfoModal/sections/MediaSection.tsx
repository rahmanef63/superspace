interface MediaSectionProps {
  isMobile: boolean;
}

export function MediaSection({ isMobile }: MediaSectionProps) {
  const mediaItems = [
    { type: 'image', src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=150&fit=crop' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150&h=150&fit=crop' },
    { type: 'video', src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop', duration: '1:16' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=150&h=150&fit=crop' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=150&h=150&fit=crop' },
    { type: 'video', src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop', duration: '0:05' },
    { type: 'video', src: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=150&h=150&fit=crop', duration: '1:16' },
    { type: 'video', src: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=150&h=150&fit=crop', duration: '1:10' },
  ];

  return (
    <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {mediaItems.map((item, index) => (
        <div 
          key={index} 
          className="relative aspect-square bg-muted rounded-wa-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-wa-border"
        >
          <img 
            src={item.src} 
            alt="Media" 
            className="w-full h-full object-cover"
          />
          {item.type === 'video' && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {item.duration}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
