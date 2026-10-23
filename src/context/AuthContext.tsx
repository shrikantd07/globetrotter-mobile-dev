import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { UserProfile } from '../types/travel';
import { StorageService, DEFAULT_USER_PROFILE } from '../services/storage';
import { getSupabaseClient, getSupabaseCredentials } from '../lib/supabase';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseActive: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, displayName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  loginAsDemo: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      StorageService.initLocalStorage();
      const supabase = getSupabaseClient();
      const { isConfigured } = getSupabaseCredentials();
      setIsSupabaseActive(isConfigured && Boolean(supabase));

      if (supabase && isConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            const p = await StorageService.getProfile(session.user.id);
            setProfile(p);
            setIsLoading(false);
            return;
          }

          // Listen for auth state changes
          supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user && mounted) {
              setUser({ id: session.user.id, email: session.user.email || '' });
              const p = await StorageService.getProfile(session.user.id);
              setProfile(p);
            } else if (mounted) {
              // Stay in current state or reset
            }
          });
        } catch (e) {
          console.warn('Supabase auth session error, checking local session', e);
        }
      }

      // Check persistent local user session
      const savedUser = localStorage.getItem('gt_auth_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          const p = await StorageService.getProfile(parsed.id);
          setProfile(p);
        } catch {
          setUser(null);
          setProfile(null);
        }
      } else {
        // Unauthenticated by default until user signs in or logs in as demo
        setUser(null);
        setProfile(null);
      }

      if (mounted) setIsLoading(false);
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || '' });
          const p = await StorageService.getProfile(data.user.id);
          setProfile(p);
          localStorage.setItem('gt_auth_user', JSON.stringify({ id: data.user.id, email: data.user.email }));
          setIsLoading(false);
          return {};
        }
      } catch (err: any) {
        setIsLoading(false);
        return { error: err?.message || 'Failed to sign in via Supabase.' };
      }
    }

    // Local authentication fallback
    const id = `user-${email.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'traveler'}`;
    const userObj = { id, email };
    setUser(userObj);
    localStorage.setItem('gt_auth_user', JSON.stringify(userObj));

    let p = await StorageService.getProfile(id);
    if (!p || p.id !== id) {
      p = {
        ...DEFAULT_USER_PROFILE,
        id,
        email,
        displayName: email.split('@')[0].replace('.', ' '),
      };
      await StorageService.updateProfile(p);
    }
    setProfile(p);
    setIsLoading(false);
    return {};
  };

  const signUp = async (email: string, password?: string, displayName?: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split('@')[0] }
          }
        });
        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || '' });
          const p = {
            ...DEFAULT_USER_PROFILE,
            id: data.user.id,
            email,
            displayName: displayName || email.split('@')[0],
          };
          await StorageService.updateProfile(p);
          setProfile(p);
          localStorage.setItem('gt_auth_user', JSON.stringify({ id: data.user.id, email: data.user.email }));
          setIsLoading(false);
          return {};
        }
      } catch (err: any) {
        setIsLoading(false);
        return { error: err?.message || 'Failed to sign up via Supabase.' };
      }
    }

    // Local signup
    const id = `user-${Date.now().toString(36)}`;
    const userObj = { id, email };
    setUser(userObj);
    localStorage.setItem('gt_auth_user', JSON.stringify(userObj));

    const p: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id,
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    await StorageService.updateProfile(p);
    setProfile(p);
    setIsLoading(false);
    return {};
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error', e);
      }
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('gt_auth_user');
  };

  const loginAsDemo = () => {
    const userObj = { id: DEFAULT_USER_PROFILE.id, email: DEFAULT_USER_PROFILE.email };
    setUser(userObj);
    setProfile(DEFAULT_USER_PROFILE);
    localStorage.setItem('gt_auth_user', JSON.stringify(userObj));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = await StorageService.updateProfile({ ...profile, ...updates });
    setProfile(updated);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const p = await StorageService.getProfile(user.id);
      setProfile(p);
    }
  };

  const value = useMemo(() => ({
    user,
    profile,
    isAuthenticated: Boolean(user),
    isLoading,
    isSupabaseActive,
    signIn,
    signUp,
    signOut,
    loginAsDemo,
    updateProfile,
    refreshProfile,
  }), [user, profile, isLoading, isSupabaseActive]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
