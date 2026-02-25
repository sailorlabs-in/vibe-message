import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { initNotificationClient } from "vibe-message";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../store/store";
import { fetchApps } from "../store/slices/appsSlice";
import { api, API_BASE_URL } from "../services/api";

const NOTIFICATION_STORAGE_KEY = "admin-notification-registered";

interface NotificationContextType {
  permissionStatus: NotificationPermission;
  isRegistered: boolean;
  requestPermission: () => Promise<void>;
  initializeNotifications: () => Promise<void>;
  unregisterNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission>("default");
  const [isRegistered, setIsRegistered] = useState(false);
  const initializingRef = useRef(false);
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
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Fetch apps when user logs in
  useEffect(() => {
    if (user && apps.length === 0) {
      dispatch(fetchApps());
    }
  }, [user, apps.length, dispatch]);

  // Listen for service worker messages when in foreground
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const handleServiceWorkerMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === "FOREGROUND_MESSAGE") {
          const payload = event.data.payload;
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? "animate-enter" : "animate-leave"
                } max-w-sm w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden transition-all duration-300 transform`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {payload.title || "New Notification"}
                      </p>
                      {payload.body && (
                         <p className="text-sm text-gray-600 leading-relaxed">
                          {payload.body}
                        </p>
                       )}
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 transition-colors"
                  >
                     <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ),
            {
              duration: 5000,
              position: "top-right",
            }
          );
        }
      };

      navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

      return () => {
        navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      };
    }
  }, []);

  const initializeNotifications = async () => {
    if (!user || initializingRef.current) return;

    initializingRef.current = true;
    console.log("🔄 Initializing notifications...");

    let appId = import.meta.env.VITE_ADMIN_APP_ID || "app_I4vqEF2J7T3AG4n3";
    let publicKey = import.meta.env.VITE_ADMIN_PUBLIC_KEY || "sk_CxGjzk_My2wSWx6m_4gGMFRcd1SpBGZXzRZ-Pny8Annevi2vQxNJf5iKLbDHZP3T";

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
        const client = initNotificationClient({
          baseUrl: API_BASE_URL,
          appId: appId,
          publicKey: publicKey,
        });

        // Store client in ref for later use (unregister)
        clientRef.current = client;

        // Register callbacks
        client.onMessage((payload: any) => {
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? "animate-enter" : "animate-leave"
                } max-w-sm w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden transition-all duration-300 transform`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {payload.title || "New Notification"}
                      </p>
                      {payload.body && (
                         <p className="text-sm text-gray-600 leading-relaxed">
                          {payload.body}
                        </p>
                       )}
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 transition-colors"
                  >
                     <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ),
            {
              duration: 5000,
              position: "top-right",
            }
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
        setPermissionStatus(Notification.permission);

        // Save registration state to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(NOTIFICATION_STORAGE_KEY, "true");
        }

        console.log("✅ Notifications enabled for admin panel");
        toast.success("Notifications enabled!");
      } catch (error: any) {
        console.error("Failed to initialize notification client:", error);
        setPermissionStatus(Notification.permission);
        if (error.message !== "Notification permission denied") {
          toast.error("Failed to enable notifications");
        }
      }
    }

    initializingRef.current = false;
  };

  const unregisterNotifications = async () => {
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
  };

  // Auto-initialize when permission is granted and user is logged in
  useEffect(() => {
    if (
      user &&
      permissionStatus === "granted" &&
      !isRegistered &&
      (apps.length > 0 || token)
    ) {
      initializeNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, permissionStatus, apps.length, token, isRegistered]);

  const requestPermission = async () => {
    try {
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
    }
  };

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
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
