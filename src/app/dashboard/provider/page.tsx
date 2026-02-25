import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getProviderDashboardStats } from '@/lib/services/leads';
import { getProviderProfile } from '@/lib/services/providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui';
import { ArrowRight, Inbox, CheckCircle2, Clock, Settings } from 'lucide-react';

export default async function ProviderDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.company.canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const [stats, profile] = await Promise.all([
    getProviderDashboardStats(session.user.companyId),
    getProviderProfile(session.user.companyId),
  ]);

  const needsProfile = !profile;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Provider Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your leads and profile
          </p>
        </div>
        <Link href="/dashboard/provider/settings">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Profile Settings
          </Button>
        </Link>
      </div>

      {/* Profile Warning */}
      {needsProfile && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-yellow-800">Complete Your Profile</p>
              <p className="text-sm text-yellow-700">
                Set up your provider profile to start receiving leads
              </p>
            </div>
            <Link href="/dashboard/provider/settings">
              <Button>
                Set Up Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newLeadsCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting your response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acceptedLeadsCount}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Confirmation</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.awaitingConfirmationCount}</div>
            <p className="text-xs text-muted-foreground">Pending admin review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedDealsCount}</div>
            <p className="text-xs text-muted-foreground">Total confirmed deals</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Leads</CardTitle>
            <CardDescription>
              Review and respond to incoming referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/provider/leads/new">
              <Button variant="outline" className="w-full">
                View New Leads
                {stats.newLeadsCount > 0 && (
                  <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {stats.newLeadsCount}
                  </span>
                )}
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Accepted Leads</CardTitle>
            <CardDescription>
              Mark jobs as completed when done
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/provider/leads/accepted">
              <Button variant="outline" className="w-full">
                Manage Accepted Leads
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
