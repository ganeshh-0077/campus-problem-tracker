export type UserRole = 'Student' | 'Staff' | 'Admin';

export type IssueCategory =
  | 'Computer'
  | 'Internet'
  | 'Electricity'
  | 'Classroom'
  | 'Cleaning'
  | 'Furniture'
  | 'Other';

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Closed';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: string;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  assignee?: Profile | null;
}

export interface Comment {
  id: string;
  issue_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: Profile;
}

export interface IssueHistory {
  id: string;
  issue_id: string;
  changed_by: string;
  old_status: IssueStatus;
  new_status: IssueStatus;
  created_at: string;
  changer?: Profile;
}

export interface DashboardStatistics {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  critical: number;
  byCategory: Record<IssueCategory, number>;
  byPriority: Record<IssuePriority, number>;
}
