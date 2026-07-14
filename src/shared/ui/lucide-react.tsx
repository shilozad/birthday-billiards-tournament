import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const Icon = ({ size = 24, children, ...props }: IconProps) => (
  <svg aria-hidden="true" fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" width={size} {...props}>
    {children}
  </svg>
);

export const LockKeyhole = (props: IconProps) => <Icon {...props}><rect height="11" rx="2" width="16" x="4" y="11" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /><path d="M12 15v2" /></Icon>;
export const ShieldCheck = (props: IconProps) => <Icon {...props}><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z" /><path d="m9 12 2 2 4-4" /></Icon>;
export const X = (props: IconProps) => <Icon {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Icon>;
export const Pencil = (props: IconProps) => <Icon {...props}><path d="M21 7 17 3 4 16l-1 5 5-1z" /><path d="m14 6 4 4" /></Icon>;
export const Trash2 = (props: IconProps) => <Icon {...props}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></Icon>;
export const Trophy = (props: IconProps) => <Icon {...props}><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v7a5 5 0 0 1-10 0z" /><path d="M5 5H3v3a4 4 0 0 0 4 4" /><path d="M19 5h2v3a4 4 0 0 1-4 4" /></Icon>;
export const CheckCircle2 = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></Icon>;
export const Send = (props: IconProps) => <Icon {...props}><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></Icon>;
export const UserPlus = (props: IconProps) => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" /></Icon>;
export const GitBranch = (props: IconProps) => <Icon {...props}><line x1="6" x2="6" y1="3" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></Icon>;
export const Sparkles = (props: IconProps) => <Icon {...props}><path d="m12 3-1.9 5.8L4 11l6.1 2.2L12 19l1.9-5.8L20 11l-6.1-2.2z" /><path d="M5 3v4" /><path d="M3 5h4" /><path d="M19 17v4" /><path d="M17 19h4" /></Icon>;
export const CalendarHeart = (props: IconProps) => <Icon {...props}><path d="M8 2v4" /><path d="M16 2v4" /><rect height="18" rx="2" width="18" x="3" y="4" /><path d="M3 10h18" /><path d="M12 18s-3-1.7-3-4a2 2 0 0 1 3-1.2A2 2 0 0 1 15 14c0 2.3-3 4-3 4" /></Icon>;
export const PartyPopper = (props: IconProps) => <Icon {...props}><path d="M5.8 11.3 2 22l10.7-3.8" /><path d="m4 20 7-7" /><path d="M15 4h.01" /><path d="M22 6h.01" /><path d="M18 13h.01" /><path d="m16 8 2-2" /><path d="m22 12-2-1" /></Icon>;
export const UsersRound = (props: IconProps) => <Icon {...props}><path d="M18 21a8 8 0 0 0-16 0" /><circle cx="10" cy="8" r="5" /><path d="M22 20c0-3-1.5-5.5-4-7" /><path d="M17 3a5 5 0 0 1 0 10" /></Icon>;
