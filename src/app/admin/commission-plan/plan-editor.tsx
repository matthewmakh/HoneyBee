'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Label,
  Switch,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { saveCommissionPlan } from './actions';
import { Loader2 } from 'lucide-react';
import type { PayoutLineType } from '@/lib/types';

interface LineInput {
  lineType: PayoutLineType;
  label: string;
  percentBps: number;
  isActive: boolean;
}

interface Props {
  initial: { name: string; lines: LineInput[] };
}

export function PlanEditor({ initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [lines, setLines] = useState<LineInput[]>(initial.lines);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  const totalBps = lines
    .filter((l) => l.isActive)
    .reduce((s, l) => s + Number(l.percentBps || 0), 0);
  const valid = totalBps === 10000;

  const updateLine = (idx: number, patch: Partial<LineInput>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const handleSave = async () => {
    setMessage(null);
    if (!valid) {
      setMessage({
        type: 'error',
        text: `Active lines must sum to 100% (currently ${(totalBps / 100).toFixed(2)}%)`,
      });
      return;
    }
    setIsSaving(true);
    const res = await saveCommissionPlan({ name, lines });
    setIsSaving(false);
    if (res.success) {
      setMessage({ type: 'success', text: 'Plan saved and activated.' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: res.error ?? 'Failed' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan details</CardTitle>
          <CardDescription>The active plan applied to all future completions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Plan name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>12 Payout lines</CardTitle>
          <CardDescription>
            Basis points (10000 = 100%). Active lines must sum to exactly 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {lines.map((l, i) => (
            <div key={l.lineType} className="flex items-center gap-3 border rounded-md p-3">
              <div className="w-56 shrink-0">
                <div className="text-sm font-medium">{l.lineType}</div>
              </div>
              <div className="flex-1">
                <Input
                  value={l.label}
                  onChange={(e) => updateLine(i, { label: e.target.value })}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  min={0}
                  max={10000}
                  value={l.percentBps}
                  onChange={(e) =>
                    updateLine(i, { percentBps: parseInt(e.target.value || '0', 10) })
                  }
                />
                <div className="text-[10px] text-muted-foreground text-right mt-0.5">
                  {(l.percentBps / 100).toFixed(2)}%
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={l.isActive}
                  onCheckedChange={(v) => updateLine(i, { isActive: Boolean(v) })}
                />
                <span className="text-xs">{l.isActive ? 'Active' : 'Off'}</span>
              </div>
            </div>
          ))}
          <div
            className={`flex justify-between items-center pt-2 font-semibold ${
              valid ? 'text-green-700' : 'text-red-700'
            }`}
          >
            <span>Active total</span>
            <span>{(totalBps / 100).toFixed(2)}%</span>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            message.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || !valid}>
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save &amp; Activate
        </Button>
      </div>
    </div>
  );
}
