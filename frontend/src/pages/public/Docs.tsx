import React, { useState } from "react";

export const Docs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "quickstart" | "backend" | "react" | "nextjs"
  >("overview");

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Vibe Message <span className="text-primary-600">Docs</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          The modern, lightweight, and incredibly powerful push notification 
          platform for the web. Drop-in Firebase Cloud Messaging alternative.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-all duration-200 ${
            activeTab === "overview"
              ? "bg-primary-50 text-primary-700 border-b-2 border-primary-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          ✨ Platform Overview
        </button>
        <button
          onClick={() => setActiveTab("quickstart")}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-all duration-200 ${
            activeTab === "quickstart"
              ? "bg-primary-50 text-primary-700 border-b-2 border-primary-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          🔑 Quick Start
        </button>
        <button
          onClick={() => setActiveTab("backend")}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-all duration-200 ${
            activeTab === "backend"
              ? "bg-primary-50 text-primary-700 border-b-2 border-primary-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          ⚙️ Backend Integration
        </button>
        <button
          onClick={() => setActiveTab("react")}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-all duration-200 ${
            activeTab === "react"
              ? "bg-primary-50 text-primary-700 border-b-2 border-primary-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          ⚛️ React Frontend
        </button>
        <button
          onClick={() => setActiveTab("nextjs")}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-all duration-200 ${
            activeTab === "nextjs"
              ? "bg-primary-50 text-primary-700 border-b-2 border-primary-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          ▲ Next.js Frontend
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        {activeTab === "overview" && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              Why Vibe Message?
            </h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-4xl">
              Vibe Message is built for modern web applications that need reliable, 
              customizable, and fast push notifications without the heavy baggage of legacy SDKs.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <FeatureCard
                icon="⚡"
                title="Ultra Lightweight"
                description="Zero bloated dependencies. Our SDK is a fraction of the size of traditional platforms, ensuring your web app stays blazing fast."
              />
              <FeatureCard
                icon="🔐"
                title="VAPID Security"
                description="Built on web standards. Uses encrypted payload delivery ensuring your notifications are secure from server to screen."
              />
              <FeatureCard
                icon="🔄"
                title="Smart Delivery"
                description="Automatically detects if your users are using the app. Show in-app toasts when active, and OS-level push notifications when away."
              />
              <FeatureCard
                icon="👥"
                title="Multi-tenant Ready"
                description="Managing multiple apps? Vibe Message isolates credentials, users, and notifications giving you total platform control."
              />
              <FeatureCard
                icon="🎨"
                title="Highly Customizable"
                description="You own the UI. Use our CLI to generate your Service Worker, then customize exactly how your notifications look and feel."
              />
              <FeatureCard
                icon="📊"
                title="Silent Data Sync"
                description="Send invisible data payloads to your app to trigger background data refreshes, perfect for chat apps and live dashboards."
              />
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Ready to build?</h3>
                <p className="text-gray-300 mb-6 max-w-2xl text-lg">
                  Join the platform, grab your API keys, and start sending messages in under 5 minutes.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setActiveTab("quickstart")}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-semibold transition-colors shadow-lg"
                  >
                    View Setup Guide ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "quickstart" && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              To use Vibe Message, you need two pieces: a <strong>Frontend</strong> application (to receive messages) and a <strong>Backend</strong> service (to send messages securely).
            </p>
            <div className="space-y-8">
              <StepCard
                number={1}
                title="Create your Application"
                description={
                  <>
                    First, you must create an App in the Vibe Message dashboard. You will receive an{" "}
                    <code className="bg-gray-100 text-pink-600 px-2 py-1 rounded text-sm font-mono">appId</code>, a {" "}
                    <code className="bg-gray-100 text-pink-600 px-2 py-1 rounded text-sm font-mono">publicKey</code> (used on the frontend), and a highly sensitive {" "}
                    <code className="bg-gray-100 text-pink-600 px-2 py-1 rounded text-sm font-mono">secretKey</code> (used strictly on your backend).
                  </>
                }
              />
              <StepCard
                number={2}
                title="Integrate your Frontend (Client)"
                description={
                  <>
                    Your React or Next.js frontend uses the <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">publicKey</code> to authenticate with Vibe Message and registers the user's browser device to receive push notifications. Check out the <strong>React</strong> or <strong>Next.js</strong> tabs for specific client-side setup guides.
                  </>
                }
              />
              <StepCard
                number={3}
                title="Integrate your Backend (Server)"
                description={
                  <>
                    When an event occurs in your system (like a new chat message or alert), your backend uses the <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">secretKey</code> to securely request Vibe Message to deliver a push notification to that specific user. Check out the <strong>Backend Integration</strong> tab to learn how.
                  </>
                }
              />
            </div>
          </div>
        )}

        {activeTab === "backend" && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Backend Integration (Sending)
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Your backend server is responsible for triggering notifications. You should <strong>never</strong> expose your <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">secretKey</code> to your frontend code.
            </p>
            <div className="space-y-8">
              <StepCard
                number={1}
                title="Send a Notification via API"
                description="Make a standard authenticated HTTP POST request to our delivery API from your Node.js, Python, or Go server. Example using native JS Fetch:"
                code={"const response = await fetch('https://api.yourserver.com/api/push/send', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    appId: 'your-app-id',\n    secretKey: 'your-secret-key',\n    notification: {\n      title: 'New Content!',\n      body: 'Someone liked your post.',\n      icon: 'https://yoursite.com/icon.png',\n      click_action: 'https://yoursite.com/dashboard',\n    },\n    targets: {\n      externalUserIds: ['user-123'] // ID of the user you want to notify\n    }\n  })\n});\n\nconst result = await response.json();\nconsole.log(result);"}
              />
              <StepCard
                number={2}
                title="Send a Silent Data Payload"
                description="Need to trigger an invisible background refresh on the client? Send a silent payload without a title/body, and intercept it in the Service Worker."
                code={"const response = await fetch('https://api.yourserver.com/api/push/send', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    appId: 'your-app-id',\n    secretKey: 'your-secret-key',\n    notification: {\n      // No Title or Body means it's silent!\n      data: {\n        type: 'REFRESH_CHAT',\n        chatId: 'chat-456'\n      }\n    },\n    targets: {\n      externalUserIds: ['user-123']\n    }\n  })\n});"}
              />
            </div>
          </div>
        )}

        {activeTab === "react" && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              React Frontend (Receiving)
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              The recommended pattern for SPAs like Create React App or Vite to start receiving messages sent by your backend.
            </p>

            <div className="space-y-8">
              <StepCard
                number={1}
                title="Install SDK & Generate Worker"
                description="Install the package, and drop the Service Worker file into your public folder using the CLI."
                code={"npm install vibe-message\n\nnpx vibe-message init"}
              />

              <StepCard
                number={2}
                title="Create a Context Provider"
                description="Create a global React context to manage notification state and permissions."
                code={"import React, { createContext, useContext, useState, useRef } from 'react';\nimport { initNotificationClient } from 'vibe-message';\nimport toast from 'react-hot-toast';\n\nconst NotificationContext = createContext<any>(null);\n\nexport const NotificationProvider = ({ children }: any) => {\n  const [isRegistered, setIsRegistered] = useState(false);\n  const clientRef = useRef<any>(null);\n\n  const init = async (userId: string) => {\n    const client = initNotificationClient({\n      baseUrl: 'https://api.yoursite.com/api',\n      appId: 'your-app-id',\n      publicKey: 'your-public-key'\n    });\n    clientRef.current = client;\n\n    client.onMessage((payload: any) => {\n      // Show modern in-app toast for foreground users\n      toast.success(payload.title + \": \" + payload.body);\n    });\n\n    // Register the client using the logged-in user's DB ID\n    await client.registerDevice({ externalUserId: userId });\n    setIsRegistered(true);\n  };\n\n  return (\n    <NotificationContext.Provider value={{ isRegistered, init }}>\n      {children}\n    </NotificationContext.Provider>\n  );\n};"}
              />
              
              <StepCard
                number={3}
                title="Use Anywhere"
                description="Now you can request permissions and initialize the SDK from any component (e.g. after login)!"
                code={"function LoginButton() {\n  const { init } = useContext(NotificationContext);\n\n  const handleLogin = async () => {\n    // 1. Perform login via your backend\n    const user = await API.login();\n    \n    // 2. Request browser permission\n    await Notification.requestPermission();\n    \n    // 3. Connect the browser to Vibe Message\n    await init(user.id);\n  };\n\n  return <button onClick={handleLogin}>Log In</button>;\n}"}
              />
            </div>
          </div>
        )}

        {activeTab === "nextjs" && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Next.js Frontend (Receiving)
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Integration guide optimized for Next.js 13+ Server and Client components.
            </p>

            <div className="space-y-8">
              <StepCard
                number={1}
                title="Install SDK & Generate Worker"
                description="Install the package from npm, and generate the push-sw.js file into your Next.js public directory."
                code={"npm install vibe-message\n\nnpx vibe-message init"}
              />

              <StepCard
                number={2}
                title="Create a Client Component"
                description="Because the SDK uses browser APIs, ensure the wrapper component uses the 'use client' directive."
                code={"\"use client\";\nimport { useEffect, useRef } from 'react';\nimport { initNotificationClient } from 'vibe-message';\n\nexport default function PushNotifications() {\n  const isInitialized = useRef(false);\n\n  useEffect(() => {\n    if (isInitialized.current) return;\n    \n    const setup = async () => {\n      // Verify browser permission before registering\n      if (Notification.permission !== 'granted') return;\n\n      const client = initNotificationClient({\n        baseUrl: 'https://api.yoursite.com/api',\n        appId: 'your-app-id',\n        publicKey: 'your-public-key'\n      });\n\n      client.onMessage((payload) => alert(\"Received: \" + payload.title));\n\n      // Register with the logged-in user's ID\n      await client.registerDevice({ externalUserId: 'user-123' });\n      isInitialized.current = true;\n    };\n\n    setup();\n  }, []);\n\n  return null; // Empty wrapper\n}"}
              />

              <StepCard
                number={3}
                title="Mount inside Layout"
                description="Mount your client component somewhere global, like your root Layout or a specific Dashboard layout wrapper."
                code={"import PushNotifications from './components/PushNotifications';\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=\"en\">\n      <body>\n        <PushNotifications />\n        {children}\n      </body>\n    </html>\n  );\n}"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// UI Components
const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="p-6 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 bg-gray-50 hover:bg-white group cursor-default">
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
  </div>
);

const StepCard = ({ number, title, description, code }: { number: number; title: string; description: React.ReactNode; code?: string }) => (
  <div className="flex gap-6 relative">
    <div className="flex-shrink-0 z-10">
      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shadow-sm">
        {number}
      </div>
    </div>
    <div className="flex-grow pb-8 border-l-2 border-gray-100 pl-8 -ml-[44px]">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {code && (
        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-800 mt-4">
          <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
             <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
             </div>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-5 overflow-x-auto text-sm leading-relaxed font-mono whitespace-pre-wrap break-all">
            {code}
          </pre>
        </div>
      )}
    </div>
  </div>
);
