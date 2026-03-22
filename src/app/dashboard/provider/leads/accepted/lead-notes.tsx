'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Button,
  Textarea,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import { useUploadThing } from '@/lib/uploadthing';
import {
  MessageSquare,
  Loader2,
  X,
  FileText,
  Send,
  ImageIcon,
} from 'lucide-react';
import { addLeadNoteAction } from './actions';
import type { LeadNoteWithAuthor } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface LeadNotesProps {
  leadId: string;
  initialNotes: LeadNoteWithAuthor[];
}

export function LeadNotes({ leadId, initialNotes }: LeadNotesProps) {
  const [notes, setNotes] = useState<LeadNoteWithAuthor[]>(initialNotes);
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<{ url: string; isPdf: boolean }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
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
      setError(`Upload failed: ${err.message}`);
      setIsUploading(false);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);
    setError('');
    await startUpload(Array.from(files));
    e.target.value = '';
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p.url !== url));
  };

  const handleSubmit = async () => {
    if (!content.trim() && photos.length === 0) {
      setError('Please add a note or upload photos');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await addLeadNoteAction(
      leadId,
      content,
      photos.map((p) => p.url)
    );

    if (result.success && result.data) {
      setNotes((prev) => [result.data!, ...prev]);
      setContent('');
      setPhotos([]);
    } else {
      setError(result.error ?? 'Failed to add note');
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Notes {notes.length > 0 && `(${notes.length})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Lead Notes & Updates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Note Form */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Textarea
                placeholder="Add a status update, note, or comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo) => (
                    <div
                      key={photo.url}
                      className="relative group h-16 w-16 rounded-md overflow-hidden border"
                    >
                      {photo.isPdf ? (
                        <div className="h-full w-full flex items-center justify-center bg-muted">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                      ) : (
                        <Image
                          src={photo.url}
                          alt="Note attachment"
                          fill
                          className="object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.url)}
                        className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
                    variant="outline"
                    size="sm"
                    disabled={isUploading || photos.length >= 5}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add Photos
                      </>
                    )}
                  </Button>
                  {photos.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {photos.length}/5 photos
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isUploading || (!content.trim() && photos.length === 0)}
                  size="sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Note
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes List */}
          {notes.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notes yet. Add the first update!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{note.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {note.authorCompany.name} • {formatDate(note.createdAt)}
                        </p>
                      </div>
                    </div>
                    {note.content && (
                      <p className="text-sm whitespace-pre-wrap mb-3">{note.content}</p>
                    )}
                    {note.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {note.photos.map((url, idx) => {
                          const isPdf = url.toLowerCase().endsWith('.pdf');
                          return (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative h-20 w-20 rounded-md overflow-hidden border hover:opacity-80 transition-opacity"
                            >
                              {isPdf ? (
                                <div className="h-full w-full flex items-center justify-center bg-muted">
                                  <FileText className="h-8 w-8 text-primary" />
                                </div>
                              ) : (
                                <Image
                                  src={url}
                                  alt={`Attachment ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
