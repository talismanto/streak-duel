import { calibrateUserStreak, recordTick, getLeaderboardStatus, getCalendarDaysDiff } from './streakEngine';

describe('StreakEngine Business & Reset Rules', () => {
  const mockDateToday = '2026-07-26';
  const mockDateYesterday = '2026-07-25';
  const mockDateTwoDaysAgo = '2026-07-24';

  test('consecutive day tick increments streak by +1', () => {
    const user = {
      id: 'user_a',
      name: 'Alex',
      currentStreak: 4,
      bestStreak: 10,
      lastTickedDate: mockDateYesterday,
      history: { [mockDateYesterday]: true }
    };

    const updated = recordTick(user, mockDateToday);
    expect(updated.currentStreak).toBe(5);
    expect(updated.bestStreak).toBe(10);
    expect(updated.isTickedToday).toBe(true);
    expect(updated.lastTickedDate).toBe(mockDateToday);
  });

  test('ticking when best streak is surpassed updates best streak', () => {
    const user = {
      id: 'user_a',
      name: 'Alex',
      currentStreak: 5,
      bestStreak: 5,
      lastTickedDate: mockDateYesterday,
      history: { [mockDateYesterday]: true }
    };

    const updated = recordTick(user, mockDateToday);
    expect(updated.currentStreak).toBe(6);
    expect(updated.bestStreak).toBe(6);
  });

  test('STRICT RESET: missing yesterday wipes active streak to 0', () => {
    const user = {
      id: 'user_a',
      name: 'Alex',
      currentStreak: 12,
      bestStreak: 20,
      lastTickedDate: mockDateTwoDaysAgo, // missed yesterday!
      history: { [mockDateTwoDaysAgo]: true }
    };

    const calibrated = calibrateUserStreak(user, mockDateToday);
    expect(calibrated.currentStreak).toBe(0);
    expect(calibrated.bestStreak).toBe(20); // Preserves record!
    expect(calibrated.isTickedToday).toBe(false);
  });

  test('NO BACKDATING: double ticking on same day throws error', () => {
    const user = {
      id: 'user_a',
      name: 'Alex',
      currentStreak: 1,
      bestStreak: 5,
      lastTickedDate: mockDateToday,
      history: { [mockDateToday]: true }
    };

    expect(() => recordTick(user, mockDateToday)).toThrow("Already checked in for today!");
  });

  test('leaderboard calculates lead margin correctly', () => {
    const userA = { id: 'user_a', name: 'Alex', currentStreak: 5 };
    const userB = { id: 'user_b', name: 'Sam', currentStreak: 2 };

    const status = getLeaderboardStatus(userA, userB);
    expect(status.isTie).toBe(false);
    expect(status.leaderId).toBe('user_a');
    expect(status.margin).toBe(3);
  });
});
