/**
 * Calls Feature Types
 * 
 * Type definitions for the calls feature.
 * These types are used across CallsView, CallListView, and CallDetailView.
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
