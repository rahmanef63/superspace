import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Clock, 
  Smile, 
  Heart, 
  Flag 
} from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const RECENT_EMOJIS = [
  "😃", "🙏", "🥶", "😭", "👍", "💩", "💧", "😌", "🤔", "😍", "😇", 
  "😊", "🤩", "🔥", "🦴", "😕", "🤭", "😉", "😜", "🥰", "😚", "🤑",
  "🤪", "🧠", "😱"
];

const EMOJI_CATEGORIES = {
  "smileys": {
    label: "Smileys & people",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "🥹", "😅", "😂", "🤣", "🥲", "☺️",
      "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙",
      "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸",
      "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣"
    ]
  },
  "animals": {
    label: "Animals & nature", 
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔"
    ]
  },
  "food": {
    label: "Food & drink",
    emojis: [
      "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑",
      "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️"
    ]
  },
  "activities": {
    label: "Activities",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀",
      "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹"
    ]
  },
  "travel": {
    label: "Travel & places",
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻",
      "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🛴", "🛹", "🛼", "🚁", "✈️"
    ]
  },
  "objects": {
    label: "Objects",
    emojis: [
      "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️",
      "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️"
    ]
  },
  "symbols": {
    label: "Symbols",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️",
      "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️"
    ]
  },
  "flags": {
    label: "Flags",
    emojis: [
      "🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇦🇫", "🇦🇽",
      "🇦🇱", "🇩🇿", "🇦🇸", "🇦🇩", "🇦🇴", "🇦🇮", "🇦🇶", "🇦🇬", "🇦🇷", "🇦🇲"
    ]
  }
};

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="w-[400px] h-[500px] bg-background border border-border rounded-lg shadow-lg flex flex-col">
      <Tabs defaultValue="emojis" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="emojis" className="text-foreground">Emoji</TabsTrigger>
          <TabsTrigger value="gifs" className="text-foreground">GIFs</TabsTrigger>
          <TabsTrigger value="stickers" className="text-foreground">Stickers</TabsTrigger>
        </TabsList>

        <TabsContent value="emojis" className="flex-1 flex flex-col mt-0">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search emojis"
                className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Recent Section */}
          <ScrollArea className="flex-1">
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Recent</span>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {RECENT_EMOJIS.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => onEmojiSelect(emoji)}
                    className="text-2xl p-2 h-auto"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            {/* Emoji Categories */}
            <div className="p-3 space-y-4">
              {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                <div key={key}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {category.label}
                  </h3>
                  <div className="grid grid-cols-8 gap-2">
                    {category.emojis.map((emoji, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => onEmojiSelect(emoji)}
                        className="text-2xl p-2 h-auto"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Bottom Categories */}
          <div className="p-2 border-t border-border">
            <div className="flex justify-center gap-4">
              <Button variant="ghost" size="icon">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon">
                <Smile className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon">
                <Flag className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gifs" className="flex-1">
          <GifPicker onSelect={onEmojiSelect} />
        </TabsContent>

        <TabsContent value="stickers" className="flex-1">
          <StickerPicker onSelect={onEmojiSelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GifPicker({ onSelect }: { onSelect: (gif: string) => void }) {
  const TRENDING_CATEGORIES = ["Trending", "Haha", "Sad", "Love", "Reaction", "Sports", "TV"];
  
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search GIFs via Tenor"
            className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i}
                className="aspect-square bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onSelect(`gif-${i}`)}
              />
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {TRENDING_CATEGORIES.map((category) => (
              <Button
                key={category}
                variant="secondary"
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function StickerPicker({ onSelect }: { onSelect: (sticker: string) => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-3">
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div 
                key={i}
                className="aspect-square bg-muted rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
                onClick={() => onSelect(`sticker-${i}`)}
              >
                <span className="text-2xl">🤖</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
