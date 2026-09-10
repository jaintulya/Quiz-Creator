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
