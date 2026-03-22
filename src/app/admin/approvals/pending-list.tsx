'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Textarea,
  Label,
} from '@/components/ui';
import { 
  Building2, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  Briefcase,
  Edit3,
  Wallet,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  approveProviderApplicationAction,
  rejectProviderApplicationAction,
  approvePriceChangeRequestAction,
  rejectPriceChangeRequestAction,
  approveWithdrawalRequestAction,
  rejectWithdrawalRequestAction,
  confirmDealAction,
  rejectDealAction,
} from './actions';

interface ProviderApplication {
  id: string;
  name: string;
  memberId: string;
  createdAt: Date;
  users: Array<{ id: string; name: string; email: string; phone: string | null }>;
  providerProfile: {
    zipCode: string;
    serviceCategories: string[];
    shortDescription: string;
    commissionType: string;
    commissionValue: number;
  } | null;
}

interface PriceChangeRequest {
  id: string;
  currentPrice: number;
  requestedPrice: number;
  reason: string;
  createdAt: Date;
  requestedByName: string;
  lead: {
    id: string;
    homeownerName: string;
    category: string;
    providerCompany: { id: string; name: string; memberId: string };
    referrerCompany: { id: string; name: string; memberId: string };
  };
  requestedByCompany: { id: string; name: string; memberId: string };
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  createdAt: Date;
  company: {
    id: string;
    name: string;
    memberId: string;
    cashBalance: number;
  };
}

interface PendingDeal {
  id: string;
  homeownerName: string;
  homeownerPhone: string;
  homeownerAddress: string;
  projectDescription: string;
  category: string;
  reportedJobValue: number | null;
  calculatedCommission: number | null;
  commissionTypeSnapshot: string;
  commissionValueSnapshot: number;
  updatedAt: Date;
  providerCompany: { id: string; name: string; memberId: string };
  referrerCompany: { id: string; name: string; memberId: string };
}

interface PendingApprovalsListProps {
  providerApplications: ProviderApplication[];
  priceChangeRequests: PriceChangeRequest[];
  withdrawalRequests: WithdrawalRequest[];
  pendingDeals: PendingDeal[];
}

export function PendingApprovalsList({
  providerApplications,
  priceChangeRequests,
  withdrawalRequests,
  pendingDeals,
}: PendingApprovalsListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const totalPending = 
    providerApplications.length + 
    priceChangeRequests.length + 
    withdrawalRequests.length + 
    pendingDeals.length;

  const handleAction = async (action: () => Promise<{ success: boolean; error?: string }>, id: string) => {
    setProcessingId(id);
    const result = await action();
    if (!result.success) {
      alert(result.error || 'Action failed');
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-muted-foreground">Total Pending</p>
          </CardContent>
        </Card>
        <Card className={providerApplications.length > 0 ? 'border-yellow-500' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-yellow-600" />
              <div className="text-2xl font-bold">{providerApplications.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Provider Apps</p>
          </CardContent>
        </Card>
        <Card className={priceChangeRequests.length > 0 ? 'border-blue-500' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold">{priceChangeRequests.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Price Changes</p>
          </CardContent>
        </Card>
        <Card className={withdrawalRequests.length > 0 ? 'border-green-500' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold">{withdrawalRequests.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Withdrawals</p>
          </CardContent>
        </Card>
        <Card className={pendingDeals.length > 0 ? 'border-purple-500' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-purple-600" />
              <div className="text-2xl font-bold">{pendingDeals.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Deal Confirms</p>
          </CardContent>
        </Card>
      </div>

      {totalPending === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">All caught up!</h3>
            <p className="text-muted-foreground">No pending approvals at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={
          providerApplications.length > 0 ? 'applications' :
          pendingDeals.length > 0 ? 'deals' :
          priceChangeRequests.length > 0 ? 'prices' : 'withdrawals'
        }>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications" className="relative">
              Applications
              {providerApplications.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">{providerApplications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="deals" className="relative">
              Deals
              {pendingDeals.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">{pendingDeals.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="prices" className="relative">
              Prices
              {priceChangeRequests.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">{priceChangeRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="relative">
              Withdrawals
              {withdrawalRequests.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">{withdrawalRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Provider Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            {providerApplications.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending provider applications
                </CardContent>
              </Card>
            ) : (
              providerApplications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {app.name}
                        </CardTitle>
                        <CardDescription>{app.memberId}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    {app.users[0] && (
                      <div className="text-sm">
                        <p><strong>Contact:</strong> {app.users[0].name}</p>
                        <p><strong>Email:</strong> {app.users[0].email}</p>
                        {app.users[0].phone && <p><strong>Phone:</strong> {app.users[0].phone}</p>}
                      </div>
                    )}

                    {/* Provider Profile */}
                    {app.providerProfile && (
                      <div className="rounded-lg bg-muted p-4 space-y-2">
                        <p><strong>Zip Code:</strong> {app.providerProfile.zipCode}</p>
                        <p><strong>Categories:</strong> {app.providerProfile.serviceCategories.join(', ')}</p>
                        <p><strong>Commission:</strong> {
                          app.providerProfile.commissionType === 'PERCENT' 
                            ? `${app.providerProfile.commissionValue}%` 
                            : formatCurrency(app.providerProfile.commissionValue)
                        }</p>
                        <p><strong>Description:</strong> {app.providerProfile.shortDescription}</p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Applied: {formatDate(new Date(app.createdAt))}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => handleAction(() => rejectProviderApplicationAction(app.id), app.id)}
                        disabled={processingId === app.id}
                      >
                        {processingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleAction(() => approveProviderApplicationAction(app.id), app.id)}
                        disabled={processingId === app.id}
                      >
                        {processingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Pending Deals Tab */}
          <TabsContent value="deals" className="space-y-4">
            {pendingDeals.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending deal confirmations
                </CardContent>
              </Card>
            ) : (
              pendingDeals.map((deal) => (
                <Card key={deal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{deal.homeownerName}</CardTitle>
                        <CardDescription>{deal.category}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-purple-50">
                        <Clock className="h-3 w-3 mr-1" />
                        Awaiting Confirmation
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Provider</p>
                        <p className="font-medium">{deal.providerCompany.name}</p>
                        <p className="text-xs text-muted-foreground">{deal.providerCompany.memberId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Referrer</p>
                        <p className="font-medium">{deal.referrerCompany.name}</p>
                        <p className="text-xs text-muted-foreground">{deal.referrerCompany.memberId}</p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Reported Job Value</p>
                          <p className="text-xl font-bold">{formatCurrency(deal.reportedJobValue ?? 0)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Commission</p>
                          <p className="text-xl font-bold text-green-600">{formatCurrency(deal.calculatedCommission ?? 0)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {deal.commissionTypeSnapshot === 'PERCENT' 
                          ? `${deal.commissionValueSnapshot}% commission` 
                          : `${formatCurrency(deal.commissionValueSnapshot)} flat commission`
                        }
                      </p>
                    </div>

                    <div className="text-sm">
                      <p><strong>Address:</strong> {deal.homeownerAddress}</p>
                      <p><strong>Phone:</strong> {deal.homeownerPhone}</p>
                      <p className="mt-2"><strong>Description:</strong> {deal.projectDescription}</p>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Submitted: {formatDateTime(new Date(deal.updatedAt))}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => handleAction(() => rejectDealAction(deal.id), deal.id)}
                        disabled={processingId === deal.id}
                      >
                        {processingId === deal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleAction(() => confirmDealAction(deal.id), deal.id)}
                        disabled={processingId === deal.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingId === deal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                        Confirm &amp; Pay Commission
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Price Changes Tab */}
          <TabsContent value="prices" className="space-y-4">
            {priceChangeRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending price change requests
                </CardContent>
              </Card>
            ) : (
              priceChangeRequests.map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Edit3 className="h-5 w-5" />
                          Price Change Request
                        </CardTitle>
                        <CardDescription>
                          For lead: {req.lead.homeownerName} ({req.lead.category})
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-blue-50">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Review
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Price</p>
                          <p className="text-xl font-bold">{formatCurrency(req.currentPrice)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Requested Price</p>
                          <p className="text-xl font-bold text-blue-600">{formatCurrency(req.requestedPrice)}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">Difference</p>
                        <p className={`font-medium ${req.requestedPrice > req.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                          {req.requestedPrice > req.currentPrice ? '+' : ''}{formatCurrency(req.requestedPrice - req.currentPrice)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Reason:</p>
                      <p className="text-sm text-muted-foreground bg-muted rounded p-2 mt-1">{req.reason}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Requested by</p>
                        <p className="font-medium">{req.requestedByName}</p>
                        <p className="text-xs text-muted-foreground">{req.requestedByCompany.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Referrer</p>
                        <p className="font-medium">{req.lead.referrerCompany.name}</p>
                        <p className="text-xs text-muted-foreground">{req.lead.referrerCompany.memberId}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Admin Notes (optional)</Label>
                      <Textarea
                        placeholder="Add notes about your decision..."
                        value={adminNotes[req.id] || ''}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [req.id]: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Requested: {formatDateTime(new Date(req.createdAt))}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => handleAction(
                          () => rejectPriceChangeRequestAction(req.id, adminNotes[req.id]), 
                          req.id
                        )}
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleAction(
                          () => approvePriceChangeRequestAction(req.id, adminNotes[req.id]), 
                          req.id
                        )}
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-4">
            {withdrawalRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending withdrawal requests
                </CardContent>
              </Card>
            ) : (
              withdrawalRequests.map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5" />
                          Withdrawal Request
                        </CardTitle>
                        <CardDescription>
                          {req.company.name} ({req.company.memberId})
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-green-50">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Requested Amount</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(req.amount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Current Balance</p>
                          <p className="text-2xl font-bold">{formatCurrency(req.company.cashBalance)}</p>
                        </div>
                      </div>
                      {req.company.cashBalance < req.amount && (
                        <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">Insufficient balance!</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Requested: {formatDateTime(new Date(req.createdAt))}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => handleAction(() => rejectWithdrawalRequestAction(req.id), req.id)}
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleAction(() => approveWithdrawalRequestAction(req.id), req.id)}
                        disabled={processingId === req.id || req.company.cashBalance < req.amount}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4 mr-1" />}
                        Approve &amp; Mark Paid
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
