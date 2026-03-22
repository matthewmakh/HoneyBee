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
import { formatCurrency, getInitials, cn } from '@/lib/utils';
import type { ProviderProfileWithCompany, ProviderSearchFilters } from '@/lib/types';
import { 
  Search, 
  MapPin, 
  Send, 
  Star, 
  Trophy, 
  Briefcase, 
  Percent, 
  DollarSign,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

interface ProviderDirectoryProps {
  providers: ProviderProfileWithCompany[];
  categories: string[];
  currentFilters: ProviderSearchFilters;
  ratingStats: Record<string, { averageRating: number; reviewCount: number }>;
  jobsCompleted: Record<string, number>;
}

export function ProviderDirectory({
  providers,
  categories,
  currentFilters,
  ratingStats,
  jobsCompleted,
}: ProviderDirectoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [zipCode, setZipCode] = useState(currentFilters.zipCode ?? '');
  const [searchQuery, setSearchQuery] = useState(currentFilters.search ?? '');

  const updateFilter = useCallback((key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/referrer/providers?${params.toString()}`);
  }, [router, searchParams]);

  const clearAllFilters = () => {
    router.push('/dashboard/referrer/providers');
    setZipCode('');
    setSearchQuery('');
  };

  const handleSearch = () => {
    updateFilter('search', searchQuery || undefined);
  };

  const handleZipSearch = () => {
    updateFilter('zipCode', zipCode || undefined);
  };

  // Calculate top providers (rating >= 4.5 or jobs >= 10)
  const isTopProvider = useCallback((providerId: string, companyId: string) => {
    const stats = ratingStats[providerId];
    const jobs = jobsCompleted[companyId] ?? 0;
    return (stats && stats.averageRating >= 4.5 && stats.reviewCount >= 3) || jobs >= 10;
  }, [ratingStats, jobsCompleted]);

  // Sort providers client-side for rating/jobs
  const sortedProviders = useMemo(() => {
    if (currentFilters.sortBy === 'rating') {
      return [...providers].sort((a, b) => {
        const aRating = ratingStats[a.id]?.averageRating ?? 0;
        const bRating = ratingStats[b.id]?.averageRating ?? 0;
        return bRating - aRating;
      });
    }
    if (currentFilters.sortBy === 'jobs') {
      return [...providers].sort((a, b) => {
        const aJobs = jobsCompleted[a.companyId] ?? 0;
        const bJobs = jobsCompleted[b.companyId] ?? 0;
        return bJobs - aJobs;
      });
    }
    return providers;
  }, [providers, currentFilters.sortBy, ratingStats, jobsCompleted]);

  // Check if any filters are active
  const hasActiveFilters = currentFilters.category || currentFilters.zipCode || 
    currentFilters.commissionType || currentFilters.search;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search providers by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 h-10"
          />
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => {
              setSearchQuery('');
              updateFilter('search', undefined);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button className="h-10 shrink-0" onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Compact Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Dropdown */}
        <Select
          value={currentFilters.category ?? 'all'}
          onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Category" />
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

        {/* Commission Type Dropdown */}
        <Select
          value={currentFilters.commissionType ?? 'all'}
          onValueChange={(value) => updateFilter('commissionType', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Commission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-3 w-3" /> All Types
              </span>
            </SelectItem>
            <SelectItem value="PERCENT">
              <span className="flex items-center gap-2">
                <Percent className="h-3 w-3" /> Percentage
              </span>
            </SelectItem>
            <SelectItem value="FLAT">
              <span className="flex items-center gap-2">
                <DollarSign className="h-3 w-3" /> Flat Rate
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* ZIP Code */}
        <div className="flex gap-1">
          <Input
            placeholder="ZIP"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleZipSearch()}
            className="w-20 h-9"
          />
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={handleZipSearch}>
            <MapPin className="h-4 w-4" />
          </Button>
        </div>

        {/* Sort By */}
        <Select
          value={currentFilters.sortBy ?? 'newest'}
          onValueChange={(value) => updateFilter('sortBy', value)}
        >
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="commission">
              <span className="flex items-center gap-2">
                <DollarSign className="h-3 w-3" /> Highest Commission
              </span>
            </SelectItem>
            <SelectItem value="rating">
              <span className="flex items-center gap-2">
                <Star className="h-3 w-3" /> Top Rated
              </span>
            </SelectItem>
            <SelectItem value="jobs">
              <span className="flex items-center gap-2">
                <Briefcase className="h-3 w-3" /> Most Jobs
              </span>
            </SelectItem>
            <SelectItem value="name">A–Z</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={clearAllFilters}>
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      {sortedProviders.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {sortedProviders.length} provider{sortedProviders.length !== 1 ? 's' : ''} found
          {currentFilters.category ? ` in ${currentFilters.category}` : ''}
          {currentFilters.search ? ` matching "${currentFilters.search}"` : ''}
        </p>
      )}

      {/* Provider Grid */}
      {sortedProviders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No providers found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different category or ZIP code.</p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" className="mt-4" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProviders.map((provider) => {
            const stats = ratingStats[provider.id];
            const jobs = jobsCompleted[provider.companyId] ?? 0;
            const isTop = isTopProvider(provider.id, provider.companyId);

            return (
              <div
                key={provider.id}
                className={cn(
                  'group rounded-xl border bg-card overflow-hidden flex flex-col',
                  'transition-all duration-300 ease-out',
                  'hover:shadow-lg hover:-translate-y-1 hover:border-primary/20',
                  isTop && 'ring-2 ring-amber-400/50'
                )}
              >
                {/* Top Provider Badge */}
                {isTop && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 flex items-center justify-center gap-1">
                    <Trophy className="h-3 w-3" />
                    Top Provider
                  </div>
                )}

                {/* Profile Header */}
                <div className="p-5 pb-3 flex items-start gap-3">
                  <Avatar className={cn(
                    'h-14 w-14 shrink-0 ring-2 ring-background shadow-sm',
                    'transition-transform duration-300 group-hover:scale-105'
                  )}>
                    <AvatarImage src={provider.company.logoUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {getInitials(provider.company.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight truncate group-hover:text-primary transition-colors">
                      {provider.company.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {provider.company.memberId}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">{provider.zipCode}</span>
                      </div>
                      {stats && stats.reviewCount > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium">{stats.averageRating}</span>
                          <span className="text-xs text-muted-foreground">({stats.reviewCount})</span>
                        </div>
                      )}
                      {jobs > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{jobs} jobs</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="secondary"
                    className={cn(
                      'shrink-0 text-xs font-semibold border',
                      'bg-amber-50 text-amber-700 border-amber-200',
                      'transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-100'
                    )}
                  >
                    {provider.commissionType === 'PERCENT' ? (
                      <>
                        <Percent className="h-3 w-3 mr-0.5" />
                        {Number(provider.commissionValue)}%
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-3 w-3 mr-0.5" />
                        {formatCurrency(Number(provider.commissionValue))}
                      </>
                    )}
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
                    <Badge 
                      key={cat} 
                      variant="outline" 
                      className={cn(
                        'text-xs px-2 py-0 cursor-pointer',
                        'transition-colors hover:bg-primary hover:text-primary-foreground'
                      )}
                      onClick={() => updateFilter('category', cat)}
                    >
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
                    <Button 
                      className={cn(
                        'w-full transition-all duration-300',
                        'group-hover:bg-primary group-hover:shadow-md'
                      )} 
                      size="sm"
                    >
                      <Send className="mr-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      Submit Referral
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
