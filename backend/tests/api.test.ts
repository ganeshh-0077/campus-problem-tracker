import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// Mock Supabase admin client so tests run independently of external database availability
vi.mock('../src/utils/supabaseClient', () => {
  const mockIssues: any[] = [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      title: 'Lab 3 PC #14 Blue Screen of Death',
      description: 'Computer crashes into a bluescreen error code.',
      category: 'Computer',
      priority: 'High',
      status: 'Pending',
      location: 'Science Building Room 304',
      created_by: 'c0000000-0000-0000-0000-000000000001',
      assigned_to: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: {
        id: 'c0000000-0000-0000-0000-000000000001',
        name: 'Alex Student',
        email: 'alex.student@campus.edu',
        role: 'Student',
      },
    },
  ];

  const mockProfiles = [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Admin User',
      email: 'admin@campus.edu',
      role: 'Admin',
    },
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: 'James Staff',
      email: 'staff@campus.edu',
      role: 'Staff',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Alex Student',
      email: 'alex.student@campus.edu',
      role: 'Student',
    },
  ];

  const mockAdmin = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn((table: string) => {
      const queryObj: any = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn((payload: any) => ({
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'd9999999-0000-0000-0000-000000000001',
              ...payload,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        })),
        update: vi.fn((updates: any) => ({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...mockIssues[0], ...updates },
              error: null,
            }),
          }),
        })),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          if (table === 'issues') {
            return Promise.resolve({ data: mockIssues[0], error: null });
          }
          if (table === 'profiles') {
            return Promise.resolve({ data: mockProfiles[0], error: null });
          }
          return Promise.resolve({ data: null, error: null });
        }),
      };

      // Handle resolving list queries
      queryObj.then = (resolve: any) => {
        if (table === 'issues') {
          return resolve({ data: mockIssues, error: null });
        }
        if (table === 'profiles') {
          return resolve({ data: mockProfiles, error: null });
        }
        return resolve({ data: [], error: null });
      };

      return queryObj;
    }),
  };

  return {
    supabaseAdmin: mockAdmin,
    getSupabaseUserClient: vi.fn(() => mockAdmin),
    hasServiceRoleKey: false,
  };
});

describe('Campus Issue Tracker Backend API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Health Check Endpoint', () => {
    it('GET /api/health should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('Authentication & Authorization Guards', () => {
    it('GET /api/issues should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/issues');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication required');
    });

    it('PUT /api/issues/:id/assign should reject non-admin users with 403', async () => {
      const res = await request(app)
        .put('/api/issues/d0000000-0000-0000-0000-000000000001/assign')
        .set('x-test-user-id', 'c0000000-0000-0000-0000-000000000001')
        .set('x-test-role', 'Student')
        .send({ assigned_to: 'b0000000-0000-0000-0000-000000000001' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });
  });

  describe('Input Validation', () => {
    it('POST /api/issues should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/issues')
        .set('x-test-user-id', 'c0000000-0000-0000-0000-000000000001')
        .set('x-test-role', 'Student')
        .send({
          title: 'Hi', // too short (< 5 chars)
          description: 'Short', // too short (< 10 chars)
          category: 'InvalidCategory',
          location: 'Lab',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toBeDefined();
    });

    it('GET /api/issues/:id with invalid UUID should return 400', async () => {
      const res = await request(app)
        .get('/api/issues/not-a-uuid')
        .set('x-test-user-id', 'c0000000-0000-0000-0000-000000000001')
        .set('x-test-role', 'Student');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Issue Operations', () => {
    it('POST /api/issues should create an issue successfully when valid', async () => {
      const newIssue = {
        title: 'Projector not displaying HDMI signal',
        description: 'Auditorium projector shows blue screen when connecting laptop HDMI.',
        category: 'Classroom',
        priority: 'High',
        location: 'Auditorium C, 1st Floor',
      };

      const res = await request(app)
        .post('/api/issues')
        .set('x-test-user-id', 'c0000000-0000-0000-0000-000000000001')
        .set('x-test-role', 'Student')
        .send(newIssue);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(newIssue.title);
    });

    it('GET /api/issues should return list of issues for authenticated user', async () => {
      const res = await request(app)
        .get('/api/issues')
        .set('x-test-user-id', 'c0000000-0000-0000-0000-000000000001')
        .set('x-test-role', 'Student');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('PUT /api/issues/:id/status allows Admin to update issue status', async () => {
      const res = await request(app)
        .put('/api/issues/d0000000-0000-0000-0000-000000000001/status')
        .set('x-test-user-id', 'a0000000-0000-0000-0000-000000000001')
        .set('x-test-role', 'Admin')
        .send({ status: 'In Progress' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('In Progress');
    });

    it('PUT /api/issues/:id/status rejects Student trying to update status', async () => {
      const res = await request(app)
        .put('/api/issues/d0000000-0000-0000-0000-000000000001/status')
        .set('x-test-user-id', 'c0000000-0000-0000-0000-000000000001')
        .set('x-test-role', 'Student')
        .send({ status: 'Resolved' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Students are not permitted');
    });
  });

  describe('Comments', () => {
    it('POST /api/issues/:id/comments should reject empty comment with 400', async () => {
      const res = await request(app)
        .post('/api/issues/d0000000-0000-0000-0000-000000000001/comments')
        .set('x-test-user-id', 'c0000000-0000-0000-0000-000000000001')
        .set('x-test-role', 'Student')
        .send({ comment: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
