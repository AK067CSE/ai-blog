'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Undo,
  Redo,
  Save,
  Users,
  Eye
} from 'lucide-react';

interface RichTextEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  readOnly?: boolean;
}

export default function RichTextEditor({
  initialContent = '',
  onSave,
  readOnly = false
}: RichTextEditorProps) {

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: initialContent,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });



  const handleSave = () => {
    if (editor && onSave) {
      const content = editor.getHTML();
      onSave(content);
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white dark:bg-slate-900">
      {/* Toolbar */}
      <div className="border-b p-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-1 flex-wrap">
          {/* Text Formatting */}
          <div className="flex items-center space-x-1 border-r pr-2 mr-2">
            <Button
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={readOnly}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={readOnly}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('code') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={readOnly}
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex items-center space-x-1 border-r pr-2 mr-2">
            <Button
              variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              disabled={readOnly}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              disabled={readOnly}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              disabled={readOnly}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center space-x-1 border-r pr-2 mr-2">
            <Button
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={readOnly}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={readOnly}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              disabled={readOnly}
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          {/* History */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={readOnly || !editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={readOnly || !editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">


          {/* Save button */}
          {!readOnly && onSave && (
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}

          {/* Preview toggle */}
          {readOnly && (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </div>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px]">
        <EditorContent editor={editor} />
      </div>

      {/* Footer with word count and collaboration info */}
      <div className="border-t p-3 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>
            {editor.storage.characterCount?.characters() || 0} characters
          </span>
          <span>
            {editor.storage.characterCount?.words() || 0} words
          </span>
        </div>


      </div>
    </div>
  );
}
