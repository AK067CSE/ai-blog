'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AIWritingAssistant from '@/components/ai/AIWritingAssistant';
import {
  PenTool,
  FileText,
  BarChart3,
  Users,
  Plus,
  Settings,
  Bell,
  Search
} from 'lucide-react';

export default function DashboardPage() {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [user, setUser] = useState<{name: string; email: string; firstName?: string} | null>(null);
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleContentGenerated = (content: string) => {
    setGeneratedContent(content);
    // Here you could open a new post editor with the generated content
    console.log('Generated content:', content);
  };

  const handleSEOSuggestions = (suggestions: {score: number; suggestions: string[]}) => {
    console.log('SEO suggestions:', suggestions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50 dark:from-purple-100 dark:via-pink-100 dark:to-violet-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 border-b-2 border-purple-300 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-white" />
              <h1 className="text-xl font-bold text-white">BlogCraft AI</h1>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600" />
                <input
                  type="text"
                  placeholder="Search posts, drafts, or topics..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-white bg-white/20 text-white placeholder-white/70 font-semibold"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <PenTool className="mr-2 h-4 w-4" />
                AI Assistant
              </Button>
              <Button
                size="sm"
                onClick={() => router.push('/editor')}
                className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white border-0 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Button>

              {/* User Status */}
              {user ? (
                <div className="flex items-center space-x-2 text-sm border-l border-white/30 pl-4 ml-4">
                  <span className="text-white/70 font-semibold">Welcome,</span>
                  <span className="font-bold text-white">{user.firstName}</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/auth/login')}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-bold"
                >
                  Login
                </Button>
              )}

              <button className="p-2 text-white/70 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-white/70 hover:text-white transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome to BlogCraft AI</h2>
              <p className="text-white/90 mb-4 font-semibold">
                Create amazing content with the power of AI. Generate blog posts, optimize for SEO,
                and collaborate with your team in real-time.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/editor')}
                  className="bg-white text-purple-900 hover:bg-purple-100 border-0 font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Post
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/20 font-bold shadow-lg hover:shadow-xl transition-all"
                  onClick={() => setShowAIAssistant(true)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  AI Templates
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-600">Total Posts</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-900">12</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-purple-500 dark:text-purple-500 mt-2 font-semibold">+2 from last week</p>
              </div>

              <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-600">Total Views</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-900">1,234</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-purple-500 dark:text-purple-500 mt-2 font-semibold">+15% from last week</p>
              </div>

              <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-600">Collaborators</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-900">5</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-purple-500 dark:text-purple-500 mt-2 font-semibold">Active this month</p>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl">
              <div className="p-6 border-b-2 border-purple-200 dark:border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100">
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900">Recent Posts</h3>
              </div>
              <div className="divide-y divide-purple-200 dark:divide-purple-300">
                {[
                  {
                    title: "Getting Started with AI-Powered Content Creation",
                    status: "Published",
                    date: "2 days ago",
                    views: 234
                  },
                  {
                    title: "10 Tips for Better Blog SEO",
                    status: "Draft",
                    date: "5 days ago",
                    views: 0
                  },
                  {
                    title: "The Future of Content Marketing",
                    status: "Published",
                    date: "1 week ago",
                    views: 456
                  }
                ].map((post, index) => (
                  <div key={index} className="p-6 hover:bg-purple-100 dark:hover:bg-purple-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-purple-900 dark:text-purple-900">{post.title}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-purple-600 dark:text-purple-600 font-semibold">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            post.status === 'Published'
                              ? 'bg-green-200 text-green-900'
                              : 'bg-yellow-200 text-yellow-900'
                          }`}>
                            {post.status}
                          </span>
                          <span>{post.date}</span>
                          <span>{post.views} views</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/editor')}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Content Preview */}
            {generatedContent && (
              <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl">
                <div className="p-6 border-b-2 border-purple-200 dark:border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100">
                  <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900">AI Generated Content</h3>
                </div>
                <div className="p-6">
                  <div className="bg-purple-100 dark:bg-purple-200 rounded-md p-4 mb-4 border border-purple-300 dark:border-purple-400">
                    <pre className="whitespace-pre-wrap text-sm text-purple-800 dark:text-purple-800">{generatedContent}</pre>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        // Store content in localStorage and navigate to editor
                        localStorage.setItem('draftContent', generatedContent);
                        router.push('/editor');
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Post from This
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedContent);
                        alert('Content copied to clipboard!');
                      }}
                      className="bg-purple-200 dark:bg-purple-200 hover:bg-purple-300 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900 border-purple-400 font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant */}
            {showAIAssistant && (
              <AIWritingAssistant
                onContentGenerated={handleContentGenerated}
                onSEOSuggestions={handleSEOSuggestions}
              />
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6">
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-purple-100 dark:bg-purple-200 hover:bg-purple-200 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900 border-purple-400 font-bold shadow-md hover:shadow-lg transition-all"
                  onClick={() => setShowAIAssistant(true)}
                >
                  <PenTool className="mr-2 h-4 w-4" />
                  Generate Blog Idea
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-purple-100 dark:bg-purple-200 hover:bg-purple-200 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900 border-purple-400 font-bold shadow-md hover:shadow-lg transition-all"
                  onClick={() => setShowAIAssistant(true)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Create Outline
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-purple-100 dark:bg-purple-200 hover:bg-purple-200 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900 border-purple-400 font-bold shadow-md hover:shadow-lg transition-all"
                  onClick={() => router.push('/posts')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View All Posts
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-purple-100 dark:bg-purple-200 hover:bg-purple-200 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900 border-purple-400 font-bold shadow-md hover:shadow-lg transition-all"
                  onClick={() => router.push('/analytics')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  SEO Analysis
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-purple-100 dark:bg-purple-200 hover:bg-purple-200 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900 border-purple-400 font-bold shadow-md hover:shadow-lg transition-all"
                  onClick={() => alert('Collaboration feature coming soon!')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Invite Collaborator
                </Button>
              </div>
            </div>

            {/* AI Usage */}
            <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6">
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900 mb-4">AI Usage This Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-purple-700 dark:text-purple-700 font-semibold">
                  <span>Content Generation</span>
                  <span className="font-bold">25/50</span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-300 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>

                <div className="flex justify-between text-sm text-purple-700 dark:text-purple-700 font-semibold">
                  <span>SEO Analysis</span>
                  <span className="font-bold">12/30</span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-300 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>

                <div className="flex justify-between text-sm text-purple-700 dark:text-purple-700 font-semibold">
                  <span>Plagiarism Checks</span>
                  <span className="font-bold">8/20</span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-300 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
