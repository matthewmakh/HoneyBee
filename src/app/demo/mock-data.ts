export const MOCK = {
  referrerCompany: { name: 'ABC Realty', memberId: 'HB-000042' },
  providerCompany: { name: 'TyeNY Software Development', memberId: 'HB-000007' },
  homeowner: {
    name: 'Sarah Johnson',
    phone: '(555) 987-6543',
    address: '456 Oak Lane, Brooklyn, NY 11201',
  },
  category: 'Software Development',
  description:
    'Custom CRM application with client portal, automated invoicing, and reporting dashboard.',
  commission: { type: 'PERCENT' as const, value: 10 },
  estimatedJobValue: 25000,
  finalJobValue: 28500,
  calculatedCommission: 2850,
  cashSplit: 1425,
  benefitsSplit: 1140,
  platformSplit: 285,
} as const;

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
