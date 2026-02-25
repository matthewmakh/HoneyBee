'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { ProviderProfileWithCompany, ProviderSearchFilters } from '@/lib/types';
import { Search, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

interface ProviderDirectoryProps {
  providers: ProviderProfileWithCompany[];
  categories: string[];
  currentFilters: ProviderSearchFilters;
}

export function ProviderDirectory({
  providers,
  categories,
  currentFilters,
}: ProviderDirectoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [zipCode, setZipCode] = useState(currentFilters.zipCode ?? '');

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/referrer/providers?${params.toString()}`);
  };

  const handleZipSearch = () => {
    updateFilter('zipCode', zipCode || undefined);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select
                value={currentFilters.category ?? 'all'}
                onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="ZIP Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-32"
              />
              <Button variant="outline" size="icon" onClick={handleZipSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <Select
                value={currentFilters.sortBy ?? 'newest'}
                onValueChange={(value) => updateFilter('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="commission">Commission Rate</SelectItem>
                  <SelectItem value="name">Company Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider List */}
      {providers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No providers found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{provider.company.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {provider.company.memberId}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {provider.commissionType === 'PERCENT'
                      ? `${Number(provider.commissionValue)}%`
                      : formatCurrency(Number(provider.commissionValue))}{' '}
                    commission
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {provider.shortDescription}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {provider.zipCode}
                </div>
                <div className="flex flex-wrap gap-1">
                  {provider.serviceCategories.slice(0, 3).map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                  {provider.serviceCategories.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{provider.serviceCategories.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Link href={`/dashboard/referrer/submit/${provider.companyId}`}>
                  <Button className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Referral
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
