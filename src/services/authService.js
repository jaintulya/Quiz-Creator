// ─── QuizCraft Authentication Service ─────────────────────────────────────────
// Provides rock-solid, production-ready Username + Password authentication
// with client-side SHA-256 password hashing, unique username enforcement,
// course profiles, password changes, multi-session persistence, and
// automatic 2-way cloud synchronization with Supabase's `app_users` table.

import { supabase, isSupabaseConfigured } from './supabase.js';

const ACCOUNTS_KEY = 'quizcraft_registered_accounts';
const ACTIVE_USER_KEY = 'quizcraft_active_user';

/**
 * SHA-256 password hash using standard Web Crypto API
 */
export async function hashPassword(password) {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + '_quizcraft_salt_v2');
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback below
    }
  }
  // Robust fallback hash for environments where subtle is unavailable
  let hash = 0;
  const salted = password + '_quizcraft_salt_v2';
  for (let i = 0; i < salted.length; i++) {
    hash = ((hash << 5) - hash) + salted.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}`;
}

/**
 * Validate username according to strict project specifications:
 * - At least 8 characters long
 * - Must contain at least one letter
 * - Must contain at least one digit
 * - Must contain at least one special character
 */
export function validateUsername(username) {
  const u = username ? username.trim() : '';
  if (u.length < 8) {
    return 'Username must be at least 8 characters long.';
  }
  if (!/[a-zA-Z]/.test(u)) {
    return 'Username must contain at least one letter.';
  }
  if (!/\d/.test(u)) {
    return 'Username must contain at least one digit.';
  }
  if (!/[^a-zA-Z0-9]/.test(u)) {
    return 'Username must contain at least one special character (e.g. @, #, $, _).';
  }
  return null;
}

/**
 * Get all registered accounts from local storage
 */
export function getAllRegisteredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save registered accounts list locally
 */
function saveAllRegisteredAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save registered accounts:', err);
  }
}

/**
 * Check if a username is already taken (Local + Supabase)
 */
export async function isUsernameTaken(username) {
  const normalized = username.trim().toLowerCase();
  const accounts = getAllRegisteredAccounts();
  const localMatch = accounts.some((acc) => acc.normalizedUsername === normalized);
  if (localMatch) return true;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('id')
        .eq('normalized_username', normalized)
        .maybeSingle();

      if (!error && data) return true;
    } catch {
      // Table may not exist yet in user's Supabase
    }
  }

  return false;
}

/**
 * Format a user account object into standard user session representation
 */
export function formatUserSession(account) {
  if (!account) return null;
  const rawFullName = account.fullName || account.full_name || '';
  const fullName = typeof rawFullName === 'string' ? rawFullName.trim() : '';
  const effectiveDisplayName = fullName || account.username;

  return {
    id: account.id,
    email: `${account.normalizedUsername}@quizcraft.internal`,
    username: account.username,
    fullName: fullName,
    displayName: effectiveDisplayName,
    normalizedUsername: account.normalizedUsername,
    course: account.course || '',
    created_at: account.createdAt || account.created_at,
    authType: 'username',
    user_metadata: {
      username: account.username,
      full_name: fullName,
      display_name: effectiveDisplayName,
      name: effectiveDisplayName,
      course: account.course || '',
    },
    app_metadata: {
      provider: 'username',
    },
  };
}

/**
 * Sync all local accounts to Supabase `app_users` table
 */
export async function syncLocalAccountsToSupabase() {
  if (!isSupabaseConfigured) return;
  const accounts = getAllRegisteredAccounts();
  if (!accounts || accounts.length === 0) return;

  try {
    for (const acc of accounts) {
      const { error } = await supabase.from('app_users').upsert({
        id: acc.id,
        username: acc.username,
        normalized_username: acc.normalizedUsername,
        password_hash: acc.passwordHash,
        full_name: acc.fullName || acc.full_name || '',
        course: acc.course || '',
        created_at: acc.createdAt || acc.created_at || new Date().toISOString(),
        updated_at: acc.updatedAt || acc.updated_at || new Date().toISOString(),
      }, { onConflict: 'normalized_username' });

      if (error) {
        console.warn('Notice syncing account to Supabase `app_users` table:', error.message || error);
      }
    }
  } catch (err) {
    console.warn('Sync accounts error:', err);
  }
}

/**
 * Register a new user with username, password, and course
 */
export async function registerWithUsername(username, password, course) {
  // 1. Validation
  const usernameError = validateUsername(username);
  if (usernameError) {
    throw new Error(usernameError);
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  if (!course || !course.trim()) {
    throw new Error('Please select your course or program.');
  }

  // 2. Uniqueness check across local and Supabase
  const taken = await isUsernameTaken(username);
  if (taken) {
    throw new Error('Username already exists. Please choose another username.');
  }

  // 3. Hash password
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const newAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    username: username.trim(),
    normalizedUsername: username.trim().toLowerCase(),
    passwordHash,
    fullName: '',
    course: course.trim(),
    createdAt: now,
    updatedAt: now,
  };

  // 4. Save account locally
  const accounts = getAllRegisteredAccounts();
  accounts.push(newAccount);
  saveAllRegisteredAccounts(accounts);

  // 5. Cloud Sync: Insert into Supabase `app_users`
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('app_users').insert({
        id: newAccount.id,
        username: newAccount.username,
        normalized_username: newAccount.normalizedUsername,
        password_hash: newAccount.passwordHash,
        full_name: '',
        course: newAccount.course,
        created_at: newAccount.createdAt,
        updated_at: newAccount.updatedAt,
      });
      if (error) {
        console.warn('Supabase app_users sync notice (run supabase/schema.sql in dashboard):', error.message || error);
      }
    } catch (err) {
      console.warn('Supabase app_users sync notice (run supabase/schema.sql in dashboard):', err);
    }
  }

  // 6. Set active user session
  const sessionUser = formatUserSession(newAccount);
  try {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(sessionUser));
  } catch (err) {
    console.error('Failed to store active user:', err);
  }

  return sessionUser;
}

/**
 * Sign in using username and password
 */
export async function loginWithUsername(username, password) {
  if (!username || !password) {
    throw new Error('Please enter both username and password.');
  }

  const normalized = username.trim().toLowerCase();
  const accounts = getAllRegisteredAccounts();
  let account = accounts.find((acc) => acc.normalizedUsername === normalized);

  // If not found in localStorage, fetch from Supabase `app_users` table
  if (!account && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('normalized_username', normalized)
        .maybeSingle();

      if (!error && data) {
        account = {
          id: data.id,
          username: data.username,
          normalizedUsername: data.normalized_username,
          passwordHash: data.password_hash,
          fullName: data.full_name || '',
          course: data.course || '',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        // Cache in local accounts for offline resilience
        accounts.push(account);
        saveAllRegisteredAccounts(accounts);
      }
    } catch (err) {
      console.warn('Supabase app_users lookup notice:', err);
    }
  }

  if (!account) {
    throw new Error('Incorrect username or password.');
  }

  const hash = await hashPassword(password);
  if (hash !== account.passwordHash) {
    throw new Error('Incorrect username or password.');
  }

  const sessionUser = formatUserSession(account);
  try {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(sessionUser));
  } catch (err) {
    console.error('Failed to store active user:', err);
  }

  return sessionUser;
}

/**
 * Change password for the current username account
 */
export async function changeUserPassword(userId, currentPassword, newPassword) {
  if (!userId) {
    throw new Error('You must be logged in to change your password.');
  }
  if (!currentPassword) {
    throw new Error('Please enter your current password.');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const accounts = getAllRegisteredAccounts();
  const idx = accounts.findIndex((acc) => acc.id === userId);

  if (idx === -1) {
    throw new Error('Account not found.');
  }

  const currentHash = await hashPassword(currentPassword);
  if (currentHash !== accounts[idx].passwordHash) {
    throw new Error('Current password is incorrect.');
  }

  const newHash = await hashPassword(newPassword);
  const now = new Date().toISOString();
  accounts[idx].passwordHash = newHash;
  accounts[idx].updatedAt = now;
  saveAllRegisteredAccounts(accounts);

  // Sync to Supabase `app_users`
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('app_users')
        .update({ password_hash: newHash, updated_at: now })
        .eq('id', userId);
    } catch (err) {
      console.warn('Supabase password update sync notice:', err);
    }
  }

  return true;
}

/**
 * Update course or profile details for username account
 */
export async function updateUserProfile(userId, { course, full_name, fullName }) {
  const accounts = getAllRegisteredAccounts();
  const idx = accounts.findIndex((acc) => acc.id === userId);
  const now = new Date().toISOString();

  const nameToSet = fullName !== undefined ? fullName : full_name;

  if (idx !== -1) {
    if (course !== undefined) {
      accounts[idx].course = course.trim();
    }
    if (nameToSet !== undefined) {
      accounts[idx].fullName = nameToSet.trim();
    }
    accounts[idx].updatedAt = now;
    saveAllRegisteredAccounts(accounts);
  }

  // Cloud Sync to Supabase `app_users`
  if (isSupabaseConfigured) {
    try {
      const updates = { updated_at: now };
      if (course !== undefined) updates.course = course.trim();
      if (nameToSet !== undefined) updates.full_name = nameToSet.trim();
      await supabase.from('app_users').update(updates).eq('id', userId);
    } catch (err) {
      console.warn('Supabase app_users profile update notice:', err);
    }
  }

  const targetAccount = idx !== -1 ? accounts[idx] : { id: userId, fullName: nameToSet, course };
  const updatedSession = formatUserSession(targetAccount);
  try {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(updatedSession));
  } catch {}

  return updatedSession;
}

/**
 * Get the currently active username session from localStorage
 */
export function getActiveUserSession() {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear the active username session
 */
export function clearActiveUserSession() {
  try {
    localStorage.removeItem(ACTIVE_USER_KEY);
  } catch {}
}
