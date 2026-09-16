import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
  requestEnterpriseKey,
  shuffleEnterpriseKey,
} from '../../store/slices/authSlice';
import { unregisterAllSystemDevices } from '../../store/slices/adminSlice';
import { systemService } from '../../services/systemService';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiErrorWarningLine,
  RiNotificationLine,
  RiAlertLine,
  RiShieldKeyholeLine,
  RiShieldUserLine,
  RiShieldStarLine,
  RiUser3Line,
  RiSettings3Line,
  RiKeyLine,
  RiFileCopyLine,
  RiCheckLine,
  RiServerLine,
  RiMailLine,
  RiLockLine,
  RiLockPasswordLine,
  RiArrowRightSLine,
  RiTerminalBoxLine,
  RiCloudLine,
  RiGlobalLine,
  RiHashtag,
  RiFingerprintLine,
} from '@remixicon/react';

// ─── Reusable Accessible Input Field ──────────────────────────────────────────
interface InputFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  helperText?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
  readOnly = false,
  required = false,
  minLength,
  placeholder,
  leftIcon,
  rightSlot,
  helperText,
}) => (
  <div className="space-y-1.5 w-full">
    <div className="flex items-center justify-between">
      <label
        htmlFor={id}
        className="block text-xs font-bold uppercase tracking-wider text-theme-text-secondary"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {disabled && (
        <span className="text-[11px] font-medium text-theme-text-muted uppercase tracking-wider">
          System Managed
        </span>
      )}
    </div>
    <div className="relative group flex items-center">
      {leftIcon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-text-muted group-focus-within:text-theme-primary-500 transition-colors pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className={`w-full ${leftIcon ? 'pl-10' : 'pl-4'} ${
          rightSlot ? 'pr-11' : 'pr-4'
        } py-3 text-base sm:text-sm bg-white dark:bg-slate-800/80 text-theme-text-primary border border-theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500/30 focus:border-theme-primary-500 hover:border-theme-border/90 transition-all duration-200 placeholder:text-theme-text-muted disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-theme-bg-muted/40 shadow-sm`}
      />
      {rightSlot && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
          {rightSlot}
        </div>
      )}
    </div>
    {helperText && <p className="text-xs text-theme-text-muted">{helperText}</p>}
  </div>
);

// ─── Section Card Wrapper ──────────────────────────────────────────────────────
interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  danger?: boolean;
  badge?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  icon,
  title,
  subtitle,
  children,
  danger = false,
  badge,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className={`rounded-2xl sm:rounded-3xl border p-5 sm:p-7 backdrop-blur-xl transition-all ${
      danger
        ? 'bg-red-500/5 dark:bg-red-950/20 border-red-500/20 shadow-sm'
        : 'bg-white/70 dark:bg-slate-900/60 border-theme-border/80 shadow-sm'
    }`}
  >
    <div className="flex items-start sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-theme-border/60">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            danger
              ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20'
              : 'bg-theme-primary-500/10 text-theme-primary-500 ring-1 ring-theme-primary-500/20'
          }`}
        >
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2
              className={`text-lg sm:text-xl font-display font-bold ${
                danger ? 'text-red-500' : 'text-theme-text-primary'
              }`}
            >
              {title}
            </h2>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-theme-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
    {children}
  </motion.div>
);

// ─── Main Profile Component ────────────────────────────────────────────────────
const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { requestPermission, permissionStatus } = useNotifications();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSystemConfirmModal, setShowSystemConfirmModal] = useState(false);
  const [showShuffleConfirm, setShowShuffleConfirm] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isSelfHosted, setIsSelfHosted] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedDocker, setCopiedDocker] = useState(false);

  const [globalRetention, setGlobalRetention] = useState(14);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [smtpEnvConfigured, setSmtpEnvConfigured] = useState(false);
  const [hideForgotPassword, setHideForgotPassword] = useState(false);
  const [hideEmailVerification, setHideEmailVerification] = useState(false);
  const [retentionSaving, setRetentionSaving] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Navigation tab definitions
  type TabKey = 'account' | 'security' | 'notifications' | 'enterprise' | 'system' | 'danger';

  const availableTabs: {
    key: TabKey;
    label: string;
    shortLabel: string;
    description: string;
    icon: React.ComponentType<any>;
    badge?: string;
  }[] = [
    {
      key: 'account',
      label: 'Account & Profile',
      shortLabel: 'Profile',
      description: 'Personal details and credentials',
      icon: RiUser3Line,
    },
    {
      key: 'security',
      label: 'Security & Password',
      shortLabel: 'Security',
      description: 'Change and secure your login password',
      icon: RiShieldKeyholeLine,
    },
    {
      key: 'notifications',
      label: 'Push Notifications',
      shortLabel: 'Notifications',
      description: 'Browser alerts and push token registration',
      icon: RiNotificationLine,
      badge:
        permissionStatus === 'granted'
          ? 'Active'
          : permissionStatus === 'denied'
            ? 'Blocked'
            : undefined,
    },
    ...(!isSelfHosted
      ? [
          {
            key: 'enterprise' as TabKey,
            label: 'Enterprise License',
            shortLabel: 'Enterprise',
            description: 'Self-hosted license & Docker config',
            icon: RiServerLine,
            badge: user?.enterprise_key ? 'Licensed' : undefined,
          },
        ]
      : []),
    ...(isSuperAdmin
      ? [
          {
            key: 'system' as TabKey,
            label: 'System Settings',
            shortLabel: 'System',
            description: 'Global retention, SMTP, and security toggles',
            icon: RiSettings3Line,
            badge: 'Super Admin',
          },
        ]
      : []),
    ...(!isSuperAdmin
      ? [
          {
            key: 'danger' as TabKey,
            label: 'Danger Zone',
            shortLabel: 'Danger Zone',
            description: 'Permanent account and data removal',
            icon: RiAlertLine,
          },
        ]
      : []),
  ];

  const rawTab = searchParams.get('tab') as TabKey;
  const currentTab = availableTabs.some((t) => t.key === rawTab) ? rawTab : 'account';

  const handleTabChange = (key: TabKey) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', key);
        return next;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    systemService
      .getPublicSettings()
      .then((s) => {
        setIsSelfHosted(s.is_self_hosted);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      systemService
        .getSettings()
        .then((s) => {
          setGlobalRetention(s.default_retention_days);
          setSmtpHost(s.smtp_host || '');
          setSmtpPort(s.smtp_port || 587);
          setSmtpSecure(!!s.smtp_secure);
          setSmtpUser(s.smtp_user || '');
          setSmtpPass(s.smtp_pass || '');
          setSmtpFrom(s.smtp_from || '');
          setSmtpEnvConfigured(!!s.smtp_env_configured);
          setHideForgotPassword(!!s.hide_forgot_password);
          setHideEmailVerification(!!s.hide_email_verification);
        })
        .catch(console.error);
    }
  }, [isSuperAdmin]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(updateUserProfile({ name, email }));
    if (updateUserProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Minimum 6 characters required');

    const result = await dispatch(changeUserPassword({ oldPassword, newPassword }));
    if (changeUserPassword.fulfilled.match(result)) {
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error('Failed to change password');
    }
  };

  const handleUpdateSettings = async () => {
    setRetentionSaving(true);
    try {
      await systemService.updateSettings({
        default_retention_days: globalRetention,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_secure: smtpSecure,
        smtp_user: smtpUser,
        smtp_pass: smtpPass,
        smtp_from: smtpFrom,
        hide_forgot_password: hideForgotPassword,
        hide_email_verification: hideEmailVerification,
      });
      toast.success('System settings updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setRetentionSaving(false);
    }
  };

  const handleUnregisterSystemWide = async () => {
    const result = await dispatch(unregisterAllSystemDevices());
    if (unregisterAllSystemDevices.fulfilled.match(result)) {
      toast.success('Successfully unregistered all devices globally.');
    } else {
      toast.error('Failed to unregister devices globally.');
    }
  };

  const handleDeleteAccount = async () => {
    const result = await dispatch(deleteUserAccount());
    if (deleteUserAccount.fulfilled.match(result)) {
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } else {
      toast.error('Failed to delete account');
    }
  };

  const handleRequestKey = async () => {
    const result = await dispatch(requestEnterpriseKey());
    if (requestEnterpriseKey.fulfilled.match(result)) {
      toast.success('Enterprise license key requested successfully!');
    } else {
      toast.error('Failed to request enterprise key');
    }
  };

  const handleShuffleKey = async () => {
    setShowShuffleConfirm(false);
    const result = await dispatch(shuffleEnterpriseKey());
    if (shuffleEnterpriseKey.fulfilled.match(result)) {
      toast.success('Enterprise license key rotated successfully!');
    } else {
      toast.error('Failed to rotate enterprise key');
    }
  };

  const copyToClipboard = (text: string, type: 'key' | 'docker') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      toast.success('License key copied to clipboard!');
    } else {
      setCopiedDocker(true);
      setTimeout(() => setCopiedDocker(false), 2000);
      toast.success('Docker environment snippet copied!');
    }
  };

  const EyeToggle = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button
      type="button"
      onClick={toggle}
      className="p-1 text-theme-text-muted hover:text-theme-text-primary transition-colors focus:outline-none"
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
    </button>
  );

  // User initials for avatar
  const userInitials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U';

  const dockerSnippet = `IS_SELF_HOSTED=true
ENTERPRISE_KEY=${user?.enterprise_key || 'YOUR_KEY'}
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_HOST=redis-host
REDIS_PORT=6379`;

  return (
    <div className="min-h-[calc(100vh-120px)] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* ─── Profile Hero Header ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl sm:rounded-3xl border border-theme-border/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-sm relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-theme-primary-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Avatar with Live Status Dot */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-theme-primary-600 via-theme-primary-500 to-theme-accent-400 text-white font-display font-bold text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-theme-primary-500/25 ring-4 ring-white dark:ring-slate-800">
                  {userInitials}
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full ring-2 ring-white dark:ring-slate-800 flex items-center justify-center ${
                    user?.status === 'APPROVED'
                      ? 'hidden'
                      : user?.status === 'PENDING'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  }`}
                  title={`Status: ${user?.status}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75" />
                </span>
              </div>

              {/* Identity & Metadata */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold text-theme-text-primary tracking-tight truncate">
                    {user?.name || 'User Profile'}
                  </h1>
                  {isSuperAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-theme-primary-500/10 text-theme-primary-600 dark:text-theme-primary-400 border border-theme-primary-500/20">
                      <RiShieldStarLine size={12} />
                      Super Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      <RiShieldUserLine size={12} />
                      Admin
                    </span>
                  )}
                </div>

                <p className="text-sm text-theme-text-secondary mt-0.5 truncate flex items-center gap-1.5">
                  <RiMailLine size={14} className="text-theme-text-muted shrink-0" />
                  {user?.email}
                </p>

                {/* Quick status chips */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${
                      user?.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : user?.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user?.status === 'APPROVED'
                          ? 'bg-emerald-500'
                          : user?.status === 'PENDING'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      }`}
                    />
                    {user?.status === 'APPROVED'
                      ? 'Account Active'
                      : user?.status === 'PENDING'
                        ? 'Pending Approval'
                        : 'Suspended'}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium bg-theme-bg-muted/60 text-theme-text-secondary border border-theme-border">
                    {isSelfHosted ? (
                      <>
                        <RiServerLine size={13} className="text-theme-text-muted" />
                        Self-Hosted Instance
                      </>
                    ) : (
                      <>
                        <RiCloudLine size={13} className="text-theme-primary-500" />
                        Cloud Platform
                      </>
                    )}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${
                      permissionStatus === 'granted'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : permissionStatus === 'denied'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          : 'bg-theme-bg-muted/60 text-theme-text-muted border-theme-border'
                    }`}
                  >
                    <RiNotificationLine size={13} />
                    {permissionStatus === 'granted'
                      ? 'Push Alerts Live'
                      : permissionStatus === 'denied'
                        ? 'Push Alerts Blocked'
                        : 'Push Alerts Off'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Mobile Touch Navigation (visible < md, non-scrolling wrapped grid) ─── */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableTabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.key;
              const isLastAndOdd =
                index === (availableTabs?.length ?? 0) - 1 &&
                (availableTabs?.length ?? 0) % 2 === 1;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-all min-h-[44px] text-left ${
                    isLastAndOdd ? 'col-span-2 sm:col-span-1' : ''
                  } ${
                    isActive
                      ? 'bg-theme-primary-500 text-white shadow-md shadow-theme-primary-500/25 ring-1 ring-theme-primary-500'
                      : 'bg-white/80 dark:bg-slate-800/80 text-theme-text-secondary hover:text-theme-text-primary border border-theme-border hover:bg-theme-bg-secondary'
                  } ${tab.key === 'danger' && !isActive ? 'text-red-500 border-red-500/20' : ''}`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="truncate flex-1">{tab.shortLabel || tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-extrabold shrink-0 ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-theme-primary-500/15 text-theme-primary-500'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Main Content Layout (Sidebar + Panel on Desktop, Stack on Mobile) ─ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ── Desktop Sidebar (visible >= md) ── */}
          <aside className="hidden md:block md:col-span-4 lg:col-span-4 space-y-4 sticky top-24 self-start">
            <div className="rounded-2xl lg:rounded-3xl border border-theme-border/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-3 shadow-sm space-y-1">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl lg:rounded-2xl transition-all text-left group ${
                      isActive
                        ? 'bg-theme-primary-500 text-white shadow-sm shadow-theme-primary-500/20 font-bold'
                        : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted/50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-theme-primary-500/10 text-theme-primary-500 group-hover:bg-theme-primary-500/15'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold truncate">{tab.label}</span>
                          {tab.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-extrabold ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-theme-primary-500/15 text-theme-primary-500'
                              }`}
                            >
                              {tab.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs truncate ${
                            isActive ? 'text-white/80' : 'text-theme-text-muted'
                          }`}
                        >
                          {tab.description}
                        </p>
                      </div>
                    </div>
                    <RiArrowRightSLine
                      size={18}
                      className={`shrink-0 transition-transform ${
                        isActive
                          ? 'text-white translate-x-0.5'
                          : 'text-theme-text-muted group-hover:translate-x-0.5'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Quick Context Card */}
            <div className="rounded-2xl border border-theme-border/60 bg-white/40 dark:bg-slate-900/40 p-4 text-xs space-y-2 text-theme-text-secondary">
              <div className="flex items-center gap-2 font-semibold text-theme-text-primary">
                <RiFingerprintLine size={15} className="text-theme-primary-500" />
                <span>Account Identifier</span>
              </div>
              <p className="font-mono text-theme-text-muted break-all">
                {user?.email || 'N/A'} (ID: #{user?.id ?? '—'})
              </p>
            </div>
          </aside>

          {/* ── Active Tab Content Panel ── */}
          <main className="col-span-1 md:col-span-8 lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {/* ─────────────────────────────────────────────────────────────
                  TAB 1: Account & Profile Information
              ───────────────────────────────────────────────────────────── */}
              {currentTab === 'account' && (
                <motion.div
                  key="tab-account"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <SectionCard
                    icon={<RiUser3Line size={20} />}
                    title="Account Information"
                    subtitle="Update your public name, primary email address, and view your assigned role."
                  >
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <InputField
                          id="profile-name"
                          label="Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          leftIcon={<RiUser3Line size={18} />}
                          placeholder="Jane Doe"
                          required
                        />
                        <InputField
                          id="profile-email"
                          label="Email Address"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          leftIcon={<RiMailLine size={18} />}
                          placeholder="jane@example.com"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2 border-t border-theme-border/50">
                        <InputField
                          id="profile-role"
                          label="Account Role"
                          value={user?.role ?? 'ADMIN'}
                          leftIcon={<RiShieldUserLine size={18} />}
                          disabled
                        />
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-theme-text-secondary">
                            Account Verification Status
                          </label>
                          <div className="flex items-center h-[46px]">
                            <span
                              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border ${
                                user?.status === 'APPROVED'
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                                  : user?.status === 'PENDING'
                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25'
                                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25'
                              }`}
                            >
                              {user?.status === 'APPROVED' ? (
                                <RiCheckboxCircleLine size={16} className="text-emerald-500" />
                              ) : user?.status === 'PENDING' ? (
                                <RiErrorWarningLine size={16} className="text-amber-500" />
                              ) : (
                                <RiCloseCircleLine size={16} className="text-rose-500" />
                              )}
                              Status: {user?.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end pt-4 border-t border-theme-border/60">
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
                        >
                          {loading ? (
                            <>
                              <RiLoader4Line size={18} className="animate-spin" />
                              Saving Changes...
                            </>
                          ) : (
                            <>
                              <RiCheckLine size={18} />
                              Save Profile Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </SectionCard>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 2: Security & Password
              ───────────────────────────────────────────────────────────── */}
              {currentTab === 'security' && (
                <motion.div
                  key="tab-security"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <SectionCard
                    icon={<RiShieldKeyholeLine size={20} />}
                    title="Change Password"
                    subtitle="Keep your account safe by using a strong password with at least 6 characters."
                  >
                    <div className="space-y-5 max-w-xl">
                      <InputField
                        id="old-password"
                        label="Current Password"
                        type={showOldPassword ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter current password"
                        leftIcon={<RiLockLine size={18} />}
                        rightSlot={
                          <EyeToggle
                            show={showOldPassword}
                            toggle={() => setShowOldPassword(!showOldPassword)}
                          />
                        }
                        required
                      />

                      <InputField
                        id="new-password"
                        label="New Password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 6 chars)"
                        leftIcon={<RiLockPasswordLine size={18} />}
                        minLength={6}
                        rightSlot={
                          <EyeToggle
                            show={showNewPassword}
                            toggle={() => setShowNewPassword(!showNewPassword)}
                          />
                        }
                        required
                      />

                      <InputField
                        id="confirm-new-password"
                        label="Confirm New Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        leftIcon={<RiLockPasswordLine size={18} />}
                        minLength={6}
                        rightSlot={
                          <EyeToggle
                            show={showConfirmPassword}
                            toggle={() => setShowConfirmPassword(!showConfirmPassword)}
                          />
                        }
                        required
                      />

                      {/* Password validation indicators */}
                      <div className="p-3.5 rounded-xl bg-theme-bg-muted/50 border border-theme-border/60 text-xs space-y-1.5">
                        <span className="font-bold text-theme-text-secondary uppercase tracking-wider block mb-1">
                          Security Requirements:
                        </span>
                        <div
                          className={`flex items-center gap-1.5 ${
                            newPassword.length >= 6
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'text-theme-text-muted'
                          }`}
                        >
                          <RiCheckboxCircleLine size={14} />
                          Minimum 6 characters in length
                        </div>
                        <div
                          className={`flex items-center gap-1.5 ${
                            newPassword && newPassword === confirmPassword
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'text-theme-text-muted'
                          }`}
                        >
                          <RiCheckboxCircleLine size={14} />
                          Passwords match exactly
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleChangePassword}
                          disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
                        >
                          {loading ? (
                            <>
                              <RiLoader4Line size={18} className="animate-spin" />
                              Updating Password...
                            </>
                          ) : (
                            'Update Password'
                          )}
                        </button>
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 3: Push Notifications
              ───────────────────────────────────────────────────────────── */}
              {currentTab === 'notifications' && (
                <motion.div
                  key="tab-notifications"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <SectionCard
                    icon={<RiNotificationLine size={20} />}
                    title="Push Notification Preferences"
                    subtitle="Configure browser notifications to stay instantly informed of critical system alerts."
                  >
                    <div className="space-y-6">
                      {/* External ID display with 1-click copy */}
                      <div>
                        <InputField
                          id="profile-external-id"
                          label="Unique Device Identifier (External ID)"
                          value={user?.email || ''}
                          leftIcon={<RiFingerprintLine size={18} />}
                          rightSlot={
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(user?.email || '');
                                toast.success('External ID copied to clipboard!');
                              }}
                              className="p-1 text-theme-text-muted hover:text-theme-text-primary transition-colors"
                              title="Copy External ID"
                            >
                              <RiFileCopyLine size={18} />
                            </button>
                          }
                          disabled
                          helperText="This unique identifier routes push notifications directly to this authenticated account."
                        />
                      </div>

                      {/* Permission status card */}
                      <div className="rounded-2xl border border-theme-border/80 bg-theme-bg-muted/40 p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-theme-text-primary text-base">
                              Browser Push Status
                            </h3>
                            <p className="text-xs sm:text-sm text-theme-text-secondary mt-0.5">
                              Real-time browser notifications for alarms, cron executions, and
                              alerts.
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shrink-0 ${
                              permissionStatus === 'granted'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : permissionStatus === 'denied'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {permissionStatus === 'granted' ? (
                              <>
                                <RiCheckboxCircleLine size={15} /> Enabled
                              </>
                            ) : permissionStatus === 'denied' ? (
                              <>
                                <RiCloseCircleLine size={15} /> Blocked
                              </>
                            ) : (
                              <>
                                <RiErrorWarningLine size={15} /> Not Enabled
                              </>
                            )}
                          </span>
                        </div>

                        {/* Interactive state actions */}
                        {permissionStatus !== 'granted' && (
                          <div className="rounded-xl p-4 bg-white dark:bg-slate-800 border border-theme-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <p className="text-xs sm:text-sm text-theme-text-primary">
                              {permissionStatus === 'denied'
                                ? 'Notifications are currently blocked in your browser settings. To allow them, click the padlock / site settings icon in your URL bar.'
                                : 'Enable notifications to receive delivery status alerts and system pings.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => requestPermission()}
                              disabled={permissionStatus === 'denied'}
                              className="btn-primary w-full sm:w-auto shrink-0 min-h-[42px]"
                            >
                              Enable Access
                            </button>
                          </div>
                        )}

                        {permissionStatus === 'granted' && (
                          <div className="rounded-xl p-4 bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
                            <RiCheckboxCircleLine size={20} className="text-emerald-500 shrink-0" />
                            <div className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                              <strong className="font-semibold block sm:inline">
                                Notifications are fully operational.{' '}
                              </strong>
                              This browser device will receive live alerts in the background.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 4: Enterprise License & Self-Hosting
              ───────────────────────────────────────────────────────────── */}
              {currentTab === 'enterprise' && !isSelfHosted && (
                <motion.div
                  key="tab-enterprise"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <SectionCard
                    icon={<RiServerLine size={20} />}
                    title="Enterprise License & Self-Hosting"
                    subtitle="Self-host Vibe Message on your private cloud with full sovereignty and unlimited instances."
                  >
                    <div className="space-y-6">
                      {!user?.enterprise_key && !user?.enterprise_key_requested && (
                        <div className="rounded-2xl border border-theme-border/80 bg-theme-bg-muted/40 p-6 space-y-4">
                          <h3 className="text-base font-bold text-theme-text-primary">
                            Unlock Self-Hosted Deployment
                          </h3>
                          <p className="text-sm text-theme-text-secondary leading-relaxed">
                            Run Vibe Message inside your own Docker or Kubernetes infrastructure.
                            All communication stays behind your firewall. Request an Enterprise
                            License Key to get started.
                          </p>
                          <button
                            type="button"
                            onClick={handleRequestKey}
                            disabled={loading}
                            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
                          >
                            {loading ? (
                              <>
                                <RiLoader4Line size={18} className="animate-spin" />
                                Requesting...
                              </>
                            ) : (
                              <>
                                <RiKeyLine size={18} />
                                Request Enterprise Key
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {!user?.enterprise_key && user?.enterprise_key_requested && (
                        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-6 relative overflow-hidden space-y-2">
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
                            <RiLoader4Line size={18} className="animate-spin" />
                            Enterprise Key Under Review
                          </div>
                          <p className="text-sm text-theme-text-secondary leading-relaxed">
                            Your request for an enterprise self-hosted license key has been
                            submitted. Platform administrators will generate and assign your key
                            shortly.
                          </p>
                        </div>
                      )}

                      {user?.enterprise_key && (
                        <div className="space-y-6">
                          {/* Key display card */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-theme-text-secondary">
                              Your Active Enterprise License Key
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="relative flex-1">
                                <input
                                  type={showKey ? 'text' : 'password'}
                                  value={user.enterprise_key}
                                  readOnly
                                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 text-theme-text-primary border border-theme-border rounded-xl font-mono text-sm focus:outline-none pr-20 select-all shadow-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowKey(!showKey)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-theme-primary-500 hover:text-theme-primary-600 px-2 py-1"
                                >
                                  {showKey ? 'Hide' : 'Reveal'}
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(user.enterprise_key || '', 'key')}
                                className="px-5 py-3 bg-white dark:bg-slate-800 border border-theme-border text-theme-text-primary rounded-xl hover:bg-theme-bg-secondary transition flex items-center justify-center gap-2 font-semibold text-sm shadow-sm"
                              >
                                {copiedKey ? (
                                  <>
                                    <RiCheckLine size={18} className="text-emerald-500" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <RiFileCopyLine size={18} />
                                    <span>Copy Key</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Docker Deployment snippet */}
                          <div className="rounded-2xl border border-theme-border/80 bg-slate-950 p-5 text-white space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300">
                                <RiTerminalBoxLine size={16} className="text-theme-primary-400" />
                                Docker Environment (.env)
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(dockerSnippet, 'docker')}
                                className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 transition flex items-center gap-1.5"
                              >
                                {copiedDocker ? (
                                  <>
                                    <RiCheckLine size={14} className="text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <RiFileCopyLine size={14} />
                                    <span>Copy Snippet</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto whitespace-pre p-2 leading-relaxed selection:bg-theme-primary-500">
                              {dockerSnippet}
                            </pre>
                          </div>

                          {/* Rotate Key Action */}
                          <div className="pt-4 border-t border-theme-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="text-sm font-bold text-theme-text-primary">
                                Rotate License Key
                              </h4>
                              <p className="text-xs text-theme-text-secondary mt-0.5">
                                Deactivates the current key immediately. You must restart
                                self-hosted nodes with the new key.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowShuffleConfirm(true)}
                              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-sm w-full sm:w-auto shrink-0"
                            >
                              Rotate Key
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </SectionCard>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 5: System Settings (Super Admin Only)
              ───────────────────────────────────────────────────────────── */}
              {currentTab === 'system' && isSuperAdmin && (
                <motion.div
                  key="tab-system"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <SectionCard
                    icon={<RiSettings3Line size={20} />}
                    title="System Global Configuration"
                    subtitle="Configure platform-wide data retention, email dispatch settings, and authentication rules."
                    badge={
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-theme-primary-500/15 text-theme-primary-500 border border-theme-primary-500/20 uppercase tracking-wide">
                        Super Admin
                      </span>
                    }
                  >
                    <div className="space-y-8">
                      {/* Data retention */}
                      <div className="max-w-md">
                        <InputField
                          id="global-retention"
                          label="Default Notification Retention (Days)"
                          type="number"
                          value={globalRetention}
                          onChange={(e) => setGlobalRetention(parseInt(e.target.value, 10) || 1)}
                          leftIcon={<RiHashtag size={18} />}
                          helperText="Notification history older than this threshold is automatically expunged system-wide."
                        />
                      </div>

                      {/* SMTP Mail Configuration */}
                      <div className="pt-6 border-t border-theme-border/60 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text-primary flex items-center gap-2">
                            <RiMailLine size={16} className="text-theme-primary-500" />
                            SMTP Mail Dispatch Configuration
                          </h3>
                          {smtpEnvConfigured && (
                            <span className="text-[11px] font-semibold text-theme-primary-500 bg-theme-primary-500/10 px-2 py-0.5 rounded-md border border-theme-primary-500/20">
                              Configured via environment
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputField
                            id="smtp-host"
                            label="SMTP Host"
                            value={smtpHost}
                            onChange={(e) => setSmtpHost(e.target.value)}
                            disabled={smtpEnvConfigured}
                            placeholder="smtp.example.com"
                            leftIcon={<RiGlobalLine size={18} />}
                          />
                          <InputField
                            id="smtp-port"
                            label="SMTP Port"
                            type="number"
                            value={smtpPort}
                            onChange={(e) => setSmtpPort(parseInt(e.target.value, 10) || 587)}
                            disabled={smtpEnvConfigured}
                            placeholder="587"
                            leftIcon={<RiHashtag size={18} />}
                          />
                          <InputField
                            id="smtp-user"
                            label="SMTP Username"
                            value={smtpUser}
                            onChange={(e) => setSmtpUser(e.target.value)}
                            disabled={smtpEnvConfigured}
                            placeholder="user@example.com"
                            leftIcon={<RiUser3Line size={18} />}
                          />
                          <InputField
                            id="smtp-pass"
                            label="SMTP Password"
                            type="password"
                            value={smtpPass}
                            onChange={(e) => setSmtpPass(e.target.value)}
                            disabled={smtpEnvConfigured}
                            placeholder="••••••••"
                            leftIcon={<RiLockLine size={18} />}
                          />
                          <div className="sm:col-span-2">
                            <InputField
                              id="smtp-from"
                              label="Sender Address (From Header)"
                              value={smtpFrom}
                              onChange={(e) => setSmtpFrom(e.target.value)}
                              disabled={smtpEnvConfigured}
                              placeholder="Vibe Message <alerts@example.com>"
                              leftIcon={<RiMailLine size={18} />}
                            />
                          </div>
                        </div>

                        {/* SSL/TLS Checkbox */}
                        <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl hover:bg-theme-bg-muted/40 transition">
                          <input
                            type="checkbox"
                            checked={smtpSecure}
                            onChange={(e) => setSmtpSecure(e.target.checked)}
                            disabled={smtpEnvConfigured}
                            className="w-4 h-4 text-theme-primary-600 rounded border-theme-border focus:ring-theme-primary-500"
                          />
                          <span className="text-xs sm:text-sm font-semibold text-theme-text-primary">
                            Use SSL/TLS (Direct Secure Socket Connection)
                          </span>
                        </label>
                      </div>

                      {/* Login & Security Policies */}
                      <div className="pt-6 border-t border-theme-border/60 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text-primary flex items-center gap-2">
                          <RiShieldKeyholeLine size={16} className="text-theme-primary-500" />
                          Authentication & Security Policies
                        </h3>
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl hover:bg-theme-bg-muted/40 transition border border-theme-border/50">
                            <input
                              type="checkbox"
                              checked={hideForgotPassword}
                              onChange={(e) => setHideForgotPassword(e.target.checked)}
                              className="w-4 h-4 text-theme-primary-600 rounded border-theme-border focus:ring-theme-primary-500"
                            />
                            <div>
                              <span className="text-xs sm:text-sm font-bold text-theme-text-primary block">
                                Hide "Forgot Password" link on login screen
                              </span>
                              <span className="text-xs text-theme-text-secondary">
                                Prevents unauthenticated users from initiating self-service password
                                resets.
                              </span>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl hover:bg-theme-bg-muted/40 transition border border-theme-border/50">
                            <input
                              type="checkbox"
                              checked={hideEmailVerification}
                              onChange={(e) => setHideEmailVerification(e.target.checked)}
                              className="w-4 h-4 text-theme-primary-600 rounded border-theme-border focus:ring-theme-primary-500"
                            />
                            <div>
                              <span className="text-xs sm:text-sm font-bold text-theme-text-primary block">
                                Bypass email verification for new accounts
                              </span>
                              <span className="text-xs text-theme-text-secondary">
                                New users can log in immediately without validating their email
                                address token.
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex flex-col sm:flex-row justify-end pt-5 border-t border-theme-border/60">
                        <button
                          type="button"
                          onClick={handleUpdateSettings}
                          disabled={retentionSaving}
                          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
                        >
                          {retentionSaving ? (
                            <>
                              <RiLoader4Line size={18} className="animate-spin" />
                              Saving Settings...
                            </>
                          ) : (
                            <>
                              <RiCheckLine size={18} />
                              Save System Settings
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </SectionCard>

                  {/* ── System Danger Zone Section Card ── */}
                  <SectionCard
                    danger
                    icon={<RiAlertLine size={20} />}
                    title="System Danger Zone"
                    subtitle="Irreversible system-wide maintenance and emergency actions."
                    badge={
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 uppercase tracking-wide">
                        Destructive
                      </span>
                    }
                  >
                    <div className="space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 rounded-2xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20">
                        <div className="space-y-1.5 max-w-xl">
                          <h4 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                            <RiAlertLine size={18} className="shrink-0" />
                            Purge Push Device Tokens System-Wide
                          </h4>
                          <p className="text-xs sm:text-sm text-theme-text-secondary leading-relaxed">
                            Forcibly purges all registered push tokens across every application in
                            the database. All client devices will stop receiving alerts until users
                            re-open their browsers to re-register.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowSystemConfirmModal(true)}
                          disabled={loading}
                          className="shrink-0 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 min-h-[42px]"
                        >
                          <RiAlertLine size={16} />
                          Unregister All Devices System-Wide
                        </button>
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 6: Danger Zone (Non-Super-Admin Only)
              ───────────────────────────────────────────────────────────── */}
              {currentTab === 'danger' && !isSuperAdmin && (
                <motion.div
                  key="tab-danger"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <SectionCard
                    icon={<RiAlertLine size={20} />}
                    title="Danger Zone"
                    subtitle="Permanently delete your account, apps, notification logs, and API credentials."
                    danger
                  >
                    <div className="space-y-6">
                      <p className="text-sm text-theme-text-secondary leading-relaxed">
                        Once your account is deleted, all resources and data associated with it will
                        be permanently dropped from our primary database and cache servers. This
                        action is strictly irreversible.
                      </p>

                      <AnimatePresence mode="wait">
                        {!showDeleteConfirm ? (
                          <motion.div
                            key="btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(true)}
                              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 text-sm w-full sm:w-auto min-h-[44px]"
                            >
                              Delete My Account…
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="confirm"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="border border-red-500/30 rounded-2xl p-5 sm:p-6 bg-red-500/10 space-y-4"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                                <RiAlertLine size={20} />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-red-600 dark:text-red-400 font-bold text-base">
                                  Are you absolutely certain?
                                </h4>
                                <p className="text-red-800/80 dark:text-red-200/80 text-xs sm:text-sm leading-relaxed">
                                  You will immediately lose access to all your applications,
                                  subscribers, and push delivery logs. There is no undo.
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                              <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center min-h-[42px]"
                              >
                                {loading ? 'Deleting Account...' : 'Yes, Purge Everything'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 py-2.5 bg-white/80 dark:bg-slate-800 text-theme-text-primary border border-theme-border font-bold rounded-xl hover:bg-theme-bg-secondary transition-all text-sm flex items-center justify-center min-h-[42px]"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </SectionCard>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ─── System-Wide Unregister Confirmation Modal ───────────────────────── */}
      <ConfirmModal
        isOpen={showSystemConfirmModal}
        onClose={() => !loading && setShowSystemConfirmModal(false)}
        onConfirm={() => {
          setShowSystemConfirmModal(false);
          handleUnregisterSystemWide();
        }}
        loading={loading}
        title="Critical Warning: Global Token Purge"
        description={
          <>
            Are you sure you want to unregister{' '}
            <strong className="text-red-500 font-bold tracking-wide">
              ALL DEVICES SYSTEM-WIDE?
            </strong>
            <br />
            <br />
            Every user across every connected app will stop receiving push notifications until they
            re-open the application to re-register their device tokens.
          </>
        }
        confirmLabel="Execute Purge"
        confirmingLabel="Purging..."
        icon={<RiAlertLine size={28} />}
        variant="danger"
      />

      {/* ─── Shuffle Enterprise Key Confirmation Modal ──────────────────────── */}
      <ConfirmModal
        isOpen={showShuffleConfirm}
        onClose={() => setShowShuffleConfirm(false)}
        onConfirm={handleShuffleKey}
        loading={loading}
        title="Rotate Enterprise License Key?"
        description={
          <>
            Are you sure you want to rotate your license key?
            <br />
            <br />
            Your current key will be immediately deactivated. Any active self-hosted deployments
            using the old key will fail connection checks until updated with the new credentials.
          </>
        }
        confirmLabel="Rotate Key"
        confirmingLabel="Rotating..."
        icon={<RiKeyLine size={28} />}
        variant="warning"
      />
    </div>
  );
};

export default Profile;
