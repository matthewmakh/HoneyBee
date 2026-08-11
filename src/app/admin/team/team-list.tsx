'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/components/ui';
import { getInitials, formatDate } from '@/lib/utils';
import { ShieldCheck, UserPlus, Trash2, Info } from 'lucide-react';
import { createAdminAction, revokeAdminAction } from './actions';

interface AdminRow {
  id: string;
  name: string;
  email: string;
  lastActiveAt: string | null;
  createdAt: string;
  company: { id: string; name: string; memberId: string };
}

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '' };

export function TeamList({
  admins,
  currentUserId,
}: {
  admins: AdminRow[];
  currentUserId: string;
}) {
  const router = useRouter();

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [pendingRevoke, setPendingRevoke] = useState<AdminRow | null>(null);
  const [revokeError, setRevokeError] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);

  const isLastAdmin = admins.length <= 1;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    const result = await createAdminAction(form);

    if (!result.success) {
      setFormError(result.error ?? 'Failed to create admin');
      setIsSaving(false);
      return;
    }

    setForm(EMPTY_FORM);
    setAddOpen(false);
    setIsSaving(false);
    router.refresh();
  };

  const handleRevoke = async () => {
    if (!pendingRevoke) return;
    setRevokeError('');
    setIsRevoking(true);

    const result = await revokeAdminAction(pendingRevoke.id);

    if (!result.success) {
      setRevokeError(result.error ?? 'Failed to remove admin');
      setIsRevoking(false);
      return;
    }

    setPendingRevoke(null);
    setIsRevoking(false);
    router.refresh();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[hsl(var(--gold))]" />
              Super Admins
            </CardTitle>
            <CardDescription>
              {admins.length} account{admins.length !== 1 ? 's' : ''} with full access
            </CardDescription>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2 shrink-0">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Admin</span>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y border-t">
            {admins.map((admin) => {
              const isSelf = admin.id === currentUserId;

              return (
                <div
                  key={admin.id}
                  className="flex flex-wrap items-center gap-4 px-6 py-4"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(admin.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium leading-tight">{admin.name}</p>
                      {isSelf && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{admin.email}</p>
                  </div>

                  <div className="text-right text-xs text-muted-foreground">
                    <p>Added {formatDate(new Date(admin.createdAt))}</p>
                    <p>
                      {admin.lastActiveAt
                        ? `Last active ${formatDate(new Date(admin.lastActiveAt))}`
                        : 'Never signed in'}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
                    disabled={isSelf || isLastAdmin}
                    title={
                      isSelf
                        ? 'You cannot remove your own admin account'
                        : isLastAdmin
                          ? 'Cannot remove the last remaining admin'
                          : `Remove ${admin.name}`
                    }
                    onClick={() => {
                      setRevokeError('');
                      setPendingRevoke(admin);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove {admin.name}</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2.5 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Admins sign in at the same <span className="font-medium text-foreground">/login</span>{' '}
          page as everyone else and are routed straight to this panel. They join the platform
          company, so they never appear in the member directory.
        </p>
      </div>

      {/* Add admin */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setFormError(''); }}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Add an admin</DialogTitle>
              <DialogDescription>
                This account gets full platform access immediately, including payouts and
                company records.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {formError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-name">Full name</Label>
                <Input
                  id="admin-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@example.com"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Temporary password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={12}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  At least 12 characters. Share it with them over a secure channel and have
                  them change it after signing in.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-confirm">Confirm password</Label>
                <Input
                  id="admin-confirm"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Creating…' : 'Create admin'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm removal */}
      <Dialog
        open={pendingRevoke !== null}
        onOpenChange={(open) => { if (!open) { setPendingRevoke(null); setRevokeError(''); } }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove admin access?</DialogTitle>
            <DialogDescription>
              {pendingRevoke && (
                <>
                  <span className="font-medium text-foreground">{pendingRevoke.name}</span> (
                  {pendingRevoke.email}) will be deleted and will no longer be able to sign in.
                  This cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {revokeError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {revokeError}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingRevoke(null)}
              disabled={isRevoking}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={isRevoking}>
              {isRevoking ? 'Removing…' : 'Remove admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
