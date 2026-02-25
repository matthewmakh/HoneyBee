import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getProviderProfile } from '@/lib/services/providers';
import { SubmitLeadForm } from './submit-lead-form';
import { Card, CardDescription, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface PageProps {
  params: Promise<{ providerId: string }>;
}

export default async function SubmitLeadPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.company.canUseReferrerPortal && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const { providerId } = await params;
  const provider = await getProviderProfile(providerId);

  if (!provider || !provider.isPublished || provider.company.isSuspended) {
    notFound();
  }

  // Prevent self-referral
  if (provider.companyId === session.user.companyId) {
    redirect('/dashboard/referrer/providers');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submit Referral</h1>
        <p className="text-muted-foreground">
          Send a lead to {provider.company.name}
        </p>
      </div>

      {/* Provider Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{provider.company.name}</CardTitle>
              <CardDescription>{provider.company.memberId}</CardDescription>
            </div>
            <Badge variant="outline">
              {provider.commissionType === 'PERCENT'
                ? `${Number(provider.commissionValue)}%`
                : formatCurrency(Number(provider.commissionValue))}{' '}
              commission
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {provider.shortDescription}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {provider.serviceCategories.map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Lead Form */}
      <SubmitLeadForm
        providerCompanyId={providerId}
        categories={provider.serviceCategories}
      />
    </div>
  );
}
