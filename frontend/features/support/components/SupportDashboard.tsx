/**
 * Support Dashboard
 * Lists tickets and shows chat
 */

"use client";

import React, { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { SupportChatContainer } from "./SupportChatContainer";
import { useIsMobile } from "@/hooks/use-mobile";
import { SecondarySidebarLayout } from "@/frontend/shared/ui";
import { Ticket as TicketIcon, Plus, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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

// Hook to fetch support tickets from Convex
const useSupportTickets = (workspaceId: Id<"workspaces"> | null) => {
  const rawTickets = useQuery(
    api.features.support.queries.getWorkspaceTickets,
    workspaceId ? { workspaceId } : undefined
  );

  const tickets: Ticket[] = (rawTickets ?? []).map(ticket => ({
    id: ticket._id,
    title: ticket.subject ?? "Support Request",
    status: ticket.status as "open" | "pending" | "resolved" | "closed",
    customerId: ticket.customerId,
    customerName: ticket.customer?.name ?? "Customer",
    createdAt: ticket._creationTime ?? Date.now(),
    priority: ticket.priority as "low" | "normal" | "high" | undefined,
  }));

  return { tickets, isLoading: workspaceId !== null && rawTickets === undefined };
};

/**
 * Support Dashboard with ticket list and chat
 */
export function SupportDashboard({ workspaceId }: SupportDashboardProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { tickets, isLoading } = useSupportTickets(workspaceId);

  const isMobile = useIsMobile();

  const handleTicketUpdate = (ticketId: string, update: any) => {
    console.log("Update ticket:", ticketId, update);
    // TODO: Update ticket in backend
  };

  const TicketList = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Support Tickets</h2>
        <Button variant="ghost" size="icon">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-16 w-16 mb-4 bg-muted rounded-full flex items-center justify-center">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">No tickets yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-[250px]">
              Support tickets from your customers will appear here.
            </p>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Ticket
            </Button>
          </div>
        ) : (
          tickets.map((ticket) => (
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
          ))
        )}
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
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="h-20 w-20 mb-6 bg-muted rounded-full flex items-center justify-center">
            <TicketIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Select a ticket
          </h3>
          <p className="text-sm text-muted-foreground max-w-[300px]">
            Choose a support ticket from the list to view the conversation and respond to your customers.
          </p>
        </div>
      )}
    </SecondarySidebarLayout>
  );
}
