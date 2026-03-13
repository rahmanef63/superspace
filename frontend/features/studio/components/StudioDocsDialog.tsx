/**
 * Studio Docs Dialog
 *
 * Opens a dialog showing the JSON Schema guide (studio-json-template.md).
 * Provides Copy and Download buttons so designers can use it as AI context.
 */
"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, Check, BookMarked } from "lucide-react";

interface StudioDocsDialogProps {
    open: boolean;
    onClose: () => void;
}

// Inline the docs content so it works without a fetch (static import)
const DOCS_URL = "/docs/studio-json-template.md";

export const StudioDocsDialog: React.FC<StudioDocsDialogProps> = ({ open, onClose }) => {
    const [content, setContent] = useState<string>("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!open) return;
        fetch(DOCS_URL)
            .then((r) => r.text())
            .then(setContent)
            .catch(() => {
                // Fallback: show a helpful message
                setContent(FALLBACK_CONTENT);
            });
    }, [open]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* ignore */
        }
    };

    const handleDownload = () => {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "studio-json-template.md";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col gap-0 p-0">
                <DialogHeader className="px-5 pt-5 pb-3 shrink-0 border-b">
                    <div className="flex items-center gap-2">
                        <BookMarked size={16} className="text-primary" />
                        <DialogTitle>Studio JSON Schema — Guide & Reference</DialogTitle>
                    </div>
                    <DialogDescription className="text-xs mt-1">
                        Use this as AI context when asking to build layouts in JSON format.
                        Copy the full document and paste it before your prompt.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <pre className="p-5 text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground/90">
                        {content || "Loading…"}
                    </pre>
                </ScrollArea>

                <div className="px-5 py-3 border-t shrink-0 flex items-center justify-end gap-2 bg-muted/30">
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
                        <Download size={13} />
                        Download .md
                    </Button>
                    <Button size="sm" className="gap-2" onClick={handleCopy}>
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? "Copied!" : "Copy All"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Shown if the static file can't be fetched (e.g. dev server not serving /docs/)
const FALLBACK_CONTENT = `# Studio JSON Schema

Place the file docs/studio-json-template.md in your public/ folder to load it here.

Basic schema structure:
{
  "version": "0.4",
  "root": ["node-id"],
  "nodes": {
    "node-id": {
      "type": "div",
      "props": { "display": "flex", "gap": "4" },
      "children": []
    }
  }
}
`;
