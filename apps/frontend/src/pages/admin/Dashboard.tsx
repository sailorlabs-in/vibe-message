import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
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
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
  };

  if (loading && apps.length === 0) {
    return (
      <div className="min-h-[calc(100vh-120px)] transition-colors duration-300 px-4 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const activeAppsCount = apps.filter((app) => app.is_active).length;
  const ownedAppsCount = apps.filter((app) => app.user_id === user?.id).length;

  return (
    <div className="min-h-[calc(100vh-120px)] relative overflow-hidden transition-colors duration-300 px-4 py-8">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-theme-primary-500 flex items-center justify-center shadow-inner">
                <RiDashboardLine size={24} />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-theme-text-primary to-theme-primary-500">
                Dashboard
              </h1>
            </div>
            <p className="text-theme-text-secondary mt-2 text-lg font-medium">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}. Here's an overview of your
              projects.
            </p>
          </div>
          <Link
            to="/apps?create=true"
            className="group shrink-0 px-8 py-3.5 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transform hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-md flex items-center gap-2 overflow-hidden relative"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <RiAddLine size={22} className="relative z-10" />
            <span className="relative z-10">New App</span>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {/* Card 1: App Limit */}
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-3xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] shadow-xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-8 transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl rounded-[3rem]" />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl group-hover:scale-150 group-hover:bg-violet-500/20 transition-all duration-500"></div>

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 text-theme-primary-500 flex items-center justify-center mb-6 shadow-sm">
                <RiGridLine size={26} />
              </div>
              <h3 className="text-theme-text-secondary font-semibold mb-2">
                {user?.app_limit ? 'App Limit Progress' : 'Total Built Apps'}
              </h3>
              <div className="flex flex-col">
                <p className="text-5xl font-black text-theme-text-primary flex items-baseline gap-2 tabular-nums tracking-tighter">
                  {ownedAppsCount}
                  {user?.app_limit && (
                    <span className="text-xl font-medium text-theme-text-secondary">
                      / {user.app_limit}
                    </span>
                  )}
                </p>
                {user?.app_limit && (
                  <div className="mt-5">
                    <div className="h-2.5 w-full bg-theme-bg-muted rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-theme-primary-400 to-theme-primary-600 rounded-full transition-all duration-1000 ease-out relative"
                        style={{
                          width: `${Math.min(100, (ownedAppsCount / user.app_limit) * 100)}%`,
                        }}
                      >
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]" />
                      </div>
                    </div>
                    <p className="text-sm text-theme-text-muted mt-3 font-medium">
                      {user.app_limit - ownedAppsCount > 0
                        ? `${user.app_limit - ownedAppsCount} app(s) remaining for deployment`
                        : 'App limit reached'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Card 2: Active Apps */}
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-3xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] shadow-xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-8 transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-green-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl rounded-[3rem]" />
            <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-green-300/10 rounded-full blur-3xl group-hover:scale-150 group-hover:bg-green-300/20 transition-all duration-500"></div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-300/10 to-transparent border border-green-300/20 text-theme-success flex items-center justify-center mb-6 shadow-sm">
                <RiCheckboxCircleLine size={26} />
              </div>
              <h3 className="text-theme-text-secondary font-semibold mb-2">Currently Active</h3>
              <p className="text-5xl font-black text-theme-text-primary tabular-nums tracking-tighter">
                {activeAppsCount}
              </p>

              <div className="mt-auto pt-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-300/10 border border-theme-success/20 rounded-full text-sm font-bold text-theme-success">
                  <span className="w-2 h-2 rounded-full bg-theme-success animate-ping absolute opacity-75"></span>
                  <span className="w-2 h-2 rounded-full bg-theme-success relative"></span>
                  Running Smoothly
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Quick Actions Dashboard */}
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-3xl bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/30 rounded-[2.5rem] shadow-xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-8 transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10">
              <h3 className="text-theme-text-primary font-black text-2xl mb-3">Quick Pipeline</h3>
              <p className="text-theme-text-secondary text-sm md:text-base mb-8 leading-relaxed">
                Check metrics, edit app settings, or configure push notification workflows quickly.
              </p>
              <Link
                to="/apps"
                className="w-full px-6 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 rounded-2xl font-bold text-theme-text-primary transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-between group/btn relative overflow-hidden"
              >
                <span className="relative z-10 text-base">Manage Portfolio</span>
                <span className="relative z-10 w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-theme-primary-500 group-hover/btn:bg-theme-primary-500 group-hover/btn:text-white transition-colors duration-300">
                  <RiArrowRightLine
                    size={20}
                    className="transform group-hover/btn:translate-x-1 transition-transform"
                  />
                </span>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Apps List */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="backdrop-blur-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] shadow-2xl dark:shadow-[0_10px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-theme-primary-500 flex items-center justify-center">
                <RiSmartphoneLine size={18} />
              </div>
              <h2 className="text-2xl font-bold text-theme-text-primary">Recent Projects</h2>
            </div>
            {apps.length > 5 && (
              <Link
                to="/apps"
                className="hidden sm:flex text-theme-primary-500 hover:text-theme-primary-600 font-bold text-sm transition-colors items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-violet-500/10"
              >
                View All Directory
                <RiArrowRightSLine size={18} />
              </Link>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {apps.length === 0 ? (
              <div className="text-center py-20 px-4 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-violet-500/5 pointer-events-none"></div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-theme-bg-muted to-violet-500/10 flex items-center justify-center p-1 shadow-inner relative"
                >
                  <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 border-dashed animate-[spin_10s_linear_infinite]"></div>
                  <div className="w-full h-full rounded-full bg-theme-bg-primary flex items-center justify-center shadow-lg relative z-10">
                    <RiBriefcase4Line size={48} className="text-theme-primary-500" />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-black text-theme-text-primary mb-3">
                  Your Workspace is Empty
                </h3>
                <p className="text-theme-text-secondary text-lg mb-10 max-w-md mx-auto leading-relaxed">
                  Start your journey by creating your first application. Connect your users in
                  moments.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/apps/new"
                    className="inline-flex px-10 py-4 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-theme-primary-500/25 transition-all text-lg items-center gap-3"
                  >
                    <RiAddLine size={24} />
                    Deploy First App
                  </Link>
                </motion.div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {apps.slice(0, 5).map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Link
                      to={`/apps/${app.public_app_id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border items-start sm:items-center border-slate-200 dark:border-slate-700/50 rounded-2xl hover:border-violet-500/50 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all cursor-pointer relative overflow-hidden"
                    >
                      {/* Hover Indicator Line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-theme-primary-400 to-theme-primary-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl"></div>

                      <div className="flex items-center gap-5 w-full sm:w-auto relative z-10">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${app.is_active ? 'bg-gradient-to-br from-green-300/20 to-transparent text-theme-success border border-theme-success/20' : 'bg-theme-bg-muted text-theme-text-muted border border-theme-border'}`}
                        >
                          <RiSmartphoneLine size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="text-lg font-bold text-theme-text-primary group-hover:text-theme-primary-500 transition-colors truncate">
                              {app.name}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${app.is_active ? 'bg-green-300/15 text-theme-success border border-theme-success/30 shadow-[0_0_10px_rgba(134,239,172,0.2)]' : 'bg-theme-bg-muted text-theme-text-secondary border border-theme-border'}`}
                            >
                              {app.is_active ? 'Live' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-sm text-theme-text-secondary line-clamp-1 font-medium">
                            {app.description || 'No description provided'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8 shrink-0 relative z-10">
                        <div className="text-left sm:text-right hidden md:block">
                          <p className="text-xs font-semibold text-theme-text-muted uppercase tracking-widest mb-1.5">
                            Created On
                          </p>
                          <p className="text-sm font-bold text-theme-text-primary glass-text">
                            {new Date(app.created_at).toLocaleDateString(undefined, {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-theme-primary-500 flex items-center justify-center text-theme-text-secondary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:-translate-x-1">
                          <RiArrowRightLine size={22} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {apps.length > 5 && (
              <div className="mt-6 text-center sm:hidden">
                <Link
                  to="/apps"
                  className="inline-flex items-center gap-2 text-theme-primary-500 font-bold px-6 py-3 rounded-xl bg-violet-500/10"
                >
                  View All Directory
                  <RiArrowRightLine size={18} />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
