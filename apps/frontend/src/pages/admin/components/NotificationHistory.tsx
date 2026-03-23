import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ApiRequest from "../../../services/ApiRequest";

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
    return <div className="text-theme-text-secondary animate-pulse p-4">Loading history...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="card text-center py-10">
        <div className="w-16 h-16 mx-auto mb-4 bg-theme-bg-muted rounded-full flex items-center justify-center text-theme-text-muted">
           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </div>
        <h3 className="text-lg font-medium text-theme-text-primary">No notifications sent yet</h3>
        <p className="text-theme-text-secondary mt-1">Use the composer to send your first push notification.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <h2 className="text-xl font-semibold mb-6 text-theme-text-primary px-2">
        Notification History
      </h2>
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
    </div>
  );
};
