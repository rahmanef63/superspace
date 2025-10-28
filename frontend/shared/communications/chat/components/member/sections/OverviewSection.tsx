import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Video, Phone, Info, Edit3 } from "lucide-react";
import type { MemberInfoContact } from "../types";

type OverviewSectionProps = {
  contact: MemberInfoContact;
  isMobile: boolean;
};

const FALLBACK_ABOUT = "Hey there! I am using Chats.";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function OverviewSection({
  contact,
  isMobile,
}: OverviewSectionProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-wa-surface border border-wa-border p-4 text-center md:p-6">
        <div className="relative inline-block">
          <Avatar
            className={[
              "mx-auto border-4 border-primary/20",
              isMobile ? "mb-3 h-24 w-24" : "mb-4 h-32 w-32",
            ].join(" ")}
          >
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback
              className={[
                "bg-primary text-primary-foreground font-semibold",
                isMobile ? "text-lg" : "text-2xl",
              ].join(" ")}
            >
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>

          <Button
            size="icon"
            className={[
              "absolute bottom-2 right-2 rounded-full bg-primary text-primary-foreground shadow-wa-lg",
              isMobile ? "h-6 w-6" : "h-8 w-8",
            ].join(" ")}
          >
            <Edit3 className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </div>

        <h2
          className={[
            "font-semibold text-wa-text",
            isMobile ? "text-xl" : "text-2xl",
          ].join(" ")}
        >
          {contact.name}
        </h2>

        {contact.username && (
          <p className="text-wa-muted">@{contact.username}</p>
        )}

        <div
          className={[
            "flex justify-center gap-3",
            isMobile ? "mt-4 flex-col" : "mt-6 flex-row",
          ].join(" ")}
        >
          <Button
            variant="outline"
            size={isMobile ? "default" : "lg"}
            className={[
              "border-wa-border bg-wa-surface hover:bg-wa-hover",
              isMobile ? "w-full" : "flex-1 max-w-40",
            ].join(" ")}
          >
            <Video className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Video
          </Button>
          <Button
            variant="outline"
            size={isMobile ? "default" : "lg"}
            className={[
              "border-wa-border bg-wa-surface hover:bg-wa-hover",
              isMobile ? "w-full" : "flex-1 max-w-40",
            ].join(" ")}
          >
            <Phone className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Voice
          </Button>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="rounded-wa-lg border border-wa-border bg-wa-surface p-4">
          <h3 className="mb-2 flex items-center gap-2 font-medium text-wa-text">
            <Info className="h-4 w-4" />
            About
          </h3>
          <p className="text-wa-muted">{contact.about ?? FALLBACK_ABOUT}</p>
        </div>

        {contact.phoneNumber && (
          <div className="rounded-wa-lg border border-wa-border bg-wa-surface p-4">
            <h3 className="mb-2 flex items-center gap-2 font-medium text-wa-text">
              <Phone className="h-4 w-4" />
              Phone number
            </h3>
            <p className="text-wa-muted">{contact.phoneNumber}</p>
          </div>
        )}

        <div className="rounded-wa-lg border border-wa-border bg-wa-surface p-4">
          <h3 className="mb-2 font-medium text-wa-text">Privacy Settings</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-wa-text">Disappearing messages</p>
              <p className="text-sm text-wa-muted">Off</p>
            </div>

            <Separator className="bg-wa-border" />

            <div>
              <p className="text-sm text-wa-text">Advanced chat privacy</p>
              <p className="mb-3 text-xs text-wa-muted">
                This setting can only be updated on your phone.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-wa-muted">Off</span>
                <Switch disabled />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-wa-lg border border-wa-border bg-wa-surface p-4">
          <h3 className="mb-4 font-medium text-wa-text">Notifications</h3>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm text-wa-text">Mute notifications</p>
              <Button
                variant="outline"
                size="sm"
                className="border-wa-border text-wa-muted"
              >
                Mute for 8 hours
              </Button>
            </div>

            <div>
              <p className="mb-2 text-sm text-wa-text">Notification tone</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-wa-border">
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-wa-border text-wa-muted"
                >
                  Default
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-center border-wa-border text-wa-muted hover:text-wa-text"
        >
          Remove from favorites
        </Button>
        <div className={isMobile ? "flex flex-col gap-3" : "flex gap-3"}>
          <Button
            variant="outline"
            className="flex-1 justify-center border-wa-border text-wa-muted hover:text-wa-text"
          >
            Block
          </Button>
          <Button variant="destructive" className="flex-1 justify-center">
            Report contact
          </Button>
        </div>
      </div>
    </div>
  );
}
