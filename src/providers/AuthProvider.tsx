'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { authService, UserProfile } from '@/features/auth/services/authService';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const invalidTokenCount = useRef(0);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const loadProfile = async (activeSession: Session) => {
      try {
        return await authService.getProfile(activeSession.access_token);
      } catch (e) {
        if (e instanceof Error && e.message.includes('User profile not found')) {
          const fullName =
            (activeSession.user.user_metadata?.full_name as string | undefined) ||
            (activeSession.user.user_metadata?.name as string | undefined) ||
            activeSession.user.email ||
            'New User';
          return await authService.ensureProfile(
            {
              email: activeSession.user.email ?? undefined,
              fullName,
            },
            activeSession.access_token
          );
        }
        if (e instanceof Error) {
          const message = e.message.toLowerCase();
          if (message.includes('invalid token') || message.includes('token has expired') || message.includes('unsupported token')) {
            invalidTokenCount.current += 1;
            if (invalidTokenCount.current >= 2) {
              await supabase.auth.signOut();
              setProfile(null);
              setSession(null);
              setUser(null);
            }
          }
        }
        throw e;
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const userProfile = await loadProfile(session);
            if (mounted) setProfile(userProfile);
            invalidTokenCount.current = 0;
          } catch (e) {
            console.error('Failed to fetch user profile:', e);
          }
        }
      } catch (error) {
         console.error('Error fetching session:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
           try {
             const userProfile = await loadProfile(session);
             if (mounted) setProfile(userProfile);
             invalidTokenCount.current = 0;
           } catch (e) {
             console.error('Failed to fetch user profile:', e);
           }
        } else if (!session?.user) {
          if (mounted) setProfile(null);
        }
        if (mounted) setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, loading: isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
