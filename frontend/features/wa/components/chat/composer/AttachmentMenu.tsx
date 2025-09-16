import React from "react";
import { 
  Image, 
  Camera, 
  FileText, 
  User, 
  BarChart3,
  Edit3
} from "lucide-react";

interface AttachmentMenuProps {
  onSelect: (type: string) => void;
  onClose: () => void;
}

interface AttachmentOptionProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  onClick: () => void;
}

function AttachmentOption({ icon: Icon, label, description, onClick }: AttachmentOptionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-3 text-left hover:bg-wa-hover transition-colors rounded-lg"
    >
      <div className="w-12 h-12 bg-wa-accent rounded-full flex items-center justify-center">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-wa-text">{label}</div>
        {description && (
          <div className="text-sm text-wa-muted">{description}</div>
        )}
      </div>
    </button>
  );
}

export function AttachmentMenu({ onSelect, onClose }: AttachmentMenuProps) {
  const attachmentOptions = [
    {
      icon: Image,
      label: "Photos & videos",
      onClick: () => {
        onSelect("media");
        onClose();
      }
    },
    {
      icon: Camera,
      label: "Camera",
      onClick: () => {
        onSelect("camera");
        onClose();
      }
    },
    {
      icon: FileText,
      label: "Document",
      onClick: () => {
        onSelect("document");
        onClose();
      }
    },
    {
      icon: User,
      label: "Contact",
      onClick: () => {
        onSelect("contact");
        onClose();
      }
    },
    {
      icon: BarChart3,
      label: "Poll",
      onClick: () => {
        onSelect("poll");
        onClose();
      }
    },
    {
      icon: Edit3,
      label: "Drawing",
      onClick: () => {
        onSelect("drawing");
        onClose();
      }
    }
  ];

  return (
    <div className="w-[280px] bg-wa-surface border border-wa-border rounded-lg shadow-lg p-2">
      <div className="space-y-1">
        {attachmentOptions.map((option, index) => (
          <AttachmentOption
            key={index}
            icon={option.icon}
            label={option.label}
            onClick={option.onClick}
          />
        ))}
      </div>
    </div>
  );
}
