import { requireClubAdmin } from '@/lib/auth';
import { getAdminOverviewStats } from '@/lib/services/admin';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Edit3,
  Wallet,
  FileCheck,
  Activity,
  Gift,
  Play,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  await requireClubAdmin();

  const stats = await getAdminOverviewStats();

  const totalPending = 
    stats.pendingApprovals.providerApplications +
    stats.pendingApprovals.pendingDeals +
    stats.pendingApprovals.priceChangeRequests +
    stats.pendingApprovals.withdrawalRequests;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Complete platform overview and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/demo">
            <Button variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              Start Demo
            </Button>
          </Link>
          {totalPending > 0 && (
            <Link href="/admin/approvals">
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                <AlertCircle className="h-4 w-4 mr-2" />
                {totalPending} Pending Approvals
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {totalPending > 0 && (
        <Card className="border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Items Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.pendingApprovals.providerApplications > 0 && (
                <Link href="/admin/approvals" className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-background border hover:bg-muted transition-colors">
                  <Briefcase className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold">{stats.pendingApprovals.providerApplications}</p>
                    <p className="text-xs text-muted-foreground">Provider Apps</p>
                  </div>
                </Link>
              )}
              {stats.pendingApprovals.pendingDeals > 0 && (
                <Link href="/admin/approvals" className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-background border hover:bg-muted transition-colors">
                  <FileCheck className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-semibold">{stats.pendingApprovals.pendingDeals}</p>
                    <p className="text-xs text-muted-foreground">Deal Confirms</p>
                  </div>
                </Link>
              )}
              {stats.pendingApprovals.priceChangeRequests > 0 && (
                <Link href="/admin/approvals" className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-background border hover:bg-muted transition-colors">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">{stats.pendingApprovals.priceChangeRequests}</p>
                    <p className="text-xs text-muted-foreground">Price Changes</p>
                  </div>
                </Link>
              )}
              {stats.pendingApprovals.withdrawalRequests > 0 && (
                <Link href="/admin/approvals" className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-background border hover:bg-muted transition-colors">
                  <Wallet className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold">{stats.pendingApprovals.withdrawalRequests}</p>
                    <p className="text-xs text-muted-foreground">Withdrawals</p>
                  </div>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Overview
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalPlatformProfit)}</div>
              <p className="text-xs text-muted-foreground">10% of all commissions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalCommissionsPaid)}</div>
              <p className="text-xs text-muted-foreground">Paid to referrers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Paid Out</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalCashPaidOut)}</div>
              <p className="text-xs text-muted-foreground">50% cash split</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Benefits Credited</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalBenefitsCredits)}</div>
              <p className="text-xs text-muted-foreground">40% benefits split</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User & Company Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Companies
            </CardTitle>
            <CardDescription>Platform company overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.activeCompanies}</div>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.suspendedCompanies}</div>
                <p className="text-xs text-muted-foreground">Suspended</p>
              </div>
            </div>
            <div className="flex gap-4 justify-center text-sm">
              <div className="flex items-center gap-1">
                <Badge variant="outline">{stats.providersCount}</Badge>
                <span className="text-muted-foreground">Providers</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline">{stats.referrersCount}</Badge>
                <span className="text-muted-foreground">Referrers</span>
              </div>
            </div>
            <Link href="/admin/accounts">
              <Button variant="outline" className="w-full">
                Manage Companies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users
            </CardTitle>
            <CardDescription>Platform user activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.activeUsersLast24h}</div>
                <p className="text-xs text-muted-foreground">Last 24h</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.activeUsersLast7d}</div>
                <p className="text-xs text-muted-foreground">Last 7d</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              User activity tracked on login
            </div>
            <Link href="/admin/accounts">
              <Button variant="outline" className="w-full">
                View All Users
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Lead Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Lead Activity
              </CardTitle>
              <CardDescription>Overview of all leads on the platform</CardDescription>
            </div>
            <Link href="/admin/leads">
              <Button variant="outline" size="sm">
                View All Leads
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingLeads}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="text-2xl font-bold text-blue-600">{stats.acceptedLeads}</div>
              <p className="text-xs text-muted-foreground">Accepted</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="text-2xl font-bold text-green-600">{stats.completedLeads}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="text-2xl font-bold text-red-600">{stats.rejectedLeads}</div>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Link href="/admin/approvals">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                <p className="font-medium">Pending Approvals</p>
                <p className="text-xs text-muted-foreground">Review all pending items</p>
                {totalPending > 0 && (
                  <Badge className="mt-2">{totalPending} pending</Badge>
                )}
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/accounts">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Building2 className="h-8 w-8 text-blue-600 mb-2" />
                <p className="font-medium">Account Management</p>
                <p className="text-xs text-muted-foreground">Companies &amp; users</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/transactions">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <p className="font-medium">Transaction Log</p>
                <p className="text-xs text-muted-foreground">All payments &amp; credits</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/leads">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Briefcase className="h-8 w-8 text-indigo-600 mb-2" />
                <p className="font-medium">All Leads</p>
                <p className="text-xs text-muted-foreground">View all jobs</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/companies">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Users className="h-8 w-8 text-orange-600 mb-2" />
                <p className="font-medium">Legacy Companies</p>
                <p className="text-xs text-muted-foreground">Old company list</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
