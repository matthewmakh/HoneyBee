/**
 * Club rules a new member agrees to one-by-one at enrollment.
 *
 * These are sensible placeholders — edit the wording / count freely. The
 * enrollment flow shows each as its own "I agree" checkbox, and stores a single
 * `agreedToRulesAt` timestamp on the member's company once all are accepted.
 */
export interface ClubRule {
  title: string;
  body: string;
}

export const CLUB_RULES: ClubRule[] = [
  {
    title: 'Honest representation',
    body: 'I will represent every A-Team product and the club truthfully, and never make guarantees or claims I cannot back up.',
  },
  {
    title: 'Real referrals only',
    body: 'I will only submit genuine referrals for real homeowners who have agreed to be contacted. No fake, duplicate, or self-referrals.',
  },
  {
    title: 'Protect customer information',
    body: 'I will keep homeowner and member information confidential and use it only to facilitate referrals through the club.',
  },
  {
    title: 'No pressure selling',
    body: 'I will respect customers and never use high-pressure, misleading, or deceptive tactics to win a referral.',
  },
  {
    title: 'Follow the do’s and don’ts',
    body: 'I will follow each A-Team’s posted do’s and don’ts when presenting their products.',
  },
  {
    title: 'Commissions are earned on completed jobs',
    body: 'I understand commissions are calculated and paid only after a job is completed and confirmed, per the club’s commission plan.',
  },
  {
    title: 'Respect the commission splits',
    body: 'I understand my earnings are part of a multi-line split shared with my upline, the club, member benefits, and the platform.',
  },
  {
    title: 'Treat the team with respect',
    body: 'I will treat my upline, downline, fellow members, and A-Team providers with professionalism and respect.',
  },
  {
    title: 'Comply with the law',
    body: 'I will follow all applicable laws and regulations, including those governing solicitation, privacy, and marketing.',
  },
  {
    title: 'Club standards may evolve',
    body: 'I understand the club may update these standards and the commission plan, and that continued participation means I accept the current rules.',
  },
];
