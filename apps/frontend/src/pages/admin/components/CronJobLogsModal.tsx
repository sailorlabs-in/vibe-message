import React, { useState, useEffect, useCallback } from 'react';
import {
  RiCloseLine,
  RiRefreshLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
} from '@remixicon/react';
import toast from 'react-hot-toast';
import { cronJobService } from '../../../services/cronJobService';
import { CronJob, CronJobLog } from '../../../types/cron-job';

interface CronJobLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: CronJob | null;
}

export const CronJobLogsModal: React.FC<CronJobLogsModalProps> = ({
  isOpen,
  onClose,
  job,
}) => {
  const [logs, setLogs] = useState<CronJobLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!job) return;
    setLoading(true);
    try {
      const data = await cronJobService.getCronJobLogs(job.id, 50);
      setLogs(data);
    } catch (err: any) {
      toast.error('Failed to load execution logs');
    } finally {
      setLoading(false);
    }
  }, [job]);

  useEffect(() => {
    if (isOpen && job) {
      fetchLogs();
      setExpandedLogId(null);
    }
  }, [isOpen, job, fetchLogs]);

  if (!isOpen || !job) return null;

  const toggleExpand = (id: number) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getStatusBadge = (log: CronJobLog) => {
    const isSuccess = log.status === 'SUCCESS';
    const code = log.status_code;

    if (isSuccess) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-theme-success/15 text-theme-success border border-theme-success/30">
          <RiCheckboxCircleLine size={13} />
          {code || 200} OK
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-theme-error/15 text-theme-error border border-theme-error/30">
        <RiCloseCircleLine size={13} />
        {code && code > 0 ? `${code} ERR` : 'TIMEOUT / ERR'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-theme-bg-secondary border border-theme-border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-border flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-theme-primary-500/10 text-theme-primary-500 flex items-center justify-center flex-shrink-0">
              <RiTimeLine size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-theme-text-primary truncate">
                  {job.title}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-md font-mono font-bold bg-theme-bg-muted text-theme-text-secondary border border-theme-border">
                  {job.method}
                </span>
              </div>
              <p className="text-xs text-theme-text-secondary font-mono truncate max-w-lg mt-0.5">
                {job.url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 rounded-xl border border-theme-border text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors disabled:opacity-50"
              title="Refresh logs"
            >
              <RiRefreshLine size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
            >
              <RiCloseLine size={20} />
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && logs.length === 0 ? (
            <div className="py-16 text-center text-theme-text-secondary">
              <div className="w-8 h-8 border-2 border-theme-primary-500/20 border-t-theme-primary-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading execution logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-theme-text-secondary">
              <RiTimeLine size={36} className="mx-auto text-theme-text-muted mb-2" />
              <p className="text-sm font-semibold text-theme-text-primary">No executions recorded yet</p>
              <p className="text-xs text-theme-text-secondary mt-1">
                Trigger a manual "Run Now" or wait for the next scheduled tick.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-theme-bg-primary border border-theme-border rounded-xl overflow-hidden transition-all"
              >
                {/* Summary Row */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-theme-bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button className="text-theme-text-secondary">
                      {expandedLogId === log.id ? (
                        <RiArrowDownSLine size={18} />
                      ) : (
                        <RiArrowRightSLine size={18} />
                      )}
                    </button>
                    {getStatusBadge(log)}
                    <span className="text-xs font-mono font-medium text-theme-text-secondary">
                      {log.duration_ms}ms
                    </span>
                    {log.is_manual && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-theme-bg-muted text-theme-text-secondary">
                        Manual Run
                      </span>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-theme-text-secondary">
                      {new Date(log.triggered_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedLogId === log.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-theme-border/60 space-y-3 text-xs">
                    {log.error_message && (
                      <div className="p-3 bg-theme-error/10 border border-theme-error/20 rounded-lg text-theme-error font-mono">
                        <span className="font-bold">Error:</span> {log.error_message}
                      </div>
                    )}

                    {log.response_headers && (
                      <div>
                        <span className="font-semibold text-theme-text-secondary block mb-1">
                          Response Headers:
                        </span>
                        <div className="p-2.5 bg-theme-bg-secondary rounded-lg font-mono text-[11px] max-h-32 overflow-y-auto space-y-0.5">
                          {Object.entries(log.response_headers).map(([k, v]) => (
                            <div key={k} className="text-theme-text-secondary">
                              <span className="text-theme-primary-400">{k}:</span> {v}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.response_body ? (
                      <div>
                        <span className="font-semibold text-theme-text-secondary block mb-1">
                          Response Body:
                        </span>
                        <pre className="p-3 bg-theme-bg-secondary rounded-lg font-mono text-[11px] text-theme-text-primary max-h-48 overflow-y-auto whitespace-pre-wrap break-all">
                          {log.response_body}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-theme-text-muted italic">No response body captured.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme-border flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-theme-bg-muted hover:bg-theme-bg-muted/80 text-theme-text-primary text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
