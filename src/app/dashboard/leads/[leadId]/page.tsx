import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getLeadWithContacts } from '@/lib/services/leads';
import { BackButton } from '@/components/back-button';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/lib/types';
import {
  Phone,
  Mail,
  MapPin,
  User,
  Briefcase,
  Users,
  DollarSign,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ leadId: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { leadId } = await params;
  const lead = await getLeadWithContacts(leadId);
  if (!lead) notFound();

  // Only the A-Team working the lead, the Bee Team who sent it, or an admin may view it.
  const isAdmin = session.user.role === 'SUPERADMIN';
  const isProvider = lead.providerCompanyId === session.user.companyId;
  const isReferrer = lead.referrerCompanyId === session.user.companyId;
  if (!isAdmin && !isProvider && !isReferrer) {
    redirect('/dashboard');
  }

  // Gross commission: confirmed amount if completed, else estimate from the
  // accepted job value, else fall back to the snapshotted rate.
  const rateType = lead.commissionTypeSnapshot;
  const rateVal = Number(lead.commissionValueSnapshot);
  let grossCommission: number | null = null;
  if (lead.calculatedCommission != null) {
    grossCommission = Number(lead.calculatedCommission);
  } else if (lead.estimatedJobValue != null) {
    grossCommission =
      rateType === 'PERCENT'
        ? (Number(lead.estimatedJobValue) * rateVal) / 100
        : rateVal;
  }

  const provider = lead.providerCompany;
  const referrer = lead.referrerCompany;
  const providerContact = provider.users[0];
  const referrerContact = referrer.users[0];
  const providerSlug = provider.providerProfile?.publicSlug;

  // Back destination depends on which side is viewing.
  const backHref = isProvider
    ? '/dashboard/provider'
    : isReferrer
    ? '/dashboard/referrer/referrals'
    : '/admin/leads';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton href={backHref} label="Back" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {lead.homeownerName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lead.category} · Referral #{lead.id.slice(-6)} · Submitted{' '}
            {formatDateTime(lead.createdAt)}
          </p>
        </div>
        <Badge className={LEAD_STATUS_COLORS[lead.status]}>
          {LEAD_STATUS_LABELS[lead.status]}
        </Badge>
      </div>

      {/* Key parties: who's working it + who sent it */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* A-Team working the lead */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4 text-primary" />
              {isReferrer ? 'Who is working your lead' : 'A-Team (Provider)'}
            </CardTitle>
            <CardDescription>{provider.name} · {provider.memberId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {providerContact?.name && (
              <p className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {providerContact.name}
              </p>
            )}
            {providerContact?.email && (
              <a
                href={`mailto:${providerContact.email}`}
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                {providerContact.email}
              </a>
            )}
            {providerContact?.phone && (
              <a
                href={`tel:${providerContact.phone}`}
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                {providerContact.phone}
              </a>
            )}
            {provider.providerProfile && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Serves ZIP {provider.providerProfile.zipCode}
              </p>
            )}
            {providerSlug && (
              <Link
                href={`/p/${providerSlug}`}
                className="inline-flex items-center gap-1 text-primary hover:underline pt-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View A-Team company info
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Bee Team who sent the referral */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-amber-600" />
              {isProvider ? 'Who sent you this lead' : 'Bee Team (Referrer)'}
            </CardTitle>
            <CardDescription>{referrer.name} · {referrer.memberId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {referrerContact?.name && (
              <p className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {referrerContact.name}
              </p>
            )}
            {referrerContact?.email && (
              <a
                href={`mailto:${referrerContact.email}`}
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                {referrerContact.email}
              </a>
            )}
            {referrerContact?.phone && (
              <a
                href={`tel:${referrerContact.phone}`}
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                {referrerContact.phone}
              </a>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commission */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-green-600" />
            Commission
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-muted-foreground">Rate</p>
            <p className="font-medium">
              {rateType === 'PERCENT' ? `${rateVal}% of job value` : formatCurrency(rateVal)}
            </p>
          </div>
          {lead.estimatedJobValue != null && (
            <div>
              <p className="text-muted-foreground">Estimated job value</p>
              <p className="font-medium">{formatCurrency(Number(lead.estimatedJobValue))}</p>
            </div>
          )}
          {lead.reportedJobValue != null && (
            <div>
              <p className="text-muted-foreground">Final job value</p>
              <p className="font-medium">{formatCurrency(Number(lead.reportedJobValue))}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">
              {lead.status === 'COMPLETED_CONFIRMED' ? 'Commission earned' : 'Estimated commission'}
            </p>
            <p className="font-semibold text-green-700">
              {grossCommission != null ? formatCurrency(grossCommission) : 'Pending acceptance'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Homeowner / project details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Project details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="flex items-start gap-2">
            <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <a href={`tel:${lead.homeownerPhone}`} className="text-primary hover:underline">
              {lead.homeownerPhone}
            </a>
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            {lead.homeownerAddress}
          </p>
          <div>
            <p className="font-medium mb-1">Description</p>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {lead.projectDescription}
            </p>
          </div>
          {lead.photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
              {lead.photos.map((url) => {
                const isPdf = url.toLowerCase().endsWith('.pdf');
                return isPdf ? (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-md border flex items-center justify-center bg-muted"
                  >
                    <FileText className="h-8 w-8 text-primary" />
                  </a>
                ) : (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-md overflow-hidden border"
                  >
                    <Image src={url} alt="Job photo" fill className="object-cover" />
                  </a>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity / notes */}
      {lead.notes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activity &amp; notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lead.notes.map((note) => (
              <div key={note.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{note.authorCompany.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(note.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
