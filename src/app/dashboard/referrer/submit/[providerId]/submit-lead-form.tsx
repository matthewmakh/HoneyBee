'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
import { useUploadThing } from '@/lib/uploadthing';
import { X, ImageIcon, Upload, Loader2, FileText } from 'lucide-react';

interface SubmitLeadFormProps {
  providerCompanyId: string;
  categories: string[];
}

export function SubmitLeadForm({ providerCompanyId, categories }: SubmitLeadFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<{ url: string; isPdf: boolean }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);
    setError('');
    await startUpload(Array.from(files));
    // Reset input so same file can be selected again
    e.target.value = '';
  };

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
        photos: photos.map((p) => p.url),
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

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p.url !== url));
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

          {/* Photo Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Job Photos</Label>
              <span className="text-xs text-muted-foreground">{photos.length}/5 photos</span>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <div key={photo.url} className="relative group aspect-square rounded-md overflow-hidden border">
                    {photo.isPdf ? (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                    ) : (
                      <Image
                        src={photo.url}
                        alt="Job photo"
                        fill
                        className="object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.url)}
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
                <p className="text-xs text-muted-foreground mb-2">Upload photos of the job site</p>
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
                      Choose Files
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Image and pdfs</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Optional — photos help providers understand the scope of the job.
            </p>
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
