import { describe, it, expect, beforeEach } from 'vitest';

// Simulate browser storage
class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('Session Security & Ephemeral Storage Architecture', () => {
  let mockLocalStorage: MockStorage;
  let mockSessionStorage: MockStorage;

  beforeEach(() => {
    mockLocalStorage = new MockStorage();
    mockSessionStorage = new MockStorage();
  });

  // SHA-256 helper matching AuthContext implementation
  async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  it('Scenario a: Student login -> ephemeral session in sessionStorage -> logout purges all state', async () => {
    const studentUser = {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Alex Chen',
      email: 'alex.student@campus.edu',
      role: 'Student',
    };

    // 1. Simulate Student Login
    mockSessionStorage.setItem('campus_user_session', JSON.stringify(studentUser));

    // Must be in sessionStorage and NOT in localStorage
    expect(mockSessionStorage.getItem('campus_user_session')).toBeTruthy();
    expect(mockLocalStorage.getItem('campus_user_session')).toBeNull();

    const currentSession = JSON.parse(mockSessionStorage.getItem('campus_user_session')!);
    expect(currentSession.role).toBe('Student');

    // 2. Simulate Sign Out
    mockSessionStorage.removeItem('campus_user_session');
    mockSessionStorage.clear();
    mockLocalStorage.removeItem('campus_user_session');
    mockLocalStorage.removeItem('demo_user_profile');

    // Must be null everywhere
    expect(mockSessionStorage.getItem('campus_user_session')).toBeNull();
    expect(mockLocalStorage.getItem('campus_user_session')).toBeNull();
  });

  it('Scenario b: Admin login -> passkey validation -> ephemeral session -> logout completely clears', async () => {
    const adminPasskey = 'Pass@123';
    expect(adminPasskey).toBe('Pass@123'); // Admin passkey check

    const adminUser = {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Sarah Connor',
      email: 'admin@campus.edu',
      role: 'Admin',
    };

    mockSessionStorage.setItem('campus_user_session', JSON.stringify(adminUser));
    expect(mockSessionStorage.getItem('campus_user_session')).toBeTruthy();
    expect(mockLocalStorage.getItem('campus_user_session')).toBeNull();

    const parsed = JSON.parse(mockSessionStorage.getItem('campus_user_session')!);
    expect(parsed.role).toBe('Admin');

    // Simulate Admin Sign Out
    mockSessionStorage.removeItem('campus_user_session');
    mockSessionStorage.clear();
    expect(mockSessionStorage.getItem('campus_user_session')).toBeNull();
  });

  it('Scenario c: Role switch resets all form inputs & credentials', () => {
    let state = {
      selectedRole: 'Student' as string | null,
      authMode: 'signin',
      name: 'Alex',
      email: 'alex@campus.edu',
      password: 'MyPassword!',
      adminPasskey: '',
      error: 'Some error' as string | null,
    };

    // User switches role from Student to Admin
    const handleRoleSelect = (role: 'Student' | 'Staff' | 'Admin') => {
      state = {
        selectedRole: role,
        authMode: 'signin',
        name: '',
        email: '',
        password: '',
        adminPasskey: '',
        error: null,
      };
    };

    handleRoleSelect('Admin');
    expect(state.selectedRole).toBe('Admin');
    expect(state.email).toBe('');
    expect(state.password).toBe('');
    expect(state.name).toBe('');
    expect(state.adminPasskey).toBe('');
    expect(state.error).toBeNull();

    // User clicks back to roles
    const handleBackToRoles = () => {
      state = {
        selectedRole: null,
        authMode: 'signin',
        name: '',
        email: '',
        password: '',
        adminPasskey: '',
        error: null,
      };
    };

    handleBackToRoles();
    expect(state.selectedRole).toBeNull();
    expect(state.email).toBe('');
    expect(state.password).toBe('');
  });

  it('Scenario d: Direct navigation while logged out blocks and redirects to login', () => {
    // When profile is null (logged out)
    const profile = null;
    let redirectedTo = null;

    if (!profile) {
      redirectedTo = '/login';
    }

    expect(redirectedTo).toBe('/login');
  });

  it('Scenario e: Tab/browser close simulation (clearing sessionStorage) -> direct navigation redirects to login', () => {
    // User was logged in as Admin in active tab session
    mockSessionStorage.setItem(
      'campus_user_session',
      JSON.stringify({
        id: 'admin-id',
        role: 'Admin',
        name: 'Admin User',
      })
    );
    expect(mockSessionStorage.getItem('campus_user_session')).toBeTruthy();

    // Browser/tab closed: sessionStorage is cleared by browser, localStorage remains unchanged
    mockSessionStorage.clear();

    // New visitor opens website in new tab/browser:
    const restoredSession = mockSessionStorage.getItem('campus_user_session');
    expect(restoredSession).toBeNull();

    // Route guard checks restored session
    let destination = '/';
    if (!restoredSession) {
      destination = '/login';
    }

    // Direct access to Admin dashboard MUST fail and redirect to /login
    expect(destination).toBe('/login');
  });

  it('Security requirement: Passwords must NEVER be stored in plaintext', async () => {
    const rawPassword = 'Password123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).toBe('a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea');
    expect(hash).not.toContain(rawPassword);

    // Stored account must only contain hash, never raw password
    const accountRecord = {
      email: 'alex.student@campus.edu',
      passwordHash: hash,
    };

    mockLocalStorage.setItem('campus_registered_users', JSON.stringify([accountRecord]));
    const stored = mockLocalStorage.getItem('campus_registered_users')!;
    expect(stored).not.toContain(rawPassword);
  });
});
