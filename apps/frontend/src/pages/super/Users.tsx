import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  fetchAllUsers,
  updateStatus,
  updateAppLimit,
  sendWarning,
  removeUser,
  updateRole,
  updateUserRetentionPermission,
} from '../../store/slices/adminSlice';
import { User, UserStatus, UserRole } from '../../types';
import { UsersSkeleton } from '../../components/common/SkeletonLoader';
import { RiMore2Line, RiUserLine, RiShieldUserLine, RiAlertLine } from '@remixicon/react';
import { UserActionsMenu } from './components/UserActionsMenu';

type ModalMode = 'app-limit' | 'warning' | 'delete' | null;

const statusColors: Record<string, string> = {
  APPROVED:
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/40',
  PENDING:
    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40',
  BANNED:
    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40',
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN:
    'bg-theme-primary-500/10 text-theme-primary-600 dark:text-theme-primary-400 border border-theme-primary-500/20',
  ADMIN: 'bg-theme-bg-muted text-theme-text-secondary border border-theme-border',
};

export const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.admin);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [filter, setFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [appLimit, setAppLimit] = useState<string>('');
  const [warningMessage, setWarningMessage] = useState('');
  const [openMenu, setOpenMenu] = useState<{ id: number; anchorEl: HTMLElement } | null>(null);

  useEffect(() => {
    dispatch(fetchAllUsers(filter === 'ALL' ? undefined : filter));
  }, [filter, dispatch]);

  const handleStatusChange = async (userId: number, status: UserStatus) => {
    const result = await dispatch(updateStatus({ userId, status }));
    if (updateStatus.fulfilled.match(result)) {
      toast.success(`User ${status.toLowerCase()} successfully`);
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleRoleChange = async (userId: number, role: UserRole) => {
    const result = await dispatch(updateRole({ userId, role }));
    if (updateRole.fulfilled.match(result)) {
      toast.success(`User role updated to ${role}`);
    } else {
      toast.error('Failed to update role');
    }
  };

  const handleToggleRetentionPerm = async (user: User) => {
    const result = await dispatch(
      updateUserRetentionPermission({
        userId: user.id,
        canManageRetention: !user.can_manage_retention,
      })
    );
    if (updateUserRetentionPermission.fulfilled.match(result)) {
      toast.success(`Retention permission ${!user.can_manage_retention ? 'granted' : 'revoked'}`);
    } else {
      toast.error('Failed to update retention permission');
    }
  };

  const handleAppLimitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const limit = appLimit === '' ? null : parseInt(appLimit);
    const result = await dispatch(updateAppLimit({ userId: selectedUser.id, appLimit: limit }));
    if (updateAppLimit.fulfilled.match(result)) {
      closeModal();
      toast.success('App limit updated successfully');
    } else {
      toast.error('Failed to update app limit');
    }
  };

  const handleWarningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !warningMessage) return;
    const result = await dispatch(
      sendWarning({ userId: selectedUser.id, message: warningMessage })
    );
    if (sendWarning.fulfilled.match(result)) {
      closeModal();
      toast.success('Warning sent successfully');
    } else {
      toast.error('Failed to send warning');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const result = await dispatch(removeUser(selectedUser.id));
    if (removeUser.fulfilled.match(result)) {
      toast.success(
        `User deleted. ${(result.payload as any).deletedAppsCount} app(s) also deleted.`
      );
      closeModal();
    } else {
      toast.error('Failed to delete user');
    }
  };

  const openModal = (user: User, mode: ModalMode) => {
    setSelectedUser(user);
    setModalMode(mode);
    if (mode === 'app-limit') setAppLimit(user.app_limit?.toString() ?? '');
    if (mode === 'warning') setWarningMessage('');
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalMode(null);
    setAppLimit('');
    setWarningMessage('');
  };

  if (loading && users.length === 0) return <UsersSkeleton />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-display font-extrabold text-theme-text-primary tracking-tight">
          User Management
        </h1>
        <p className="text-theme-text-secondary mt-2">
          Manage accounts, permissions, and access across the platform.
        </p>
      </motion.div>

      {/* Filter Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['ALL', 'PENDING', 'APPROVED', 'BANNED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap border ${
              filter === status
                ? 'bg-theme-primary-500 text-white border-theme-primary-500 shadow-md shadow-theme-primary-500/20 scale-105'
                : 'bg-theme-bg-primary text-theme-text-secondary border-theme-border hover:border-theme-primary-500/50 hover:text-theme-text-primary'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card-2 p-0 overflow-hidden min-h-[calc(100dvh-340px)]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme-border bg-black/5 dark:bg-white/5">
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-widest text-theme-text-muted">
                  Name
                </th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-widest text-theme-text-muted">
                  Email
                </th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-widest text-theme-text-muted">
                  Status
                </th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-widest text-theme-text-muted">
                  Role
                </th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-widest text-theme-text-muted">
                  App Limit
                </th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-widest text-theme-text-muted text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-theme-text-secondary font-medium"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <RiUserLine size={40} className="text-theme-text-muted opacity-40" />
                      No users found matching the current filter.
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`border-b border-slate-200/50 dark:border-slate-500/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${idx % 2 === 0 ? '' : 'bg-black/[0.02] dark:bg-white/[0.02]'}`}
                  >
                    {/* Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-theme-primary-500/10 text-theme-primary-500 flex items-center justify-center font-bold text-sm shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-theme-text-primary">{user.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-5 text-theme-text-secondary text-sm">{user.email}</td>

                    {/* Status badge */}
                    <td className="py-4 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${statusColors[user.status] ?? ''}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* Role badge */}
                    <td className="py-4 px-5">
                      <span
                        className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-bold ${roleColors[user.role] ?? ''}`}
                      >
                        {user.role === 'SUPER_ADMIN' && <RiShieldUserLine size={12} />}
                        {user.role}
                      </span>
                    </td>

                    {/* App Limit */}
                    <td className="py-4 px-5">
                      <span className="bg-theme-bg-secondary border border-theme-border px-3 py-1 rounded-lg font-mono text-sm text-theme-text-primary">
                        {user.app_limit ?? '∞'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) =>
                          setOpenMenu(
                            openMenu?.id === user.id
                              ? null
                              : { id: user.id, anchorEl: e.currentTarget }
                          )
                        }
                        className="p-2 text-theme-text-secondary hover:text-theme-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition"
                        aria-label="User actions"
                      >
                        <RiMore2Line size={20} />
                      </button>

                      {openMenu?.id === user.id && (
                        <UserActionsMenu
                          user={user}
                          currentUserId={currentUser?.id}
                          anchorEl={openMenu.anchorEl}
                          onClose={() => setOpenMenu(null)}
                          onStatusChange={handleStatusChange}
                          onSetAppLimit={(u) => openModal(u, 'app-limit')}
                          onSendWarning={(u) => openModal(u, 'warning')}
                          onToggleRetentionPerm={handleToggleRetentionPerm}
                          onRoleChange={handleRoleChange}
                          onDelete={(u) => openModal(u, 'delete')}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── App Limit Modal ── */}
      {modalMode === 'app-limit' && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-theme-bg-primary border border-theme-border rounded-3xl w-full max-w-md p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-display font-extrabold mb-2 text-theme-text-primary">
              Set App Limit
            </h2>
            <p className="text-theme-text-secondary text-sm mb-6">
              Limiting apps for{' '}
              <strong className="text-theme-text-primary">{selectedUser.name}</strong>
            </p>
            <form onSubmit={handleAppLimitSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                  App Limit{' '}
                  <span className="text-theme-text-muted font-normal">
                    (leave blank for unlimited)
                  </span>
                </label>
                <input
                  type="number"
                  value={appLimit}
                  onChange={(e) => setAppLimit(e.target.value)}
                  className="input"
                  min="0"
                  placeholder="e.g. 5"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Save Limit
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── Warning Modal ── */}
      {modalMode === 'warning' && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-theme-bg-primary border border-amber-500/30 rounded-3xl w-full max-w-md p-8 shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
              <RiAlertLine size={24} />
            </div>
            <h2 className="text-2xl font-display font-extrabold mb-2 text-theme-text-primary">
              Send Warning
            </h2>
            <p className="text-theme-text-secondary text-sm mb-6">
              To <strong className="text-theme-text-primary">{selectedUser.name}</strong>
            </p>
            <form onSubmit={handleWarningSubmit} className="space-y-5">
              <textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                className="input resize-y"
                rows={4}
                placeholder="Type your warning message here..."
                required
              />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Send Warning
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── Delete User Modal ── */}
      {modalMode === 'delete' && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-theme-bg-primary border border-red-500/30 rounded-3xl w-full max-w-md p-8 shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
              <RiAlertLine size={24} />
            </div>
            <h2 className="text-2xl font-display font-extrabold mb-2 text-red-600 dark:text-red-400">
              Delete User?
            </h2>
            <p className="text-theme-text-primary mb-2">
              You are about to delete{' '}
              <strong className="text-theme-primary-500">{selectedUser.name}</strong>.
            </p>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6 text-sm text-red-600 dark:text-red-400 font-medium">
              This will permanently delete the user and all their apps. This action cannot be
              undone.
            </div>
            <div className="flex gap-3">
              <button onClick={handleDeleteUser} disabled={loading} className="btn-danger flex-1">
                {loading ? 'Deleting...' : 'Yes, Delete User'}
              </button>
              <button onClick={closeModal} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
