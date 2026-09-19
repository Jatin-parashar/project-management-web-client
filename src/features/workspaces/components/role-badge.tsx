import { Badge } from '@/components/ui/badge';
import type { Role } from '@/types/api';

const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  MEMBER: 'Member',
  GUEST: 'Guest',
};

const ROLE_VARIANTS: Record<Role, 'default' | 'secondary' | 'outline'> = {
  OWNER: 'default',
  ADMIN: 'secondary',
  MANAGER: 'secondary',
  MEMBER: 'outline',
  GUEST: 'outline',
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={ROLE_VARIANTS[role]}>{ROLE_LABELS[role]}</Badge>;
}
