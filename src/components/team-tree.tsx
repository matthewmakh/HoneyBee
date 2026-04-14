import type { TeamNode } from '@/lib/types';
import { TEAM_ROLE_LABELS } from '@/lib/types';
import { Badge } from '@/components/ui';

interface Props {
  node: TeamNode;
  depth?: number;
}

export function TeamTree({ node, depth = 0 }: Props) {
  return (
    <div
      className="text-sm"
      style={{ marginLeft: depth === 0 ? 0 : 16 }}
    >
      <div className="flex items-center gap-2 py-1">
        <div className="flex-1 flex items-center gap-2">
          <span className="font-medium">{node.name}</span>
          <span className="text-xs text-muted-foreground">({node.memberId})</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {TEAM_ROLE_LABELS[node.teamRole]}
        </Badge>
      </div>
      {node.directDownline.length > 0 && (
        <div className="border-l-2 pl-3 ml-2">
          {node.directDownline.map((child) => (
            <TeamTree key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
