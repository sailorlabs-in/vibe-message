import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchApps } from '../../store/slices/appsSlice';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import {
  RiAddLine,
  RiGridLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiSmartphoneLine,
  RiBriefcase4Line,
  RiDashboardLine,
} from '@remixicon/react';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { apps, loading } = useAppSelector((state) => state.apps);
  const { user } = useAppSelector((state) => state.auth);
  const shouldReduceMotion = useReducedMotion();
  const easeOut = [0.23, 1, 0.32, 1] as const;

  useEffect(() => {
    dispatch(fetchApps());
  }, [dispatch]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: easeOut },
    },
  };

  if (loading && (apps?.length ?? 0) === 0) {
    return (
      <div className="min-h-[calc(100vh-120px)] transition-colors duration-300 px-4 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const safeApps = Array.isArray(apps) ? apps : [];
  const activeAppsCount = safeApps.filter((app) => app.is_active).length;
  const ownedAppsCount = safeApps.filter((app) => app.user_id === user?.id).length;

  return (
    <div className="min-h-[calc(100vh-120px)] relative overflow-hidden transition-colors duration-300 px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-theme-primary-500/10 text-theme-primary-600 dark:text-theme-primary-400 border border-theme-primary-500/20 flex items-center justify-center shadow-xs">
                <RiDashboardLine size={22} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-theme-text-primary">
                Dashboard
              </h1>
            </div>
            <p className="text-theme-text-secondary mt-1 text-base sm:text-lg font-normal">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}. Here's an overview of your
              projects.
            </p>
          </div>
          <Link
            to="/apps?create=true"
            className="group shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-theme-primary-600 hover:bg-theme-primary-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 active:scale-[0.98]"
          >
            <RiAddLine size={18} className="transition-transform group-hover:rotate-90 duration-200" />
            <span>New App</span>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mb-10"
        >
          {/* Card 1: App Limit */}
          <motion.div
            variants={itemVariants}
            className="bg-theme-bg-secondary border border-theme-border rounded-2xl shadow-xs hover:border-theme-border-strong hover:shadow-sm p-6 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-theme-primary-500/10 border border-theme-primary-500/20 text-theme-primary-600 dark:text-theme-primary-400 flex items-center justify-center mb-5 shadow-2xs">
                <RiGridLine size={22} />
              </div>
              <h3 className="text-theme-text-secondary text-sm font-semibold mb-2">
                {user?.app_limit ? 'App Limit Progress' : 'Total Built Apps'}
              </h3>
              <div className="flex flex-col">
                <p className="text-4xl sm:text-5xl font-display font-extrabold text-theme-text-primary flex items-baseline gap-2 tabular-nums tracking-tight">
                  {ownedAppsCount}
                  {user?.app_limit && (
                    <span className="text-lg font-medium text-theme-text-muted">
                      / {user.app_limit}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {user?.app_limit && (
              <div className="mt-6 pt-4 border-t border-theme-border/60">
                <div className="h-2 w-full bg-theme-bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-theme-primary-500 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, (ownedAppsCount / user.app_limit) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-theme-text-muted mt-2.5 font-medium">
                  {user.app_limit - ownedAppsCount > 0
                    ? `${user.app_limit - ownedAppsCount} app(s) remaining for deployment`
                    : 'App limit reached'}
                </p>
              </div>
            )}
          </motion.div>

          {/* Card 2: Active Apps */}
          <motion.div
            variants={itemVariants}
            className="bg-theme-bg-secondary border border-theme-border rounded-2xl shadow-xs hover:border-theme-border-strong hover:shadow-sm p-6 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 shadow-2xs">
                <RiCheckboxCircleLine size={22} />
              </div>
              <h3 className="text-theme-text-secondary text-sm font-semibold mb-2">Currently Active</h3>
              <p className="text-4xl sm:text-5xl font-display font-extrabold text-theme-text-primary tabular-nums tracking-tight">
                {activeAppsCount}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-theme-border/60">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Running Smoothly
              </div>
            </div>
          </motion.div>

          {/* Card 3: Quick Actions Dashboard */}
          <motion.div
            variants={itemVariants}
            className="bg-theme-bg-secondary border border-theme-border rounded-2xl shadow-xs hover:border-theme-border-strong hover:shadow-sm p-6 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-theme-bg-primary border border-theme-border text-theme-primary-600 dark:text-theme-primary-400 flex items-center justify-center mb-5 shadow-2xs">
                <RiSmartphoneLine size={22} />
              </div>
              <h3 className="text-theme-text-primary font-display font-bold text-xl mb-2">Quick Pipeline</h3>
              <p className="text-theme-text-secondary text-sm leading-relaxed mb-6">
                Check metrics, edit app settings, or configure push notification workflows quickly.
              </p>
            </div>

            <div>
              <Link
                to="/apps"
                className="w-full px-5 py-3 bg-theme-bg-primary hover:bg-theme-bg-muted border border-theme-border rounded-xl font-semibold text-sm text-theme-text-primary transition-all duration-200 shadow-2xs flex items-center justify-between group/btn"
              >
                <span>Manage Portfolio</span>
                <span className="w-8 h-8 rounded-lg bg-theme-primary-500/10 text-theme-primary-600 dark:text-theme-primary-400 flex items-center justify-center group-hover/btn:bg-theme-primary-500 group-hover/btn:text-white transition-colors duration-200">
                  <RiArrowRightLine
                    size={16}
                    className="transform group-hover/btn:translate-x-0.5 transition-transform"
                  />
                </span>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Apps List */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: easeOut }}
          className="bg-theme-bg-secondary border border-theme-border rounded-2xl shadow-xs overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-theme-border flex justify-between items-center bg-theme-bg-secondary">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-theme-primary-500/10 text-theme-primary-600 dark:text-theme-primary-400 border border-theme-primary-500/20 flex items-center justify-center">
                <RiSmartphoneLine size={16} />
              </div>
              <h2 className="text-xl font-display font-bold text-theme-text-primary">Recent Projects</h2>
            </div>
            {(apps?.length ?? 0) > 5 && (
              <Link
                to="/apps"
                className="hidden sm:flex text-theme-primary-600 dark:text-theme-primary-400 hover:text-theme-primary-700 font-semibold text-xs tracking-wide transition-colors items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-theme-primary-500/10"
              >
                View All Directory
                <RiArrowRightSLine size={16} />
              </Link>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {(apps?.length ?? 0) === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-theme-bg-primary border border-theme-border flex items-center justify-center shadow-xs">
                  <RiBriefcase4Line size={32} className="text-theme-primary-500" />
                </div>
                <h3 className="text-xl font-display font-bold text-theme-text-primary mb-2">
                  No Notification Hubs Found
                </h3>
                <p className="text-theme-text-secondary max-w-sm mx-auto mb-6 text-sm leading-relaxed">
                  Start your realtime notification journey by initializing your first app integration.
                </p>
                <Link
                  to="/apps?create=true"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-theme-primary-600 hover:bg-theme-primary-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 active:scale-[0.98]"
                >
                  <RiAddLine size={18} />
                  <span>Create First App</span>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {apps.slice(0, 5).map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05, ease: easeOut }}
                  >
                    <Link
                      to={`/apps/${app.public_app_id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-theme-bg-primary hover:bg-theme-bg-muted/50 border border-theme-border rounded-xl hover:border-theme-border-strong hover:shadow-xs transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 duration-200 ${
                            app.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-theme-bg-muted text-theme-text-muted border border-theme-border'
                          }`}
                        >
                          <RiSmartphoneLine size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1">
                            <h3 className="text-base font-display font-bold text-theme-text-primary group-hover:text-theme-primary-600 dark:group-hover:text-theme-primary-400 transition-colors truncate">
                              {app.name}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                                app.is_active
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-theme-bg-muted text-theme-text-muted border border-theme-border'
                              }`}
                            >
                              {app.is_active ? 'Live' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-theme-text-secondary line-clamp-1 font-normal">
                            {app.description || 'No description provided'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 shrink-0">
                        <div className="text-left sm:text-right hidden md:block">
                          <p className="text-[11px] font-semibold text-theme-text-muted uppercase tracking-wider mb-1">
                            Created On
                          </p>
                          <p className="text-xs font-semibold text-theme-text-primary font-mono">
                            {new Date(app.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-theme-bg-secondary border border-theme-border group-hover:border-theme-primary-500/30 group-hover:bg-theme-primary-500 group-hover:text-white flex items-center justify-center text-theme-text-muted transition-all duration-200 shadow-2xs">
                          <RiArrowRightLine size={18} className="transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {(apps?.length ?? 0) > 5 && (
              <div className="mt-4 text-center sm:hidden">
                <Link
                  to="/apps"
                  className="inline-flex items-center gap-1.5 text-theme-primary-600 font-semibold text-xs px-4 py-2 rounded-lg bg-theme-primary-500/10"
                >
                  View All Directory
                  <RiArrowRightLine size={16} />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
