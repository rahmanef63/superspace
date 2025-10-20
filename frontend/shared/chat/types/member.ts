/**
 * Member profile information shared across chat experiences.
 * @module shared/chat/types/member
 */

export type MemberProfile = {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  phoneNumber?: string;
  about?: string;
  isOnline?: boolean;
  lastSeen?: string;
  email?: string;
  location?: string;
  jobTitle?: string;
  tags?: string[];
};
