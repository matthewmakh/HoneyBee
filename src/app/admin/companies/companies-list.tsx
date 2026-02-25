'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toggleCompanyStatusAction, deleteCompanyAction } from './actions';

interface Company {
  id: string;
  name: string;
  memberId: string;
  type: 'REFERRER' | 'PROVIDER' | 'BOTH';
  isActive: boolean;
  createdAt: string;
  userCount: number;
}

interface CompaniesListProps {
  companies: Company[];
}

export function CompaniesList({ companies: initialCompanies }: CompaniesListProps) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleToggleStatus(companyId: string, currentStatus: boolean) {
    setLoading(companyId);
    const result = await toggleCompanyStatusAction(companyId, !currentStatus);

    if (result.success) {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId ? { ...c, isActive: !currentStatus } : c
        )
      );
    } else {
      alert(result.error);
    }
    setLoading(null);
  }

  async function handleDelete(companyId: string) {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    setLoading(companyId);
    const result = await deleteCompanyAction(companyId);

    if (result.success) {
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
    } else {
      alert(result.error);
    }
    setLoading(null);
  }

  if (companies.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No companies registered yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Member ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell className="font-mono text-sm">{company.memberId}</TableCell>
              <TableCell>
                <Badge variant={company.type === 'REFERRER' ? 'default' : company.type === 'BOTH' ? 'outline' : 'secondary'}>
                  {company.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={company.isActive ? 'outline' : 'destructive'}>
                  {company.isActive ? 'Active' : 'Suspended'}
                </Badge>
              </TableCell>
              <TableCell>{company.userCount}</TableCell>
              <TableCell>
                {new Date(company.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loading === company.id}
                    >
                      {loading === company.id ? 'Loading...' : 'Actions'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleToggleStatus(company.id, company.isActive)}
                    >
                      {company.isActive ? 'Suspend' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(company.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
