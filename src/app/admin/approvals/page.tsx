import { requireSuperAdmin } from '@/lib/auth';
import { 
  getPendingProviderApplications, 
  getPendingPriceChangeRequests, 
  getPendingWithdrawals, 
  getPendingDeals 
} from '@/lib/services/admin';
import { PendingApprovalsList } from './pending-list';

export default async function AllPendingPage() {
  await requireSuperAdmin();

  const [
    providerApplications,
    priceChangeRequests,
    withdrawalRequests,
    pendingDeals,
  ] = await Promise.all([
    getPendingProviderApplications(),
    getPendingPriceChangeRequests(),
    getPendingWithdrawals(),
    getPendingDeals(),
  ]);

  // Serialize Decimal fields
  const serializedApplications = providerApplications.map((app) => ({
    ...app,
    cashBalance: Number(app.cashBalance),
    benefitsBalance: Number(app.benefitsBalance),
    providerProfile: app.providerProfile ? {
      ...app.providerProfile,
      commissionValue: Number(app.providerProfile.commissionValue),
    } : null,
  }));

  const serializedPriceChanges = priceChangeRequests.map((req) => ({
    ...req,
    currentPrice: Number(req.currentPrice),
    requestedPrice: Number(req.requestedPrice),
    lead: {
      ...req.lead,
      estimatedJobValue: req.lead.estimatedJobValue ? Number(req.lead.estimatedJobValue) : null,
      reportedJobValue: req.lead.reportedJobValue ? Number(req.lead.reportedJobValue) : null,
      calculatedCommission: req.lead.calculatedCommission ? Number(req.lead.calculatedCommission) : null,
      commissionValueSnapshot: Number(req.lead.commissionValueSnapshot),
    },
  }));

  const serializedWithdrawals = withdrawalRequests.map((req) => ({
    ...req,
    amount: Number(req.amount),
    company: {
      ...req.company,
      cashBalance: Number(req.company.cashBalance),
    },
  }));

  const serializedDeals = pendingDeals.map((deal) => ({
    ...deal,
    estimatedJobValue: deal.estimatedJobValue ? Number(deal.estimatedJobValue) : null,
    reportedJobValue: deal.reportedJobValue ? Number(deal.reportedJobValue) : null,
    calculatedCommission: deal.calculatedCommission ? Number(deal.calculatedCommission) : null,
    commissionValueSnapshot: Number(deal.commissionValueSnapshot),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
        <p className="text-muted-foreground">
          All items awaiting your review and approval
        </p>
      </div>
      
      <PendingApprovalsList 
        providerApplications={serializedApplications}
        priceChangeRequests={serializedPriceChanges}
        withdrawalRequests={serializedWithdrawals}
        pendingDeals={serializedDeals}
      />
    </div>
  );
}
