import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchProfile = async (userId: string) => {
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
  };

  const checkAdminRole = async (userId: string) => {
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
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setLoading(true);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          (async () => {
            try {
              await Promise.all([
                fetchProfile(session.user.id),
                checkAdminRole(session.user.id),
              ]);
            } finally {
              setLoading(false);
            }
          })();
        }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    (async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          await Promise.all([
            fetchProfile(session.user.id),
            checkAdminRole(session.user.id),
          ]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    })();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });

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
