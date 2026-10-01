import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, getSiteUrl } from '../services/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastAuthEvent, setLastAuthEvent] = useState(null);
  const [isGuest, setIsGuest] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('quizcraft_guest_mode') === 'true'
  );

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setLastAuthEvent(event);
        if (event === 'PASSWORD_RECOVERY') {
          setSession(newSession);
          setUser(null);
          setLoading(false);
          return;
        }
        setSession(newSession);
        if (newSession?.user) {
          setUser(newSession.user);
        } else if (!newSession) {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getSiteUrl() },
    });
    if (error) throw error;
  };

  // Helper to convert username to synthetic email
  const getSyntheticEmail = (username) => {
    return `${btoa(encodeURIComponent(username.trim().toLowerCase())).replace(/=/g, '')}@quizcraft.local`;
  };

  // Username/Password Registration
  const signUpWithUsername = async (username, password, course) => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured yet.');
    
    const syntheticEmail = getSyntheticEmail(username);
    const { data, error } = await supabase.auth.signUp({
      email: syntheticEmail,
      password,
      options: {
        data: {
          username: username.trim(),
          full_name: username.trim(),
          display_name: username.trim(),
          course: course?.trim() || '',
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('Username already exists. Please choose another username.');
      }
      throw error;
    }
    return data;
  };

  // Username/Password Login
  const signInWithUsername = async (username, password) => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured yet.');
    
    const syntheticEmail = getSyntheticEmail(username);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Incorrect username or password.');
      }
      throw error;
    }
    return data;
  };

  const loginAsGuest = () => {
    localStorage.setItem('quizcraft_guest_mode', 'true');
    setIsGuest(true);
  };

  const exitGuestMode = () => {
    localStorage.removeItem('quizcraft_guest_mode');
    setIsGuest(false);
  };



  // Sign Out
  const signOut = async (options = { scope: 'local' }) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut(options);
      } catch {
        // ignore
      }
    }
    // Clear cached user quizzes so User A's data never leaks to User B
    try {
      localStorage.removeItem('quizcraft_quizzes');
    } catch { /* storage unavailable */ }
    exitGuestMode();
    setUser(null);
    setSession(null);
  };

  // Helper: get display name from user metadata
  const getUserDisplayName = (u = user) => {
    if (!u) return '';
    return (
      u.user_metadata?.full_name ||
      u.user_metadata?.name ||
      u.user_metadata?.display_name ||
      u.email?.split('@')[0] ||
      'User'
    );
  };

  // Helper: get user course
  const getUserCourse = (u = user) => {
    if (!u) return '';
    return u.user_metadata?.course || '';
  };

  // Update user profile metadata (name, course)
  const updateProfile = async ({ full_name, course }) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: full_name?.trim(),
        display_name: full_name?.trim(),
        name: full_name?.trim(),
        course: course?.trim(),
      },
    });
    if (error) throw error;
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  // Change Password
  const updatePassword = async (currentPassword, newPassword) => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured yet.');
    if (!user) throw new Error('You must be logged in to change your password.');

    // Verify current password first by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error('Current password is incorrect.');
    }

    // Now update to the new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new Error(updateError.message || 'Failed to update password.');
    }
  };



  const value = {
    user,
    session,
    loading,
    lastAuthEvent,
    isGuest,
    isConfigured: isSupabaseConfigured,
    signInWithGoogle,
    signUpWithUsername,
    signInWithUsername,
    loginAsGuest,
    exitGuestMode,
    updateProfile,
    updatePassword,
    signOut,
    getUserDisplayName,
    getUserCourse,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
