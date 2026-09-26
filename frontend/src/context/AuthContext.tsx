import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string, expectedRole?: UserRole) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  created_at?: string;
}

export const DEFAULT_CAMPUS_ACCOUNTS: StoredAccount[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Alex Chen (Student)',
    email: 'alex.student@campus.edu',
    password: 'Password123!',
    role: 'Student',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'James Wilson (IT Staff)',
    email: 'james.staff@campus.edu',
    password: 'Password123!',
    role: 'Staff',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Elena Gomez (Facilities Staff)',
    email: 'facilities@campus.edu',
    password: 'Password123!',
    role: 'Staff',
    created_at: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Sarah Connor (Admin)',
    email: 'admin@campus.edu',
    password: 'Password123!',
    role: 'Admin',
    created_at: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Supabase profiles table
  const fetchProfile = async (userId: string, userMeta?: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        if (userMeta) {
          const userProf: Profile = {
            id: userId,
            name: userMeta.name || 'Campus User',
            email: userMeta.email || '',
            role: (userMeta.role as UserRole) || 'Student',
          };
          setProfile(userProf);
          localStorage.setItem('campus_user_session', JSON.stringify(userProf));
          api.syncUser(userProf).catch(() => {});
        }
      } else {
        setProfile(data as Profile);
        localStorage.setItem('campus_user_session', JSON.stringify(data));
        api.syncUser(data as Profile).catch(() => {});
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    // Clear legacy demo session to ensure user explicitly logs in
    localStorage.removeItem('demo_user_profile');

    // Check for active authenticated user session stored locally
    const savedSession = localStorage.getItem('campus_user_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession) as Profile;
        setProfile(parsed);
        setUser({
          id: parsed.id,
          email: parsed.email,
          user_metadata: { name: parsed.name, role: parsed.role },
        } as any);
        api.syncUser(parsed).catch(() => {});
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('campus_user_session');
      }
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Initialize Supabase Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.user_metadata);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.user_metadata);
      } else {
        const local = localStorage.getItem('campus_user_session');
        if (!local) {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, expectedRole?: UserRole) => {
    setLoading(true);

    // 1. Try Supabase Auth first
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          const userRole = (data.user.user_metadata?.role as UserRole) || 'Student';
          if (expectedRole && userRole !== expectedRole) {
            setLoading(false);
            throw new Error(
              `This account is registered as ${userRole}. Please click "Change Role" and select the ${userRole} portal.`
            );
          }

          const userProf: Profile = {
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split('@')[0],
            email: data.user.email || email,
            role: userRole,
          };
          setProfile(userProf);
          setUser(data.user);
          localStorage.setItem('campus_user_session', JSON.stringify(userProf));
          await api.syncUser(userProf).catch(() => {});
          setLoading(false);
          return;
        }
      } catch (e: any) {
        if (e.message && e.message.includes('Please click "Change Role"')) {
          setLoading(false);
          throw e;
        }
        // Fallback to local accounts check
      }
    }

    // 2. Check registered campus accounts & pre-seeded demo accounts
    let accounts: StoredAccount[] = [...DEFAULT_CAMPUS_ACCOUNTS];
    const registeredRaw = localStorage.getItem('campus_registered_users');
    if (registeredRaw) {
      try {
        const userSaved: StoredAccount[] = JSON.parse(registeredRaw);
        accounts = [
          ...userSaved,
          ...accounts.filter(
            (d) => !userSaved.some((u) => u.email.toLowerCase() === d.email.toLowerCase())
          ),
        ];
      } catch (e) {
        // parse error
      }
    }

    const match = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (match) {
      if (expectedRole && match.role !== expectedRole) {
        setLoading(false);
        throw new Error(
          `This account is registered as ${match.role}. Please click "Change Role" and select the ${match.role} portal.`
        );
      }

      const userProf: Profile = {
        id: match.id,
        name: match.name,
        email: match.email,
        role: match.role,
        created_at: match.created_at,
      };
      setProfile(userProf);
      setUser({
        id: userProf.id,
        email: userProf.email,
        user_metadata: { name: userProf.name, role: userProf.role },
      } as any);
      localStorage.setItem('campus_user_session', JSON.stringify(userProf));
      await api.syncUser(userProf).catch(() => {});
      setLoading(false);
      return;
    }

    setLoading(false);
    throw new Error('Invalid email or password. Please verify credentials or switch to the Sign Up tab.');
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    setLoading(true);

    const generatedId = `u${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const newProfile: Profile = {
      id: generatedId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      created_at: new Date().toISOString(),
    };

    // Save account locally
    const registeredRaw = localStorage.getItem('campus_registered_users');
    let accounts: StoredAccount[] = [];
    try {
      if (registeredRaw) accounts = JSON.parse(registeredRaw);
    } catch (e) {
      accounts = [];
    }

    // Avoid duplicate email
    accounts = accounts.filter((a) => a.email.toLowerCase() !== newProfile.email);
    accounts.push({
      ...newProfile,
      password,
    });
    localStorage.setItem('campus_registered_users', JSON.stringify(accounts));
    localStorage.setItem('campus_user_session', JSON.stringify(newProfile));

    // Also register in Supabase Auth if connected
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signUp({
          email: newProfile.email,
          password,
          options: {
            data: {
              name: newProfile.name,
              role: newProfile.role,
            },
          },
        });
      } catch (e) {
        // If Supabase requires email verification or tables are pending, local account is already secured
      }
    }

    // Notify backend
    await api.syncUser(newProfile).catch(() => {});

    setProfile(newProfile);
    setUser({
      id: newProfile.id,
      email: newProfile.email,
      user_metadata: { name: newProfile.name, role: newProfile.role },
    } as any);

    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem('campus_user_session');
    localStorage.removeItem('demo_user_profile');
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      role: profile?.role ?? null,
      loading,
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
    }),
    [user, profile, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
