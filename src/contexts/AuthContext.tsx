import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string, referralCode?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const latestResolvedUserIdRef = useRef<string | null>(null);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchProfile = useCallback(async (userId: string) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          setProfile(data as Profile);
          return;
        }
      } catch (error) {
        console.error('Profile fetch failed:', error);
      }

      if (attempt < 2) {
        await wait(300 * (attempt + 1));
      }
    }
  }, []);

  const checkAdminRole = useCallback(async (userId: string) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();

        if (!error) {
          const nextIsAdmin = !!data;
          setIsAdmin(nextIsAdmin);
          return nextIsAdmin;
        }
      } catch (error) {
        console.error('Admin role check failed:', error);
      }

      if (attempt < 2) {
        await wait(300 * (attempt + 1));
      }
    }

    return false;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const applySessionState = async (
      nextSession: Session | null,
      options?: { background?: boolean },
    ) => {
      const isBackground = options?.background ?? false;

      if (!isBackground && isMounted) {
        setLoading(true);
      }

      if (!isMounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      latestResolvedUserIdRef.current = nextSession?.user?.id ?? null;

      if (nextSession?.user) {
        try {
          await Promise.all([
            fetchProfile(nextSession.user.id),
            checkAdminRole(nextSession.user.id),
          ]);
        } finally {
          if (!isBackground && isMounted) {
            setLoading(false);
          }
        }
        return;
      }

      setProfile(null);
      setIsAdmin(false);

      if (!isBackground && isMounted) {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const nextUserId = nextSession?.user?.id ?? null;
      const sameUserSession = !!nextUserId && nextUserId === latestResolvedUserIdRef.current;
      const isBackgroundAuthEvent =
        event === 'TOKEN_REFRESHED' ||
        ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && sameUserSession);

      setTimeout(() => {
        void applySessionState(nextSession, { background: isBackgroundAuthEvent });
      }, 0);
    });

    (async () => {
      const { data: { session: nextSession } } = await supabase.auth.getSession();
      await applySessionState(nextSession);
    })();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminRole, fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string, referralCode?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName, referred_by: referralCode || '' },
      },
    });

    // Save phone to profile after signup
    if (!error && data.user && phone) {
      await supabase.from('profiles').update({ phone }).eq('user_id', data.user.id);
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsAdmin(false);
    latestResolvedUserIdRef.current = null;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
