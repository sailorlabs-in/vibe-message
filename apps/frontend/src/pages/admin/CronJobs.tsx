import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RiTimeLine,
  RiAddLine,
  RiPlayFill,
  RiHistoryLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiPauseCircleLine,
  RiSearchLine,
  RiGlobalLine,
  RiAlertLine,
} from '@remixicon/react';
import toast from 'react-hot-toast';
import { cronJobService } from '../../services/cronJobService';
import { systemService } from '../../services/systemService';
import { useAppSelector } from '../../store/store';
import { CronJob, HttpMethod } from '../../types/cron-job';
import { CronJobModal } from './components/CronJobModal';
import { CronJobLogsModal } from './components/CronJobLogsModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { describeCron } from '../../utils/cronHelper';

export const CronJobs: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isSelfHosted, setIsSelfHosted] = useState(false);
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);
  const [viewingLogsJob, setViewingLogsJob] = useState<CronJob | null>(null);
  const [deletingJob, setDeletingJob] = useState<CronJob | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [runningJobId, setRunningJobId] = useState<number | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cronJobService.getCronJobs();
      setJobs(data);
    } catch (err: any) {
      toast.error('Failed to load cron jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    systemService.getPublicSettings().then((s) => {
      setIsSelfHosted(s.is_self_hosted);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleToggle = async (job: CronJob) => {
    try {
      const updated = await cronJobService.toggleCronJob(job.id);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      toast.success(updated.is_enabled ? 'Cron job activated' : 'Cron job paused');
    } catch (err: any) {
      toast.error('Failed to toggle cron job state');
    }
  };

  const handleRunNow = async (job: CronJob) => {
    setRunningJobId(job.id);
    try {
      await cronJobService.runCronJobNow(job.id);
      toast.success(`Queued execution for "${job.title}"`);
      // Refresh list after brief moment to capture updated last_run
      setTimeout(fetchJobs, 2500);
    } catch (err: any) {
      toast.error('Failed to trigger execution');
    } finally {
      setRunningJobId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingJob) return;
    setDeleteLoading(true);
    try {
      await cronJobService.deleteCronJob(deletingJob.id);
      setJobs((prev) => prev.filter((j) => j.id !== deletingJob.id));
      toast.success('Cron job deleted');
      setDeletingJob(null);
    } catch (err: any) {
      toast.error('Failed to delete cron job');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.schedule.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMethod = methodFilter === 'ALL' || job.method === methodFilter;

      let matchesStatus = true;
      if (statusFilter === 'ACTIVE') matchesStatus = job.is_enabled;
      else if (statusFilter === 'PAUSED') matchesStatus = !job.is_enabled;
      else if (statusFilter === 'FAILING') matchesStatus = job.last_status === 'FAILURE';

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [jobs, searchQuery, methodFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter((j) => j.is_enabled).length;
    const paused = total - active;
    const failing = jobs.filter((j) => j.is_enabled && j.last_status === 'FAILURE').length;
    return { total, active, paused, failing };
  }, [jobs]);

  const isLimitReached = Boolean(
    !isSelfHosted &&
      user?.cron_job_limit !== null &&
      user?.cron_job_limit !== undefined &&
      jobs.length >= user.cron_job_limit
  );

  const getMethodBadgeClass = (method: HttpMethod) => {
    switch (method) {
      case 'GET':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'POST':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'PUT':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'PATCH':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-theme-bg-muted text-theme-text-secondary border-theme-border';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-theme-primary-500/10 text-theme-primary-500">
              <RiTimeLine size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-theme-text-primary tracking-tight">
              Cron Jobs
            </h1>
          </div>
          <p className="text-sm text-theme-text-secondary mt-1">
            Automated HTTP requests, health pings & webhooks with reliable BullMQ scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isSelfHosted && user?.cron_job_limit !== null && user?.cron_job_limit !== undefined && (
            <div
              className={`text-xs px-3.5 py-2 rounded-xl border font-semibold flex items-center gap-1.5 ${
                isLimitReached
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : 'bg-theme-bg-secondary text-theme-text-secondary border-theme-border'
              }`}
            >
              {isLimitReached && <RiAlertLine size={15} />}
              <span>
                Quota: {jobs.length} / {user.cron_job_limit}
              </span>
            </div>
          )}

          <button
            onClick={() => {
              if (isLimitReached) {
                toast.error(
                  `Cron job limit reached (${user?.cron_job_limit} jobs max). Contact Super Admin to increase your limit.`
                );
                return;
              }
              setEditingJob(null);
              setIsCreateModalOpen(true);
            }}
            disabled={isLimitReached}
            className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-xl transition-all ${
              isLimitReached
                ? 'bg-theme-bg-muted text-theme-text-muted cursor-not-allowed border border-theme-border opacity-70'
                : 'bg-theme-primary-600 hover:bg-theme-primary-700 text-white shadow-lg shadow-theme-primary-500/20 hover:scale-105'
            }`}
            title={isLimitReached ? `Quota reached (${user?.cron_job_limit} max)` : undefined}
          >
            <RiAddLine size={18} />
            Create Cron Job
          </button>
        </div>
      </div>

      {/* Limit Reached Warning Banner */}
      {isLimitReached && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400">
          <RiAlertLine size={20} className="shrink-0" />
          <div>
            <span className="font-semibold">Cron Job Limit Reached:</span> You have reached your
            maximum allowance of {user?.cron_job_limit} cron jobs. Contact a Super Admin to
            increase your limit.
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-theme-bg-secondary border border-theme-border shadow-sm">
          <div className="flex items-center justify-between text-theme-text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Jobs</span>
            <RiGlobalLine size={18} />
          </div>
          <div className="text-2xl font-bold text-theme-text-primary">
            {stats.total}
            {!isSelfHosted && user?.cron_job_limit !== null && user?.cron_job_limit !== undefined && (
              <span className="text-sm font-normal text-theme-text-secondary ml-1.5">
                / {user.cron_job_limit}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-theme-bg-secondary border border-theme-border shadow-sm">
          <div className="flex items-center justify-between text-theme-text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
            <RiCheckboxCircleLine size={18} className="text-theme-success" />
          </div>
          <div className="text-2xl font-bold text-theme-success">{stats.active}</div>
        </div>

        <div className="p-5 rounded-2xl bg-theme-bg-secondary border border-theme-border shadow-sm">
          <div className="flex items-center justify-between text-theme-text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Paused</span>
            <RiPauseCircleLine size={18} className="text-theme-text-muted" />
          </div>
          <div className="text-2xl font-bold text-theme-text-secondary">{stats.paused}</div>
        </div>

        <div className="p-5 rounded-2xl bg-theme-bg-secondary border border-theme-border shadow-sm">
          <div className="flex items-center justify-between text-theme-text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Failing</span>
            <RiAlertLine size={18} className={stats.failing > 0 ? 'text-theme-error' : 'text-theme-text-muted'} />
          </div>
          <div className={`text-2xl font-bold ${stats.failing > 0 ? 'text-theme-error' : 'text-theme-text-primary'}`}>
            {stats.failing}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-theme-bg-secondary border border-theme-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <RiSearchLine
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-text-secondary"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, URL or schedule..."
            className="w-full pl-10 pr-4 py-2 bg-theme-bg-primary border border-theme-border rounded-xl text-sm text-theme-text-primary focus:outline-none focus:border-theme-primary-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-xl text-xs font-mono font-semibold text-theme-text-primary focus:outline-none focus:border-theme-primary-500"
          >
            <option value="ALL">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-xl text-xs font-semibold text-theme-text-primary focus:outline-none focus:border-theme-primary-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="PAUSED">Paused Only</option>
            <option value="FAILING">Failing Only</option>
          </select>
        </div>
      </div>

      {/* Cron Jobs List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-theme-bg-secondary border border-theme-border animate-pulse h-28"
            />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-theme-bg-secondary border border-theme-border">
          <div className="w-12 h-12 rounded-2xl bg-theme-primary-500/10 text-theme-primary-500 flex items-center justify-center mx-auto mb-4">
            <RiTimeLine size={28} />
          </div>
          <h3 className="text-base font-bold text-theme-text-primary">
            {jobs.length === 0 ? 'No Cron Jobs Created Yet' : 'No matching cron jobs found'}
          </h3>
          <p className="text-xs text-theme-text-secondary max-w-md mx-auto mt-1 mb-5">
            {jobs.length === 0
              ? 'Schedule your first automated HTTP webhook, microservice health check, or periodic ping.'
              : 'Try clearing your search query or adjusting your filters.'}
          </p>
          {jobs.length === 0 && (
            <button
              onClick={() => {
                setEditingJob(null);
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-theme-primary-600 hover:bg-theme-primary-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
            >
              <RiAddLine size={16} />
              Create First Cron Job
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredJobs.map((job) => {
            const isFailing = job.is_enabled && job.last_status === 'FAILURE';
            return (
              <div
                key={job.id}
                className={`p-5 rounded-2xl bg-theme-bg-secondary border transition-all duration-200 hover:shadow-md ${
                  isFailing
                    ? 'border-theme-error/40 hover:border-theme-error/60'
                    : 'border-theme-border hover:border-theme-primary-500/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Status, Title, URL, Schedule */}
                  <div className="min-w-0 space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Status indicator dot */}
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          !job.is_enabled
                            ? 'bg-theme-text-muted'
                            : isFailing
                            ? 'bg-theme-error animate-pulse'
                            : 'bg-theme-success animate-pulse'
                        }`}
                        title={!job.is_enabled ? 'Paused' : isFailing ? 'Failing' : 'Active'}
                      />

                      <h3 className="text-base font-bold text-theme-text-primary truncate">
                        {job.title}
                      </h3>

                      {/* Method Badge */}
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${getMethodBadgeClass(
                          job.method
                        )}`}
                      >
                        {job.method}
                      </span>

                      {/* Schedule Pill */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-theme-bg-primary text-theme-text-secondary border border-theme-border">
                        <RiTimeLine size={12} />
                        {job.schedule}
                      </span>

                      <span className="text-xs text-theme-text-muted hidden sm:inline">
                        • {describeCron(job.schedule)}
                      </span>
                    </div>

                    {/* URL */}
                    <div className="text-xs font-mono text-theme-text-secondary truncate max-w-2xl">
                      {job.url}
                    </div>

                    {/* Execution status & latency */}
                    <div className="flex items-center gap-3 text-xs text-theme-text-secondary flex-wrap pt-1">
                      {job.last_run_at ? (
                        <>
                          <span className="flex items-center gap-1">
                            {job.last_status === 'SUCCESS' ? (
                              <span className="inline-flex items-center gap-1 font-mono font-semibold text-theme-success">
                                <RiCheckboxCircleLine size={14} />
                                {job.last_status_code || 200} OK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono font-semibold text-theme-error">
                                <RiCloseCircleLine size={14} />
                                {job.last_status_code && job.last_status_code > 0
                                  ? `${job.last_status_code} ERR`
                                  : 'TIMEOUT'}
                              </span>
                            )}
                          </span>

                          {job.last_duration_ms !== null && (
                            <span className="font-mono text-theme-text-muted">
                              {job.last_duration_ms}ms
                            </span>
                          )}

                          <span className="text-theme-text-muted">
                            Last run: {new Date(job.last_run_at).toLocaleTimeString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-theme-text-muted italic">Never executed yet</span>
                      )}

                      {job.consecutive_failures > 0 && (
                        <span className="text-xs font-semibold text-theme-error bg-theme-error/10 px-2 py-0.5 rounded">
                          {job.consecutive_failures} failures in a row
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-theme-border/60">
                    {/* Pause / Resume Switch */}
                    <button
                      onClick={() => handleToggle(job)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        job.is_enabled
                          ? 'bg-theme-success/10 border-theme-success/30 text-theme-success hover:bg-theme-success/20'
                          : 'bg-theme-bg-muted border-theme-border text-theme-text-secondary hover:bg-theme-bg-muted/80'
                      }`}
                      title={job.is_enabled ? 'Click to Pause' : 'Click to Activate'}
                    >
                      {job.is_enabled ? 'Active' : 'Paused'}
                    </button>

                    {/* Run Now Button */}
                    <button
                      onClick={() => handleRunNow(job)}
                      disabled={runningJobId === job.id}
                      className="px-3 py-1.5 rounded-xl border border-theme-border bg-theme-bg-primary hover:border-theme-primary-500/50 text-theme-primary-400 hover:text-theme-primary-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      title="Trigger immediate execution"
                    >
                      <RiPlayFill
                        size={14}
                        className={runningJobId === job.id ? 'animate-spin' : ''}
                      />
                      <span>{runningJobId === job.id ? 'Running...' : 'Run Now'}</span>
                    </button>

                    {/* Logs Button */}
                    <button
                      onClick={() => setViewingLogsJob(job)}
                      className="p-2 rounded-xl border border-theme-border text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
                      title="View execution logs"
                    >
                      <RiHistoryLine size={16} />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        setEditingJob(job);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-2 rounded-xl border border-theme-border text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
                      title="Edit configuration"
                    >
                      <RiEditLine size={16} />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeletingJob(job)}
                      className="p-2 rounded-xl border border-theme-border text-theme-error hover:bg-theme-error/10 transition-colors"
                      title="Delete cron job"
                    >
                      <RiDeleteBinLine size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CronJobModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingJob(null);
        }}
        onSuccess={() => {
          fetchJobs();
        }}
        editingJob={editingJob}
      />

      {/* Logs Modal */}
      <CronJobLogsModal
        isOpen={!!viewingLogsJob}
        onClose={() => setViewingLogsJob(null)}
        job={viewingLogsJob}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingJob}
        onClose={() => setDeletingJob(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Cron Job"
        description={
          <span>
            Are you sure you want to delete <strong>{deletingJob?.title}</strong>? All scheduled
            runs and execution history will be permanently deleted.
          </span>
        }
        confirmLabel="Delete Cron Job"
        variant="danger"
      />
    </div>
  );
};
