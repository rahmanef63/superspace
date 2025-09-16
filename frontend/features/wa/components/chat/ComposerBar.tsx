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
  disabled?: boolean;
  disabledReason?: string;
}

export function ComposerBar({
  onSendMessage,
  placeholder = PLACEHOLDERS.TYPE_MESSAGE,
  disabled = false,
  disabledReason,
}: ComposerBarProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (disabled) return;
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
    if (disabled) return;
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleAttachmentSelect = (type: string) => {
    if (disabled) return;
    console.log("Attachment type selected:", type);
    // Handle different attachment types
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t border-border bg-card">
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
          placeholder={disabled ? (disabledReason || "You don't have permission to send messages") : placeholder}
          disabled={disabled}
          className="bg-card border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-primary pr-10"
        />
      </div>

      {message.trim() && !disabled ? (
        <Button
          onClick={handleSend}
          size="icon"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" disabled={disabled}>
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
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
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
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
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

