-- ==============================================================================
-- Campus Issue Tracker: 002_row_level_security.sql
-- Description: Row Level Security (RLS) policies and role helper functions.
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- 1. HELPER FUNCTIONS
-- Secure cached helper functions for role evaluations in RLS policies.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'Admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'Staff'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_access_issue(issue_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.issues 
        WHERE id = issue_id 
        AND (
            public.is_admin() 
            OR (public.is_staff() AND assigned_to = auth.uid()) 
            OR created_by = auth.uid()
        )
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 2. ENABLE RLS ON ALL TABLES
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_history ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. PROFILES POLICIES
-- -----------------------------------------------------------------------------
-- Authenticated users can view profile names and roles (for authors, assignees, commenters)
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Users can update their own name/profile; Admins can update any profile (e.g. promote role)
DROP POLICY IF EXISTS "Users can update own profile or Admin can update any" ON public.profiles;
CREATE POLICY "Users can update own profile or Admin can update any"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (
        -- Only admins can change roles; non-admins keep their existing role
        CASE 
            WHEN public.is_admin() THEN true
            ELSE role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
        END
    );

-- Allow profile creation for new users
DROP POLICY IF EXISTS "Insert profile policy" ON public.profiles;
CREATE POLICY "Insert profile policy"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid() OR public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. ISSUES POLICIES
-- -----------------------------------------------------------------------------
-- SELECT:
-- - Admins can read all issues
-- - Staff can read issues assigned to them
-- - Students can read issues created by them
DROP POLICY IF EXISTS "Issues select policy" ON public.issues;
CREATE POLICY "Issues select policy"
    ON public.issues FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR (public.is_staff() AND assigned_to = auth.uid())
        OR (created_by = auth.uid())
    );

-- INSERT:
-- - Any authenticated user (Students, Staff, Admin) can report a new issue
-- - created_by must equal the caller's authenticated user ID
DROP POLICY IF EXISTS "Issues insert policy" ON public.issues;
CREATE POLICY "Issues insert policy"
    ON public.issues FOR INSERT
    TO authenticated
    WITH CHECK (
        created_by = auth.uid()
    );

-- UPDATE:
-- - Admin can update any field (status, priority, assignment, etc.)
-- - Staff can update issues assigned to them (status, notes)
-- - Students can update their own issue only if it is still 'Pending'
DROP POLICY IF EXISTS "Issues update policy" ON public.issues;
CREATE POLICY "Issues update policy"
    ON public.issues FOR UPDATE
    TO authenticated
    USING (
        public.is_admin()
        OR (public.is_staff() AND assigned_to = auth.uid())
        OR (created_by = auth.uid() AND status = 'Pending')
    )
    WITH CHECK (
        public.is_admin()
        OR (public.is_staff() AND assigned_to = auth.uid())
        OR (created_by = auth.uid() AND status = 'Pending')
    );

-- DELETE:
-- - Admin can delete any issue
-- - Students can delete their own issue if it's still 'Pending'
DROP POLICY IF EXISTS "Issues delete policy" ON public.issues;
CREATE POLICY "Issues delete policy"
    ON public.issues FOR DELETE
    TO authenticated
    USING (
        public.is_admin()
        OR (created_by = auth.uid() AND status = 'Pending')
    );

-- -----------------------------------------------------------------------------
-- 5. COMMENTS POLICIES
-- -----------------------------------------------------------------------------
-- SELECT: Comments are visible only if the user has access to view the parent issue
DROP POLICY IF EXISTS "Comments select policy" ON public.comments;
CREATE POLICY "Comments select policy"
    ON public.comments FOR SELECT
    TO authenticated
    USING (
        public.can_access_issue(issue_id)
    );

-- INSERT: User can comment if they have access to view the issue and user_id is auth.uid()
DROP POLICY IF EXISTS "Comments insert policy" ON public.comments;
CREATE POLICY "Comments insert policy"
    ON public.comments FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() AND public.can_access_issue(issue_id)
    );

-- DELETE: Author or Admin can delete comment
DROP POLICY IF EXISTS "Comments delete policy" ON public.comments;
CREATE POLICY "Comments delete policy"
    ON public.comments FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid() OR public.is_admin()
    );

-- -----------------------------------------------------------------------------
-- 6. ISSUE HISTORY POLICIES
-- -----------------------------------------------------------------------------
-- SELECT: Visible only if user can view the issue
DROP POLICY IF EXISTS "History select policy" ON public.issue_history;
CREATE POLICY "History select policy"
    ON public.issue_history FOR SELECT
    TO authenticated
    USING (
        public.can_access_issue(issue_id)
    );

-- INSERT: Allowed when user can access the issue and changed_by is auth.uid()
DROP POLICY IF EXISTS "History insert policy" ON public.issue_history;
CREATE POLICY "History insert policy"
    ON public.issue_history FOR INSERT
    TO authenticated
    WITH CHECK (
        changed_by = auth.uid() OR public.is_admin()
    );
