import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, getSiteUrl } from '../services/supabase.js';
import {
  registerWithUsername,
  loginWithUsername,
  changeUserPassword,
  updateUserProfile as updateAccountProfile,
  getActiveUserSession,
  clearActiveUserSession,
  syncLocalAccountsToSupabase,
} from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => {
    try {
      return localStorage.getItem('quizcraft_guest_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [lastAuthEvent, setLastAuthEvent] = useState(null);

  // Initialize auth state: Check Username Session first, then Supabase (Google) Session
  useEffect(() => {
    let mounted = true;

    // Sync any locally registered accounts to Supabase app_users table
    syncLocalAccountsToSupabase();

    // 1. Check if user is logged in via Username + Password
    const savedUser = getActiveUserSession();
    if (savedUser) {
      if (mounted) {
        setUser(savedUser);
        setSession({ user: savedUser });
        setIsGuest(false);
        setLoading(false);
      }
      return;
    }

    // 2. If not, check Supabase (Google OAuth session)
    if (!isSupabaseConfigured) {
      if (mounted) setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        setLastAuthEvent(event);
        // Only override if not in a custom username session
        const currentCustom = getActiveUserSession();
        if (!currentCustom) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            setIsGuest(false);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // ── Google OAuth ──
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

  // ── Username/Password Registration ──
  const signUpWithUsername = async (username, password, course) => {
    // Register through dedicated secure auth service
    const newUser = await registerWithUsername(username, password, course);
    setUser(newUser);
    setSession({ user: newUser });
    setIsGuest(false);
    try {
      localStorage.removeItem('quizcraft_guest_mode');
    } catch {}
    return newUser;
  };

  // ── Username/Password Login ──
  const signInWithUsername = async (username, password) => {
    const loggedUser = await loginWithUsername(username, password);
    setUser(loggedUser);
    setSession({ user: loggedUser });
    setIsGuest(false);
    try {
      localStorage.removeItem('quizcraft_guest_mode');
    } catch {}
    return loggedUser;
  };

  // ── Guest Mode ──
  const loginAsGuest = () => {
    localStorage.setItem('quizcraft_guest_mode', 'true');
    clearActiveUserSession();
    setUser(null);
    setSession(null);
    setIsGuest(true);
  };

  const exitGuestMode = () => {
    localStorage.removeItem('quizcraft_guest_mode');
    setIsGuest(false);
  };

  // ── Sign Out ──
  const signOut = async (options = { scope: 'local' }) => {
    clearActiveUserSession();
    exitGuestMode();

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut(options);
      } catch {
        // ignore
      }
    }

    setUser(null);
    setSession(null);
  };

  // Helper: get display name (Full name if set, else fallback to username)
  const getUserDisplayName = (u = user) => {
    if (!u) return '';
    const fullName = u.fullName || u.user_metadata?.full_name;
    if (fullName && typeof fullName === 'string' && fullName.trim()) {
      return fullName.trim();
    }
    return (
      u.username ||
      u.user_metadata?.username ||
      u.user_metadata?.display_name ||
      u.user_metadata?.name ||
      u.email?.split('@')[0] ||
      'User'
    );
  };

  // Helper: get user full name specifically (empty if not set)
  const getUserFullName = (u = user) => {
    if (!u) return '';
    const fullName = u.fullName || u.user_metadata?.full_name;
    return (fullName && typeof fullName === 'string') ? fullName.trim() : '';
  };

  // Helper: get user permanent username specifically
  const getUserUsername = (u = user) => {
    if (!u) return '';
    return u.username || u.user_metadata?.username || u.email?.split('@')[0] || '';
  };

  // Helper: get user course
  const getUserCourse = (u = user) => {
    if (!u) return '';
    return u.course || u.user_metadata?.course || '';
  };

  // Update user profile metadata (full_name, course) - Username is permanent!
  const updateProfile = async ({ full_name, course }) => {
    if (!user) throw new Error('User not authenticated.');

    if (user.authType === 'username') {
      const updated = await updateAccountProfile(user.id, { full_name, course });
      if (updated) {
        setUser(updated);
        setSession({ user: updated });
      }
      return updated;
    }

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
    if (!user) throw new Error('You must be logged in to change your password.');

    // If username user
    if (user.authType === 'username') {
      return await changeUserPassword(user.id, currentPassword, newPassword);
    }

    // If Google OAuth user
    if (user.app_metadata?.provider === 'google' || user.identities?.some((id) => id.provider === 'google')) {
      throw new Error('This account signs in with Google. Passwords are managed in your Google Account.');
    }

    // If Supabase native email user
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured yet.');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error('Current password is incorrect.');
    }

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
    getUserFullName,
    getUserUsername,
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
