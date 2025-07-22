'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Palette,
  Highlighter,
  Link,
  Copy,
  MessageSquare
} from 'lucide-react';

interface FloatingToolbarProps {
  onCommand: (command: string, value?: string) => void;
  onAddComment?: (text: string) => void;
}

const QUICK_COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'
];

export default function FloatingToolbar({ onCommand, onAddComment }: FloatingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(selection.toString());
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 60
        });
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setShowColorPicker(false);
        setShowCommentDialog(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        const selection = window.getSelection();
        if (!selection || !selection.toString().trim()) {
          setIsVisible(false);
          setShowColorPicker(false);
          setShowCommentDialog(false);
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCommand = (command: string, value?: string) => {
    onCommand(command, value);
    // Keep selection for multiple operations
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        // Selection still exists, keep toolbar visible
      } else {
        setIsVisible(false);
      }
    }, 100);
  };

  const handleAddComment = () => {
    if (comment.trim() && onAddComment) {
      onAddComment(comment.trim());
      setComment('');
      setShowCommentDialog(false);
      setIsVisible(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedText);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-white dark:bg-slate-800 border rounded-lg shadow-lg p-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Main Toolbar */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('underline')}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('strikeThrough')}
          className="h-8 w-8 p-0"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="h-8 w-8 p-0"
        >
          <Palette className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('backColor', '#FFFF00')}
          className="h-8 w-8 p-0"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) {
              handleCommand('createLink', url);
            }
          }}
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-8 w-8 p-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
        
        {onAddComment && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommentDialog(!showCommentDialog)}
            className="h-8 w-8 p-0"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Color Picker */}
      {showColorPicker && (
        <div className="mt-2 p-2 border-t">
          <div className="flex space-x-1 mb-2">
            {QUICK_COLORS.map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => {
                  handleCommand('foreColor', color);
                  setShowColorPicker(false);
                }}
              />
            ))}
          </div>
          <input
            type="color"
            onChange={(e) => {
              handleCommand('foreColor', e.target.value);
              setShowColorPicker(false);
            }}
            className="w-full h-8 border rounded"
          />
        </div>
      )}

      {/* Comment Dialog */}
      {showCommentDialog && (
        <div className="mt-2 p-2 border-t">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-2 py-1 border rounded text-sm mb-2"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddComment();
              } else if (e.key === 'Escape') {
                setShowCommentDialog(false);
              }
            }}
          />
          <div className="flex space-x-1">
            <Button size="sm" onClick={handleAddComment}>
              Add
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCommentDialog(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Selected Text Info */}
      <div className="text-xs text-muted-foreground mt-1 px-1">
        "{selectedText.substring(0, 30)}{selectedText.length > 30 ? '...' : ''}"
      </div>
    </div>
  );
}
