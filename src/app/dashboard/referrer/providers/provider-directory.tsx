'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui';
import { formatCurrency, getInitials } from '@/lib/utils';
import type { ProviderProfileWithCompany, ProviderSearchFilters } from '@/lib/types';
import { Search, MapPin, Send, Star } from 'lucide-react';
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
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Category search styled like Instagram search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Select
            value={currentFilters.category ?? 'all'}
            onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="pl-9">
              <SelectValue placeholder="Search by category (roofing, solar, dental...)" />
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
            onKeyDown={(e) => e.key === 'Enter' && handleZipSearch()}
            className="w-28"
          />
          <Button variant="outline" size="icon" onClick={handleZipSearch}>
            <MapPin className="h-4 w-4" />
          </Button>
        </div>

        <Select
          value={currentFilters.sortBy ?? 'newest'}
          onValueChange={(value) => updateFilter('sortBy', value)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="commission">Highest Commission</SelectItem>
            <SelectItem value="name">A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {providers.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {providers.length} provider{providers.length !== 1 ? 's' : ''} found
          {currentFilters.category ? ` in ${currentFilters.category}` : ''}
        </p>
      )}

      {/* Provider Grid */}
      {providers.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No providers found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different category or ZIP code.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="group rounded-xl border bg-card hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Profile Header — Instagram-style */}
              <div className="p-5 pb-3 flex items-start gap-3">
                <Avatar className="h-14 w-14 shrink-0 ring-2 ring-background shadow-sm">
                  <AvatarImage src={provider.company.logoUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {getInitials(provider.company.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight truncate">{provider.company.name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{provider.company.memberId}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">{provider.zipCode}</span>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className="shrink-0 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                >
                  <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                  {provider.commissionType === 'PERCENT'
                    ? `${Number(provider.commissionValue)}%`
                    : formatCurrency(Number(provider.commissionValue))}
                </Badge>
              </div>

              {/* Description */}
              <div className="px-5 pb-3 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {provider.shortDescription}
                </p>
              </div>

              {/* Category Tags */}
              <div className="px-5 pb-4 flex flex-wrap gap-1">
                {provider.serviceCategories.slice(0, 4).map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs px-2 py-0">
                    {cat}
                  </Badge>
                ))}
                {provider.serviceCategories.length > 4 && (
                  <Badge variant="outline" className="text-xs px-2 py-0 text-muted-foreground">
                    +{provider.serviceCategories.length - 4}
                  </Badge>
                )}
              </div>

              {/* CTA */}
              <div className="px-4 pb-4">
                <Link href={`/dashboard/referrer/submit/${provider.companyId}`} className="block">
                  <Button className="w-full" size="sm">
                    <Send className="mr-2 h-3.5 w-3.5" />
                    Submit Referral
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
