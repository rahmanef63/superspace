"use client";

import { Phone, Video, MessageCircle, PhoneCall, Info, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { getInitials } from "../chat/utils";
import type { CallDetail } from "./mockData";
import { isMockData, getMockDataDisclaimer } from "./mockData";
import { IconBurger } from "@tabler/icons-react";

interface CallDetailViewProps {
  call?: CallDetail;
  onBack?: () => void;
  showMobileHeader?: boolean;
}

export function CallDetailView({ call, onBack, showMobileHeader = false }: CallDetailViewProps) {
  if (!call) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm">
          <Phone className="mx-auto mb-3 md:mb-4 h-12 w-12 md:h-16 md:w-16 text-muted-foreground opacity-50" />
          <h2 className="mb-2 text-lg md:text-xl font-medium text-foreground">Make voice and video calls</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Search for a contact to start calling</p>
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
    <div className="flex-1 bg-background">
      {/* Mobile Header with Back Button */}
      {showMobileHeader && onBack && (
        <div className="sticky top-0 z-10 flex min-h-[56px] md:min-h-[60px] items-center gap-3 md:gap-4 border-b border-border bg-background px-3 md:px-4 py-2 md:py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 md:h-10 md:w-10"
            aria-label="Back to calls list"
          >
            <Menu className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <Avatar className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-sm md:text-base font-medium text-primary">
                {getInitials(call.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm md:text-base font-semibold text-foreground truncate">{call.name}</h2>
              <p className="text-xs md:text-sm text-muted-foreground truncate">{call.phoneNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <Button
              onClick={handleVideoCall}
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10"
              type="button"
              aria-label={`Video call ${call.name}`}
            >
              <Video className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button
              onClick={handleVoiceCall}
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10"
              type="button"
              aria-label={`Voice call ${call.name}`}
            >
              <Phone className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-2xl space-y-4 md:space-y-6">
        {/* Mock Data Disclaimer */}
        {isMockData() && (
          <Alert className="text-xs md:text-sm">
            <Info className="h-3 w-3 md:h-4 md:w-4" />
            <AlertDescription>
              {getMockDataDisclaimer()}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="text-center pb-3 md:pb-4">
            <Avatar className="mx-auto mb-3 md:mb-4 h-20 w-20 md:h-24 md:w-24">
              <AvatarFallback className="bg-primary/10 text-xl md:text-2xl font-medium text-primary">
                {getInitials(call.name)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl md:text-2xl">{call.name}</CardTitle>
            <p className="text-sm md:text-base text-muted-foreground">{call.phoneNumber}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Last call: {call.lastActivity}</p>
          </CardHeader>

          <CardContent className="flex flex-wrap justify-center gap-2 md:gap-4 pb-4 md:pb-6">
            <Button
              onClick={handleVoiceCall}
              className="flex items-center gap-2 text-xs md:text-sm h-9 md:h-10 px-3 md:px-4"
              type="button"
              aria-label={`Start voice call with ${call.name}`}
            >
              <Phone className="h-3 w-3 md:h-4 md:w-4" />
              Voice Call
            </Button>
            <Button
              onClick={handleVideoCall}
              variant="outline"
              className="flex items-center gap-2 text-xs md:text-sm h-9 md:h-10 px-3 md:px-4"
              type="button"
              aria-label={`Start video call with ${call.name}`}
            >
              <Video className="h-3 w-3 md:h-4 md:w-4" />
              Video Call
            </Button>
            <Button
              onClick={handleMessage}
              variant="outline"
              className="flex items-center gap-2 text-xs md:text-sm h-9 md:h-10 px-3 md:px-4"
              type="button"
              aria-label={`Send message to ${call.name}`}
            >
              <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
              Message
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <PhoneCall className="h-4 w-4 md:h-5 md:w-5" />
              Call History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {call.history.map((day) => (
              <div key={day.date}>
                <h4 className="mb-2 text-xs md:text-sm font-medium text-muted-foreground">{day.date}</h4>
                <div className="space-y-2">
                  {day.entries.map((entry, index) => (
                    <div
                      key={`${day.date}-${index}`}
                      className="flex items-center justify-between rounded-lg border p-2 md:p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full flex-shrink-0",
                            entry.status === "missed" ? "bg-red-500" : "bg-green-500",
                          )}
                        />
                        <span className="text-xs md:text-sm truncate">
                          {entry.direction === "incoming" ? "Incoming" : "Outgoing"}
                          {entry.medium === "video" ? " video" : ""} call
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0">{entry.time}</span>
                      </div>
                      {entry.duration && (
                        <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0 ml-2">{entry.duration}</span>
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
    </div>
  );
}

