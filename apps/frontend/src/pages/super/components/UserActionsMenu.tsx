import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  RiExternalLinkLine,
  RiCheckboxCircleLine,
  RiProhibitedLine,
  RiAlertLine,
  RiShieldUserLine,
  RiUserUnfollowLine,
  RiDeleteBinLine,
  RiFoldersLine,
  RiShieldKeyholeLine,
  RiKeyLine,
} from '@remixicon/react';
import { User, UserStatus } from '../../../types';

interface UserActionsMenuProps {
  user: User;
  currentUserId?: number;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onStatusChange: (userId: number, status: UserStatus) => void;
  onSetAppLimit: (user: User) => void;
  onSendWarning: (user: User) => void;
  onToggleRetentionPerm: (user: User) => void;
  onRoleChange: (userId: number, role: 'SUPER_ADMIN' | 'ADMIN') => void;
  onApproveEnterpriseKey?: (user: User) => void;
  onRevokeEnterpriseKey?: (user: User) => void;
  onDelete: (user: User) => void;
  isSelfHosted?: boolean;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
}) => {
  const colorMap = {
    default: 'text-theme-text-primary hover:bg-black/5 dark:hover:bg-white/5',
    success: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20',
    danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
    warning: 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors rounded-lg disabled:opacity-40 disabled:cursor-not-allowed ${colorMap[variant]}`}
    >
      <span className="shrink-0 opacity-70">{icon}</span>
      {label}
    </button>
  );
};

const MenuDivider = () => <div className="h-px bg-theme-border my-1 mx-2" />;

export const UserActionsMenu: React.FC<UserActionsMenuProps> = ({
  user,
  currentUserId,
  anchorEl,
  onClose,
  onStatusChange,
  onSetAppLimit,
  onSendWarning,
  onToggleRetentionPerm,
  onRoleChange,
  onApproveEnterpriseKey,
  onRevokeEnterpriseKey,
  onDelete,
  isSelfHosted = false,
}) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Calculate position synchronously from anchor so there is ZERO first-frame flicker ──
  const getPos = useCallback(() => {
    if (!anchorEl) return { top: -9999, right: -9999 };
    const rect = anchorEl.getBoundingClientRect();
    return {
      top: rect.bottom + 6, // fixed: relative to viewport already
      right: window.innerWidth - rect.right,
    };
  }, [anchorEl]);

  // Lazy initializer — runs once synchronously, no useEffect needed for first paint
  const [position, setPosition] = useState(getPos);

  // Recalculate on scroll / resize so the menu tracks the button
  useEffect(() => {
    const update = () => setPosition(getPos());
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [getPos]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const isSelf = currentUserId === user.id;

  const menu = (
    <>
      {/* Full-screen backdrop — sits below the menu */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} aria-hidden="true" />

      {/* Menu panel — portalled to body, positioned via fixed coords */}
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: position.top,
          right: position.right,
          zIndex: 9999,
        }}
        className="w-52 bg-theme-bg-secondary border border-theme-border rounded-2xl shadow-2xl py-2 flex flex-col gap-0.5 px-1"
      >
        <MenuItem
          icon={<RiExternalLinkLine size={16} />}
          label="View Apps"
          onClick={() => {
            onClose();
            navigate(`/apps?userId=${user.id}`);
          }}
        />

        <MenuDivider />

        {user.status === 'BANNED' && (
          <MenuItem
            icon={<RiCheckboxCircleLine size={16} />}
            label="Unban User"
            variant="success"
            disabled={isSelf}
            onClick={() => {
              onClose();
              onStatusChange(user.id, 'APPROVED');
            }}
          />
        )}

        {user.status !== 'BANNED' && (
          <MenuItem
            icon={<RiProhibitedLine size={16} />}
            label="Ban User"
            variant="danger"
            disabled={isSelf}
            onClick={() => {
              onClose();
              onStatusChange(user.id, 'BANNED');
            }}
          />
        )}

        <MenuItem
          icon={<RiFoldersLine size={16} />}
          label="Set App Limit"
          onClick={() => {
            onClose();
            onSetAppLimit(user);
          }}
        />

        <MenuItem
          icon={<RiAlertLine size={16} />}
          label="Send Warning"
          variant="warning"
          disabled={isSelf}
          onClick={() => {
            onClose();
            onSendWarning(user);
          }}
        />

        <MenuDivider />

        {user.role === 'ADMIN' && (
          <MenuItem
            icon={<RiShieldKeyholeLine size={16} />}
            label={user.can_manage_retention ? 'Revoke Auto-Delete' : 'Allow Auto-Delete'}
            onClick={() => {
              onClose();
              onToggleRetentionPerm(user);
            }}
          />
        )}

        {user.role !== 'SUPER_ADMIN' ? (
          <MenuItem
            icon={<RiShieldUserLine size={16} />}
            label="Make Super Admin"
            disabled={isSelf}
            onClick={() => {
              onClose();
              onRoleChange(user.id, 'SUPER_ADMIN');
            }}
          />
        ) : (
          <MenuItem
            icon={<RiUserUnfollowLine size={16} />}
            label="Remove Super Admin"
            disabled={isSelf}
            onClick={() => {
              onClose();
              onRoleChange(user.id, 'ADMIN');
            }}
          />
        )}

        {!isSelfHosted && (
          <>
            <MenuDivider />
            {user.enterprise_key ? (
              <MenuItem
                icon={<RiKeyLine size={16} />}
                label="Revoke Enterprise Key"
                variant="danger"
                onClick={() => {
                  onClose();
                  onRevokeEnterpriseKey?.(user);
                }}
              />
            ) : (
              <MenuItem
                icon={<RiKeyLine size={16} />}
                label={user.enterprise_key_requested ? "Approve License" : "Issue License"}
                variant={user.enterprise_key_requested ? "success" : "default"}
                onClick={() => {
                  onClose();
                  onApproveEnterpriseKey?.(user);
                }}
              />
            )}
          </>
        )}

        <MenuDivider />

        <MenuItem
          icon={<RiDeleteBinLine size={16} />}
          label="Delete User"
          variant="danger"
          disabled={isSelf}
          onClick={() => {
            onClose();
            onDelete(user);
          }}
        />
      </div>
    </>
  );

  return ReactDOM.createPortal(menu, document.body);
};
