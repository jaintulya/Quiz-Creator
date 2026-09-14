import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or localStorage override
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function getSupabaseCredentials() {
  const customUrl = localStorage.getItem('quizcraft_supabase_url');
  const customKey = localStorage.getItem('quizcraft_supabase_key');

  return {
    url: customUrl || envUrl,
    key: customKey || envKey,
  };
}

export function saveCustomCredentials(url, key) {
  if (url) localStorage.setItem('quizcraft_supabase_url', url.trim());
  if (key) localStorage.setItem('quizcraft_supabase_key', key.trim());
}

const { url, key } = getSupabaseCredentials();

// Fallback placeholder client if keys not provided
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const isSupabaseConfigured = Boolean(url && key && !url.includes('placeholder'));
export const supabaseUrl = url;

/**
 * Returns the environment-aware base site URL.
 * Supports:
 * - VITE_SITE_URL environment variable override
 * - Localhost dev server (e.g. http://localhost:5173)
 * - Production Vercel domain (https://makeyourquiz.vercel.app)
 */
export function getSiteUrl() {
  const envSiteUrl = import.meta.env.VITE_SITE_URL;
  if (envSiteUrl && envSiteUrl.trim()) {
    return envSiteUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    // If running in local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return window.location.origin;
    }
    // If running in browser (production Vercel)
    if (window.location.origin && !window.location.origin.includes('localhost')) {
      return window.location.origin;
    }
  }

  return 'https://makeyourquiz.vercel.app';
}

/**
 * Checks if the current browser URL carries an email confirmation callback.
 */
export function isEmailConfirmationUrl() {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname ? window.location.pathname.replace(/\/+$/, '') : '';
  const hash = window.location.hash || '';
  const search = window.location.search || '';

  return (
    p === '/email-verified' ||
    hash.includes('type=signup') ||
    hash.includes('type=email_change') ||
    search.includes('type=signup') ||
    search.includes('type=email_change')
  );
}

/**
 * Checks if the current browser URL carries a password recovery callback.
 */
export function isPasswordRecoveryUrl() {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname ? window.location.pathname.replace(/\/+$/, '') : '';
  const hash = window.location.hash || '';
  const search = window.location.search || '';

  return (
    p === '/reset-password' ||
    hash.includes('type=recovery') ||
    search.includes('type=recovery')
  );
}

/**
 * Checks if the URL contains an auth error returned by Supabase.
 */
export function hasAuthErrorInUrl() {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash || '';
  const search = window.location.search || '';

  return (
    hash.includes('error=') ||
    search.includes('error=') ||
    hash.includes('error_code=') ||
    search.includes('error_code=')
  );
}
