import { useState, useEffect } from 'react';
import {
  User, Mail, BookOpen, Trophy, LogOut,
  CheckCircle2, BookMarked, KeyRound, Save, X, AlertCircle, Eye, EyeOff, Lock, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchAllQuizzes } from '../services/quizService.js';
import { getGamificationData, BADGES_CATALOG, getBadgeLevel, getBadgeDetails } from '../services/gamificationService.js';
import BadgeIcon from '../components/common/BadgeIcon.jsx';

const COURSE_OPTIONS = [
  'BCA', 'MCA', 'BCS', 'BECE', 'B.Tech (CS)', 'B.Tech (EC)', 'B.Tech (IT)',
  'B.Sc (CS)', 'B.Sc (IT)', 'MBA', 'BBA', 'BA', 'B.Com', 'Other',
];

export default function ProfilePage({ onNavigate }) {
  const {
    user,
    isGuest,
    signOut,
    getUserDisplayName,
    getUserFullName,
    getUserUsername,
    getUserCourse,
    updateProfile,
    updatePassword,
  } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // User Identifiers
  const displayName = getUserDisplayName();
  const fullName    = getUserFullName ? getUserFullName() : (user?.fullName || '');
  const username    = getUserUsername ? getUserUsername() : (user?.username || '');
  const course      = getUserCourse();
  const email       = user?.email || '';
  const initial     = displayName.charAt(0).toUpperCase() || 'U';

  const isGoogle = user?.app_metadata?.provider === 'google' ||
    user?.identities?.some((id) => id.provider === 'google');

  // Edit Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(fullName);
  const [editCourse, setEditCourse] = useState(course);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Change Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setEditFullName(fullName);
    setEditCourse(course);
  }, [fullName, course]);

  useEffect(() => {
    if (!user) return;
    fetchAllQuizzes(user.id)
      .then((data) => setQuizzes(data))
      .catch(() => {})
      .finally(() => setLoadingQuizzes(false));
  }, [user]);

  const totalQuestions = quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);
  const gamificationData = getGamificationData(user?.id);
  const unlockedBadgesCount = BADGES_CATALOG.filter((b) => getBadgeLevel(gamificationData?.unlockedBadges, b.id) > 0).length;

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage({ type: '', text: '' });
    try {
      await updateProfile({ full_name: editFullName.trim(), course: editCourse });
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingProfile(false);
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage({ type: '', text: '' });
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">

      {/* ── Back ── */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="btn-ghost text-xs -ml-2 mb-2"
      >
        ← Back to Home
      </button>

      {/* ── Profile Card ── */}
      <div className="glass-card p-6 sm:p-8 border-white/10 space-y-6">
        {/* Avatar + name */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f5ba72] to-[#e59d4c] text-[#1b1206] font-extrabold text-3xl flex items-center justify-center shadow-caramel-glow">
                {initial}
              </div>
              {isGoogle && (
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md" title="Google Account">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{displayName}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                {course && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5ba72]/15 border border-[#f5ba72]/25 text-[#f5ba72]">
                    <BookOpen className="w-3 h-3" />
                    {course}
                  </div>
                )}
                {user?.authType === 'username' && username && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono text-[#8d877c] bg-white/[0.04] border border-white/[0.08]">
                    <span>@{username}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-emerald-400 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Account</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsEditingProfile(!isEditingProfile);
              setProfileMessage({ type: '', text: '' });
            }}
            className="btn-secondary py-1.5 px-3.5 text-xs flex items-center gap-1.5 self-center sm:self-start"
          >
            <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Profile Alert feedback */}
        {profileMessage.text && (
          <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in ${
            profileMessage.type === 'error'
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
          }`}>
            {profileMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{profileMessage.text}</span>
          </div>
        )}

        {/* Inline Edit Profile Form */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="p-4 sm:p-5 rounded-xl bg-white/[0.04] border border-[#f5ba72]/30 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Update Profile Details</h3>
              <span className="text-[10px] text-[#8d877c]">Username is fixed & cannot be edited</span>
            </div>

            {/* Read-Only Username Callout */}
            {user?.authType === 'username' && (
              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8d877c] tracking-wider block">Username (Unique ID)</span>
                  <span className="text-xs sm:text-sm font-mono text-[#f5ba72] font-semibold">@{username}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-[#8d877c]">
                  <Lock className="w-3 h-3 text-[#f5ba72]" />
                  <span>Permanent ID</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-[#a39e94] block mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="input-field text-xs sm:text-sm py-2 px-3 w-full"
                />
                <p className="text-[10px] text-[#8d877c] mt-1">
                  This name will be shown on the website (Navbar, Dashboard, Results). If left blank, your username will be used.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a39e94] block mb-1">Course / Program</label>
                <select
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  className="input-field text-xs sm:text-sm py-2 px-3 w-full appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select your course</option>
                  {COURSE_OPTIONS.map((c) => (
                    <option key={c} value={c} className="bg-[#1b1713] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="btn-ghost py-1.5 px-3.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileSaving}
                className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5"
              >
                {profileSaving ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#1b1206]/40 border-t-[#1b1206] rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* User Details (Settings list) */}
        <div className="space-y-3 pt-2 border-t border-white/[0.08]">
          {[
            user?.authType === 'username'
              ? {
                  icon: Lock,
                  label: 'Username',
                  value: `@${username}`,
                  tag: 'Cannot be changed',
                }
              : null,
            {
              icon: User,
              label: 'Display Name',
              value: fullName ? fullName : `${username} (Default - edit profile to set)`,
            },
            !isGoogle && user?.authType === 'username'
              ? null
              : { icon: Mail, label: 'Email', value: email },
            { icon: BookMarked, label: 'Selected Course', value: course || 'Not set' },
            memberSince ? { icon: Trophy, label: 'Account Created', value: memberSince } : null,
          ].filter(Boolean).map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#f5ba72]/10 border border-[#f5ba72]/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#f5ba72]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-[#8d877c] uppercase tracking-wide">{row.label}</p>
                    <p className="text-sm text-white font-medium truncate">{row.value}</p>
                  </div>
                </div>
                {row.tag && (
                  <span className="text-[10px] font-medium text-[#8d877c] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] shrink-0 ml-2">
                    {row.tag}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* ── Change Password Card ── */}
      {!isGoogle && !isGuest && (
        <div className="glass-card p-5 sm:p-6 border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#f5ba72]" />
              <h2 className="text-sm font-bold text-white">Password & Security</h2>
            </div>
            <button
              onClick={() => {
                setIsChangingPassword(!isChangingPassword);
                setPasswordMessage({ type: '', text: '' });
              }}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {passwordMessage.text && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in ${
              passwordMessage.type === 'error'
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
            }`}>
              {passwordMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          {isChangingPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-3 pt-2 animate-fade-in">
              <div>
                <label className="text-xs text-[#a39e94] block mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="input-field text-xs sm:text-sm py-2 px-3 pr-10 w-full"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d877c] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#a39e94] block mb-1">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="input-field text-xs sm:text-sm py-2 px-3 w-full"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#a39e94] block mb-1">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="input-field text-xs sm:text-sm py-2 px-3 w-full"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="btn-ghost py-1.5 px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  {passwordSaving ? (
                    <span className="w-3.5 h-3.5 border-2 border-[#1b1206]/40 border-t-[#1b1206] rounded-full animate-spin" />
                  ) : (
                    <KeyRound className="w-3.5 h-3.5" />
                  )}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-[#8d877c]">
              Need to update your login password? Click the button above to set a new password.
            </p>
          )}
        </div>
      )}
      {/* ── Quiz Stats ── */}
      <div className="glass-card p-5 sm:p-6 border-white/10">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#f5ba72]" />
          Your Quiz Stats
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Quizzes Created', value: loadingQuizzes ? '…' : quizzes.length },
            { label: 'Total Questions', value: loadingQuizzes ? '…' : totalQuestions },
          ].map((s) => (
            <div key={s.label} className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-2xl font-extrabold text-[#f5ba72]">{s.value}</p>
              <p className="text-[11px] text-[#8d877c] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button
            onClick={() => onNavigate('list')}
            className="btn-secondary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>View My Quizzes</span>
          </button>
          <button
            onClick={() => onNavigate('create')}
            className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <span>Create Quiz</span>
          </button>
        </div>
      </div>

      {/* ── Badges & Achievements Showcase (3-Tier Progressive System) ── */}
      <div className="glass-card p-5 sm:p-7 border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-[#f5ba72]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Achievements & Masteries</h2>
              <p className="text-xs text-[#8d877c]">
                3 progressive tiers per achievement. Quality standard: ≥ 80% accuracy required.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#f5ba72] self-start sm:self-auto">
            {unlockedBadgesCount} / {BADGES_CATALOG.length} Badges Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BADGES_CATALOG.map((badge) => {
            const level = getBadgeLevel(gamificationData?.unlockedBadges, badge.id);
            const isUnlocked = level > 0;
            const isMax = level >= (badge.maxLevel || 3);
            const details = getBadgeDetails(badge, level);

            return (
              <div
                key={badge.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3.5 ${
                  isUnlocked
                    ? isMax
                      ? 'bg-gradient-to-br from-[#1c1813] to-[#141210] border-amber-500/35 shadow-[0_0_16px_rgba(245,186,114,0.08)]'
                      : 'bg-[#181512] border-white/[0.09] text-white hover:border-white/20'
                    : 'bg-white/[0.015] border-white/[0.04] opacity-65 text-[#8d877c]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <BadgeIcon id={badge.id} isUnlocked={isUnlocked} level={level} size="lg" />
                      <div>
                        <h4 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-[#a39e94]'}`}>
                          {badge.title}
                        </h4>
                        <p className="text-[11px] text-[#8d877c] mt-0.5">{badge.category}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        isMax
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : level === 2
                          ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                          : level === 1
                          ? 'bg-amber-700/25 text-amber-400 border border-amber-700/30'
                          : 'bg-white/5 text-[#6c665d] border border-white/5'
                      }`}
                    >
                      {isMax ? 'Level 3 MAX' : isUnlocked ? `Level ${level}` : 'Locked'}
                    </span>
                  </div>

                  {/* 3-Step Level Progression Track */}
                  <div className="mt-3.5 pt-3 border-t border-white/5 space-y-2.5">
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((lvlNum) => {
                        const lvlDef = badge.levels.find((l) => l.level === lvlNum);
                        const isDone = level >= lvlNum;
                        const isNext = level === lvlNum - 1;
                        return (
                          <div
                            key={lvlNum}
                            className={`p-2 rounded-lg border text-center transition-colors ${
                              isDone
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                                : isNext
                                ? 'bg-white/5 border-white/10 text-white/80'
                                : 'bg-transparent border-white/5 text-[#555047]'
                            }`}
                          >
                            <p className="text-[9px] font-bold uppercase tracking-wider">
                              Level {lvlNum} {isDone ? '✓' : ''}
                            </p>
                            <p className="text-[9px] truncate mt-0.5 opacity-85" title={lvlDef?.name}>
                              {lvlDef?.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Requirements and current status */}
                    <div className="text-[11px] leading-relaxed pt-1">
                      {isUnlocked ? (
                        <div>
                          <p className="text-[#dedbd3]">
                            <span className="text-emerald-400 font-semibold">Tier {level} Unlocked: </span>
                            {details.currentLevelDef?.description}
                          </p>
                          {!isMax && (
                            <p className="text-[#a39e94] mt-1.5 text-[10px]">
                              <span className="text-[#f5ba72] font-semibold">Next Goal (Level {level + 1}): </span>
                              {details.nextLevelDef?.reqSummary}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[#8d877c]">
                          <span className="text-[#a39e94] font-medium">To Unlock Level 1: </span>
                          {badge.levels[0]?.reqSummary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 flex items-center justify-between text-[10px] border-t border-white/5">
                  {isMax ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      ★ Mastered Achievement
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Tier {level} Active
                    </span>
                  ) : (
                    <span className="text-[#6c665d] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked (Requires ≥ 80% accuracy)
                    </span>
                  )}
                  <span className="text-[10px] text-[#6c665d] font-mono">
                    {isMax ? '3/3' : `${level}/3`} Tiers
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sign Out ── */}
      <div className="glass-card p-5 border-white/10">
        <p className="text-xs text-[#8d877c] mb-4">
          Signing out will end your current session. Your quizzes are safely stored in the cloud.
        </p>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn-danger w-full py-2.5 text-sm flex items-center justify-center gap-2"
        >
          {signingOut ? (
            <span className="w-4 h-4 border-2 border-rose-400/40 border-t-rose-400 rounded-full animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>
        </button>
      </div>

    </div>
  );
}
