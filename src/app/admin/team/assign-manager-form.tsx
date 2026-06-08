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
import { Loader2 } from 'lucide-react';
import { assignManagerAction } from './actions';

interface ManagerOption {
  id: string;
  name: string;
  memberId: string;
  teamRole: string;
}

export function AssignManagerForm({
  memberCompanyId,
  managers,
}: {
  memberCompanyId: string;
  managers: ManagerOption[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async () => {
    if (!selected) return;
    setIsSaving(true);
    setError(null);
    const res = await assignManagerAction(memberCompanyId, selected);
    setIsSaving(false);
    if (res.success) {
      router.refresh();
    } else {
      setError(res.error ?? 'Failed to assign manager');
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-56 h-9">
            <SelectValue placeholder="Assign a manager…" />
          </SelectTrigger>
          <SelectContent>
            {managers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name} ({m.memberId}) – {m.teamRole}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={handleAssign} disabled={!selected || isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
          Assign
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
