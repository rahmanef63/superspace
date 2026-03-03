/**
 * Convex Cron Jobs
 * 
 * Scheduled tasks for maintenance and synchronization.
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Sync menu items for all workspaces
 * 
 * Runs every hour to ensure new features from the manifest
 * are added to existing workspace menu items.
 * 
 * This maintains SSOT (Single Source of Truth) by ensuring
 * the manifest is the authoritative source while the database
 * holds workspace-specific customizations.
 */
crons.interval(
  "sync-workspace-menus",
  { hours: 1 },
  internal.features.menus.menuItems.syncAllWorkspaceMenus
);

/**
 * Clean up expired invitations
 * 
 * Runs daily to mark expired invitations as expired.
 */
crons.daily(
  "cleanup-expired-invitations",
  { hourUTC: 3, minuteUTC: 0 }, // 3 AM UTC
  internal.workspace.invitations.cleanupExpiredInvitationsInternal
);

/**
 * Check for SLA breaches in workflows
 * 
 * Runs every hour to check for running workflows that have exceeded their SLA duration.
 */
crons.interval(
  "check-sla-breaches",
  { hours: 1 },
  internal.features.studio.sla.checkSLABreaches
);

/**
 * Refresh expiring OAuth tokens
 * 
 * Runs every 15 minutes to check for OAuth tokens about to expire
 * and automatically refresh them to maintain integrations.
 */
crons.interval(
  "refresh-oauth-tokens",
  { minutes: 15 },
  internal.features.integrations.tokenRefresh.processTokenRefresh
);

export default crons;
