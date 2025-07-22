'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Users, Mail, UserPlus, Check, Trash2, MessageSquare, Activity, Settings, Clock, Eye, Edit3 } from 'lucide-react';

interface Collaborator {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'editor' | 'reviewer' | 'viewer';
  status: 'pending' | 'accepted';
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canPublish: boolean;
    canInviteOthers: boolean;
    canManageCollaborators: boolean;
  };
  lastActive?: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  replies: Comment[];
}

interface ActivityItem {
  id: string;
  type: 'edit' | 'comment' | 'reply' | 'invite' | 'publish' | 'approve' | 'resolve' | 'unresolve' | 'remove_collaborator' | 'role_change' | 'settings_change';
  author: string;
  description: string;
  timestamp: string;
  details?: string;
}

type TabType = 'collaborators' | 'comments' | 'activity' | 'settings';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

export default function CollaborationModal({ isOpen, onClose, postId, postTitle }: CollaborationModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('collaborators');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'reviewer' | 'viewer'>('editor');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    // Mock data - in real app this would come from API
    {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'editor',
      status: 'accepted',
      permissions: {
        canEdit: true,
        canComment: true,
        canPublish: true,
        canInviteOthers: false,
        canManageCollaborators: false
      },
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      role: 'viewer',
      status: 'pending',
      permissions: {
        canEdit: false,
        canComment: true,
        canPublish: false,
        canInviteOthers: false,
        canManageCollaborators: false
      },
      lastActive: '1 day ago'
    }
  ]);
  const [isInviting, setIsInviting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Mock data for other tabs
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'John Doe',
      content: 'This section needs more detail about the implementation.',
      timestamp: '2 hours ago',
      resolved: false,
      replies: [
        {
          id: '1-1',
          author: 'Jane Smith',
          content: 'I agree, let me add more examples.',
          timestamp: '1 hour ago',
          resolved: false,
          replies: []
        }
      ]
    }
  ]);

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'edit',
      author: 'John Doe',
      description: 'Edited the introduction section',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'comment',
      author: 'Jane Smith',
      description: 'Added a comment on paragraph 3',
      timestamp: '3 hours ago'
    },
    {
      id: '3',
      type: 'invite',
      author: 'You',
      description: 'Invited jane@example.com as a viewer',
      timestamp: '1 day ago'
    }
  ]);

  // Helper function to add activity
  const addActivity = (type: ActivityItem['type'], description: string, details?: string) => {
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type,
      author: 'You', // In real app, get from current user
      description,
      timestamp: 'Just now',
      details
    };
    setActivities([newActivity, ...activities]);
  };

  // Simulate external activities (in real app, these would come from websockets or API polling)
  const simulateExternalActivity = () => {
    const externalActivities = [
      { type: 'edit' as const, description: 'Edited the title and introduction', details: 'Changed "Introduction" to "Getting Started"' },
      { type: 'publish' as const, description: 'Published the post', details: 'Post is now live and visible to readers' },
      { type: 'role_change' as const, description: 'Changed John Doe\'s role from viewer to editor', details: 'Role: viewer → editor' },
      { type: 'settings_change' as const, description: 'Updated collaboration settings', details: 'Enabled approval workflow' }
    ];

    const randomActivity = externalActivities[Math.floor(Math.random() * externalActivities.length)];
    addActivity(randomActivity.type, randomActivity.description, randomActivity.details);
  };

  if (!isOpen) return null;

  const handleInvite = async () => {
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    // Check if already invited
    if (collaborators.some(c => c.email === email)) {
      alert('This person has already been invited');
      return;
    }

    setIsInviting(true);

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const getPermissionsForRole = (role: 'editor' | 'reviewer' | 'viewer') => {
        switch (role) {
          case 'editor':
            return {
              canEdit: true,
              canComment: true,
              canPublish: true,
              canInviteOthers: false,
              canManageCollaborators: false
            };
          case 'reviewer':
            return {
              canEdit: false,
              canComment: true,
              canPublish: true,
              canInviteOthers: false,
              canManageCollaborators: false
            };
          case 'viewer':
            return {
              canEdit: false,
              canComment: true,
              canPublish: false,
              canInviteOthers: false,
              canManageCollaborators: false
            };
        }
      };

      const newCollaborator: Collaborator = {
        id: Date.now().toString(),
        email: email.trim(),
        name: email.split('@')[0], // Mock name from email
        role,
        status: 'pending',
        permissions: getPermissionsForRole(role)
      };

      setCollaborators([...collaborators, newCollaborator]);
      setEmail('');

      // Add activity
      addActivity('invite', `Invited ${email} as ${role}`, `Role: ${role}`);

      alert(`Invitation sent to ${email}!`);
    } catch (error) {
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    const collaborator = collaborators.find(c => c.id === collaboratorId);
    if (!collaborator) return;

    const confirmRemove = confirm(
      `Are you sure you want to remove ${collaborator.name} from this post?`
    );

    if (!confirmRemove) return;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));

      // Add activity
      addActivity('remove_collaborator', `Removed ${collaborator.name} from the post`, `Email: ${collaborator.email}`);

      alert(`${collaborator.name} has been removed from the post.`);
    } catch (error) {
      alert('Failed to remove collaborator. Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setIsSubmittingComment(true);

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const comment: Comment = {
        id: Date.now().toString(),
        author: 'You', // In real app, get from current user
        content: newComment.trim(),
        timestamp: 'Just now',
        resolved: false,
        replies: []
      };

      setComments([comment, ...comments]);
      setNewComment('');

      // Add activity
      addActivity('comment', 'Added a new comment', comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : ''));

      alert('Comment added successfully!');
    } catch (error) {
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }

    setIsSubmittingComment(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const reply: Comment = {
        id: `${commentId}-${Date.now()}`,
        author: 'You',
        content: replyText.trim(),
        timestamp: 'Just now',
        resolved: false,
        replies: []
      };

      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...comment.replies, reply]
          };
        }
        return comment;
      }));

      setReplyText('');
      setReplyingTo(null);

      // Add activity
      addActivity('reply', 'Replied to a comment', reply.content.substring(0, 50) + (reply.content.length > 50 ? '...' : ''));

      alert('Reply added successfully!');
    } catch (error) {
      alert('Failed to add reply. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleToggleResolved = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newResolvedStatus = !comment.resolved;

      setComments(comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            resolved: newResolvedStatus
          };
        }
        return c;
      }));

      // Add activity
      addActivity(
        newResolvedStatus ? 'resolve' : 'unresolve',
        `${newResolvedStatus ? 'Resolved' : 'Reopened'} a comment`,
        comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : '')
      );
    } catch (error) {
      alert('Failed to update comment status. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-purple-200 dark:border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-purple-900 dark:text-purple-900">Manage Collaborators</h2>
              <p className="text-sm text-purple-700 dark:text-purple-700 font-semibold">"{postTitle}"</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-purple-200 dark:hover:bg-purple-200 text-purple-800 dark:text-purple-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b-2 border-purple-200 dark:border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-50 dark:to-pink-50">
          <div className="flex space-x-1 p-2">
            {[
              { id: 'collaborators', label: `Collaborators (${collaborators.length})`, icon: Users },
              { id: 'comments', label: `Comments (${comments.length})`, icon: MessageSquare },
              { id: 'activity', label: `Activity (${activities.length})`, icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-purple-700 hover:bg-purple-200 dark:hover:bg-purple-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'collaborators' && (
            <>
              {/* Invite Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900">Invite New Collaborator</h3>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-2 border-purple-300 dark:border-purple-400 bg-white dark:bg-purple-50 text-purple-900 dark:text-purple-900 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'editor' | 'reviewer' | 'viewer')}
                    className="px-3 py-2 border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-white dark:bg-purple-50 text-purple-900 dark:text-purple-900 font-bold focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="editor">Editor</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <Button
                    onClick={handleInvite}
                    disabled={isInviting || !email.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isInviting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Inviting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-600">
                  <strong>Editor:</strong> Can edit and publish the post<br />
                  <strong>Reviewer:</strong> Can comment and approve/reject changes<br />
                  <strong>Viewer:</strong> Can only view and comment on the post
                </div>
              </div>

              {/* Current Collaborators */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900">Current Collaborators ({collaborators.length})</h3>
                {collaborators.length === 0 ? (
                  <div className="text-center py-8 text-purple-600 dark:text-purple-600">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-semibold">No collaborators yet</p>
                    <p className="text-sm">Invite people to collaborate on this post</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="flex items-center justify-between p-4 bg-purple-100 dark:bg-purple-200 rounded-lg border border-purple-300 dark:border-purple-400"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                            {collaborator.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-purple-900 dark:text-purple-900">{collaborator.name}</div>
                            <div className="text-sm text-purple-700 dark:text-purple-700">{collaborator.email}</div>
                            {collaborator.lastActive && (
                              <div className="text-xs text-purple-600 dark:text-purple-600">Last active: {collaborator.lastActive}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            collaborator.role === 'editor'
                              ? 'bg-green-200 text-green-900'
                              : collaborator.role === 'reviewer'
                              ? 'bg-orange-200 text-orange-900'
                              : 'bg-blue-200 text-blue-900'
                          }`}>
                            {collaborator.role}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            collaborator.status === 'accepted'
                              ? 'bg-green-200 text-green-900'
                              : 'bg-yellow-200 text-yellow-900'
                          }`}>
                            {collaborator.status === 'accepted' ? (
                              <>
                                <Check className="h-3 w-3 inline mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <Mail className="h-3 w-3 inline mr-1" />
                                Pending
                              </>
                            )}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveCollaborator(collaborator.id)}
                            className="bg-red-200 dark:bg-red-200 hover:bg-red-300 dark:hover:bg-red-300 text-red-900 dark:text-red-900 border-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900">Comments & Discussions</h3>

              {/* Add Comment Form */}
              <div className="bg-purple-100 dark:bg-purple-200 rounded-lg p-4 border border-purple-300 dark:border-purple-400">
                <h4 className="font-bold text-purple-900 dark:text-purple-900 mb-3">Add a Comment</h4>
                <div className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts, suggestions, or feedback..."
                    className="w-full p-3 border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-white dark:bg-purple-50 text-purple-900 dark:text-purple-900 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-purple-600 dark:text-purple-600">
                      <strong>Tip:</strong> Use @username to mention collaborators
                    </div>
                    <Button
                      onClick={handleAddComment}
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      {isSubmittingComment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Posting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {comments.length === 0 ? (
                <div className="text-center py-8 text-purple-600 dark:text-purple-600">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-semibold">No comments yet</p>
                  <p className="text-sm">Comments will appear here when collaborators add them</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-purple-100 dark:bg-purple-200 rounded-lg p-4 border border-purple-300 dark:border-purple-400">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {comment.author.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-purple-900 dark:text-purple-900 text-sm">{comment.author}</div>
                            <div className="text-xs text-purple-600 dark:text-purple-600">{comment.timestamp}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleResolved(comment.id)}
                            className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                              comment.resolved
                                ? 'bg-green-200 text-green-900 hover:bg-green-300'
                                : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
                            }`}
                          >
                            {comment.resolved ? 'Resolved' : 'Open'}
                          </button>
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="px-2 py-1 bg-blue-200 text-blue-900 hover:bg-blue-300 rounded-full text-xs font-bold transition-all"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                      <p className="text-purple-800 dark:text-purple-800 mb-3">{comment.content}</p>

                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <div className="mb-3 p-3 bg-white dark:bg-purple-50 rounded-lg border border-purple-300 dark:border-purple-400">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            className="w-full p-2 border border-purple-300 dark:border-purple-400 rounded bg-white dark:bg-purple-50 text-purple-900 dark:text-purple-900 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm"
                            rows={2}
                          />
                          <div className="flex items-center justify-end space-x-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="text-purple-700 border-purple-300 hover:bg-purple-100"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAddReply(comment.id)}
                              disabled={isSubmittingComment || !replyText.trim()}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 font-bold"
                            >
                              {isSubmittingComment ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                  Replying...
                                </>
                              ) : (
                                'Reply'
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                      {comment.replies.length > 0 && (
                        <div className="ml-4 space-y-2 border-l-2 border-purple-300 pl-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="bg-white dark:bg-purple-50 rounded p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                  {reply.author.charAt(0).toUpperCase()}
                                </div>
                                <div className="font-bold text-purple-900 dark:text-purple-900 text-sm">{reply.author}</div>
                                <div className="text-xs text-purple-600 dark:text-purple-600">{reply.timestamp}</div>
                              </div>
                              <p className="text-purple-800 dark:text-purple-800 text-sm">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900">Recent Activity</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={simulateExternalActivity}
                  className="bg-purple-200 dark:bg-purple-200 hover:bg-purple-300 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900 border-purple-400 font-bold"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Simulate Activity
                </Button>
              </div>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-purple-600 dark:text-purple-600">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-semibold">No activity yet</p>
                  <p className="text-sm">Activity will appear here as collaborators work on the post</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-purple-100 dark:bg-purple-200 rounded-lg border border-purple-300 dark:border-purple-400">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        activity.type === 'edit' ? 'bg-green-500' :
                        activity.type === 'comment' ? 'bg-blue-500' :
                        activity.type === 'reply' ? 'bg-indigo-500' :
                        activity.type === 'invite' ? 'bg-purple-500' :
                        activity.type === 'publish' ? 'bg-orange-500' :
                        activity.type === 'resolve' ? 'bg-emerald-500' :
                        activity.type === 'unresolve' ? 'bg-yellow-500' :
                        activity.type === 'remove_collaborator' ? 'bg-red-500' :
                        activity.type === 'role_change' ? 'bg-cyan-500' :
                        activity.type === 'settings_change' ? 'bg-gray-500' :
                        'bg-gray-500'
                      }`}>
                        {activity.type === 'edit' ? <Edit3 className="h-4 w-4" /> :
                         activity.type === 'comment' ? <MessageSquare className="h-4 w-4" /> :
                         activity.type === 'reply' ? <MessageSquare className="h-4 w-4" /> :
                         activity.type === 'invite' ? <UserPlus className="h-4 w-4" /> :
                         activity.type === 'publish' ? <Eye className="h-4 w-4" /> :
                         activity.type === 'resolve' ? <Check className="h-4 w-4" /> :
                         activity.type === 'unresolve' ? <X className="h-4 w-4" /> :
                         activity.type === 'remove_collaborator' ? <Trash2 className="h-4 w-4" /> :
                         activity.type === 'role_change' ? <Users className="h-4 w-4" /> :
                         activity.type === 'settings_change' ? <Settings className="h-4 w-4" /> :
                         <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-purple-900 dark:text-purple-900 text-sm">{activity.author}</div>
                        <div className="text-purple-800 dark:text-purple-800 text-sm">{activity.description}</div>
                        {activity.details && (
                          <div className="text-xs text-purple-600 dark:text-purple-600 bg-purple-50 dark:bg-purple-100 rounded px-2 py-1 mt-1 italic">
                            {activity.details}
                          </div>
                        )}
                        <div className="text-xs text-purple-600 dark:text-purple-600 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900">Collaboration Settings</h3>

              <div className="space-y-4">
                <div className="bg-purple-100 dark:bg-purple-200 rounded-lg p-4 border border-purple-300 dark:border-purple-400">
                  <h4 className="font-bold text-purple-900 dark:text-purple-900 mb-2">Post Permissions</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded border-purple-300" />
                      <span className="text-purple-800 dark:text-purple-800">Allow collaborators to invite others</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded border-purple-300" />
                      <span className="text-purple-800 dark:text-purple-800">Require approval before publishing</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded border-purple-300" />
                      <span className="text-purple-800 dark:text-purple-800">Allow anonymous comments</span>
                    </label>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-200 rounded-lg p-4 border border-purple-300 dark:border-purple-400">
                  <h4 className="font-bold text-purple-900 dark:text-purple-900 mb-2">Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded border-purple-300" />
                      <span className="text-purple-800 dark:text-purple-800">Email me when someone comments</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded border-purple-300" />
                      <span className="text-purple-800 dark:text-purple-800">Email me when someone edits the post</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded border-purple-300" />
                      <span className="text-purple-800 dark:text-purple-800">Daily activity summary</span>
                    </label>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-100 rounded-lg p-4 border border-red-300 dark:border-red-400">
                  <h4 className="font-bold text-red-900 dark:text-red-900 mb-2">Danger Zone</h4>
                  <p className="text-red-800 dark:text-red-800 text-sm mb-3">
                    These actions cannot be undone. Please be careful.
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-200 dark:bg-red-200 hover:bg-red-300 dark:hover:bg-red-300 text-red-900 dark:text-red-900 border-red-400 font-bold"
                    >
                      Remove all collaborators
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-200 dark:bg-red-200 hover:bg-red-300 dark:hover:bg-red-300 text-red-900 dark:text-red-900 border-red-400 font-bold"
                    >
                      Disable collaboration
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t-2 border-purple-200 dark:border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-purple-200 dark:bg-purple-200 hover:bg-purple-300 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900 border-purple-400 font-bold"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
