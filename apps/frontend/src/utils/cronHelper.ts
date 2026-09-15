export interface CronPreset {
  label: string;
  value: string;
  description: string;
  category: 'frequent' | 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export interface CronCategory {
  id: 'frequent' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  name: string;
}

export const CRON_CATEGORIES: CronCategory[] = [
  { id: 'frequent', name: 'Minutes' },
  { id: 'hourly', name: 'Hourly' },
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
];

export const CRON_PRESETS: CronPreset[] = [
  // Frequent / Minutes
  { label: 'Every minute', value: '* * * * *', description: 'Triggers every single minute', category: 'frequent' },
  { label: 'Every 2 mins', value: '*/2 * * * *', description: 'Triggers every 2 minutes', category: 'frequent' },
  { label: 'Every 5 mins', value: '*/5 * * * *', description: 'Triggers every 5 minutes', category: 'frequent' },
  { label: 'Every 10 mins', value: '*/10 * * * *', description: 'Triggers every 10 minutes', category: 'frequent' },
  { label: 'Every 15 mins', value: '*/15 * * * *', description: 'Triggers every 15 minutes', category: 'frequent' },
  { label: 'Every 30 mins', value: '*/30 * * * *', description: 'Triggers every 30 minutes', category: 'frequent' },

  // Hourly
  { label: 'Every hour', value: '0 * * * *', description: 'At minute 0 of every hour', category: 'hourly' },
  { label: 'Every 2 hours', value: '0 */2 * * *', description: 'At minute 0 every 2 hours', category: 'hourly' },
  { label: 'Every 3 hours', value: '0 */3 * * *', description: 'At minute 0 every 3 hours', category: 'hourly' },
  { label: 'Every 6 hours', value: '0 */6 * * *', description: 'Every 6 hours (00, 06, 12, 18)', category: 'hourly' },
  { label: 'Every 12 hours', value: '0 */12 * * *', description: 'Twice daily at 00:00 and 12:00', category: 'hourly' },

  // Daily
  { label: 'Midnight (00:00)', value: '0 0 * * *', description: 'Daily at 00:00 UTC', category: 'daily' },
  { label: 'Morning (06:00)', value: '0 6 * * *', description: 'Daily at 06:00 AM UTC', category: 'daily' },
  { label: 'Start of Day (09:00)', value: '0 9 * * *', description: 'Daily at 09:00 AM UTC', category: 'daily' },
  { label: 'Noon (12:00)', value: '0 12 * * *', description: 'Daily at 12:00 PM UTC', category: 'daily' },
  { label: 'Evening (18:00)', value: '0 18 * * *', description: 'Daily at 06:00 PM UTC', category: 'daily' },
  { label: 'Night (21:00)', value: '0 21 * * *', description: 'Daily at 09:00 PM UTC', category: 'daily' },

  // Weekly
  { label: 'Every Monday (00:00)', value: '0 0 * * 1', description: 'Weekly on Monday at 00:00 UTC', category: 'weekly' },
  { label: 'Every Friday (17:00)', value: '0 17 * * 5', description: 'Weekly on Friday at 05:00 PM UTC', category: 'weekly' },
  { label: 'Every Sunday (00:00)', value: '0 0 * * 0', description: 'Weekly on Sunday at 00:00 UTC', category: 'weekly' },
  { label: 'Weekdays (Mon–Fri 09:00)', value: '0 9 * * 1-5', description: 'Monday to Friday at 09:00 AM UTC', category: 'weekly' },
  { label: 'Weekends (Sat–Sun 00:00)', value: '0 0 * * 6,0', description: 'Saturday and Sunday at 00:00 UTC', category: 'weekly' },

  // Monthly
  { label: '1st of Month (00:00)', value: '0 0 1 * *', description: 'Monthly on the 1st at 00:00 UTC', category: 'monthly' },
  { label: '15th of Month (00:00)', value: '0 0 15 * *', description: 'Monthly on the 15th at 00:00 UTC', category: 'monthly' },
  { label: 'End of Month (28th)', value: '0 0 28 * *', description: 'Monthly on the 28th at 00:00 UTC', category: 'monthly' },
  { label: 'Quarterly (Jan, Apr, Jul, Oct)', value: '0 0 1 1,4,7,10 *', description: '1st day of every quarter at 00:00 UTC', category: 'monthly' },
  { label: 'Yearly (Jan 1st)', value: '0 0 1 1 *', description: 'Once a year on January 1st at 00:00 UTC', category: 'monthly' },
];

const DAYS_MAP: Record<string, string> = {
  '0': 'Sunday',
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
  '7': 'Sunday',
};

export function describeCron(expression: string): string {
  if (!expression) return '';
  const trimmed = expression.trim();

  const preset = CRON_PRESETS.find((p) => p.value === trimmed);
  if (preset) return `${preset.label} — ${preset.description}`;

  const parts = trimmed.split(/\s+/);
  if (parts.length < 5) return 'Invalid expression (requires 5 parts: minute hour day month day-of-week)';

  const [min, hour, dom, mon, dow] = parts;

  // Every minute
  if (min === '*' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    return 'Every minute';
  }

  // Every N minutes
  if (min.startsWith('*/') && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    return `Every ${min.replace('*/', '')} minutes`;
  }

  // Hourly
  if (min !== '*' && !min.includes('/') && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    return `Every hour at minute ${min}`;
  }

  // Every N hours
  if (min !== '*' && hour.startsWith('*/') && dom === '*' && mon === '*' && dow === '*') {
    return `Every ${hour.replace('*/', '')} hours at minute ${min}`;
  }

  // Daily at specific time
  if (min !== '*' && hour !== '*' && !hour.includes('/') && !hour.includes(',') && dom === '*' && mon === '*' && dow === '*') {
    const hh = hour.padStart(2, '0');
    const mm = min.padStart(2, '0');
    return `Daily at ${hh}:${mm} UTC`;
  }

  // Weekdays
  if (min !== '*' && hour !== '*' && dom === '*' && mon === '*' && (dow === '1-5' || dow === 'MON-FRI')) {
    const hh = hour.padStart(2, '0');
    const mm = min.padStart(2, '0');
    return `Every weekday (Mon–Fri) at ${hh}:${mm} UTC`;
  }

  // Specific day of week
  if (min !== '*' && hour !== '*' && dom === '*' && mon === '*' && DAYS_MAP[dow]) {
    const hh = hour.padStart(2, '0');
    const mm = min.padStart(2, '0');
    return `Every ${DAYS_MAP[dow]} at ${hh}:${mm} UTC`;
  }

  // Monthly on specific day
  if (min !== '*' && hour !== '*' && dom !== '*' && !dom.includes('/') && mon === '*' && dow === '*') {
    const hh = hour.padStart(2, '0');
    const mm = min.padStart(2, '0');
    return `Monthly on day ${dom} at ${hh}:${mm} UTC`;
  }

  return `Custom Schedule (${trimmed})`;
}

export function isValidCron(expression: string): boolean {
  if (!expression) return false;
  const parts = expression.trim().split(/\s+/);
  return parts.length === 5 || parts.length === 6;
}
