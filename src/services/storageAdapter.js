import { calibrateUserStreak, formatDate } from './streakEngine';
import { createClient } from '@supabase/supabase-js';

const DEVICE_ID_KEY   = 'streak_duel_device_user_id';
const LOCAL_PROFILES_KEY = 'streak_duel_profiles_v2';
const HABIT_KEY       = 'streak_duel_habit_v2';
const WAGERS_KEY      = 'streak_duel_wagers_v2';

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
    description: 'Complete at least 30 minutes of physical exercise every calendar day.',
    wager:       '☕ Loser buys coffee'
  };
}

export function saveHabitConfig(habit) {
  try { localStorage.setItem(HABIT_KEY, JSON.stringify(habit)); } catch (e) {}
  if (supabase) {
    supabase.from('habit_config')
      .upsert({ id: 1, title: habit.title, category: habit.category, description: habit.description, wager: habit.wager })
      .then(() => {}).catch(() => {});
  }
}

export function subscribeToHabitConfig(onHabitUpdated) {
  if (typeof window === 'undefined') return () => {};

  // Fetch initial cloud habit config
  if (supabase) {
    supabase.from('habit_config').select('*').eq('id', 1).single().then(({ data }) => {
      if (data && data.title) {
        const loaded = {
          title: data.title,
          category: data.category || 'Fitness & Health',
          description: data.description || '',
          wager: data.wager || '☕ Loser buys coffee'
        };
        try { localStorage.setItem(HABIT_KEY, JSON.stringify(loaded)); } catch (e) {}
        onHabitUpdated(loaded);
      }
    }).catch(() => {});

    // Listen for Realtime changes to habit_config
    try {
      const channel = supabase
        .channel('realtime:habit_config')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'habit_config' },
          (payload) => {
            const data = payload.new;
            if (data && data.title) {
              const updated = {
                title: data.title,
                category: data.category || 'Fitness & Health',
                description: data.description || '',
                wager: data.wager || '☕ Loser buys coffee'
              };
              try { localStorage.setItem(HABIT_KEY, JSON.stringify(updated)); } catch (e) {}
              onHabitUpdated(updated);
            }
          }
        )
        .subscribe();

      return () => {
        if (supabase) supabase.removeChannel(channel);
      };
    } catch (e) {}
  }
  return () => {};
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

/* ── Wagers System ───────────────────────────────────────────── */

export function loadWagers() {
  try {
    const raw = localStorage.getItem(WAGERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function persistWagers(wagersList) {
  try {
    localStorage.setItem(WAGERS_KEY, JSON.stringify(wagersList));
  } catch (e) {}
}

export async function saveWagerToStorage(wager) {
  try {
    const current = loadWagers();
    const idx = current.findIndex(w => w.id === wager.id);
    if (idx >= 0) {
      current[idx] = wager;
    } else {
      current.unshift(wager);
    }
    persistWagers(current);

    if (supabase) {
      await supabase.from('wagers').upsert({
        id:            wager.id,
        creator_id:    wager.creatorId,
        creator_name:  wager.creatorName,
        creator_avatar:wager.creatorAvatar || '',
        target_id:     wager.targetId,
        target_name:   wager.targetName,
        target_avatar: wager.targetAvatar  || '',
        title:         wager.title,
        wager:         wager.wager,
        status:        wager.status || 'pending',
        created_at:    wager.createdAt || new Date().toISOString()
      });
    }
    return current;
  } catch (e) {
    console.error('saveWagerToStorage error:', e);
    return loadWagers();
  }
}

export async function respondToWager(wagerId, newStatus) {
  try {
    const current = loadWagers();
    const target = current.find(w => w.id === wagerId);
    if (target) {
      target.status = newStatus;
      persistWagers([...current]);

      if (supabase) {
        await supabase.from('wagers').update({ status: newStatus }).eq('id', wagerId);
      }
    }
    return loadWagers();
  } catch (e) {
    console.error('respondToWager error:', e);
    return loadWagers();
  }
}

export async function deleteWagerFromStorage(wagerId) {
  try {
    const current = loadWagers().filter(w => w.id !== wagerId);
    persistWagers(current);

    if (supabase) {
      await supabase.from('wagers').delete().eq('id', wagerId);
    }
    return current;
  } catch (e) {
    console.error('deleteWagerFromStorage error:', e);
    return loadWagers();
  }
}

function rowToWager(row) {
  return {
    id:            row.id,
    creatorId:     row.creator_id,
    creatorName:   row.creator_name,
    creatorAvatar: row.creator_avatar || '',
    targetId:      row.target_id,
    targetName:    row.target_name,
    targetAvatar:  row.target_avatar || '',
    title:         row.title,
    wager:         row.wager,
    status:        row.status || 'pending',
    createdAt:     row.created_at
  };
}

export function subscribeToWagers(onWagersUpdated) {
  if (typeof window === 'undefined') return () => {};

  // Local storage tab sync
  const handleStorage = (event) => {
    if (event.key === WAGERS_KEY) {
      onWagersUpdated(loadWagers());
    }
  };
  window.addEventListener('storage', handleStorage);

  let channel;

  if (supabase) {
    // Initial fetch from cloud
    supabase.from('wagers').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!error && data) {
        const loaded = data.map(rowToWager);
        persistWagers(loaded);
        onWagersUpdated(loaded);
      }
    }).catch(() => {});

    // Realtime channel
    try {
      channel = supabase
        .channel('realtime:wagers')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'wagers' },
          (payload) => {
            // Re-fetch all wagers on any change
            supabase.from('wagers').select('*').order('created_at', { ascending: false }).then(({ data }) => {
              if (data) {
                const loaded = data.map(rowToWager);
                persistWagers(loaded);
                onWagersUpdated(loaded);
              }
            }).catch(() => {});
          }
        )
        .subscribe();
    } catch (e) {}
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (channel && supabase) supabase.removeChannel(channel);
  };
}

