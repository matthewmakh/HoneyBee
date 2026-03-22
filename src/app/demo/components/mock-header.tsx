'use client';

import type { ActorRole } from '../use-demo-engine';

interface MockHeaderProps {
  role: ActorRole;
  companyName?: string;
}

const roleConfig = {
  referrer: {
    label: 'Referrer Portal',
    bgColor: 'bg-blue-600',
    textColor: 'text-blue-50',
    company: 'ABC Realty',
    memberId: 'HB-000042',
  },
  provider: {
    label: 'Provider Portal',
    bgColor: 'bg-emerald-600',
    textColor: 'text-emerald-50',
    company: 'TyeNY Software Development',
    memberId: 'HB-000007',
  },
  admin: {
    label: 'Admin Dashboard',
    bgColor: 'bg-purple-600',
    textColor: 'text-purple-50',
    company: 'System Admin',
    memberId: '',
  },
};

export function MockHeader({ role, companyName }: MockHeaderProps) {
  if (!role) return null;

  const config = roleConfig[role];
  const displayCompany = companyName || config.company;

  return (
    <div
      className={`w-full ${config.bgColor} ${config.textColor} px-4 py-3 flex items-center justify-between rounded-t-lg transition-colors duration-500`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold text-lg">
          <span>HB</span>
        </div>
        <div className="h-5 w-px bg-white/30" />
        <span className="text-sm font-medium opacity-90">{config.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium">{displayCompany}</div>
          {config.memberId && (
            <div className="text-xs opacity-70">{config.memberId}</div>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
          {displayCompany[0]}
        </div>
      </div>
    </div>
  );
}
