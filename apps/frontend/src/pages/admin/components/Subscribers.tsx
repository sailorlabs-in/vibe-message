import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ApiRequest from "../../../services/ApiRequest";
import { TableSkeleton } from "../../../components/common/SkeletonLoader";
import { RiGroupLine, RiRefreshLine } from "@remixicon/react";


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

  useEffect(() => {
    fetchSubscribers();
  }, [appId]);

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
        <button onClick={fetchSubscribers} className="text-sm font-medium text-theme-primary-500 hover:text-theme-primary-600 focus:outline-none flex items-center gap-1">
          <RiRefreshLine size={16} />
          Refresh
        </button>
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
    </div>
  );
};
