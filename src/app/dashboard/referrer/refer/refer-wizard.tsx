'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useUploadThing } from '@/lib/uploadthing';
import { formatCurrency, getInitials, cn } from '@/lib/utils';
import {
  Check,
  CheckCircle2,
  XCircle,
  Camera,
  Upload,
  Loader2,
  X,
  ImageIcon,
  FileText,
  ArrowLeft,
  ArrowRight,
  Megaphone,
} from 'lucide-react';
import { submitMultiReferral, type MultiReferralResult } from './actions';

export interface WizardProduct {
  companyId: string;
  name: string;
  memberId: string;
  logoUrl: string | null;
  zipCode: string;
  serviceCategories: string[];
  shortDescription: string;
  pitchText: string | null;
  photos: string[];
  dos: string[];
  donts: string[];
  commissionType: 'PERCENT' | 'FLAT';
  commissionValue: number;
}

const MAX_PRODUCTS = 3;

function commissionLabel(p: WizardProduct): string {
  return p.commissionType === 'PERCENT'
    ? `${p.commissionValue}% commission`
    : `${formatCurrency(p.commissionValue)} commission`;
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Choose products', 'Review pitch', 'Send referral'];
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const isActive = n === step;
        const isDone = n < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                isActive && 'bg-primary text-primary-foreground',
                isDone && 'bg-amber-400 text-slate-900',
                !isActive && !isDone && 'bg-muted text-muted-foreground'
              )}
            >
              {isDone ? <Check className="h-4 w-4" /> : n}
            </div>
            <span
              className={cn(
                'hidden sm:inline text-sm',
                isActive ? 'font-medium' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

export function ReferWizard({ products }: { products: WizardProduct[] }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [form, setForm] = useState({
    homeownerName: '',
    homeownerPhone: '',
    homeownerAddress: '',
    projectDescription: '',
    category: '',
  });
  const [photos, setPhotos] = useState<{ url: string; isPdf: boolean }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<MultiReferralResult | null>(null);

  const { startUpload } = useUploadThing('leadPhotos', {
    onClientUploadComplete: (res) => {
      const newFiles = res.map((f) => ({
        url: f.ufsUrl ?? f.appUrl ?? f.url,
        isPdf: f.name?.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf',
      }));
      setPhotos((prev) => [...prev, ...newFiles].slice(0, 5));
      setIsUploading(false);
    },
    onUploadError: (err) => {
      setError(`Photo upload failed: ${err.message}`);
      setIsUploading(false);
    },
  });

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.serviceCategories.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [products]);

  const selectedProducts = useMemo(
    () => selectedIds.map((id) => products.find((p) => p.companyId === id)).filter(Boolean) as WizardProduct[],
    [selectedIds, products]
  );

  // Category options for the referral form come from the chosen products so the
  // value is relevant to what's actually being referred.
  const formCategoryOptions = useMemo(() => {
    const set = new Set<string>();
    selectedProducts.forEach((p) => p.serviceCategories.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [selectedProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || p.serviceCategories.includes(categoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_PRODUCTS) return prev; // cap at 3
      return [...prev, id];
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);
    setError('');
    await startUpload(Array.from(files));
    e.target.value = '';
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);
    const res = await submitMultiReferral({
      providerCompanyIds: selectedIds,
      ...form,
      photos: photos.map((p) => p.url),
    });
    setIsSubmitting(false);
    if (res.success && res.data) {
      setResult(res.data);
    } else {
      setError(res.error ?? 'Failed to submit referral');
    }
  };

  // ---- Success screen ----------------------------------------------------
  if (result) {
    const nameFor = (id: string) =>
      products.find((p) => p.companyId === id)?.name ?? 'Provider';
    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-6 w-6" />
            Referral sent!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your referral for <span className="font-medium text-foreground">{form.homeownerName}</span>{' '}
            was submitted to {result.submitted.length} A-Team
            {result.submitted.length !== 1 ? 's' : ''}.
          </p>
          <ul className="space-y-2">
            {result.submitted.map((s) => (
              <li
                key={s.leadId}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {nameFor(s.providerCompanyId)}
                </span>
                <Link
                  href={`/dashboard/leads/${s.leadId}`}
                  className="text-primary hover:underline"
                >
                  View referral
                </Link>
              </li>
            ))}
            {result.failed.map((f) => (
              <li
                key={f.providerCompanyId}
                className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3 text-sm"
              >
                <span className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-4 w-4" />
                  {nameFor(f.providerCompanyId)}
                </span>
                <span className="text-xs text-red-600">{f.error}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/dashboard/referrer/referrals">
              <Button>View My Referrals</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setSelectedIds([]);
                setForm({
                  homeownerName: '',
                  homeownerPhone: '',
                  homeownerAddress: '',
                  projectDescription: '',
                  category: '',
                });
                setPhotos([]);
                setStep(1);
              }}
            >
              Start another referral
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stepper step={step} />
        <Badge variant="outline" className="text-sm">
          {selectedIds.length}/{MAX_PRODUCTS} selected
        </Badge>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {/* ---- STEP 1: choose products ------------------------------------ */}
      {step === 1 && (
        <div className="space-y-4">
          {products.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                No A-Team products are available yet. Check back soon.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Search A-Team products by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="sm:flex-1"
                />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="sm:w-56">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {allCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.companyId);
                  const atCap = selectedIds.length >= MAX_PRODUCTS && !isSelected;
                  return (
                    <button
                      key={p.companyId}
                      type="button"
                      onClick={() => toggleSelect(p.companyId)}
                      disabled={atCap}
                      className={cn(
                        'group relative text-left rounded-xl border bg-card overflow-hidden transition-all',
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/60 shadow-md'
                          : 'hover:border-primary/40 hover:shadow-sm',
                        atCap && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {isSelected && (
                        <span className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                      {/* Product photo */}
                      <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 to-amber-100">
                        {p.photos[0] ? (
                          <Image src={p.photos[0]} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-primary/40">
                            <ImageIcon className="h-9 w-9" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 -mt-8 relative">
                        <div className="flex items-start gap-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-4 ring-card flex items-center justify-center">
                            {p.logoUrl ? (
                              <Image src={p.logoUrl} alt={p.name} width={56} height={56} className="object-cover" />
                            ) : (
                              <span className="font-bold text-primary">{getInitials(p.name)}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 mt-8">
                            <p className="font-semibold leading-tight truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.memberId}</p>
                            <p className="mt-1 text-xs font-medium text-amber-700">
                              {commissionLabel(p)}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {p.shortDescription}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.serviceCategories.slice(0, 3).map((c) => (
                            <Badge key={c} variant="secondary" className="text-xs">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedIds.length >= MAX_PRODUCTS && (
                <p className="text-xs text-muted-foreground">
                  You&apos;ve picked the maximum of {MAX_PRODUCTS} products. Deselect one to
                  swap.
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  size="lg"
                  disabled={selectedIds.length === 0}
                  onClick={() => setStep(2)}
                >
                  Review {selectedIds.length > 0 ? `${selectedIds.length} ` : ''}selected
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---- STEP 2: review pitch --------------------------------------- */}
      {step === 2 && (
        <div className="space-y-6">
          {selectedProducts.map((p) => (
            <Card key={p.companyId}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle>{p.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {p.memberId} · Serves ZIP {p.zipCode} · {commissionLabel(p)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.serviceCategories.map((c) => (
                      <Badge key={c} variant="secondary" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pictures */}
                {p.photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {p.photos.map((url, i) => (
                      <div
                        key={url}
                        className="relative aspect-[4/3] overflow-hidden rounded-lg border"
                      >
                        <Image src={url} alt={`${p.name} ${i + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    No photos uploaded yet for this product.
                  </div>
                )}

                {/* Selling points */}
                <div>
                  <h4 className="text-sm font-semibold mb-1">Selling points</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {p.pitchText || p.shortDescription}
                  </p>
                </div>

                {/* Do's & Don'ts */}
                {(p.dos.length > 0 || p.donts.length > 0) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {p.dos.length > 0 && (
                      <div className="rounded-lg border p-3">
                        <h4 className="text-sm font-semibold mb-1 inline-flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-green-600" /> Do&apos;s
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {p.dos.map((d, i) => (
                            <li key={i}>• {d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {p.donts.length > 0 && (
                      <div className="rounded-lg border p-3">
                        <h4 className="text-sm font-semibold mb-1 inline-flex items-center gap-1.5">
                          <XCircle className="h-4 w-4 text-red-600" /> Don&apos;ts
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {p.donts.map((d, i) => (
                            <li key={i}>• {d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button size="lg" onClick={() => setStep(3)}>
              Continue to referral
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ---- STEP 3: referral form -------------------------------------- */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homeowner information</CardTitle>
              <p className="text-sm text-muted-foreground">This referral will be sent to:</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {selectedProducts.map((p) => (
                  <div
                    key={p.companyId}
                    className="flex items-center gap-2 rounded-lg border bg-muted/30 p-1.5 pr-3"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-primary/10">
                      {p.photos[0] || p.logoUrl ? (
                        <Image
                          src={(p.photos[0] ?? p.logoUrl) as string}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">
                          {getInitials(p.name)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="homeownerName">Homeowner Name</Label>
                <Input
                  id="homeownerName"
                  placeholder="John Smith"
                  value={form.homeownerName}
                  onChange={(e) => setForm({ ...form, homeownerName: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeownerPhone">Phone Number</Label>
                <Input
                  id="homeownerPhone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={form.homeownerPhone}
                  onChange={(e) => setForm({ ...form, homeownerPhone: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeownerAddress">Address</Label>
                <Textarea
                  id="homeownerAddress"
                  placeholder="123 Main St, City, State 12345"
                  value={form.homeownerAddress}
                  onChange={(e) => setForm({ ...form, homeownerAddress: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Service Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formCategoryOptions.length > 0 ? formCategoryOptions : ['Other']).map(
                      (c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Describe the project or service needed..."
                  rows={4}
                  value={form.projectDescription}
                  onChange={(e) =>
                    setForm({ ...form, projectDescription: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              {/* Photos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Job Photos</Label>
                  <span className="text-xs text-muted-foreground">{photos.length}/5</span>
                </div>
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo) => (
                      <div
                        key={photo.url}
                        className="relative group aspect-square rounded-md overflow-hidden border"
                      >
                        {photo.isPdf ? (
                          <div className="h-full w-full flex items-center justify-center bg-muted">
                            <FileText className="h-8 w-8 text-primary" />
                          </div>
                        ) : (
                          <Image src={photo.url} alt="Job photo" fill className="object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setPhotos((prev) => prev.filter((x) => x.url !== photo.url))
                          }
                          className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {photos.length < 5 && (
                  <div className="rounded-md border-2 border-dashed p-4 text-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,application/pdf"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Add photos
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Optional — images or PDFs</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button size="lg" onClick={handleSubmit} disabled={isSubmitting || isUploading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Megaphone className="mr-2 h-4 w-4" />
                  Submit referral
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
