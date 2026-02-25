'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Checkbox,
} from '@/components/ui';
import type { ProviderProfileWithCompany, CommissionType } from '@/lib/types';
import { saveProviderProfile } from './actions';

interface ProviderProfileFormProps {
  profile: ProviderProfileWithCompany | null;
  categories: string[];
}

interface FormData {
  zipCode: string;
  serviceCategories: string[];
  shortDescription: string;
  commissionType: CommissionType;
  commissionValue: number;
  isPublished: boolean;
}

export function ProviderProfileForm({ profile, categories }: ProviderProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    zipCode: profile?.zipCode ?? '',
    serviceCategories: profile?.serviceCategories ?? [],
    shortDescription: profile?.shortDescription ?? '',
    commissionType: (profile?.commissionType as CommissionType) ?? 'PERCENT',
    commissionValue: profile ? Number(profile.commissionValue) : 10,
    isPublished: profile?.isPublished ?? true,
  });

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceCategories: prev.serviceCategories.includes(category)
        ? prev.serviceCategories.filter((c) => c !== category)
        : [...prev.serviceCategories, category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const result = await saveProviderProfile({
        ...formData,
        commissionType: formData.commissionType as 'PERCENT' | 'FLAT',
      });

      if (!result.success) {
        setError(result.error ?? 'Failed to save profile');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{profile ? 'Edit Profile' : 'Create Profile'}</CardTitle>
          <CardDescription>
            {profile
              ? 'Update your provider profile information'
              : 'Set up your provider profile to start receiving leads'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md">
              Profile saved successfully!
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="zipCode">Service Area ZIP Code</Label>
            <Input
              id="zipCode"
              placeholder="12345"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              required
              disabled={isLoading}
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              Referrers can find you by searching this ZIP code area
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              placeholder="Describe your services..."
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              required
              disabled={isLoading}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.shortDescription.length}/500 characters
            </p>
          </div>

          <div className="space-y-3">
            <Label>Service Categories</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category}`}
                    checked={formData.serviceCategories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                    disabled={isLoading}
                  />
                  <label htmlFor={`cat-${category}`} className="text-sm">
                    {category}
                  </label>
                </div>
              ))}
            </div>
            {formData.serviceCategories.length === 0 && (
              <p className="text-xs text-destructive">Select at least one category</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="commissionType">Commission Type</Label>
              <Select
                value={formData.commissionType}
                onValueChange={(value) => setFormData({ ...formData, commissionType: value as CommissionType })}
                disabled={isLoading}
              >
                <SelectTrigger id="commissionType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENT">Percentage of Job Value</SelectItem>
                  <SelectItem value="FLAT">Flat Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commissionValue">
                {formData.commissionType === 'PERCENT' ? 'Commission %' : 'Flat Amount ($)'}
              </Label>
              <Input
                id="commissionValue"
                type="number"
                step={formData.commissionType === 'PERCENT' ? '1' : '0.01'}
                min="0"
                max={formData.commissionType === 'PERCENT' ? '100' : '10000'}
                value={formData.commissionValue}
                onChange={(e) => setFormData({ ...formData, commissionValue: parseFloat(e.target.value) || 0 })}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isPublished">Published</Label>
              <p className="text-xs text-muted-foreground">
                When published, referrers can find and submit leads to you
              </p>
            </div>
            <Switch
              id="isPublished"
              checked={formData.isPublished}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || formData.serviceCategories.length === 0}
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
