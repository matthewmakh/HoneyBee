import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getReferrerDashboardStats, getReferrerJobHistoryStats } from '@/lib/services/leads';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight, DollarSign, Gift, Send, CheckCircle, Clock, TrendingUp, Trophy, Star, Target, Calendar, Megaphone } from 'lucide-react';

export default async function ReferrerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.company.canUseReferrerPortal && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const [stats, jobHistory] = await Promise.all([
    getReferrerDashboardStats(session.user.companyId),
    getReferrerJobHistoryStats(session.user.companyId),
  ]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Referrer Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track your referrals and earnings
          </p>
        </div>
        <Link href="/dashboard/referrer/refer" className="hidden sm:block">
          <Button className="bg-amber-400 text-slate-900 hover:bg-amber-300">
            <Megaphone className="mr-2 h-4 w-4" />
            Refer a Customer
          </Button>
        </Link>
      </div>

      {/* Balance Cards - Available */}
      <div>
        <h2 className="text-base md:text-lg font-semibold mb-3">Available Balance</h2>
        <div className="grid gap-3 md:gap-4 grid-cols-2">
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Cash Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-400">
                {formatCurrency(stats.cashBalance)}
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">Available for withdrawal</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Benefits Balance</CardTitle>
              <Gift className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-400">
                {formatCurrency(stats.benefitsBalance)}
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">Use in Benefits Marketplace</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pending Earnings - Greyed out */}
      {(stats.pendingCashEarnings > 0 || stats.pendingBenefitsEarnings > 0) && (
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Earnings
          </h2>
          <div className="grid gap-3 md:gap-4 grid-cols-2">
            <Card className="border-dashed opacity-60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  Pending Cash
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-muted-foreground">
                  {formatCurrency(stats.pendingCashEarnings)}
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Estimated from {stats.acceptedReferrals - stats.completedReferrals} active leads
                </p>
              </CardContent>
            </Card>
            <Card className="border-dashed opacity-60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  Pending Benefits
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-muted-foreground">
                  {formatCurrency(stats.pendingBenefitsEarnings)}
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Released when jobs are completed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Referral Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Referrals</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingReferrals} pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.acceptedReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.acceptedReferrals - stats.completedReferrals} in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.completedReferrals}</div>
            <p className="text-xs text-muted-foreground">Commission paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.pendingReferrals}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-amber-600" />
              Refer a Customer
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Guided wizard: pick 3 products, review the pitch, then submit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/referrer/refer">
              <Button className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300">
                Start a Referral
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">A-Team Catalog</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Browse the full provider directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/referrer/providers">
              <Button variant="outline" className="w-full">
                Browse Catalog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">My Referrals</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              View the status of your referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/referrer/referrals">
              <Button variant="outline" className="w-full">
                View Referrals
                <Clock className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Lifetime Earnings Section */}
      {jobHistory.totalJobsCompleted > 0 && (
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
            Your Earnings Milestones
          </h2>
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Lifetime Earnings</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  {formatCurrency(jobHistory.lifetimeTotalEarnings)}
                </div>
                <p className="text-xs text-muted-foreground hidden md:block">
                  {formatCurrency(jobHistory.lifetimeCashEarnings)} cash + {formatCurrency(jobHistory.lifetimeBenefitsEarnings)} benefits
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{formatCurrency(jobHistory.monthTotalEarnings)}</div>
                <p className="text-xs text-muted-foreground">
                  {jobHistory.thisMonthJobsCompleted} jobs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Best Job</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{formatCurrency(jobHistory.highestSingleJobEarning)}</div>
                <p className="text-xs text-muted-foreground">Highest earned</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Average</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{formatCurrency(jobHistory.averageJobEarning)}</div>
                <p className="text-xs text-muted-foreground">Per job</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Recent Completed Jobs */}
      {jobHistory.recentCompletedJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recent Completed Jobs
            </CardTitle>
            <CardDescription>
              Your most recent successful referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Homeowner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Job Value</TableHead>
                  <TableHead className="text-right">Your Earnings</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobHistory.recentCompletedJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.providerName}</TableCell>
                    <TableCell>{job.homeownerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(job.jobValue)}</TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium text-green-600">{formatCurrency(job.commission)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(job.cashPortion)} cash + {formatCurrency(job.benefitsPortion)} benefits
                      </div>
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
