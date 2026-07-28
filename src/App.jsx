import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DuelDashboard } from './components/DuelDashboard';
import { HistoryHeatmap } from './components/HistoryHeatmap';
import { HabitCustomizerModal } from './components/HabitCustomizerModal';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { ProfileSetupModal } from './components/ProfileSetupModal';
import { 
  getDeviceId,
  getEffectiveDate,
  loadHabitConfig,
  saveHabitConfig,
  loadLocalProfiles,
  saveProfileToStorage,
  subscribeToProfiles
} from './services/storageAdapter';
import { recordTick } from './services/streakEngine';

export function App() {
  const [myDeviceId] = useState(() => getDeviceId());
  const [habit, setHabit] = useState(() => loadHabitConfig());
  const [profiles, setProfiles] = useState(() => loadLocalProfiles());

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  const myProfile = profiles[myDeviceId] || null;

  // Auto open Profile Setup modal if this device has no profile yet
  useEffect(() => {
    if (!myProfile) {
      setShowProfileModal(true);
    }
  }, [myProfile]);

  // Subscribe to real-time updates from other devices / tabs
  useEffect(() => {
    const unsubscribe = subscribeToProfiles((updatedProfiles) => {
      setProfiles(updatedProfiles);
    });
    return unsubscribe;
  }, []);

  // Save profile changes (new or edit)
  const handleSaveProfile = useCallback(async (profileData) => {
    const existing = profiles[myDeviceId] || {};
    const updated = {
      ...existing,
      id: myDeviceId,
      name: profileData.name,
      tagline: profileData.tagline,
      avatar: profileData.avatar,
      colorTheme: profileData.colorTheme,
      currentStreak: existing.currentStreak || 0,
      bestStreak: existing.bestStreak || 0,
      lastTickedDate: existing.lastTickedDate || null,
      history: existing.history || {}
    };

    const saved = await saveProfileToStorage(updated);
    setProfiles((prev) => ({
      ...prev,
      [myDeviceId]: saved
    }));
    setShowProfileModal(false);
  }, [myDeviceId, profiles]);

  // Handle Tick action for this device's profile
  const handleTick = useCallback(async (userToTick) => {
    if (userToTick.id !== myDeviceId) return;

    try {
      const today = getEffectiveDate();
      const updatedUser = recordTick(userToTick, today);
      const saved = await saveProfileToStorage(updatedUser);

      setProfiles((prev) => ({
        ...prev,
        [myDeviceId]: saved
      }));
    } catch (e) {
      console.warn('Tick error:', e.message);
    }
  }, [myDeviceId]);

  // Save Habit challenge title
  const handleSaveHabit = useCallback((habitData) => {
    setHabit(habitData);
    saveHabitConfig(habitData);
  }, []);

  return (
    <div className="app-viewport">
      {/* Header Bar */}
      <Header 
        habit={habit}
        myProfile={myProfile}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onOpenHabitModal={() => setShowHabitModal(true)}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
      />

      {/* Main Duel Dashboard */}
      <main>
        <DuelDashboard 
          profiles={profiles}
          myDeviceId={myDeviceId}
          onTick={handleTick}
        />
      </main>

      {/* 14-Day History Heatmap */}
      <HistoryHeatmap users={{ user_a: Object.values(profiles)[0] || {}, user_b: Object.values(profiles)[1] || {} }} />

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.8rem', color: '#64748b' }}>
        StreakDuel &bull; Device Profile System &bull; Multi-Device Cloud Syncing
      </footer>

      {/* Modals */}
      {showProfileModal && (
        <ProfileSetupModal 
          currentProfile={myProfile}
          isFirstTime={!myProfile}
          onSaveProfile={handleSaveProfile}
          onClose={myProfile ? () => setShowProfileModal(false) : undefined}
        />
      )}

      {showHabitModal && (
        <HabitCustomizerModal 
          habit={habit}
          onSave={handleSaveHabit}
          onClose={() => setShowHabitModal(false)}
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
