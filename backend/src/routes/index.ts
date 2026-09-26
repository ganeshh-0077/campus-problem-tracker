import { Router, Request, Response } from 'express';
import issueRoutes from './issueRoutes';
import dashboardRoutes from './dashboardRoutes';
import { authenticateUser, requireRole } from '../middleware/authMiddleware';
import { supabaseAdmin, hasServiceRoleKey } from '../utils/supabaseClient';
import { AuthenticatedRequest, Profile } from '../types';

const router = Router();

export const DEFAULT_USERS: Profile[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'James Wilson (IT Support Team)',
    email: 'james.staff@campus.edu',
    role: 'Staff',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Sarah Jenkins (Facilities Maintenance)',
    email: 'facilities@campus.edu',
    role: 'Staff',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'Robert Martinez (Electrical Systems)',
    email: 'robert.staff@campus.edu',
    role: 'Staff',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Alex Chen (Computer Science)',
    email: 'alex.student@campus.edu',
    role: 'Student',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Emily Watson (Engineering)',
    email: 'emily.student@campus.edu',
    role: 'Student',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'David Kim (Architecture)',
    email: 'david.student@campus.edu',
    role: 'Student',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Campus Operations Administrator',
    email: 'admin@campus.edu',
    role: 'Admin',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
];

export const DEFAULT_STAFF_MEMBERS: Profile[] = DEFAULT_USERS.filter((u) => u.role === 'Staff');

// In-memory registry of users added during application runtime
export const registeredUsers: Profile[] = [...DEFAULT_USERS];

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Campus Issue Tracker Backend',
  });
});

// Register / Sync user profile with backend
router.post('/users/sync', (req: Request, res: Response) => {
  const { id, name, email, role } = req.body;
  if (id && name && role) {
    const existingIndex = registeredUsers.findIndex((u) => u.id === id || u.email.toLowerCase() === (email || '').toLowerCase());
    const newProfile: Profile = {
      id,
      name,
      email: email || '',
      role,
      created_at: new Date().toISOString(),
    };
    if (existingIndex >= 0) {
      registeredUsers[existingIndex] = newProfile;
    } else {
      registeredUsers.push(newProfile);
    }
  }
  res.json({ success: true, message: 'User synced successfully' });
});

// Issues endpoints
router.use('/issues', issueRoutes);

// Dashboard endpoints
router.use('/dashboard', dashboardRoutes);

// Helper route for Admins to view staff members for issue assignment
router.get(
  '/users/staff',
  authenticateUser,
  requireRole(['Admin']),
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      if (hasServiceRoleKey) {
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('id, name, email, role')
          .in('role', ['Staff', 'Admin'])
          .order('name');

        if (!error && data && data.length > 0) {
          return res.json({
            success: true,
            data: data,
          });
        }
      }

      // Return staff & admin users from the registry
      const staffMembers = registeredUsers.filter((u) => u.role === 'Staff' || u.role === 'Admin');
      res.json({
        success: true,
        data: staffMembers.length > 0 ? staffMembers : DEFAULT_STAFF_MEMBERS,
      });
    } catch (err) {
      const staffMembers = registeredUsers.filter((u) => u.role === 'Staff' || u.role === 'Admin');
      res.json({
        success: true,
        data: staffMembers.length > 0 ? staffMembers : DEFAULT_STAFF_MEMBERS,
      });
    }
  }
);

// Route for Admins to view full Campus Directory (all Staff & Students)
router.get(
  '/users/directory',
  authenticateUser,
  requireRole(['Admin']),
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      let dbUsers: Profile[] = [];

      if (hasServiceRoleKey) {
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('id, name, email, role, created_at')
          .order('name');
        if (!error && data) {
          dbUsers = data;
        }
      }

      const map = new Map<string, Profile>();
      DEFAULT_USERS.forEach((u) => map.set(u.id, u));
      registeredUsers.forEach((u) => map.set(u.id, u));
      dbUsers.forEach((u) => map.set(u.id, u));

      const merged = Array.from(map.values());
      const staff = merged.filter((u) => u.role === 'Staff');
      const students = merged.filter((u) => u.role === 'Student');
      const admins = merged.filter((u) => u.role === 'Admin');

      res.json({
        success: true,
        data: {
          staff,
          students,
          admins,
          total: merged.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch directory' });
    }
  }
);

export default router;
