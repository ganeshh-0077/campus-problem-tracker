import { supabaseAdmin, hasServiceRoleKey } from '../utils/supabaseClient';
import {
  DashboardStatistics,
  Profile,
  IssueCategory,
  IssuePriority,
} from '../types';
import { memoryIssues } from './issueService';

export class DashboardService {
  /**
   * Computes dashboard statistics based on the authenticated user's role scope.
   */
  static async getStatistics(profile: Profile): Promise<DashboardStatistics> {
    let issues: any[] = [];

    if (!hasServiceRoleKey) {
      issues = this.getMemoryStatsIssues(profile);
    } else {
      try {
        let query = supabaseAdmin.from('issues').select('status, priority, category');

        if (profile.role === 'Student') {
          query = query.eq('created_by', profile.id);
        } else if (profile.role === 'Staff') {
          query = query.eq('assigned_to', profile.id);
        }

        const { data, error } = await query;

        if (error) {
          issues = this.getMemoryStatsIssues(profile);
        } else {
          issues = data || [];
        }
      } catch (err) {
        issues = this.getMemoryStatsIssues(profile);
      }
    }

    const stats: DashboardStatistics = {
      total: issues.length,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      critical: 0,
      byCategory: {
        Computer: 0,
        Internet: 0,
        Electricity: 0,
        Classroom: 0,
        Cleaning: 0,
        Furniture: 0,
        Other: 0,
      },
      byPriority: {
        Low: 0,
        Medium: 0,
        High: 0,
        Critical: 0,
      },
    };

    for (const item of issues) {
      if (item.status === 'Pending') stats.pending++;
      else if (item.status === 'In Progress') stats.inProgress++;
      else if (item.status === 'Resolved' || item.status === 'Closed') stats.resolved++;

      if (item.priority === 'Critical') stats.critical++;
      if (stats.byPriority[item.priority as IssuePriority] !== undefined) {
        stats.byPriority[item.priority as IssuePriority]++;
      }

      if (stats.byCategory[item.category as IssueCategory] !== undefined) {
        stats.byCategory[item.category as IssueCategory]++;
      }
    }

    return stats;
  }

  private static getMemoryStatsIssues(profile: Profile): any[] {
    let list = [...memoryIssues];
    if (profile.role === 'Student') {
      list = list.filter((i) => i.created_by === profile.id);
    } else if (profile.role === 'Staff') {
      list = list.filter((i) => i.assigned_to === profile.id);
    }
    return list;
  }
}
