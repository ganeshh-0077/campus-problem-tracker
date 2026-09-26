import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Issue, Comment, IssueHistory } from '../types';

interface RealtimeCallbacks {
  onIssueInsert?: (newIssue: Issue) => void;
  onIssueUpdate?: (updatedIssue: Issue) => void;
  onIssueDelete?: (deletedId: string) => void;
  onCommentInsert?: (newComment: Comment) => void;
  onHistoryInsert?: (newHistory: IssueHistory) => void;
}

export const useRealtimeIssues = (callbacks: RealtimeCallbacks) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR'
  >('IDLE');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setConnectionStatus('IDLE');
      return;
    }

    setConnectionStatus('CONNECTING');

    // Subscribe to Postgres changes on issues, comments, and issue_history
    const channel = supabase
      .channel('campus-tracker-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'issues' },
        (payload) => {
          console.log('[REALTIME] Issue Inserted:', payload.new);
          callbacks.onIssueInsert?.(payload.new as Issue);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'issues' },
        (payload) => {
          console.log('[REALTIME] Issue Updated:', payload.new);
          callbacks.onIssueUpdate?.(payload.new as Issue);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'issues' },
        (payload) => {
          console.log('[REALTIME] Issue Deleted:', payload.old);
          if (payload.old?.id) {
            callbacks.onIssueDelete?.(payload.old.id);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          console.log('[REALTIME] Comment Added:', payload.new);
          callbacks.onCommentInsert?.(payload.new as Comment);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'issue_history' },
        (payload) => {
          console.log('[REALTIME] Status History Logged:', payload.new);
          callbacks.onHistoryInsert?.(payload.new as IssueHistory);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('CONNECTED');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('ERROR');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setConnectionStatus('IDLE');
    };
  }, []);

  return { connectionStatus };
};
