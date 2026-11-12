import React from 'react';
import { addIcon, Icon as IconifyIcon, IconProps as IconifyProps } from '@iconify/react';
import solarData from './solar-icons-data.json';

// Pre-registered offline Solar icon definitions from @iconify-json/solar
const SOLAR_ICON_BODIES: Record<string, string> = solarData;

// Register all offline icons into @iconify/react for instantaneous rendering (no network required)
Object.entries(SOLAR_ICON_BODIES).forEach(([name, body]) => {
  addIcon(`solar:${name}`, {
    body,
    width: 24,
    height: 24,
  });
});

export interface SolarIconProps extends Omit<IconifyProps, 'icon'> {
  icon?: string;
  name?: string;
}

/**
 * SolarIcon component renders icons from @iconify-json/solar with zero latency.
 * Supports both `solar:name` or simply `name` as the icon identifier.
 */
export const SolarIcon: React.FC<SolarIconProps> = ({ icon, name, ...props }) => {
  const iconName =
    icon || (name ? (name.startsWith('solar:') ? name : `solar:${name}`) : 'solar:bell-bing-bold');
  return <IconifyIcon icon={iconName} {...props} />;
};

export { IconifyIcon as Icon };

/**
 * Standard preset icons for notification types, playground simulators, and UI status tags
 */
export const SOLAR_PRESETS = [
  { id: 'solar:bell-bing-bold', label: 'Notification' },
  { id: 'solar:rocket-2-bold', label: 'Deploy' },
  { id: 'solar:lock-password-bold', label: 'Security' },
  { id: 'solar:box-bold', label: 'Package' },
  { id: 'solar:bolt-bold', label: 'Instant' },
  { id: 'solar:confetti-minimalistic-bold', label: 'Celebration' },
  { id: 'solar:chat-round-dots-bold', label: 'Message' },
  { id: 'solar:star-bold', label: 'Favorite' },
  { id: 'solar:cup-first-bold', label: 'Achievement' },
] as const;

/**
 * Helper to render either a Solar icon (starts with 'solar:') or fallback text/emoji
 */
export const renderSolarOrCustom = (
  value: string | undefined | null,
  fallbackIcon: string = 'solar:bell-bing-bold',
  className: string = 'w-6 h-6'
): React.ReactNode => {
  const val = value?.trim();
  if (!val) {
    return <SolarIcon icon={fallbackIcon} className={className} />;
  }
  if (val.startsWith('solar:') || SOLAR_ICON_BODIES[val]) {
    const iconId = val.startsWith('solar:') ? val : `solar:${val}`;
    return <SolarIcon icon={iconId} className={className} />;
  }
  // If it's a short custom emoji or character
  return <span className={className}>{val}</span>;
};
