/**
 * Support Dashboard
 * Lists tickets and shows chat
 */

"use client";

import React, { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { SupportChatContainer } from "./SupportChatContainer";
import { useIsMobile } from "@/hooks/use-mobile";
import { SecondarySidebarLayout } from "@/frontend/shared/ui/layout/sidebar/secondary";

export type Ticket = {
  id: string;
  title: string;
  status: "open" | "pending" | "resolved" | "closed";
  customerId: string;
  customerName: string;
  createdAt: number;
  priority?: "low" | "normal" | "high";
};

export type SupportDashboardProps = {
  workspaceId: Id<"workspaces"> | null;
};

/**
 * Support Dashboard with ticket list and chat
 */
export function SupportDashboard({ workspaceId }: SupportDashboardProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets] = useState<Ticket[]>([
    // TODO: Fetch from API
    {
      id: "TKT-001",
      title: "Cannot access dashboard",
      status: "open",
      customerId: "cust_1",
      customerName: "John Doe",
      createdAt: Date.now() - 3600000,
      priority: "high",
    },
    {
      id: "TKT-002",
      title: "Billing question",
      status: "pending",
      customerId: "cust_2",
      customerName: "Jane Smith",
      createdAt: Date.now() - 7200000,
      priority: "normal",
    },
  ]);

  const isMobile = useIsMobile();

  const handleTicketUpdate = (ticketId: string, update: any) => {
    console.log("Update ticket:", ticketId, update);
    // TODO: Update ticket in backend
  };

  const TicketList = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Support Tickets</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => setSelectedTicket(ticket)}
            className={`w-full p-4 text-left border-b hover:bg-muted/50 transition-colors ${
              selectedTicket?.id === ticket.id ? "bg-muted" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{ticket.id}</span>
                  {ticket.priority === "high" && (
                    <span className="text-xs text-red-600">🔴 High</span>
                  )}
                </div>
                <p className="text-sm truncate mt-1">{ticket.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {ticket.customerName}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  ticket.status === "open"
                    ? "bg-green-100 text-green-800"
                    : ticket.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {ticket.status}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    if (selectedTicket) {
      return (
        <div className="h-full">
          <SupportChatContainer
            workspaceId={workspaceId}
            ticketId={selectedTicket.id}
            ticketTitle={selectedTicket.title}
            ticketStatus={selectedTicket.status}
            customerId={selectedTicket.customerId}
            onTicketUpdate={handleTicketUpdate}
          />
        </div>
      );
    }

    return <TicketList />;
  }

  return (
    <SecondarySidebarLayout
      className="h-full"
      sidebar={<TicketList />}
      contentClassName="h-full"
    >
      {selectedTicket ? (
        <SupportChatContainer
          workspaceId={workspaceId}
          ticketId={selectedTicket.id}
          ticketTitle={selectedTicket.title}
          ticketStatus={selectedTicket.status}
          customerId={selectedTicket.customerId}
          onTicketUpdate={handleTicketUpdate}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a ticket to view conversation
        </div>
      )}
    </SecondarySidebarLayout>
  );
}
