import type { TeamNode, TeamRole } from '@/lib/types';
import { TEAM_ROLE_LABELS } from '@/lib/types';
import { Avatar, AvatarFallback, Badge } from '@/components/ui';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

/** Role → accent so the hierarchy reads at a glance. */
const ROLE_ACCENT: Record<TeamRole, { ring: string; chip: string }> = {
  CLUB_ADMIN: { ring: 'ring-[hsl(var(--gold))]', chip: 'bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold-foreground))]' },
  L3_MANAGER: { ring: 'ring-indigo-400', chip: 'bg-indigo-100 text-indigo-800' },
  L2_MANAGER: { ring: 'ring-sky-400', chip: 'bg-sky-100 text-sky-800' },
  L1_MANAGER: { ring: 'ring-emerald-400', chip: 'bg-emerald-100 text-emerald-800' },
  MEMBER: { ring: 'ring-border', chip: 'bg-muted text-muted-foreground' },
  PROVIDER: { ring: 'ring-amber-400', chip: 'bg-amber-100 text-amber-800' },
};

function countTeam(node: TeamNode): number {
  return node.directDownline.reduce((sum, child) => sum + 1 + countTeam(child), 0);
}

function NodeCard({ node, isRoot }: { node: TeamNode; isRoot: boolean }) {
  const accent = ROLE_ACCENT[node.teamRole];
  const teamSize = countTeam(node);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 shadow-card',
        isRoot && 'border-[hsl(var(--gold))]/50 bg-[hsl(var(--gold))]/5'
      )}
    >
      <Avatar className={cn('h-9 w-9 ring-2 shrink-0', accent.ring)}>
        <AvatarFallback className="text-xs font-bold">
          {getInitials(node.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold leading-tight">{node.name}</p>
          {isRoot && (
            <Badge className="bg-[hsl(var(--gold))] text-[hsl(var(--gold-foreground))] hover:bg-[hsl(var(--gold))] text-[10px] px-1.5">
              You
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', accent.chip)}>
            {TEAM_ROLE_LABELS[node.teamRole]}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{node.memberId}</span>
          {teamSize > 0 && (
            <span className="text-[10px] text-muted-foreground">
              · team of {teamSize}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Branch({ node, isRoot = false }: { node: TeamNode; isRoot?: boolean }) {
  return (
    <div>
      <NodeCard node={node} isRoot={isRoot} />
      {node.directDownline.length > 0 && (
        <div className="ml-5 mt-2 space-y-2 border-l-2 border-[hsl(var(--gold))]/30 pl-5">
          {node.directDownline.map((child) => (
            <div key={child.id} className="relative">
              {/* Elbow connector from the vertical rail to this card */}
              <span
                aria-hidden
                className="absolute -left-5 top-6 h-0.5 w-5 bg-[hsl(var(--gold))]/30"
              />
              <Branch node={child} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The member's downline as a visual tree — avatars, role accents and team
 * counts hanging off gold connector rails. Server-rendered; scrolls
 * horizontally when a deep team outgrows the card.
 */
export function TeamTreeVisual({ root }: { root: TeamNode }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-max">
        <Branch node={root} isRoot />
      </div>
    </div>
  );
}
