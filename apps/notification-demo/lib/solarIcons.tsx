'use client';

import React from 'react';
import { addIcon, Icon as IconifyIcon, IconProps as IconifyProps } from '@iconify/react';
import solarData from './solar-icons-data.json';

const SOLAR_BODIES: Record<string, string> = solarData;

Object.entries(SOLAR_BODIES).forEach(([name, body]) => {
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

export const SolarIcon: React.FC<SolarIconProps> = ({ icon, name, ...props }) => {
  const iconName =
    icon || (name ? (name.startsWith('solar:') ? name : `solar:${name}`) : 'solar:bell-bing-bold');
  return <IconifyIcon icon={iconName} {...props} />;
};

export { IconifyIcon as Icon };
