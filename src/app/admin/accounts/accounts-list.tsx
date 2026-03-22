'use client';

import { useState, useMemo, Fragment } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
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
  Switch,
  Label,
  Separator,
} from '@/components/ui';
import { 
  Building2, 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Ban, 
  CheckCircle, 
  Shield, 
  Briefcase,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Gift,
  FileText,
  Send,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { 
  suspendCompanyAction, 
  unsuspendCompanyAction,
  toggleProviderAccessAction,
  toggleReferrerAccessAction,
} from './actions';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  lastActiveAt: Date | null;
  createdAt: Date;
}

interface ProviderProfile {
  id: string;
  zipCode: string;
  serviceCategories: string[];
  shortDescription: string;
  commissionType: string;
  commissionValue: number;
  isPublished: boolean;
}

interface Company {
  id: string;
  name: string;
  memberId: string;
  logoUrl: string | null;
  canUseReferrerPortal: boolean;
  canUseProviderPortal: boolean;
  providerApplicationPending: boolean;
  isSuspended: boolean;
  cashBalance: number;
  benefitsBalance: number;
  createdAt: Date;
  updatedAt: Date;
  users: User[];
  providerProfile: ProviderProfile | null;
  _count: {
    leadsAsProvider: number;
    leadsAsReferrer: number;
    walletTransactions: number;
  };
}

interface AccountsListProps {
  companies: Company[];
}

type SortField = 'name' | 'createdAt' | 'lastActive' | 'balance';
type FilterStatus = 'all' | 'active' | 'suspended';
type FilterType = 'all' | 'provider' | 'referrer' | 'both';

export function AccountsList({ companies }: AccountsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredAndSortedCompanies = useMemo(() => {
    let result = [...companies];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((c) => 
        c.name.toLowerCase().includes(searchLower) ||
        c.memberId.toLowerCase().includes(searchLower) ||
        c.users.some(u => 
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => 
        statusFilter === 'suspended' ? c.isSuspended : !c.isSuspended
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((c) => {
        if (typeFilter === 'both') return c.canUseProviderPortal && c.canUseReferrerPortal;
        if (typeFilter === 'provider') return c.canUseProviderPortal;
        if (typeFilter === 'referrer') return c.canUseReferrerPortal;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'lastActive': {
          const aLastActive = a.users[0]?.lastActiveAt ? new Date(a.users[0].lastActiveAt).getTime() : 0;
          const bLastActive = b.users[0]?.lastActiveAt ? new Date(b.users[0].lastActiveAt).getTime() : 0;
          comparison = aLastActive - bLastActive;
          break;
        }
        case 'balance':
          comparison = (a.cashBalance + a.benefitsBalance) - (b.cashBalance + b.benefitsBalance);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [companies, search, statusFilter, typeFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleRowExpand = (companyId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSuspend = async (company: Company) => {
    setIsProcessing(true);
    if (company.isSuspended) {
      await unsuspendCompanyAction(company.id);
    } else {
      await suspendCompanyAction(company.id);
    }
    setIsProcessing(false);
    setIsDetailOpen(false);
  };

  const handleToggleProviderAccess = async (company: Company, enable: boolean) => {
    setIsProcessing(true);
    await toggleProviderAccessAction(company.id, enable);
    setIsProcessing(false);
  };

  const handleToggleReferrerAccess = async (company: Company, enable: boolean) => {
    setIsProcessing(true);
    await toggleReferrerAccessAction(company.id, enable);
    setIsProcessing(false);
  };

  const getCompanyType = (company: Company): string => {
    if (company.canUseProviderPortal && company.canUseReferrerPortal) return 'Both';
    if (company.canUseProviderPortal) return 'Provider';
    if (company.canUseReferrerPortal) return 'Referrer';
    return 'None';
  };

  const getLastActiveUser = (company: Company) => {
    const sortedUsers = [...company.users].sort((a, b) => {
      const aTime = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
      const bTime = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
      return bTime - aTime;
    });
    return sortedUsers[0];
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 inline-flex">
      {sortField === field ? (
        sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      )}
    </span>
  );

  // Stats
  const stats = useMemo(() => ({
    total: companies.length,
    active: companies.filter(c => !c.isSuspended).length,
    suspended: companies.filter(c => c.isSuspended).length,
    providers: companies.filter(c => c.canUseProviderPortal).length,
    referrers: companies.filter(c => c.canUseReferrerPortal).length,
  }), [companies]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Companies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
            <p className="text-xs text-muted-foreground">Suspended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.providers}</div>
            <p className="text-xs text-muted-foreground">Providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.referrers}</div>
            <p className="text-xs text-muted-foreground">Referrers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, member ID, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="provider">Providers</SelectItem>
                <SelectItem value="referrer">Referrers</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>
                  <button onClick={() => toggleSort('name')} className="flex items-center font-semibold">
                    Company <SortIcon field="name" />
                  </button>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <button onClick={() => toggleSort('balance')} className="flex items-center font-semibold">
                    Balance <SortIcon field="balance" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => toggleSort('lastActive')} className="flex items-center font-semibold">
                    Last Active <SortIcon field="lastActive" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => toggleSort('createdAt')} className="flex items-center font-semibold">
                    Created <SortIcon field="createdAt" />
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCompanies.map((company) => {
                const lastActiveUser = getLastActiveUser(company);
                const isExpanded = expandedRows.has(company.id);
                
                return (
                  <Fragment key={company.id}>
                    <TableRow className={company.isSuspended ? 'bg-red-50/50 dark:bg-red-950/20' : ''}>
                      <TableCell>
                        <button onClick={() => toggleRowExpand(company.id)} className="p-1">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-xs text-muted-foreground">{company.memberId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {company.canUseProviderPortal && (
                            <Badge variant="outline" className="text-xs">Provider</Badge>
                          )}
                          {company.canUseReferrerPortal && (
                            <Badge variant="outline" className="text-xs">Referrer</Badge>
                          )}
                          {company.providerApplicationPending && (
                            <Badge className="text-xs bg-yellow-500">Pending</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {company.isSuspended ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge className="bg-green-600">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            {formatCurrency(company.cashBalance)}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Gift className="h-3 w-3" />
                            {formatCurrency(company.benefitsBalance)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lastActiveUser?.lastActiveAt ? (
                          <div className="text-sm">
                            <div>{formatRelativeTime(new Date(lastActiveUser.lastActiveAt))}</div>
                            <div className="text-xs text-muted-foreground">{lastActiveUser.name}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(new Date(company.createdAt))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsDetailOpen(true);
                          }}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row - Users */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/50 p-4">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span className="font-medium">Users ({company.users.length})</span>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                              {company.users.map((user) => (
                                <div key={user.id} className="rounded-lg border p-3 bg-background">
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                  </div>
                                  {user.phone && (
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {user.phone}
                                    </div>
                                  )}
                                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Last active: {user.lastActiveAt ? formatRelativeTime(new Date(user.lastActiveAt)) : 'Never'}
                                  </div>
                                  {user.role === 'SUPERADMIN' && (
                                    <Badge variant="outline" className="mt-2">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            {/* Activity Summary */}
                            <div className="flex gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span>{company._count.leadsAsProvider} leads as provider</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Send className="h-4 w-4 text-muted-foreground" />
                                <span>{company._count.leadsAsReferrer} referrals sent</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>{company._count.walletTransactions} transactions</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
              
              {filteredAndSortedCompanies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No companies found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Company Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCompany && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedCompany.name}
                </DialogTitle>
                <DialogDescription>
                  Member ID: {selectedCompany.memberId}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Status */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedCompany.isSuspended ? (
                            <>
                              <Ban className="h-5 w-5 text-red-600" />
                              <span className="font-medium text-red-600">Suspended</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-medium text-green-600">Active</span>
                            </>
                          )}
                        </div>
                        <Button
                          variant={selectedCompany.isSuspended ? 'default' : 'destructive'}
                          size="sm"
                          onClick={() => handleSuspend(selectedCompany)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : selectedCompany.isSuspended ? (
                            'Unsuspend Account'
                          ) : (
                            'Suspend Account'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Balances */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Cash Balance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(selectedCompany.cashBalance)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-1">
                          <Gift className="h-4 w-4" />
                          Benefits Balance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(selectedCompany.benefitsBalance)}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Activity Stats */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{selectedCompany._count.leadsAsProvider}</div>
                        <p className="text-xs text-muted-foreground">Leads as Provider</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{selectedCompany._count.leadsAsReferrer}</div>
                        <p className="text-xs text-muted-foreground">Referrals Sent</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{selectedCompany._count.walletTransactions}</div>
                        <p className="text-xs text-muted-foreground">Transactions</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Provider Profile */}
                  {selectedCompany.providerProfile && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Provider Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Zip Code</span>
                          <span>{selectedCompany.providerProfile.zipCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Categories</span>
                          <span>{selectedCompany.providerProfile.serviceCategories.join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Commission</span>
                          <span>
                            {selectedCompany.providerProfile.commissionType === 'PERCENT' 
                              ? `${selectedCompany.providerProfile.commissionValue}%` 
                              : formatCurrency(selectedCompany.providerProfile.commissionValue)
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Published</span>
                          <span>{selectedCompany.providerProfile.isPublished ? 'Yes' : 'No'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Dates */}
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created: {formatDate(new Date(selectedCompany.createdAt))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                  {selectedCompany.users.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {user.name}
                              {user.role === 'SUPERADMIN' && (
                                <Badge variant="outline">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 space-y-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {user.phone}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last active: {user.lastActiveAt ? formatRelativeTime(new Date(user.lastActiveAt)) : 'Never'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Joined: {formatDate(new Date(user.createdAt))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Portal Access</CardTitle>
                      <CardDescription>Control which portals this company can access</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Referrer Portal</Label>
                          <p className="text-xs text-muted-foreground">Can submit referrals to providers</p>
                        </div>
                        <Switch
                          checked={selectedCompany.canUseReferrerPortal}
                          onCheckedChange={(checked) => handleToggleReferrerAccess(selectedCompany, checked)}
                          disabled={isProcessing}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Provider Portal</Label>
                          <p className="text-xs text-muted-foreground">Can receive leads and complete jobs</p>
                        </div>
                        <Switch
                          checked={selectedCompany.canUseProviderPortal}
                          onCheckedChange={(checked) => handleToggleProviderAccess(selectedCompany, checked)}
                          disabled={isProcessing}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
