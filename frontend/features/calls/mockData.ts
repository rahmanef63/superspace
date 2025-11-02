"use client";

/**
 * Mock Data for Calls Feature
 * 
 * This file contains mock/placeholder data for the calls feature.
 * All data here is clearly fake and used for:
 * 1. UI development and testing
 * 2. Placeholder when real data is unavailable
 * 3. Preview in menu stores and demos
 * 
 * Names like "John Doe", "Jane Smith", "Fulan" indicate this is not real data.
 * Content uses "Lorem ipsum" or "Blah blah" style placeholders.
 */

export type CallDirection = "incoming" | "outgoing";
export type CallMedium = "voice" | "video";
export type CallStatus = "completed" | "missed";

export interface CallHistoryEntry {
  time: string;
  direction: CallDirection;
  medium: CallMedium;
  duration?: string;
  status: CallStatus;
}

export interface CallHistoryDay {
  date: string;
  entries: CallHistoryEntry[];
}

export interface CallDetail {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  lastActivity: string;
  direction: CallDirection;
  medium: CallMedium;
  status: CallStatus;
  duration?: string;
  history: CallHistoryDay[];
}

export type CallSummary = Pick<
  CallDetail,
  "id" | "name" | "avatar" | "lastActivity" | "direction" | "medium" | "status" | "duration"
>;

/**
 * Mock call history data
 * Using placeholder names: John Doe, Jane Smith, Fulan, etc.
 */
/**
 * Mock call history data
 * Using placeholder names: John Doe, Jane Smith, Fulan, etc.
 */
const CALL_DATA: CallDetail[] = [
  {
    id: "mock-call-1",
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
          { time: "9:00 AM", direction: "outgoing", medium: "voice", duration: "1:30", status: "completed" },
        ],
      },
      {
        date: "Yesterday",
        entries: [
          { time: "8:20 PM", direction: "outgoing", medium: "voice", duration: "15:30", status: "completed" },
          { time: "3:45 PM", direction: "incoming", medium: "voice", status: "missed" },
          { time: "11:30 AM", direction: "incoming", medium: "voice", duration: "8:12", status: "completed" },
        ],
      },
      {
        date: "Nov 1",
        entries: [
          { time: "6:00 PM", direction: "outgoing", medium: "video", duration: "20:45", status: "completed" },
          { time: "2:15 PM", direction: "incoming", medium: "voice", duration: "3:20", status: "completed" },
        ],
      },
    ],
  },
  {
    id: "mock-call-2",
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
          { time: "2:10 PM", direction: "outgoing", medium: "video", duration: "12:30", status: "completed" },
        ],
      },
      {
        date: "Yesterday",
        entries: [
          { time: "4:30 PM", direction: "incoming", medium: "video", duration: "25:15", status: "completed" },
        ],
      },
    ],
  },
  {
    id: "mock-call-3",
    name: "Fulan bin Fulan",
    phoneNumber: "+62 811-2222-3344",
    avatar: undefined,
    lastActivity: "1 hour ago",
    direction: "outgoing",
    medium: "voice",
    status: "completed",
    duration: "12:45",
    history: [
      {
        date: "Today",
        entries: [
          { time: "4:05 PM", direction: "outgoing", medium: "voice", duration: "12:45", status: "completed" },
          { time: "1:20 PM", direction: "incoming", medium: "voice", duration: "5:30", status: "completed" },
        ],
      },
      {
        date: "Yesterday",
        entries: [
          { time: "10:00 AM", direction: "outgoing", medium: "voice", duration: "7:15", status: "completed" },
        ],
      },
    ],
  },
  {
    id: "mock-call-4",
    name: "Someone Important",
    phoneNumber: "+1 555-0102",
    avatar: undefined,
    lastActivity: "3 hours ago",
    direction: "incoming",
    medium: "video",
    status: "completed",
    duration: "45:12",
    history: [
      {
        date: "Today",
        entries: [
          { time: "2:15 PM", direction: "incoming", medium: "video", duration: "45:12", status: "completed" },
        ],
      },
      {
        date: "Yesterday",
        entries: [
          { time: "7:15 PM", direction: "incoming", medium: "video", duration: "30:00", status: "completed" },
          { time: "3:00 PM", direction: "outgoing", medium: "voice", status: "missed" },
        ],
      },
      {
        date: "Oct 31",
        entries: [
          { time: "5:30 PM", direction: "incoming", medium: "video", duration: "1:02:30", status: "completed" },
        ],
      },
    ],
  },
  {
    id: "mock-call-5",
    name: "Test Group Chat",
    phoneNumber: "+1 555-0103",
    avatar: undefined,
    lastActivity: "5 hours ago",
    direction: "outgoing",
    medium: "video",
    status: "completed",
    duration: "22:18",
    history: [
      {
        date: "Today",
        entries: [
          { time: "12:00 PM", direction: "outgoing", medium: "video", duration: "22:18", status: "completed" },
        ],
      },
      {
        date: "Oct 31",
        entries: [
          { time: "8:45 PM", direction: "incoming", medium: "video", duration: "18:30", status: "completed" },
          { time: "2:30 PM", direction: "outgoing", medium: "video", status: "missed" },
        ],
      },
    ],
  },
  {
    id: "mock-call-6",
    name: "Bob Example",
    phoneNumber: "+1 555-0104",
    avatar: undefined,
    lastActivity: "Yesterday",
    direction: "incoming",
    medium: "voice",
    status: "missed",
    history: [
      {
        date: "Yesterday",
        entries: [
          { time: "11:30 PM", direction: "incoming", medium: "voice", status: "missed" },
          { time: "6:00 PM", direction: "outgoing", medium: "voice", duration: "4:15", status: "completed" },
        ],
      },
      {
        date: "Oct 31",
        entries: [
          { time: "3:20 PM", direction: "incoming", medium: "voice", duration: "9:45", status: "completed" },
        ],
      },
    ],
  },
  {
    id: "mock-call-7",
    name: "Alice Placeholder",
    phoneNumber: "+1 555-0105",
    avatar: undefined,
    lastActivity: "Yesterday",
    direction: "outgoing",
    medium: "voice",
    status: "completed",
    duration: "8:30",
    history: [
      {
        date: "Yesterday",
        entries: [
          { time: "4:15 PM", direction: "outgoing", medium: "voice", duration: "8:30", status: "completed" },
          { time: "10:00 AM", direction: "incoming", medium: "voice", duration: "3:12", status: "completed" },
        ],
      },
    ],
  },
  {
    id: "mock-call-8",
    name: "Sample Contact",
    phoneNumber: "+62 821-9999-8888",
    avatar: undefined,
    lastActivity: "2 days ago",
    direction: "incoming",
    medium: "video",
    status: "completed",
    duration: "15:45",
    history: [
      {
        date: "Oct 31",
        entries: [
          { time: "7:30 PM", direction: "incoming", medium: "video", duration: "15:45", status: "completed" },
          { time: "1:00 PM", direction: "outgoing", medium: "voice", duration: "2:20", status: "completed" },
        ],
      },
    ],
  },
  {
    id: "mock-call-9",
    name: "Demo User",
    phoneNumber: "+1 555-0106",
    avatar: undefined,
    lastActivity: "2 days ago",
    direction: "outgoing",
    medium: "voice",
    status: "missed",
    history: [
      {
        date: "Oct 31",
        entries: [
          { time: "9:15 PM", direction: "outgoing", medium: "voice", status: "missed" },
          { time: "5:45 PM", direction: "incoming", medium: "voice", duration: "6:30", status: "completed" },
        ],
      },
      {
        date: "Oct 30",
        entries: [
          { time: "12:00 PM", direction: "outgoing", medium: "voice", duration: "10:15", status: "completed" },
        ],
      },
    ],
  },
  {
    id: "mock-call-10",
    name: "Placeholder Person",
    phoneNumber: "+1 555-0107",
    avatar: undefined,
    lastActivity: "3 days ago",
    direction: "incoming",
    medium: "voice",
    status: "completed",
    duration: "3:45",
    history: [
      {
        date: "Oct 30",
        entries: [
          { time: "6:30 PM", direction: "incoming", medium: "voice", duration: "3:45", status: "completed" },
        ],
      },
      {
        date: "Oct 29",
        entries: [
          { time: "8:00 PM", direction: "outgoing", medium: "video", duration: "28:12", status: "completed" },
          { time: "3:15 PM", direction: "incoming", medium: "voice", status: "missed" },
        ],
      },
    ],
  },
  {
    id: "mock-call-11",
    name: "Test Account",
    phoneNumber: "+62 812-5555-6666",
    avatar: undefined,
    lastActivity: "3 days ago",
    direction: "outgoing",
    medium: "video",
    status: "completed",
    duration: "35:20",
    history: [
      {
        date: "Oct 30",
        entries: [
          { time: "2:00 PM", direction: "outgoing", medium: "video", duration: "35:20", status: "completed" },
        ],
      },
    ],
  },
  {
    id: "mock-call-12",
    name: "Example Group",
    phoneNumber: "+1 555-0108",
    avatar: undefined,
    lastActivity: "1 week ago",
    direction: "incoming",
    medium: "video",
    status: "missed",
    history: [
      {
        date: "Oct 26",
        entries: [
          { time: "7:45 PM", direction: "incoming", medium: "video", status: "missed" },
          { time: "2:30 PM", direction: "outgoing", medium: "video", duration: "40:15", status: "completed" },
        ],
      },
    ],
  },
];

/**
 * Export mock call details
 * All contacts are placeholders with names like John Doe, Jane Smith, Fulan
 */
export const CALL_DETAILS: CallDetail[] = CALL_DATA;

/**
 * Export mock call summaries (for list views)
 * Simplified version without full history
 */
export const CALL_SUMMARIES: CallSummary[] = CALL_DATA.map(
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
 * Get mock call detail by ID
 * Used for detail view when selecting a call
 */
export function getCallDetail(id?: string): CallDetail | undefined {
  if (!id) return undefined;
  return CALL_DETAILS.find((call) => call.id === id);
}

/**
 * Helper: Check if data is mock/placeholder
 * Returns true if this is mock data (always true in this file)
 */
export function isMockData(): boolean {
  return true;
}

/**
 * Helper: Get mock data disclaimer text
 * Use this to show users that data is placeholder
 */
export function getMockDataDisclaimer(): string {
  return "This is sample data for preview purposes only. Real call history will appear here once connected.";
}
