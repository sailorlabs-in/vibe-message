import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  fetchAllUsers,
  updateStatus,
  updateAppLimit,
  sendWarning,
  removeUser,
  updateRole,
  updateUserRetentionPermission,
} from "../../store/slices/adminSlice";
import { User, UserStatus, UserRole } from "../../types";

export const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { users, loading } = useAppSelector((state) => state.admin);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [filter, setFilter] = useState<UserStatus | "ALL">("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [appLimit, setAppLimit] = useState<string | undefined>(undefined);
  const [warningMessage, setWarningMessage] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAllUsers(filter === "ALL" ? undefined : filter));
  }, [filter, dispatch]);

  const handleStatusChange = async (userId: number, status: UserStatus) => {
    const result = await dispatch(updateStatus({ userId, status }));
    if (updateStatus.fulfilled.match(result)) {
      toast.success(`User ${status.toLowerCase()} successfully`);
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleRoleChange = async (userId: number, role: UserRole) => {
    const result = await dispatch(updateRole({ userId, role }));
    if (updateRole.fulfilled.match(result)) {
      toast.success(`User role updated to ${role}`);
    } else {
      toast.error("Failed to update role");
    }
  };

  const handleToggleRetentionPerm = async (user: User) => {
    const result = await dispatch(
      updateUserRetentionPermission({ userId: user.id, canManageRetention: !user.can_manage_retention })
    );
    if (updateUserRetentionPermission.fulfilled.match(result)) {
      toast.success(`Retention permission ${!user.can_manage_retention ? 'granted' : 'revoked'}`);
    } else {
      toast.error("Failed to update retention permission");
    }
  };

  const handleAppLimitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const limit =
      appLimit === "" || appLimit === undefined ? null : parseInt(appLimit);
    const result = await dispatch(
      updateAppLimit({ userId: selectedUser.id, appLimit: limit }),
    );
    if (updateAppLimit.fulfilled.match(result)) {
      setSelectedUser(null);
      setAppLimit(undefined);
      toast.success("App limit updated successfully");
    } else {
      toast.error("Failed to update app limit");
    }
  };

  const handleWarningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !warningMessage) return;

    const result = await dispatch(
      sendWarning({ userId: selectedUser.id, message: warningMessage }),
    );
    if (sendWarning.fulfilled.match(result)) {
      setSelectedUser(null);
      setWarningMessage("");
      toast.success("Warning sent successfully");
    } else {
      toast.error("Failed to send warning");
    }
  };

  const handleDeleteUser = async (user: User) => {
    const result = await dispatch(removeUser(user.id));
    if (removeUser.fulfilled.match(result)) {
      toast.success(
        `User deleted successfully. ${result.payload.deletedAppsCount} app(s) were also deleted.`,
      );
      setSelectedUser(null);
      setWarningMessage("");
    } else {
      toast.error("Failed to delete user");
    }
  };

  if (loading && users.length === 0)
    return <div className="p-8 text-theme-text-primary">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-theme-text-primary">
        User Management
      </h1>

      <div className="mb-8 flex space-x-3 overflow-x-auto pb-2">
        {(["ALL", "PENDING", "APPROVED", "BANNED"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-5 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
              filter === status
                ? "bg-theme-primary-600 dark:bg-theme-primary-500 text-white dark:text-theme-bg-primary shadow-md border-transparent"
                : "bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-muted border border-theme-border "
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto min-h-[calc(100dvh-340px)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-theme-border">
              <th className="py-4 px-4 font-semibold text-theme-text-primary">
                Name
              </th>
              <th className="py-4 px-4 font-semibold text-theme-text-primary">
                Email
              </th>
              <th className="py-4 px-4 font-semibold text-theme-text-primary">
                Status
              </th>
              <th className="py-4 px-4 font-semibold text-theme-text-primary">
                Role
              </th>
              <th className="py-4 px-4 font-semibold text-theme-text-primary">
                App Limit
              </th>
              <th className="py-4 px-4 font-semibold text-theme-text-primary text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {openMenuId !== null && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpenMenuId(null)}
              ></div>
            )}
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-50 dark:border-[#1A1A1D] hover:bg-gray-50/50 dark:hover:bg-[#151518] transition-colors"
              >
                <td className="py-4 px-4 font-medium text-theme-text-primary">
                  {user.name}
                </td>
                <td className="py-4 px-4 text-theme-text-secondary">
                  {user.email}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                      user.status === "APPROVED"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                        : user.status === "PENDING"
                          ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-500"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-theme-text-secondary">
                  <span className="bg-theme-bg-muted border border-theme-border px-2 py-1 rounded font-mono text-sm text-theme-text-primary">
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-4 text-theme-text-secondary">
                  <span className="bg-theme-bg-muted border border-theme-border px-2 py-1 rounded font-mono text-sm text-theme-text-primary">
                    {user.app_limit ?? "Unlimited"}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === user.id ? null : user.id)
                      }
                      className="p-2 text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted rounded-lg transition"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>

                    {openMenuId === user.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-theme-bg-secondary rounded-xl shadow-xl border border-theme-border py-1 z-50 flex flex-col">
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            navigate(`/apps?userId=${user.id}`);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-theme-bg-muted transition text-indigo-600 dark:text-indigo-400"
                        >
                          View Apps
                        </button>

                        <div className="h-px bg-theme-border my-1 w-full flex-shrink-0" />

                        {user.status !== "APPROVED" && (
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              handleStatusChange(user.id, "APPROVED");
                            }}
                            disabled={currentUser?.id === user.id}
                            className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approve User
                          </button>
                        )}

                        {user.status !== "BANNED" && (
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              handleStatusChange(user.id, "BANNED");
                            }}
                            disabled={currentUser?.id === user.id}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Ban User
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            setSelectedUser(user);
                            setAppLimit(user.app_limit?.toString() || "");
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Set App Limit
                        </button>

                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            setSelectedUser(user);
                          }}
                          disabled={currentUser?.id === user.id}
                          className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Send Warning
                        </button>

                        <div className="h-px bg-theme-border my-1 w-full flex-shrink-0" />

                        {user.role === "ADMIN" && (
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              handleToggleRetentionPerm(user);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-bg-muted transition"
                          >
                            {user.can_manage_retention ? "Revoke Custom Auto-Delete" : "Allow Custom Auto-Delete"}
                          </button>
                        )}

                        {user.role !== "SUPER_ADMIN" ? (
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              handleRoleChange(user.id, "SUPER_ADMIN");
                            }}
                            disabled={currentUser?.id === user.id}
                            className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Make Super Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              handleRoleChange(user.id, "ADMIN");
                            }}
                            disabled={currentUser?.id === user.id}
                            className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Remove Super Admin
                          </button>
                        )}
                        <div className="h-px bg-theme-border my-1 w-full flex-shrink-0" />

                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            setSelectedUser(user);
                            setWarningMessage("DELETE_CONFIRM");
                          }}
                          disabled={currentUser?.id === user.id}
                          className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete User
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-theme-text-secondary font-medium"
                >
                  No users found matching the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* App Limit Modal */}
      {selectedUser && appLimit !== undefined && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-theme-bg-secondary rounded-xl max-w-md w-full p-8 shadow-2xl border border-theme-border">
            <h2 className="text-2xl font-bold mb-6 text-theme-text-primary">
              Set App Limit for {selectedUser.name}
            </h2>
            <form onSubmit={handleAppLimitSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                  App Limit (leave empty for unlimited)
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
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="btn-primary flex-1 py-2.5">
                  Save Limit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setAppLimit(undefined);
                  }}
                  className="btn-secondary flex-1 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {selectedUser &&
        warningMessage !== undefined &&
        warningMessage !== "DELETE_CONFIRM" &&
        appLimit === undefined && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-theme-bg-secondary rounded-xl max-w-md w-full p-8 shadow-2xl border border-theme-border">
              <h2 className="text-2xl font-bold mb-6 text-theme-text-primary">
                Send Warning to {selectedUser.name}
              </h2>
              <form onSubmit={handleWarningSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                    Warning Message
                  </label>
                  <textarea
                    value={warningMessage}
                    onChange={(e) => setWarningMessage(e.target.value)}
                    className="input resize-y"
                    rows={4}
                    placeholder="Type your warning message here..."
                    required
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="btn-primary flex-1 py-2.5 text-center justify-center"
                  >
                    Send Warning
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setWarningMessage("");
                    }}
                    className="btn-secondary flex-1 py-2.5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Delete User Modal */}
      {selectedUser && warningMessage === "DELETE_CONFIRM" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-theme-bg-secondary rounded-xl max-w-md w-full p-8 shadow-2xl border border-red-200 dark:border-red-900/30">
            <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-500">
              Delete User?
            </h2>
            <p className="text-theme-text-primary mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-theme-primary-600 dark:text-theme-primary-400">
                {selectedUser.name}
              </span>
              ?
            </p>
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 p-4 rounded-lg mb-6">
              <p className="text-red-700 dark:text-red-400 font-medium text-sm">
                This will permanently delete the user and all their apps. This
                action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteUser(selectedUser)}
                className="bg-red-600 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-red-700 transition flex-1"
              >
                Yes, Delete User
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setWarningMessage("");
                }}
                className="btn-secondary flex-1 py-2.5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
