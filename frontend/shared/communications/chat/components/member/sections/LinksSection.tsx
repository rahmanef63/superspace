type LinksSectionProps = {
  isMobile: boolean;
};

const LINK_ITEMS = [
  {
    title: "Design System Guidelines",
    url: "figma.com/file/design-system",
  },
  {
    title: "Customer Discovery Notes",
    url: "notion.so/workspace/research",
    thumbnail:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=160&h=96&fit=crop",
  },
  {
    title: "Marketing Launch Checklist",
    url: "docs.google.com/spreadsheets/launch",
  },
  {
    title: "Team Offsite Location",
    url: "maps.app.goo.gl/offsite",
    thumbnail:
      "https://images.unsplash.com/photo-1529926459380-9ae02d4f2951?w=160&h=96&fit=crop",
  },
];

export function LinksSection({ isMobile }: LinksSectionProps) {
  return (
    <div className="space-y-3">
      {LINK_ITEMS.map((link) => (
        <div
          key={link.title}
          className="flex items-start gap-3 rounded-wa-lg border border-wa-border bg-wa-surface p-3 transition-colors hover:bg-wa-hover"
        >
          <div
            className={[
              "flex-shrink-0 overflow-hidden rounded-wa-lg bg-primary text-primary-foreground",
              isMobile ? "h-12 w-16" : "h-12 w-20",
            ].join(" ")}
          >
            {link.thumbnail ? (
              <img
                src={link.thumbnail}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                {new URL(`https://${link.url}`).hostname.split(".")[0]}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-medium text-wa-text">{link.title}</p>
            <p className="text-sm text-wa-muted">{link.url}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
