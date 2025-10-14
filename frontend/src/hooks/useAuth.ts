import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { userService } from '../services/userService';
import { trackUserAction, trackApiCall, trackApiError } from '../lib/systemMonitor';
import { trackUserAction as sentryTrack } from '../lib/monitoring';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const finishApiCall = trackApiCall('auth/initialize');
        const session = await userService.getCurrentSession();
        finishApiCall();

        setState({
          user: session?.user || null,
          session,
          loading: false,
          error: null,
          isAuthenticated: !!session?.user
        });

        if (session?.user) {
          trackUserAction('login');
          sentryTrack('auth_initialized', { userId: session.user.id });
        }
      } catch (error) {
        trackApiError('auth/initialize', error);
        setState({
          user: null,
          session: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
          isAuthenticated: false
        });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = userService.onAuthStateChange((event, session) => {
      setState(prev => ({
        ...prev,
        user: session?.user || null,
        session,
        isAuthenticated: !!session?.user,
        loading: false
      }));

      if (event === 'SIGNED_IN' && session?.user) {
        trackUserAction('login');
        sentryTrack('user_signed_in', { userId: session.user.id });
      } else if (event === 'SIGNED_OUT') {
        trackUserAction('logout');
        sentryTrack('user_signed_out');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const finishApiCall = trackApiCall('auth/login');
      const session = await userService.signIn(email, password);
      finishApiCall();

      setState({
        user: session.user,
        session,
        loading: false,
        error: null,
        isAuthenticated: true
      });

      trackUserAction('login');
      sentryTrack('login_success', { userId: session.user.id });
      
      return session;
    } catch (error) {
      trackApiError('auth/login', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const finishApiCall = trackApiCall('auth/register');
      const session = await userService.signUp(email, password, { full_name: fullName });
      finishApiCall();

      setState({
        user: session.user,
        session,
        loading: false,
        error: null,
        isAuthenticated: true
      });

      sentryTrack('registration_success', { userId: session.user.id });
      
      return session;
    } catch (error) {
      trackApiError('auth/register', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const finishApiCall = trackApiCall('auth/logout');
      await userService.signOut();
      finishApiCall();

      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
        isAuthenticated: false
      });

      trackUserAction('logout');
      sentryTrack('logout_success');
    } catch (error) {
      trackApiError('auth/logout', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }));
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    clearError
  };
};