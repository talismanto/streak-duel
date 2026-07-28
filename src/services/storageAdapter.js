import { calibrateUserStreak, formatDate } from './streakEngine';
import { createClient } from '@supabase/supabase-js';

const DEVICE_ID_KEY = 'streak_duel_device_user_id';
const LOCAL_PROFILES_KEY = 'streak_duel_profiles_v2';
const HABIT_KEY = 'streak_duel_habit_v2';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Gets or creates the unique ID for THIS specific device
 */
export function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'usr_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function getEffectiveDate() {
  return formatDate(new Date());
}

/**
 * Load default local habit config
 */
export function loadHabitConfig() {
  try {
    const raw = localStorage.getItem(HABIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    title: 'Daily 30-Min Fitness Workout',
    category: 'Fitness & Health',
    description: 'Complete at least 30 minutes of physical exercise every calendar day.'
  };
}

export function saveHabitConfig(habit) {
  try {
    localStorage.setItem(HABIT_KEY, JSON.stringify(habit));
    if (supabase) {
      supabase.from('habit_config').upsert({ id: 1, title: habit.title, category: habit.category, description: habit.description }).then(() => {}).catch(() => {});
    }
  } catch (e) {}
}

/**
 * Reads all active profiles locally
 */
export function loadLocalProfiles() {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const today = getEffectiveDate();
      const calibrated = {};
      Object.keys(parsed).forEach((id) => {
        calibrated[id] = calibrateUserStreak(parsed[id], today);
      });
      return calibrated;
    }
  } catch (e) {}
  return {};
}

/**
 * Saves profile locally and syncs to Supabase Cloud if connected
 */
export async function saveProfileToStorage(profile) {
  try {
    const today = getEffectiveDate();
    const calibrated = calibrateUserStreak(profile, today);
    
    // Save to local storage
    const allLocal = loadLocalProfiles();
    allLocal[calibrated.id] = calibrated;
    localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(allLocal));

    // Save to Supabase Cloud DB
    if (supabase) {
      await supabase.from('profiles').upsert({
        id: calibrated.id,
        name: calibrated.name,
        tagline: calibrated.tagline || '',
        avatar_url: calibrated.avatar || '',
        color_theme: calibrated.colorTheme || 'cyan',
        current_streak: calibrated.currentStreak || 0,
        best_streak: calibrated.bestStreak || 0,
        last_ticked_date: calibrated.lastTickedDate || null
      });
    }
    return calibrated;
  } catch (e) {
    console.error('Save profile error:', e);
    return profile;
  }
}

/**
 * Subscribe to Supabase Realtime profiles & local tab storage
 */
export function subscribeToProfiles(onProfilesUpdated) {
  if (typeof window === 'undefined') return () => {};

  // Local storage tab listener
  const handleStorage = (event) => {
    if (event.key === LOCAL_PROFILES_KEY) {
      onProfilesUpdated(loadLocalProfiles());
    }
  };
  window.addEventListener('storage', handleStorage);

  let supabaseChannel;

  if (supabase) {
    // Initial fetch from cloud database
    supabase.from('profiles').select('*').then(({ data: cloudProfiles }) => {
      if (cloudProfiles && cloudProfiles.length > 0) {
        const today = getEffectiveDate();
        const profilesMap = {};
        cloudProfiles.forEach((p) => {
          profilesMap[p.id] = calibrateUserStreak({
            id: p.id,
            name: p.name,
            tagline: p.tagline,
            avatar: p.avatar_url,
            colorTheme: p.color_theme || 'cyan',
            currentStreak: p.current_streak || 0,
            bestStreak: p.best_streak || 0,
            lastTickedDate: p.last_ticked_date
          }, today);
        });

        // Save locally and update state
        localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profilesMap));
        onProfilesUpdated(profilesMap);
      }
    }).catch(() => {});

    // Listen for Realtime DB changes from other devices
    try {
      supabaseChannel = supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
          const p = payload.new;
          if (!p) return;
          const today = getEffectiveDate();
          const updatedProfile = calibrateUserStreak({
            id: p.id,
            name: p.name,
            tagline: p.tagline,
            avatar: p.avatar_url,
            colorTheme: p.color_theme || 'cyan',
            currentStreak: p.current_streak || 0,
            bestStreak: p.best_streak || 0,
            lastTickedDate: p.last_ticked_date
          }, today);

          const current = loadLocalProfiles();
          current[updatedProfile.id] = updatedProfile;
          localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(current));
          onProfilesUpdated({ ...current });
        })
        .subscribe();
    } catch (e) {}
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (supabaseChannel && supabase) supabase.removeChannel(supabaseChannel);
  };
}
