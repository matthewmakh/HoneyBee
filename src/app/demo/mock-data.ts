// Mock data for the Bee Club MLM walkthrough.
// A single closed referral splits across 12 payout lines. Numbers are chosen
// so every line shows up as a non-trivial dollar amount.

export const MOCK = {
  referrer: {
    name: 'Riley Martinez',
    memberId: 'HB-000156',
    teamRole: 'Bee Member',
    joinedYear: 2024,
  },
  l1Manager: { name: 'Alex Chen',    memberId: 'HB-000042', teamRole: 'L-1 Manager' },
  l2Manager: { name: 'Jordan Lee',   memberId: 'HB-000018', teamRole: 'L-2 Manager' },
  l3Manager: { name: 'Dana Kim',     memberId: 'HB-000007', teamRole: 'L-3 Manager' },
  clubAdmin: { name: 'Bee Club HQ',  memberId: 'HB-000001', teamRole: 'Club Admin' },
  originalSponsor: {
    name: 'Morgan Torres',
    memberId: 'HB-000033',
    note: 'Sponsored Riley in 2024 — earns 1% forever',
  },
  provider: {
    name: 'Sunshine Solar Co',
    memberId: 'HB-P-00011',
    slug: 'sunshine-solar-co',
  },
  homeowner: {
    name: 'Sarah Johnson',
    address: '456 Oak Lane, Brooklyn, NY 11201',
    phone: '(555) 987-6543',
  },
  project: {
    category: 'Solar + Battery',
    description: 'Whole-home solar install with backup battery and panel upgrade.',
  },
  commission: {
    offeredPct: 8,
    jobValue: 42000,
    total: 3360,
  },
  // 12-line split — totals to $3,360 (100%)
  lines: [
    { key: 'DIRECT_REFERRER',           label: 'Direct Referrer',            bps: 4000, amount: 1344.0,  beneficiary: 'Riley Martinez',  role: 'Bee Member',    color: 'emerald' },
    { key: 'L1_MANAGER',                label: 'L-1 Manager Override',       bps: 1000, amount: 336.0,   beneficiary: 'Alex Chen',       role: 'L-1 Manager',   color: 'sky'     },
    { key: 'L2_MANAGER',                label: 'L-2 Manager Override',       bps: 500,  amount: 168.0,   beneficiary: 'Jordan Lee',      role: 'L-2 Manager',   color: 'indigo'  },
    { key: 'L3_MANAGER',                label: 'L-3 Manager Override',       bps: 300,  amount: 100.8,   beneficiary: 'Dana Kim',        role: 'L-3 Manager',   color: 'violet'  },
    { key: 'CLUB_ADMIN',                label: 'Club Admin Fee',             bps: 500,  amount: 168.0,   beneficiary: 'Bee Club HQ',     role: 'Club Admin',    color: 'purple'  },
    { key: 'ORIGINAL_SPONSOR_LIFETIME', label: 'Lifetime 1% Sponsor',        bps: 100,  amount: 33.6,    beneficiary: 'Morgan Torres',   role: 'Sponsor',       color: 'amber'   },
    { key: 'POOL_BONUS_1',              label: 'Rank Pool',                  bps: 300,  amount: 100.8,   beneficiary: 'Rank Pool',       role: 'Pool',          color: 'teal'    },
    { key: 'POOL_BONUS_2',              label: 'Leadership Pool',            bps: 200,  amount: 67.2,    beneficiary: 'Leadership Pool', role: 'Pool',          color: 'teal'    },
    { key: 'POOL_BONUS_3',              label: 'Customer Credit (Benefits)', bps: 1500, amount: 504.0,   beneficiary: 'Riley (Benefits)', role: 'Bee Member',   color: 'cyan'    },
    { key: 'POOL_BONUS_4',              label: 'Growth Pool',                bps: 100,  amount: 33.6,    beneficiary: 'Growth Pool',     role: 'Pool',          color: 'teal'    },
    { key: 'POOL_BONUS_5',              label: 'Events / Training',          bps: 100,  amount: 33.6,    beneficiary: 'Events Pool',     role: 'Pool',          color: 'teal'    },
    { key: 'PROVIDER_FEE_OFFSET',       label: 'Platform',                   bps: 1400, amount: 470.4,   beneficiary: 'Platform',        role: 'Platform',      color: 'slate'   },
  ],
} as const;

export type MockLine = (typeof MOCK.lines)[number];

export function formatMoney(amount: number, opts: { cents?: boolean } = {}): string {
  const { cents = false } = opts;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(amount);
}

export function pct(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`;
}
