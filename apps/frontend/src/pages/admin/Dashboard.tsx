import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchApps } from "../../store/slices/appsSlice";
import { DashboardSkeleton } from "../../components/common/SkeletonLoader";
import { RiAddLine, RiGridLine, RiCheckboxCircleLine, RiArrowRightLine, RiArrowRightSLine, RiSmartphoneLine, RiBriefcase4Line } from "@remixicon/react";


export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { apps, loading } = useAppSelector((state) => state.apps);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchApps());
  }, [dispatch]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  if (loading && apps.length === 0) {
    return (
      <div className="min-h-[calc(100vh-120px)] transition-colors duration-300 px-4 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] relative overflow-hidden transition-colors duration-300 px-4 py-8">
      {/* Background is now handled globally in App.tsx */}

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-black tracking-tight text-theme-text-primary drop-shadow-sm">
              Dashboard
            </h1>
            <p className="text-theme-text-secondary mt-2 font-medium">
              Welcome back, here's an overview of your projects.
            </p>
          </div>
          <Link
            to="/apps?create=true"
            className="shrink-0 px-6 py-3 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-bold shadow-lg shadow-theme-primary-500/20 hover:shadow-theme-primary-500/40 transform hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-md flex items-center gap-2"
          >
            <RiAddLine size={20} />
            New App
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mb-10"
        >
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-theme-primary-500 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-theme-primary-500/10 text-theme-primary-500 flex items-center justify-center mb-6">
                <RiGridLine size={24} />
              </div>
              <h3 className="text-theme-text-secondary font-semibold mb-1">
                {user?.app_limit ? 'App Limit Progress' : 'Total Apps'}
              </h3>
              <div className="flex flex-col">
                <p className="text-4xl font-black text-theme-text-primary flex items-baseline gap-2">
                  {apps.length}
                  {user?.app_limit && (
                    <span className="text-lg font-medium text-theme-text-secondary">
                      / {user.app_limit} apps
                    </span>
                  )}
                </p>
                {user?.app_limit && (
                  <div className="mt-4">
                    <div className="h-2 w-full bg-theme-bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-theme-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (apps.length / user.app_limit) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-theme-text-muted mt-2 font-medium">
                      {user.app_limit - apps.length > 0 
                        ? `${user.app_limit - apps.length} app(s) remaining`
                        : 'App limit reached'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-theme-success opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-theme-success/10 text-theme-success flex items-center justify-center mb-6">
                <RiCheckboxCircleLine size={24} />
              </div>
              <h3 className="text-theme-text-secondary font-semibold mb-1">
                Active Apps
              </h3>
              <p className="text-4xl font-black text-theme-success">
                {apps.filter((app) => app.is_active).length}
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="backdrop-blur-2xl bg-theme-primary-500/5 dark:bg-theme-primary-500/10 border border-theme-primary-500/30 rounded-[2rem] shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 transform hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-center relative overflow-hidden group"
          >
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
                <RiArrowRightLine size={16} className="text-theme-primary-500 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Apps List */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden"
        >
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
                <RiArrowRightSLine size={16} />
              </Link>
            )}
          </div>

          <div className="p-4 sm:p-8">
            {apps.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-theme-bg-muted flex items-center justify-center">
                  <RiBriefcase4Line size={48} className="text-theme-text-muted" />
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
                    to={`/apps/${app.public_app_id}`}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-theme-bg-primary hover:bg-theme-bg-muted/50 dark:hover:bg-theme-bg-muted border border-theme-border rounded-2xl hover:border-theme-primary-500/50 hover:shadow-lg dark:hover:shadow-[0_4px_20px_0_rgba(0,0,0,0.2)] transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${app.is_active ? "bg-theme-success/10 text-theme-success" : "bg-theme-bg-muted text-theme-text-muted"}`}
                      >
                        <RiSmartphoneLine size={24} />
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
                        <RiArrowRightSLine size={20} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
