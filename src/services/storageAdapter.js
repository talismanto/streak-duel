import { calibrateUserStreak, formatDate } from './streakEngine';
import { createClient } from '@supabase/supabase-js';

const DEVICE_ID_KEY   = 'streak_duel_device_user_id';
const LOCAL_PROFILES_KEY = 'streak_duel_profiles_v2';
const HABIT_KEY       = 'streak_duel_habit_v2';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/* ── Helpers ──────────────────────────────────────────────────── */

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'usr_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getEffectiveDate() {
  return formatDate(new Date());
}

/** Convert a Supabase DB row → app profile shape */
function rowToProfile(p) {
  return {
    id:            p.id,
    name:          p.name,
    tagline:       p.tagline  || '',
    avatar:        p.avatar_url || '',
    colorTheme:    p.color_theme || 'cyan',
    currentStreak: p.current_streak || 0,
    bestStreak:    p.best_streak    || 0,
    lastTickedDate:p.last_ticked_date || null,
    history:       p.history ? (typeof p.history === 'string' ? JSON.parse(p.history) : p.history) : {},
    isAdmin:       p.is_admin || false
  };
}

/** Convert app profile → Supabase DB row shape */
function profileToRow(p) {
  return {
    id:              p.id,
    is_admin:        p.isAdmin || false,
    name:            p.name,
    tagline:         p.tagline         || '',
    avatar_url:      p.avatar          || '',
    color_theme:     p.colorTheme      || 'cyan',
    current_streak:  p.currentStreak   || 0,
    best_streak:     p.bestStreak      || 0,
    last_ticked_date:p.lastTickedDate  || null,
    history:         JSON.stringify(p.history || {})
  };
}

/* ── Habit config ─────────────────────────────────────────────── */

export function loadHabitConfig() {
  try {
    const raw = localStorage.getItem(HABIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    title:       'Daily 30-Min Fitness Workout',
    category:    'Fitness & Health',
    description: 'Complete at least 30 minutes of physical exercise every calendar day.'
  };
}

export function saveHabitConfig(habit) {
  try { localStorage.setItem(HABIT_KEY, JSON.stringify(habit)); } catch (e) {}
  if (supabase) {
    supabase.from('habit_config')
      .upsert({ id: 1, title: habit.title, category: habit.category, description: habit.description })
      .then(() => {}).catch(() => {});
  }
}

/* ── Local profiles ───────────────────────────────────────────── */

export function loadLocalProfiles() {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const today  = getEffectiveDate();
    const out    = {};
    Object.keys(parsed).forEach(id => {
      out[id] = calibrateUserStreak(parsed[id], today);
    });
    return out;
  } catch (e) { return {}; }
}

function persistLocalProfiles(profilesMap) {
  try { localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profilesMap)); } catch (e) {}
}

/**
 * MERGE a set of cloud profiles into the current local profile map.
 * Local entries with the SAME id are only overwritten when the cloud
 * version is strictly newer (higher streak, or same streak but has a
 * lastTickedDate).  A device's OWN profile is NEVER overwritten from
 * the cloud during a simple read — only from explicit saves.
 */
function mergeProfiles(local, cloudRows, myDeviceId) {
  const today  = getEffectiveDate();
  const merged = { ...local };

  cloudRows.forEach(row => {
    const cloudProfile = calibrateUserStreak(rowToProfile(row), today);
    const existing     = merged[cloudProfile.id];

    // Never overwrite this device's own profile from a cloud read —
    // the local version (just saved) is authoritative.
    if (cloudProfile.id === myDeviceId) return;

    if (!existing) {
      merged[cloudProfile.id] = cloudProfile;
    } else {
      // Keep whichever has the higher streak (cloud wins ties so
      // a tick from another device always comes through).
      if (cloudProfile.currentStreak >= existing.currentStreak) {
        merged[cloudProfile.id] = {
          ...cloudProfile,
          bestStreak: Math.max(cloudProfile.bestStreak, existing.bestStreak),
          history:    { ...(existing.history || {}), ...(cloudProfile.history || {}) }
        };
      }
    }
  });

  return merged;
}

/* ── Save a profile ───────────────────────────────────────────── */

export async function saveProfileToStorage(profile) {
  try {
    const today      = getEffectiveDate();
    const calibrated = calibrateUserStreak(profile, today);

    // 1. Write to local storage FIRST — this is instant & authoritative
    const allLocal   = loadLocalProfiles();
    allLocal[calibrated.id] = calibrated;
    persistLocalProfiles(allLocal);

    // 2. Push to Supabase in background — non-blocking
    if (supabase) {
      supabase.from('profiles')
        .upsert(profileToRow(calibrated))
        .then(() => {})
        .catch(err => console.warn('Supabase upsert:', err.message));
    }

    return calibrated;
  } catch (e) {
    console.error('saveProfileToStorage error:', e);
    return profile;
  }
}

/* ── Real-time subscription ───────────────────────────────────── */

export function subscribeToProfiles(onProfilesUpdated) {
  if (typeof window === 'undefined') return () => {};

  const myDeviceId = getDeviceId();

  // Same-browser multi-tab sync
  const handleStorage = (event) => {
    if (event.key === LOCAL_PROFILES_KEY) {
      onProfilesUpdated(loadLocalProfiles());
    }
  };
  window.addEventListener('storage', handleStorage);

  let supabaseChannel;

  if (supabase) {
    // ── Initial cloud fetch: MERGE, never replace ──────────────
    supabase.from('profiles').select('*').then(({ data: rows, error }) => {
      if (error || !rows || rows.length === 0) return;

      const local  = loadLocalProfiles();
      const merged = mergeProfiles(local, rows, myDeviceId);

      persistLocalProfiles(merged);
      onProfilesUpdated({ ...merged });
    }).catch(() => {});

    // ── Realtime: merge single-row updates ─────────────────────
    try {
      supabaseChannel = supabase
        .channel('realtime:profiles')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          (payload) => {
            const row = payload.new;
            if (!row) return;

            // Skip echoes of our own saves (already in local storage)
            if (row.id === myDeviceId) return;

            const today   = getEffectiveDate();
            const updated = calibrateUserStreak(rowToProfile(row), today);
            const current = loadLocalProfiles();

            const existing = current[updated.id];
            const merged   = { ...current };

            if (!existing || updated.currentStreak >= existing.currentStreak) {
              merged[updated.id] = {
                ...updated,
                bestStreak: Math.max(updated.bestStreak, existing?.bestStreak || 0),
                history:    { ...(existing?.history || {}), ...(updated.history || {}) }
              };
              persistLocalProfiles(merged);
              onProfilesUpdated({ ...merged });
            }
          }
        )
        .subscribe();
    } catch (e) {}
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (supabaseChannel && supabase) supabase.removeChannel(supabaseChannel);
  };
}

/* ── Admin helpers ───────────────────────────────────────────── */

/**
 * Grant admin status to a profile (by ID).
 * Only the calling device should do this for itself.
 */
export async function claimAdminStatus(profileId) {
  try {
    const local = loadLocalProfiles();
    if (local[profileId]) {
      local[profileId].isAdmin = true;
      persistLocalProfiles(local);
    }
    if (supabase) {
      await supabase.from('profiles')
        .update({ is_admin: true })
        .eq('id', profileId);
    }
  } catch (e) {
    console.warn('claimAdminStatus error:', e);
  }
}

/**
 * Remove a profile entirely (admin only).
 * Deletes from both local storage and Supabase.
 */
export async function removeProfileFromStorage(targetId) {
  try {
    // Remove from local
    const local = loadLocalProfiles();
    delete local[targetId];
    persistLocalProfiles(local);

    // Remove from Supabase
    if (supabase) {
      await supabase.from('checkins').delete().eq('user_id', targetId);
      await supabase.from('profiles').delete().eq('id', targetId);
    }
    return { ...local };
  } catch (e) {
    console.error('removeProfileFromStorage error:', e);
    return loadLocalProfiles();
  }
}
