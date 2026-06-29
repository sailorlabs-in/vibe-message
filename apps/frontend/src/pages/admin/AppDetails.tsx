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
import { motion } from 'motion/react';
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      <motion.div variants={fadeUpVariants} className="flex justify-between items-start mb-8">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-3xl font-bold border-b-2 border-theme-primary-500 focus:outline-none w-full bg-transparent text-theme-text-primary transition-colors"
                placeholder="App Name"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full border border-theme-border rounded-lg p-3 bg-theme-bg-secondary text-theme-text-primary focus:ring-2 focus:ring-theme-primary-500 focus:border-transparent transition-colors"
                placeholder="App Description (optional)"
                rows={3}
              />
              <div className="flex gap-2">
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
              <h1 className="text-3xl font-bold text-theme-text-primary">{app.name}</h1>
              {app.description && (
                <p className="text-theme-text-secondary mt-2">{app.description}</p>
              )}
            </>
          )}
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            {app.currentUserRole !== 'viewer' && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Edit
              </button>
            )}
            {(app.currentUserRole === 'owner' || app.currentUserRole === 'superadmin') && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-danger flex items-center gap-1.5 text-sm"
              >
                <RiDeleteBinLine size={16} />
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

      <motion.div variants={fadeUpVariants} className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-theme-text-secondary text-sm font-medium mb-2">Devices</h3>
          <p className="text-3xl font-bold text-theme-primary-600 dark:text-theme-primary-400">
            {app.device_count}
          </p>
        </div>
        <div className="card">
          <h3 className="text-theme-text-secondary text-sm font-medium mb-2">Notifications Sent</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {app.notification_count}
          </p>
        </div>
        <div className="card">
          <h3 className="text-theme-text-secondary text-sm font-medium mb-2">Status</h3>
          <div className="flex items-center justify-between">
            <p className="text-xl font-semibold text-theme-text-primary flex items-center gap-2">
              {app.is_active ? (
                <>
                  <RiCheckboxCircleLine size={20} className="text-theme-success" /> Active
                </>
              ) : (
                <>
                  <RiCloseCircleLine size={20} className="text-theme-error" /> Inactive
                </>
              )}
            </p>
            {app.currentUserRole !== 'viewer' && (
              <button
                onClick={handleToggleActive}
                disabled={loading}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${app.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'} disabled:opacity-50`}
              >
                {app.is_active ? 'Disable' : 'Enable'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex border-b border-theme-border mb-6 overflow-x-auto print:hidden">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'members', label: 'Members' },
          { id: 'subscribers', label: 'Subscribers' },
          { id: 'push', label: 'Send Push' },
          { id: 'drip', label: 'Drip Campaigns' },
          { id: 'history', label: 'History' },
          { id: 'scheduled', label: 'Scheduled Messages' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-theme-primary-500 text-theme-primary-500'
                : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <motion.div variants={fadeUpVariants} className="card mb-6">
            <h2 className="text-xl font-semibold mb-6 text-theme-text-primary">Credentials</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                  App ID (Public)
                </label>
                <div className="flex space-x-2">
                  <input
                    value={app.public_app_id}
                    disabled
                    className="input flex-1 font-mono text-sm bg-gray-50 dark:bg-theme-bg-secondary dark:text-theme-text-primary dark:border-theme-border"
                  />
                  <CopyButton text={app.public_app_id} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                  Public Key (For SDK)
                </label>
                <div className="flex space-x-2">
                  <input
                    value={app.public_key}
                    disabled
                    className="input flex-1 font-mono text-sm bg-gray-50 dark:bg-theme-bg-secondary dark:text-theme-text-primary dark:border-theme-border"
                  />
                  <CopyButton text={app.public_key} />
                </div>
                <p className="text-xs text-theme-text-secondary mt-2">
                  Safe to use in client-side code
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                  Secret Key (For Server API)
                </label>
                <div className="flex space-x-2">
                  <input
                    value={app.secret_key}
                    readOnly
                    className="input flex-1 font-mono text-sm bg-gray-50 dark:bg-theme-bg-secondary dark:text-theme-text-primary dark:border-theme-border"
                    type="password"
                  />
                  <CopyButton text={app.secret_key} />
                  {(app.currentUserRole === 'owner' || app.currentUserRole === 'superadmin') && (
                    <button
                      onClick={handleRotateSecret}
                      disabled={loading}
                      className="btn-danger whitespace-nowrap"
                    >
                      {loading ? 'Rotating...' : 'Rotate Key'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                  Keep this secret! Never expose it in client-side code.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUpVariants} className="card mb-6">
            <h2 className="text-xl font-semibold mb-6 text-theme-text-primary">
              Auto-Delete Settings
            </h2>
            <div>
              <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                Retention Period
              </label>
              <select
                value={app.retention_days === null ? 'default' : app.retention_days}
                onChange={handleRetentionChange}
                disabled={!hasRetentionPermission || loading}
                className="w-full md:w-1/2 p-2 border border-theme-border rounded-lg bg-theme-bg-secondary text-theme-text-primary focus:ring-2 focus:ring-theme-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <option value="default">Use Global Default ({globalRetention} days)</option>
                <option value="1">1 Day</option>
                <option value="2">2 Days</option>
                <option value="7">1 Week</option>
                <option value="14">2 Weeks</option>
                <option value="30">1 Month</option>
              </select>
              {!hasRetentionPermission && (
                <p className="text-xs text-theme-text-secondary mt-2 flex items-center gap-1">
                  <RiLockLine size={14} className="text-amber-500" /> Controlled by Super Admin
                </p>
              )}
              <p className="text-sm text-theme-text-secondary mt-3">
                Push notifications and logs sent from this app will be automatically deleted after
                the selected retention period to preserve space.
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUpVariants} className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 text-theme-text-primary">
              Frontend Integration
            </h2>
            <pre className="bg-gray-900 dark:bg-[#060606] text-gray-100 p-4 rounded-lg overflow-x-auto text-sm border border-gray-800">
              {integrationCode}
            </pre>
          </motion.div>

          <motion.div variants={fadeUpVariants} className="card">
            <h2 className="text-xl font-semibold mb-4 text-theme-text-primary">
              Backend Integration
            </h2>
            <pre className="bg-gray-900 dark:bg-[#060606] text-gray-100 p-4 rounded-lg overflow-x-auto text-sm border border-gray-800">
              {backendCode}
            </pre>
          </motion.div>
        </>
      )}

      {activeTab === 'members' && (
        <motion.div variants={fadeUpVariants}>
          <Members appId={app.public_app_id} />
        </motion.div>
      )}

      {activeTab === 'subscribers' && (
        <motion.div variants={fadeUpVariants}>
          <Subscribers appId={app.public_app_id} />
        </motion.div>
      )}

      {activeTab === 'push' && (
        <motion.div variants={fadeUpVariants}>
          <PushComposer appId={app.public_app_id} />
        </motion.div>
      )}

      {activeTab === 'drip' && (
        <motion.div variants={fadeUpVariants}>
          <DripCampaigns appId={app.public_app_id} />
        </motion.div>
      )}

      {activeTab === 'history' && (
        <motion.div variants={fadeUpVariants}>
          <NotificationHistory appId={app.public_app_id} />
        </motion.div>
      )}

      {activeTab === 'scheduled' && (
        <motion.div variants={fadeUpVariants}>
          <NotificationHistory appId={app.public_app_id} isScheduled={true} />
        </motion.div>
      )}
    </motion.div>
  );
};
