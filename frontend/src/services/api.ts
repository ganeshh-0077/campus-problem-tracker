import { supabase } from '../lib/supabase';
import {
  Issue,
  Comment,
  IssueHistory,
  DashboardStatistics,
  Profile,
  IssueCategory,
  IssuePriority,
  IssueStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Helper to fetch with current Supabase Bearer token attached
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const userSession = typeof window !== 'undefined'
    ? localStorage.getItem('campus_user_session') || localStorage.getItem('demo_user_profile')
    : null;

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  } else if (userSession) {
    headers['Authorization'] = 'Bearer campus-auth-token';
  }

  // Pass user identity headers for development / demo requests
  if (userSession) {
    try {
      const parsed = JSON.parse(userSession);
      headers['x-user-id'] = parsed.id;
      headers['x-user-role'] = parsed.role;
      headers['x-user-email'] = parsed.email;
      headers['x-user-name'] = parsed.name;
      headers['x-test-user-id'] = parsed.id;
      headers['x-test-role'] = parsed.role;
      headers['x-test-email'] = parsed.email;
      headers['x-test-name'] = parsed.name;
    } catch (e) {
      // ignore parse error
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    let errorMsg = data.message || `Request failed with status ${response.status}`;
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      const details = data.errors.map((e: any) => e.message || `${e.field}: invalid`).join('. ');
      errorMsg = details;
    }
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Issues
  async getIssues(params?: {
    status?: IssueStatus;
    priority?: IssuePriority;
    category?: IssueCategory;
    search?: string;
    scope?: 'assigned' | 'all';
  }): Promise<Issue[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.scope) query.append('scope', params.scope);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<{ success: boolean; data: Issue[] }>(`/issues${qs}`);
    return res.data;
  },

  async getIssueById(id: string): Promise<Issue> {
    const res = await apiFetch<{ success: boolean; data: Issue }>(`/issues/${id}`);
    return res.data;
  },

  async createIssue(payload: {
    title: string;
    description: string;
    category: IssueCategory;
    priority: IssuePriority;
    location: string;
  }): Promise<Issue> {
    const res = await apiFetch<{ success: boolean; data: Issue }>('/issues', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateIssue(
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      category: IssueCategory;
      priority: IssuePriority;
      location: string;
    }>
  ): Promise<Issue> {
    const res = await apiFetch<{ success: boolean; data: Issue }>(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateStatus(id: string, status: IssueStatus): Promise<Issue> {
    const res = await apiFetch<{ success: boolean; data: Issue }>(`/issues/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  async assignIssue(id: string, assignedTo: string | null): Promise<Issue> {
    const res = await apiFetch<{ success: boolean; data: Issue }>(`/issues/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assigned_to: assignedTo }),
    });
    return res.data;
  },

  async deleteIssue(id: string): Promise<void> {
    await apiFetch<{ success: boolean }>(`/issues/${id}`, {
      method: 'DELETE',
    });
  },

  // Comments
  async getComments(issueId: string): Promise<Comment[]> {
    const res = await apiFetch<{ success: boolean; data: Comment[] }>(
      `/issues/${issueId}/comments`
    );
    return res.data;
  },

  async addComment(issueId: string, comment: string): Promise<Comment> {
    const res = await apiFetch<{ success: boolean; data: Comment }>(
      `/issues/${issueId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ comment }),
      }
    );
    return res.data;
  },

  // History
  async getHistory(issueId: string): Promise<IssueHistory[]> {
    const res = await apiFetch<{ success: boolean; data: IssueHistory[] }>(
      `/issues/${issueId}/history`
    );
    return res.data;
  },

  // Dashboard Stats
  async getStatistics(): Promise<DashboardStatistics> {
    const res = await apiFetch<{ success: boolean; data: DashboardStatistics }>(
      '/dashboard/statistics'
    );
    return res.data;
  },

  // Staff members directory
  async getStaffUsers(): Promise<Profile[]> {
    const res = await apiFetch<{ success: boolean; data: Profile[] }>('/users/staff');
    return res.data;
  },

  // Sync user profile to backend registry
  async syncUser(profile: Profile): Promise<void> {
    await apiFetch('/users/sync', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  // Full Campus Directory (Staff & Students)
  async getDirectory(): Promise<{
    staff: Profile[];
    students: Profile[];
    admins: Profile[];
    total: number;
  }> {
    const res = await apiFetch<{
      success: boolean;
      data: {
        staff: Profile[];
        students: Profile[];
        admins: Profile[];
        total: number;
      };
    }>('/users/directory');
    return res.data;
  },
};
