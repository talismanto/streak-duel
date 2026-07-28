/**
 * Core Streak & Calendar Engine for StreakDuel
 * Enforces strict midnight resets, no backdating, and accurate calendar-day streak tracking.
 */

// Helper to get YYYY-MM-DD in ISO local date format
export function formatDate(dateObj = new Date()) {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate diff in calendar days between two YYYY-MM-DD dates
export function getCalendarDaysDiff(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 3600 * 24));
}

/**
 * Calibrates a user's streak based on current date.
 * If the user's last tick was BEFORE yesterday (i.e. days elapsed > 1),
 * their current streak strictly resets to 0.
 */
export function calibrateUserStreak(userState, currentDateStr = formatDate()) {
  const state = { ...userState };
  
  if (!state.lastTickedDate) {
    return {
      ...state,
      currentStreak: 0,
      isTickedToday: false,
    };
  }

  const daysDiff = getCalendarDaysDiff(state.lastTickedDate, currentDateStr);

  if (daysDiff === 0) {
    // Ticked today already
    return {
      ...state,
      isTickedToday: true
    };
  } else if (daysDiff === 1) {
    // Ticked yesterday, pending for today! Current streak is active and preserved.
    return {
      ...state,
      isTickedToday: false
    };
  } else {
    // Missed yesterday or older (daysDiff >= 2)! Strict reset to 0.
    return {
      ...state,
      currentStreak: 0,
      isTickedToday: false,
      lastStreakResetDate: currentDateStr
    };
  }
}

/**
 * Handles performing a check-in for today.
 * Enforces NO backdating and once-per-day restriction.
 */
export function recordTick(userState, currentDateStr = formatDate()) {
  const calibrated = calibrateUserStreak(userState, currentDateStr);

  if (calibrated.isTickedToday) {
    throw new Error("Already checked in for today!");
  }

  // Calculate new streak
  const newCurrentStreak = calibrated.currentStreak + 1;
  const newBestStreak = Math.max(calibrated.bestStreak || 0, newCurrentStreak);

  // Record history entry
  const updatedHistory = { ...(calibrated.history || {}) };
  updatedHistory[currentDateStr] = true;

  return {
    ...calibrated,
    currentStreak: newCurrentStreak,
    bestStreak: newBestStreak,
    isTickedToday: true,
    lastTickedDate: currentDateStr,
    history: updatedHistory
  };
}

/**
 * Calculates current leaderboard standing between Friend A and Friend B.
 */
export function getLeaderboardStatus(friendA, friendB) {
  const streakA = friendA.currentStreak || 0;
  const streakB = friendB.currentStreak || 0;

  if (streakA > streakB) {
    const margin = streakA - streakB;
    return {
      leaderId: friendA.id,
      leaderName: friendA.name,
      margin,
      isTie: false,
      headline: `👑 ${friendA.name} is leading by ${margin} ${margin === 1 ? 'day' : 'days'}!`,
      subtext: `${friendB.name} needs to check in to catch up.`
    };
  } else if (streakB > streakA) {
    const margin = streakB - streakA;
    return {
      leaderId: friendB.id,
      leaderName: friendB.name,
      margin,
      isTie: false,
      headline: `👑 ${friendB.name} is leading by ${margin} ${margin === 1 ? 'day' : 'days'}!`,
      subtext: `${friendA.name} needs to check in to catch up.`
    };
  } else {
    return {
      leaderId: null,
      leaderName: null,
      margin: 0,
      isTie: true,
      headline: `🤝 Neck & Neck! Tied at ${streakA} ${streakA === 1 ? 'day' : 'days'}`,
      subtext: streakA === 0 ? "Both friends need to check in today to kick off a streak!" : "Both friends are keeping the streak alive!"
    };
  }
}

/**
 * Calculates countdown remaining until local midnight (00:00:00).
 */
export function getTimeUntilMidnight(referenceDate = new Date()) {
  const now = new Date(referenceDate);
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diffMs = midnight.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    formatted: `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
  };
}
