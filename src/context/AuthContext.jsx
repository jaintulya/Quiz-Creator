import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, getSiteUrl } from '../services/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastAuthEvent, setLastAuthEvent] = useState(null);

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

  // Google OAuth Login
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

  // Email & Password Sign In
  const signInWithEmail = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    setSession(data.session);
    return data;
  };

  // Email & Password Sign Up (with name + course metadata)
  // Sends email confirmation link directing to /email-verified
  const signUpWithEmail = async (email, password, name = '', course = '') => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }
    const redirectTo = `${getSiteUrl()}/email-verified`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: name.trim(),
          course: course.trim(),
          display_name: name.trim(),
        },
      },
    });
    if (error) throw error;

    // If identities array is empty, the email is already registered
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    if (data.user && !data.session) {
      // Email confirmation required — confirmation link was sent
      return { ...data, requiresConfirmation: true };
    }

    // Immediately logged in (if email confirmation is disabled in Supabase)
    setUser(data.user);
    setSession(data.session);
    return data;
  };

  // Resend Confirmation Email
  // Uses the same /email-verified redirect as the original sign-up so a resent
  // link lands on the verification success page, not the site root.
  const resendSignupEmail = async (email) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }
    const redirectTo = `${getSiteUrl()}/email-verified`;
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;
    return data;
  };

  // Send Password Reset Email
  // Sends password reset link directing to /reset-password
  const sendPasswordResetEmail = async (email) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }
    const redirectTo = `${getSiteUrl()}/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    if (error) throw error;
    return data;
  };

  // Verify OTP (6-digit code from email)
  const verifyOtp = async (email, token) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }
    const cleanEmail = email.trim();
    const cleanToken = token.trim();

    // Try type 'signup' first
    let res = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'signup',
    });

    // Fallback: if 'signup' failed, try 'email'
    if (res.error) {
      const fallback = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });
      if (!fallback.error) {
        res = fallback;
      }
    }

    if (res.error) throw res.error;
    if (res.data?.user) {
      setUser(res.data.user);
      setSession(res.data.session);
    }
    return res.data;
  };

  // Resend OTP to user's email
  const resendOtp = async (email) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    if (error) throw error;
    return data;
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
    // Clear the recovery marker so a stale flag from a previous reset
    // can never validate a future /reset-password visit for another account.
    try {
      sessionStorage.removeItem('qc_recovery_email');
    } catch { /* storage unavailable */ }
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

  // Update password
  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  const value = {
    user,
    session,
    loading,
    lastAuthEvent,
    isConfigured: isSupabaseConfigured,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resendSignupEmail,
    sendPasswordResetEmail,
    verifyOtp,
    resendOtp,
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
