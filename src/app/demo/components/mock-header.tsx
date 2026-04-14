'use client';

import type { ActorRole } from '../use-demo-engine';

interface MockHeaderProps {
  role: ActorRole;
  companyName?: string;
}

const roleConfig = {
  referrer: {
    label: 'Bee Team · Referrer',
    bgColor: 'bg-blue-600',
    textColor: 'text-blue-50',
    company: 'Riley Martinez',
    memberId: 'HB-000156',
  },
  provider: {
    label: 'A-Team · Provider',
    bgColor: 'bg-emerald-600',
    textColor: 'text-emerald-50',
    company: 'Sunshine Solar Co',
    memberId: 'HB-P-00011',
  },
  admin: {
    label: 'Club Admin',
    bgColor: 'bg-purple-600',
    textColor: 'text-purple-50',
    company: 'Bee Club HQ',
    memberId: 'HB-000001',
  },
  public: {
    label: 'honeybee.app / p / sunshine-solar-co',
    bgColor: 'bg-slate-900',
    textColor: 'text-slate-50',
    company: 'Public Page',
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
