"use client";

/**
 * Sample Data for Calls Feature
 * 
 * This file contains sample/placeholder data for the calls feature.
 * Used for:
 * 1. Menu store previews and demos
 * 2. Builder templates and content examples
 * 3. Development and testing when no real data exists
 * 
 * NOTE: Types are now in ./types.ts
 * Production code should use Convex queries, not this sample data.
 */

import type { CallDetail, CallSummary } from "./types";

/**
 * Sample call data for previews and demos
 * Names are clearly fake: John Doe, Jane Smith, Fulan, etc.
 */
const SAMPLE_CALL_DATA: CallDetail[] = [
  {
    id: "sample-call-1",
    name: "John Doe",
    phoneNumber: "+1 555-0100",
    avatar: undefined,
    lastActivity: "2 minutes ago",
    direction: "outgoing",
    medium: "voice",
    status: "completed",
    duration: "5:23",
    history: [
      {
        date: "Today",
        entries: [
          { time: "2:30 PM", direction: "outgoing", medium: "voice", duration: "5:23", status: "completed" },
          { time: "10:15 AM", direction: "incoming", medium: "voice", duration: "2:45", status: "completed" },
        ],
      },
    ],
  },
  {
    id: "sample-call-2",
    name: "Jane Smith",
    phoneNumber: "+1 555-0101",
    avatar: undefined,
    lastActivity: "15 minutes ago",
    direction: "incoming",
    medium: "video",
    status: "missed",
    history: [
      {
        date: "Today",
        entries: [
          { time: "5:45 PM", direction: "incoming", medium: "video", status: "missed" },
        ],
      },
    ],
  },
  {
    id: "sample-call-3",
    name: "Fulan bin Fulan",
    phoneNumber: "+62 811-2222-3344",
    avatar: undefined,
    lastActivity: "1 hour ago",
    direction: "outgoing",
    medium: "voice",
    status: "completed",
    duration: "12:45",
    history: [],
  },
];

/**
 * Sample call summaries for list views
 */
export const SAMPLE_CALL_SUMMARIES: CallSummary[] = SAMPLE_CALL_DATA.map(
  ({ id, name, avatar, lastActivity, direction, medium, status, duration }) => ({
    id,
    name,
    avatar,
    lastActivity,
    direction,
    medium,
    status,
    duration,
  }),
);

/**
 * Sample call details for detail views
 */
export const SAMPLE_CALL_DETAILS: CallDetail[] = SAMPLE_CALL_DATA;

/**
 * Get sample call by ID (for previews/demos only)
 */
export function getSampleCallDetail(id?: string): CallDetail | undefined {
  if (!id) return undefined;
  return SAMPLE_CALL_DETAILS.find((call) => call.id === id);
}

/**
 * Check if we're using sample data
 * Can be used to show disclaimer in preview mode
 */
export function isSampleData(): boolean {
  return true;
}

// Re-export types for backwards compatibility
export type { CallDetail, CallSummary, CallDirection, CallMedium, CallStatus, CallHistoryEntry, CallHistoryDay } from "./types";
