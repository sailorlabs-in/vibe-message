import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
} from "../../store/slices/authSlice";
import { systemService } from "../../services/systemService";
import { motion } from "motion/react";
import { RiEyeLine, RiEyeOffLine, RiLoader4Line, RiCheckboxCircleLine, RiCloseCircleLine, RiErrorWarningLine, RiNotificationLine, RiAlertLine } from "@remixicon/react";


const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { requestPermission, permissionStatus } = useNotifications();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Profile form
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Show password toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const [globalRetention, setGlobalRetention] = useState(14);
  const [retentionSaving, setRetentionSaving] = useState(false);

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      systemService.getSettings()
        .then(settings => setGlobalRetention(settings.default_retention_days))
        .catch(console.error);
    }
  }, [user]);

  const handleUpdateRetention = async () => {
    setRetentionSaving(true);
    try {
      await systemService.updateSettings(globalRetention);
      toast.success("Global Default Retention updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update system settings");
    } finally {
      setRetentionSaving(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(updateUserProfile({ name, email }));
    if (updateUserProfile.fulfilled.match(result)) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error("Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    const result = await dispatch(
      changeUserPassword({ oldPassword, newPassword }),
    );
    if (changeUserPassword.fulfilled.match(result)) {
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error("Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    const result = await dispatch(deleteUserAccount());
    if (deleteUserAccount.fulfilled.match(result)) {
      toast.success("Account deleted successfully");
      logout();
      navigate("/");
    } else {
      toast.error("Failed to delete account");
    }
  };

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const EyeIcon = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-4 top-4 text-theme-text-muted hover:text-theme-text-primary transition-colors focus:outline-none"
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? <RiEyeOffLine size={24} /> : <RiEyeLine size={24} />}
    </button>
  );

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
      className="min-h-[calc(100vh-120px)] relative overflow-hidden transition-colors duration-300 py-12 px-4"
    >
      {/* Background is now handled globally in App.tsx */}

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          variants={fadeUpVariants}
          className="mb-10 text-center sm:text-left"
        >
          <h1 className="text-4xl font-black tracking-tight text-theme-text-primary drop-shadow-sm">
            Profile Settings
          </h1>
          <p className="text-theme-text-secondary mt-2 font-medium">
            Manage your personal information, security, and preferences.
          </p>
        </motion.div>

        <div className="grid gap-8">
          {/* Account Information */}
          <motion.div
            variants={fadeUpVariants}
            className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-theme-text-primary pb-4 border-b border-theme-border/50">
              Account Information
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all placeholder-transparent peer"
                    placeholder="Full Name"
                    id="profile-name"
                    required
                  />
                  <label
                    htmlFor="profile-name"
                    className="absolute left-5 top-4 text-theme-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:bg-theme-bg-secondary px-1 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:bg-theme-bg-secondary pointer-events-none rounded"
                  >
                    Full Name
                  </label>
                </div>

                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all placeholder-transparent peer"
                    placeholder="Email Address"
                    id="profile-email"
                    required
                  />
                  <label
                    htmlFor="profile-email"
                    className="absolute left-5 top-4 text-theme-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:bg-theme-bg-secondary px-1 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:bg-theme-bg-secondary pointer-events-none rounded"
                  >
                    Email Address
                  </label>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <input
                    type="text"
                    value={user?.role}
                    disabled
                    className="w-full px-5 py-4 bg-theme-bg-muted/50 text-theme-text-muted border border-theme-border rounded-2xl cursor-not-allowed transition-all placeholder-transparent peer"
                    placeholder="Role"
                    id="profile-role"
                  />
                  <label
                    htmlFor="profile-role"
                    className="absolute left-5 -top-2.5 text-xs text-theme-text-secondary bg-theme-bg-secondary px-1 rounded pointer-events-none"
                  >
                    Role
                  </label>
                </div>

                <div className="flex items-center">
                  <span
                    className={`inline-flex px-4 py-2 rounded-full text-sm font-bold shadow-sm ring-1 ring-inset ${
                      user?.status === "APPROVED"
                        ? "bg-theme-success/10 text-theme-success ring-theme-success/30"
                        : user?.status === "PENDING"
                          ? "bg-theme-warning/10 text-theme-warning ring-theme-warning/30"
                          : "bg-theme-error/10 text-theme-error ring-theme-error/30"
                    }`}
                  >
                    Status: {user?.status}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-2xl font-semibold transform hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-70 disabled:filter-grayscale disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <RiLoader4Line size={20} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Change Password */}
          <motion.div
            variants={fadeUpVariants}
            className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-theme-text-primary pb-4 border-b border-theme-border/50">
              Security
            </h2>

            <div className="space-y-6">
              <p className="text-theme-text-secondary text-sm">
                Ensure your account is using a long, random password to stay
                secure.
              </p>

              <div className="grid gap-6">
                <div className="relative group max-w-md">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full pl-5 pr-12 py-4 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all placeholder-transparent peer"
                    placeholder="Current Password"
                    id="old-password"
                    required
                  />
                  <label
                    htmlFor="old-password"
                    className="absolute left-5 top-4 text-theme-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:bg-theme-bg-secondary px-1 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:bg-theme-bg-secondary pointer-events-none rounded"
                  >
                    Current Password
                  </label>
                  <EyeIcon
                    show={showOldPassword}
                    toggle={() => setShowOldPassword(!showOldPassword)}
                  />
                </div>

                <div className="relative group max-w-md">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-5 pr-12 py-4 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all placeholder-transparent peer"
                    placeholder="New Password"
                    id="new-password"
                    required
                    minLength={6}
                  />
                  <label
                    htmlFor="new-password"
                    className="absolute left-5 top-4 text-theme-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:bg-theme-bg-secondary px-1 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:bg-theme-bg-secondary pointer-events-none rounded"
                  >
                    New Password
                  </label>
                  <EyeIcon
                    show={showNewPassword}
                    toggle={() => setShowNewPassword(!showNewPassword)}
                  />
                  <p className="text-[11px] text-theme-text-muted mt-2 ml-1">
                    Minimum 6 characters
                  </p>
                </div>

                <div className="relative group max-w-md">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-5 pr-12 py-4 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all placeholder-transparent peer"
                    placeholder="Confirm New Password"
                    id="confirm-new-password"
                    required
                    minLength={6}
                  />
                  <label
                    htmlFor="confirm-new-password"
                    className="absolute left-5 top-4 text-theme-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:bg-theme-bg-secondary px-1 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:bg-theme-bg-secondary pointer-events-none rounded"
                  >
                    Confirm New Password
                  </label>
                  <EyeIcon
                    show={showConfirmPassword}
                    toggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={
                    loading || !oldPassword || !newPassword || !confirmPassword
                  }
                  className="w-full sm:w-auto px-8 py-3 bg-theme-text-primary text-theme-bg-primary hover:bg-theme-text-secondary rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            variants={fadeUpVariants}
            className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-theme-text-primary pb-4 border-b border-theme-border/50">
              Notification Preferences
            </h2>

            <div className="space-y-6">
              <div className="relative group max-w-md">
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-5 py-4 bg-theme-bg-muted/50 text-theme-text-muted border border-theme-border rounded-2xl cursor-not-allowed transition-all placeholder-transparent peer"
                  placeholder="External ID"
                  id="profile-external-id"
                />
                <label
                  htmlFor="profile-external-id"
                  className="absolute left-5 -top-2.5 text-xs text-theme-text-secondary bg-theme-bg-secondary px-1 rounded pointer-events-none"
                >
                  Unique User Identifier
                </label>
                <p className="text-[11px] text-theme-text-muted mt-2 ml-1">
                  This identifier links your browser device with our
                  notification servers.
                </p>
              </div>

              <div className="flex items-center gap-4 py-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-theme-text-primary">
                    Push Notifications
                  </h3>
                  <p className="text-sm text-theme-text-secondary mt-1">
                    Receive alerts directly in your browser even when you're
                    away.
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
                      ${
                        permissionStatus === "granted"
                          ? "bg-theme-success/10 text-theme-success"
                          : permissionStatus === "denied"
                            ? "bg-theme-error/10 text-theme-error"
                            : "bg-theme-warning/10 text-theme-warning"
                      }`}
                  >
                    {permissionStatus === "granted" ? (
                      <>
                        <RiCheckboxCircleLine size={16} />{" "}
                        Enabled
                      </>
                    ) : permissionStatus === "denied" ? (
                      <>
                        <RiCloseCircleLine size={16} />{" "}
                        Blocked
                      </>
                    ) : (
                      <>
                        <RiErrorWarningLine size={16} />{" "}
                        Disabled
                      </>
                    )}
                  </span>
                </div>
              </div>

              {permissionStatus !== "granted" && (
                <div className="bg-theme-bg-muted/50 rounded-2xl p-6 border border-theme-border border-dashed">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <p className="text-sm text-theme-text-primary text-center sm:text-left">
                      {permissionStatus === "denied"
                        ? "You have blocked notifications in your browser settings. You must manually allow them in your browser URL bar to receive alerts."
                        : "Enable notifications to stay updated on your account status, apps, and warnings."}
                    </p>
                    <button
                      type="button"
                      onClick={() => requestPermission()}
                      disabled={permissionStatus === "denied"}
                      className="shrink-0 px-6 py-2.5 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Enable Access
                    </button>
                  </div>
                </div>
              )}

              {permissionStatus === "granted" && (
                <div className="bg-theme-success/5 border border-theme-success/20 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <RiNotificationLine size={96} className="text-theme-success" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-theme-success font-semibold flex items-center gap-2">
                      <RiCheckboxCircleLine size={20} />
                      Everything looks good!
                    </h4>
                    <p className="text-theme-text-secondary text-sm mt-2">
                      You are actively receiving notifications. You will be
                      alerted for account approvals, app updates, and important
                      administrative activity on this device.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* System Configuration (SUPER ADMIN ONLY) */}
          {isSuperAdmin && (
            <motion.div
              variants={fadeUpVariants}
              className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-theme-text-primary pb-4 border-b border-theme-border/50">
                System Global Settings
              </h2>
              
              <div className="space-y-6">
                <div className="relative group max-w-md">
                  <label htmlFor="global-retention" className="block text-sm font-medium mb-2 text-theme-text-primary">
                    Default Notification Retention (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={globalRetention}
                    onChange={(e) => setGlobalRetention(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-5 py-4 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all peer"
                    id="global-retention"
                  />
                  <p className="text-xs text-theme-text-muted mt-2">
                    This timer determines how long notification logs are kept before being auto-deleted by the cron job across all apps that don't specify their own retention override.
                  </p>
                </div>
                
                <div className="pt-2 flex justify-start">
                  <button
                    onClick={handleUpdateRetention}
                    disabled={retentionSaving}
                    className="w-full sm:w-auto px-8 py-3 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {retentionSaving ? "Saving..." : "Save System Settings"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Danger Zone */}
          {!isSuperAdmin && (
            <motion.div
              variants={fadeUpVariants}
              className="backdrop-blur-2xl bg-theme-error/5 border border-theme-error/20 rounded-[2rem] p-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-theme-error pb-4 border-b border-theme-error/20">
                Danger Zone
              </h2>
              <p className="text-theme-text-primary mb-6 max-w-2xl">
                Permanently delete your account and all of its contents from our
                servers. This action is irreversible. All your apps, API keys,
                and configurations will be dropped.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 outline-none focus:ring-4 focus:ring-red-500/30 text-white rounded-xl font-bold transition-all active:scale-95"
                >
                  Delete Account...
                </button>
              ) : (
                <div className="border border-red-500/30 rounded-2xl p-6 bg-red-500/10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <RiAlertLine size={24} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-red-600 dark:text-red-400 font-bold text-lg mb-1">
                        Are you sure you want to do this?
                      </h4>
                      <p className="text-red-800/80 dark:text-red-200/80 text-sm mb-6 max-w-lg">
                        You will immediately lose access to the platform. We
                        cannot recover any metrics, notifications, or
                        configurations once you confirm.
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={loading}
                          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                          {loading ? "Deleting..." : "Yes, Purge My Data"}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-6 py-2.5 bg-theme-bg-secondary text-theme-text-primary border border-theme-border font-bold rounded-xl hover:bg-theme-bg-muted transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
