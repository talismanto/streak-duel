import React, { useState, useEffect, useCallback } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ProfileBuilder } from './components/ProfileBuilder';
import { EditProfileModal } from './components/EditProfileModal';
import { Header } from './components/Header';
import { DuelDashboard } from './components/DuelDashboard';
import { AllWagersFeed } from './components/AllWagersFeed';
import { HistoryHeatmap } from './components/HistoryHeatmap';
import { HabitCustomizerModal } from './components/HabitCustomizerModal';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { InviteModal } from './components/InviteModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { CreateWagerModal } from './components/CreateWagerModal';
import { 
  getDeviceId,
  getEffectiveDate,
  loadHabitConfig,
  saveHabitConfig,
  subscribeToHabitConfig,
  loadLocalProfiles,
  saveProfileToStorage,
  subscribeToProfiles,
  claimAdminStatus,
  removeProfileFromStorage,
  loadWagers,
  saveWagerToStorage,
  respondToWager,
  deleteWagerFromStorage,
  subscribeToWagers,
  loadComments,
  saveCommentToStorage,
  deleteCommentFromStorage,
  subscribeToComments
} from './services/storageAdapter';
import { recordTick } from './services/streakEngine';

const ONBOARDED_KEY = 'streak_duel_onboarded_v2';

export function App() {
  const [myDeviceId] = useState(() => getDeviceId());
  const [habit, setHabit]       = useState(() => loadHabitConfig());
  const [profiles, setProfiles] = useState(() => loadLocalProfiles());
  const [wagers, setWagers]     = useState(() => loadWagers());
  const [comments, setComments] = useState(() => loadComments());
  const [tab, setTab]           = useState('dashboard'); // 'dashboard' | 'wagers'

  // Determine which screen to show on load
  const [view, setView] = useState(() => {
    const allProfiles = loadLocalProfiles();
    const id = localStorage.getItem('streak_duel_device_user_id');
    if (id && allProfiles[id]) return 'dashboard';
    if (localStorage.getItem(ONBOARDED_KEY)) return 'profile-setup';
    return 'welcome';
  });

  const [showEditProfile,  setShowEditProfile]  = useState(false);
  const [showHabitModal,   setShowHabitModal]   = useState(false);
  const [showSupabaseModal,setShowSupabaseModal] = useState(false);
  const [showInviteModal,  setShowInviteModal]  = useState(false);
  const [showAdminPanel,   setShowAdminPanel]   = useState(false);
  const [showCreateWager,  setShowCreateWager]  = useState(false);

  const myProfile = profiles[myDeviceId] || null;

  // Pending wagers count sent to me
  const pendingWagersCount = (wagers || []).filter(w => w.targetId === myDeviceId && w.status === 'pending').length;

  // Subscribe to realtime updates from other devices
  useEffect(() => {
    const unsubscribeProfiles = subscribeToProfiles(updatedProfiles => {
      setProfiles(updatedProfiles);
    });
    const unsubscribeHabit = subscribeToHabitConfig(updatedHabit => {
      setHabit(updatedHabit);
    });
    const unsubscribeWagers = subscribeToWagers(updatedWagers => {
      setWagers(updatedWagers);
    });
    const unsubscribeComments = subscribeToComments(updatedComments => {
      setComments(updatedComments);
    });

    return () => {
      unsubscribeProfiles();
      unsubscribeHabit();
      unsubscribeWagers();
      unsubscribeComments();
    };
  }, []);

  /* ── Profile actions ─────────────────────────────────────── */

  const handleGetStarted = () => {
    localStorage.setItem(ONBOARDED_KEY, '1');
    setView('profile-setup');
  };

  const handleSaveProfile = useCallback(async (profileData) => {
    const existing = profiles[myDeviceId] || {};
    const isFirstProfile = Object.keys(profiles).length === 0 && !profileData.isAdmin;

    const updated = {
      ...existing,
      id:            myDeviceId,
      name:          profileData.name,
      tagline:       profileData.tagline || '',
      avatar:        profileData.avatar,
      colorTheme:    profileData.colorTheme,
      currentStreak: profileData.currentStreak ?? existing.currentStreak ?? 0,
      bestStreak:    profileData.bestStreak    ?? existing.bestStreak    ?? 0,
      lastTickedDate:profileData.lastTickedDate ?? existing.lastTickedDate ?? null,
      history:       profileData.history       ?? existing.history       ?? {},
      isAdmin:       profileData.isAdmin || existing.isAdmin || isFirstProfile
    };

    const saved = await saveProfileToStorage(updated);

    if (isFirstProfile) {
      await claimAdminStatus(myDeviceId);
    }

    setProfiles(prev => ({ ...prev, [myDeviceId]: { ...saved, isAdmin: updated.isAdmin } }));
    setShowEditProfile(false);
    setView('dashboard');
  }, [myDeviceId, profiles]);

  /* ── Tick action ─────────────────────────────────────────── */

  const handleTick = useCallback(async (userToTick, checkinData = {}) => {
    if (userToTick.id !== myDeviceId) return;
    try {
      const today = getEffectiveDate();
      const updatedUser = recordTick(userToTick, today);
      const saved = await saveProfileToStorage(updatedUser);
      setProfiles(prev => ({ ...prev, [myDeviceId]: saved }));

      // If user added text note or photo proof, automatically post it as a comment!
      if (checkinData.text || checkinData.imageUrl) {
        const checkinComment = {
          id:           'cmt_' + Math.random().toString(36).substring(2, 11),
          authorId:     myDeviceId,
          authorName:   myProfile?.name || userToTick.name,
          authorAvatar: myProfile?.avatar || userToTick.avatar || '',
          text:         checkinData.text ? `🔥 Checked in! ${checkinData.text}` : '🔥 Completed today\'s habit streak!',
          imageUrl:     checkinData.imageUrl || '',
          createdAt:    new Date().toISOString()
        };
        const updatedComments = await saveCommentToStorage(checkinComment);
        setComments(updatedComments);
      }
    } catch (e) {
      console.warn('Tick error:', e.message);
    }
  }, [myDeviceId, myProfile]);

  /* ── Comment actions ─────────────────────────────────────── */

  const handleAddComment = useCallback(async (commentData) => {
    const updated = await saveCommentToStorage(commentData);
    setComments(updated);
  }, []);

  const handleDeleteComment = useCallback(async (commentId) => {
    const updated = await deleteCommentFromStorage(commentId);
    setComments(updated);
  }, []);

  /* ── Wager actions ───────────────────────────────────────── */

  const handleSendWager = useCallback(async (wagerData) => {
    const updated = await saveWagerToStorage(wagerData);
    setWagers(updated);
  }, []);

  const handleRespondWager = useCallback(async (wagerId, status) => {
    const updated = await respondToWager(wagerId, status);
    setWagers(updated);
  }, []);

  const handleDeleteWager = useCallback(async (wagerId) => {
    const updated = await deleteWagerFromStorage(wagerId);
    setWagers(updated);
  }, []);

  /* ── Admin: remove player ────────────────────────────────── */

  const handleRemoveProfile = useCallback(async (targetId) => {
    const updated = await removeProfileFromStorage(targetId);
    setProfiles({ ...updated });
  }, []);

  /* ── Habit ───────────────────────────────────────────────── */

  const handleSaveHabit = useCallback((habitData) => {
    setHabit(habitData);
    saveHabitConfig(habitData);
  }, []);

  /* ── Views ───────────────────────────────────────────────── */

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

  /* ── Dashboard / Main View ───────────────────────────────── */
  return (
    <div className="app-viewport">
      <Header
        habit={habit}
        myProfile={myProfile}
        currentTab={tab}
        onTabChange={setTab}
        pendingWagersCount={pendingWagersCount}
        onOpenEditProfile={() => setShowEditProfile(true)}
        onOpenHabitModal={() => setShowHabitModal(true)}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        onOpenInviteModal={() => setShowInviteModal(true)}
        onOpenAdminPanel={() => setShowAdminPanel(true)}
        onOpenCreateWager={() => setShowCreateWager(true)}
      />

      <main>
        {tab === 'dashboard' ? (
          <DuelDashboard
            profiles={profiles}
            myDeviceId={myDeviceId}
            myProfile={myProfile}
            onTick={handleTick}
            habit={habit}
            wagers={wagers}
            comments={comments}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onOpenHabitModal={() => setShowHabitModal(true)}
            onOpenCreateWager={() => setShowCreateWager(true)}
            onOpenWagersTab={() => setTab('wagers')}
            onRespondWager={handleRespondWager}
          />
        ) : (
          <AllWagersFeed
            wagers={wagers}
            profiles={profiles}
            myDeviceId={myDeviceId}
            onRespondWager={handleRespondWager}
            onDeleteWager={handleDeleteWager}
            onOpenCreateWager={() => setShowCreateWager(true)}
          />
        )}
      </main>

      <HistoryHeatmap profiles={profiles} />

      <footer style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.75rem', color: '#64748b' }}>
        StreakDuel &bull; Multi-Player Habit & Wager Platform &bull; Synced via Supabase Cloud
      </footer>

      {/* ── Modals ── */}
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
          isAdmin={myProfile?.isAdmin || false}
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

      {showCreateWager && (
        <CreateWagerModal
          profiles={profiles}
          myDeviceId={myDeviceId}
          myProfile={myProfile}
          onSendWager={handleSendWager}
          onClose={() => setShowCreateWager(false)}
        />
      )}

      {showAdminPanel && myProfile?.isAdmin && (
        <AdminPanelModal
          profiles={profiles}
          myDeviceId={myDeviceId}
          onRemoveProfile={handleRemoveProfile}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
    </div>
  );
}
