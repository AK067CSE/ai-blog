'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CollaborationModal from '@/components/collaboration/CollaborationModal';
import {
  PenTool,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Tag,
  Clock,
  Share2,
  Users
} from 'lucide-react';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: {
    firstName: string;
    lastName: string;
    username: string;
  };
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  readingTime: number;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collaborationModal, setCollaborationModal] = useState<{
    isOpen: boolean;
    postId: string;
    postTitle: string;
  }>({
    isOpen: false,
    postId: '',
    postTitle: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/posts?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data.posts);
      } else {
        console.error('Failed to fetch posts:', data.message);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${postTitle}"?\n\n` +
      'This action cannot be undone. The post will be permanently removed.'
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Post deleted successfully!');
        // Refresh the posts list
        fetchPosts();
      } else {
        alert('Failed to delete post: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleSharePost = (post: {_id: string; title: string; slug?: string; status: string}) => {
    const shareUrl = post.status === 'published'
      ? `${window.location.origin}/posts/${post.slug}`
      : `${window.location.origin}/posts/preview/${post._id}`;

    const shareText = `Check out this blog post: "${post.title}"`;

    if (navigator.share) {
      // Use native sharing if available
      navigator.share({
        title: post.title,
        text: shareText,
        url: shareUrl,
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        alert('Post link copied to clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = `${shareText}\n${shareUrl}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Post link copied to clipboard!');
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50 dark:from-purple-100 dark:via-pink-100 dark:to-violet-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 border-b-2 border-purple-300 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-white" />
              <h1 className="text-xl font-bold text-white">BlogCraft AI</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Dashboard
              </Button>
              <Button
                onClick={() => router.push('/editor')}
                className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white border-0 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-purple-900 dark:text-purple-900 mb-4">
            My Posts
          </h1>
          <p className="text-purple-700 dark:text-purple-700 text-lg font-semibold">
            Manage and view all your blog posts
          </p>
        </div>

        {/* Filters and Search */}
        <div className="border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-purple-50 dark:bg-purple-100 overflow-hidden shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-purple-300 dark:border-purple-400 bg-white dark:bg-purple-50 text-purple-900 dark:text-purple-900 focus:ring-purple-500 focus:border-purple-500 shadow-md hover:shadow-lg transition-all"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-white dark:bg-purple-50 text-purple-900 dark:text-purple-900 font-bold shadow-md hover:shadow-lg transition-all focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <div className="border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-purple-50 dark:bg-purple-100 overflow-hidden shadow-xl p-12 text-center">
            <PenTool className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900 mb-2">
              No posts found
            </h3>
            <p className="text-purple-700 dark:text-purple-700 mb-6 font-semibold">
              {searchTerm ? 'No posts match your search criteria.' : 'Get started by creating your first post.'}
            </p>
            <Button
              onClick={() => router.push('/editor')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 font-bold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Post
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div key={post._id} className="border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-white dark:bg-purple-50 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 p-6 hover:scale-[1.02]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Link href={post.status === 'published' ? `/posts/${post.slug}` : `/posts/preview/${post._id}`}>
                        <h2 className="text-xl font-bold text-purple-900 dark:text-purple-900 hover:text-pink-600 cursor-pointer transition-colors">
                          {post.title}
                        </h2>
                      </Link>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                    </div>

                    <p className="text-purple-700 dark:text-purple-700 mb-4 line-clamp-2 font-medium">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-purple-600 dark:text-purple-600 font-semibold">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{post.author.firstName} {post.author.lastName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readingTime} min read</span>
                      </div>
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mt-3">
                        <Tag className="h-4 w-4 text-purple-600" />
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-200 dark:bg-purple-200 text-purple-900 dark:text-purple-900 text-xs rounded-full font-bold shadow-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (post.status === 'published') {
                          router.push(`/posts/${post.slug}`);
                        } else {
                          router.push(`/posts/preview/${post._id}`);
                        }
                      }}
                      className="bg-blue-200 dark:bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-300 text-blue-900 dark:text-blue-900 border-blue-400 font-bold shadow-md hover:shadow-lg transition-all"
                      title={post.status === 'published' ? 'View Published Post' : 'Preview Draft'}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSharePost(post)}
                      className="bg-purple-200 dark:bg-purple-200 hover:bg-purple-300 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900 border-purple-400 font-bold shadow-md hover:shadow-lg transition-all"
                      title="Share Post"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCollaborationModal({
                        isOpen: true,
                        postId: post._id,
                        postTitle: post.title
                      })}
                      className="bg-indigo-200 dark:bg-indigo-200 hover:bg-indigo-300 dark:hover:bg-indigo-300 text-indigo-900 dark:text-indigo-900 border-indigo-400 font-bold shadow-md hover:shadow-lg transition-all"
                      title="Manage Collaborators"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/editor?id=${post._id}`)}
                      className="bg-green-200 dark:bg-green-200 hover:bg-green-300 dark:hover:bg-green-300 text-green-900 dark:text-green-900 border-green-400 font-bold shadow-md hover:shadow-lg transition-all"
                      title="Edit Post"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePost(post._id, post.title)}
                      className="bg-red-200 dark:bg-red-200 hover:bg-red-300 dark:hover:bg-red-300 text-red-900 dark:text-red-900 border-red-400 font-bold shadow-md hover:shadow-lg transition-all"
                      title="Delete Post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collaboration Modal */}
      <CollaborationModal
        isOpen={collaborationModal.isOpen}
        onClose={() => setCollaborationModal({ isOpen: false, postId: '', postTitle: '' })}
        postId={collaborationModal.postId}
        postTitle={collaborationModal.postTitle}
      />
    </div>
  );
}
