import { calibrateUserStreak, formatDate } from './streakEngine';

const STORAGE_KEY = 'streak_duel_app_state_v1';
const BROADCAST_CHANNEL = 'STREAK_DUEL_SYNC';

const DEFAULT_INITIAL_STATE = {
  habit: {
    title: 'Daily 30-Min Fitness Workout',
    category: 'Fitness & Health',
    description: 'Complete at least 30 minutes of physical exercise every single calendar day.',
    icon: 'Dumbbell',
    createdAt: formatDate()
  },
  activeUserId: 'user_a',
  simulatedDateOffsetDays: 0, // Used for Time Travel debug mode
  users: {
    user_a: {
      id: 'user_a',
      name: 'Alex',
      tagline: 'Cardio & Strength',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      colorTheme: 'cyan',
      currentStreak: 3,
      bestStreak: 7,
      lastTickedDate: formatDate(new Date(Date.now() - 86400000)), // yesterday
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
      lastTickedDate: formatDate(new Date(Date.now() - 86400000)), // yesterday
      history: {
        [formatDate(new Date(Date.now() - 2 * 86400000))]: true,
        [formatDate(new Date(Date.now() - 1 * 86400000))]: true,
      }
    }
  }
};

/**
 * Gets effective current date considering simulated date offset (for debug testing).
 */
export function getEffectiveDate(state) {
  const offsetDays = state?.simulatedDateOffsetDays || 0;
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  return formatDate(now);
}

/**
 * Load application state from localStorage or initial defaults
 */
export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppState(DEFAULT_INITIAL_STATE);
      return DEFAULT_INITIAL_STATE;
    }
    const parsed = JSON.parse(raw);
    const effectiveDate = getEffectiveDate(parsed);

    // Calibrate streaks against effective current date
    const calibratedState = {
      ...parsed,
      users: {
        user_a: calibrateUserStreak(parsed.users.user_a, effectiveDate),
        user_b: calibrateUserStreak(parsed.users.user_b, effectiveDate)
      }
    };
    return calibratedState;
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return DEFAULT_INITIAL_STATE;
  }
}

/**
 * Save application state to localStorage and broadcast cross-tab sync
 */
export function saveAppState(state) {
  try {
    const jsonStr = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, jsonStr);
    
    // Broadcast via BroadcastChannel if available
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL);
      bc.postMessage({ type: 'STATE_UPDATED', payload: state });
      bc.close();
    }
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

/**
 * Reset application state to initial default demo state
 */
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
 * Subscribe to cross-tab updates
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
    bc = new BroadcastChannel(BROADCAST_CHANNEL);
    bc.onmessage = (event) => {
      if (event.data?.type === 'STATE_UPDATED') {
        callback(event.data.payload);
      }
    };
  }

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
    if (bc) bc.close();
  };
}
