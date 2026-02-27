import React, { useState, useEffect } from"react";
import { useNavigate } from"react-router-dom";
import toast from"react-hot-toast";
import { useAuth } from"../../context/AuthContext";
import { useNotifications } from"../../context/NotificationContext";
import { useAppDispatch, useAppSelector } from"../../store/store";
import {
 updateUserProfile,
 changeUserPassword,
 deleteUserAccount,
} from"../../store/slices/authSlice";

const Profile: React.FC = () => {
 const { user, logout } = useAuth();
 const { requestPermission, permissionStatus } = useNotifications();
 const dispatch = useAppDispatch();
 const { loading } = useAppSelector((state) => state.auth);
 const navigate = useNavigate();

 // Profile form
 const [name, setName] = useState(user?.name ||"");
 const [email, setEmail] = useState(user?.email ||"");

 // Password form
 const [oldPassword, setOldPassword] = useState("");
 const [newPassword, setNewPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");

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
 changeUserPassword({ oldPassword, newPassword })
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

 const isSuperAdmin = user?.role ==="SUPER_ADMIN";

 return (
 <div className="max-w-2xl mx-auto px-4 py-8">
 <h1 className="text-3xl font-bold mb-8 text-theme-text-primary">Profile Settings</h1>

 {/* Account Information */}
 <div className="card mb-6">
 <h2 className="text-xl font-semibold mb-6 text-theme-text-primary border-b border-theme-border pb-4">
 Account Information
 </h2>

 <form onSubmit={handleUpdateProfile}>
 <div className="mb-4">
 <label className="block text-theme-text-primary font-medium mb-2">Name</label>
 <input
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="input"
 required
 />
 </div>

 <div className="mb-4">
 <label className="block text-theme-text-primary font-medium mb-2">
 Email
 </label>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="input"
 required
 />
 </div>

 <div className="mb-4">
 <label className="block text-theme-text-primary font-medium mb-2">Role</label>
 <input
 type="text"
 value={user?.role}
 disabled
 className="input bg-gray-50 text-gray-500 cursor-not-allowed opacity-80"
 />
 </div>

 <div className="mb-6">
 <label className="block text-theme-text-primary font-medium mb-2">
 Status
 </label>
 <span
 className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
 user?.status ==="APPROVED"
 ?"bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
 : user?.status ==="PENDING"
 ?"bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-500"
 :"bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
 }`}
 >
 {user?.status}
 </span>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full btn-primary py-3 transition disabled:opacity-50"
 >
 {loading ?"Updating..." :"Update Profile"}
 </button>
 </form>
 </div>

 {/* Change Password */}
 <div className="card mb-6">
 <h2 className="text-xl font-semibold mb-6 text-theme-text-primary border-b border-theme-border pb-4">
 Change Password
 </h2>

 <div className="space-y-4">
 <div className="mb-4">
 <label className="block text-theme-text-primary font-medium mb-2">
 Current Password
 </label>
 <input
 type="password"
 value={oldPassword}
 onChange={(e) => setOldPassword(e.target.value)}
 className="input"
 required
 />
 </div>

 <div className="mb-4">
 <label className="block text-theme-text-primary font-medium mb-2">
 New Password
 </label>
 <input
 type="password"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="input"
 required
 minLength={6}
 />
 <p className="text-xs text-theme-text-secondary mt-2">Minimum 6 characters</p>
 </div>

 <div className="mb-6">
 <label className="block text-theme-text-primary font-medium mb-2">
 Confirm New Password
 </label>
 <input
 type="password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="input"
 required
 minLength={6}
 />
 </div>

 <button
 type="button"
 onClick={handleChangePassword}
 disabled={loading}
 className="w-full btn-primary py-3 transition disabled:opacity-50"
 >
 {loading ?"Changing..." :"Change Password"}
 </button>
 </div>
 </div>

 {/* Notification Settings */}
 <div className="card mb-6">
 <h2 className="text-xl font-semibold mb-6 text-theme-text-primary border-b border-theme-border pb-4">
 Notification Settings
 </h2>

 <div className="space-y-4">
 <div className="mb-4">
 <label className="block text-theme-text-primary font-medium mb-2">
 User ID (External)
 </label>
 <input
 type="text"
 value={user?.email ||""}
 disabled
 className="input bg-gray-50 text-gray-500 cursor-not-allowed opacity-80"
 />
 <p className="text-xs text-theme-text-secondary mt-2">
 This is your unique identifier for notifications
 </p>
 </div>

 <div className="mb-4">
 <label className="block text-theme-text-primary font-medium mb-2">
 Browser Permission
 </label>
 <div className="flex items-center gap-3">
 <span
 className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
 permissionStatus ==="granted"
 ?"bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
 : permissionStatus ==="denied"
 ?"bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
 :"bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-500"
 }`}
 >
 {permissionStatus ==="granted"
 ?"✓ Granted"
 : permissionStatus ==="denied"
 ?"✗ Denied"
 :"⚠ Not Requested"}
 </span>
 </div>
 </div>

 {permissionStatus !=="granted" && (
 <button
 type="button"
 onClick={() => requestPermission()}
 disabled={permissionStatus ==="denied"}
 className={`w-full py-3 px-4 rounded-lg font-medium transition ${
 permissionStatus ==="denied"
 ?"bg-gray-400 dark:bg-gray-700 text-white cursor-not-allowed"
 :"bg-theme-primary-500 text-white hover:bg-theme-primary-500Dark"
 }`}
 >
 {permissionStatus ==="denied"
 ?"Permission Denied - Check Browser Settings"
 :"Enable Notifications"}
 </button>
 )}

 {permissionStatus ==="granted" && (
 <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
 <p className="text-green-800 dark:text-green-400 text-sm font-medium">
 ✓ Notifications are enabled. You'll receive updates about:
 </p>
 <ul className="list-disc list-inside text-green-700 dark:text-green-500 text-sm mt-3 ml-2 space-y-1">
 <li>Account status changes</li>
 <li>New user registrations (Super Admins)</li>
 <li>Warnings and app limit updates</li>
 </ul>
 </div>
 )}
 </div>
 </div>

 {/* Danger Zone */}
 {!isSuperAdmin && (
 <div className="card border-red-200 dark:border-red-900/30">
 <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-500 border-b border-theme-border dark:border-red-900/20 pb-4">
 Danger Zone
 </h2>
 <p className="text-theme-text-primary mb-6">
 Once you delete your account, there is no going back. All your apps
 and data will be permanently deleted.
 </p>

 {!showDeleteConfirm ? (
 <button
 onClick={() => setShowDeleteConfirm(true)}
 className="bg-red-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-red-700 transition"
 >
 Delete Account
 </button>
 ) : (
 <div className="border border-red-300 dark:border-red-800/40 rounded-lg p-5 bg-red-50 dark:bg-red-900/10">
 <p className="text-red-800 dark:text-red-400 font-semibold mb-4">
 Are you absolutely sure? This action cannot be undone.
 </p>
 <div className="flex gap-3">
 <button
 onClick={handleDeleteAccount}
 disabled={loading}
 className="bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
 >
 {loading ?"Deleting..." :"Yes, Delete My Account"}
 </button>
 <button
 onClick={() => setShowDeleteConfirm(false)}
 className="btn-secondary"
 >
 Cancel
 </button>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 );
};

export default Profile;
