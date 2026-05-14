'use client';

import type { ActorRole } from '../use-demo-engine';

interface MockHeaderProps {
  role: ActorRole;
  companyName?: string;
}

const roleConfig = {
  referrer: {
    eyebrow: 'Bee Team · Referrer',
    chipLabel: 'REFERRER VIEW',
    chip: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    eyebrowColor: 'text-amber-400',
    initialBg: 'bg-amber-500/20 text-amber-300',
    company: 'Riley Martinez',
    memberId: 'HB-000156',
  },
  provider: {
    eyebrow: 'A-Team · Provider',
    chipLabel: 'PROVIDER VIEW',
    chip: 'bg-yellow-400/15 text-yellow-200 border-yellow-400/30',
    eyebrowColor: 'text-yellow-300',
    initialBg: 'bg-yellow-500/20 text-yellow-200',
    company: 'Sunshine Solar Co',
    memberId: 'HB-P-00011',
  },
  admin: {
    eyebrow: 'Club Admin',
    chipLabel: 'ADMIN VIEW',
    chip: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    eyebrowColor: 'text-orange-300',
    initialBg: 'bg-orange-500/20 text-orange-300',
    company: 'Bee Club HQ',
    memberId: 'HB-000001',
  },
  public: {
    eyebrow: 'honeybee.app/p/sunshine-solar-co',
    chipLabel: 'PUBLIC PAGE',
    chip: 'bg-stone-700/40 text-stone-300 border-stone-700/60',
    eyebrowColor: 'text-stone-400',
    initialBg: 'bg-stone-700 text-stone-300',
    company: 'Public Catalogue',
    memberId: '',
  },
};

export function MockHeader({ role, companyName }: MockHeaderProps) {
  if (!role) return null;

  const config = roleConfig[role];
  const displayCompany = companyName || config.company;

  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className={`text-[11px] uppercase tracking-widest ${config.eyebrowColor} font-medium`}>{config.eyebrow}</p>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${config.chip}`}>
            {config.chipLabel}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-white">{displayCompany}</p>
          {config.memberId && (
            <p className="text-[10px] text-stone-500 tabular-nums">{config.memberId}</p>
          )}
        </div>
        <div className={`w-8 h-8 rounded-full ${config.initialBg} flex items-center justify-center text-xs font-bold`}>
          {displayCompany[0]}
        </div>
      </div>
    </div>
  );
}
