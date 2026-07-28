import { calibrateUserStreak, formatDate } from './streakEngine';
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'streak_duel_app_state_v1';
const BROADCAST_CHANNEL = 'STREAK_DUEL_SYNC';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const DEFAULT_INITIAL_STATE = {
  habit: {
    title: 'Daily 30-Min Fitness Workout',
    category: 'Fitness & Health',
    description: 'Complete at least 30 minutes of physical exercise every single calendar day.',
    icon: 'Dumbbell',
    createdAt: formatDate()
  },
  activeUserId: 'user_a',
  simulatedDateOffsetDays: 0,
  users: {
    user_a: {
      id: 'user_a',
      name: 'Alex',
      tagline: 'Cardio & Strength',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      colorTheme: 'cyan',
      currentStreak: 3,
      bestStreak: 7,
      lastTickedDate: formatDate(new Date(Date.now() - 86400000)),
      history: {
        [formatDate(new Date(Date.now() - 3 * 86400000))]: true,
        [formatDate(new Date(Date.now() - 2 * 86400000))]: true,
        [formatDate(new Date(Date.now() - 1 * 86400000))]: true,
      }
    },
    user_b: {
      id: 'user_b',
      name: 'Sam',
      tagline: 'HIIT & Running',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      colorTheme: 'orange',
      currentStreak: 2,
      bestStreak: 12,
      lastTickedDate: formatDate(new Date(Date.now() - 86400000)),
      history: {
        [formatDate(new Date(Date.now() - 2 * 86400000))]: true,
        [formatDate(new Date(Date.now() - 1 * 86400000))]: true,
      }
    }
  }
};

export function getEffectiveDate(state) {
  const offsetDays = state?.simulatedDateOffsetDays || 0;
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  return formatDate(now);
}

/**
 * Load application state safely from localStorage
 */
export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : DEFAULT_INITIAL_STATE;
    const effectiveDate = getEffectiveDate(parsed);

    return {
      ...parsed,
      users: {
        user_a: calibrateUserStreak(parsed.users.user_a, effectiveDate),
        user_b: calibrateUserStreak(parsed.users.user_b, effectiveDate)
      }
    };
  } catch (err) {
    console.error('Failed to load state:', err);
    return DEFAULT_INITIAL_STATE;
  }
}

/**
 * Save state locally and optionally sync to Supabase asynchronously
 */
export function saveAppState(state) {
  try {
    const jsonStr = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, jsonStr);
    
    // Multi-tab sync on same device
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL);
        bc.postMessage({ type: 'STATE_UPDATED', payload: state });
        bc.close();
      } catch (e) {}
    }

    // Async push to Supabase (non-blocking so phone UI never stutters)
    if (supabase) {
      const uA = state.users.user_a;
      const uB = state.users.user_b;

      supabase.from('profiles').upsert([
        {
          id: uA.id,
          name: uA.name,
          tagline: uA.tagline,
          avatar_url: uA.avatar,
          color_theme: uA.colorTheme,
          current_streak: uA.currentStreak,
          best_streak: uA.bestStreak,
          last_ticked_date: uA.lastTickedDate
        },
        {
          id: uB.id,
          name: uB.name,
          tagline: uB.tagline,
          avatar_url: uB.avatar,
          color_theme: uB.colorTheme,
          current_streak: uB.currentStreak,
          best_streak: uB.bestStreak,
          last_ticked_date: uB.lastTickedDate
        }
      ]).then(() => {}).catch(err => console.warn('Supabase sync note:', err));
    }
  } catch (err) {
    console.error('Failed to save state:', err);
  }
}

export function resetToDemoState() {
  const freshState = {
    ...DEFAULT_INITIAL_STATE,
    users: {
      user_a: {
        ...DEFAULT_INITIAL_STATE.users.user_a,
        lastTickedDate: formatDate(new Date(Date.now() - 86400000))
      },
      user_b: {
        ...DEFAULT_INITIAL_STATE.users.user_b,
        lastTickedDate: formatDate(new Date(Date.now() - 86400000))
      }
    }
  };
  saveAppState(freshState);
  return freshState;
}

/**
 * Clean subscription to cross-tab updates & Supabase Realtime
 */
export function subscribeToStorageUpdates(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleStorageEvent = (event) => {
    if (event.key === STORAGE_KEY) {
      callback(loadAppState());
    }
  };

  window.addEventListener('storage', handleStorageEvent);

  let bc;
  if ('BroadcastChannel' in window) {
    try {
      bc = new BroadcastChannel(BROADCAST_CHANNEL);
      bc.onmessage = (event) => {
        if (event.data?.type === 'STATE_UPDATED') {
          callback(event.data.payload);
        }
      };
    } catch (e) {}
  }

  // Supabase Realtime Sync across internet
  let supabaseChannel;
  if (supabase) {
    // Single initial cloud sync if cloud records exist
    supabase.from('profiles').select('*').then(({ data: profiles }) => {
      if (profiles && profiles.length > 0) {
        const local = loadAppState();
        const updatedUsers = { ...local.users };
        let changed = false;

        profiles.forEach((p) => {
          if (updatedUsers[p.id]) {
            // Only update if cloud value is higher or newer to prevent downgrades!
            if (p.current_streak >= updatedUsers[p.id].currentStreak) {
              updatedUsers[p.id] = {
                ...updatedUsers[p.id],
                currentStreak: p.current_streak,
                bestStreak: Math.max(updatedUsers[p.id].bestStreak, p.best_streak),
                lastTickedDate: p.last_ticked_date
              };
              changed = true;
            }
          }
        });

        if (changed) {
          const updatedState = { ...local, users: updatedUsers };
          saveAppState(updatedState);
          callback(updatedState);
        }
      }
    }).catch(() => {});

    // Listen for real-time updates from other devices
    try {
      supabaseChannel = supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
          const updatedUser = payload.new;
          if (!updatedUser) return;

          const local = loadAppState();
          const existingUser = local.users[updatedUser.id];

          if (existingUser) {
            // Only apply cloud update if cloud streak is greater than or equal to local
            if (updatedUser.current_streak >= existingUser.currentStreak) {
              const updatedState = {
                ...local,
                users: {
                  ...local.users,
                  [updatedUser.id]: {
                    ...existingUser,
                    currentStreak: updatedUser.current_streak,
                    bestStreak: Math.max(existingUser.bestStreak, updatedUser.best_streak),
                    lastTickedDate: updatedUser.last_ticked_date
                  }
                }
              };
              saveAppState(updatedState);
              callback(updatedState);
            }
          }
        })
        .subscribe();
    } catch (e) {}
  }

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
    if (bc) bc.close();
    if (supabaseChannel) supabase.removeChannel(supabaseChannel);
  };
}
