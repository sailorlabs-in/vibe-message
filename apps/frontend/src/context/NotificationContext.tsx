import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { initNotificationClient } from "vibe-message";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../store/store";
import { fetchApps } from "../store/slices/appsSlice";
import { api, API_BASE_URL } from "../services/api";
import { RiNotificationLine, RiCloseLine } from "@remixicon/react";


const NOTIFICATION_STORAGE_KEY = "admin-notification-registered";

interface NotificationContextType {
  permissionStatus: NotificationPermission;
  isRegistered: boolean;
  requestPermission: () => Promise<void>;
  initializeNotifications: () => Promise<void>;
  unregisterNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission>("default");
  const [isRegistered, setIsRegistered] = useState(false);
  const initializingRef = useRef(false);
  const initializedRef = useRef(false);
  const clientRef = useRef<any>(null);
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { apps } = useAppSelector((state) => state.apps);

  // Load registration state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (stored === "true") {
        setIsRegistered(true);
      }
    }
  }, []);

  // Update permission status on mount and when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if ("Notification" in window && Notification.permission) {
          setPermissionStatus(Notification.permission);
        } else {
          setPermissionStatus("denied");
        }
      } catch (e) {
        console.warn(
          "Notification.permission is not supported on this device/browser",
        );
        setPermissionStatus("denied"); // Default to denied if API throws
      }
    } else {
      setPermissionStatus("denied"); // Fallback for unsupported browsers (like some iOS webviews)
    }
  }, []);

  // Fetch apps when user logs in
  useEffect(() => {
    if (user && apps.length === 0) {
      dispatch(fetchApps());
    }
  }, [user, apps.length, dispatch]);

  const initializeNotifications = useCallback(async () => {
    if (!user || initializingRef.current) return;

    // Safety check for Apple devices/unsupported browsers
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      console.warn(
        "Push notifications are not supported on this device/browser. Aborting initialization.",
      );
      return;
    }

    initializingRef.current = true;
    console.log("🔄 Initializing notifications...");

    let appId = import.meta.env.VITE_ADMIN_APP_ID || "app_I4vqEF2J7T3AG4n3";
    let publicKey =
      import.meta.env.VITE_ADMIN_PUBLIC_KEY ||
      "sk_CxGjzk_My2wSWx6m_4gGMFRcd1SpBGZXzRZ-Pny8Annevi2vQxNJf5iKLbDHZP3T";

    // Always fetch system app credentials for admin panel notifications
    try {
      const response = await api.get("/apps/system/public");
      const data = response.data;
      if (data.success) {
        appId = data.data.public_app_id;
        publicKey = data.data.public_key;
      }
    } catch (error) {
      console.error("Failed to fetch system app credentials:", error);
      initializingRef.current = false;
      return;
    }

    if (appId && publicKey) {
      try {
        // --- COMMENTED OUT CURRENT CODE FOR TESTING ---
        /*
        const client = initNotificationClient({
          baseUrl: API_BASE_URL,
          appId: appId,
          publicKey: publicKey,
        });

        // Store client in ref for later use (unregister)
        clientRef.current = client;
        */

        // --- 📝 EXTERNAL SDK USAGE EXAMPLE ---
        // If you were integrating this SDK in a separate 3rd-party React frontend,
        // you would completely omit the `baseUrl`. The SDK defaults to production automatically:

        // import { initNotificationClient } from "vibe-message";
        const client = initNotificationClient({
          baseUrl: API_BASE_URL,
          appId: appId, // Real keys passed here for testing
          publicKey: publicKey,
        });
        clientRef.current = client;

        // ------------------------------------

        // Register callbacks
        client.onMessage((payload: any) => {
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? "animate-enter" : "animate-leave"
                } max-w-sm w-full bg-theme-bg-primary shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-xl pointer-events-auto flex border border-theme-border overflow-hidden transition-all duration-300 transform`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="h-10 w-10 rounded-full bg-theme-primary-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                        <RiNotificationLine size={24} className="text-theme-primary-500" />
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-semibold text-theme-text-primary mb-1">
                        {payload.title || "New Notification"}
                      </p>
                      {payload.body && (
                        <p className="text-sm text-theme-text-secondary leading-relaxed line-clamp-2">
                          {payload.body}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-theme-border bg-theme-bg-secondary/50">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toast.remove(t.id);
                    }}
                    className="w-full h-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-muted focus:outline-none transition-colors"
                  >
                    <RiCloseLine size={20} />
                  </button>
                </div>
              </div>
            ),
            {
              duration: 5000,
              position: "top-right",
            },
          );
        });

        client.onBackgroundMessage((payload: any) => {
          console.log("Background notification clicked:", payload);
        });

        client.onSilentMessage((data: any) => {
          console.log("Silent notification received:", data);
        });

        // Register device
        await client.registerDevice({
          externalUserId: user.email,
          serviceWorkerPath: "/push-sw.js",
        });

        setIsRegistered(true);
        if (typeof window !== "undefined" && "Notification" in window) {
          try {
            setPermissionStatus(Notification.permission);
          } catch (e) {}
        }

        // Save registration state to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(NOTIFICATION_STORAGE_KEY, "true");
        }

        console.log("✅ Notifications enabled for admin panel");
        toast.success("Notifications enabled!");
      } catch (error: any) {
        console.error("Failed to initialize notification client:", error);

        // Ensure we mark it as failed so we don't end up in infinite loop if registration fails
        setIsRegistered(true); // Setting this to true prevents the effect from constantly triggering it over and over

        if (typeof window !== "undefined") {
          try {
            if ("Notification" in window && Notification.permission) {
              setPermissionStatus(Notification.permission);
            }
          } catch (e) {}
        }
        if (error.message !== "Notification permission denied") {
          toast.error("Failed to enable notifications");
        }
      }
    }

    initializingRef.current = false;
  }, [user, apps.length]);

  const unregisterNotifications = useCallback(async () => {
    if (!clientRef.current || !user) return;

    try {
      console.log("🔄 Unregistering device...");
      await clientRef.current.unregisterDevice(user.email);

      setIsRegistered(false);
      clientRef.current = null;

      // Remove from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
      }

      console.log("✅ Device unregistered successfully");
    } catch (error: any) {
      console.error("Failed to unregister device:", error);
    }
  }, [user]);

  // Auto-initialize when permission is granted and user is logged in
  useEffect(() => {
    if (
      user &&
      permissionStatus === "granted" &&
      !initializedRef.current &&
      (apps.length > 0 || token)
    ) {
      initializedRef.current = true;
      initializeNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, permissionStatus, apps.length, token]);

  const requestPermission = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !("Notification" in window)) {
        toast.error("Push notifications are not supported on this device.");
        setPermissionStatus("denied");
        return;
      }

      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === "granted") {
        await initializeNotifications();
      } else {
        toast.error("Notification permission denied");
      }
    } catch (error) {
      console.error("Failed to request permission:", error);
      toast.error("Failed to request permission");
      setPermissionStatus("denied");
    }
  }, [initializeNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        permissionStatus,
        isRegistered,
        requestPermission,
        initializeNotifications,
        unregisterNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
