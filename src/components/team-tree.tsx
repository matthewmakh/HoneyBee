import type { TeamNode } from '@/lib/types';
import { TEAM_ROLE_LABELS } from '@/lib/types';
import { Badge } from '@/components/ui';
import { Mail, Phone } from 'lucide-react';

interface Props {
  node: TeamNode;
  depth?: number;
  /** Show mailto/tel contact links for each member. */
  showContact?: boolean;
}

export function TeamTree({ node, depth = 0, showContact = false }: Props) {
  return (
    <div
      className="text-sm"
      style={{ marginLeft: depth === 0 ? 0 : 16 }}
    >
      <div className="flex items-center gap-2 py-1 flex-wrap">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="font-medium">{node.name}</span>
          <span className="text-xs text-muted-foreground">({node.memberId})</span>
        </div>
        {showContact && (node.email || node.phone) && (
          <div className="flex items-center gap-2">
            {node.email && (
              <a
                href={`mailto:${node.email}`}
                title={`Email ${node.contactName ?? node.name}`}
                className="text-muted-foreground hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            )}
            {node.phone && (
              <a
                href={`tel:${node.phone}`}
                title={`Call ${node.contactName ?? node.name}`}
                className="text-muted-foreground hover:text-primary"
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
        <Badge variant="outline" className="text-xs">
          {TEAM_ROLE_LABELS[node.teamRole]}
        </Badge>
      </div>
      {node.directDownline.length > 0 && (
        <div className="border-l-2 pl-3 ml-2">
          {node.directDownline.map((child) => (
            <TeamTree key={child.id} node={child} depth={depth + 1} showContact={showContact} />
          ))}
        </div>
      )}
    </div>
  );
}
