import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  fetchAppById,
  updateExistingApp,
  rotateSecret,
  removeApp,
  clearSelectedApp,
} from '../../store/slices/appsSlice';
import { CopyButton } from '../../components/common/CopyButton';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { systemService } from '../../services/systemService';
import { AppDetailsSkeleton } from '../../components/common/SkeletonLoader';

import { PushComposer } from './components/PushComposer';
import { NotificationHistory } from './components/NotificationHistory';
import { Subscribers } from './components/Subscribers';
import { DripCampaigns } from './components/DripCampaigns';
import { Members } from './components/Members';
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiLockLine,
  RiDeleteBinLine,
  RiEditLine,
  RiCheckLine,
  RiFileCopyLine,
} from '@remixicon/react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AppDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedApp: app, loading } = useAppSelector((state) => state.apps);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'subscribers' | 'push' | 'drip' | 'history' | 'scheduled'
  >('overview');
  const [globalRetention, setGlobalRetention] = useState<number>(14);
  const { user } = useAppSelector((state) => state.auth);
  const shouldReduceMotion = useReducedMotion();
  const easeOut = [0.23, 1, 0.32, 1] as const;

  useEffect(() => {
    systemService
      .getSettings()
      .then((settings) => setGlobalRetention(settings.default_retention_days))
      .catch((err) => console.error('Failed to load global retention', err));
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(fetchAppById(id));
    }
    return () => {
      dispatch(clearSelectedApp());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (app) {
      setEditName(app.name);
      setEditDescription(app.description || '');
    }
  }, [app]);

  const handleRotateSecret = async () => {
    const confirmed = window.confirm('Are you sure? This will invalidate the current secret key.');
    if (!confirmed || !id) return;

    const result = await dispatch(rotateSecret(id));
    if (rotateSecret.fulfilled.match(result)) {
      toast.success('Secret key rotated successfully');
    } else {
      toast.error('Failed to rotate secret');
    }
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    const result = await dispatch(
      updateExistingApp({
        id: id,
        data: {
          name: editName,
          description: editDescription || undefined,
        },
      })
    );
    if (updateExistingApp.fulfilled.match(result)) {
      setIsEditing(false);
      toast.success('App updated successfully');
    } else {
      toast.error('Failed to update app');
    }
  };

  const handleRetentionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!id || !app) return;
    const value = e.target.value;
    const retentionDays = value === 'default' ? null : parseInt(value, 10);

    const result = await dispatch(
      updateExistingApp({
        id: id,
        data: { retention_days: retentionDays },
      })
    );
    if (updateExistingApp.fulfilled.match(result)) {
      toast.success('Retention settings updated');
    } else {
      toast.error('Failed to update retention settings');
    }
  };

  const hasRetentionPermission = user?.role === 'SUPER_ADMIN' || user?.can_manage_retention;

  const handleToggleActive = async () => {
    if (!id || !app) return;
    const result = await dispatch(
      updateExistingApp({
        id: id,
        data: {
          is_active: !app.is_active,
        },
      })
    );
    if (updateExistingApp.fulfilled.match(result)) {
      toast.success(app.is_active ? 'App disabled successfully' : 'App enabled successfully');
    } else {
      toast.error('Failed to update app status');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const result = await dispatch(removeApp(id));
    if (removeApp.fulfilled.match(result)) {
      toast.success('App deleted successfully');
      navigate('/apps');
    } else {
      toast.error('Failed to delete app');
    }
  };

  if (loading && !app) return <AppDetailsSkeleton />;
  if (!app) return <div className="p-8 text-theme-text-primary">App not found</div>;

  const integrationCode = `// 1. Initialize Service Worker (Run in terminal)
// npx vibe-message init

// 2. Include the SDK
import { initNotificationClient } from 'vibe-message';

// 3. Initialize with publicKey
const client = initNotificationClient({
  appId: '${app.public_app_id}',
  publicKey: '${app.public_key}'
});

// 4. Register callbacks
client.onMessage((payload) => {
  console.log('Received payload:', payload);
});

// 5. Register device
await client.registerDevice({
  externalUserId: 'user-123'
});`;

  const backendCode = `// 1. Install SDK in backend
// npm install vibe-message

// 2. Send push notification from your backend
import { initServerClient } from 'vibe-message';

const vibe = initServerClient({
  appId: '${app.public_app_id}',
  secretKey: '${app.secret_key}'
});

const result = await vibe.notification({
  notificationData: {
    title: 'Hello!',
    body: 'This is a push notification',
    icon: 'https://yoursite.com/icon.png',
    data: { key: 'value' } // Optional custom data (supports object or stringified JSON)
  },
  externalUsers: ['user-123']
});`;

  const fadeUpVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
  };

  const tabs: { id: 'overview' | 'members' | 'subscribers' | 'push' | 'drip' | 'history' | 'scheduled'; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'subscribers', label: 'Subscribers' },
    { id: 'push', label: 'Send Push' },
    { id: 'drip', label: 'Drip Campaigns' },
    { id: 'history', label: 'History' },
    { id: 'scheduled', label: 'Scheduled Messages' },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08 } },
      }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans"
    >
      <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-2xl sm:text-3xl font-display font-extrabold border-b-2 border-theme-primary-500 focus:outline-none w-full bg-transparent text-theme-text-primary transition-colors"
                placeholder="App Name"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full border border-theme-border rounded-xl p-3 bg-theme-bg-secondary text-theme-text-primary focus:ring-2 focus:ring-theme-primary-500 focus:border-transparent transition-colors text-sm"
                placeholder="App Description (optional)"
                rows={3}
              />
              <div className="flex gap-2.5">
                <button onClick={handleSaveEdit} className="btn-primary">
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(app.name);
                    setEditDescription(app.description || '');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-theme-text-primary tracking-tight">
                {app.name}
              </h1>
              {app.description && (
                <p className="text-theme-text-secondary mt-1 text-sm sm:text-base leading-relaxed">
                  {app.description}
                </p>
              )}
            </>
          )}
        </div>
        {!isEditing && app.name !== 'Admin Panel Notifications' && (
          <div className="flex items-center gap-2 shrink-0">
            {app.currentUserRole !== 'viewer' && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
              >
                <RiEditLine size={15} />
                Edit
              </button>
            )}
            {(app.currentUserRole === 'owner' || app.currentUserRole === 'superadmin') && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-danger flex items-center gap-1.5 text-xs sm:text-sm font-semibold"
              >
                <RiDeleteBinLine size={15} />
                Delete
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Delete App Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={loading}
        title="Delete App?"
        description="This will permanently delete this app and all associated devices and notifications. This action cannot be undone."
        confirmLabel="Yes, Delete App"
        confirmingLabel="Deleting..."
      />

      {/* Stat Cards */}
      <motion.div variants={fadeUpVariants} className="grid sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-theme-bg-secondary border border-theme-border rounded-2xl p-5 sm:p-6 shadow-xs">
          <h3 className="text-theme-text-secondary text-xs font-bold uppercase tracking-wider mb-2">Devices</h3>
          <p className="text-3xl sm:text-4xl font-display font-extrabold text-theme-primary-600 dark:text-theme-primary-400 tabular-nums">
            {app.device_count}
          </p>
        </div>
        <div className="bg-theme-bg-secondary border border-theme-border rounded-2xl p-5 sm:p-6 shadow-xs">
          <h3 className="text-theme-text-secondary text-xs font-bold uppercase tracking-wider mb-2">Notifications Sent</h3>
          <p className="text-3xl sm:text-4xl font-display font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {app.notification_count}
          </p>
        </div>
        <div className="bg-theme-bg-secondary border border-theme-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-theme-text-secondary text-xs font-bold uppercase tracking-wider mb-2">Status</h3>
            <div className="flex items-center justify-between">
              <p className="text-base sm:text-lg font-display font-bold text-theme-text-primary flex items-center gap-2">
                {app.is_active ? (
                  <>
                    <RiCheckboxCircleLine size={18} className="text-emerald-500" /> Active
                  </>
                ) : (
                  <>
                    <RiCloseCircleLine size={18} className="text-rose-500" /> Inactive
                  </>
                )}
              </p>
              {app.currentUserRole !== 'viewer' && (
                <button
                  onClick={handleToggleActive}
                  disabled={loading}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                    app.is_active
                      ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20'
                  } disabled:opacity-50`}
                >
                  {app.is_active ? 'Disable' : 'Enable'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-theme-border mb-8 overflow-x-auto print:hidden gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 sm:px-5 py-3 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors duration-150 ${
                isActive
                  ? 'text-theme-primary-600 dark:text-theme-primary-400'
                  : 'text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="app-details-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-primary-500"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 500, damping: 35 }
                  }
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            transition={{ duration: 0.2, ease: easeOut }}
            className="space-y-6"
          >
            {/* Credentials Card */}
            <div className="bg-theme-bg-secondary border border-theme-border rounded-2xl p-6 sm:p-7 shadow-xs">
              <h2 className="text-lg font-display font-bold mb-6 text-theme-text-primary">Credentials</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-theme-text-secondary">
                    App ID (Public)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      value={app.public_app_id}
                      disabled
                      className="input flex-1 font-mono text-xs sm:text-sm bg-theme-bg-muted/40 text-theme-text-primary"
                    />
                    <CopyButton text={app.public_app_id} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-theme-text-secondary">
                    Public Key (For SDK)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      value={app.public_key}
                      disabled
                      className="input flex-1 font-mono text-xs sm:text-sm bg-theme-bg-muted/40 text-theme-text-primary"
                    />
                    <CopyButton text={app.public_key} />
                  </div>
                  <p className="text-xs text-theme-text-muted mt-2">
                    Safe to use in client-side code
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-theme-text-secondary">
                    Secret Key (For Server API)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      value={app.secret_key}
                      readOnly
                      className="input flex-1 font-mono text-xs sm:text-sm bg-theme-bg-muted/40 text-theme-text-primary"
                      type="password"
                    />
                    <CopyButton text={app.secret_key} />
                    {(app.currentUserRole === 'owner' || app.currentUserRole === 'superadmin') &&
                      app.name !== 'Admin Panel Notifications' && (
                        <button
                          onClick={handleRotateSecret}
                          disabled={loading}
                          className="btn-danger whitespace-nowrap"
                        >
                          {loading ? 'Rotating...' : 'Rotate Key'}
                        </button>
                      )}
                  </div>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-medium">
                    Keep this secret! Never expose it in client-side code.
                  </p>
                </div>
              </div>
            </div>

            {/* Auto-Delete Settings Card */}
            <div className="bg-theme-bg-secondary border border-theme-border rounded-2xl p-6 sm:p-7 shadow-xs">
              <h2 className="text-lg font-display font-bold mb-4 text-theme-text-primary">
                Auto-Delete Settings
              </h2>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-theme-text-secondary">
                  Retention Period
                </label>
                <select
                  value={app.retention_days === null ? 'default' : app.retention_days}
                  onChange={handleRetentionChange}
                  disabled={!hasRetentionPermission || loading}
                  className="w-full md:w-1/2 p-2.5 border border-theme-border rounded-xl bg-theme-bg-primary text-theme-text-primary text-sm focus:ring-2 focus:ring-theme-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="default">Use Global Default ({globalRetention} days)</option>
                  <option value="1">1 Day</option>
                  <option value="2">2 Days</option>
                  <option value="7">1 Week</option>
                  <option value="14">2 Weeks</option>
                  <option value="30">1 Month</option>
                </select>
                {!hasRetentionPermission && (
                  <p className="text-xs text-theme-text-secondary mt-2 flex items-center gap-1 font-medium">
                    <RiLockLine size={14} className="text-amber-500" /> Controlled by Super Admin
                  </p>
                )}
                <p className="text-xs text-theme-text-secondary mt-3 leading-relaxed">
                  Push notifications and logs sent from this app will be automatically deleted after
                  the selected retention period to preserve space.
                </p>
              </div>
            </div>

            {/* Frontend Integration Snippet */}
            <div className="bg-theme-bg-secondary border border-theme-border rounded-2xl p-6 sm:p-7 shadow-xs">
              <h2 className="text-lg font-display font-bold mb-4 text-theme-text-primary">
                Frontend Integration
              </h2>
              <CodeSnippetBlock code={integrationCode} language="typescript" />
            </div>

            {/* Backend Integration Snippet */}
            <div className="bg-theme-bg-secondary border border-theme-border rounded-2xl p-6 sm:p-7 shadow-xs">
              <h2 className="text-lg font-display font-bold mb-4 text-theme-text-primary">
                Backend Integration
              </h2>
              <CodeSnippetBlock code={backendCode} language="typescript" />
            </div>
          </motion.div>
        )}

        {activeTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <Members appId={app.public_app_id} />
          </motion.div>
        )}

        {activeTab === 'subscribers' && (
          <motion.div
            key="subscribers"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <Subscribers appId={app.public_app_id} />
          </motion.div>
        )}

        {activeTab === 'push' && (
          <motion.div
            key="push"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <PushComposer appId={app.public_app_id} />
          </motion.div>
        )}

        {activeTab === 'drip' && (
          <motion.div
            key="drip"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <DripCampaigns appId={app.public_app_id} />
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <NotificationHistory appId={app.public_app_id} />
          </motion.div>
        )}

        {activeTab === 'scheduled' && (
          <motion.div
            key="scheduled"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <NotificationHistory appId={app.public_app_id} isScheduled={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CodeSnippetBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0B0D13] shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#111420]">
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest bg-white/[0.04] border border-white/[0.06] rounded px-2 py-0.5">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] rounded px-2 py-0.5 transition-colors"
          >
            {copied ? (
              <>
                <RiCheckLine size={12} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <RiFileCopyLine size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="text-slate-300 text-xs font-mono leading-relaxed whitespace-pre-wrap break-normal">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
