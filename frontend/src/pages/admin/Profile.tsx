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
import { motion } from "motion/react";

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
      {show ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )}
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
      className="min-h-[calc(100vh-64px)] relative overflow-hidden transition-colors duration-300 py-12 px-4"
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
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
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
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>{" "}
                        Enabled
                      </>
                    ) : permissionStatus === "denied" ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                            clipRule="evenodd"
                          />
                        </svg>{" "}
                        Blocked
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>{" "}
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
                    <svg
                      className="w-24 h-24 text-theme-success"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-theme-success font-semibold flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
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
                      <svg
                        className="w-6 h-6 text-red-600 dark:text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
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
