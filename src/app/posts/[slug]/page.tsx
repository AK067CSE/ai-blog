'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  PenTool, 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Tag,
  Edit,
  Share2
} from 'lucide-react';

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: {
    firstName: string;
    lastName: string;
    username: string;
  };
  status: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  readingTime: number;
  wordCount: number;
}

export default function PostViewPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/posts/slug/${slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setPost(data.data);
      } else {
        setError(data.message || 'Post not found');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSharePost = () => {
    if (!post) return;

    const shareUrl = `${window.location.origin}/posts/${post.slug}`;
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50 dark:from-purple-100 dark:via-pink-100 dark:to-violet-100 flex items-center justify-center">
        <div className="text-center border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-white dark:bg-purple-50 overflow-hidden shadow-xl p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700 dark:text-purple-700 font-semibold">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50 dark:from-purple-100 dark:via-pink-100 dark:to-violet-100 flex items-center justify-center">
        <div className="text-center border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-white dark:bg-purple-50 overflow-hidden shadow-xl p-12">
          <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-900 mb-4">
            Post Not Found
          </h1>
          <p className="text-purple-700 dark:text-purple-700 mb-6 font-semibold">{error}</p>
          <Button
            onClick={() => router.push('/posts')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 font-bold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50 dark:from-purple-100 dark:via-pink-100 dark:to-violet-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 border-b-2 border-purple-300 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/posts')}
                className="text-white hover:bg-white/20 font-bold"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Button>
              <div className="flex items-center space-x-2">
                <PenTool className="h-6 w-6 text-white" />
                <span className="font-bold text-white">BlogCraft AI</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSharePost}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/editor?id=${post._id}`)}
                className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white border-0 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Post Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Header */}
        <header className="mb-8 border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-white dark:bg-purple-50 overflow-hidden shadow-xl p-8">
          <h1 className="text-4xl font-bold text-purple-900 dark:text-purple-900 mb-6 text-center">
            {post.title}
          </h1>

          <div className="flex items-center justify-center space-x-6 text-purple-600 dark:text-purple-600 mb-6 font-semibold">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{post.author.firstName} {post.author.lastName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>

          {post.tags.length > 0 && (
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Tag className="h-4 w-4 text-purple-600" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-200 dark:bg-purple-200 text-purple-900 dark:text-purple-900 text-sm rounded-full font-bold shadow-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {post.status !== 'published' && (
            <div className="mb-6 text-center">
              <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm rounded-full font-bold shadow-lg">
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </span>
            </div>
          )}
        </header>

        {/* Post Content */}
        <div className="border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-white dark:bg-purple-50 overflow-hidden shadow-xl p-8">
          <div
            className="prose prose-lg max-w-none blog-content"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              lineHeight: '1.8',
              color: '#2d3748'
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Post Footer */}
        <footer className="mt-12 pt-8 border-t-2 border-purple-300 dark:border-purple-400">
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100 rounded-lg p-6 shadow-lg">
            <div className="text-sm text-purple-700 dark:text-purple-700 font-semibold">
              <p>Published on {formatDate(post.createdAt)}</p>
              <p>{post.wordCount} words • {post.readingTime} minute read</p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSharePost}
                className="bg-blue-200 dark:bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-300 text-blue-900 dark:text-blue-900 border-blue-400 font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Post
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/editor?id=${post._id}`)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Post
              </Button>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
