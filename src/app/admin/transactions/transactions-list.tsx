'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
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
} from '@/components/ui';
import { 
  Search, 
  DollarSign, 
  Gift, 
  Building2,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Lead {
  id: string;
  homeownerName: string;
  category: string;
  status: string;
  providerCompany: { id: string; name: string };
  referrerCompany: { id: string; name: string };
}

interface Company {
  id: string;
  name: string;
  memberId: string;
}

interface Transaction {
  id: string;
  companyId: string | null;
  leadId: string;
  type: string;
  amount: number;
  createdAt: Date;
  company: Company | null;
  lead: Lead;
}

interface TransactionsListProps {
  transactions: Transaction[];
  totalCount: number;
}

type SortField = 'createdAt' | 'amount' | 'type';
type FilterType = 'all' | 'CASH' | 'BENEFITS' | 'PLATFORM_PROFIT';

export function TransactionsList({ transactions, totalCount }: TransactionsListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((tx) => 
        tx.company?.name.toLowerCase().includes(searchLower) ||
        tx.company?.memberId.toLowerCase().includes(searchLower) ||
        tx.lead.homeownerName.toLowerCase().includes(searchLower) ||
        tx.lead.category.toLowerCase().includes(searchLower) ||
        tx.lead.providerCompany.name.toLowerCase().includes(searchLower) ||
        tx.lead.referrerCompany.name.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((tx) => tx.type === typeFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [transactions, search, typeFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CASH':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'BENEFITS':
        return <Gift className="h-4 w-4 text-purple-600" />;
      case 'PLATFORM_PROFIT':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'CASH':
        return <Badge className="bg-green-600">Cash</Badge>;
      case 'BENEFITS':
        return <Badge className="bg-purple-600">Benefits</Badge>;
      case 'PLATFORM_PROFIT':
        return <Badge className="bg-blue-600">Platform</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
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
  const stats = useMemo(() => {
    const cashTotal = transactions.filter(t => t.type === 'CASH').reduce((sum, t) => sum + t.amount, 0);
    const benefitsTotal = transactions.filter(t => t.type === 'BENEFITS').reduce((sum, t) => sum + t.amount, 0);
    const platformTotal = transactions.filter(t => t.type === 'PLATFORM_PROFIT').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      total: transactions.length,
      cashTotal,
      benefitsTotal,
      platformTotal,
      grandTotal: cashTotal + benefitsTotal + platformTotal,
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.cashTotal)}</div>
            <p className="text-xs text-muted-foreground">Cash Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.benefitsTotal)}</div>
            <p className="text-xs text-muted-foreground">Benefits Credited</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.platformTotal)}</div>
            <p className="text-xs text-muted-foreground">Platform Profit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(stats.grandTotal)}</div>
            <p className="text-xs text-muted-foreground">Total Volume</p>
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
                placeholder="Search by company, lead, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CASH">Cash Only</SelectItem>
                <SelectItem value="BENEFITS">Benefits Only</SelectItem>
                <SelectItem value="PLATFORM_PROFIT">Platform Profit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button onClick={() => toggleSort('createdAt')} className="flex items-center font-semibold">
                    Date <SortIcon field="createdAt" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => toggleSort('type')} className="flex items-center font-semibold">
                    Type <SortIcon field="type" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => toggleSort('amount')} className="flex items-center font-semibold">
                    Amount <SortIcon field="amount" />
                  </button>
                </TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Lead Details</TableHead>
                <TableHead>Provider → Referrer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm">
                    {formatDateTime(new Date(tx.createdAt))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(tx.type)}
                      {getTypeBadge(tx.type)}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell>
                    {tx.company ? (
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {tx.company.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{tx.company.memberId}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Platform</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tx.lead.homeownerName}</div>
                      <div className="text-xs text-muted-foreground">{tx.lead.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{tx.lead.providerCompany.name}</span>
                      <span className="text-muted-foreground"> → </span>
                      <span>{tx.lead.referrerCompany.name}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredAndSortedTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transactions found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredAndSortedTransactions.length} of {totalCount} transactions
      </div>
    </div>
  );
}
