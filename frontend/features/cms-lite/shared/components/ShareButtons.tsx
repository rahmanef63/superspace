import React, { useState } from "react";
import { Share2, Link2, Copy, Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { useShare } from "../hooks/useShare";
import { Modal } from "./Modal";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: "default" | "compact";
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  url,
  title,
  description,
  className = "",
  variant = "default",
}) => {
  const { share, copyToClipboard } = useShare();
  const [showModal, setShowModal] = useState(false);

  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDesc = encodeURIComponent(description || title);

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  if (variant === "compact") {
    return (
      <>
        <div className={`flex gap-2 ${className}`}>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 rounded-lg bg-background hover:bg-accent transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Share" size="sm">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => shareToSocial("facebook")}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Facebook</span>
              </button>
              <button
                onClick={() => shareToSocial("twitter")}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Twitter className="w-5 h-5 text-sky-500" />
                <span>Twitter</span>
              </button>
              <button
                onClick={() => shareToSocial("linkedin")}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Linkedin className="w-5 h-5 text-blue-700" />
                <span>LinkedIn</span>
              </button>
              <button
                onClick={() => shareToSocial("whatsapp")}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span>WhatsApp</span>
              </button>
            </div>
            <div className="pt-3 border-t border-border">
              <button
                onClick={() => {
                  copyToClipboard(fullUrl, title);
                  setShowModal(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Copy className="w-5 h-5" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Share" size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => shareToSocial("facebook")}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span>Facebook</span>
            </button>
            <button
              onClick={() => shareToSocial("twitter")}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Twitter className="w-5 h-5 text-sky-500" />
              <span>Twitter</span>
            </button>
            <button
              onClick={() => shareToSocial("linkedin")}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Linkedin className="w-5 h-5 text-blue-700" />
              <span>LinkedIn</span>
            </button>
            <button
              onClick={() => shareToSocial("whatsapp")}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span>WhatsApp</span>
            </button>
          </div>
          <div className="pt-3 border-t border-border">
            <button
              onClick={() => {
                copyToClipboard(fullUrl, title);
                setShowModal(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Copy className="w-5 h-5" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
