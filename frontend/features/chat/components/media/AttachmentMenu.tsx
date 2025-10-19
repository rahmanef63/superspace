import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Paperclip, 
  Camera, 
  Image, 
  FileText, 
  MapPin, 
  User, 
  Video,
  Mic 
} from "lucide-react";

interface AttachmentMenuProps {
  onPhotoSelect?: () => void;
  onCameraOpen?: () => void;
  onDocumentSelect?: () => void;
  onLocationShare?: () => void;
  onContactShare?: () => void;
  onVideoSelect?: () => void;
  onAudioRecord?: () => void;
}

export function AttachmentMenu({
  onPhotoSelect,
  onCameraOpen,
  onDocumentSelect,
  onLocationShare,
  onContactShare,
  onVideoSelect,
  onAudioRecord
}: AttachmentMenuProps) {
  const attachmentOptions = [
    {
      icon: Camera,
      label: "Camera",
      color: "text-green-600",
      onClick: onCameraOpen
    },
    {
      icon: Image,
      label: "Photo & Video",
      color: "text-blue-600",
      onClick: onPhotoSelect
    },
    {
      icon: FileText,
      label: "Document",
      color: "text-purple-600",
      onClick: onDocumentSelect
    },
    {
      icon: MapPin,
      label: "Location",
      color: "text-red-600",
      onClick: onLocationShare
    },
    {
      icon: User,
      label: "Contact",
      color: "text-orange-600",
      onClick: onContactShare
    },
    {
      icon: Video,
      label: "Video",
      color: "text-teal-600",
      onClick: onVideoSelect
    },
    {
      icon: Mic,
      label: "Audio",
      color: "text-pink-600",
      onClick: onAudioRecord
    }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Paperclip className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end" side="top">
        <div className="grid grid-cols-2 gap-2">
          {attachmentOptions.map((option) => (
            <Button
              key={option.label}
              variant="ghost"
              className="h-auto p-3 flex flex-col gap-2 hover:bg-accent"
              onClick={option.onClick}
            >
              <option.icon className={`h-6 w-6 ${option.color}`} />
              <span className="text-xs text-foreground">{option.label}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
