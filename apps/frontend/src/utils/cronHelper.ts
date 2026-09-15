export interface CronPreset {
  label: string;
  value: string;
  description: string;
}

export const CRON_PRESETS: CronPreset[] = [
  { label: 'Every minute', value: '* * * * *', description: 'Triggers every single minute' },
  { label: 'Every 5 mins', value: '*/5 * * * *', description: 'Triggers every 5 minutes' },
  { label: 'Every 15 mins', value: '*/15 * * * *', description: 'Triggers every 15 minutes' },
  { label: 'Every 30 mins', value: '*/30 * * * *', description: 'Triggers every 30 minutes' },
  { label: 'Hourly', value: '0 * * * *', description: 'Triggers at the start of every hour' },
  { label: 'Every 6 hours', value: '0 */6 * * *', description: 'Triggers every 6 hours' },
  { label: 'Every 12 hours', value: '0 */12 * * *', description: 'Triggers twice a day' },
  { label: 'Daily (00:00)', value: '0 0 * * *', description: 'Triggers every day at midnight (UTC)' },
  { label: 'Daily (12:00)', value: '0 12 * * *', description: 'Triggers every day at noon (UTC)' },
  { label: 'Weekly (Sun)', value: '0 0 * * 0', description: 'Triggers weekly on Sunday at midnight' },
];

export function describeCron(expression: string): string {
  if (!expression) return '';
  const trimmed = expression.trim();

  const preset = CRON_PRESETS.find((p) => p.value === trimmed);
  if (preset) return `${preset.label} (${preset.description})`;

  const parts = trimmed.split(/\s+/);
  if (parts.length < 5) return 'Invalid expression (needs 5 parts)';

  const [min, hour, dom, mon, dow] = parts;

  if (min.startsWith('*/') && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    return `Every ${min.replace('*/', '')} minutes`;
  }
  if (min === '0' && hour.startsWith('*/') && dom === '*' && mon === '*' && dow === '*') {
    return `Every ${hour.replace('*/', '')} hours`;
  }
  if (min === '0' && hour !== '*' && dom === '*' && mon === '*' && dow === '*') {
    return `Daily at ${hour.padStart(2, '0')}:00 UTC`;
  }

  return `Custom: ${trimmed}`;
}

export function isValidCron(expression: string): boolean {
  if (!expression) return false;
  const parts = expression.trim().split(/\s+/);
  return parts.length === 5 || parts.length === 6;
}
