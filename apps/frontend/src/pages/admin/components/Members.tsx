import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import {
  fetchAppMembers,
  shareApp,
  updateAppMember,
  removeAppMember,
} from '../../../store/slices/appsSlice';
import { TableSkeleton } from '../../../components/common/SkeletonLoader';
import { RiUserSharedLine, RiDeleteBinLine, RiUserAddLine, RiRefreshLine } from '@remixicon/react';
import { ConfirmModal } from '../../../components/common/ConfirmModal';

interface MembersProps {
  appId: string;
}

export const Members: React.FC<MembersProps> = ({ appId }) => {
  const dispatch = useAppDispatch();
  const { members, loading, selectedApp: app } = useAppSelector((state) => state.apps);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'moderator' | 'viewer'>('viewer');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Custom Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    dispatch(fetchAppMembers(appId));
  }, [appId, dispatch]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setInviteLoading(true);
    try {
      const result = await dispatch(shareApp({ appId, email: email.trim(), role }));
      if (shareApp.fulfilled.match(result)) {
        toast.success(`App shared successfully with ${email}`);
        setEmail('');
        setRole('viewer');
      } else {
        toast.error(result.payload || 'Failed to share app');
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: 'moderator' | 'viewer') => {
    setActionLoadingId(userId);
    try {
      const result = await dispatch(updateAppMember({ appId, userId, role: newRole }));
      if (updateAppMember.fulfilled.match(result)) {
        toast.success('Member role updated successfully');
      } else {
        toast.error(result.payload || 'Failed to update role');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveClick = (userId: number, memberName: string) => {
    setMemberToRemove({ id: userId, name: memberName });
    setShowConfirmModal(true);
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;

    const { id: userId, name: memberName } = memberToRemove;
    setActionLoadingId(userId);
    try {
      const result = await dispatch(removeAppMember({ appId, userId }));
      if (removeAppMember.fulfilled.match(result)) {
        toast.success(`${memberName} removed successfully`);
      } else {
        toast.error(result.payload || 'Failed to remove member');
      }
    } finally {
      setActionLoadingId(null);
      setShowConfirmModal(false);
      setMemberToRemove(null);
    }
  };

  // Determine permissions
  const isOwnerOrSuper = app?.currentUserRole === 'owner' || app?.currentUserRole === 'superadmin';

  return (
    <div className="space-y-6">
      {/* Invite Member Section (Only visible to Owners or Super Admins) */}
      {isOwnerOrSuper && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-theme-text-primary flex items-center gap-2">
            <RiUserAddLine className="text-theme-primary-500" />
            Share App Access
          </h2>
          <p className="text-sm text-theme-text-secondary mb-6">
            Grant other registered users access to this application. Choose their role carefully to
            restrict permissions.
          </p>
          <form onSubmit={handleShare} className="grid md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                User Email Address
              </label>
              <input
                type="email"
                placeholder="collaborator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                required
                disabled={inviteLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                Role / Access Level
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full p-2 border border-theme-border rounded-lg bg-theme-bg-secondary text-theme-text-primary focus:ring-2 focus:ring-theme-primary-500 focus:border-transparent outline-none h-11"
                disabled={inviteLoading}
              >
                <option value="viewer">Viewer (Read-only)</option>
                <option value="moderator">Moderator (Write & Push)</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                disabled={inviteLoading}
                className="btn-primary w-full h-11 flex items-center justify-center gap-2 font-medium"
              >
                <RiUserSharedLine size={18} />
                {inviteLoading ? 'Sharing...' : 'Share Access'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members List Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-theme-text-primary flex items-center gap-2">
            <RiUserSharedLine className="text-theme-primary-500" />
            Authorized Collaborators ({members.length})
          </h2>
          <button
            onClick={() => dispatch(fetchAppMembers(appId))}
            className="text-sm font-medium text-theme-primary-500 hover:text-theme-primary-600 focus:outline-none flex items-center gap-1"
          >
            <RiRefreshLine size={16} />
            Refresh
          </button>
        </div>

        {loading && members.length === 0 ? (
          <TableSkeleton rows={3} cols={4} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-theme-border text-sm text-theme-text-secondary">
                  <th className="p-4 font-medium">Collaborator</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  {isOwnerOrSuper && <th className="p-4 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const isMemberOwner = member.role === 'owner';
                  return (
                    <tr
                      key={member.id}
                      className="border-b border-theme-border hover:bg-theme-bg-secondary/50 transition-colors"
                    >
                      <td className="p-4 font-semibold text-theme-text-primary text-sm">
                        {member.name}
                      </td>
                      <td className="p-4 font-mono text-sm text-theme-text-secondary">
                        {member.email}
                      </td>
                      <td className="p-4">
                        {isMemberOwner ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                            Creator & Owner
                          </span>
                        ) : isOwnerOrSuper ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                            disabled={actionLoadingId === member.id}
                            className="p-1 px-2 border border-theme-border rounded bg-theme-bg-secondary text-theme-text-primary text-xs font-medium focus:ring-1 focus:ring-theme-primary-500 outline-none"
                          >
                            <option value="viewer">Viewer (Read-only)</option>
                            <option value="moderator">Moderator</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              member.role === 'moderator'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800/50'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                        )}
                      </td>
                      {isOwnerOrSuper && (
                        <td className="p-4 text-right">
                          {!isMemberOwner && (
                            <button
                              onClick={() => handleRemoveClick(member.id, member.name)}
                              disabled={actionLoadingId === member.id}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                              title="Revoke Access"
                            >
                              <RiDeleteBinLine size={16} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Remove Collaborator Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setMemberToRemove(null);
        }}
        onConfirm={handleRemoveConfirm}
        loading={actionLoadingId !== null}
        title="Remove Collaborator?"
        description={`Are you sure you want to remove ${memberToRemove?.name || 'this collaborator'} from this app? They will lose all access immediately.`}
        confirmLabel="Yes, Remove"
        confirmingLabel="Removing..."
        variant="danger"
      />
    </div>
  );
};
