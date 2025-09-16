import { Badge } from "@/components/ui/badge";

export function ShortcutsSettings() {
  const shortcuts = [
    { action: "New chat", keys: ["Ctrl", "N"] },
    { action: "Close chat", keys: ["Ctrl", "W"] },
    { action: "Close chat", keys: ["Ctrl", "F4"] },
    { action: "Close application", keys: ["Alt", "F4"] },
    { action: "New group", keys: ["Ctrl", "Shift", "N"] },
    { action: "Search", keys: ["Ctrl", "F"] },
    { action: "Search in chat", keys: ["Ctrl", "Shift", "F"] },
    { action: "Profile", keys: ["Ctrl", "P"] },
    { action: "Mute chat", keys: ["Ctrl", "Shift", "M"] },
    { action: "Toggle read", keys: ["Ctrl", "Shift", "U"] },
    { action: "Emoji panel", keys: ["Ctrl", "Shift", "E"] },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Shortcuts</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Keyboard shortcuts</h2>
          
          <div className="bg-card rounded-lg border">
            <div className="divide-y">
              {shortcuts.map((shortcut, index) => (
                <div key={`${shortcut.action}-${index}`} className="p-4 flex items-center justify-between gap-4">
                  <span className="text-card-foreground flex-1 min-w-0">{shortcut.action}</span>
                  <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                    {shortcut.keys.map((key, keyIndex) => (
                      <div key={keyIndex} className="flex items-center">
                        <Badge 
                          variant="outline" 
                          className="bg-muted text-muted-foreground border-border font-mono text-xs px-2 py-1 whitespace-nowrap"
                        >
                          {key}
                        </Badge>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="mx-1 text-muted-foreground">+</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
