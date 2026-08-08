import React, { useState, useEffect, useCallback } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ProfileBuilder } from './components/ProfileBuilder';
import { EditProfileModal } from './components/EditProfileModal';
import { Header } from './components/Header';
import { DuelDashboard } from './components/DuelDashboard';
import { HistoryHeatmap } from './components/HistoryHeatmap';
import { HabitCustomizerModal } from './components/HabitCustomizerModal';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { InviteModal } from './components/InviteModal';
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

// App has 3 views: 'welcome', 'profile-setup', 'dashboard'
const ONBOARDED_KEY = 'streak_duel_onboarded_v2';

export function App() {
  const [myDeviceId] = useState(() => getDeviceId());
  const [habit, setHabit] = useState(() => loadHabitConfig());
  const [profiles, setProfiles] = useState(() => loadLocalProfiles());

  // Determine initial view
  const [view, setView] = useState(() => {
    const allProfiles = loadLocalProfiles();
    const deviceId = (() => {
      let id = localStorage.getItem('streak_duel_device_user_id');
      if (!id) { id = 'usr_' + Math.random().toString(36).substring(2, 9); localStorage.setItem('streak_duel_device_user_id', id); }
      return id;
    })();
    if (allProfiles[deviceId]) return 'dashboard';
    if (localStorage.getItem(ONBOARDED_KEY)) return 'profile-setup';
    return 'welcome';
  });

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const myProfile = profiles[myDeviceId] || null;

  // Subscribe to real-time updates from other devices
  useEffect(() => {
    const unsubscribe = subscribeToProfiles((updatedProfiles) => {
      setProfiles(updatedProfiles);
    });
    return unsubscribe;
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem(ONBOARDED_KEY, '1');
    setView('profile-setup');
  };

  const handleSaveProfile = useCallback(async (profileData) => {
    const existing = profiles[myDeviceId] || {};
    const updated = {
      ...existing,
      id: myDeviceId,
      name: profileData.name,
      tagline: profileData.tagline || '',
      avatar: profileData.avatar,
      colorTheme: profileData.colorTheme,
      currentStreak: existing.currentStreak || 0,
      bestStreak: existing.bestStreak || 0,
      lastTickedDate: existing.lastTickedDate || null,
      history: existing.history || {}
    };

    const saved = await saveProfileToStorage(updated);
    setProfiles(prev => ({ ...prev, [myDeviceId]: saved }));
    setShowEditProfile(false);
    setView('dashboard');
  }, [myDeviceId, profiles]);

  const handleTick = useCallback(async (userToTick) => {
    if (userToTick.id !== myDeviceId) return;
    try {
      const today = getEffectiveDate();
      const updatedUser = recordTick(userToTick, today);
      const saved = await saveProfileToStorage(updatedUser);
      setProfiles(prev => ({ ...prev, [myDeviceId]: saved }));
    } catch (e) {
      console.warn('Tick error:', e.message);
    }
  }, [myDeviceId]);

  const handleSaveHabit = useCallback((habitData) => {
    setHabit(habitData);
    saveHabitConfig(habitData);
  }, []);

  // ---- VIEWS ----

  if (view === 'welcome') {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  if (view === 'profile-setup') {
    return (
      <ProfileBuilder
        existingProfile={null}
        onSave={handleSaveProfile}
        isEditMode={false}
      />
    );
  }

  // Dashboard view
  return (
    <div className="app-viewport">
      <Header
        habit={habit}
        myProfile={myProfile}
        onOpenEditProfile={() => setShowEditProfile(true)}
        onOpenHabitModal={() => setShowHabitModal(true)}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        onOpenInviteModal={() => setShowInviteModal(true)}
      />

      <main>
        <DuelDashboard
          profiles={profiles}
          myDeviceId={myDeviceId}
          onTick={handleTick}
        />
      </main>

      <HistoryHeatmap profiles={profiles} />

      <footer style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.75rem', color: '#64748b' }}>
        StreakDuel &bull; Each device = one unique profile &bull; Synced via Supabase Cloud
      </footer>

      {/* Modals */}
      {showEditProfile && (
        <EditProfileModal
          currentProfile={myProfile}
          onSave={handleSaveProfile}
          onClose={() => setShowEditProfile(false)}
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

      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
