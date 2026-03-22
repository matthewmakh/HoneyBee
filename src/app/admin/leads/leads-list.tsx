'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/lib/types';
import type { LeadStats } from '@/lib/services/admin';
import {
  Search,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  User,
  MapPin,
  Phone,
} from 'lucide-react';

interface SerializedLead {
  id: string;
  homeownerName: string;
  homeownerPhone: string;
  homeownerAddress: string;
  category: string;
  projectDescription: string;
  status: string;
  estimatedJobValue: number | null;
  reportedJobValue: number | null;
  calculatedCommission: number | null;
  commissionTypeSnapshot: string;
  commissionValueSnapshot: number;
  createdAt: string;
  updatedAt: string;
  providerCompany: {
    id: string;
    name: string;
    memberId: string;
  };
  referrerCompany: {
    id: string;
    name: string;
    memberId: string;
  };
}

interface LeadsListProps {
  leads: SerializedLead[];
  stats: LeadStats;
}

type SortField = 'createdAt' | 'updatedAt' | 'jobValue' | 'commission' | 'status';
type SortOrder = 'asc' | 'desc';

export function LeadsList({ leads, stats }: LeadsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedLead, setSelectedLead] = useState<SerializedLead | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(leads.map(l => l.category));
    return Array.from(cats).sort();
  }, [leads]);

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(lead =>
        lead.homeownerName.toLowerCase().includes(query) ||
        lead.providerCompany.name.toLowerCase().includes(query) ||
        lead.referrerCompany.name.toLowerCase().includes(query) ||
        lead.category.toLowerCase().includes(query) ||
        lead.homeownerAddress.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(lead => lead.category === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aVal = new Date(a.updatedAt).getTime();
          bVal = new Date(b.updatedAt).getTime();
          break;
        case 'jobValue':
          aVal = a.reportedJobValue ?? a.estimatedJobValue ?? 0;
          bVal = b.reportedJobValue ?? b.estimatedJobValue ?? 0;
          break;
        case 'commission':
          aVal = a.calculatedCommission ?? 0;
          bVal = b.calculatedCommission ?? 0;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, searchQuery, statusFilter, categoryFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted"
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </TableHead>
  );

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Job Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalJobValue)}</div>
            <p className="text-xs text-muted-foreground">From completed jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCommissions)}</div>
            <p className="text-xs text-muted-foreground">To referrers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLeads > 0
                ? Math.round(((stats.byStatus.COMPLETED_CONFIRMED ?? 0) / stats.totalLeads) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.byStatus.COMPLETED_CONFIRMED ?? 0} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Submitted: <strong>{stats.byStatus.SUBMITTED ?? 0}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Accepted: <strong>{stats.byStatus.ACCEPTED ?? 0}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Awaiting Confirmation: <strong>{stats.byStatus.AWAITING_ADMIN_CONFIRMATION ?? 0}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Completed: <strong>{stats.byStatus.COMPLETED_CONFIRMED ?? 0}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Rejected: <strong>{stats.byStatus.REJECTED ?? 0}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Leads List</CardTitle>
          <CardDescription>
            {filteredLeads.length} of {leads.length} leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="AWAITING_ADMIN_CONFIRMATION">Awaiting Confirmation</SelectItem>
                <SelectItem value="COMPLETED_CONFIRMED">Completed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Homeowner</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Category</TableHead>
                  <SortHeader field="status">Status</SortHeader>
                  <SortHeader field="jobValue">Job Value</SortHeader>
                  <SortHeader field="commission">Commission</SortHeader>
                  <SortHeader field="createdAt">Created</SortHeader>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map(lead => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="font-medium">{lead.homeownerName}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {lead.homeownerAddress}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{lead.providerCompany.name}</div>
                      <div className="text-xs text-muted-foreground">{lead.providerCompany.memberId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{lead.referrerCompany.name}</div>
                      <div className="text-xs text-muted-foreground">{lead.referrerCompany.memberId}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={LEAD_STATUS_COLORS[lead.status as keyof typeof LEAD_STATUS_COLORS]}>
                        {LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.reportedJobValue
                        ? formatCurrency(lead.reportedJobValue)
                        : lead.estimatedJobValue
                        ? <span className="text-muted-foreground">{formatCurrency(lead.estimatedJobValue)}</span>
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {lead.calculatedCommission
                        ? <span className="text-green-600 font-medium">{formatCurrency(lead.calculatedCommission)}</span>
                        : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(new Date(lead.createdAt))}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-2 hover:bg-muted rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No leads found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge className={LEAD_STATUS_COLORS[selectedLead.status as keyof typeof LEAD_STATUS_COLORS]}>
                  {LEAD_STATUS_LABELS[selectedLead.status as keyof typeof LEAD_STATUS_LABELS]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created {formatDate(new Date(selectedLead.createdAt))}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Homeowner
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="font-medium">{selectedLead.homeownerName}</div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {selectedLead.homeownerPhone}
                    </div>
                    <div className="flex items-start gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      {selectedLead.homeownerAddress}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Provider
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="font-medium">{selectedLead.providerCompany.name}</div>
                      <div className="text-muted-foreground">{selectedLead.providerCompany.memberId}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Referrer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="font-medium">{selectedLead.referrerCompany.name}</div>
                      <div className="text-muted-foreground">{selectedLead.referrerCompany.memberId}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedLead.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedLead.projectDescription}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Estimated Value</div>
                      <div className="font-medium">
                        {selectedLead.estimatedJobValue
                          ? formatCurrency(selectedLead.estimatedJobValue)
                          : 'Not set'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Final Job Value</div>
                      <div className="font-medium">
                        {selectedLead.reportedJobValue
                          ? formatCurrency(selectedLead.reportedJobValue)
                          : 'Pending'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Commission</div>
                      <div className="font-medium text-green-600">
                        {selectedLead.calculatedCommission
                          ? formatCurrency(selectedLead.calculatedCommission)
                          : 'Pending'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                    Commission Rate: {selectedLead.commissionTypeSnapshot === 'PERCENT'
                      ? `${selectedLead.commissionValueSnapshot}%`
                      : formatCurrency(selectedLead.commissionValueSnapshot)} (at time of submission)
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
