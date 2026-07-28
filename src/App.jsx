import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DuelDashboard } from './components/DuelDashboard';
import { HistoryHeatmap } from './components/HistoryHeatmap';
import { HabitCustomizerModal } from './components/HabitCustomizerModal';
import { TimeTravelModal } from './components/TimeTravelModal';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { 
  loadAppState, 
  saveAppState, 
  resetToDemoState, 
  subscribeToStorageUpdates, 
  getEffectiveDate 
} from './services/storageAdapter';
import { recordTick, calibrateUserStreak } from './services/streakEngine';

export function App() {
  const [appState, setAppState] = useState(() => loadAppState());
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showTimeTravelModal, setShowTimeTravelModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  // Subscribe to multi-tab state sync
  useEffect(() => {
    const unsubscribe = subscribeToStorageUpdates((newState) => {
      setAppState(newState);
    });
    return unsubscribe;
  }, []);

  // Periodic calibration check (runs every 10 seconds to auto-wipe at midnight)
  useEffect(() => {
    const checkMidnight = () => {
      setAppState((prev) => {
        const effectiveDate = getEffectiveDate(prev);
        const calibratedA = calibrateUserStreak(prev.users.user_a, effectiveDate);
        const calibratedB = calibrateUserStreak(prev.users.user_b, effectiveDate);

        // Check if calibration modified streaks or status
        if (
          calibratedA.currentStreak !== prev.users.user_a.currentStreak ||
          calibratedB.currentStreak !== prev.users.user_b.currentStreak ||
          calibratedA.isTickedToday !== prev.users.user_a.isTickedToday ||
          calibratedB.isTickedToday !== prev.users.user_b.isTickedToday
        ) {
          const updated = {
            ...prev,
            users: {
              user_a: calibratedA,
              user_b: calibratedB
            }
          };
          saveAppState(updated);
          return updated;
        }
        return prev;
      });
    };

    const interval = setInterval(checkMidnight, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handler for ticking today for active user
  const handleTick = useCallback((userId) => {
    setAppState((prev) => {
      const effectiveDate = getEffectiveDate(prev);
      const targetUser = prev.users[userId];
      
      const updatedUser = recordTick(targetUser, effectiveDate);
      const updatedState = {
        ...prev,
        users: {
          ...prev.users,
          [userId]: updatedUser
        }
      };

      saveAppState(updatedState);
      return updatedState;
    });
  }, []);

  // Handler for switching active profile actor
  const handleSwitchUser = useCallback((userId) => {
    setAppState((prev) => {
      const updated = { ...prev, activeUserId: userId };
      saveAppState(updated);
      return updated;
    });
  }, []);

  // Handler for customizing active habit challenge
  const handleSaveHabit = useCallback((habitData) => {
    setAppState((prev) => {
      const updated = {
        ...prev,
        habit: {
          ...prev.habit,
          ...habitData
        }
      };
      saveAppState(updated);
      return updated;
    });
  }, []);

  // Time travel debug handlers
  const handleAdvanceDays = useCallback((daysCount) => {
    setAppState((prev) => {
      const newOffset = (prev.simulatedDateOffsetDays || 0) + daysCount;
      const tempState = { ...prev, simulatedDateOffsetDays: newOffset };
      const effectiveDate = getEffectiveDate(tempState);

      const calibratedState = {
        ...tempState,
        users: {
          user_a: calibrateUserStreak(prev.users.user_a, effectiveDate),
          user_b: calibrateUserStreak(prev.users.user_b, effectiveDate)
        }
      };

      saveAppState(calibratedState);
      return calibratedState;
    });
  }, []);

  const handleResetSimulatedTime = useCallback(() => {
    setAppState((prev) => {
      const tempState = { ...prev, simulatedDateOffsetDays: 0 };
      const effectiveDate = getEffectiveDate(tempState);

      const calibratedState = {
        ...tempState,
        users: {
          user_a: calibrateUserStreak(prev.users.user_a, effectiveDate),
          user_b: calibrateUserStreak(prev.users.user_b, effectiveDate)
        }
      };

      saveAppState(calibratedState);
      return calibratedState;
    });
  }, []);

  const handleResetDemoState = useCallback(() => {
    const fresh = resetToDemoState();
    setAppState(fresh);
  }, []);

  return (
    <div className="app-viewport">
      {/* Header Bar */}
      <Header 
        habit={appState.habit}
        activeUserId={appState.activeUserId}
        users={appState.users}
        onSwitchUser={handleSwitchUser}
        onOpenHabitModal={() => setShowHabitModal(true)}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        onOpenTimeTravelModal={() => setShowTimeTravelModal(true)}
        simulatedDateOffset={appState.simulatedDateOffsetDays || 0}
      />

      {/* Main Duel Battleground */}
      <main>
        <DuelDashboard 
          users={appState.users}
          activeUserId={appState.activeUserId}
          onTick={handleTick}
          onSwitchUser={handleSwitchUser}
        />
      </main>

      {/* 14-Day History Heatmap */}
      <HistoryHeatmap 
        users={appState.users} 
        simulatedDateOffset={appState.simulatedDateOffsetDays || 0}
      />

      {/* Footer info */}
      <footer style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.8rem', color: '#64748b' }}>
        StreakDuel &bull; 2-Player Daily Habit Competition Engine &bull; Strict Midnight Reset Active
      </footer>

      {/* Modals */}
      {showHabitModal && (
        <HabitCustomizerModal 
          habit={appState.habit}
          onSave={handleSaveHabit}
          onClose={() => setShowHabitModal(false)}
        />
      )}

      {showTimeTravelModal && (
        <TimeTravelModal 
          simulatedDateOffset={appState.simulatedDateOffsetDays || 0}
          onAdvanceDays={handleAdvanceDays}
          onResetSimulatedTime={handleResetSimulatedTime}
          onResetDemoState={handleResetDemoState}
          onClose={() => setShowTimeTravelModal(false)}
        />
      )}

      {showSupabaseModal && (
        <SupabaseGuideModal 
          onClose={() => setShowSupabaseModal(false)}
        />
      )}
    </div>
  );
}
