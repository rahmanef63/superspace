import type { MemberProfile } from "../../../types/member";

export type MemberInfoSection =
  | "overview"
  | "media"
  | "files"
  | "links"
  | "events"
  | "encryption"
  | "groups";

export type MemberInfoNavItem = {
  id: MemberInfoSection;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

export type MemberInfoContact = MemberProfile & {
  /**
   * Optional presence string such as "last seen 2h ago"
   */
  presenceLabel?: string;
};
