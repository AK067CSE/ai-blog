'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import FloatingToolbar from './FloatingToolbar';
import { compressImage, validateImageFile, formatFileSize } from '@/utils/imageUtils';
import MarkdownIt from 'markdown-it';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Video,
  Table,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Palette,
  Highlighter,
  Undo,
  Redo,
  Copy,
  Scissors,
  ClipboardPaste,
  MoreHorizontal,
  Smile,
  Hash
} from 'lucide-react';

interface AdvancedRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
  '#FF3366', '#FF9933', '#FFFF33', '#33FF33', '#3366FF', '#9933FF',
  '#FF6699', '#FFCC99', '#FFFF99', '#99FF99', '#99CCFF', '#CC99FF'
];

const HIGHLIGHT_COLORS = [
  '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FFA500', '#FF69B4',
  '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFB6C1', '#AFEEEE'
];

export default function AdvancedRichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing your content..." 
}: AdvancedRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showHighlightPalette, setShowHighlightPalette] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [comments, setComments] = useState<Array<{id: string, text: string, position: number}>>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>(['#000000', '#FF0000', '#00FF00', '#0000FF']);
  const [lastUsedColor, setLastUsedColor] = useState('#000000');
  const [formatStates, setFormatStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    insertUnorderedList: false,
    insertOrderedList: false
  });

  // Track if any alignment has been explicitly set
  const [hasExplicitAlignment, setHasExplicitAlignment] = useState(false);

  // Markdown preview state
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');

  const EMOJIS = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💡', '✨', '🎉', '🚀', '💯', '🎯', '⭐', '🌟'];

  // Initialize markdown parser
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  });

  // Convert HTML to markdown (basic conversion)
  const htmlToMarkdown = useCallback((html: string) => {
    let markdown = html
      // Headers
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      // Bold and italic
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      // Links
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      // Images
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
      // Lists
      .replace(/<ul[^>]*>/gi, '')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<ol[^>]*>/gi, '')
      .replace(/<\/ol>/gi, '\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      // Blockquotes
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
      // Code
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
      // Paragraphs
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      // Line breaks
      .replace(/<br[^>]*>/gi, '\n')
      // Remove remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Clean up extra whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    return markdown;
  }, []);

  // Toggle markdown preview
  const toggleMarkdownPreview = useCallback(() => {
    if (!showMarkdownPreview) {
      const markdown = htmlToMarkdown(content);
      setMarkdownContent(markdown);
    }
    setShowMarkdownPreview(!showMarkdownPreview);
  }, [showMarkdownPreview, content, htmlToMarkdown]);

  // Initialize editor content without interfering with cursor position
  useEffect(() => {
    if (editorRef.current) {
      // Set initial content only if editor is empty
      if (!editorRef.current.innerHTML || editorRef.current.innerHTML === '<br>') {
        editorRef.current.innerHTML = content || '';
      }
    }
  }, []);

  // Handle external content changes (but not during user typing)
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content]);

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setSavedSelection(range.cloneRange());
      return range.cloneRange();
    }
    return null;
  }, []);

  const restoreSelection = useCallback((range?: Range | null) => {
    const selection = window.getSelection();
    if (selection && (range || savedSelection)) {
      selection.removeAllRanges();
      selection.addRange(range || savedSelection!);
    }
  }, [savedSelection]);

  const executeCommand = useCallback((command: string, value?: string) => {
    // Focus the editor first to ensure commands work
    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Restore selection if we have one saved
    if (savedSelection) {
      restoreSelection();
    }

    // Track if this is an alignment command
    const alignmentCommands = ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'];
    if (alignmentCommands.includes(command)) {
      setHasExplicitAlignment(true);
    }

    // Execute the command
    const success = document.execCommand(command, false, value);

    // Update content and trigger change
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateFormatStates();
    }

    return success;
  }, [onChange, savedSelection, restoreSelection]);

  const updateFormatStates = useCallback(() => {
    if (!editorRef.current) return;

    const justifyLeftState = document.queryCommandState('justifyLeft');
    const justifyCenterState = document.queryCommandState('justifyCenter');
    const justifyRightState = document.queryCommandState('justifyRight');
    const justifyFullState = document.queryCommandState('justifyFull');

    // Only show left align as active if it was explicitly set (not just browser default)
    // If any other alignment is active, or if we've explicitly set alignment before, then show states
    const hasAnyAlignment = justifyCenterState || justifyRightState || justifyFullState;

    setFormatStates({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      justifyLeft: hasExplicitAlignment && justifyLeftState && !hasAnyAlignment,
      justifyCenter: justifyCenterState,
      justifyRight: justifyRightState,
      justifyFull: justifyFullState,
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList')
    });
  }, [hasExplicitAlignment]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
      // Save the selection for later use
      saveSelection();
    } else {
      setSelectedText('');
      setSavedSelection(null);
    }
    // Update format states when selection changes
    updateFormatStates();
  }, [updateFormatStates, saveSelection]);

  const insertImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate the image file
        const validation = validateImageFile(file);
        if (!validation.valid) {
          alert(`Image upload failed: ${validation.error}`);
          return;
        }

        // Generate unique loading ID outside try block
        const loadingId = `loading-${Date.now()}`;

        try {
          // Show loading state with unique identifier
          const loadingImg = `<div id="${loadingId}" style="padding: 20px; text-align: center; border: 2px dashed #ccc; margin: 10px 0; background: #f8f9fa;">
            <p style="margin: 0 0 10px 0; color: #6c757d;">Uploading and compressing image...</p>
            <div style="width: 100%; height: 4px; background: #e9ecef; border-radius: 2px; overflow: hidden;">
              <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #007bff, #0056b3); animation: loading 2s infinite;"></div>
            </div>
          </div>`;
          executeCommand('insertHTML', loadingImg);

          // Compress the image
          const compressedImage = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 800,
            quality: 0.8,
            format: 'jpeg'
          });

          // Calculate compression ratio
          const originalSize = file.size;
          const compressedSize = Math.round((compressedImage.length * 3) / 4); // Approximate base64 size
          const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);

          // Replace loading with actual image using DOM manipulation
          const img = `<figure style="margin: 20px 0; text-align: center;">
            <img src="${compressedImage}" alt="Uploaded image" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s ease;" />
            <figcaption style="font-size: 12px; color: #6c757d; margin-top: 8px; font-style: italic;">
              Original: ${formatFileSize(originalSize)} → Compressed: ${formatFileSize(compressedSize)} (${compressionRatio}% reduction)
            </figcaption>
          </figure>`;

          // Remove loading and insert compressed image using DOM manipulation
          if (editorRef.current) {
            const loadingElement = editorRef.current.querySelector(`#${loadingId}`);
            if (loadingElement) {
              loadingElement.outerHTML = img;
              onChange(editorRef.current.innerHTML);
            }
          }

        } catch (error) {
          console.error('Image compression failed:', error);
          alert('Failed to process image. Please try a different image.');

          // Remove loading indicator using DOM manipulation
          if (editorRef.current) {
            const loadingElement = editorRef.current.querySelector(`#${loadingId}`);
            if (loadingElement) {
              loadingElement.remove();
              onChange(editorRef.current.innerHTML);
            }
          }
        }
      }
    };
    input.click();
  }, [executeCommand, onChange]);

  const insertLink = useCallback(() => {
    if (linkUrl && selectedText) {
      const link = `<a href="${linkUrl}" target="_blank" style="color: #0066cc; text-decoration: underline;">${selectedText}</a>`;
      executeCommand('insertHTML', link);
      setShowLinkDialog(false);
      setLinkUrl('');
      setSelectedText('');
    }
  }, [linkUrl, selectedText, executeCommand]);

  const insertTable = useCallback(() => {
    const table = `
      <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 3</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 4</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 5</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 6</td>
        </tr>
      </table>
    `;
    executeCommand('insertHTML', table);
  }, [executeCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          executeCommand('undo');
          break;
        case 'y':
          e.preventDefault();
          executeCommand('redo');
          break;
      }
    }
  }, [executeCommand]);

  const handleAddComment = useCallback((commentText: string) => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const newComment = {
        id: Date.now().toString(),
        text: commentText,
        position: selection.anchorOffset
      };
      setComments(prev => [...prev, newComment]);

      // Highlight the commented text
      const span = `<span style="background-color: #fff3cd; border-bottom: 2px solid #ffc107;" title="${commentText}">${selection.toString()}</span>`;
      executeCommand('insertHTML', span);
    }
  }, [executeCommand]);

  return (
    <div className="relative">
      <FloatingToolbar
        onCommand={executeCommand}
        onAddComment={handleAddComment}
      />

      <div className="border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-purple-50 dark:bg-purple-100 overflow-hidden shadow-xl">
      {/* Toolbar */}
      <div className="border-b-2 border-purple-200 dark:border-purple-300 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100">
        {/* Selection Indicator */}
        {selectedText && (
          <div className="mb-2 px-3 py-2 bg-blue-200 dark:bg-blue-200 rounded-lg text-sm font-bold text-blue-900 dark:text-blue-900 shadow-md">
            Selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1">
          {/* Font Controls */}
          <div className="flex items-center border-r pr-2 mr-2">
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                executeCommand('fontName', e.target.value);
              }}
              className="text-sm px-3 py-2 border-2 border-purple-300 rounded-lg bg-white dark:bg-purple-50 font-bold text-purple-900 dark:text-purple-900 shadow-md hover:shadow-lg transition-all"
            >
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier</option>
            </select>
            <select
              value={fontSize}
              onChange={(e) => {
                setFontSize(e.target.value);
                executeCommand('fontSize', e.target.value);
                updateFormatStates();
              }}
              className="text-sm px-3 py-2 border-2 border-purple-300 rounded-lg bg-white dark:bg-purple-50 ml-2 font-bold text-purple-900 dark:text-purple-900 shadow-md hover:shadow-lg transition-all"
              title="Font Size"
            >
              <option value="1">8pt</option>
              <option value="2">10pt</option>
              <option value="3">12pt</option>
              <option value="4">14pt</option>
              <option value="5">18pt</option>
              <option value="6">24pt</option>
              <option value="7">36pt</option>
            </select>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center border-r pr-2 mr-2">
            <Button
              variant={formatStates.bold ? "default" : "ghost"}
              size="sm"
              onClick={() => executeCommand('bold')}
              className={`h-10 w-10 p-0 transition-all shadow-lg hover:shadow-xl ${formatStates.bold ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-300' : 'bg-purple-200 dark:bg-purple-200 hover:bg-purple-300 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900'}`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-5 w-5" />
            </Button>
            <Button
              variant={formatStates.italic ? "default" : "ghost"}
              size="sm"
              onClick={() => executeCommand('italic')}
              className={`h-10 w-10 p-0 transition-all shadow-lg hover:shadow-xl ${formatStates.italic ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-300' : 'bg-purple-200 dark:bg-purple-200 hover:bg-purple-300 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900'}`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-5 w-5" />
            </Button>
            <Button
              variant={formatStates.underline ? "default" : "ghost"}
              size="sm"
              onClick={() => executeCommand('underline')}
              className={`h-10 w-10 p-0 transition-all shadow-lg hover:shadow-xl ${formatStates.underline ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-300' : 'bg-purple-200 dark:bg-purple-200 hover:bg-purple-300 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900'}`}
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-5 w-5" />
            </Button>
            <Button
              variant={formatStates.strikeThrough ? "default" : "ghost"}
              size="sm"
              onClick={() => executeCommand('strikeThrough')}
              className={`h-10 w-10 p-0 transition-all shadow-lg hover:shadow-xl ${formatStates.strikeThrough ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-300' : 'bg-purple-200 dark:bg-purple-200 hover:bg-purple-300 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900'}`}
              title="Strikethrough"
            >
              <Strikethrough className="h-5 w-5" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex items-center border-r pr-2 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('formatBlock', 'h1')}
              className="h-10 w-10 p-0 bg-blue-200 dark:bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-300 text-blue-900 dark:text-blue-900 shadow-lg hover:shadow-xl transition-all"
            >
              <Heading1 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('formatBlock', 'h2')}
              className="h-10 w-10 p-0 bg-blue-200 dark:bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-300 text-blue-900 dark:text-blue-900 shadow-lg hover:shadow-xl transition-all"
            >
              <Heading2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('formatBlock', 'h3')}
              className="h-10 w-10 p-0 bg-blue-200 dark:bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-300 text-blue-900 dark:text-blue-900 shadow-lg hover:shadow-xl transition-all"
            >
              <Heading3 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('formatBlock', 'p')}
              className="h-10 w-10 p-0 bg-blue-200 dark:bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-300 text-blue-900 dark:text-blue-900 shadow-lg hover:shadow-xl transition-all"
            >
              <Type className="h-5 w-5" />
            </Button>
          </div>

          {/* Colors */}
          <div className="flex items-center border-r pr-2 mr-2 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Save current selection before opening palette
                saveSelection();
                setShowColorPalette(!showColorPalette);
              }}
              className="h-10 w-10 p-0 bg-pink-200 dark:bg-pink-200 hover:bg-pink-300 dark:hover:bg-pink-300 text-pink-900 dark:text-pink-900 shadow-lg hover:shadow-xl transition-all"
              title="Text Color"
            >
              <Palette className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Save current selection before opening palette
                saveSelection();
                setShowHighlightPalette(!showHighlightPalette);
              }}
              className="h-10 w-10 p-0 bg-pink-200 dark:bg-pink-200 hover:bg-pink-300 dark:hover:bg-pink-300 text-pink-900 dark:text-pink-900 shadow-lg hover:shadow-xl transition-all"
              title="Highlight Color"
            >
              <Highlighter className="h-5 w-5" />
            </Button>
            
            {/* Color Palette */}
            {showColorPalette && (
              <div className="absolute top-12 left-0 z-50 bg-purple-50 dark:bg-purple-100 border-2 border-purple-300 dark:border-purple-400 rounded-lg p-4 shadow-2xl min-w-[220px]">
                {/* Recent Colors */}
                <div className="mb-3">
                  <div className="text-xs font-medium mb-1 text-muted-foreground">Recent</div>
                  <div className="flex gap-1">
                    {recentColors.map((color, index) => (
                      <button
                        key={index}
                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-all hover:shadow-md"
                        style={{ backgroundColor: color }}
                        onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
                        onClick={() => {
                          // Restore selection and apply color
                          if (savedSelection) {
                            restoreSelection();
                            executeCommand('foreColor', color);
                            setLastUsedColor(color);
                          }
                          setShowColorPalette(false);
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Color Grid */}
                <div className="mb-3">
                  <div className="text-xs font-medium mb-1 text-muted-foreground">Colors</div>
                  <div className="grid grid-cols-6 gap-1">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-all hover:shadow-md"
                        style={{ backgroundColor: color }}
                        onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
                        onClick={() => {
                          // Restore selection and apply color
                          if (savedSelection) {
                            restoreSelection();
                            executeCommand('foreColor', color);
                            setLastUsedColor(color);
                            // Add to recent colors
                            setRecentColors(prev => {
                              const newRecent = [color, ...prev.filter(c => c !== color)].slice(0, 8);
                              return newRecent;
                            });
                          }
                          setShowColorPalette(false);
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Color */}
                <div className="mb-2">
                  <div className="text-xs font-medium mb-1 text-muted-foreground">Custom</div>
                  <input
                    type="color"
                    onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
                    onChange={(e) => {
                      // Restore selection and apply color
                      if (savedSelection) {
                        restoreSelection();
                        executeCommand('foreColor', e.target.value);
                        setRecentColors(prev => {
                          const newRecent = [e.target.value, ...prev.filter(c => c !== e.target.value)].slice(0, 8);
                          return newRecent;
                        });
                      }
                      setShowColorPalette(false);
                    }}
                    className="w-full h-8 border rounded cursor-pointer"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowColorPalette(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            )}

            {/* Highlight Palette */}
            {showHighlightPalette && (
              <div className="absolute top-10 left-10 z-50 bg-white dark:bg-slate-800 border rounded-lg p-3 shadow-xl">
                <div className="mb-2">
                  <div className="text-xs font-medium mb-1 text-muted-foreground">Highlight Colors</div>
                  <div className="grid grid-cols-4 gap-1">
                    {HIGHLIGHT_COLORS.map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-all hover:shadow-md"
                        style={{ backgroundColor: color }}
                        onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
                        onClick={() => {
                          // Restore selection and apply highlight
                          if (savedSelection) {
                            restoreSelection();
                            executeCommand('backColor', color);
                          }
                          setShowHighlightPalette(false);
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHighlightPalette(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            )}
          </div>

          {/* Alignment */}
          <div className="flex items-center border-r pr-2 mr-2">
            <Button
              variant={formatStates.justifyLeft ? "default" : "ghost"}
              size="sm"
              onClick={() => executeCommand('justifyLeft')}
              className={`h-10 w-10 p-0 transition-all shadow-lg hover:shadow-xl ${formatStates.justifyLeft ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-300' : 'bg-green-200 dark:bg-green-200 hover:bg-green-300 dark:hover:bg-green-300 text-green-900 dark:text-green-900'}`}
              title="Align Left"
            >
              <AlignLeft className="h-5 w-5" />
            </Button>
            <Button
              variant={formatStates.justifyCenter ? "default" : "ghost"}
              size="sm"
              onClick={() => executeCommand('justifyCenter')}
              className={`h-10 w-10 p-0 transition-all shadow-lg hover:shadow-xl ${formatStates.justifyCenter ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-300' : 'bg-green-200 dark:bg-green-200 hover:bg-green-300 dark:hover:bg-green-300 text-green-900 dark:text-green-900'}`}
              title="Align Center"
            >
              <AlignCenter className="h-5 w-5" />
            </Button>
            <Button
              variant={formatStates.justifyRight ? "default" : "ghost"}
              size="sm"
              onClick={() => executeCommand('justifyRight')}
              className={`h-10 w-10 p-0 transition-all shadow-lg hover:shadow-xl ${formatStates.justifyRight ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-300' : 'bg-green-200 dark:bg-green-200 hover:bg-green-300 dark:hover:bg-green-300 text-green-900 dark:text-green-900'}`}
              title="Align Right"
            >
              <AlignRight className="h-5 w-5" />
            </Button>
            <Button
              variant={formatStates.justifyFull ? "default" : "ghost"}
              size="sm"
              onClick={() => executeCommand('justifyFull')}
              className={`h-10 w-10 p-0 transition-all shadow-lg hover:shadow-xl ${formatStates.justifyFull ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-300' : 'bg-green-200 dark:bg-green-200 hover:bg-green-300 dark:hover:bg-green-300 text-green-900 dark:text-green-900'}`}
              title="Justify"
            >
              <AlignJustify className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Second Toolbar Row */}
      <div className="border-b-2 border-purple-200 dark:border-purple-300 p-3 bg-gradient-to-r from-pink-100 to-violet-100 dark:from-pink-100 dark:to-violet-100">
        <div className="flex flex-wrap items-center gap-1">
          {/* Lists */}
          <div className="flex items-center border-r pr-2 mr-2">
            <Button
              variant={formatStates.insertUnorderedList ? "default" : "ghost"}
              size="sm"
              onClick={() => executeCommand('insertUnorderedList')}
              className={`h-10 w-10 p-0 transition-all shadow-lg hover:shadow-xl ${formatStates.insertUnorderedList ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-orange-300' : 'bg-orange-200 dark:bg-orange-200 hover:bg-orange-300 dark:hover:bg-orange-300 text-orange-900 dark:text-orange-900'}`}
              title="Bullet List"
            >
              <List className="h-5 w-5" />
            </Button>
            <Button
              variant={formatStates.insertOrderedList ? "default" : "ghost"}
              size="sm"
              onClick={() => executeCommand('insertOrderedList')}
              className={`h-10 w-10 p-0 transition-all shadow-lg hover:shadow-xl ${formatStates.insertOrderedList ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-orange-300' : 'bg-orange-200 dark:bg-orange-200 hover:bg-orange-300 dark:hover:bg-orange-300 text-orange-900 dark:text-orange-900'}`}
              title="Numbered List"
            >
              <ListOrdered className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('formatBlock', 'blockquote')}
              className="h-10 w-10 p-0 bg-orange-200 dark:bg-orange-200 hover:bg-orange-300 dark:hover:bg-orange-300 text-orange-900 dark:text-orange-900 shadow-lg hover:shadow-xl transition-all"
            >
              <Quote className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('formatBlock', 'pre')}
              className="h-10 w-10 p-0 bg-orange-200 dark:bg-orange-200 hover:bg-orange-300 dark:hover:bg-orange-300 text-orange-900 dark:text-orange-900 shadow-lg hover:shadow-xl transition-all"
            >
              <Code className="h-5 w-5" />
            </Button>
          </div>

          {/* Media & Links */}
          <div className="flex items-center border-r pr-2 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const selection = window.getSelection();
                if (selection && selection.toString()) {
                  setSelectedText(selection.toString());
                  setShowLinkDialog(true);
                } else {
                  alert('Please select text first to create a link');
                }
              }}
              className="h-10 w-10 p-0 bg-cyan-200 dark:bg-cyan-200 hover:bg-cyan-300 dark:hover:bg-cyan-300 text-cyan-900 dark:text-cyan-900 shadow-lg hover:shadow-xl transition-all"
            >
              <Link className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={insertImage}
              className="h-10 w-10 p-0 bg-cyan-200 dark:bg-cyan-200 hover:bg-cyan-300 dark:hover:bg-cyan-300 text-cyan-900 dark:text-cyan-900 shadow-lg hover:shadow-xl transition-all"
            >
              <Image className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={insertTable}
              className="h-10 w-10 p-0 bg-cyan-200 dark:bg-cyan-200 hover:bg-cyan-300 dark:hover:bg-cyan-300 text-cyan-900 dark:text-cyan-900 shadow-lg hover:shadow-xl transition-all"
            >
              <Table className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="h-10 w-10 p-0 bg-cyan-200 dark:bg-cyan-200 hover:bg-cyan-300 dark:hover:bg-cyan-300 text-cyan-900 dark:text-cyan-900 shadow-lg hover:shadow-xl transition-all"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>

          {/* Markdown Preview Toggle */}
          <div className="flex items-center">
            <Button
              variant={showMarkdownPreview ? "default" : "ghost"}
              size="sm"
              onClick={toggleMarkdownPreview}
              className={`h-10 px-4 transition-all shadow-lg hover:shadow-xl ${showMarkdownPreview ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-300' : 'bg-indigo-200 dark:bg-indigo-200 hover:bg-indigo-300 dark:hover:bg-indigo-300 text-indigo-900 dark:text-indigo-900'}`}
              title="Toggle Markdown Preview"
            >
              <Hash className="h-5 w-5 mr-2" />
              {showMarkdownPreview ? 'Edit' : 'Preview'}
            </Button>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute top-16 right-0 z-50 bg-yellow-50 dark:bg-yellow-100 border-2 border-yellow-300 dark:border-yellow-400 rounded-lg p-4 shadow-2xl">
              <div className="grid grid-cols-8 gap-2 mb-3">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    className="w-10 h-10 text-xl hover:bg-yellow-200 dark:hover:bg-yellow-200 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-110"
                    onClick={() => {
                      executeCommand('insertHTML', emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmojiPicker(false)}
                className="w-full bg-yellow-200 dark:bg-yellow-200 hover:bg-yellow-300 dark:hover:bg-yellow-300 text-yellow-900 dark:text-yellow-900 font-bold border-yellow-400 dark:border-yellow-500"
              >
                Close
              </Button>
            </div>
          )}

          {/* Undo/Redo */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('undo')}
              className="h-10 w-10 p-0 bg-indigo-200 dark:bg-indigo-200 hover:bg-indigo-300 dark:hover:bg-indigo-300 text-indigo-900 dark:text-indigo-900 shadow-lg hover:shadow-xl transition-all"
            >
              <Undo className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('redo')}
              className="h-10 w-10 p-0 bg-indigo-200 dark:bg-indigo-200 hover:bg-indigo-300 dark:hover:bg-indigo-300 text-indigo-900 dark:text-indigo-900 shadow-lg hover:shadow-xl transition-all ml-1"
            >
              <Redo className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="border-b-2 border-blue-300 dark:border-blue-400 p-4 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-100 dark:to-cyan-100">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold text-blue-900 dark:text-blue-900">Link URL:</span>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-3 py-2 border-2 border-blue-300 dark:border-blue-400 rounded-lg text-sm font-semibold text-blue-900 dark:text-blue-900 bg-white dark:bg-blue-50 shadow-md focus:shadow-lg transition-all"
              autoFocus
            />
            <Button
              size="sm"
              onClick={insertLink}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Add Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowLinkDialog(false);
                setLinkUrl('');
                setSelectedText('');
              }}
              className="bg-blue-200 dark:bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-300 text-blue-900 dark:text-blue-900 font-bold border-blue-400 dark:border-blue-500"
            >
              Cancel
            </Button>
          </div>
          <div className="text-sm font-bold text-blue-800 dark:text-blue-900 mt-2">
            Selected text: "{selectedText}"
          </div>
        </div>
      )}

      {/* Editor Content or Markdown Preview */}
      {showMarkdownPreview ? (
        <div className="min-h-[500px] p-8 bg-white dark:bg-purple-50 blog-content">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Markdown Preview</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(markdownContent);
                alert('Markdown copied to clipboard!');
              }}
              className="text-xs"
            >
              Copy Markdown
            </Button>
          </div>
          <div className="prose prose-lg max-w-none">
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border text-sm font-mono overflow-auto max-h-96">
              {markdownContent}
            </pre>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-700 mb-3">Rendered Preview:</h4>
            <div
              className="prose prose-lg max-w-none blog-content"
              dangerouslySetInnerHTML={{ __html: md.render(markdownContent) }}
            />
          </div>
        </div>
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            const newContent = (e.target as HTMLDivElement).innerHTML;
            onChange(newContent);
            updateFormatStates();
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={updateFormatStates}
          onMouseUp={() => {
            handleTextSelection();
            updateFormatStates();
          }}
          onClick={updateFormatStates}
          onFocus={updateFormatStates}
          className="min-h-[500px] p-8 focus:outline-none prose prose-lg max-w-none transition-all duration-200 hover:shadow-inner bg-white dark:bg-purple-50 text-gray-800 dark:text-gray-800 blog-content"
          style={{
            lineHeight: '1.8',
            fontSize: '18px',
            border: 'none',
            outline: 'none',
            fontWeight: '400',
            fontFamily: 'Georgia, "Times New Roman", serif'
          }}
          data-placeholder={placeholder}
        />
      )}

      {/* Status Bar */}
      <div className="border-t-2 border-purple-200 dark:border-purple-300 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100 text-sm font-bold text-purple-900 dark:text-purple-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="font-black">Words: {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length}</span>
            <span className="font-black">Characters: {content.replace(/<[^>]*>/g, '').length}</span>
            <span className="font-black">Characters (with spaces): {content.replace(/<[^>]*>/g, '').length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-black text-green-700 dark:text-green-800">Ready ✨</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
