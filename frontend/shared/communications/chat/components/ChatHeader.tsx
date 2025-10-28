/**
 * Chat header component
 * @module shared/chat/components/ChatHeader
 */

import React from "react";
import type { RoomMeta } from "../types/chat";
import type { UserMeta } from "../types/message";
import type { ChatConfig } from "../types/config";
import { formatUserName } from "../util/formatMessage";

export type ChatHeaderProps = {
  room: RoomMeta | null;
  participants: UserMeta[];
  actions?: Array<"search" | "sort" | "filter" | "pin" | "invite">;
  config: ChatConfig;
  onRefresh?: () => void;
  onSearch?: (query: string) => void;
  onInvite?: () => void;
};

/**
 * Chat header with room info and actions
 */
export function ChatHeader({
  room,
  participants,
  actions = [],
  config,
  onRefresh,
  onSearch,
  onInvite,
}: ChatHeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showSearch, setShowSearch] = React.useState(false);

  const handleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery("");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className="chat-header">
      <div className="chat-header-info">
        {/* Room avatar */}
        {room?.avatarUrl && (
          <img
            src={room.avatarUrl}
            alt={room.name}
            className="chat-header-avatar"
          />
        )}

        {/* Room name & metadata */}
        <div className="chat-header-text">
          <h2 className="chat-header-title">{room?.name || "Loading..."}</h2>
          <div className="chat-header-meta">
            {config.isGroup && (
              <span className="chat-header-participants">
                {participants.length} participant{participants.length !== 1 ? "s" : ""}
              </span>
            )}
            {!config.isGroup && participants.length > 0 && (
              <span className="chat-header-status">
                {formatUserName(participants[0])}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="chat-header-actions">
        {/* Search */}
        {actions.includes("search") && (
          <>
            <button
              className="chat-header-action"
              onClick={handleSearch}
              aria-label="Search messages"
              title="Search"
            >
              🔍
            </button>
            {showSearch && (
              <form onSubmit={handleSearchSubmit} className="chat-header-search">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="chat-header-search-input"
                  autoFocus
                />
              </form>
            )}
          </>
        )}

        {/* Pin */}
        {actions.includes("pin") && (
          <button
            className="chat-header-action"
            aria-label="Pinned messages"
            title="Pinned messages"
          >
            📌
          </button>
        )}

        {/* Invite */}
        {actions.includes("invite") && config.allowInviteLink && (
          <button
            className="chat-header-action"
            onClick={onInvite}
            aria-label="Invite users"
            title="Invite"
          >
            ➕
          </button>
        )}

        {/* Refresh */}
        {onRefresh && (
          <button
            className="chat-header-action"
            onClick={onRefresh}
            aria-label="Refresh"
            title="Refresh"
          >
            🔄
          </button>
        )}
      </div>
    </div>
  );
}
