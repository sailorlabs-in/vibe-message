import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchApps } from "../../store/slices/appsSlice";

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { apps, loading } = useAppSelector((state) => state.apps);

  useEffect(() => {
    dispatch(fetchApps());
  }, [dispatch]);

  if (loading && apps.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-theme-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-10 w-10 text-theme-primary-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-theme-text-secondary font-medium animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-theme-bg-primary transition-colors duration-300 px-4 py-8">
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-theme-primary-500 to-transparent opacity-20 rounded-full animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-theme-accent-500 to-transparent opacity-20 rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-theme-primary-400 to-transparent opacity-10 rounded-full animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-theme-text-primary drop-shadow-sm">
              Dashboard
            </h1>
            <p className="text-theme-text-secondary mt-2 font-medium">
              Welcome back, here's an overview of your projects.
            </p>
          </div>
          <Link
            to="/apps/new"
            className="shrink-0 px-6 py-3 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-bold shadow-lg shadow-theme-primary-500/20 hover:shadow-theme-primary-500/40 transform hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-md flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New App
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-theme-primary-500 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-theme-primary-500/10 text-theme-primary-500 flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
              <h3 className="text-theme-text-secondary font-semibold mb-1">
                Total Apps
              </h3>
              <p className="text-4xl font-black text-theme-text-primary">
                {apps.length}
              </p>
            </div>
          </div>

          <div className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-theme-success opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-theme-success/10 text-theme-success flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-theme-text-secondary font-semibold mb-1">
                Active Apps
              </h3>
              <p className="text-4xl font-black text-theme-success">
                {apps.filter((app) => app.is_active).length}
              </p>
            </div>
          </div>

          <div className="backdrop-blur-2xl bg-theme-primary-500/5 dark:bg-theme-primary-500/10 border border-theme-primary-500/30 rounded-[2rem] shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 transform hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-theme-primary-500/0 via-theme-primary-500/5 to-theme-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <h3 className="text-theme-text-primary font-bold text-xl mb-3">
                Quick Actions
              </h3>
              <p className="text-theme-text-secondary text-sm mb-6">
                Need to update settings or check app metrics?
              </p>
              <Link
                to="/apps"
                className="w-full px-6 py-3 bg-theme-bg-secondary hover:bg-theme-primary-50 text-theme-text-primary dark:hover:bg-theme-bg-muted border border-theme-border rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2 group-hover:border-theme-primary-500/50"
              >
                Manage Apps
                <svg
                  className="w-4 h-4 text-theme-primary-500 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Apps List */}
        <div className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="p-8 border-b border-theme-border flex justify-between items-center bg-theme-bg-primary/50">
            <h2 className="text-2xl font-bold text-theme-text-primary">
              Recent Apps
            </h2>
            {apps.length > 5 && (
              <Link
                to="/apps"
                className="text-theme-primary-500 hover:text-theme-primary-600 font-semibold text-sm transition-colors flex items-center gap-1"
              >
                View All
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            )}
          </div>

          <div className="p-4 sm:p-8">
            {apps.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-theme-bg-muted flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-theme-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-theme-text-primary mb-2">
                  No apps built yet
                </h3>
                <p className="text-theme-text-secondary mb-8 max-w-md mx-auto">
                  Get started by creating your first application project. It
                  only takes a few seconds to configure.
                </p>
                <Link
                  to="/apps/new"
                  className="inline-flex px-8 py-3.5 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-bold shadow-lg shadow-theme-primary-500/20 transform hover:-translate-y-0.5 transition-all"
                >
                  Create First App
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {apps.slice(0, 5).map((app) => (
                  <Link
                    key={app.id}
                    to={`/apps/${app.id}`}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-theme-bg-primary hover:bg-theme-bg-muted/50 dark:hover:bg-theme-bg-muted border border-theme-border rounded-2xl hover:border-theme-primary-500/50 hover:shadow-lg dark:hover:shadow-[0_4px_20px_0_rgba(0,0,0,0.2)] transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${app.is_active ? "bg-theme-success/10 text-theme-success" : "bg-theme-bg-muted text-theme-text-muted"}`}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-theme-text-primary group-hover:text-theme-primary-500 transition-colors">
                            {app.name}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${app.is_active ? "bg-theme-success/10 text-theme-success border border-theme-success/20" : "bg-theme-bg-muted text-theme-text-muted border border-theme-border"}`}
                          >
                            {app.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-sm text-theme-text-secondary line-clamp-1">
                          {app.description || "No description provided"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:shrink-0 text-right border-t sm:border-t-0 border-theme-border pt-4 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-medium text-theme-text-muted uppercase tracking-wider mb-1">
                          Created
                        </p>
                        <p className="text-sm font-semibold text-theme-text-primary">
                          {new Date(app.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-theme-bg-muted group-hover:bg-theme-primary-500 flex items-center justify-center text-theme-text-secondary group-hover:text-white transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
