import React from 'react';

export const Pending: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary transition-colors duration-300">
      <div className="max-w-md w-full text-center p-8 bg-theme-bg-secondary rounded-xl border border-theme-border shadow-md">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold mb-4 text-theme-text-primary">Account Pending Approval</h2>
        <p className="text-theme-text-secondary mb-6 font-medium">
          Your account has been created successfully. Please wait for a super admin
          to approve your account before you can create apps and send notifications.
        </p>
        <p className="text-sm text-theme-text-muted">
          You will be notified once your account is approved.
        </p>
      </div>
    </div>
  );
};
