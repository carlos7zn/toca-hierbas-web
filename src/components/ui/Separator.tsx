'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'w-full h-[0.5px]' : 'h-full w-[0.5px]',
        className
      )}
      {...props}
    />
  )
);

Separator.displayName = 'Separator';

export function SectionDivider({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('flex items-center gap-4 w-full', className)}>
      <Separator />
      {children && <span className="text-text-muted font-mono text-xs uppercase tracking-wider">{children}</span>}
      <Separator />
    </div>
  );
}