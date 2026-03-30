import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ApiRequest from "../../../services/ApiRequest";
import { TableSkeleton } from "../../../components/common/SkeletonLoader";
import { RiGroupLine, RiRefreshLine, RiAlertLine } from "@remixicon/react";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch } from "../../../store/store";
import { unregisterAllAppDevices } from "../../../store/slices/appsSlice";


interface Subscriber {
  id: number;
  external_user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscribersProps {
  appId: string;
}

export const Subscribers: React.FC<SubscribersProps> = ({ appId }) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const [unregistering, setUnregistering] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, [appId]);

  const handleUnregisterAll = async () => {
    setUnregistering(true);
    try {
      const resultAction = await dispatch(unregisterAllAppDevices(appId));
      if (unregisterAllAppDevices.fulfilled.match(resultAction)) {
        toast.success("Successfully unregistered all devices for this app.");
        fetchSubscribers();
      } else {
        toast.error("Failed to unregister devices.");
      }
    } finally {
      setUnregistering(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await ApiRequest(`/apps/${appId}/subscribers`, "get");
      setSubscribers(res.data || []);
    } catch (error) {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <TableSkeleton rows={4} cols={4} />;
  }

  if (subscribers.length === 0) {
    return (
      <div className="card text-center py-10">
        <div className="w-16 h-16 mx-auto mb-4 bg-theme-bg-muted rounded-full flex items-center justify-center text-theme-text-muted">
           <RiGroupLine size={32} />
        </div>
        <h3 className="text-lg font-medium text-theme-text-primary">No subscribers yet</h3>
        <p className="text-theme-text-secondary mt-1">Users will appear here once they register their devices via the SDK.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-xl font-semibold text-theme-text-primary">
          App Subscribers ({subscribers.length})
        </h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowConfirmModal(true)} 
            disabled={unregistering || subscribers.length === 0}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RiAlertLine size={16} />
            {unregistering ? "Unregistering..." : "Unregister All"}
          </button>
          <button onClick={fetchSubscribers} className="text-sm font-medium text-theme-primary-500 hover:text-theme-primary-600 focus:outline-none flex items-center gap-1">
            <RiRefreshLine size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-theme-border text-sm text-theme-text-secondary">
              <th className="p-4 font-medium">External User ID</th>
              <th className="p-4 font-medium text-center">Status</th>
              <th className="p-4 font-medium">Subscribed At</th>
              <th className="p-4 font-medium">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.id} className="border-b border-theme-border hover:bg-theme-bg-secondary/50 transition-colors">
                <td className="p-4 font-mono text-sm text-theme-text-primary">
                  {sub.external_user_id}
                </td>
                <td className="p-4 text-center">
                  {sub.is_active ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="p-4 text-sm text-theme-text-secondary">
                  {new Date(sub.created_at).toLocaleDateString()} {new Date(sub.created_at).toLocaleTimeString()}
                </td>
                <td className="p-4 text-sm text-theme-text-secondary">
                  {new Date(sub.updated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !unregistering && setShowConfirmModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-theme-bg-primary rounded-2xl shadow-2xl border border-theme-border overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 dark:text-red-400 mx-auto">
                  <RiAlertLine size={24} />
                </div>
                <h3 className="text-xl font-bold text-center text-theme-text-primary mb-2">
                  Unregister All Devices?
                </h3>
                <p className="text-center text-theme-text-secondary mb-6 text-sm">
                  Are you sure you want to unregister <strong className="text-theme-text-primary">ALL</strong> devices for this app? They will immediately stop receiving push notifications until the users re-register.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    disabled={unregistering}
                    className="flex-1 px-4 py-2.5 bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-bg-muted rounded-xl font-medium transition-colors border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      handleUnregisterAll();
                    }}
                    disabled={unregistering}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/30 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Yes, Unregister
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
