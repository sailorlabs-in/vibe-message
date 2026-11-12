import React, { useState } from 'react';
import { RiFileCopyLine, RiCheckLine } from '@remixicon/react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copy',
  className = '',
  iconOnly = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={
        className ||
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-theme-bg-secondary hover:bg-theme-bg-muted text-theme-text-secondary hover:text-theme-text-primary border border-theme-border transition-all active:scale-95'
      }
      title={copied ? 'Copied to clipboard' : 'Copy code'}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? (
        <>
          <RiCheckLine size={13} className="text-theme-success shrink-0" />
          {!iconOnly && <span className="text-theme-success font-semibold">Copied!</span>}
        </>
      ) : (
        <>
          <RiFileCopyLine size={13} className="shrink-0" />
          {!iconOnly && <span>{label}</span>}
        </>
      )}
    </button>
  );
};
