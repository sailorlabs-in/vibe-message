import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ApiRequest from "../../../services/ApiRequest";
import { TableSkeleton } from "../../../components/common/SkeletonLoader";
import { RiNotificationLine, RiDeleteBinLine } from "@remixicon/react";
import { useAppDispatch } from "../../../store/store";
import { clearAppNotifications } from "../../../store/slices/appsSlice";
import { ConfirmModal } from "../../../components/common/ConfirmModal";


interface Notification {
  id: number;
  payload_json: string;
  is_silent: boolean;
  created_at: string;
}

interface NotificationLog {
  id: number;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error_message: string | null;
  sent_at: string;
}

interface NotificationHistoryProps {
  appId: string;
}

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({ appId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [clearing, setClearing] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [appId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await ApiRequest(`/apps/${appId}/notifications`, "get");
      setNotifications(res.data || []);
    } catch (error) {
      toast.error("Failed to load notifications history");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      const resultAction = await dispatch(clearAppNotifications(appId));
      if (clearAppNotifications.fulfilled.match(resultAction)) {
        toast.success("Successfully cleared notification history for this app.");
        fetchNotifications();
      } else {
        toast.error("Failed to clear notification history.");
      }
    } finally {
      setClearing(false);
    }
  };

  const fetchLogs = async (notificationId: number) => {
    if (selectedNotificationId === notificationId) {
      setSelectedNotificationId(null);
      return;
    }
    try {
      setLogsLoading(true);
      setSelectedNotificationId(notificationId);
      const res = await ApiRequest(`/apps/${appId}/notifications/${notificationId}/logs`, "get");
      setLogs(res.data || []);
    } catch (error) {
      toast.error("Failed to load logs");
      setSelectedNotificationId(null);
    } finally {
      setLogsLoading(false);
    }
  };

  if (loading) {
    return <TableSkeleton rows={4} cols={4} />;
  }

  if (notifications.length === 0) {
    return (
      <div className="card text-center py-10">
        <div className="w-16 h-16 mx-auto mb-4 bg-theme-bg-muted rounded-full flex items-center justify-center text-theme-text-muted">
           <RiNotificationLine size={32} />
        </div>
        <h3 className="text-lg font-medium text-theme-text-primary">No notifications sent yet</h3>
        <p className="text-theme-text-secondary mt-1">Use the composer to send your first push notification.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-xl font-semibold text-theme-text-primary">
          Notification History
        </h2>
        
        {notifications.length > 0 && (
          <button 
            onClick={() => setShowClearConfirmModal(true)} 
            disabled={clearing || notifications.length === 0}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RiDeleteBinLine size={16} />
            {clearing ? "Clearing..." : "Clear History"}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-theme-border text-sm text-theme-text-secondary">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Payload Preview</th>
              <th className="p-4 font-medium text-center">Type</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notif) => {
              let payloadObj: any = {};
              try { payloadObj = JSON.parse(notif.payload_json); } catch (e) {}
              
              const isSelected = selectedNotificationId === notif.id;

              return (
                <React.Fragment key={notif.id}>
                  <tr className="border-b border-theme-border hover:bg-theme-bg-secondary/50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="text-sm font-medium text-theme-text-primary whitespace-nowrap">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-theme-text-secondary whitespace-nowrap">
                        {new Date(notif.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4 align-top max-w-sm">
                      <div className="font-semibold text-theme-text-primary truncate">
                        {payloadObj.title || 'Untitled'}
                      </div>
                      <div className="text-sm text-theme-text-secondary truncate mt-1">
                        {payloadObj.body || '{ No body }'}
                      </div>
                    </td>
                    <td className="p-4 align-top text-center">
                      {notif.is_silent ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          Silent
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          Visible
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-top text-right">
                      <button
                        onClick={() => fetchLogs(notif.id)}
                        className="text-theme-primary-500 hover:text-theme-primary-600 text-sm font-medium focus:outline-none"
                      >
                        {isSelected ? "Hide Details" : "View Details"}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expandable Logs View */}
                  {isSelected && (
                    <tr>
                      <td colSpan={4} className="bg-theme-bg-secondary/30 p-0">
                        <div className="p-6 border-b border-theme-border">
                          <h4 className="text-sm font-semibold text-theme-text-primary mb-3">Delivery Breakdown</h4>
                          {logsLoading ? (
                             <div className="text-sm text-theme-text-secondary animate-pulse">Loading delivery logs...</div>
                          ) : logs.length === 0 ? (
                             <div className="text-sm text-theme-text-secondary">No delivery logs found.</div>
                          ) : (
                            <div>
                               <div className="flex gap-4 mb-4 text-sm">
                                  <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
                                    <span className="font-bold">{logs.filter(l => l.status === 'SENT').length}</span> Delivered
                                  </div>
                                  <div className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                                    <span className="font-bold">{logs.filter(l => l.status === 'FAILED').length}</span> Failed
                                  </div>
                               </div>
                               <div className="max-h-64 overflow-y-auto mt-2 border border-theme-border rounded-lg bg-theme-bg-primary">
                                 <table className="w-full text-sm">
                                    <thead className="bg-theme-bg-muted sticky top-0">
                                      <tr>
                                        <th className="px-4 py-2 font-medium text-left">Status</th>
                                        <th className="px-4 py-2 font-medium text-left">Information</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme-border">
                                        {logs.map(log => (
                                          <tr key={log.id}>
                                            <td className="px-4 py-2">
                                               {log.status === 'SENT' && <span className="text-green-600 dark:text-green-400 font-medium">● Sent</span>}
                                               {log.status === 'FAILED' && <span className="text-red-600 dark:text-red-400 font-medium">● Failed</span>}
                                               {log.status === 'PENDING' && <span className="text-yellow-600 dark:text-yellow-400 font-medium">● Pending</span>}
                                            </td>
                                            <td className="px-4 py-2 text-theme-text-secondary font-mono text-xs">
                                              {log.error_message || 'Success'}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                 </table>
                               </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={showClearConfirmModal}
        onClose={() => setShowClearConfirmModal(false)}
        onConfirm={() => {
          setShowClearConfirmModal(false);
          handleClearHistory();
        }}
        loading={clearing}
        title="Clear Notification History?"
        description="Are you sure you want to completely erase the notification history for this app? This action cannot be undone and you will lose all past delivery records and error logs."
        confirmLabel="Yes, Clear History"
        confirmingLabel="Clearing..."
      />
    </div>
  );
};
