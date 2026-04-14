'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import { useUploadThing } from '@/lib/uploadthing';
import { wordCount } from '@/lib/validations';
import { savePitch } from './actions';
import { Loader2, Plus, Trash2, Upload, ExternalLink } from 'lucide-react';

interface Props {
  initial: {
    pitchPhotos: string[];
    pitchText: string;
    dos: string[];
    donts: string[];
    publicSlug: string | null;
  };
}

export function PitchForm({ initial }: Props) {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>(initial.pitchPhotos);
  const [pitchText, setPitchText] = useState(initial.pitchText);
  const [dos, setDos] = useState<string[]>(initial.dos.length ? initial.dos : ['']);
  const [donts, setDonts] = useState<string[]>(initial.donts.length ? initial.donts : ['']);
  const [slug, setSlug] = useState(initial.publicSlug);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  const { startUpload } = useUploadThing('pitchPhotos', {
    onClientUploadComplete: (res) => {
      const urls = res?.map((r) => r.ufsUrl ?? r.appUrl ?? r.url).filter(Boolean) ?? [];
      setPhotos((prev) => [...prev, ...urls].slice(0, 4));
      setIsUploading(false);
    },
    onUploadError: (err) => {
      setMessage({ type: 'error', text: `Upload failed: ${err.message}` });
      setIsUploading(false);
    },
  });

  const currentWordCount = wordCount(pitchText);
  const overLimit = currentWordCount > 200;

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const remaining = Math.max(0, 4 - photos.length);
    const slice = Array.from(files).slice(0, remaining);
    if (!slice.length) return;
    setIsUploading(true);
    await startUpload(slice);
  };

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (photos.length < 1) {
      setMessage({ type: 'error', text: 'Upload at least 1 photo.' });
      return;
    }
    if (overLimit) {
      setMessage({ type: 'error', text: '200 words maximum.' });
      return;
    }
    setIsSaving(true);
    const res = await savePitch({
      pitchPhotos: photos,
      pitchText,
      dos: dos.map((d) => d.trim()).filter(Boolean),
      donts: donts.map((d) => d.trim()).filter(Boolean),
    });
    setIsSaving(false);
    if (res.success) {
      if (res.data?.slug) setSlug(res.data.slug);
      setMessage({ type: 'success', text: 'Pitch saved and published.' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: res.error ?? 'Failed to save' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Pitch Photos (1–4)</CardTitle>
          <CardDescription>
            Upload 1–4 photos that referrers will show customers before gathering referral info.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {photos.map((url, i) => (
              <div
                key={url}
                className="relative aspect-square rounded-md overflow-hidden border"
              >
                <Image src={url} alt={`Pitch ${i + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <label className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed cursor-pointer hover:bg-muted/50">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Points (200 words max)</CardTitle>
          <CardDescription>
            Explain what you do, your strengths, and what makes you different.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={pitchText}
            onChange={(e) => setPitchText(e.target.value)}
            rows={8}
            placeholder="Tell customers why they should choose you…"
          />
          <div
            className={`text-xs ${overLimit ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}
          >
            {currentWordCount} / 200 words
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Do&apos;s &amp; Don&apos;ts</CardTitle>
          <CardDescription>
            Helpful guidelines for referrers when presenting your services.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Do&apos;s</Label>
            {dos.map((d, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={d}
                  onChange={(e) =>
                    setDos((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                  }
                  placeholder="e.g. Mention our 10-year warranty"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDos((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDos((prev) => [...prev, ''])}
            >
              <Plus className="h-4 w-4 mr-1" /> Add do
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Don&apos;ts</Label>
            {donts.map((d, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={d}
                  onChange={(e) =>
                    setDonts((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                  }
                  placeholder="e.g. Don&apos;t promise same-day service"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDonts((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDonts((prev) => [...prev, ''])}
            >
              <Plus className="h-4 w-4 mr-1" /> Add don&apos;t
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          {message && (
            <div
              className={`text-sm rounded-md px-3 py-2 ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {message.text}
            </div>
          )}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-muted-foreground">
              {slug ? (
                <a
                  href={`/p/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline"
                >
                  View public page <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span>A public page will be created on save.</span>
              )}
            </div>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save &amp; Publish
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
