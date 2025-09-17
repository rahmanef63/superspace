"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { EditorOptions } from "@tiptap/core";
import type { Id } from "@convex/_generated/dataModel";

export interface TiptapCanvasProps {
  documentId: Id<"documents">;
  content: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  extensions?: EditorOptions["extensions"];
}

export function TiptapCanvas({
  content,
  onChange,
  editable = true,
  documentId,
  extensions,
}: TiptapCanvasProps) {
  const editor = useEditor({
    extensions: extensions ?? [StarterKit],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const html = editor.getHTML();
    if (content !== html) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto p-6">
      <EditorContent editor={editor} />
    </div>
  );
}
