'use client';

import { User, Briefcase, Shield } from 'lucide-react';
import type { ActorRole } from '../use-demo-engine';

interface RoleBadgeProps {
  role: ActorRole;
}

const roleConfig = {
  referrer: {
    label: 'Referrer',
    bgColor: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: User,
  },
  provider: {
    label: 'Provider',
    bgColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: Briefcase,
  },
  admin: {
    label: 'Admin',
    bgColor: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Shield,
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  if (!role) return null;

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <div className="absolute top-4 left-4 z-30 animate-demo-fade-in">
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-300 ${config.bgColor}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </div>
    </div>
  );
}
