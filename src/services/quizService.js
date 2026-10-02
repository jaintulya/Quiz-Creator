import { supabase, isSupabaseConfigured } from './supabase.js';
import {
  getAllQuizzes as getLocalQuizzes,
  getQuizById as getLocalQuizById,
  saveQuiz as saveLocalQuiz,
  updateQuiz as updateLocalQuiz,
  updateLocalQuizId,
  updateQuizTitle as updateLocalQuizTitle,
  deleteQuiz as deleteLocalQuiz,
  generateQuizCode,
  getStorageKey,
} from './storage.js';

// ─── Fetch Single Quiz by ID or Unique Code (Cloud First) ───────────────────
export async function fetchQuizById(id, userId = null) {
  if (!id) return null;
  const cleanId = id.trim();

  // If Supabase is configured, check cloud database ground truth first
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .ilike('id', cleanId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          code: data.id,
          title: data.title,
          description: data.description || '',
          category: data.category || 'General',
          questions: data.questions,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          userId: data.user_id,
          isCloud: true,
        };
      } else if (!error && !data) {
        // Quiz was deleted by creator in cloud! Purge local cached copy so it cannot linger
        deleteLocalQuiz(cleanId, userId);
        return null;
      }
    } catch (err) {
      console.warn('Cloud fetch single quiz failed:', err);
    }
  }

  // Fallback to local storage only if offline or unconfigured
  return getLocalQuizById(cleanId, userId);
}

// ─── Fetch Quizzes (Supabase with user-scoped local fallback) ───────────────
export async function fetchAllQuizzes(userId = null) {
  // If no user (e.g. guest), load guest/local quizzes
  if (!userId) {
    return getLocalQuizzes(null);
  }

  // If Supabase is available, try fetching cloud quizzes
  if (isSupabaseConfigured) {
    try {
      // 1. Sync any local quizzes for this user that are not yet in Supabase
      await syncLocalQuizzesToCloud(userId);

      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          category: item.category || 'General',
          questions: item.questions,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          userId: item.user_id,
          isCloud: true,
        }));
        // Cache per user on this device for instant offline access
        try {
          localStorage.setItem(getStorageKey(userId), JSON.stringify(mapped));
        } catch {}
        return mapped;
      } else if (error) {
        console.warn('Cloud fetch quizzes notice:', error.message || error);
      }
    } catch (err) {
      console.warn('Cloud fetch quizzes skipped:', err);
    }
  }

  // Return isolated local quizzes for this user (never include foreign/shared quizzes)
  const localList = getLocalQuizzes(userId);
  return localList.filter((q) => !q.isShared && (!q.userId || q.userId === userId));
}

// ─── Regenerate Quiz Code (Owner Only) ──────────────────────────────────────
export async function regenerateQuizCode(oldId, userId = null) {
  if (!oldId) throw new Error('Quiz ID is required');
  const newCode = generateQuizCode();

  // 1. Update in local storage
  updateLocalQuizId(oldId, newCode, userId);

  // 2. Update in Supabase cloud database
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .update({
          id: newCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', oldId)
        .select()
        .single();

      if (error) {
        console.warn('Supabase code update error:', error.message || error);
      }
    } catch (err) {
      console.warn('Cloud code update failed:', err);
    }
  }

  return newCode;
}

// ─── Save New Quiz (Local + Cloud) ──────────────────────────────────────────
export async function saveNewQuiz(title, questions, userId = null, category = 'General', description = '') {
  const localQuiz = saveLocalQuiz(title, questions, userId);

  if (!isSupabaseConfigured || !userId) {
    return localQuiz;
  }

  try {
    const payload = {
      id: localQuiz.id,
      user_id: userId,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      questions: questions,
      created_at: localQuiz.createdAt,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('quizzes')
      .insert([payload])
      .select()
      .single();

    if (!error) {
      return {
        ...localQuiz,
        isCloud: true,
      };
    } else {
      console.warn('Supabase cloud quiz insert error:', error.message || error);
    }
  } catch (err) {
    console.warn('Cloud insert skipped:', err);
  }

  return localQuiz;
}

// ─── Update Existing Quiz ──────────────────────────────────────────────────
export async function updateExistingQuiz(id, title, questions, userId = null) {
  const localQuiz = updateLocalQuiz(id, title, questions, userId);

  if (!isSupabaseConfigured || !userId) {
    return localQuiz;
  }

  try {
    await supabase
      .from('quizzes')
      .update({
        title: title.trim(),
        questions: questions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  } catch (err) {
    console.warn('Cloud update skipped:', err);
  }

  return localQuiz;
}

// ─── Update Quiz Title Only ────────────────────────────────────────────────
export async function updateTitleOnly(id, newTitle, userId = null) {
  const localQuiz = updateLocalQuizTitle(id, newTitle, userId);

  if (!isSupabaseConfigured || !userId) {
    return localQuiz;
  }

  try {
    await supabase
      .from('quizzes')
      .update({
        title: newTitle.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  } catch (err) {
    console.warn('Cloud title update skipped:', err);
  }

  return localQuiz;
}

// ─── Delete Quiz ───────────────────────────────────────────────────────────
export async function deleteQuizRecord(id, userId = null) {
  deleteLocalQuiz(id, userId);

  if (!isSupabaseConfigured || !userId) {
    return;
  }

  try {
    await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);
  } catch (err) {
    console.warn('Cloud delete skipped:', err);
  }
}

// ─── Sync Offline Local Quizzes to Supabase ────────────────────────────────
export async function syncLocalQuizzesToCloud(userId, quizzes = null) {
  if (!isSupabaseConfigured || !userId) return;

  const items = quizzes || getLocalQuizzes(userId);
  if (!items || items.length === 0) return;

  try {
    const payloads = items.map((q) => ({
      id: q.id,
      user_id: userId,
      title: q.title,
      description: q.description || '',
      category: q.category || 'General',
      questions: q.questions,
      created_at: q.createdAt || new Date().toISOString(),
      updated_at: q.updatedAt || new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('quizzes')
      .upsert(payloads, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase sync quizzes notice:', error.message || error);
    }
  } catch (err) {
    console.warn('Sync skipped:', err);
  }
}
