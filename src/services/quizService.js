import { supabase, isSupabaseConfigured } from './supabase.js';
import {
  getAllQuizzes as getLocalQuizzes,
  saveQuiz as saveLocalQuiz,
  updateQuiz as updateLocalQuiz,
  updateQuizTitle as updateLocalQuizTitle,
  deleteQuiz as deleteLocalQuiz,
} from './storage.js';

// ─── Fetch Quizzes (Supabase — per user) ────────────────────────────────────
export async function fetchAllQuizzes(userId = null) {
  if (!isSupabaseConfigured || !userId) {
    return getLocalQuizzes();
  }

  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, falling back to local:', error.message);
      return getLocalQuizzes();
    }

    if (data) {
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
      // Cache locally for offline resilience
      localStorage.setItem('quizcraft_quizzes', JSON.stringify(mapped));
      return mapped;
    }

    return [];
  } catch (err) {
    console.error('Failed to fetch quizzes from Supabase:', err);
    return getLocalQuizzes();
  }
}

// ─── Save New Quiz (Cloud + Local) ──────────────────────────────────────────
export async function saveNewQuiz(title, questions, userId = null, category = 'General', description = '') {
  const localQuiz = saveLocalQuiz(title, questions);

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

    const { data, error } = await supabase
      .from('quizzes')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Cloud insert warning:', error.message);
      return localQuiz;
    }

    return {
      ...localQuiz,
      isCloud: true,
    };
  } catch (err) {
    console.warn('Error saving quiz to cloud:', err);
    return localQuiz;
  }
}

// ─── Update Existing Quiz ──────────────────────────────────────────────────
export async function updateExistingQuiz(id, title, questions, userId = null) {
  const localQuiz = updateLocalQuiz(id, title, questions);

  if (!isSupabaseConfigured || !userId) {
    return localQuiz;
  }

  try {
    const { error } = await supabase
      .from('quizzes')
      .update({
        title: title.trim(),
        questions: questions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.warn('Could not update quiz on cloud:', error.message);
    }
  } catch (err) {
    console.warn('Cloud update failed:', err);
  }

  return localQuiz;
}

// ─── Update Quiz Title Only ────────────────────────────────────────────────
export async function updateTitleOnly(id, newTitle, userId = null) {
  const localQuiz = updateLocalQuizTitle(id, newTitle);

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
    console.warn('Cloud title update failed:', err);
  }

  return localQuiz;
}

// ─── Delete Quiz ───────────────────────────────────────────────────────────
export async function deleteQuizRecord(id, userId = null) {
  deleteLocalQuiz(id);

  if (!isSupabaseConfigured || !userId) {
    return;
  }

  try {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Cloud delete warning:', error.message);
    }
  } catch (err) {
    console.warn('Failed to delete quiz from cloud:', err);
  }
}

// ─── Sync Offline Local Quizzes to Supabase ────────────────────────────────
export async function syncLocalQuizzesToCloud(userId, quizzes = null) {
  if (!isSupabaseConfigured || !userId) return;

  const items = quizzes || getLocalQuizzes();
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
      console.warn('Sync to cloud error:', error.message);
    }
  } catch (err) {
    console.warn('Sync failed:', err);
  }
}
