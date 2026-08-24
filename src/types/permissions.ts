import { Role } from './index';

export type Permission = 
  | 'members.read' | 'members.write'
  | 'entrepreneurs.read' | 'entrepreneurs.write'
  | 'donations.read' | 'donations.write'
  | 'projects.read' | 'projects.write'
  | 'content.read' | 'content.write'
  | 'settings.read' | 'settings.write'
  | 'audit.read';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'members.read', 'members.write', 
    'entrepreneurs.read', 'entrepreneurs.write',
    'donations.read', 'donations.write',
    'projects.read', 'projects.write',
    'content.read', 'content.write',
    'settings.read', 'settings.write',
    'audit.read'
  ],
  ADMIN: [
    'members.read', 'members.write', 
    'entrepreneurs.read', 'entrepreneurs.write',
    'donations.read', 'donations.write',
    'projects.read', 'projects.write',
    'content.read', 'content.write'
  ],
  MODERATOR: [
    'members.read',
    'entrepreneurs.read', 'entrepreneurs.write'
  ],
  CONTENT_MANAGER: [
    'projects.read', 'projects.write',
    'content.read', 'content.write'
  ],
  FINANCE_MANAGER: [
    'donations.read', 'donations.write',
    'projects.read'
  ],
  TRAINER: [],
  ENTREPRENEUR: [],
  MEMBER: []
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms ? perms.includes(permission) : false;
}
