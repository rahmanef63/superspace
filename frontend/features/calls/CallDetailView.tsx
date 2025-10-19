"use client";

import { Phone, Video, MessageCircle, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getInitials } from "../chat/utils";
import type { CallDetail } from "./mockData";

interface CallDetailViewProps {
  call?: CallDetail;
}

export function CallDetailView({ call }: CallDetailViewProps) {
  if (!call) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="text-center">
          <Phone className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
          <h2 className="mb-2 text-xl font-medium text-foreground">Make voice and video calls</h2>
          <p className="text-sm text-muted-foreground">Search for a contact to start calling</p>
        </div>
      </div>
    );
  }

  const handleVoiceCall = () => {
    console.log("Starting voice call with", call.name);
  };

  const handleVideoCall = () => {
    console.log("Starting video call with", call.name);
  };

  const handleMessage = () => {
    console.log("Opening chat with", call.name);
  };

  return (
    <div className="flex-1 bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <Avatar className="mx-auto mb-4 h-24 w-24">
              <AvatarFallback className="bg-primary/10 text-2xl font-medium text-primary">
                {getInitials(call.name)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{call.name}</CardTitle>
            <p className="text-muted-foreground">{call.phoneNumber}</p>
            <p className="text-sm text-muted-foreground">Last call: {call.lastActivity}</p>
          </CardHeader>

          <CardContent className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={handleVoiceCall}
              className="flex items-center gap-2"
              type="button"
            >
              <Phone className="h-4 w-4" />
              Voice Call
            </Button>
            <Button
              onClick={handleVideoCall}
              variant="outline"
              className="flex items-center gap-2"
              type="button"
            >
              <Video className="h-4 w-4" />
              Video Call
            </Button>
            <Button
              onClick={handleMessage}
              variant="outline"
              className="flex items-center gap-2"
              type="button"
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Call History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {call.history.map((day) => (
              <div key={day.date}>
                <h4 className="mb-2 font-medium text-muted-foreground">{day.date}</h4>
                <div className="space-y-2">
                  {day.entries.map((entry, index) => (
                    <div
                      key={`${day.date}-${index}`}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            entry.status === "missed" ? "bg-red-500" : "bg-green-500",
                          )}
                        />
                        <span className="text-sm">
                          {entry.direction === "incoming" ? "Incoming" : "Outgoing"}
                          {entry.medium === "video" ? " video" : ""} call
                        </span>
                        <span className="text-sm text-muted-foreground">{entry.time}</span>
                      </div>
                      {entry.duration && (
                        <span className="text-sm text-muted-foreground">{entry.duration}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

