import React, { useState } from "react";
import toast from "react-hot-toast";
import ApiRequest from "../../../services/ApiRequest";
import { RiLoader4Line } from "@remixicon/react";
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
  const { selectedApp } = useAppSelector((state) => state.apps);
  const appName = selectedApp?.name || "Vibe Message";

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
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

    try {
      setLoading(true);
      const response = await ApiRequest(`/apps/${appId}/push`, "post", payload);
      toast.success(response.data?.message || "Push notification sent successfully");
      // Reset form on success
      setTitle("");
      setBody("");
      setIcon("");
      setClickAction("");
      setUserIds("");
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
                />
              </div>
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
                  disabled={loading}
                  className="w-full btn-primary py-3 px-4 shadow-lg shadow-theme-primary-500/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RiLoader4Line size={20} className="animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send Notification"
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
