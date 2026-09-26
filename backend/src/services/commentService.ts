import crypto from 'crypto';
import { supabaseAdmin } from '../utils/supabaseClient';
import { AppError } from '../middleware/errorMiddleware';
import { Comment, Profile } from '../types';
import { IssueService } from './issueService';

let memoryComments: Comment[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    issue_id: 'd0000000-0000-0000-0000-000000000001',
    user_id: 'b0000000-0000-0000-0000-000000000001',
    comment: 'I ran a hardware diagnostic remotely. Replacing the GPU driver today at 2 PM.',
    created_at: new Date(Date.now() - 40000000).toISOString(),
    user: {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: 'James Wilson',
      email: 'james.staff@campus.edu',
      role: 'Staff',
    },
  },
];

export class CommentService {
  /**
   * Retrieves all comments for an issue, verifying user has access.
   */
  static async getComments(issueId: string, profile: Profile): Promise<Comment[]> {
    await IssueService.getIssueById(issueId, profile);

    try {
      const { data, error } = await supabaseAdmin
        .from('comments')
        .select(`
          *,
          user:profiles!comments_user_id_fkey(id, name, email, role)
        `)
        .eq('issue_id', issueId)
        .order('created_at', { ascending: true });

      if (error) {
        return memoryComments.filter((c) => c.issue_id === issueId);
      }

      return (data || []) as Comment[];
    } catch (err) {
      return memoryComments.filter((c) => c.issue_id === issueId);
    }
  }

  /**
   * Adds a new comment to an issue.
   */
  static async addComment(
    issueId: string,
    commentText: string,
    profile: Profile
  ): Promise<Comment> {
    await IssueService.getIssueById(issueId, profile);

    try {
      const { data, error } = await supabaseAdmin
        .from('comments')
        .insert({
          issue_id: issueId,
          user_id: profile.id,
          comment: commentText,
        })
        .select(`
          *,
          user:profiles!comments_user_id_fkey(id, name, email, role)
        `)
        .single();

      if (error) {
        const newC: Comment = {
          id: crypto.randomUUID(),
          issue_id: issueId,
          user_id: profile.id,
          comment: commentText,
          created_at: new Date().toISOString(),
          user: profile,
        };
        memoryComments.push(newC);
        return newC;
      }

      return data as Comment;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const newC: Comment = {
        id: crypto.randomUUID(),
        issue_id: issueId,
        user_id: profile.id,
        comment: commentText,
        created_at: new Date().toISOString(),
        user: profile,
      };
      memoryComments.push(newC);
      return newC;
    }
  }
}
