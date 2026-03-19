'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, CardContent } from '@/components/ui';
import { approveApplicationAction, rejectApplicationAction } from './actions';
import { getInitials } from '@/lib/utils';
import { CheckCircle, XCircle, Building2 } from 'lucide-react';
import type { CompanyWithProfile } from '@/lib/types';

interface ApplicationsListProps {
  companies: CompanyWithProfile[];
}

export function ApplicationsList({ companies: initialCompanies }: ApplicationsListProps) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleApprove(companyId: string) {
    setLoading(companyId);
    const result = await approveApplicationAction(companyId);
    if (result.success) {
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
    } else {
      alert(result.error);
    }
    setLoading(null);
  }

  async function handleReject(companyId: string) {
    if (!confirm('Reject this provider application? The company will keep referrer access if they have it.')) return;
    setLoading(companyId);
    const result = await rejectApplicationAction(companyId);
    if (result.success) {
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
    } else {
      alert(result.error);
    }
    setLoading(null);
  }

  if (companies.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">No pending applications</p>
        <p className="text-sm text-muted-foreground mt-1">All provider applications have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <Card key={company.id} className="flex flex-col">
          <CardContent className="pt-6 flex-1 space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={company.logoUrl ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(company.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold truncate">{company.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{company.memberId}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Applied {new Date(company.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-1 flex-wrap">
              <Badge variant="outline" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                Provider Application
              </Badge>
              {company.canUseReferrerPortal && (
                <Badge variant="secondary" className="text-xs">Also Referrer</Badge>
              )}
            </div>

            {company.providerProfile && (
              <div className="text-sm text-muted-foreground space-y-1 border rounded-md p-3 bg-muted/30">
                <p className="font-medium text-foreground text-xs">Profile Info</p>
                <p className="text-xs">{company.providerProfile.shortDescription}</p>
                <p className="text-xs">ZIP: {company.providerProfile.zipCode}</p>
                <p className="text-xs">Categories: {company.providerProfile.serviceCategories.join(', ')}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleApprove(company.id)}
                disabled={loading === company.id}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive"
                onClick={() => handleReject(company.id)}
                disabled={loading === company.id}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
