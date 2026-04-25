import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.27:3000/api';

export type HealthStatus = 'loading' | 'ok' | 'degraded' | 'error';

export interface HealthData {
  status: HealthStatus;
  checks?: {
    database?: { status: string };
    server?: { status: string; uptime: number; uptimeHuman: string };
    scheduler?: { status: string };
  };
  responseTimeMs?: number;
}

export const useHealthStatus = (pollIntervalMs = 30_000): HealthData => {
  const [health, setHealth] = useState<HealthData>({ status: 'loading' });

  const fetchHealth = async () => {
    const t0 = Date.now();
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      const json = await res.json();
      const responseTimeMs = Date.now() - t0;

      if (res.ok && json?.data?.status === 'ok') {
        setHealth({ status: 'ok', checks: json.data.checks, responseTimeMs });
      } else {
        setHealth({ status: 'degraded', checks: json?.data?.checks, responseTimeMs });
      }
    } catch {
      setHealth({ status: 'error' });
    }
  };

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, pollIntervalMs);
    return () => clearInterval(id);
  }, [pollIntervalMs]);

  return health;
};
