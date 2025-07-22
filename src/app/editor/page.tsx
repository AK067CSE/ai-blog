'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdvancedRichTextEditor from '@/components/editor/AdvancedRichTextEditor';
import { validateContentSize, optimizeContent, formatContentSize } from '@/utils/contentUtils';
import AIWritingAssistant from '@/components/ai/AIWritingAssistant';
import SEOAnalyzer from '@/components/seo/SEOAnalyzer';
import PlagiarismChecker from '@/components/plagiarism/PlagiarismChecker';
import {
  Save,
  Eye,
  Share2,
  ArrowLeft,
  Sparkles,
  Users,
  Clock,
  Tag,
  FileText,
  X,
  Send,
  BarChart3,
  Shield
} from 'lucide-react';

export default function EditorPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [showAI, setShowAI] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [showPlagiarism, setShowPlagiarism] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPublishFlow, setIsPublishFlow] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Load existing post or draft content
  useEffect(() => {
    const loadPost = async () => {
      const editId = searchParams.get('id');

      if (editId) {
        // Loading existing post for editing
        setIsLoading(true);
        setPostId(editId);

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/posts/${editId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await response.json();

          if (data.success) {
            const post = data.data;
            setTitle(post.title);
            setContent(post.content);
            setTags(post.tags.join(', '));
            setStatus(post.status);
            setLastSaved(new Date(post.updatedAt));
          } else {
            alert('Failed to load post: ' + data.message);
            router.push('/posts');
          }
        } catch (error) {
          console.error('Error loading post:', error);
          alert('Failed to load post');
          router.push('/posts');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Load draft content from localStorage if available (for new posts)
        const draftContent = localStorage.getItem('draftContent');
        if (draftContent) {
          setContent(draftContent);
          localStorage.removeItem('draftContent'); // Clear after loading
        }
      }
    };

    loadPost();
  }, [searchParams, router]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (title || content) {
        handleSave(true); // Auto-save
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [title, content]);

  const handleSave = async (isAutoSave = false) => {
    // Validate required fields
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle && !trimmedContent) {
      if (!isAutoSave) {
        alert('Please add a title or content before saving');
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if not authenticated
      alert('Please login to save your post');
      router.push('/auth/login');
      return;
    }

    setIsSaving(true);

    try {
      // Validate and optimize content
      const contentValidation = validateContentSize(trimmedContent);

      if (!contentValidation.valid) {
        alert(`Content is too large (${formatContentSize(contentValidation.size)}). Please reduce content size or compress images.`);
        return;
      }

      // Show warnings for large content
      if (contentValidation.recommendations.length > 0) {
        const proceed = confirm(
          `Content size: ${formatContentSize(contentValidation.size)}\n\n` +
          'Recommendations:\n' +
          contentValidation.recommendations.join('\n') +
          '\n\nDo you want to continue saving?'
        );
        if (!proceed) return;
      }

      // Optimize content for transmission
      const optimization = optimizeContent(trimmedContent);
      const optimizedContent = optimization.optimizedSize < optimization.originalSize
        ? optimization.optimized
        : trimmedContent;

      // Prepare the post data - always save as draft unless explicitly publishing
      const postData = {
        title: trimmedTitle || 'Untitled Post',
        content: optimizedContent || 'No content yet...',
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        status: 'draft', // Always save as draft
        excerpt: trimmedContent ? (trimmedContent.replace(/<[^>]*>/g, '').substring(0, 200) + (trimmedContent.length > 200 ? '...' : '')) : 'No content yet...'
      };

      console.log('Saving post data:', {
        ...postData,
        content: postData.content.substring(0, 100) + '...',
        originalSize: formatContentSize(optimization.originalSize),
        optimizedSize: formatContentSize(optimization.optimizedSize),
        savings: optimization.savings + '%'
      }); // Debug log

      // Determine if this is an update or create
      const isUpdate = postId !== null;
      const url = isUpdate ? `/api/posts/${postId}` : '/api/posts';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      const data = await response.json();

      if (data.success) {
        setLastSaved(new Date());
        setStatus('draft'); // Ensure status is set to draft

        // Set postId for new posts so subsequent saves are updates
        if (!isUpdate && data.data && data.data._id) {
          setPostId(data.data._id);
        }

        if (!isAutoSave) {
          // Show success message with publish option
          const publishNow = confirm(
            '✅ Post saved successfully as draft!\n\n' +
            'Would you like to publish it now to make it visible to readers?'
          );

          if (publishNow) {
            // Set publish flow to avoid double confirmation
            setIsPublishFlow(true);
            await handlePublish();
            return; // handlePublish will handle the redirect
          } else {
            // Just redirect to posts page
            router.push('/posts');
          }
        }
      } else {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          alert('Session expired. Please login again.');
          router.push('/auth/login');
        } else {
          alert('Save failed: ' + data.message);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please add a title and content before publishing');
      return;
    }

    // Confirmation dialog (skip if coming from save flow)
    if (!isPublishFlow) {
      const confirmPublish = confirm(
        `Are you sure you want to publish "${title.trim() || 'Untitled Post'}"?\n\n` +
        'Once published, your post will be visible to all readers.'
      );

      if (!confirmPublish) {
        return;
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to publish your post');
      router.push('/auth/login');
      return;
    }

    setIsSaving(true);

    try {
      // Validate and optimize content for publishing
      const contentValidation = validateContentSize(content.trim());

      if (!contentValidation.valid) {
        alert(`Content is too large (${formatContentSize(contentValidation.size)}) for publishing. Please reduce content size.`);
        return;
      }

      // Optimize content
      const optimization = optimizeContent(content.trim());
      const optimizedContent = optimization.optimizedSize < optimization.originalSize
        ? optimization.optimized
        : content.trim();

      const postData = {
        title: title.trim(),
        content: optimizedContent,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        status: 'published',
        excerpt: content.trim().replace(/<[^>]*>/g, '').substring(0, 200) + (content.trim().length > 200 ? '...' : '')
      };

      // Determine if this is an update or create for publishing
      const isUpdate = postId !== null;
      const url = isUpdate ? `/api/posts/${postId}` : '/api/posts';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      const data = await response.json();

      if (data.success) {
        setStatus('published');
        setLastSaved(new Date());

        // Show success message with options
        const viewPost = confirm(
          '🎉 Post published successfully!\n\n' +
          'Your post is now live and visible to readers.\n\n' +
          'Would you like to view your published post?'
        );

        if (viewPost && data.data && data.data.slug) {
          router.push(`/posts/${data.data.slug}`);
        } else {
          router.push('/posts');
        }
      } else {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          alert('Session expired. Please login again.');
          router.push('/auth/login');
        } else {
          alert('Publish failed: ' + data.message);
        }
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setIsSaving(false);
      setIsPublishFlow(false); // Reset publish flow state
    }
  };

  const handleContentGenerated = (generatedContent: string) => {
    setContent(prev => prev + '\n\n' + generatedContent);
  };

  const handleSEOSuggestions = (suggestions: any) => {
    console.log('SEO suggestions received:', suggestions);
    // You could show these in a modal or sidebar
  };

  const addSampleContent = () => {
    setTitle('My First BlogCraft AI Post');
    setContent('This is a sample blog post created with BlogCraft AI. \n\nYou can edit this content and save it to test the functionality. \n\n## Features\n- AI-powered writing assistance\n- Rich text editing\n- Auto-save functionality\n- SEO optimization');
    setTags('blogging, ai, writing');
  };

  // Show loading state when loading existing post
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-violet-100 dark:from-purple-200 dark:via-pink-100 dark:to-violet-200 flex items-center justify-center">
        <div className="text-center border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-white dark:bg-purple-50 overflow-hidden shadow-xl p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700 dark:text-purple-700 font-semibold">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-violet-100 dark:from-purple-200 dark:via-pink-100 dark:to-violet-200">
      {/* Enhanced Modern Editor with Beautiful Card Layout */}

      {/* Main Canvas Container - Centered Content Box */}
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          {/* Main Editor Card - The Content Box */}
          <div className="bg-white dark:bg-purple-50 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-300 dark:border-purple-400 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:scale-[1.01]">
            
            {/* Card Header Row */}
            <div className="flex items-center justify-between p-6 border-b border-purple-200 dark:border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100">
              {/* Left side - Back button and status */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="hover:bg-purple-200 dark:hover:bg-purple-200 transition-colors text-purple-800 dark:text-purple-800 font-bold"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full shadow-sm ${
                      status === 'published' ? 'bg-green-600 shadow-green-300 animate-pulse' :
                      status === 'draft' ? 'bg-amber-600 shadow-amber-300' : 'bg-purple-600 shadow-purple-300'
                    }`}></div>
                    <span className={`text-sm font-black capitalize ${
                      status === 'published' ? 'text-green-700 dark:text-green-700' :
                      status === 'draft' ? 'text-amber-700 dark:text-amber-700' : 'text-purple-800 dark:text-purple-800'
                    }`}>
                      {status}
                      {status === 'published' && ' ✨'}
                    </span>
                  </div>

                  {postId && (
                    <span className="text-xs bg-blue-200 dark:bg-blue-200 text-blue-900 dark:text-blue-900 px-2 py-1 rounded-full font-bold">
                      Editing
                    </span>
                  )}
                </div>
              </div>

              {/* Right side - Word count and status */}
              <div className="flex items-center space-x-6 text-sm text-purple-700 dark:text-purple-700 font-bold">
                <div className="flex items-center space-x-2">
                  <span className="font-black">{content.split(/\s+/).filter(Boolean).length}</span>
                  <span className="font-bold">words</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-black">{content.length}</span>
                  <span className="font-bold">chars</span>
                </div>
                {lastSaved && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-bold">Saved {lastSaved.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Tags Section */}
            <div className="p-8 space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100 rounded-2xl p-6 border border-purple-300 dark:border-purple-400 transition-all duration-300 hover:shadow-lg hover:border-purple-400 dark:hover:border-purple-500">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your blog post title..."
                    className="text-3xl font-black border-none shadow-none px-0 py-3 placeholder:text-purple-500 dark:placeholder:text-purple-600 focus-visible:ring-0 bg-transparent text-purple-900 dark:text-purple-900"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div className="bg-gradient-to-r from-pink-100 to-violet-100 dark:from-pink-100 dark:to-violet-100 rounded-2xl p-4 border border-pink-300 dark:border-pink-400 transition-all duration-300 hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-500">
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-pink-700 dark:text-pink-800 flex-shrink-0" />
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Add tags (comma separated)..."
                    className="border-none shadow-none px-0 placeholder:text-pink-500 dark:placeholder:text-pink-600 focus-visible:ring-0 bg-transparent text-pink-900 dark:text-pink-900 font-bold"
                  />
                  {tags && (
                    <div className="flex flex-wrap gap-2">
                      {tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-pink-200 dark:bg-pink-200 text-pink-800 dark:text-pink-900 rounded-full text-sm font-black"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-6 py-6 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-100 dark:to-purple-100 border-y border-violet-300 dark:border-violet-400 gap-4">
                {/* Left side actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAI(!showAI)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 font-black"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Assistant
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSEO(!showSEO)}
                    className="hover:bg-orange-200 dark:hover:bg-orange-200 border-orange-400 dark:border-orange-500 text-orange-800 dark:text-orange-900 transition-colors font-black bg-orange-100 dark:bg-orange-100"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    SEO Analysis
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPlagiarism(!showPlagiarism)}
                    className="hover:bg-red-200 dark:hover:bg-red-200 border-red-400 dark:border-red-500 text-red-800 dark:text-red-900 transition-colors font-black bg-red-100 dark:bg-red-100"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Plagiarism Check
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-200 border-blue-400 dark:border-blue-500 text-blue-800 dark:text-blue-900 transition-colors font-black bg-blue-100 dark:bg-blue-100"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Edit' : 'Preview'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addSampleContent}
                    className="hover:bg-green-200 dark:hover:bg-green-200 border-green-400 dark:border-green-500 text-green-800 dark:text-green-900 transition-colors font-black bg-green-100 dark:bg-green-100"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Add Sample
                  </Button>
                </div>

                {/* Right side actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-indigo-200 dark:hover:bg-indigo-200 border-indigo-400 dark:border-indigo-500 text-indigo-800 dark:text-indigo-900 transition-colors font-black bg-indigo-100 dark:bg-indigo-100"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave()}
                    disabled={isSaving}
                    className="hover:bg-teal-200 dark:hover:bg-teal-200 border-teal-400 dark:border-teal-500 text-teal-800 dark:text-teal-900 transition-colors font-black bg-teal-100 dark:bg-teal-100"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>

                  <Button
                    size="sm"
                    onClick={handlePublish}
                    disabled={!title.trim() || !content.trim() || isSaving}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 font-black relative overflow-hidden"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSaving && status !== 'published' ? 'Publishing...' : 'Publish'}
                    {status === 'published' && (
                      <span className="absolute inset-0 bg-green-500 opacity-20 animate-pulse"></span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Content Editor */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-50 dark:to-pink-50 rounded-2xl border border-purple-300 dark:border-purple-400 shadow-inner min-h-[500px] overflow-hidden mx-6 mb-6 transition-all duration-300 hover:shadow-lg">
                {showPreview ? (
                  <div className="p-8">
                    <h1 className="text-4xl font-black mb-8 text-purple-900 dark:text-purple-900 leading-tight">{title || 'Untitled Post'}</h1>
                    <div
                      className="prose prose-lg max-w-none prose-headings:text-purple-900 dark:prose-headings:text-purple-900 prose-p:text-purple-800 dark:prose-p:text-purple-800 prose-a:text-blue-700 dark:prose-a:text-blue-800 prose-strong:text-purple-900 dark:prose-strong:text-purple-900"
                      dangerouslySetInnerHTML={{ __html: content || '<p class="text-purple-600 dark:text-purple-700 italic font-bold">No content yet...</p>' }}
                    />
                  </div>
                ) : (
                  <AdvancedRichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Start writing your blog post content here..."
                  />
                )}
              </div>

              {/* Collaboration & Status Bar */}
              <div className="px-6 pb-6">
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-100 dark:to-teal-100 rounded-2xl border border-emerald-300 dark:border-emerald-400 p-6 transition-all duration-300 hover:shadow-lg hover:border-emerald-400 dark:hover:border-emerald-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-emerald-600 rounded-full shadow-sm shadow-emerald-300"></div>
                        <span className="text-sm font-black text-emerald-800 dark:text-emerald-900">
                          Live
                        </span>
                      </div>
                      <Users className="h-5 w-5 text-emerald-700 dark:text-emerald-800" />
                      <span className="text-sm font-bold text-emerald-800 dark:text-emerald-900">
                        Real-time collaboration ready
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-emerald-200 hover:bg-emerald-300 dark:bg-emerald-200 dark:hover:bg-emerald-300 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-900 hover:text-emerald-900 dark:hover:text-emerald-900 transition-all duration-300 font-black"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Invite Collaborators
                    </Button>
                  </div>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-800 mt-3 opacity-90">
                    Solo editing mode - invite others to collaborate in real-time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Floating Panel */}
        {showAI && (
          <div className="fixed top-1/2 right-6 transform -translate-y-1/2 w-80 z-50">
            <div className="bg-purple-50 dark:bg-purple-100 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-400 dark:border-purple-500 overflow-hidden transition-all duration-500 hover:shadow-3xl">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-black">AI Assistant</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAI(false)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <AIWritingAssistant
                  onContentGenerated={handleContentGenerated}
                  onSEOSuggestions={handleSEOSuggestions}
                />
              </div>
            </div>
          </div>
        )}

        {/* SEO Analyzer Floating Panel */}
        {showSEO && (
          <div className="fixed top-1/2 left-6 transform -translate-y-1/2 w-80 z-50">
            <div className="bg-orange-50 dark:bg-orange-100 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-400 dark:border-orange-500 overflow-hidden transition-all duration-500 hover:shadow-3xl">
              <div className="p-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-black">SEO Analysis</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSEO(false)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <SEOAnalyzer
                  title={title}
                  content={content}
                  excerpt=""
                  tags={tags.split(',').map(tag => tag.trim()).filter(Boolean)}
                  onAnalysisUpdate={setSeoAnalysis}
                />
              </div>
            </div>
          </div>
        )}

        {/* Plagiarism Checker Floating Panel */}
        {showPlagiarism && (
          <div className="fixed top-1/2 right-6 transform -translate-y-1/2 w-80 z-50">
            <div className="bg-red-50 dark:bg-red-100 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-400 dark:border-red-500 overflow-hidden transition-all duration-500 hover:shadow-3xl">
              <div className="p-4 bg-gradient-to-r from-red-600 to-pink-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-black">Plagiarism Check</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPlagiarism(false)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <PlagiarismChecker
                  content={content}
                  title={title}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <div className="flex flex-col space-y-3">
          <Button
            size="sm"
            className="rounded-full shadow-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 w-14 h-14 transition-all duration-300 hover:scale-110"
            onClick={() => setShowAI(!showAI)}
          >
            <Sparkles className="h-6 w-6" />
          </Button>
          <Button
            size="sm"
            className="rounded-full shadow-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 w-14 h-14 transition-all duration-300 hover:scale-110"
            onClick={() => setShowSEO(!showSEO)}
          >
            <BarChart3 className="h-6 w-6" />
          </Button>
          <Button
            size="sm"
            className="rounded-full shadow-2xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0 w-14 h-14 transition-all duration-300 hover:scale-110"
            onClick={() => setShowPlagiarism(!showPlagiarism)}
          >
            <Shield className="h-6 w-6" />
          </Button>
          <Button
            size="sm"
            className="rounded-full shadow-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white border-0 w-14 h-14 transition-all duration-300 hover:scale-110"
            onClick={() => handleSave()}
            disabled={isSaving}
          >
            <Save className="h-6 w-6" />
          </Button>
          <Button
            size="sm"
            className="rounded-full shadow-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white border-0 w-14 h-14 transition-all duration-300 hover:scale-110"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-6 w-6" />
          </Button>
          <Button
            size="sm"
            className="rounded-full shadow-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 w-14 h-14 transition-all duration-300 hover:scale-110"
            onClick={handlePublish}
            disabled={!title.trim() || !content.trim() || isSaving}
            title="Publish Post"
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
