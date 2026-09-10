import { useState, useEffect } from 'react';
import {
  User, Mail, BookOpen, Trophy, LogOut,
  CheckCircle2, BookMarked, KeyRound, Save, X, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchAllQuizzes } from '../services/quizService.js';

export default function ProfilePage({ onNavigate }) {
  const { user, signOut, getUserDisplayName, getUserCourse, updateProfile, updatePassword } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // Edit Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Change Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const name   = getUserDisplayName();
  const course = getUserCourse();
  const email  = user?.email || '';
  const initial = name.charAt(0).toUpperCase() || email.charAt(0).toUpperCase() || 'U';

  const isGoogle = user?.app_metadata?.provider === 'google' ||
    user?.identities?.some((id) => id.provider === 'google');

  useEffect(() => {
    setEditName(name);
    setEditCourse(course);
  }, [name, course]);

  useEffect(() => {
    if (!user) return;
    fetchAllQuizzes(user.id)
      .then((data) => setQuizzes(data))
      .catch(() => {})
      .finally(() => setLoadingQuizzes(false));
  }, [user]);

  const totalQuestions = quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setProfileMessage({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }
    setProfileSaving(true);
    setProfileMessage({ type: '', text: '' });
    try {
      await updateProfile({ full_name: editName, course: editCourse });
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
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage({ type: '', text: '' });
    try {
      await updatePassword(newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6 animate-fade-in">

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
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{name}</h1>
              {course && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5ba72]/15 border border-[#f5ba72]/25 text-[#f5ba72]">
                  <BookOpen className="w-3 h-3" />
                  {course}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
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
          <form onSubmit={handleSaveProfile} className="p-4 rounded-xl bg-white/[0.04] border border-[#f5ba72]/30 space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Update Profile Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#a39e94] block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your full name"
                  className="input-field text-xs sm:text-sm py-2 px-3 w-full"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[#a39e94] block mb-1">Course / Degree</label>
                <input
                  type="text"
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  placeholder="e.g. BCA, B.Tech, MCA"
                  className="input-field text-xs sm:text-sm py-2 px-3 w-full"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="btn-ghost py-1.5 px-3 text-xs"
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

        {/* User Details (Without Auth Method) */}
        <div className="space-y-3 pt-2 border-t border-white/[0.08]">
          {[
            { icon: User,       label: 'Full Name',    value: name },
            { icon: Mail,       label: 'Email',        value: email },
            { icon: BookMarked, label: 'Course',      value: course || 'Not set' },
            memberSince ? { icon: Trophy, label: 'Member Since', value: memberSince } : null,
          ].filter(Boolean).map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-[#f5ba72]/10 border border-[#f5ba72]/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#f5ba72]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-[#8d877c] uppercase tracking-wide">{row.label}</p>
                  <p className="text-sm text-white font-medium truncate">{row.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Change Password Card ── */}
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
              <label className="text-xs text-[#a39e94] block mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
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
