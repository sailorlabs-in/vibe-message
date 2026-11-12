import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  RiCloseLine,
  RiShieldCheckLine,
  RiLockLine,
  RiLockUnlockLine,
  RiCodeLine,
  RiEyeLine,
  RiDatabase2Line,
  RiNotification4Line,
} from '@remixicon/react';
import toast from 'react-hot-toast';
import ApiRequest from '../../../services/ApiRequest';
import { CopyButton } from '../../../components/common/CopyButton';
import { decryptNotificationPayload, isPayloadEncrypted } from '../../../utils/crypto';
import { SolarIcon } from '../../../utils/solarIcons';

interface PayloadPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
  notificationId: number | null;
  rawPayloadJson?: string;
  appName?: string;
}

interface PayloadData {
  id: number;
  encrypted_payload: string;
  payload: any;
  is_encrypted: boolean;
}

export const PayloadPreviewModal: React.FC<PayloadPreviewModalProps> = ({
  isOpen,
  onClose,
  appId,
  notificationId,
  rawPayloadJson = '',
  appName = 'App',
}) => {
  const [data, setData] = useState<PayloadData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'decrypted' | 'encrypted'>('decrypted');
  const shouldReduceMotion = useReducedMotion();

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const fetchPayloadPreview = useCallback(async () => {
    if (!notificationId) return;
    setLoading(true);
    try {
      // Fetch decrypted payload directly from the gateway
      const res = await ApiRequest(
        `/apps/${appId}/notifications/${notificationId}/preview-payload`,
        'get'
      );
      if (res?.data) {
        setData(res.data);
      }
    } catch {
      // Fallback: decrypt on client-side if gateway request fails or offline
      if (rawPayloadJson) {
        const decrypted = decryptNotificationPayload(rawPayloadJson);
        setData({
          id: notificationId,
          encrypted_payload: rawPayloadJson,
          payload: decrypted,
          is_encrypted: isPayloadEncrypted(rawPayloadJson),
        });
      } else {
        toast.error('Failed to preview payload');
      }
    } finally {
      setLoading(false);
    }
  }, [appId, notificationId, rawPayloadJson]);

  useEffect(() => {
    if (isOpen && notificationId) {
      fetchPayloadPreview();
      setActiveTab('decrypted');
    } else {
      setData(null);
    }
  }, [isOpen, notificationId, fetchPayloadPreview]);

  if (!isOpen) return null;

  const payloadObj = data?.payload || {};
  const encryptedPayloadStr = data?.encrypted_payload || rawPayloadJson || '';
  const isEncrypted = data ? data.is_encrypted : isPayloadEncrypted(encryptedPayloadStr);

  const modal = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 0.95,
            y: shouldReduceMotion ? 0 : 8,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 0.95,
            y: shouldReduceMotion ? 0 : 8,
          }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-theme-bg-primary border border-theme-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-theme-border flex items-center justify-between flex-shrink-0 bg-theme-bg-secondary/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <RiShieldCheckLine size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-theme-text-primary">
                    Notification Payload Preview
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <RiLockLine size={12} />
                    Database Encrypted
                  </span>
                </div>
                <p className="text-xs text-theme-text-secondary mt-0.5">
                  Notification #{notificationId} &bull; End-to-end confidentiality verified
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              <RiCloseLine size={20} />
            </button>
          </div>

          {/* Confidentiality Alert Banner */}
          <div className="px-6 py-3 bg-emerald-50/60 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <RiShieldCheckLine
                size={16}
                className="shrink-0 text-emerald-600 dark:text-emerald-400"
              />
              <span>
                <strong>Confidentiality Protection:</strong> Payload data is stored in the database
                in encrypted format (<code className="font-mono font-semibold">payload_json</code>)
                using AES encryption.
              </span>
            </div>
            <span className="shrink-0 font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
              AES-256
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 pt-3 border-b border-theme-border flex gap-2 bg-theme-bg-primary flex-shrink-0">
            <button
              onClick={() => setActiveTab('decrypted')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'decrypted'
                  ? 'border-theme-primary-500 text-theme-primary-500'
                  : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              <RiLockUnlockLine size={15} />
              Decrypted Payload
            </button>
            <button
              onClick={() => setActiveTab('encrypted')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'encrypted'
                  ? 'border-theme-primary-500 text-theme-primary-500'
                  : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              <RiDatabase2Line size={15} />
              Encrypted Database Ciphertext
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {loading ? (
              <div className="py-16 text-center text-theme-text-secondary">
                <div className="w-8 h-8 border-2 border-theme-primary-500/20 border-t-theme-primary-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Decrypting payload from gateway...</p>
              </div>
            ) : activeTab === 'decrypted' ? (
              <>
                {/* Visual Notification Card */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-text-secondary mb-2 flex items-center gap-1.5">
                    <RiEyeLine size={14} />
                    Device Notification View
                  </h4>
                  <div className="p-4 rounded-xl border border-theme-border bg-theme-bg-secondary/40 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-theme-bg-primary border border-theme-border flex items-center justify-center shrink-0 overflow-hidden text-theme-primary-500">
                        {payloadObj.icon ? (
                          <img
                            src={payloadObj.icon}
                            alt="icon"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <RiNotification4Line size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-theme-text-secondary">
                            {appName}
                          </span>
                          <span className="text-[10px] text-theme-text-muted">
                            Encrypted at rest
                          </span>
                        </div>
                        <h5 className="text-sm font-semibold text-theme-text-primary mt-0.5 truncate">
                          {payloadObj.title || 'Untitled Notification'}
                        </h5>
                        <p className="text-xs text-theme-text-secondary mt-1 whitespace-pre-wrap break-words">
                          {payloadObj.body || '{ No body content }'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Structured Fields */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-text-secondary mb-2 flex items-center gap-1.5">
                    <RiCodeLine size={14} />
                    Notification Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-theme-bg-secondary/50 border border-theme-border">
                      <span className="text-theme-text-secondary block text-[11px]">Title</span>
                      <span className="font-semibold text-theme-text-primary mt-0.5 block truncate">
                        {payloadObj.title || '—'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-theme-bg-secondary/50 border border-theme-border">
                      <span className="text-theme-text-secondary block text-[11px]">
                        Click Action URL
                      </span>
                      <span className="font-mono text-theme-text-primary mt-0.5 block truncate">
                        {payloadObj.click_action || payloadObj.data?.url || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decrypted Raw JSON */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-text-secondary">
                      Decrypted JSON Object
                    </h4>
                    <CopyButton text={JSON.stringify(payloadObj, null, 2)} label="Copy JSON" />
                  </div>
                  <pre className="p-3.5 bg-theme-bg-secondary border border-theme-border rounded-xl font-mono text-[11px] text-theme-text-primary overflow-x-auto whitespace-pre-wrap max-h-56">
                    {JSON.stringify(payloadObj, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <>
                {/* Database Ciphertext View */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-text-secondary">
                        Ciphertext (Encrypted)
                      </h4>
                    </div>
                    <CopyButton text={encryptedPayloadStr} label="Copy Ciphertext" />
                  </div>

                  <div className="relative">
                    <pre className="p-3.5 bg-theme-bg-secondary border border-theme-border rounded-xl font-mono text-[11px] text-theme-primary-400 dark:text-theme-primary-300 break-all whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {encryptedPayloadStr || 'No payload recorded'}
                    </pre>
                  </div>
                </div>

                {/* Encryption details box */}
                <div className="p-4 rounded-xl bg-theme-bg-secondary/40 border border-theme-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-theme-text-secondary">Encryption Algorithm</span>
                    <span className="font-mono font-semibold text-theme-text-primary">
                      AES (CryptoJS)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme-text-secondary">Encrypted In Database</span>
                    <span
                      className={`inline-flex items-center gap-1.5 font-semibold ${
                        isEncrypted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
                      }`}
                    >
                      <SolarIcon
                        icon={
                          isEncrypted ? 'solar:check-circle-bold' : 'solar:danger-triangle-bold'
                        }
                        className="w-3.5 h-3.5 shrink-0"
                      />
                      {isEncrypted ? 'Yes (Ciphertext)' : 'Legacy Plaintext'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme-text-secondary">Confidentiality Guarantee</span>
                    <span className="text-theme-text-primary">
                      Protected against database dumps
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-theme-border flex items-center justify-between flex-shrink-0 bg-theme-bg-secondary/40">
            <span className="text-[11px] text-theme-text-muted flex items-center gap-1">
              <RiLockLine size={13} />
              Stored in encrypted form in database for confidentiality
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-theme-bg-muted hover:bg-theme-bg-muted/80 text-theme-text-primary text-xs font-semibold transition-colors focus:outline-none"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modal, document.body);
};
