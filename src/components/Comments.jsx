import React, { useState, useEffect } from 'react';
import { MessageCircle, Trash2, Clock } from 'lucide-react';
import CommentService from '../lib/commentService';
import { useAuth } from '../state/authContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

const Comments = ({ taskId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await CommentService.getForTask(taskId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const comment = await CommentService.create(taskId, newComment);
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateComment = async (id) => {
    try {
      const updated = await CommentService.update(id, editContent);
      setComments(comments.map((c) => (c._id === id ? updated : c)));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await CommentService.delete(id);
      setComments(comments.filter((c) => c._id !== id));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMinutes = Math.floor((now - commentDate) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return commentDate.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle size={18} className="text-slate-600" />
        <h3 className="font-semibold text-gray-900">Comments</h3>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent resize-none"
          rows="2"
        />
        <Button
          type="submit"
          disabled={!newComment.trim()}
          className="text-sm"
        >
          Post Comment
        </Button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-4 text-slate-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 text-slate-500">No comments yet</div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment._id} className="p-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {comment.userId.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={12} />
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
                {comment.userId._id === user?._id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingId(comment._id);
                        setEditContent(comment.content);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment._id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                    rows="2"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateComment(comment._id)}
                      className="text-sm"
                    >
                      Save
                    </Button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-sm px-3 py-1 text-slate-700 hover:bg-slate-100 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;
