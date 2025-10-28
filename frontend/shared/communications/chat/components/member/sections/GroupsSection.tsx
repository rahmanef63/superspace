import { Users } from "lucide-react";

type GroupsSectionProps = {
  isMobile: boolean;
};

const GROUP_ITEMS = [
  {
    id: "product-sync",
    name: "Product Sync",
    members: 12,
    avatar:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=80&h=80&fit=crop",
  },
  {
    id: "support-team",
    name: "Support Team",
    members: 8,
    avatar:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&h=80&fit=crop",
  },
  {
    id: "growth-lab",
    name: "Growth Lab",
    members: 16,
  },
];

export function GroupsSection({ isMobile }: GroupsSectionProps) {
  if (!GROUP_ITEMS.length) {
    return (
      <div className={isMobile ? "py-8 text-center" : "py-12 text-center"}>
        <Users
          className={[
            "mx-auto text-wa-muted",
            isMobile ? "h-12 w-12" : "h-16 w-16",
          ].join(" ")}
        />
        <p className={isMobile ? "text-base text-wa-muted" : "text-lg text-wa-muted"}>
          No groups in common
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-wa-text">
          Groups in common ({GROUP_ITEMS.length})
        </h3>
      </div>

      <div className="space-y-2">
        {GROUP_ITEMS.map((group) => (
          <div
            key={group.id}
            className="flex items-center gap-3 rounded-wa-lg border border-wa-border bg-wa-surface p-3 transition-colors hover:bg-wa-hover"
          >
            <div
              className={[
                "flex-shrink-0 overflow-hidden rounded-full bg-wa-muted",
                isMobile ? "h-10 w-10" : "h-12 w-12",
              ].join(" ")}
            >
              {group.avatar ? (
                <img
                  src={group.avatar}
                  alt={group.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Users className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-wa-text">{group.name}</p>
              <p className="text-sm text-wa-muted">
                {group.members} members
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
