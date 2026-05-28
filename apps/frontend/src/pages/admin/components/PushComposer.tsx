import React, { useState } from "react";
import toast from "react-hot-toast";
import ApiRequest from "../../../services/ApiRequest";
import { RiLoader4Line, RiAlertLine } from "@remixicon/react";
import { useAppSelector } from "../../../store/store";
import { PushPreview } from "./PushPreview";

interface PushComposerProps {
  appId: string;
}

export const PushComposer: React.FC<PushComposerProps> = ({ appId }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [icon, setIcon] = useState("");
  const [clickAction, setClickAction] = useState("");
  const [targetType, setTargetType] = useState<"all" | "specific">("all");
  const [userIds, setUserIds] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [timezoneMode, setTimezoneMode] = useState<"local" | "utc">("local");
  const { selectedApp } = useAppSelector((state) => state.apps);
  const appName = selectedApp?.name || "Vibe Message";

  const isViewer = selectedApp?.currentUserRole === "viewer";

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload: any = {
      notification: {
        title: title.trim(),
        body: body.trim() || undefined,
        icon: icon.trim() || undefined,
        click_action: clickAction.trim() || undefined,
      },
    };

    if (targetType === "specific") {
      const ids = userIds
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
      
      if (ids.length === 0) {
        toast.error("Please enter at least one user ID");
        return;
      }
      payload.targets = { externalUserIds: ids };
    }

    if (deliveryMode === "scheduled") {
      if (!scheduledDate) {
        toast.error("Scheduled date is required");
        return;
      }
      if (!scheduledTime) {
        toast.error("Scheduled time is required");
        return;
      }
      const [year, month, day] = scheduledDate.split("-").map(Number);
      const [hours, minutes] = scheduledTime.split(":").map(Number);
      
      let targetDate: Date;
      if (timezoneMode === "local") {
        targetDate = new Date(year, month - 1, day, hours, minutes, 0);
      } else {
        targetDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
      }

      const now = new Date();
      if (targetDate.getTime() < now.getTime()) {
        toast.error("Scheduled date and time must be in the future");
        return;
      }

      payload.scheduledAt = targetDate.toISOString();
    }

    try {
      setLoading(true);
      const response = await ApiRequest(`/apps/${appId}/push`, "post", payload);
      
      if (deliveryMode === "scheduled") {
        const [year, month, day] = scheduledDate.split("-").map(Number);
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const targetDate = timezoneMode === "local"
          ? new Date(year, month - 1, day, hours, minutes, 0)
          : new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
        toast.success(`Message scheduled successfully at ${targetDate.toLocaleString()}`);
      } else {
        toast.success(response.data?.message || "Push notification configured successfully");
      }

      // Reset form on success
      setTitle("");
      setBody("");
      setIcon("");
      setClickAction("");
      setUserIds("");
      setDeliveryMode("immediate");
      setScheduledDate(new Date().toLocaleDateString('en-CA'));
      setScheduledTime("09:00");
      setTimezoneMode("local");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send push notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 text-theme-text-primary">
        Send Push Notification
      </h2>

      {isViewer && (
        <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 p-4 rounded-lg text-sm border border-amber-200 dark:border-amber-900/30 mb-6 flex items-center gap-2">
          <RiAlertLine size={20} className="shrink-0" />
          <div>
            <span className="font-semibold">Viewer Access:</span> You have read-only access to this app. Composing or sending push notifications is disabled.
          </div>
        </div>
      )}

      <form onSubmit={handleSendPush} className="space-y-6">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-theme-text-secondary uppercase tracking-wider mb-2">
                Content
              </h3>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="New message received"
                  className="input w-full"
                  required
                  disabled={isViewer || loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                  Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="User John sent you a photo."
                  className="w-full border border-theme-border rounded-lg p-3 bg-theme-bg-secondary text-theme-text-primary focus:ring-2 focus:ring-theme-primary-500 focus:border-transparent transition-colors"
                  rows={3}
                  disabled={isViewer || loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                  Icon URL (Optional)
                </label>
                <input
                  type="url"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="https://example.com/icon.png"
                  className="input w-full"
                  disabled={isViewer || loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                  On Click Action URL (Optional)
                </label>
                <input
                  type="url"
                  value={clickAction}
                  onChange={(e) => setClickAction(e.target.value)}
                  placeholder="https://example.com/open"
                  className="input w-full"
                  disabled={isViewer || loading}
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-theme-border pt-6">
              <h3 className="text-sm font-semibold text-theme-text-secondary uppercase tracking-wider mb-2">
                Delivery Time
              </h3>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryMode"
                    value="immediate"
                    checked={deliveryMode === "immediate"}
                    onChange={() => setDeliveryMode("immediate")}
                    className="text-theme-primary-500 focus:ring-theme-primary-500"
                    disabled={isViewer || loading}
                  />
                  <span className="text-sm text-theme-text-primary">Send Immediately</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryMode"
                    value="scheduled"
                    checked={deliveryMode === "scheduled"}
                    onChange={() => setDeliveryMode("scheduled")}
                    className="text-theme-primary-500 focus:ring-theme-primary-500"
                    disabled={isViewer || loading}
                  />
                  <span className="text-sm text-theme-text-primary">Absolute UTC Time</span>
                </label>
              </div>

              {deliveryMode === "scheduled" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                      Timezone Mode
                    </label>
                    <div className="inline-flex rounded-lg p-0.5 bg-theme-bg-secondary border border-theme-border">
                      <button
                        type="button"
                        onClick={() => setTimezoneMode("local")}
                        disabled={isViewer || loading}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          timezoneMode === "local"
                            ? "bg-theme-primary-500 text-white shadow-sm"
                            : "text-theme-text-secondary hover:text-theme-text-primary"
                        }`}
                      >
                        Local Time
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimezoneMode("utc")}
                        disabled={isViewer || loading}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          timezoneMode === "utc"
                            ? "bg-theme-primary-500 text-white shadow-sm"
                            : "text-theme-text-secondary hover:text-theme-text-primary"
                        }`}
                      >
                        UTC Time
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="input w-full"
                        required
                        disabled={isViewer || loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="input w-full"
                        required
                        disabled={isViewer || loading}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-theme-text-secondary">
                    {timezoneMode === "local"
                      ? "Message will be sent using your local timezone (translated to UTC for delivery)."
                      : "Message will be sent using absolute UTC timezone."}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4 border-t border-theme-border pt-6">
              <h3 className="text-sm font-semibold text-theme-text-secondary uppercase tracking-wider mb-2">
                Audience
              </h3>
              <div>
                <label className="block text-sm font-medium mb-3 text-theme-text-primary">
                  Target Users
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="targetMode"
                      value="all"
                      checked={targetType === "all"}
                      onChange={() => setTargetType("all")}
                      className="text-theme-primary-500 focus:ring-theme-primary-500"
                      disabled={isViewer || loading}
                    />
                    <span className="text-sm text-theme-text-primary">All Subscribers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="targetMode"
                      value="specific"
                      checked={targetType === "specific"}
                      onChange={() => setTargetType("specific")}
                      className="text-theme-primary-500 focus:ring-theme-primary-500"
                      disabled={isViewer || loading}
                    />
                    <span className="text-sm text-theme-text-primary">Specific Users</span>
                  </label>
                </div>

                {targetType === "specific" && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                      External User IDs (comma separated)
                    </label>
                    <textarea
                      value={userIds}
                      onChange={(e) => setUserIds(e.target.value)}
                      placeholder="user-123, user-456"
                      className="w-full border border-theme-border rounded-lg p-3 bg-theme-bg-secondary text-theme-text-primary focus:ring-2 focus:ring-theme-primary-500 focus:border-transparent transition-colors"
                      rows={2}
                      disabled={isViewer || loading}
                    />
                    <p className="text-xs text-theme-text-secondary mt-2">
                      These are the IDs you passed to registerDevice in your client SDK.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-theme-border">
                <button
                  type="submit"
                  disabled={loading || isViewer}
                  className="w-full btn-primary py-3 px-4 shadow-lg shadow-theme-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RiLoader4Line size={20} className="animate-spin" />
                      {deliveryMode === "scheduled" ? "Scheduling..." : "Sending..."}
                    </span>
                  ) : (
                    deliveryMode === "scheduled" ? "Schedule Notification" : "Send Notification"
                  )}
                </button>
              </div>
            </div>
          </div>
            
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="sticky top-6">
              <PushPreview
                title={title}
                body={body}
                icon={icon}
                appName={appName}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
