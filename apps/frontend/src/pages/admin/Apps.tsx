import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchApps, createNewApp, clearError } from '../../store/slices/appsSlice';
import { AppsSkeleton } from '../../components/common/SkeletonLoader';
import { RiAddLine, RiSmartphoneLine, RiCloseLine } from '@remixicon/react';

export const Apps: React.FC = () => {
  const dispatch = useAppDispatch();
  const { apps, loading, error } = useAppSelector((state) => state.apps);
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const userId = targetUserId ? parseInt(targetUserId, 10) : undefined;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const shouldReduceMotion = useReducedMotion();
  const easeOut = [0.23, 1, 0.32, 1] as const;

  useEffect(() => {
    dispatch(fetchApps(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    const result = await dispatch(createNewApp({ name, description }));
    if (createNewApp.fulfilled.match(result)) {
      setShowCreateModal(false);
      setName('');
      setDescription('');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: easeOut },
    },
  };

  if (loading && (apps?.length ?? 0) === 0) {
    return <AppsSkeleton />;
  }

  const safeApps = Array.isArray(apps) ? apps : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-theme-text-primary tracking-tight">
            {userId ? `Apps for User #${userId}` : 'My Apps'}
          </h1>
          {userId && (
            <p className="text-theme-text-secondary mt-1 text-sm font-medium">Viewing as Super Admin</p>
          )}
        </div>
        {!userId && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-theme-primary-600 hover:bg-theme-primary-700 text-white rounded-xl font-semibold text-sm shadow-xs transition-all active:scale-[0.98]"
          >
            <RiAddLine size={18} />
            <span>Create App</span>
          </button>
        )}
      </motion.div>

      {safeApps.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: easeOut }}
          className="bg-theme-bg-secondary border border-theme-border rounded-2xl text-center py-16 px-4 shadow-xs"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-theme-bg-primary border border-theme-border flex items-center justify-center text-theme-primary-500 shadow-2xs">
            <RiSmartphoneLine size={28} />
          </div>
          <p className="text-theme-text-secondary mb-6 text-sm max-w-sm mx-auto">
            You haven't created any apps yet.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-theme-primary-600 hover:bg-theme-primary-700 text-white rounded-xl font-semibold text-sm shadow-xs transition-all active:scale-[0.98]"
          >
            <RiAddLine size={18} />
            <span>Create Your First App</span>
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {safeApps.map((app) => (
            <motion.div key={app.id} variants={itemVariants}>
              <Link
                to={`/apps/${app.public_app_id}`}
                className="group bg-theme-bg-secondary hover:bg-theme-bg-muted/40 border border-theme-border hover:border-theme-border-strong rounded-2xl p-6 transition-all duration-200 block h-full flex flex-col shadow-xs hover:shadow-sm"
              >
                <div className="flex justify-between items-start mb-3 gap-3">
                  <h3 className="text-lg font-display font-bold text-theme-text-primary group-hover:text-theme-primary-600 dark:group-hover:text-theme-primary-400 transition-colors line-clamp-1">
                    {app.name}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                      app.is_active
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-theme-bg-muted text-theme-text-muted border border-theme-border'
                    }`}
                  >
                    {app.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-theme-text-secondary text-sm mb-6 line-clamp-2 leading-relaxed">
                  {app.description || 'No description'}
                </p>
                <div className="text-xs text-theme-text-muted mt-auto pt-4 border-t border-theme-border font-mono space-y-1">
                  <p className="truncate">App ID: {app.public_app_id}</p>
                  <p>
                    Created:{' '}
                    {new Date(app.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: easeOut }}
              className="relative bg-theme-bg-primary rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-theme-border z-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-display font-bold text-theme-text-primary">Create New App</h2>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
                >
                  <RiCloseLine size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-medium border border-rose-500/20">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-theme-text-secondary mb-2">
                    App Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-theme-text-secondary mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input w-full"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
