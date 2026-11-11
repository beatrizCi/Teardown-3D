// Inline SVG icons (stroke = currentColor so they follow the button colour).
import type { SVGProps } from 'react';

const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
type P = SVGProps<SVGSVGElement>;

export const Logo = (p: P) => (
  <svg {...base} width={28} height={28} strokeWidth={1.6} {...p}>
    <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7Z" />
    <path d="M3.5 7 12 11.5 20.5 7M12 11.5v10" />
  </svg>
);
export const Play = (p: P) => (
  <svg width={22} height={22} viewBox="0 0 24 24" {...p}><path d="M7 4.5v15l12-7.5z" fill="currentColor" /></svg>
);
export const Pause = (p: P) => (
  <svg width={22} height={22} viewBox="0 0 24 24" {...p}>
    <rect x="6" y="4" width="3.4" height="16" rx="1.2" fill="currentColor" />
    <rect x="14.6" y="4" width="3.4" height="16" rx="1.2" fill="currentColor" />
  </svg>
);
export const Explode = (p: P) => (
  <svg {...base} {...p}><path d="M4 9V4h5M4 4l6 6M20 9V4h-5M20 4l-6 6M4 15v5h5M4 20l6-6M20 15v5h-5M20 20l-6-6" /></svg>
);
export const Tag = (p: P) => (
  <svg {...base} {...p}><path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8a1.4 1.4 0 0 1 0 2l-7.1 7.1a1.4 1.4 0 0 1-2 0Z" /><circle cx="8" cy="8" r="1.5" /></svg>
);
export const Scissors = (p: P) => (
  <svg {...base} {...p}><circle cx="6" cy="6" r="2.6" /><circle cx="6" cy="18" r="2.6" /><path d="M8.2 7.6 20 17M8.2 16.4 20 7" /></svg>
);
export const Rotate = (p: P) => (
  <svg {...base} {...p}><path d="M20 11a8 8 0 0 0-14.6-4.4M4 13a8 8 0 0 0 14.6 4.4" /><path d="M5 3v4h4M19 21v-4h-4" /></svg>
);
export const Focus = (p: P) => (
  <svg {...base} {...p}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><circle cx="12" cy="12" r="3" /></svg>
);
export const Chevron = ({ dir = 'right', ...p }: P & { dir?: 'right' | 'left' | 'up' | 'down' }) => {
  const d = { right: 'M9 5l7 7-7 7', left: 'M15 5l-7 7 7 7', up: 'M5 15l7-7 7 7', down: 'M5 9l7 7 7-7' }[dir];
  return <svg {...base} width={18} height={18} strokeWidth={2} {...p}><path d={d} /></svg>;
};
