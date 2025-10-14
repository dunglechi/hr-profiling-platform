import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { userService, UserProfile } from '../services/userService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial auth state
  useEffect(() => {
    const loadInitialAuth = async () => {
      try {
        const currentSession = await userService.getCurrentSession();
        const currentUser = await userService.getCurrentUser();
        
        setSession(currentSession);
        setUser(currentUser);

        if (currentUser) {
          const userProfile = await userService.getUserProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Lỗi load auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialAuth();
  }, []);

  // Setup auth state listener
  useEffect(() => {
    const { data: { subscription } } = userService.onAuthStateChange(
      async (newUser, newSession) => {
        setUser(newUser);
        setSession(newSession);

        if (newUser) {
          // Load user profile
          const userProfile = await userService.getUserProfile(newUser.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const result = await userService.signUp(email, password, userData);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await userService.signIn(email, password);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await userService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      const updatedProfile = await userService.updateUserProfile(user.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Lỗi cập nhật profile:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await userService.getUserProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Lỗi refresh profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};

export default AuthContext;