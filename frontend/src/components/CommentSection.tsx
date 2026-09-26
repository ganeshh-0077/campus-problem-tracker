import React, { useState, useEffect } from 'react';
import { Comment, Profile } from '../types';
import { api } from '../services/api';
import { Send, MessageSquare, User, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CommentSectionProps {
  issueId: string;
  currentUser: Profile | null;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ issueId, currentUser }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getComments(issueId);
      setComments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [issueId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const created = await api.addComment(issueId, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 font-semibold text-xs sm:text-sm ${
        isLight ? 'text-slate-800' : 'text-silver-200'
      }`}>
        <MessageSquare size={15} className={isLight ? 'text-slate-500' : 'text-silver-400'} />
        <span>Operations Log ({comments.length})</span>
      </div>

      {error && (
        <div className="text-xs bg-rose-50 text-rose-700 dark:bg-[#1c0d0d] dark:text-rose-300 p-2.5 rounded-xl border border-rose-200 dark:border-rose-500/40">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {loading ? (
          <div className={`flex items-center justify-center py-6 text-xs ${
            isLight ? 'text-slate-400' : 'text-silver-500'
          }`}>
            <Loader2 size={15} className="animate-spin mr-2" />
            Loading updates...
          </div>
        ) : comments.length === 0 ? (
          <p className={`text-xs italic py-4 text-center ${
            isLight ? 'text-slate-400' : 'text-silver-500'
          }`}>
            No entries recorded yet. Submit a progress dispatch below.
          </p>
        ) : (
          comments.map((c) => {
            const isMe = c.user_id === currentUser?.id;
            return (
              <div
                key={c.id}
                className={`p-3 rounded-xl text-xs border ${
                  isLight
                    ? isMe
                      ? 'bg-slate-100/90 border-slate-300 ml-4'
                      : 'bg-slate-50 border-slate-200 mr-4'
                    : isMe
                    ? 'bg-[#181818] border-[#383838] ml-4'
                    : 'bg-[#121212] border-[#222222] mr-4'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className={`flex items-center gap-1.5 font-semibold ${
                    isLight ? 'text-slate-900' : 'text-silver-200'
                  }`}>
                    <User size={12} className={
                      isLight
                        ? isMe ? 'text-slate-700' : 'text-slate-400'
                        : isMe ? 'text-silver-300' : 'text-silver-500'
                    } />
                    <span>{c.user?.name || (isMe ? 'You' : 'User')}</span>
                    {c.user?.role && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal border ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-600'
                          : 'bg-[#0d0d0d] border border-[#2a2a2a] text-silver-400'
                      }`}>
                        {c.user.role}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono ${
                    isLight ? 'text-slate-400' : 'text-silver-500'
                  }`}>
                    {new Date(c.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className={`leading-relaxed whitespace-pre-wrap font-normal ${
                  isLight ? 'text-slate-700' : 'text-silver-300'
                }`}>{c.comment}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Transmit comment or operational note..."
          className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl transition focus:outline-none ${
            isLight
              ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-500'
              : 'bg-[#141414] border border-[#282828] text-silver-100 placeholder-silver-600 focus:border-silver-400 focus:bg-[#181818]'
          }`}
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="btn-silver-sheen inline-flex items-center gap-1.5 text-xs px-4 py-2.5 disabled:opacity-50 font-bold rounded-xl cursor-pointer"
        >
          {submitting ? (
            <Loader2 size={13} className="animate-spin text-black" />
          ) : (
            <>
              <Send size={12} />
              <span>Send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
