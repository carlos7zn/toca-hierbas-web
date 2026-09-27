'use client';

import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'neon' | 'success' | 'warning' | 'danger' | 'game';
  game?: string;
  size?: 'sm' | 'md';
}

const variants = {
  default: 'bg-surface-tertiary text-text-secondary border border-border',
  neon: 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30',
  success: 'bg-green-500/10 text-green-400 border border-green-500/30',
  warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/30',
  game: 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ className, variant = 'default', game, size = 'md', children, ...props }: BadgeProps) {
  const gameColors: Record<string, string> = {
    'assetto-corsa': 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30',
    acc: 'bg-neon-magenta/10 text-neon-magenta border-neon-magenta/30',
    beamng: 'bg-neon-orange/10 text-neon-orange border-neon-orange/30',
    'gta-v': 'bg-neon-green/10 text-neon-green border-neon-green/30',
    minecraft: 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30',
    other: 'bg-surface-tertiary text-text-secondary border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium rounded-full border-hairline',
        variant === 'game' && game ? gameColors[game] : variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}