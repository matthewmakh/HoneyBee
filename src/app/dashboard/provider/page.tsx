import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getProviderDashboardStats, getProviderJobHistoryStats } from '@/lib/services/leads';
import { getProviderProfile } from '@/lib/services/providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight, Inbox, CheckCircle2, Clock, Settings, Check, DollarSign, TrendingUp, Trophy, Target, Calendar, Users } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function ProviderDashboardPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.company.canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const showSavedMessage = params.saved === 'true';

  const [stats, profile, jobHistory] = await Promise.all([
    getProviderDashboardStats(session.user.companyId),
    getProviderProfile(session.user.companyId),
    getProviderJobHistoryStats(session.user.companyId),
  ]);

  const needsProfile = !profile;

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showSavedMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600" />
          <span className="font-medium">Profile saved successfully!</span>
        </div>
      )}

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

      {/* Business Performance Section */}
      {jobHistory.totalJobsCompleted > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Business Performance
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lifetime Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {formatCurrency(jobHistory.lifetimeJobValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {jobHistory.totalJobsCompleted} jobs completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(jobHistory.thisMonthJobValue)}</div>
                <p className="text-xs text-muted-foreground">
                  {jobHistory.thisMonthJobsCompleted} jobs this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Job</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(jobHistory.highestJobValue)}</div>
                <p className="text-xs text-muted-foreground">Highest job value</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Job</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(jobHistory.averageJobValue)}</div>
                <p className="text-xs text-muted-foreground">Per completed job</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Commission Paid Stats */}
      {jobHistory.lifetimeCommissionPaid > 0 && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Referral Commissions Paid
            </CardTitle>
            <CardDescription>
              Supporting your referral partners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-3xl font-bold text-green-700">{formatCurrency(jobHistory.lifetimeCommissionPaid)}</div>
                <p className="text-sm text-muted-foreground">Total commissions paid to referrers</p>
              </div>
              <div>
                <div className="text-3xl font-bold">{formatCurrency(jobHistory.thisMonthCommissionPaid)}</div>
                <p className="text-sm text-muted-foreground">Commissions this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Completed Jobs */}
      {jobHistory.recentCompletedJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Recent Completed Jobs
            </CardTitle>
            <CardDescription>
              Your recently completed referral jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referred By</TableHead>
                  <TableHead>Homeowner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Job Value</TableHead>
                  <TableHead className="text-right">Commission Paid</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobHistory.recentCompletedJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.referrerName}</TableCell>
                    <TableCell>{job.homeownerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(job.jobValue)}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(job.commissionPaid)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(job.completedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
