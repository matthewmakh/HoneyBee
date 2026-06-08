import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getProviderDashboardStats, getProviderJobHistoryStats } from '@/lib/services/leads';
import { getProviderProfile } from '@/lib/services/providers';
import { PLACEHOLDER_PROVIDER_ZIP } from '@/lib/services/companies';
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

  // A profile is auto-created when an A-Team application is approved (so the
  // provider shows up in the catalogue immediately). Treat that placeholder as
  // "needs setup" until they fill in real details.
  const needsProfile = !profile || profile.zipCode === PLACEHOLDER_PROVIDER_ZIP;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Success Message */}
      {showSavedMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600 shrink-0" />
          <span className="font-medium text-sm md:text-base">Profile saved successfully!</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Provider Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your leads and profile
          </p>
        </div>
        <Link href="/dashboard/provider/settings" className="hidden md:block">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Profile Settings
          </Button>
        </Link>
      </div>

      {/* Profile Warning */}
      {needsProfile && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium text-yellow-800">Complete Your Profile</p>
              <p className="text-sm text-yellow-700">
                Set up your provider profile to start receiving leads
              </p>
            </div>
            <Link href="/dashboard/provider/settings" className="shrink-0">
              <Button className="w-full sm:w-auto">
                Set Up Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards — each links to the matching lead list (concern: click a
          lead category to see new / working / completed leads) */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/provider/leads/new" className="block">
          <Card className="transition-colors hover:border-primary/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeadsCount}</div>
              <p className="text-xs text-muted-foreground">Just came in — respond</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/provider/leads/accepted" className="block">
          <Card className="transition-colors hover:border-primary/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Working</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.acceptedLeadsCount}</div>
              <p className="text-xs text-muted-foreground">Accepted / in progress</p>
            </CardContent>
          </Card>
        </Link>
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
        <Link href="/dashboard/provider/leads/completed" className="block">
          <Card className="transition-colors hover:border-primary/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedDealsCount}</div>
              <p className="text-xs text-muted-foreground">Sold &amp; lost history</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">New Leads</CardTitle>
            <CardDescription className="text-xs md:text-sm">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Leads You&apos;re Working</CardTitle>
            <CardDescription className="text-xs md:text-sm">
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Completed &amp; Lost</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Your sold jobs and declined leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/provider/leads/completed">
              <Button variant="outline" className="w-full">
                View History
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Business Performance Section */}
      {jobHistory.totalJobsCompleted > 0 && (
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
            Business Performance
          </h2>
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Lifetime Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {formatCurrency(jobHistory.lifetimeJobValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {jobHistory.totalJobsCompleted} jobs completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{formatCurrency(jobHistory.thisMonthJobValue)}</div>
                <p className="text-xs text-muted-foreground">
                  {jobHistory.thisMonthJobsCompleted} jobs this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Best Job</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{formatCurrency(jobHistory.highestJobValue)}</div>
                <p className="text-xs text-muted-foreground">Highest job value</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Average Job</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{formatCurrency(jobHistory.averageJobValue)}</div>
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
                  <TableHead></TableHead>
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
                    <TableCell>
                      <Link
                        href={`/dashboard/leads/${job.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        Details
                      </Link>
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
