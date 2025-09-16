import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Paperclip, Mic, Send } from "lucide-react";
import { PLACEHOLDERS } from "../../constants";
import { EmojiPicker } from "./composer/EmojiPicker";
import { AttachmentMenu } from "./composer/AttachmentMenu";

interface ComposerBarProps {
  onSendMessage?: (message: string) => void;
  placeholder?: string;
}

export function ComposerBar({
  onSendMessage,
  placeholder = PLACEHOLDERS.TYPE_MESSAGE,
}: ComposerBarProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim());
      setMessage("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleAttachmentSelect = (type: string) => {
    console.log("Attachment type selected:", type);
    // Handle different attachment types
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t border-wa-border bg-wa-surface">
      <ComposerActions 
        onEmojiSelect={handleEmojiSelect}
        onAttachmentSelect={handleAttachmentSelect}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        showAttachmentMenu={showAttachmentMenu}
        setShowAttachmentMenu={setShowAttachmentMenu}
      />
      
      <div className="flex-1 relative">
        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="bg-wa-surface-2 border-none text-wa-text placeholder:text-wa-muted focus-visible:ring-wa-accent pr-10"
        />
      </div>

      {message.trim() ? (
        <Button
          onClick={handleSend}
          size="icon"
          className="bg-wa-accent hover:bg-wa-accent-2 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="text-wa-muted hover:text-wa-text">
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

interface ComposerActionsProps {
  onEmojiSelect: (emoji: string) => void;
  onAttachmentSelect: (type: string) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  showAttachmentMenu: boolean;
  setShowAttachmentMenu: (show: boolean) => void;
}

function ComposerActions({
  onEmojiSelect,
  onAttachmentSelect,
  showEmojiPicker,
  setShowEmojiPicker,
  showAttachmentMenu,
  setShowAttachmentMenu,
}: ComposerActionsProps) {
  return (
    <>
      {/* Emoji Picker */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="text-wa-muted hover:text-wa-text">
            <Smile className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          align="start" 
          className="w-auto p-0 border-0 shadow-none bg-transparent"
        >
          <EmojiPicker 
            onEmojiSelect={onEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </PopoverContent>
      </Popover>
      
      {/* Attachment Menu */}
      <Popover open={showAttachmentMenu} onOpenChange={setShowAttachmentMenu}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="text-wa-muted hover:text-wa-text">
            <Paperclip className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          align="start" 
          className="w-auto p-0 border-0 shadow-none bg-transparent"
        >
          <AttachmentMenu 
            onSelect={onAttachmentSelect}
            onClose={() => setShowAttachmentMenu(false)}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
