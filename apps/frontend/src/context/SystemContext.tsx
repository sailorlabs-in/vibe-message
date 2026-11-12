import React, { createContext, useContext, useEffect, useState } from 'react';
import { systemService, PublicSystemSettings } from '../services/systemService';

interface SystemContextType {
  settings: PublicSystemSettings | null;
  isSelfHosted: boolean;
  hideForgotPassword: boolean;
  hideEmailVerification: boolean;
  loading: boolean;
}

const SystemContext = createContext<SystemContextType>({
  settings: null,
  isSelfHosted: false,
  hideForgotPassword: false,
  hideEmailVerification: false,
  loading: true,
});

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSelfHosted, setIsSelfHosted] = useState<boolean>(() => {
    return localStorage.getItem('is_self_hosted') === 'true';
  });

  const [settings, setSettings] = useState<PublicSystemSettings | null>(() => {
    const cached = localStorage.getItem('is_self_hosted');
    if (cached !== null) {
      return {
        is_self_hosted: cached === 'true',
        hide_forgot_password: false,
        hide_email_verification: false,
      };
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Synchronously ensure self-hosted class matches state immediately
  useEffect(() => {
    if (isSelfHosted) {
      document.documentElement.classList.add('self-hosted');
    } else {
      document.documentElement.classList.remove('self-hosted');
    }
  }, [isSelfHosted]);

  useEffect(() => {
    let mounted = true;
    systemService
      .getPublicSettings()
      .then((data) => {
        if (!mounted) return;
        setSettings(data);
        setIsSelfHosted(data.is_self_hosted);
        localStorage.setItem('is_self_hosted', String(data.is_self_hosted));
        if (data.is_self_hosted) {
          document.documentElement.classList.add('self-hosted');
        } else {
          document.documentElement.classList.remove('self-hosted');
        }
      })
      .catch((err) => {
        console.error('Failed to load public system settings:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SystemContext.Provider
      value={{
        settings,
        isSelfHosted,
        hideForgotPassword: settings?.hide_forgot_password ?? false,
        hideEmailVerification: settings?.hide_email_verification ?? false,
        loading,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
