import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  fetchApps,
  createNewApp,
  clearError,
} from "../../store/slices/appsSlice";

export const Apps: React.FC = () => {
  const dispatch = useAppDispatch();
  const { apps, loading, error } = useAppSelector((state) => state.apps);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    dispatch(fetchApps());
  }, [dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    const result = await dispatch(createNewApp({ name, description }));
    if (createNewApp.fulfilled.match(result)) {
      setShowCreateModal(false);
      setName("");
      setDescription("");
    }
  };

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
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  if (loading && apps.length === 0) {
    return <div className="p-8 text-theme-text-secondary">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-bold text-theme-text-primary">My Apps</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary shadow-lg shadow-theme-primary-500/20"
        >
          + Create App
        </button>
      </motion.div>

      {apps.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card text-center py-12"
        >
          <p className="text-theme-text-secondary mb-4">
            You haven't created any apps yet.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Your First App
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {apps.map((app) => (
            <motion.div key={app.id} variants={itemVariants}>
              <Link
                to={`/apps/${app.public_app_id}`}
                className="card hover:shadow-xl dark:hover:shadow-theme-primary-500/5 transition block border border-transparent hover:border-theme-primary-500/30 h-full flex flex-col"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-theme-text-primary">
                    {app.name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${app.is_active ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800/50" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"}`}
                  >
                    {app.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-theme-text-secondary text-sm mb-4">
                  {app.description || "No description"}
                </p>
                <div className="text-xs text-theme-text-muted mt-auto pt-4 border-t border-theme-border">
                  <p>App ID: {app.public_app_id}</p>
                  <p className="mt-1">
                    Created: {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-theme-bg-secondary rounded-xl shadow-2xl max-w-md w-full p-6 border border-theme-border">
            <h2 className="text-2xl font-bold mb-4 text-theme-text-primary">
              Create New App
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800/30">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                  App Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
