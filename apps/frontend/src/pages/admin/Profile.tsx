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
import { unregisterAllSystemDevices } from "../../store/slices/adminSlice";
import { systemService } from "../../services/systemService";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { motion, AnimatePresence } from "motion/react";
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
  RiUser3Line,
  RiSettings3Line,
} from "@remixicon/react";

// ─── Reusable floating-label input ────────────────────────────────────────────
const FloatingInput = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  minLength,
  rightSlot,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  rightSlot?: React.ReactNode;
}) => (
  <div className="relative group">
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      minLength={minLength}
      placeholder={label}
      className={`w-full px-5 py-4 ${rightSlot ? "pr-12" : ""} bg-white dark:bg-slate-800 text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-transparent transition-all placeholder-transparent peer disabled:opacity-60 disabled:cursor-not-allowed`}
    />
    {/* Label — always floated when disabled (disabled inputs always show a value) */}
    <label
      htmlFor={id}
      className={`absolute left-5 px-1 rounded pointer-events-none text-theme-text-secondary transition-all bg-theme-bg-secondary
        ${
          disabled
            ? "-top-2.5 text-xs"
            : "top-4 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:bg-theme-bg-secondary peer-valid:-top-2.5 peer-valid:text-xs peer-valid:bg-theme-bg-secondary"
        }`}
    >
      {label}
    </label>
    {rightSlot && (
      <div className="absolute right-4 top-5">{rightSlot}</div>
    )}
  </div>
);

// ─── Section card wrapper ──────────────────────────────────────────────────────
const SectionCard = ({
  icon,
  title,
  children,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    className={`rounded-3xl border p-8 backdrop-blur-2xl shadow-sm ${
      danger
        ? "bg-red-500/5 border-red-500/20"
        : "bg-white/20 dark:bg-white/5 border-theme-border"
    }`}
  >
    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-theme-border/60">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          danger
            ? "bg-red-500/10 text-red-500"
            : "bg-theme-primary-500/10 text-theme-primary-500"
        }`}
      >
        {icon}
      </div>
      <h2 className={`text-xl font-display font-bold ${danger ? "text-red-500" : "text-theme-text-primary"}`}>
        {title}
      </h2>
    </div>
    {children}
  </motion.div>
);

// ─── Main Profile component ────────────────────────────────────────────────────
const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { requestPermission, permissionStatus } = useNotifications();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSystemConfirmModal, setShowSystemConfirmModal] = useState(false);

  const [globalRetention, setGlobalRetention] = useState(14);
  const [retentionSaving, setRetentionSaving] = useState(false);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (isSuperAdmin) {
      systemService
        .getSettings()
        .then((s) => setGlobalRetention(s.default_retention_days))
        .catch(console.error);
    }
  }, [isSuperAdmin]);

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
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    if (newPassword.length < 6) return toast.error("Minimum 6 characters required");

    const result = await dispatch(changeUserPassword({ oldPassword, newPassword }));
    if (changeUserPassword.fulfilled.match(result)) {
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error("Failed to change password");
    }
  };

  const handleUpdateRetention = async () => {
    setRetentionSaving(true);
    try {
      await systemService.updateSettings(globalRetention);
      toast.success("Global retention updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setRetentionSaving(false);
    }
  };

  const handleUnregisterSystemWide = async () => {
    const result = await dispatch(unregisterAllSystemDevices());
    if (unregisterAllSystemDevices.fulfilled.match(result)) {
      toast.success("Successfully unregistered all devices globally.");
    } else {
      toast.error("Failed to unregister devices globally.");
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

  const EyeToggle = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button
      type="button"
      onClick={toggle}
      className="text-theme-text-muted hover:text-theme-text-primary transition-colors focus:outline-none"
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
    </button>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      className="min-h-[calc(100vh-120px)] py-12 px-4"
    >
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: -12 }, visible: { opacity: 1, y: 0 } }}
          className="mb-10"
        >
          <h1 className="text-4xl font-display font-extrabold tracking-tight text-theme-text-primary">
            Profile Settings
          </h1>
          <p className="text-theme-text-secondary mt-2">
            Manage your personal info, security, and preferences.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {/* ── Account Information ── */}
          <SectionCard icon={<RiUser3Line size={20} />} title="Account Information">
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <FloatingInput id="profile-name" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <FloatingInput id="profile-email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <FloatingInput id="profile-role" label="Role" value={user?.role ?? ""} disabled />
                <div className="flex items-center">
                  <span
                    className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ring-1 ring-inset ${
                      user?.status === "APPROVED"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-green-300 dark:ring-green-800/40"
                        : user?.status === "PENDING"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-300 dark:ring-amber-800/40"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-red-300 dark:ring-red-800/40"
                    }`}
                  >
                    Status: {user?.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <RiLoader4Line size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </SectionCard>

          {/* ── Security ── */}
          <SectionCard icon={<RiShieldKeyholeLine size={20} />} title="Security">
            <p className="text-theme-text-secondary text-sm mb-6">
              Use a long, random password to keep your account secure.
            </p>
            <div className="grid gap-5 max-w-md">
              <FloatingInput
                id="old-password"
                label="Current Password"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                rightSlot={<EyeToggle show={showOldPassword} toggle={() => setShowOldPassword(!showOldPassword)} />}
              />
              <div>
                <FloatingInput
                  id="new-password"
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  rightSlot={<EyeToggle show={showNewPassword} toggle={() => setShowNewPassword(!showNewPassword)} />}
                />
                <p className="text-xs text-theme-text-muted mt-1.5 ml-1">Minimum 6 characters</p>
              </div>
              <FloatingInput
                id="confirm-new-password"
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                rightSlot={<EyeToggle show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} />}
              />
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                className="btn-primary"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </SectionCard>

          {/* ── Notification Preferences ── */}
          <SectionCard icon={<RiNotificationLine size={20} />} title="Notification Preferences">
            <div className="space-y-5">
              {/* External ID display */}
              <FloatingInput
                id="profile-external-id"
                label="Unique User Identifier"
                value={user?.email || ""}
                disabled
              />
              <p className="text-xs text-theme-text-muted -mt-2 ml-1">
                This identifier links your browser device with our notification servers.
              </p>

              {/* Permission status row */}
              <div className="flex items-center justify-between py-4 border-t border-theme-border/50">
                <div>
                  <h3 className="font-semibold text-theme-text-primary">Push Notifications</h3>
                  <p className="text-sm text-theme-text-secondary mt-0.5">
                    Receive alerts directly in your browser.
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    permissionStatus === "granted"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : permissionStatus === "denied"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {permissionStatus === "granted" ? (
                    <><RiCheckboxCircleLine size={14} /> Enabled</>
                  ) : permissionStatus === "denied" ? (
                    <><RiCloseCircleLine size={14} /> Blocked</>
                  ) : (
                    <><RiErrorWarningLine size={14} /> Disabled</>
                  )}
                </span>
              </div>

              {/* Enable prompt */}
              {permissionStatus !== "granted" && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-dashed border-theme-border flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <p className="text-sm text-theme-text-primary">
                    {permissionStatus === "denied"
                      ? "Notifications are blocked in your browser. Manually allow them from the address bar."
                      : "Enable notifications to stay updated on account status and app activity."}
                  </p>
                  <button
                    type="button"
                    onClick={() => requestPermission()}
                    disabled={permissionStatus === "denied"}
                    className="btn-primary shrink-0"
                  >
                    Enable Access
                  </button>
                </div>
              )}

              {/* Success state */}
              {permissionStatus === "granted" && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <RiNotificationLine size={80} className="text-green-500" />
                  </div>
                  <h4 className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-2 relative z-10">
                    <RiCheckboxCircleLine size={18} /> Everything looks good!
                  </h4>
                  <p className="text-theme-text-secondary text-sm mt-2 relative z-10">
                    You are actively receiving notifications on this device.
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── System Settings (Super Admin only) ── */}
          {isSuperAdmin && (
            <SectionCard icon={<RiSettings3Line size={20} />} title="System Global Settings">
              <div className="space-y-6">
                <div className="max-w-sm">
                  <label
                    htmlFor="global-retention"
                    className="block text-sm font-medium mb-2 text-theme-text-primary"
                  >
                    Default Notification Retention (Days)
                  </label>
                  <input
                    id="global-retention"
                    type="number"
                    min="1"
                    value={globalRetention}
                    onChange={(e) => setGlobalRetention(parseInt(e.target.value, 10) || 1)}
                    className="input"
                  />
                  <p className="text-xs text-theme-text-muted mt-2">
                    Notification logs are auto-deleted after this many days across all apps without a custom override.
                  </p>
                </div>

                <div>
                  <button
                    onClick={handleUpdateRetention}
                    disabled={retentionSaving}
                    className="btn-primary"
                  >
                    {retentionSaving ? "Saving..." : "Save System Settings"}
                  </button>
                </div>

                {/* Danger: system-wide unregister */}
                <div className="pt-6 mt-2 border-t border-theme-border/50">
                  <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3">
                    System Danger Actions
                  </p>
                  <button
                    onClick={() => setShowSystemConfirmModal(true)}
                    disabled={loading}
                    className="btn-danger flex items-center gap-2"
                  >
                    <RiAlertLine size={18} />
                    Unregister All Devices (System-Wide)
                  </button>
                  <p className="text-xs text-theme-text-muted mt-2">
                    Forcibly unregisters all devices across every app. Users must re-register to receive push notifications.
                  </p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── Danger Zone (non-super-admin) ── */}
          {!isSuperAdmin && (
            <SectionCard icon={<RiAlertLine size={20} />} title="Danger Zone" danger>
              <p className="text-theme-text-primary mb-6">
                Permanently delete your account and all its contents from our servers. This is irreversible — all apps, API keys, and configurations will be dropped.
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
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500/30"
                    >
                      Delete Account…
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="border border-red-500/30 rounded-2xl p-6 bg-red-500/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                        <RiAlertLine size={24} className="text-red-500" />
                      </div>
                      <div>
                        <h4 className="text-red-600 dark:text-red-400 font-bold text-lg mb-1">
                          Are you absolutely sure?
                        </h4>
                        <p className="text-red-800/80 dark:text-red-200/80 text-sm mb-6 max-w-lg">
                          You will immediately lose access to the platform. We cannot recover any metrics, notifications, or configurations once confirmed.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={loading}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                          >
                            {loading ? "Deleting..." : "Yes, Purge My Data"}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-6 py-2.5 bg-black/10 dark:bg-white/10 text-theme-text-primary border border-theme-border font-bold rounded-xl hover:bg-black/20 dark:hover:bg-white/20 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>
          )}
        </div>
      </div>

      {/* ── System-Wide Unregister Confirmation Modal ── */}
      <ConfirmModal
        isOpen={showSystemConfirmModal}
        onClose={() => !loading && setShowSystemConfirmModal(false)}
        onConfirm={() => {
          setShowSystemConfirmModal(false);
          handleUnregisterSystemWide();
        }}
        loading={loading}
        title="Critical Warning"
        description={<>Are you sure you want to unregister <strong className="text-red-500 font-bold tracking-wide">ALL DEVICES SYSTEM-WIDE?</strong><br/><br/>Every user across every app will stop receiving notifications until they re-register!</>}
        confirmLabel="Execute Purge"
        confirmingLabel="Purging..."
        icon={<RiAlertLine size={28} />}
        variant="danger"
      />
    </motion.div>
  );
};

export default Profile;
