import React, { useState, useEffect } from 'react';
import {
  RiCloseLine,
  RiTimeLine,
  RiAddLine,
  RiDeleteBinLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiInformationLine,
} from '@remixicon/react';
import toast from 'react-hot-toast';
import { cronJobService } from '../../../services/cronJobService';
import { CronJob, HttpMethod } from '../../../types/cron-job';
import { CRON_PRESETS, describeCron, isValidCron } from '../../../utils/cronHelper';

interface CronJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (job: CronJob) => void;
  editingJob?: CronJob | null;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];

export const CronJobModal: React.FC<CronJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingJob,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [schedule, setSchedule] = useState('*/5 * * * *');
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [body, setBody] = useState('');
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);
  const [retries, setRetries] = useState(0);
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingJob) {
      setTitle(editingJob.title);
      setUrl(editingJob.url);
      setMethod(editingJob.method);
      setSchedule(editingJob.schedule);
      setTimeoutSeconds(editingJob.timeout_seconds || 30);
      setRetries(editingJob.retries || 0);
      setNotifyOnFailure(editingJob.notify_on_failure !== false);
      setBody(editingJob.body || '');

      if (editingJob.headers) {
        setHeaders(
          Object.entries(editingJob.headers).map(([k, v]) => ({ key: k, value: v }))
        );
      } else {
        setHeaders([]);
      }
      setShowAdvanced(
        !!editingJob.body ||
          (editingJob.headers && Object.keys(editingJob.headers).length > 0) ||
          editingJob.retries > 0
      );
    } else {
      setTitle('');
      setUrl('');
      setMethod('GET');
      setSchedule('*/5 * * * *');
      setHeaders([]);
      setBody('');
      setTimeoutSeconds(30);
      setRetries(0);
      setNotifyOnFailure(true);
      setShowAdvanced(false);
    }
    setError(null);
  }, [editingJob, isOpen]);

  if (!isOpen) return null;

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleUpdateHeader = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...headers];
    updated[index][field] = val;
    setHeaders(updated);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleFormatJsonBody = () => {
    try {
      if (!body.trim()) return;
      const parsed = JSON.parse(body);
      setBody(JSON.stringify(parsed, null, 2));
      toast.success('JSON formatted');
    } catch {
      toast.error('Invalid JSON in body');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a job title');
      return;
    }

    if (!url.trim() || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      setError('Please enter a valid URL beginning with http:// or https://');
      return;
    }

    if (!isValidCron(schedule)) {
      setError('Please enter a valid cron expression (e.g. "*/5 * * * *")');
      return;
    }

    // Convert headers array to Record
    const headersMap: Record<string, string> = {};
    for (const h of headers) {
      if (h.key.trim()) {
        headersMap[h.key.trim()] = h.value;
      }
    }

    const payload = {
      title: title.trim(),
      url: url.trim(),
      method,
      schedule: schedule.trim(),
      headers: Object.keys(headersMap).length > 0 ? headersMap : undefined,
      body: ['POST', 'PUT', 'PATCH'].includes(method) && body.trim() ? body.trim() : undefined,
      timeout_seconds: timeoutSeconds,
      retries,
      notify_on_failure: notifyOnFailure,
    };

    setLoading(true);
    try {
      let saved: CronJob;
      if (editingJob) {
        saved = await cronJobService.updateCronJob(editingJob.id, payload);
        toast.success('Cron job updated successfully');
      } else {
        saved = await cronJobService.createCronJob(payload);
        toast.success('Cron job created and scheduled!');
      }
      onSuccess(saved);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save cron job';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-theme-bg-secondary border border-theme-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-theme-primary-500/10 text-theme-primary-500 flex items-center justify-center">
              <RiTimeLine size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-text-primary">
                {editingJob ? 'Edit Cron Job' : 'Create Scheduled Cron Job'}
              </h3>
              <p className="text-xs text-theme-text-secondary">
                Configure automated HTTP webhooks & monitor pings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-theme-text-secondary hover:text-theme-text-primary p-2 rounded-lg hover:bg-theme-bg-muted transition-colors"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-theme-error/10 border border-theme-error/20 text-theme-error rounded-xl text-sm flex items-center gap-2">
              <RiInformationLine size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Job Title */}
          <div>
            <label className="block text-xs font-semibold text-theme-text-secondary uppercase tracking-wider mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Production API Health Check, Cache Warmer"
              className="w-full px-4 py-2.5 bg-theme-bg-primary border border-theme-border rounded-xl text-theme-text-primary text-sm focus:outline-none focus:border-theme-primary-500 transition-colors"
              required
            />
          </div>

          {/* Method & URL */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-theme-text-secondary uppercase tracking-wider mb-2">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className="w-full px-3 py-2.5 bg-theme-bg-primary border border-theme-border rounded-xl text-theme-text-primary text-sm font-mono font-semibold focus:outline-none focus:border-theme-primary-500 transition-colors"
              >
                {HTTP_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-theme-text-secondary uppercase tracking-wider mb-2">
                Target URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.yourdomain.com/v1/health"
                className="w-full px-4 py-2.5 bg-theme-bg-primary border border-theme-border rounded-xl text-theme-text-primary text-sm font-mono focus:outline-none focus:border-theme-primary-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Schedule Section */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-theme-text-secondary uppercase tracking-wider">
              Execution Schedule (Cron)
            </label>

            {/* Presets Chips */}
            <div className="flex flex-wrap gap-2">
              {CRON_PRESETS.slice(0, 6).map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setSchedule(preset.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    schedule === preset.value
                      ? 'bg-theme-primary-500/15 border-theme-primary-500 text-theme-primary-500 font-semibold'
                      : 'bg-theme-bg-primary border-theme-border text-theme-text-secondary hover:border-theme-primary-500/40'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Cron Input & Preview */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="* * * * *"
                className="flex-1 px-4 py-2.5 bg-theme-bg-primary border border-theme-border rounded-xl text-theme-text-primary font-mono text-sm focus:outline-none focus:border-theme-primary-500 transition-colors"
                required
              />
              <div className="px-3.5 py-2.5 rounded-xl bg-theme-bg-primary border border-theme-border/60 text-xs text-theme-text-secondary flex items-center gap-1.5">
                <span className="font-semibold text-theme-primary-400">Preview:</span>
                <span className="truncate">{describeCron(schedule)}</span>
              </div>
            </div>
          </div>

          {/* Advanced Options Accordion */}
          <div className="border-t border-theme-border/60 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-semibold text-theme-text-secondary hover:text-theme-text-primary transition-colors uppercase tracking-wider"
            >
              {showAdvanced ? <RiArrowDownSLine size={16} /> : <RiArrowRightSLine size={16} />}
              Advanced Request Settings (Headers, Body, Retries)
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 pl-2 border-l-2 border-theme-border/40">
                {/* Headers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-theme-text-secondary">
                      HTTP Request Headers
                    </span>
                    <button
                      type="button"
                      onClick={handleAddHeader}
                      className="text-xs text-theme-primary-500 hover:text-theme-primary-400 flex items-center gap-1 font-medium"
                    >
                      <RiAddLine size={14} /> Add Header
                    </button>
                  </div>

                  {headers.length === 0 ? (
                    <p className="text-xs text-theme-text-muted italic">No custom headers added.</p>
                  ) : (
                    <div className="space-y-2">
                      {headers.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={h.key}
                            onChange={(e) => handleUpdateHeader(i, 'key', e.target.value)}
                            placeholder="Header Name (e.g. Authorization)"
                            className="flex-1 px-3 py-1.5 bg-theme-bg-primary border border-theme-border rounded-lg text-xs font-mono text-theme-text-primary focus:outline-none focus:border-theme-primary-500"
                          />
                          <input
                            type="text"
                            value={h.value}
                            onChange={(e) => handleUpdateHeader(i, 'value', e.target.value)}
                            placeholder="Value (e.g. Bearer token...)"
                            className="flex-1 px-3 py-1.5 bg-theme-bg-primary border border-theme-border rounded-lg text-xs font-mono text-theme-text-primary focus:outline-none focus:border-theme-primary-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveHeader(i)}
                            className="text-theme-error hover:bg-theme-error/10 p-1.5 rounded-lg transition-colors"
                          >
                            <RiDeleteBinLine size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Request Body (for POST/PUT/PATCH) */}
                {['POST', 'PUT', 'PATCH'].includes(method) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-theme-text-secondary">
                        Request Body (JSON / text)
                      </span>
                      <button
                        type="button"
                        onClick={handleFormatJsonBody}
                        className="text-xs text-theme-primary-500 hover:text-theme-primary-400 font-medium"
                      >
                        Format JSON
                      </button>
                    </div>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder='{"key": "value"}'
                      rows={3}
                      className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-xl text-xs font-mono text-theme-text-primary focus:outline-none focus:border-theme-primary-500 transition-colors"
                    />
                  </div>
                )}

                {/* Timeout & Retries */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-theme-text-secondary mb-1">
                      Timeout (seconds): {timeoutSeconds}s
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={120}
                      step={5}
                      value={timeoutSeconds}
                      onChange={(e) => setTimeoutSeconds(parseInt(e.target.value, 10))}
                      className="w-full accent-theme-primary-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-theme-text-secondary mb-1">
                      Automatic Retries: {retries}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={3}
                      step={1}
                      value={retries}
                      onChange={(e) => setRetries(parseInt(e.target.value, 10))}
                      className="w-full accent-theme-primary-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Failure Alert Push Notification */}
          <div className="p-3.5 bg-theme-bg-primary border border-theme-border rounded-xl flex items-center justify-between">
            <div className="pr-4">
              <p className="text-xs font-bold text-theme-text-primary">
                Web Push Alert on Failure
              </p>
              <p className="text-[11px] text-theme-text-secondary">
                Dispatch an instant push notification via Vibe Message if this job fails or times out.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifyOnFailure}
                onChange={(e) => setNotifyOnFailure(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-primary-500"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-theme-border text-theme-text-secondary hover:text-theme-text-primary text-sm font-medium hover:bg-theme-bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-theme-primary-600 hover:bg-theme-primary-700 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-theme-primary-500/20 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : editingJob ? (
                'Update Cron Job'
              ) : (
                'Create & Schedule'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
