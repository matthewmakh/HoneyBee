'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { changeMyL1Manager } from './actions';
import { Loader2 } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  memberId: string;
  teamRole: string;
}

interface Props {
  managers: Option[];
  currentL1ManagerId: string | null;
}

export function ChangeManagerForm({ managers, currentL1ManagerId }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentL1ManagerId ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!selected || selected === currentL1ManagerId) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);
    const res = await changeMyL1Manager({ newL1ManagerCompanyId: selected });
    setIsSaving(false);
    if (res.success) {
      setMessage('Manager updated.');
      router.refresh();
    } else {
      setError(res.error ?? 'Failed to change manager');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="sm:w-96">
            <SelectValue placeholder="Select a new L-1 Manager" />
          </SelectTrigger>
          <SelectContent>
            {managers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name} ({m.memberId}) – {m.teamRole}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleSave}
          disabled={isSaving || !selected || selected === currentL1ManagerId}
        >
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Change Manager
        </Button>
      </div>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Your member ID stays the same. Historical referrals remain attributed to the
        manager on record at the time of each referral.
      </p>
    </div>
  );
}
