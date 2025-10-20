type MediaSectionProps = {
  isMobile: boolean;
};

const MEDIA_ITEMS = [
  {
    type: "image" as const,
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300&h=300&fit=crop",
  },
  {
    type: "image" as const,
    src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop",
  },
  {
    type: "video" as const,
    src: "https://images.unsplash.com/photo-1526313199968-70e399ffe791?w=300&h=300&fit=crop",
    duration: "1:16",
  },
  {
    type: "image" as const,
    src: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&h=300&fit=crop",
  },
  {
    type: "video" as const,
    src: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&h=300&fit=crop",
    duration: "0:42",
  },
  {
    type: "image" as const,
    src: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=300&h=300&fit=crop",
  },
];

export function MediaSection({ isMobile }: MediaSectionProps) {
  return (
    <div
      className={[
        "grid gap-2",
        isMobile ? "grid-cols-2" : "grid-cols-3",
      ].join(" ")}
    >
      {MEDIA_ITEMS.map((item, index) => (
        <div
          key={index}
          className="relative aspect-square overflow-hidden rounded-wa-md border border-wa-border bg-muted transition-opacity hover:opacity-80"
        >
          <img
            src={item.src}
            alt="Shared media item"
            className="h-full w-full object-cover"
          />
          {item.type === "video" && item.duration && (
            <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
              {item.duration}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
