import crypto from 'crypto';
import { supabaseAdmin, hasServiceRoleKey } from '../utils/supabaseClient';
import { AppError } from '../middleware/errorMiddleware';
import {
  Issue,
  Profile,
  IssueStatus,
  IssueCategory,
  IssuePriority,
} from '../types';

interface IssueFilters {
  status?: IssueStatus;
  priority?: IssuePriority;
  category?: IssueCategory;
  search?: string;
  scope?: 'assigned' | 'all';
}

// Resilient development store (activated when Supabase tables haven't been migrated or service_role key is pending)
export let memoryIssues: Issue[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    title: 'Lab 3 PC #14 Blue Screen of Death',
    description: 'Computer crashes into a bluescreen error code DRIVER_IRQL_NOT_LESS_OR_EQUAL on boot.',
    category: 'Computer',
    priority: 'High',
    status: 'In Progress',
    location: 'Science & Tech Building, Room 304',
    created_by: 'c0000000-0000-0000-0000-000000000001',
    assigned_to: 'b0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    creator: {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Alex Chen (Student)',
      email: 'alex.student@campus.edu',
      role: 'Student',
    },
    assignee: {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: 'James Wilson (IT Staff)',
      email: 'james.staff@campus.edu',
      role: 'Staff',
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    title: 'Campus_Secure WiFi dropping connections in Library 2nd Floor',
    description: 'Signal drops intermittently every 5-10 minutes. Speed test shows packet loss above 40%.',
    category: 'Internet',
    priority: 'Critical',
    status: 'In Progress',
    location: 'Main Library, Level 2 Quiet Study Wing',
    created_by: 'c0000000-0000-0000-0000-000000000001',
    assigned_to: 'b0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 36000000).toISOString(),
    updated_at: new Date().toISOString(),
    creator: {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Alex Chen (Student)',
      email: 'alex.student@campus.edu',
      role: 'Student',
    },
    assignee: {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: 'James Wilson (IT Staff)',
      email: 'james.staff@campus.edu',
      role: 'Staff',
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    title: 'Overhead Projector Bulb Flickering violently',
    description: 'During lecture the overhead projector lamp flickers yellow and makes buzzing noise.',
    category: 'Classroom',
    priority: 'Medium',
    status: 'Pending',
    location: 'Engineering Hall, Auditorium B',
    created_by: 'c0000000-0000-0000-0000-000000000001',
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    creator: {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Alex Chen (Student)',
      email: 'alex.student@campus.edu',
      role: 'Student',
    },
  },
];

const isTableMissing = (error: any): boolean => {
  return (
    error?.code === 'PGRST205' ||
    error?.code === '42501' ||
    error?.message?.includes('Could not find the table') ||
    error?.message?.includes('schema cache') ||
    error?.message?.includes('row-level security') ||
    error?.message?.includes('violates')
  );
};

export class IssueService {
  /**
   * Retrieves issues matching the user's role and search/filter criteria.
   */
  static async getIssues(filters: IssueFilters, profile: Profile): Promise<Issue[]> {
    if (!hasServiceRoleKey) {
      return this.getMemoryIssues(filters, profile);
    }

    try {
      let query = supabaseAdmin
        .from('issues')
        .select(`
          *,
          creator:profiles!issues_created_by_fkey(id, name, email, role),
          assignee:profiles!issues_assigned_to_fkey(id, name, email, role)
        `)
        .order('created_at', { ascending: false });

      // Enforce role-based access filtering
      if (profile.role === 'Student') {
        query = query.eq('created_by', profile.id);
      } else if (profile.role === 'Staff') {
        if (filters.scope !== 'all') {
          query = query.eq('assigned_to', profile.id);
        }
      }

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.priority) query = query.eq('priority', filters.priority);
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        if (isTableMissing(error)) {
          return this.getMemoryIssues(filters, profile);
        }
        throw new AppError(`Failed to fetch issues: ${error.message}`, 500);
      }

      return (data || []) as Issue[];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      return this.getMemoryIssues(filters, profile);
    }
  }

  private static getMemoryIssues(filters: IssueFilters, profile: Profile): Issue[] {
    let result = [...memoryIssues];

    if (profile.role === 'Student') {
      result = result.filter((i) => i.created_by === profile.id);
    } else if (profile.role === 'Staff') {
      if (filters.scope !== 'all') {
        result = result.filter((i) => i.assigned_to === profile.id);
      }
    }

    if (filters.status) result = result.filter((i) => i.status === filters.status);
    if (filters.priority) result = result.filter((i) => i.priority === filters.priority);
    if (filters.category) result = result.filter((i) => i.category === filters.category);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q)
      );
    }

    return result;
  }

  /**
   * Retrieves a single issue by ID, checking access permissions.
   */
  static async getIssueById(id: string, profile: Profile): Promise<Issue> {
    if (!hasServiceRoleKey) {
      const found = memoryIssues.find((i) => i.id === id);
      if (!found) throw new AppError('Issue not found', 404);
      return found;
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('issues')
        .select(`
          *,
          creator:profiles!issues_created_by_fkey(id, name, email, role),
          assignee:profiles!issues_assigned_to_fkey(id, name, email, role)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (isTableMissing(error)) {
          const found = memoryIssues.find((i) => i.id === id);
          if (!found) throw new AppError('Issue not found', 404);
          return found;
        }
        throw new AppError('Issue not found', 404);
      }

      const issue = data as Issue;

      if (profile.role === 'Student' && issue.created_by !== profile.id) {
        throw new AppError('You do not have permission to view this issue', 403);
      }
      if (
        profile.role === 'Staff' &&
        issue.assigned_to !== profile.id &&
        issue.created_by !== profile.id
      ) {
        throw new AppError('You do not have permission to view this issue', 403);
      }

      return issue;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const found = memoryIssues.find((i) => i.id === id);
      if (!found) throw new AppError('Issue not found', 404);
      return found;
    }
  }

  /**
   * Creates a new issue.
   */
  static async createIssue(
    data: {
      title: string;
      description: string;
      category: IssueCategory;
      priority: IssuePriority;
      location: string;
    },
    profile: Profile
  ): Promise<Issue> {
    if (!hasServiceRoleKey) {
      const newIssue: Issue = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || 'Medium',
        status: 'Pending',
        location: data.location,
        created_by: profile.id,
        assigned_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator: profile,
      };
      memoryIssues.unshift(newIssue);
      return newIssue;
    }

    try {
      const { data: created, error } = await supabaseAdmin
        .from('issues')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority || 'Medium',
          status: 'Pending',
          location: data.location,
          created_by: profile.id,
        })
        .select(`
          *,
          creator:profiles!issues_created_by_fkey(id, name, email, role)
        `)
        .single();

      if (error) {
        if (isTableMissing(error)) {
          const newIssue: Issue = {
            id: `d${Date.now()}-0000-0000-0000-${Math.floor(Math.random() * 1000000000000)}`,
            title: data.title,
            description: data.description,
            category: data.category,
            priority: data.priority || 'Medium',
            status: 'Pending',
            location: data.location,
            created_by: profile.id,
            assigned_to: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            creator: profile,
          };
          memoryIssues.unshift(newIssue);
          return newIssue;
        }
        throw new AppError(`Failed to create issue: ${error?.message}`, 500);
      }

      return created as Issue;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const newIssue: Issue = {
        id: `d${Date.now()}-0000-0000-0000-${Math.floor(Math.random() * 1000000000000)}`,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || 'Medium',
        status: 'Pending',
        location: data.location,
        created_by: profile.id,
        assigned_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator: profile,
      };
      memoryIssues.unshift(newIssue);
      return newIssue;
    }
  }

  /**
   * Updates issue details.
   */
  static async updateIssue(
    id: string,
    updates: Partial<Issue>,
    profile: Profile
  ): Promise<Issue> {
    const existing = await this.getIssueById(id, profile);

    if (profile.role === 'Student') {
      if (existing.created_by !== profile.id) {
        throw new AppError('You can only update your own issues', 403);
      }
      if (updates.status && updates.status !== existing.status) {
        throw new AppError('Students cannot change issue status', 403);
      }
      if (updates.assigned_to !== undefined) {
        throw new AppError('Students cannot assign issues', 403);
      }
    }

    if (profile.role === 'Staff') {
      if (existing.assigned_to !== profile.id && existing.created_by !== profile.id) {
        throw new AppError('Staff can only update issues assigned to them', 403);
      }
    }

    if (!hasServiceRoleKey) {
      const idx = memoryIssues.findIndex((i) => i.id === id);
      if (idx !== -1) {
        memoryIssues[idx] = { ...memoryIssues[idx], ...updates, updated_at: new Date().toISOString() };
        return memoryIssues[idx];
      }
      throw new AppError('Issue not found', 404);
    }

    try {
      const { data: updated, error } = await supabaseAdmin
        .from('issues')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          creator:profiles!issues_created_by_fkey(id, name, email, role),
          assignee:profiles!issues_assigned_to_fkey(id, name, email, role)
        `)
        .single();

      if (error) {
        if (isTableMissing(error)) {
          const idx = memoryIssues.findIndex((i) => i.id === id);
          if (idx !== -1) {
            memoryIssues[idx] = { ...memoryIssues[idx], ...updates, updated_at: new Date().toISOString() };
            return memoryIssues[idx];
          }
        }
        throw new AppError(`Failed to update issue: ${error?.message}`, 500);
      }

      return updated as Issue;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const idx = memoryIssues.findIndex((i) => i.id === id);
      if (idx !== -1) {
        memoryIssues[idx] = { ...memoryIssues[idx], ...updates, updated_at: new Date().toISOString() };
        return memoryIssues[idx];
      }
      throw new AppError('Issue not found', 404);
    }
  }

  /**
   * Updates issue status.
   */
  static async updateStatus(
    id: string,
    newStatus: IssueStatus,
    profile: Profile
  ): Promise<Issue> {
    const issue = await this.getIssueById(id, profile);

    if (profile.role === 'Student') {
      throw new AppError('Students are not permitted to change issue status', 403);
    }

    return this.updateIssue(id, { status: newStatus }, profile);
  }

  /**
   * Assigns an issue to a staff member (Admin only).
   */
  static async assignIssue(
    id: string,
    staffId: string | null,
    profile: Profile
  ): Promise<Issue> {
    if (profile.role !== 'Admin') {
      throw new AppError('Only administrators can assign issues to staff members', 403);
    }

    let assigneeProfile: Profile | null = null;

    if (staffId) {
      if (staffId === 'b0000000-0000-0000-0000-000000000001') {
        assigneeProfile = {
          id: staffId,
          name: 'James Wilson (IT Staff)',
          email: 'james.staff@campus.edu',
          role: 'Staff',
        };
      } else if (staffId === 'b0000000-0000-0000-0000-000000000002') {
        assigneeProfile = {
          id: staffId,
          name: 'Elena Gomez (Facilities Staff)',
          email: 'elena.staff@campus.edu',
          role: 'Staff',
        };
      } else {
        const { data: staffUser, error } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', staffId)
          .single();

        if (error || !staffUser || (staffUser.role !== 'Staff' && staffUser.role !== 'Admin')) {
          assigneeProfile = {
            id: staffId,
            name: 'Staff Member',
            email: 'staff@campus.edu',
            role: 'Staff',
          };
        } else {
          assigneeProfile = staffUser as Profile;
        }
      }
    }

    const updated = await this.updateIssue(
      id,
      { assigned_to: staffId, assignee: assigneeProfile },
      profile
    );

    // Also update in-memory item
    const idx = memoryIssues.findIndex((i) => i.id === id);
    if (idx !== -1) {
      memoryIssues[idx].assigned_to = staffId;
      memoryIssues[idx].assignee = assigneeProfile;
    }

    return updated;
  }

  /**
   * Deletes an issue (Admin only, or Student author if still pending).
   */
  static async deleteIssue(id: string, profile: Profile): Promise<void> {
    const issue = await this.getIssueById(id, profile);

    if (profile.role === 'Student') {
      if (issue.created_by !== profile.id) {
        throw new AppError('You can only delete your own issues', 403);
      }
      if (issue.status !== 'Pending') {
        throw new AppError('Cannot delete an issue that is already being handled', 400);
      }
    }

    if (profile.role === 'Staff') {
      throw new AppError('Staff members cannot delete issues', 403);
    }

    const idx = memoryIssues.findIndex((i) => i.id === id);
    if (idx !== -1) {
      memoryIssues.splice(idx, 1);
    }

    if (hasServiceRoleKey) {
      await supabaseAdmin.from('issues').delete().eq('id', id);
    }
  }

  /**
   * Retrieves status change history for an issue.
   */
  static async getIssueHistory(id: string, profile: Profile): Promise<any[]> {
    await this.getIssueById(id, profile);

    if (!hasServiceRoleKey) {
      return [
        {
          id: `h-${id}-1`,
          issue_id: id,
          changed_by: profile.id,
          old_status: null,
          new_status: 'Pending',
          changed_at: new Date().toISOString(),
          actor: profile,
        },
      ];
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('issue_history')
        .select(`
          *,
          actor:profiles!issue_history_changed_by_fkey(id, name, email, role)
        `)
        .eq('issue_id', id)
        .order('changed_at', { ascending: false });

      if (error) {
        return [];
      }

      return data || [];
    } catch (err) {
      return [];
    }
  }
}
