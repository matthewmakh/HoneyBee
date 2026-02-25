'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
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
} from '@/components/ui';
import { submitLead } from './actions';

interface SubmitLeadFormProps {
  providerCompanyId: string;
  categories: string[];
}

export function SubmitLeadForm({ providerCompanyId, categories }: SubmitLeadFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    homeownerName: '',
    homeownerPhone: '',
    homeownerAddress: '',
    projectDescription: '',
    category: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await submitLead({
        ...formData,
        providerCompanyId,
      });

      if (!result.success) {
        setError(result.error ?? 'Failed to submit lead');
        setIsLoading(false);
        return;
      }

      router.push('/dashboard/referrer/referrals?submitted=true');
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Homeowner Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="homeownerName">Homeowner Name</Label>
            <Input
              id="homeownerName"
              placeholder="John Smith"
              value={formData.homeownerName}
              onChange={(e) => setFormData({ ...formData, homeownerName: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeownerPhone">Phone Number</Label>
            <Input
              id="homeownerPhone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.homeownerPhone}
              onChange={(e) => setFormData({ ...formData, homeownerPhone: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeownerAddress">Address</Label>
            <Textarea
              id="homeownerAddress"
              placeholder="123 Main St, City, State 12345"
              value={formData.homeownerAddress}
              onChange={(e) => setFormData({ ...formData, homeownerAddress: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Service Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={isLoading}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDescription">Project Description</Label>
            <Textarea
              id="projectDescription"
              placeholder="Describe the project or service needed..."
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              required
              disabled={isLoading}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Referral'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
