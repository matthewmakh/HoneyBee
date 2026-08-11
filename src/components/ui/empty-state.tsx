import Image from 'next/image';
import { cn } from '@/lib/utils';

export type EmptyStateArt = 'leads' | 'referrals' | 'wallet' | 'search';

const ART: Record<EmptyStateArt, string> = {
  leads: '/illustrations/empty-leads.svg',
  referrals: '/illustrations/empty-referrals.svg',
  wallet: '/illustrations/empty-wallet.svg',
  search: '/illustrations/empty-search.svg',
};

type EmptyStateProps = {
  art: EmptyStateArt;
  title: string;
  description?: string;
  /** Optional call to action rendered beneath the copy. */
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ art, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-14 text-center',
        className
      )}
    >
      <Image
        src={ART[art]}
        alt=""
        width={220}
        height={162}
        className="h-32 w-auto opacity-90"
      />
      <h3 className="mt-5 text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
