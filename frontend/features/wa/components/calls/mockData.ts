"use client";

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

const CALL_DATA: CallDetail[] = [
  {
    id: "1",
    name: "Zahra Khalil",
    phoneNumber: "+62 812-3456-7890",
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
      {
        date: "Yesterday",
        entries: [
          { time: "8:20 PM", direction: "outgoing", medium: "voice", duration: "15:30", status: "completed" },
          { time: "3:45 PM", direction: "incoming", medium: "voice", status: "missed" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Jusmar",
    phoneNumber: "+62 821-9876-5432",
    avatar: undefined,
    lastActivity: "1 hour ago",
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
    id: "3",
    name: "Mom",
    phoneNumber: "+62 811-2222-3344",
    avatar: undefined,
    lastActivity: "3 hours ago",
    direction: "outgoing",
    medium: "voice",
    status: "completed",
    duration: "12:45",
    history: [
      {
        date: "Today",
        entries: [
          { time: "4:05 PM", direction: "outgoing", medium: "voice", duration: "12:45", status: "completed" },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Work Team",
    phoneNumber: "+62 895-0034-5678",
    avatar: undefined,
    lastActivity: "Yesterday",
    direction: "incoming",
    medium: "video",
    status: "completed",
    duration: "45:12",
    history: [
      {
        date: "Yesterday",
        entries: [
          { time: "7:15 PM", direction: "incoming", medium: "video", duration: "45:12", status: "completed" },
        ],
      },
    ],
  },
];

export const CALL_DETAILS: CallDetail[] = CALL_DATA;

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

export function getCallDetail(id?: string): CallDetail | undefined {
  if (!id) return undefined;
  return CALL_DETAILS.find((call) => call.id === id);
}

