import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
// Collaboration extensions are optional and require additional setup
import { useEffect } from 'react'
import { Id } from "@convex/_generated/dataModel"

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  documentId: Id<"documents">
}

export function TiptapEditor({ content, onChange, documentId }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      // Note: Collaboration extensions would need Y.js setup
      // Collaboration.configure({
      //   document: ydoc,
      // }),
      // CollaborationCursor.configure({
      //   provider: provider,
      //   user: {
      //     name: 'User',
      //     color: '#f783ac',
      //   },
      // }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto p-6">
      <EditorContent editor={editor} />
    </div>
  )
}
