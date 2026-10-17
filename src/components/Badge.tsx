import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  tone?: 'available' | 'unavailable' | 'muted' | 'rating' | 'count';
}

export function Badge({ children, tone = 'muted' }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
