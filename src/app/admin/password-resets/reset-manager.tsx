'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { createResetLinkByEmailAction } from './actions';
import { Copy, Check, KeyRound, Loader2 } from 'lucide-react';

interface OpenRequest {
  token: string;
  createdAt: string;
  expiresAt: string;
  userName: string;
  email: string;
  companyName: string;
  memberId: string;
}

function resetUrl(token: string): string {
  // Built client-side so the link always matches whichever domain the admin is
  // on (Railway URL, honeybeeharry.com, …).
  return `${window.location.origin}/reset-password/${token}`;
}

function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(resetUrl(token));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard can be blocked — show the link in a prompt as fallback.
          window.prompt('Copy this reset link:', resetUrl(token));
        }
      }}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy link
        </>
      )}
    </Button>
  );
}

export function ResetManager({ requests }: { requests: OpenRequest[] }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState<{
    token: string;
    userName: string;
    email: string;
  } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGenerated(null);
    setIsLoading(true);
    const result = await createResetLinkByEmailAction(email);
    setIsLoading(false);
    if (!result.success || !result.data) {
      setError(result.error ?? 'Failed to create reset link');
      return;
    }
    setGenerated(result.data);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Generate a link for anyone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5 text-[hsl(var(--gold))]" />
            Generate a reset link
          </CardTitle>
          <CardDescription>
            Mint a one-time reset link for any member and send it to them yourself
            (email or text). Links work once and expire after 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="resetEmail" className="sr-only">
                Member email
              </Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="member@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Generate link
            </Button>
          </form>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {generated && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 space-y-2">
              <p className="text-sm text-green-800">
                Reset link for <span className="font-medium">{generated.userName}</span>{' '}
                ({generated.email}):
              </p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={resetUrl(generated.token)}
                  className="font-mono text-xs bg-white"
                  onFocus={(e) => e.target.select()}
                />
                <CopyLinkButton token={generated.token} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open self-serve requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Open reset requests</CardTitle>
          <CardDescription>
            Members who used &ldquo;Forgot password?&rdquo; on the sign-in page.
            Copy their link and send it to them — the request disappears once the
            link is used or expires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No open reset requests right now.
            </p>
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <div
                  key={r.token}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {r.userName}{' '}
                      <span className="text-xs text-muted-foreground font-normal">
                        · {r.companyName} ({r.memberId})
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">{r.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested {formatDateTime(new Date(r.createdAt))} · expires{' '}
                      {formatDateTime(new Date(r.expiresAt))}
                    </p>
                  </div>
                  <CopyLinkButton token={r.token} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
